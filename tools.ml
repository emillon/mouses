open Types

exception Found

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

let x_find iter p q =
  let res = ref None in
  begin
    try
      iter (fun x ->
        if p x then
          begin
            res := Some x;
            raise Found
          end
      ) q
    with Found -> ()
  end;
  !res

let queue_find p x = x_find Queue.iter p x

let array_find p x = x_find Array.iter p x

let text_div ?cls text =
  let dom = Dom_html.createDiv Dom_html.document in
  begin match cls with
  | None -> ()
  | Some c -> dom##className <- js c
  end;
  dom##innerHTML <- js text;
  dom

let handle f = Dom_html.handler (fun _ -> f (); Js._true)

let on_click e f = e##onclick <- handle f
let on_mousedown e f = e##onmousedown <- handle f
let on_mouseup e f = e##onmouseup <- handle f
let on_keydown e f = e##onkeydown <- handle f
let on_keyup e f = e##onkeyup <- handle f
