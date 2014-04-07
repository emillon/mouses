module H = Dom_html
let js = Js.string

let div_class c =
  let d = H.createDiv H.document in
  d##className <- js c;
  d

let spawn_mouse tile =
  let mouse = div_class "mouse" in
  Dom.appendChild tile mouse

let start_game g =
  for i = 1 to 8 do
    let row = div_class "row" in
    for j = 1 to 8 do
      let evenodd = if (i + j) mod 2 = 0 then " cell-even" else " cell-odd" in
      let cls = "cell" ^ evenodd in
      let cell = div_class cls in
      Dom.appendChild row cell;
      if (i, j) = (3, 4) then spawn_mouse cell
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
