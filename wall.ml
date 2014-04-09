open Tools
open Types

class wall parent pos dir =
  let (x, y) = pos in
  let extraclass = dirclass "wall" dir in
  let dom = div_class ~extraclass "wall" in
  let _ = style_pos dom (float x, float y) in
  let _ = Dom.appendChild parent dom in
object
  val dom = dom
  val pos = pos
  val dir = dir

  method is_at x y dirq =
    pos = (x, y) && dir = dirq
end

