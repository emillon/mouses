open Tools
open Types

class arrow parent (pos:int*int) dir player =
  let classd = dirclass "arrow" dir in
  let classp = match player with
  | P1 -> "arrow-player1"
  | P2 -> "arrow-player2"
  in
  let extraclass = classd ^ " " ^ classp in
  let dom = div_class ~extraclass "arrow" in
  let _ = Dom.appendChild parent dom in
  object
  val pos = pos
  val dom = dom
  val mutable dir = dir

  method pos = pos

  method detach =
    Dom.removeChild parent dom;

  method dir = dir

  method turn =
    dir <- dir_right dir;
    let extraclass = dirclass "arrow" dir in
    set_class dom ~extraclass "arrow"
end
