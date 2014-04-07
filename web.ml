module H = Dom_html
let js = Js.string

let div_class c =
  let d = H.createDiv H.document in
  d##className <- js c;
  d

type mouse =
  { m_dom: H.divElement Js.t
  ; mutable m_x: float
  ; mutable m_y: float
  }

let mouse_move mouse x y =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f +. 30.)) in
  mouse.m_dom##style##left <- style x;
  mouse.m_dom##style##top <- style y;
  mouse.m_x <- x;
  mouse.m_y <- y

let mouse_anim mouse =
  let x = mouse.m_x in
  let y = mouse.m_y in
  mouse_move mouse (x+.0.01) y

let mouse_spawn g x y =
  let d = div_class "mouse" in
  let mouse =
    { m_dom = d
    ; m_x = 0.
    ; m_y = 0.
    }
  in
  mouse_move mouse x y;
  Dom.appendChild g d;
  mouse

let start_game g =
  for i = 1 to 8 do
    let row = div_class "row" in
    for j = 1 to 8 do
      let evenodd = if (i + j) mod 2 = 0 then " cell-even" else " cell-odd" in
      let cls = "cell" ^ evenodd in
      let cell = div_class cls in
      Dom.appendChild row cell
    done;
    Dom.appendChild g row
  done;
  let mouses =
    [ mouse_spawn g 0. 2.
    ; mouse_spawn g 1. 2.
    ; mouse_spawn g 2. 2.
    ]
  in
  let anim () =
    List.iter mouse_anim mouses
  in
  H.window##setInterval(Js.wrap_callback anim, 16.)

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
