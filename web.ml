module H = Dom_html
let js = Js.string

let set_class d ?extraclass c =
  let cls = match extraclass with
  | None -> c
  | Some ec -> c ^ " " ^ ec
  in
  d##className <- js cls

let div_class ?extraclass c =
  let d = H.createDiv H.document in
  set_class d ?extraclass c;
  d

type position = float * float

type direction = U | D | L | R

type mouse =
  { m_dom: H.divElement Js.t
  ; mutable m_pos: position
  ; mutable m_dir: direction
  }

type wall =
  { w_dom: H.divElement Js.t
  ; w_pos: int * int
  ; w_dir: direction
  }

type game =
  { g_dom: H.divElement Js.t
  ; g_mouses: mouse list
  ; g_walls: wall list
  ; g_board: direction option array array
  ; g_log: string -> unit
  }

let style_pos d (x, y) =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f)) in
  d##style##left <- style x;
  d##style##top <- style y

let mouse_move mouse pos =
  style_pos mouse.m_dom pos;
  mouse.m_pos <- pos

let round_near f =
  float (int_of_float (f +. 0.5))

let round_x (x, y) =
  (round_near x, y)

let round_y (x, y) =
  (x, round_near y)

let dir_right = function
  | U -> R
  | L -> U
  | D -> L
  | R -> D

let mouse_update_class mouse =
  let extraclass = match mouse.m_dir with
  | U -> "mouse-up"
  | D -> "mouse-down"
  | L -> "mouse-left"
  | R -> "mouse-right"
  in
  set_class mouse.m_dom ~extraclass "mouse"

let mouse_turn_to mouse dir =
  mouse.m_dir <- dir;
  mouse_update_class mouse;
  let new_pos =
    match mouse.m_dir with
    | U | D -> round_x mouse.m_pos
    | L | R -> round_y mouse.m_pos
  in
  mouse.m_pos <- new_pos

let mouse_turn mouse =
  let new_dir = dir_right mouse.m_dir in
  mouse_turn_to mouse new_dir

let mouse_exiting (x, y) dir =
  match dir with
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

let mouse_act_tile m =
  let (x, y) = m.m_pos in
  let (dx, nfx) = modf (x +. 1.) in
  let (dy, nfy) = modf (y +. 1.) in
  let nx = int_of_float (nfx -. 1.) in
  let ny = int_of_float (nfy -. 1.) in
  let lo d = d < 0.5 in
  let hi d = d >= 0.5 in
  match m.m_dir with
  | U when hi dy -> Some (nx, ny + 1)
  | D when lo dy -> Some (nx, ny)
  | L when hi dx -> Some (nx + 1, ny)
  | R when lo dx -> Some (nx, ny)
  | _ -> None

let mouse_anim g mouse =
  let dir = mouse.m_dir in
  let pos = mouse.m_pos in
  let new_pos = update_pos dir pos in
  mouse_move mouse new_pos;
  begin
    match mouse_act_tile mouse with
    | None -> ()
    | Some (x, y) ->
      match g.g_board.(x).(y) with
      | Some d -> mouse_turn_to mouse d
      | None ->
        let wall_front = List.exists
          (fun w ->
            (x, y) = w.w_pos && dir = w.w_dir
          ) g.g_walls
        in
        let wall_present =
          wall_front || mouse_exiting (x, y) dir
        in
        if wall_present then
          mouse_turn mouse
  end

let mouse_spawn g p =
  let extraclass = "mouse-right" in
  let d = div_class ~extraclass "mouse" in
  let mouse =
    { m_dom = d
    ; m_pos = (0., 0.)
    ; m_dir = R
    }
  in
  mouse_move mouse p;
  Dom.appendChild g d;
  mouse

let cell_setup c b i j =
  c##onclick <- H.handler (fun _ ->
    let d = match b.(i).(j) with
    | None -> U
    | Some d -> dir_right d
    in
    b.(i).(j) <- Some d;
    let descr = function
      | U -> "↑"
      | D -> "↓"
      | L -> "←"
      | R -> "→"
    in
    c##innerHTML <- js(descr d);
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
  let m = mouse_spawn d (0., 2.) in
  let mouses =
    [ m
    ]
  in
  let walls =
    [ wall_create d (4, 2) R
    ; wall_create d (4, 4) D
    ]
  in
  let g =
    { g_dom = d
    ; g_mouses = mouses
    ; g_walls = walls
    ; g_board = board
    ; g_log = (fun s -> logDiv##innerHTML <- js s)
    }
  in
  let anim () =
    List.iter (mouse_anim g) mouses
  in
  H.window##setInterval(Js.wrap_callback anim, 16.)

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
