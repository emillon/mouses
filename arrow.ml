open Tools
open Types

class arrow dom (dir:direction) = object
  val dom = dom
  val mutable dir = dir

  method detach (parent:Dom_html.divElement Js.t) =
    Dom.removeChild parent dom;

  method dir = dir

  method turn =
    dir <- dir_right dir;
    let extraclass = dirclass "arrow" dir in
    set_class dom ~extraclass "arrow"
end
