val js : string -> Js.js_string Js.t

val style_pos : Dom_html.element Js.t -> Types.position -> unit 

val dirclass : string -> Types.direction -> string

val set_class : Dom_html.element Js.t -> ?extraclass:string -> string -> unit

val div_class : ?extraclass:string -> string -> Dom_html.element Js.t

val first_of : 'a option list -> 'a option

val dir_right : Types.direction -> Types.direction

val queue_find : ('a -> bool) -> 'a Queue.t -> 'a option

val text_div : ?cls: string -> string -> Dom_html.element Js.t

val on_click : #Dom_html.eventTarget Js.t -> (unit -> unit) -> unit

val on_mousedown : #Dom_html.eventTarget Js.t -> (unit -> unit) -> unit
val on_mouseup : #Dom_html.eventTarget Js.t -> (unit -> unit) -> unit
val on_keyup : #Dom_html.eventTarget Js.t -> (unit -> unit) -> unit
val on_keydown : #Dom_html.eventTarget Js.t -> (unit -> unit) -> unit

val array_find : ('a -> bool) -> 'a array -> 'a option
