module H = Dom_html
let js = Js.string

let div_class ?extraclass c =
  let d = H.createDiv H.document in
  let cls = match extraclass with
  | None -> c
  | Some ec -> c ^ " " ^ ec
  in
  d##className <- js cls;
  d

type position = float * float

type direction = U | D | L | R

type mouse =
  { m_dom: H.divElement Js.t
  ; mutable m_pos: position
  ; mutable m_dir: direction
  }

let style_pos d (x, y) =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f)) in
  d##style##left <- style x;
  d##style##top <- style y

let mouse_move mouse pos =
  style_pos mouse.m_dom pos;
  mouse.m_pos <- pos

let mouse_turn mouse =
  let new_dir = match mouse.m_dir with
  | U -> R
  | L -> U
  | D -> L
  | R -> D
  in
  mouse.m_dir <- new_dir

let int_pos (x, y) =
  (int_of_float x, int_of_float y)

let mouse_exiting m =
  let (x, y) = int_pos m.m_pos in
  match m.m_dir with
  | U -> y = 0
  | D -> y = 7
  | L -> x = 0
  | R -> x = 7

let update_pos dir (x, y) =
  let d = 0.05 in
  match dir with
  | U -> (x, y -. d)
  | D -> (x, y +. d)
  | L -> (x -. d, y)
  | R -> (x +. d, y)

type wall =
  { w_dom: H.divElement Js.t
  ; w_pos: int * int
  ; w_dir: direction
  }

let wall_create g pos dir =
  let (x, y) = pos in
  let fpos = (float x, float y) in
  let extraclass = match dir with
  | U -> "wall-up"
  | D -> "wall-down"
  | L -> "wall-left"
  | R -> "wall-right"
  in
  let d = div_class ~extraclass "wall" in
  style_pos d fpos;
  Dom.appendChild g d;
  { w_dom = d
  ; w_pos = pos
  ; w_dir = dir
  }

let mouse_anim walls mouse =
  let dir = mouse.m_dir in
  let pos = mouse.m_pos in
  let wall_front = List.exists
    (fun w ->
      int_pos pos = w.w_pos && dir = w.w_dir
    ) walls
  in
  let wall_present =
    wall_front || mouse_exiting mouse
  in
  if wall_present then
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
      let extraclass = if (i + j) mod 2 = 0 then "cell-even" else "cell-odd" in
      let cell = div_class ~extraclass "cell" in
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
  let walls =
    [ wall_create g (4, 2) R
    ; wall_create g (4, 4) D
    ; wall_create g (3, 4) L
    ]
  in
  let anim () =
    List.iter (mouse_anim walls) mouses
  in
  H.window##setInterval(Js.wrap_callback anim, 16.)

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
