open Tools
open Types

let frames_per_square = 16

let pos_dir (x, y) = function
  | U -> (x, y - 1)
  | D -> (x, y + 1)
  | L -> (x - 1, y)
  | R -> (x + 1, y)

let round_near f =
  float (int_of_float (f +. 0.5))

let round_x (x, y) =
  (round_near x, y)

let round_y (x, y) =
  (x, round_near y)

class ['game] mouse is_cat parent pos dir =
  let base =
    if is_cat then
      "cat"
    else
      "mouse"
  in
  let extraclass = dirclass base dir in
  let dom = div_class ~extraclass base in
  let (x, y) = pos in
  let fpos = (float x, float y) in
  let _ = style_pos dom fpos in
  let _ = Dom.appendChild parent dom in
object(self)

  val dom = dom

  (*
   * A mouse's position is tracked by three things:
   *
   *   - pos is the last integer coordinates
   *   - dest is the integer coordinates of destination
   *   - delta is the number of frames in the movement between these
   *
   * Movement takes frames_per_square.
   * When delta = frames_per_square, it is time to evaluate a new destination.
   *
   *)
  val mutable dest = pos_dir pos dir
  val mutable pos = pos
  val mutable delta = 0

  method update_class d =
    let extraclass = dirclass base d in
    set_class dom ~extraclass base

  method dir =
    let (x0, y0) = pos in
    let (x1, y1) = dest in
    let dx = x1-x0 in
    let dy = y1-y0 in
    match (dx, dy) with
    | (1, 0) -> R
    | (-1, 0) -> L
    | (0, 1) -> D
    | (0, -1) -> U
    | _ -> invalid_arg (Printf.sprintf "mouse#dir: delta=(%d,%d)" dx dy)

  method private reevaluate g =
    match g#mouse_act dest (self#dir) with
    | MA_Dir d ->
        begin
          self#update_class d;
          delta <- 0;
          pos <- dest;
          dest <- pos_dir pos d
        end
    | MA_Sink player ->
        self#disappear g (player)

  method private interpolate_pos =
    let (x0, y0) = pos in
    let (x1, y1) = dest in
    let fps = float frames_per_square in
    let d = float delta in
    let i a0 a1 = 
      (float a0 *. (fps -. d) +. float a1 *. d) /. fps
    in
    (i x0 x1, i y0 y1)

  method private move_straight =
    let p = self#interpolate_pos in
    style_pos dom p

  method anim (g:'game) =
    delta <- delta + 1;
    self#move_straight;
    if delta = frames_per_square then
      self#reevaluate g

  method disappear g p =
    Dom.removeChild parent dom;
    g#score_mouse_for p is_cat;
    g#remove_mouse self

end
