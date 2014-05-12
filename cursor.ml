open Tools
open Types

type action =
  | ActMove of direction
  | ActArrow of direction

let parse_keycode = function
  | 90 -> Some (ActMove U)
  | 83 -> Some (ActMove D)
  | 81 -> Some (ActMove L)
  | 68 -> Some (ActMove R)
  | 38 -> Some (ActArrow U)
  | 40 -> Some (ActArrow D)
  | 37 -> Some (ActArrow L)
  | 39 -> Some (ActArrow R)
  | _ -> None

let parse_gp gp =
  let btn i = Gamepad.button_is_pressed (gp.gp_btns.(i)) in
  let x = gp.gp_axes.(0) in
  let y = gp.gp_axes.(1) in
  let neutral f = abs_float f < 0.1 in
  match () with
  | _ when neutral y && x < -0.5 -> Some (ActMove L)
  | _ when neutral y && x >  0.5 -> Some (ActMove R)
  | _ when neutral x && y < -0.5 -> Some (ActMove U)
  | _ when neutral x && y >  0.5 -> Some (ActMove D)
  | _ when btn 5 -> Some (ActArrow U)
  | _ when btn 4 -> Some (ActArrow R)
  | _ when btn 0 -> Some (ActArrow D)
  | _ when btn 1 -> Some (ActArrow L)
  | _ -> None

let float_pos (x, y) =
  (float x, float y)

class ['game] cursor parent pos player cd =
  let extraclass = match player with
  | P1 -> "cursor-player1"
  | P2 -> "cursor-player2"
  in
object(self)
  val dom = div_class ~extraclass "cursor"
  val mutable pos = pos

  initializer begin
    style_pos dom (float_pos pos);
    Dom.appendChild parent dom;
  end

  method attach_to (game:'game) =
    match cd with
    | CD_Keyboard ->
      Dom_html.document##onkeydown <- Dom_html.handler (fun ev ->
        begin match parse_keycode (ev##keyCode) with
        | None -> ()
        | Some a -> self#interpret game a
        end;
        Js._true
      )
    | CD_Gamepad ->
        game#subscribe_gamepad (fun s ->
          match parse_gp s with
          | None -> ()
          | Some a -> self#interpret game a
        )

  method interpret game = function
    | ActMove d ->
        let new_pos = pos_dir pos d in
        if not (game#oob new_pos) then
          self#move new_pos
    | ActArrow d -> game#try_arrow pos d player

  method move dst =
    pos <- dst;
    style_pos dom (float_pos pos)

end
