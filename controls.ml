open Tools
open Types

let t_detect = 1000. (* milliseconds *)

let tell s =
  Firebug.console##log(js s)

type slot_state =
  | ST_Start
  | ST_WU
  | ST_WD
  | ST_WL
  | ST_WR
  | ST_WAU
  | ST_WAD
  | ST_WAL
  | ST_WAR
  | ST_Done

(* state name  on screen   act
 * ===========================
 * Start       Press...
 *                        <any>
 * WU          Up?
 *                        keyup
 * WD          Down?
 *                        keydown
 *        ...
 * WAR         ArrowRight?
 *                        keyar
 * Done        Done
 *)

let st_name = function
  | ST_Start -> invalid_arg "st_name"
  | ST_WU -> "Up?"
  | ST_WD -> "Down?"
  | ST_WL -> "Left?"
  | ST_WR -> "Right?"
  | ST_WAU -> "Arrow Up?"
  | ST_WAD -> "Arrow Down?"
  | ST_WAL -> "Arrow Left?"
  | ST_WAR -> "Arrow Right?"
  | ST_Done -> "Done!"

let next_state = function
  | ST_Start -> ST_WU
  | ST_WU -> ST_WD
  | ST_WD -> ST_WL
  | ST_WL -> ST_WR
  | ST_WR -> ST_WAU
  | ST_WAU -> ST_WAD
  | ST_WAD -> ST_WAL
  | ST_WAL -> ST_WAR
  | ST_WAR -> ST_Done
  | ST_Done -> ST_Done

let action_state = function
  | ST_Start -> None
  | ST_WU -> Some (ActMove U)
  | ST_WD -> Some (ActMove D)
  | ST_WL -> Some (ActMove L)
  | ST_WR -> Some (ActMove R)
  | ST_WAU -> Some (ActArrow U)
  | ST_WAD -> Some (ActArrow D)
  | ST_WAL -> Some (ActArrow L)
  | ST_WAR -> Some (ActArrow R)
  | ST_Done -> None

type keybinding =
  | KB_KP of int
  | KB_GP of gp_event

class slot parent (player:player) =
  let dom = div_class "slot" in
  let _ = dom##innerHTML <- js "Press" in
object(self)
  val mutable avail = true
  val mutable state = ST_Start
  val mutable bindings = None

  method reset =
    avail <- true;
    state <- ST_Start;
    bindings <- None;
    self#tell "Press"

  method avail = avail

  method notavail =
    avail <- false

  method private tell s =
    dom##innerHTML <- js s

  method private handle_binding e =
    match state with
    | (ST_Start|ST_WU|ST_WD|ST_WL|ST_WR|ST_WAU|ST_WAD|ST_WAL|ST_WAR) ->
        let ns = next_state state in
        self#tell (st_name ns);
        begin match action_state state with
        | Some a -> self#add_binding e a
        | None -> ()
        end;
        state <- ns
    | ST_Done -> ()

  method onkeydown (e:Dom_html.keyboardEvent Js.t) =
    self#handle_binding (KB_KP (e##keyCode))

  method ongamepad (e:gp_event) =
    self#handle_binding (KB_GP e)

  method private add_binding e a =
    let new_bindings =
    match (e, bindings) with
    | KB_KP n, None -> Some (CD_Keyboard [(n, a)])
    | KB_KP n, Some (CD_Keyboard xs) -> Some (CD_Keyboard ((n, a)::xs))
    | KB_KP n, Some (CD_Gamepad _) -> invalid_arg "add_binding"
    | KB_GP g, None -> Some (CD_Gamepad [(g, a)])
    | KB_GP g, Some (CD_Gamepad xs) -> Some (CD_Gamepad ((g, a)::xs))
    | KB_GP g, Some (CD_Keyboard _) -> invalid_arg "add_binding"
    in
    bindings <- new_bindings

  method binding = bindings

  method attach =
    Dom.appendChild parent dom

  method player = player
end

class controls parent game =
  let popup = div_class "controlwindow" in
object(self)

  method rebind_btn =
    let btn = Dom_html.createButton Dom_html.document in
    btn##innerHTML <- js"Rebind";
    btn##onclick <- Dom_html.handler (fun _ ->
      game#stop;
      self#show_popup;
      Js._true);
    btn

  val slots = Array.map (fun p -> new slot popup p) [|P1;P2|]

  method private show_popup =
    popup##innerHTML <- js"";
    let title = text_div "Controls" in
    Dom.appendChild popup title;
    let closeBtn = text_div ~cls:"closebtn" "[X]" in
    on_click closeBtn (fun () -> self#finish);
    Dom_html.document##onkeydown <- Dom_html.handler (fun e ->
      self#onkeydown e;
      Js._true
    );
    game#subscribe_all_gamepads self#ongamepad;
    Dom.appendChild popup closeBtn;
    Array.iter (fun s ->
      s#reset;
      s#attach
    ) slots;
    Dom.appendChild parent popup

  method ongamepad e :unit=
    let s = self#find_avail_slot in
    let n = gamepad_of_event e in
    s#notavail;
    game#subscribe_gamepad n s#ongamepad

  method onkeydown e =
    let s = self#find_avail_slot in
    s#notavail;
    s#onkeydown e;
    Dom_html.document##onkeydown <- Dom_html.handler (fun e ->
      s#onkeydown e;
      Js._true
    )

  method private find_avail_slot =
    match array_find (fun s -> s#avail) slots with
    | Some s -> s
    | None -> invalid_arg "find_avail_slot"

  method private finish =
    Dom.removeChild parent popup;
    Dom_html.window##onmousedown <- Dom.no_handler;
    Array.iter (fun s ->
      match s#binding with
      | None -> ()
      | Some b -> game#rebind s#player b
    ) slots;
    game#continue

end
