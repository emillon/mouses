open Types

class arrow dom (dir:direction) = object
  val dom = dom
  val dir = dir

  method detach (parent:Dom_html.divElement Js.t) =
    Dom.removeChild parent dom;

  method dir = dir
end
