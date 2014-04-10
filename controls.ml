open Tools

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
    let closeBtn = text_div "[X]" in
    closeBtn##onclick <- Dom_html.handler (fun _ -> self#finish;Js._true);
    Dom.appendChild popup closeBtn;
    Dom.appendChild parent popup

  method private finish =
    Dom.removeChild parent popup;
    on_end ()

end
