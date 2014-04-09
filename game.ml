open Mouse
open Tools
open Types
open Wall

class game dom board = object(self)
  val dom = dom
  val board = board
  val mutable walls = []
  val mutable mouses = []

  method add_mouse pos =
    let m = new mouse dom pos R in
    mouses <- m::mouses

  method add_wall pos dir =
    let w = new wall dom pos dir in
    walls <- w::walls

  method anim =
    List.iter (fun m -> m#anim self) mouses

  method start =
    Dom_html.window##setInterval(Js.wrap_callback (fun () -> self#anim), 16.)

  method wall_at x y dir =
    List.exists (fun w -> w#is_at x y dir) walls

  method event_at x y dir =
    let arrow_present =
    match board.(x).(y) with
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
    first_of [wall_present;arrow_present]
end
