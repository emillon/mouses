open Arrow
open Game
open Mouse
open Tools
open Types
open Wall

let start_game d =
  Parser.new_game d "levels/02.png" (fun g -> g#start)

let _ =
  let game =
    Js.Opt.get
      (Dom_html.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
