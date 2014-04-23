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
  | CSpawner of direction
  | CSink of player

let print_cell = function
  | CEmpty -> "."
  | CSpawner _ -> "X"
  | CSink P1 -> "1"
  | CSink P2 -> "2"

let level_from_img img =
  let data = img##data in
  let width = img##width in
  let lw, lh = level_size img in
  let level = Array.make_matrix lw lh CEmpty in
  let walls = ref [] in
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
  let find_spawner_dir (bi, bj) =
    let ok = function
    | (0x00, 0xff, 0xff) -> true
    | _ -> false
    in
    let pu = pix (bi, bj-1) in
    let pd = pix (bi, bj+2) in
    let pl = pix (bi-1, bj) in
    let pr = pix (bi+2, bj) in
    match () with
    | _ when ok pu -> U
    | _ when ok pd -> D
    | _ when ok pl -> L
    | _ when ok pr -> R
    | _ -> invalid_arg "cannot find spawner dir"
  in
  let get_cell j i =
    let c = coord (i, j) in
    match pix c with
    | (0xff, 0xff, 0xff) -> CEmpty
    | (0x00, 0x00, 0xff) -> CSink P1
    | (0xff, 0x00, 0x00) -> CSink P2
    | (0x00, 0xff, 0xff) ->
      let dir = find_spawner_dir c in
      CSpawner dir
    | _ -> invalid_arg "parse_cell"
  in
  for i = 0 to lh - 1 do
    for j = 0 to lw - 1 do
      level.(j).(i) <- get_cell i j
    done
  done;
  let v_wall i j =
    pix (3*i+3, 3*j+1) = (0, 0, 0)
  in
  let h_wall i j =
    pix (3*i+1, 3*j+3) = (0, 0, 0)
  in
  let add_wall w =
    walls := w::!walls
  in
  for i = 0 to lh - 1 do
    for j = 0 to lw - 1 do
      if i <> lh - 1 && v_wall i j then
        add_wall ((i, j), (i+1, j));
      if j <> lw - 1 && h_wall i j then
        add_wall ((i, j), (i, j+1));
    done
  done;
  (level, !walls)

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

let load_level imgsrc =
  let open Lwt in
  let img = Dom_html.createImg Dom_html.document in
  img##src <- js imgsrc;
  Lwt_js_events.load img >>= fun _ ->
  let can = Dom_html.createCanvas Dom_html.document in
  can##width <- 25;
  can##height <- 25;
  let ctx = can##getContext(Dom_html._2d_) in
  ctx##drawImage(img, 0., 0.);
  let img = ctx##getImageData(0., 0., 25., 25.) in
  return (level_from_img img)

let debug_parse parent imgsrc =
  let open Lwt in
  let txt = Dom_html.createPre Dom_html.document in
  load_level imgsrc >>= fun (level, walls) ->
  (* TODO print walls *)
  txt##innerHTML <- js(print_level level);
  Dom.appendChild parent txt;
  return ()

let from_pos (x1, y1) (x2, y2) =
  let dx = x2 - x1 in
  let dy = y2 - y1 in
  match (dx, dy) with
  | (1,0) -> (R, L)
  | (0,1) -> (D, U)
  | _ -> invalid_arg (Printf.sprintf "from_pos : diff = (%d,%d)" dx dy)

let new_game d imgsrc =
  let open Lwt in
  load_level imgsrc >>= (fun (level, walls) ->
    let g = new game d in
    for j = 0 to 7 do
      for i = 0 to 7 do
        match level.(j).(i) with
        | CEmpty -> ()
        | CSpawner d -> g#add_spawner (i, j) d
        | CSink n -> g#add_sink (i, j) n
      done
    done;
    List.iter (fun (pos1, pos2) ->
      let (d1, d2) = from_pos pos1 pos2 in
      g#add_wall pos1 d1;
      g#add_wall pos2 d2
    ) walls;
    return g
  )
