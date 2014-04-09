open Tools
open Types

let update_pos dir (x, y) =
  let d = 0.05 in
  match dir with
  | U -> (x, y -. d)
  | D -> (x, y +. d)
  | L -> (x -. d, y)
  | R -> (x +. d, y)

let mouse_exiting (x, y) dir =
  match dir with
  | U -> y = 0
  | D -> y = 7
  | L -> x = 0
  | R -> x = 7

let round_near f =
  float (int_of_float (f +. 0.5))

let round_x (x, y) =
  (round_near x, y)

let round_y (x, y) =
  (x, round_near y)

class ['game] mouse parent pos dir =
  let extraclass = dirclass "mouse" dir in
  let dom = div_class ~extraclass "mouse" in
  let _ = style_pos dom pos in
  let _ = Dom.appendChild parent dom in
object(self)

  val dom = dom

  val mutable pos = pos
  val mutable dir = dir

  method move npos =
    style_pos dom npos;
    pos <- npos

  method update_class =
    let extraclass = dirclass "mouse" dir in
    set_class dom ~extraclass "mouse"

  method turn_to ndir =
    dir <- ndir;
    self#update_class;
    let new_pos =
      match dir with
      | U | D -> round_x pos
      | L | R -> round_y pos
    in
    pos <- new_pos

  method turn =
    let new_dir = dir_right dir in
    self#turn_to new_dir

  method act_tile =
    let (x, y) = pos in
    let (dx, nfx) = modf (x +. 1.) in
    let (dy, nfy) = modf (y +. 1.) in
    let nx = int_of_float (nfx -. 1.) in
    let ny = int_of_float (nfy -. 1.) in
    let lo d = d < 0.5 in
    let hi d = d >= 0.5 in
    match dir with
    | U when hi dy -> Some (nx, ny + 1)
    | D when lo dy -> Some (nx, ny)
    | L when hi dx -> Some (nx + 1, ny)
    | R when lo dx -> Some (nx, ny)
    | _ -> None

  method move_straight =
    let new_pos = update_pos dir pos in
    self#move new_pos

  method anim (g:'game) =
    self#move_straight;
    begin
      match self#act_tile with
      | None -> ()
      | Some (x, y) ->
        match g#event_at x y dir with
        | Some (Arrow d) -> self#turn_to d
        | Some Wall -> self#turn
        | Some Sink -> self#disappear g
        | None -> ()
    end

  method disappear g =
    Dom.removeChild parent dom;
    g#remove_mouse self

end
