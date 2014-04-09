open Arrow
open Game
open Mouse
open Tools
open Types
open Wall

let start_game d =
  let g = new game d in
  g#add_mouse (0., 2.) R;
  g#add_wall (4, 2) R;
  g#add_wall (4, 4) D;
  g#add_spawner (1, 1) R;
  g#add_sink (7, 5);
  g#start

let _ =
  let game =
    Js.Opt.get
      (Dom_html.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
