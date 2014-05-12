open Arrow
open Cursor
open Mouse
open Sink
open Spawner
open Tools
open Types
open Wall

class game dom =
  let score_div = div_class "score" in
object(self)
  val dom = dom
  val mutable walls = []
  val mutable mouses = []
  val mutable spawners = []
  val mutable frames = 0
  val mutable interval_id = None

  val board = Array.make_matrix 8 8 None

  val score = Hashtbl.create 2

  initializer
    Hashtbl.add score P1 0;
    Hashtbl.add score P2 0

  val arrows = Queue.create ()

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

  val cells = init_matrix 8 8 (fun i j ->
    let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
    div_class ~extraclass "cell"
  )

  method oob (x, y) =
    not (0 <= x && x <= 7 && 0 <= y && y <= 7)

  method try_arrow pos dir =
    match self#get pos with
    | Some _ -> ()
    | None -> self#add_arrow pos dir

  method add_arrow pos dir =
    let (i, j) = pos in
    let cell = cells.(j).(i) in
    let a = new arrow cell pos dir in
    self#set pos (Some (Arrow a));
    Queue.add a arrows;
    if Queue.length arrows > 4 then
      begin
        let a_del = Queue.pop arrows in
        a_del#detach;
        self#set (a_del#pos) None (* TODO better: put coords in queue *)
      end

  initializer
    for j = 0 to 7 do
      let row = div_class "row" in
      for i = 0 to 7 do
        let cell = cells.(j).(i) in
        cell##onmousedown <- Dom_html.handler (fun e -> Js._false);
        Dom.appendChild row cell
      done;
      Dom.appendChild dom row
    done;
    let c = new cursor dom (0, 0) CD_Keyboard in
    c#attach_to self;
    Dom.appendChild dom score_div;
    self#update_score

  method anim =
    self#every_nth_frame 100 (fun () -> self#select_spawner);
    List.iter (fun s -> s#anim self) spawners;
    List.iter (fun m -> m#anim self) mouses

  method start =
    let iid = Dom_html.window##setInterval(Js.wrap_callback (fun () ->
      frames <- frames + 1;
      self#anim
    ), 16.) in
    assert (interval_id = None);
    interval_id <- Some iid

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
    if bump dir then
      MA_Dir (adjust dir)
    else
    match self#get (x, y) with
    | Some (Arrow a) -> MA_Dir (adjust (a#dir))
    | Some (Sink s) -> MA_Sink (s#player)
    | None
    | Some Spawner -> MA_Dir (adjust dir)

  method destroy =
    dom##innerHTML <- js "";
    match interval_id with
    | Some iid -> Dom_html.window##clearInterval(iid)
    | None -> ()
end
