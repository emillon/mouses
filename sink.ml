open Tools
open Types

class sink parent ipos player =
  let dom = div_class "sink" in
  let extraclass = match player with
  | P1 -> "sink-player1"
  | P2 -> "sink-player2"
  in
  let player_indicator = div_class ~extraclass "sink-player" in
  let _ = Dom.appendChild dom player_indicator in
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
