open Tools

class mouse_control parent =
  let dom = div_class "mousecontrol" in
  let _ = Dom.appendChild parent dom in
object(self)
  val mutable timeout = None

  val t_detect = 1000. (* milliseconds *)

  method detect_start =
    let tid = Dom_html.window##setTimeout(Js.wrap_callback(fun () ->
      self#detect_done
      ), t_detect)
    in
    dom##innerHTML <- js"Press mouse...";
    timeout <- Some tid

  method detect_end =
    begin match timeout with
    | None -> ()
    | Some tid ->
      Dom_html.window##clearTimeout(tid)
    end;
    dom##innerHTML <- js""

  method private detect_done =
    dom##innerHTML<- js"OK!"
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
    let mc = new mouse_control popup in
    on_mousedown Dom_html.window (fun () -> mc#detect_start);
    on_mouseup Dom_html.window (fun () -> mc#detect_end);
    Dom.appendChild popup closeBtn;
    Dom.appendChild parent popup

  method private finish =
    Dom.removeChild parent popup;
    Dom_html.window##onmousedown <- Dom.no_handler;
    on_end ()

end
