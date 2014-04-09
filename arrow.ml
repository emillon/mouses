open Tools
open Types

class arrow parent (pos:int*int) dir =
  let extraclass = dirclass "arrow" dir in
  let dom = div_class ~extraclass "arrow" in
  let _ = Dom.appendChild parent dom in
  object
  val pos = pos
  val dom = dom
  val mutable dir = dir

  method detach =
    Dom.removeChild parent dom;

  method dir = dir

  method turn =
    dir <- dir_right dir;
    let extraclass = dirclass "arrow" dir in
    set_class dom ~extraclass "arrow"

  method is_at (x, y) =
    pos = (x, y)
end
