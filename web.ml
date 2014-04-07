module H = Dom_html
let js = Js.string

let div_class c =
  let d = H.createDiv H.document in
  d##className <- js c;
  d

type position = float * float

type direction = U | D | L | R

type mouse =
  { m_dom: H.divElement Js.t
  ; mutable m_pos: position
  ; mutable m_dir: direction
  }

let mouse_move mouse pos =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f +. 30.)) in
  let (x, y) = pos in
  mouse.m_dom##style##left <- style x;
  mouse.m_dom##style##top <- style y;
  mouse.m_pos <- pos

let mouse_turn mouse =
  let new_dir = match mouse.m_dir with
  | U -> R
  | L -> U
  | D -> L
  | R -> D
  in
  mouse.m_dir <- new_dir

let update_pos dir (x, y) =
  let d = 0.05 in
  match dir with
  | U -> (x, y -. d)
  | D -> (x, y +. d)
  | L -> (x -. d, y)
  | R -> (x +. d, y)

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let wall_at pos dir =
  int_pos pos = (4, 2) && dir = R

let mouse_anim mouse =
  let dir = mouse.m_dir in
  let pos = mouse.m_pos in
  if wall_at pos dir then
    mouse_turn mouse;
  let new_pos = update_pos dir pos in
  mouse_move mouse new_pos

let mouse_spawn g p =
  let d = div_class "mouse" in
  let mouse =
    { m_dom = d
    ; m_pos = (0., 0.)
    ; m_dir = R
    }
  in
  mouse_move mouse p;
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
    [ mouse_spawn g (0., 2.)
    ; mouse_spawn g (1., 2.)
    ; mouse_spawn g (2., 2.)
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
