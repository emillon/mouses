open Tools

let nplayers = 2
let t_detect = 1000. (* milliseconds *)

type control_type =
  | Mouse
  | Keyboard

let p_ct () = function
  | None -> assert false
  | Some Mouse -> "mouse"
  | Some Keyboard -> "keyboard"

class binder parent n =
  let dom = div_class "binder" in
  let _ = Dom.appendChild parent dom in
object(self)
  val mutable control_type :control_type option = None
  val mutable timeout = None
  val mutable bound = false

  method private set_text t =
    dom##innerHTML <- js t

  method private reset =
    control_type <- None;
    self#set_text (Printf.sprintf "P%d" n)

  method settype ct =
    control_type <- Some ct

  method start =
    let tid = Dom_html.window##setTimeout(Js.wrap_callback(fun () ->
      self#detect_done
      ), t_detect)
    in
    timeout <- Some tid;
    self#set_text (Printf.sprintf "Press %a..." p_ct control_type)

  method private event_reset =
    begin match timeout with
    | None -> ()
    | Some tid ->
      Dom_html.window##clearTimeout(tid)
    end;
    if not bound then
      self#reset

  method onmouseup = self#event_reset
  method onkeyup = self#event_reset

  method private detect_done =
    self#set_text "OK";
    bound <- true

  method available =
    control_type = None

  initializer
    self#reset
end

class binder_list parent =
  let dom = div_class "binder-list" in
  let binders = Array.init nplayers (fun n -> new binder dom n) in
  let _ = Dom.appendChild parent dom in
object(self)
  method start =
    ()

  method private first_avail =
    match array_find (fun b -> b#available) binders with
    | None -> failwith "first_avail: too many players"
    | Some b -> b

  method private start_first ct =
    let slot = self#first_avail in
    slot#settype ct;
    slot#start

  method onmousedown =
    self#start_first Mouse

  method onmouseup =
    Array.iter (fun b -> b#onmouseup) binders

  method onkeydown =
    self#start_first Keyboard

  method onkeyup =
    Array.iter (fun b -> b#onkeyup) binders

end

class controls parent ~on_start ~on_end =
  let popup = div_class "controlwindow" in
object(self)

  method rebind_btn =
    let btn = Dom_html.createButton Dom_html.document in
    btn##innerHTML <- js"Rebind";
    btn##onclick <- Dom_html.handler (fun _ -> on_start();self#show_popup;Js._true);
    btn

  method private show_popup =
    popup##innerHTML <- js"";
    let title = text_div "Controls" in
    Dom.appendChild popup title;
    let closeBtn = text_div ~cls:"closebtn" "[X]" in
    on_click closeBtn (fun () -> self#finish);
    let bl = new binder_list popup in
    on_mousedown Dom_html.window (fun () -> bl#onmousedown);
    on_mouseup Dom_html.window (fun () -> bl#onmouseup);
    on_keydown Dom_html.window (fun () -> bl#onkeydown);
    on_keyup Dom_html.window (fun () -> bl#onkeyup);
    Dom.appendChild popup closeBtn;
    Dom.appendChild parent popup

  method private finish =
    Dom.removeChild parent popup;
    Dom_html.window##onmousedown <- Dom.no_handler;
    on_end ()

end
