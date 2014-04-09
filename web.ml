open Game
open Mouse
open Tools
open Types
open Wall

module H = Dom_html

let cell_setup c b i j =
  c##onclick <- H.handler (fun _ ->
    let d = match b.(i).(j) with
    | None -> U
    | Some (dir, e) ->
        begin
          Dom.removeChild c e;
          dir_right dir
        end
    in
    let extraclass = dirclass "arrow" d in
    let e' = div_class ~extraclass "arrow" in
    Dom.appendChild c e';
    b.(i).(j) <- Some (d, e');
    Js._true
  )

let start_game d =
  let board = Array.make_matrix 8 8 None in
  for i = 0 to 7 do
    let row = div_class "row" in
    for j = 0 to 7 do
      let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
      let cell = div_class ~extraclass "cell" in
      cell_setup cell board j i;
      Dom.appendChild row cell
    done;
    Dom.appendChild d row
  done;
  let logDiv = H.createPre H.document in
  Dom.appendChild d logDiv;
  let g = new game d board in
  g#add_mouse (0., 2.);
  g#add_wall (4, 2) R;
  g#add_wall (4, 4) D;
  g#start

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
