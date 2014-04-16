open Tools

class sink parent ipos (player:Types.player) =
  let dom = div_class "sink" in
  let (x, y) = ipos in
  let fpos = (float x, float y) in
  let _ = style_pos dom fpos in
  let _ = Dom.appendChild parent dom in
object
  val pos = ipos
  method is_at x y =
    if pos = (x, y) then
      Some player
    else
      None
end
