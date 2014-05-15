open Arrow
open Game
open Mouse
open Tools
open Types
open Wall

let level_url name =
  "levels/" ^ name ^ ".png"

let game = ref None

let start_game dom level_name =
  let open Lwt in
  begin match !game with
  | Some old_g -> old_g#destroy
  | None -> ()
  end;
  let fn = level_url level_name in
  Parser.new_game dom fn >>= fun g ->
  game := Some g;
  g#start;
  return ()

let level_list = ["01" ; "02" ; "03"]

let build_level_list dom game =
  List.iter (fun l ->
    let img = Dom_html.createImg Dom_html.document in
    let url = level_url l in
    img##src <- js url;
    img##onclick <- Dom_html.handler (fun _ ->
      let _ = start_game game l in
      Js._true
    );
    Dom.appendChild dom img
  ) level_list

let _ =
  let game = getbyid_unsafe "game" in
  let levels = getbyid_unsafe "levels" in
  build_level_list levels game;
  start_game game "01"
