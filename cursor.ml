open Tools
open Types

let parse_keycode binding keyCode =
  assoc_opt keyCode binding

let parse_gp binding e =
  assoc_opt e binding

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
  val mutable control = cd

  initializer begin
    style_pos dom (float_pos pos);
    Dom.appendChild parent dom;
  end

  method attach_to (game:'game) =
    match control with
    | CD_Keyboard binding ->
      Dom_html.document##onkeydown <- Dom_html.handler (fun ev ->
        begin match parse_keycode binding (ev##keyCode) with
        | None -> ()
        | Some a -> self#interpret game a
        end;
        Js._true
      )
    | CD_Gamepad binding ->
        let n = gamepad_of_binding binding in
        game#subscribe_gamepad n (fun e ->
          match parse_gp binding e with
          | None -> ()
          | Some a -> self#interpret game a
        )

  method detach game =
    match control with
    | CD_Keyboard _ ->
        Dom_html.document##onkeydown <- Dom_html.no_handler
    | CD_Gamepad b ->
        let n = gamepad_of_binding b in
        game#unsubscribe_gamepad n

  method interpret game = function
    | ActMove d ->
        let new_pos = pos_dir pos d in
        if not (game#oob new_pos) then
          self#move new_pos
    | ActArrow d -> game#try_arrow pos d player

  method move dst =
    pos <- dst;
    style_pos dom (float_pos pos)

  method rebind b game =
    self#detach game;
    control <- b;
    self#attach_to game

end
