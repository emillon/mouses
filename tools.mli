val js : string -> Js.js_string Js.t

val style_pos : Dom_html.element Js.t -> Types.position -> unit 

val dirclass : string -> Types.direction -> string

val set_class : Dom_html.element Js.t -> ?extraclass:string -> string -> unit

val div_class : ?extraclass:string -> string -> Dom_html.element Js.t

val first_of : 'a option list -> 'a option

val dir_right : Types.direction -> Types.direction