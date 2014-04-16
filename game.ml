open Arrow
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
  val mutable sinks = []
  val mutable frames = 0

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
    sinks <- s::sinks

  method add_arrow cell pos =
    let a = new arrow cell pos U in
    Queue.add a arrows;
    if Queue.length arrows > 4 then
      let a_del = Queue.pop arrows in
      a_del#detach

  initializer
    for j = 0 to 7 do
      let row = div_class "row" in
      for i = 0 to 7 do
        let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
        let cell = div_class ~extraclass "cell" in
        cell##onclick <- Dom_html.handler (fun _ ->
          self#try_arrow cell (i, j);
          Js._true
        );
        cell##onmousedown <- Dom_html.handler (fun e -> Js._false);
        Dom.appendChild row cell
      done;
      Dom.appendChild dom row
    done;
    Dom.appendChild dom score_div;
    self#update_score

  method try_arrow cell pos =
    begin match self#arrow_at pos with
    | None -> self#add_arrow cell pos
    | Some arrow -> arrow#turn
    end

  method anim =
    self#every_nth_frame 100 (fun () -> self#select_spawner);
    List.iter (fun s -> s#anim self) spawners;
    List.iter (fun m -> m#anim self) mouses

  method start =
    Dom_html.window##setInterval(Js.wrap_callback (fun () ->
      frames <- frames + 1;
      self#anim
    ), 16.)

  method every_nth_frame n f =
    if frames mod n = 0 then
      f ()

  method wall_at x y dir =
    List.exists (fun w -> w#is_at x y dir) walls

  method arrow_at (x, y) =
    queue_find (fun a -> a#is_at (x, y)) arrows

  method event_at x y dir =
    let arrow_present =
    match self#arrow_at (x, y) with
    | Some d -> Some (Arrow (d#dir))
    | None -> None
    in
    let wall_present =
      let wall_front = self#wall_at x y dir in
      if wall_front || mouse_exiting (x, y) dir then
        Some Wall
      else
        None
    in
    let sink_present =
      match list_find_opt (fun s -> s#is_at x y) sinks with
      | Some p -> Some (Sink p)
      | None -> None
    in
    first_of [wall_present;arrow_present;sink_present]
end
