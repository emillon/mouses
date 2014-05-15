open Tools
open Types

let max_arrow_strength = 20

class arrow parent (pos:int*int) dir player =
  let classd = dirclass "arrow" dir in
  let classp = match player with
  | P1 -> "arrow-player1"
  | P2 -> "arrow-player2"
  in
  let extraclass = classd ^ " " ^ classp in
  let dom = div_class ~extraclass "arrow" in
  let _ = Dom.appendChild parent dom in
  object(self)
  method pos = pos

  method dir = dir

  method detach =
    Dom.removeChild parent dom

  method player = player

  val mutable strength = max_arrow_strength

  method weaken =
    strength <- strength -1;
    self#update_style

  method is_dead =
    strength <= 0

  method private update_style =
    let op =
      float strength /. float max_arrow_strength
    in
    dom##style##opacity <- Js.def(js(string_of_float op))
end
