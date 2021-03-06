open Arrow
open Cursor
open Mouse
open Controls
open Sink
open Spawner
open Tools
open Types
open Wall

type axe_pos =
  | Axe_Neg
  | Axe_Zero
  | Axe_Pos

let axe_pos = function
  | x when x < -0.5 -> Axe_Neg
  | x when x >  0.5 -> Axe_Pos
  | _ -> Axe_Zero

let gp_event_from_state gp gp_num =
  let ax = array_findi gp.gp_axes (fun i x ->
    match axe_pos x with
    | Axe_Neg -> Some (GP_Axis (gp_num, i, GPA_Neg))
    | Axe_Pos -> Some (GP_Axis (gp_num, i, GPA_Pos))
    | Axe_Zero -> None
  ) in
  let btn =
    array_findi gp.gp_btns (fun i b ->
      if Gamepad.button_is_pressed b then
        Some (GP_Btn (gp_num, i))
      else
        None
    )
  in
  first_of [btn;ax]

let gp_state_from_gamepads (gp:'a Js.t) =
  { gp_ts = gp##timestamp
  ; gp_axes = Js.to_array (gp##axes)
  ; gp_btns = Js.to_array (gp##buttons)
  }

let gp_max = 4

(**
 * Something to track state of gamepads and notify on change.
 *)
class gamepad_watch = object(self)
  val states =
    Array.make gp_max
      { gp_ts = -1
      ; gp_axes = [||]
      ; gp_btns = [||]
      }

  val notify_funcs = Array.make gp_max None

  method reload =
    let gps = Gamepad.getGamepads () in
    for i = 0 to gp_max - 1 do
      Js.Optdef.case (Js.array_get gps i)
        (fun () -> ())
        (fun gp -> self#reload_gp gp i)
    done

  method private reload_gp gp n =
    let state = states.(n) in
    let new_state = gp_state_from_gamepads gp in
    begin if state.gp_ts <> new_state.gp_ts then
      match gp_event_from_state new_state n with
      | Some e -> self#fire e n
      | None -> ()
    end;
    states.(n) <- new_state

  method subscribe n f =
    notify_funcs.(n) <- Some f

  method subscribe_all f =
    for i = 0 to gp_max - 1 do
      self#subscribe i f
    done

  method unsubscribe n =
    notify_funcs.(n) <- None

  method fire x n =
    match notify_funcs.(n) with
    | None -> ()
    | Some f -> f x

end

let default_kbd_binding =
  [ (90, ActMove U)
  ; (83, ActMove D)
  ; (81, ActMove L)
  ; (68, ActMove R)
  ; (38, ActArrow U)
  ; (40, ActArrow D)
  ; (37, ActArrow L)
  ; (39, ActArrow R)
  ]

let default_gp_binding gp_num =
  [ (GP_Axis (gp_num, 0, GPA_Neg), ActMove L)
  ; (GP_Axis (gp_num, 0, GPA_Pos), ActMove R)
  ; (GP_Axis (gp_num, 1, GPA_Neg), ActMove U)
  ; (GP_Axis (gp_num, 1, GPA_Pos), ActMove D)
  ; (GP_Btn (gp_num, 5), ActArrow U)
  ; (GP_Btn (gp_num, 4), ActArrow R)
  ; (GP_Btn (gp_num, 0), ActArrow D)
  ; (GP_Btn (gp_num, 1), ActArrow L)
  ]

class game dom w h =
  let score_div = div_class "score" in
object(self)
  val dom = dom
  val mutable walls = []
  val mutable mouses = []
  val mutable spawners = []
  val mutable frames = 0
  val mutable interval_id = None
  val gamepad_watch = new gamepad_watch

  val board = Array.make_matrix h w None

  val score = Hashtbl.create 2

  val arrows = Hashtbl.create 2

  val cursors = Hashtbl.create 2

  val cells = init_matrix h w (fun i j ->
    let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
    div_class ~extraclass "cell"
  )

  initializer
    let container = getbyid_unsafe "container" in
    container##style##width <- js(Printf.sprintf "%dpx" (60*w));
    Hashtbl.add score P1 0;
    Hashtbl.add score P2 0;
    Hashtbl.add arrows P1 (Queue.create ());
    Hashtbl.add arrows P2 (Queue.create ());
    for j = 0 to h - 1 do
      let row = div_class "row" in
      for i = 0 to w - 1 do
        let cell = cells.(j).(i) in
        cell##onmousedown <- Dom_html.handler (fun e -> Js._false);
        Dom.appendChild row cell
      done;
      Dom.appendChild dom row
    done;
    let c1 = new cursor dom (0, 0) P1 (CD_Keyboard default_kbd_binding) in
    let c2 = new cursor dom (w-1, h-1) P2 (CD_Gamepad (default_gp_binding 0)) in
    Hashtbl.add cursors P1 c1;
    Hashtbl.add cursors P2 c2;
    c1#attach_to self;
    c2#attach_to self;
    Dom.appendChild dom score_div;
    self#update_score;
    let c = new controls dom self in
    Dom.appendChild dom (c#rebind_btn)

  method rebind player binding =
    let cursor = Hashtbl.find cursors player in
    cursor#rebind binding self

  method add_mouse ~is_cat pos dir =
    let m = new mouse is_cat dom pos dir in
    mouses <- m::mouses

  method update_score =
    let s1 = Hashtbl.find score P1 in
    let s2 = Hashtbl.find score P2 in
    let txt = Printf.sprintf "P1: %d P2: %d" s1 s2 in
    score_div##innerHTML <- js txt

  method private alter_score p f =
    let s = Hashtbl.find score p in
    Hashtbl.replace score p (f s)

  method score_mouse_for p is_cat =
    if is_cat then
      self#alter_score p (fun s -> s/2)
    else
      self#alter_score p (fun s -> s+1);
    self#update_score

  method remove_mouse m =
    mouses <- List.filter (fun m' -> m' <> m) mouses

  method add_wall pos dir =
    let w = new wall dom pos dir in
    walls <- w::walls

  method add_spawner pos dir =
    let s = new spawner dom pos dir in
    self#set pos (Some Spawner);
    spawners <- s::spawners

  method private select_spawner =
    let l = List.length spawners in
    if l > 0 then
      let n = Random.int l in
      list_iteri (fun i s ->
        if i = n then
          s#activate
        else
          s#deactivate
      ) spawners

  method add_sink pos player =
    let s = new sink dom pos player in
    self#set pos (Some (Sink s))

  method oob (x, y) =
    not (0 <= x && x < w && 0 <= y && y < h)

  method try_arrow pos dir player =
    match self#get pos with
    | Some _ -> ()
    | None -> self#add_arrow pos dir player

  method add_arrow pos dir player =
    let (i, j) = pos in
    let cell = cells.(j).(i) in
    let a = new arrow cell pos dir player in
    self#set pos (Some (Arrow a));
    let q = Hashtbl.find arrows player in
    Queue.add a q;
    if Queue.length q > 4 then
      self#remove_arrow (Queue.pop q)

  method private remove_arrow a =
    a#detach;
    self#set (a#pos) None

  method subscribe_gamepad n f =
    gamepad_watch#subscribe n f

  method subscribe_all_gamepads f =
    gamepad_watch#subscribe_all f

  method unsubscribe_gamepad n =
    gamepad_watch#unsubscribe n

  val mutable active = false

  method anim =
    self#every_nth_frame 100 (fun () -> self#select_spawner);
    gamepad_watch#reload;
    if active then begin
      List.iter (fun s -> s#anim self) spawners;
      List.iter (fun m -> m#anim self) mouses
    end

  method start =
    let iid = Dom_html.window##setInterval(Js.wrap_callback (fun () ->
      frames <- frames + 1;
      self#anim
    ), 16.) in
    assert (interval_id = None);
    interval_id <- Some iid;
    active <- true

  method continue =
    active <- true

  method stop =
    active <- false

  method every_nth_frame n f =
    if frames mod n = 0 then
      f ()

  method wall_at x y dir =
    List.exists (fun w -> w#is_at x y dir) walls

  method private get (x, y) =
    board.(y).(x)

  method private set (x, y) v =
    board.(y).(x) <- v

  method private collidable pos0 d =
    let pos = pos_dir pos0 d in
    self#oob pos ||
    match self#get pos with
    | Some (Spawner) -> true
    | Some (Arrow _) -> false
    | Some (Sink _) -> false
    | None -> false

  method mouse_act (x, y) dir =
    let bump d =
      self#wall_at x y d || self#collidable (x, y) d
    in
    let adjust d0 =
      let d1 = dir_right d0 in
      let d2 = dir_right d1 in
      let d3 = dir_right d2 in
      match () with
      | _ when (not (bump d0)) -> d0
      | _ when (not (bump d1)) -> d1
      | _ when (not (bump d2)) -> d2
      | _ when (not (bump d3)) -> d3
      | _ -> failwith "All directions bump"
    in
    match self#get (x, y) with
    | Some (Sink s) -> MA_Sink (s#player)
    | _ when bump dir -> MA_Dir (adjust dir)
    | Some (Arrow a) ->
        a#weaken;
        if a#is_dead then begin
          self#remove_arrow a;
          let q = Hashtbl.find arrows (a#player) in
          queue_delete q a
        end;
        MA_Dir (adjust (a#dir))
    | None
    | Some Spawner -> MA_Dir (adjust dir)

  method destroy =
    dom##innerHTML <- js "";
    match interval_id with
    | Some iid -> Dom_html.window##clearInterval(iid)
    | None -> ()
end
