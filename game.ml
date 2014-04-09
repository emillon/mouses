open Arrow
open Mouse
open Sink
open Spawner
open Tools
open Types
open Wall

let cell_setup g c i j =
  c##onclick <- Dom_html.handler (fun _ ->
    begin match g#arrow_at (i, j) with
    | None -> g#add_arrow (new arrow c (i, j) U)
    | Some arrow -> arrow#turn
    end;
    Js._true
  );
  c##onmousedown <- Dom_html.handler (fun e ->
    Js._false
  )

class game dom =
object(self)
  val dom = dom
  val mutable walls = []
  val mutable mouses = []
  val mutable spawners = []
  val mutable sinks = []
  val mutable frames = 0

  val mutable arrows = []

  method add_mouse pos dir =
    let m = new mouse dom pos dir in
    mouses <- m::mouses

  method remove_mouse m =
    mouses <- List.filter (fun m' -> m' <> m) mouses

  method add_wall pos dir =
    let w = new wall dom pos dir in
    walls <- w::walls

  method add_spawner pos dir =
    let s = new spawner dom pos dir in
    spawners <- s::spawners

  method add_sink pos =
    let s = new sink dom pos in
    sinks <- s::sinks

  method add_arrow (a:arrow) =
    arrows <- a::arrows

  initializer
    for i = 0 to 7 do
      let row = div_class "row" in
      for j = 0 to 7 do
        let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
        let cell = div_class ~extraclass "cell" in
        cell_setup self cell j i;
        Dom.appendChild row cell
      done;
      Dom.appendChild dom row
    done

  method anim =
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
    try
      let arr =
        List.find (fun a -> a#is_at (x, y)) arrows
      in
      Some arr
    with Not_found -> None

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
      if List.exists (fun s -> s#is_at x y) sinks then
        Some Sink
      else
        None
    in
    first_of [wall_present;arrow_present;sink_present]
end
