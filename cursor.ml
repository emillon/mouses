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

let float_pos (x, y) =
  (float x, float y)

class cursor parent game pos =
object(self)
  val dom = div_class "cursor"
  val mutable pos = pos

  initializer begin
    style_pos dom (float_pos pos);
    Dom.appendChild parent dom; Firebug.console##log (js"setup cur");
    Dom_html.document##onkeydown <- Dom_html.handler (fun ev ->
      begin match parse_keycode (ev##keyCode) with
      | None -> ()
      | Some a -> self#interpret a
      end;
      Js._true
    )
  end

  method interpret = function
    | ActMove d ->
        let new_pos = pos_dir pos d in
        if not (game#oob new_pos) then
          self#move new_pos
    | ActArrow d -> game#try_arrow pos d

  method move dst =
    pos <- dst;
    style_pos dom (float_pos pos)

end
