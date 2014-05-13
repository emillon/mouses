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
  method pos = pos

  method dir = dir

  method detach =
    Dom.removeChild parent dom;
end
