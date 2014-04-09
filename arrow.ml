open Tools
open Types

class arrow parent dir =
  let extraclass = dirclass "arrow" dir in
  let dom = div_class ~extraclass "arrow" in
  let _ = Dom.appendChild parent dom in
  object
  val dom = dom
  val mutable dir = dir

  method detach =
    Dom.removeChild parent dom;

  method dir = dir

  method turn =
    dir <- dir_right dir;
    let extraclass = dirclass "arrow" dir in
    set_class dom ~extraclass "arrow"
end
