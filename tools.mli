val js : string -> Js.js_string Js.t

val style_pos : Dom_html.element Js.t -> Types.position -> unit 

val dirclass : string -> Types.direction -> string

val set_class : Dom_html.element Js.t -> ?extraclass:string -> string -> unit

val div_class : ?extraclass:string -> string -> Dom_html.element Js.t

val first_of : 'a option list -> 'a option

val dir_right : Types.direction -> Types.direction

val queue_find : ('a -> bool) -> 'a Queue.t -> 'a option

val list_iteri : (int -> 'a -> unit) -> 'a list -> unit

val fromto : int -> int -> int list
