module H = Dom_html
let js = Js.string

let start_game g =
  for i = 1 to 8 do
    let row = H.createDiv H.document in
    row##className <- js"row";
    for j = 1 to 8 do
      let cell = H.createDiv H.document in
      cell##className <- js"cell";
      Dom.appendChild row cell
    done;
    Dom.appendChild g row
  done

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
