open Game
open Tools
open Types

let level_size img =
  let img_w = img##width in
  let img_h = img##height in
  (* pixel size is 1 + 2s + (s - 1) + 1 = 3s+1 *)
  match (img_w mod 3, img_h mod 3) with
  | (1, 1) -> ((img_w - 1) / 3), ((img_h - 1) / 3)
  | _ -> failwith "bad image size"

type cell =
  | CEmpty
  | CSpawner
  | CSink of int

let parse_cell = function
  | (0xff, 0xff, 0xff) -> CEmpty
  | (0x00, 0xff, 0xff) -> CSpawner
  | (0x00, 0x00, 0xff) -> CSink 1
  | (0xff, 0x00, 0x00) -> CSink 2
  | _ -> invalid_arg "parse_cell"

let print_cell = function
  | CEmpty -> "."
  | CSpawner -> "X"
  | CSink n -> string_of_int n

let level_from_img img =
  let data = img##data in
  let width = img##width in
  let lw, lh = level_size img in
  let level = Array.make_matrix lw lh CEmpty in
  let pix (i, j) =
    let base = 4*(i*width+j) in
    let r = Dom_html.pixel_get data (base) in
    let g = Dom_html.pixel_get data (base+1) in
    let b = Dom_html.pixel_get data (base+2) in
    (r, g, b)
  in
  let coord (i, j) =
    (* transform cell number to pixel number *)
    (3*i+1, 3*j+1)
  in
  let get_cell j i =
    (i, j)
    |> coord
    |> pix
    |> parse_cell
  in
  for i = 0 to lh - 1 do
    for j = 0 to lw - 1 do
      level.(j).(i) <- get_cell i j
    done
  done;
  level

let print_level level =
  let lh = Array.length level in
  let lw = Array.length (level.(0)) in
  let p_cell j i =
    print_cell (level.(j).(i))
  in
  let p_line j =
    String.concat " " (List.map (p_cell j) (fromto 0 (lw-1)))
  in
  String.concat "\n" (List.map p_line (fromto 0 (lh-1)))

let load_level imgsrc k =
  let img = Dom_html.createImg Dom_html.document in
  img##src <- js imgsrc;
  img##onload <- Dom_html.handler (fun _ ->
    let can = Dom_html.createCanvas Dom_html.document in
    can##width <- 25;
    can##height <- 25;
    let ctx = can##getContext(Dom_html._2d_) in
    ctx##drawImage(img, 0., 0.);
    let img = ctx##getImageData(0., 0., 25., 25.) in
    let level = level_from_img img in
    k level;
    Js._true
  )

let debug_parse parent imgsrc =
  let img = Dom_html.createImg Dom_html.document in
  img##src <- js imgsrc;
  img##onload <- Dom_html.handler (fun _ ->
    let can = Dom_html.createCanvas Dom_html.document in
    can##width <- 25;
    can##height <- 25;
    let ctx = can##getContext(Dom_html._2d_) in
    ctx##drawImage(img, 0., 0.);
    let img = ctx##getImageData(0., 0., 25., 25.) in
    Dom.appendChild parent can;
    let txt = Dom_html.createPre Dom_html.document in
    let level = level_from_img img in
    txt##innerHTML <- js(print_level level);
    Dom.appendChild parent txt;
    Js._true
  )

let new_game d imgsrc k =
  load_level imgsrc (fun level ->
    let g = new game d in
    for j = 0 to 7 do
      for i = 0 to 7 do
        match level.(j).(i) with
        | CEmpty -> ()
        | CSpawner -> g#add_spawner (i, j) R
        | CSink _ -> g#add_sink (i, j)
      done
    done;
    k g
  )
