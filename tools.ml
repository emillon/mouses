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

let queue_find p q =
  let res = ref None in
  begin
    try
      Queue.iter (fun x ->
        if p x then
          begin
            res := Some x;
            raise Found
          end
      ) q
    with Found -> ()
  end;
  !res

let list_iteri f l =
  let i = ref 0 in
  List.iter (fun x ->
    f (!i) x;
    incr i
  ) l

let rec fromto l h =
  if l = h then
    [l]
  else if l < h then
    l::fromto (l+1) h
  else
    invalid_arg "fromto"

let list_find_opt f l =
  let res = ref None in
  begin
    try
      List.iter (fun x ->
        match f x with
        | Some y -> begin
            res := Some y;
            raise Found
        end
        | None -> ()
      ) l
    with Found -> ()
  end;
  !res

let getbyid_unsafe id =
  Js.Opt.get
    (Dom_html.document##getElementById (js id))
    (fun () -> invalid_arg ("No such div : " ^ id))
