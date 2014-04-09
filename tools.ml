open Types

let js = Js.string

let style_pos d (x, y) =
  let style f = js (Printf.sprintf "%.fpx" (60. *. f)) in
  d##style##left <- style x;
  d##style##top <- style y

let dirclass base dir =
  let sfx = match dir with
  | U -> "-up"
  | D -> "-down"
  | L -> "-left"
  | R -> "-right"
  in
  base ^ sfx

let set_class d ?extraclass c =
  let cls = match extraclass with
  | None -> c
  | Some ec -> c ^ " " ^ ec
  in
  d##className <- js cls

let div_class ?extraclass c =
  let d = Dom_html.createDiv Dom_html.document in
  set_class d ?extraclass c;
  d

let rec first_of = function
  | [] -> None
  | (Some _ as r)::_ -> r
  | None::xs -> first_of xs

let dir_right = function
  | U -> R
  | L -> U
  | D -> L
  | R -> D
