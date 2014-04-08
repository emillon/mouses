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

let dirclass base dir =
  let sfx = match dir with
  | U -> "-up"
  | D -> "-down"
  | L -> "-left"
  | R -> "-right"
  in
  base ^ sfx

let style_pos d (x, y) =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f)) in
  d##style##left <- style x;
  d##style##top <- style y

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

let mouse_exiting (x, y) dir =
  match dir with
  | U -> y = 0
  | D -> y = 7
  | L -> x = 0
  | R -> x = 7

type arrow = (direction * H.divElement Js.t)

class mouse dom pos dir = object(self)

  val dom = dom

  val mutable pos = pos
  val mutable dir = dir

  method move npos =
    style_pos dom npos;
    pos <- npos

  method update_class =
    let extraclass = dirclass "mouse" dir in
    set_class dom ~extraclass "mouse"

  method turn_to ndir =
    dir <- ndir;
    self#update_class;
    let new_pos =
      match dir with
      | U | D -> round_x pos
      | L | R -> round_y pos
    in
    pos <- new_pos

  method turn =
    let new_dir = dir_right dir in
    self#turn_to new_dir

  method act_tile =
    let (x, y) = pos in
    let (dx, nfx) = modf (x +. 1.) in
    let (dy, nfy) = modf (y +. 1.) in
    let nx = int_of_float (nfx -. 1.) in
    let ny = int_of_float (nfy -. 1.) in
    let lo d = d < 0.5 in
    let hi d = d >= 0.5 in
    match dir with
    | U when hi dy -> Some (nx, ny + 1)
    | D when lo dy -> Some (nx, ny)
    | L when hi dx -> Some (nx + 1, ny)
    | R when lo dx -> Some (nx, ny)
    | _ -> None

  method anim (board:arrow option array array) walls =
    let new_pos = update_pos dir pos in
    self#move new_pos;
    begin
      match self#act_tile with
      | None -> ()
      | Some (x, y) ->
        match board.(x).(y) with
        | Some (d, _) -> self#turn_to d
        | None ->
          let wall_front = List.exists
            (fun w ->
              (x, y) = w.w_pos && dir = w.w_dir
            ) walls
          in
          let wall_present =
            wall_front || mouse_exiting (x, y) dir
          in
          if wall_present then
            self#turn
    end

end

type game =
  { g_dom: H.divElement Js.t
  ; g_mouses: mouse list
  ; g_walls: wall list
  ; g_board: arrow option array array
  ; g_log: string -> unit
  }

let wall_create g pos dir =
  let (x, y) = pos in
  let fpos = (float x, float y) in
  let extraclass = dirclass "wall" dir in
  let d = div_class ~extraclass "wall" in
  style_pos d fpos;
  Dom.appendChild g d;
  { w_dom = d
  ; w_pos = pos
  ; w_dir = dir
  }

let mouse_spawn g p =
  let extraclass = "mouse-right" in
  let d = div_class ~extraclass "mouse" in
  let mouse = new mouse d (0., 0.) R in
  mouse#move p;
  Dom.appendChild g d;
  mouse

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
    List.iter (fun m -> m#anim g.g_board g.g_walls) mouses
  in
  H.window##setInterval(Js.wrap_callback anim, 16.)

let _ =
  let game =
    Js.Opt.get
      (H.document##getElementById (js"game"))
      (fun () -> assert false)
  in
  start_game game
