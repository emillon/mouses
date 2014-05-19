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

val list_iteri : (int -> 'a -> unit) -> 'a list -> unit

val fromto : int -> int -> int list

val list_find_opt : ('a -> 'b option) -> 'a list -> 'b option

val getbyid_unsafe : string -> Dom_html.element Js.t

val get_body : unit -> Dom_html.bodyElement Js.t

val pos_dir : (int * int) -> Types.direction -> (int * int)

val init_matrix : int -> int -> (int -> int -> 'a) -> 'a array array

val assoc_opt : 'a -> ('a * 'b) list -> 'b option

val array_findi : 'a array -> (int -> 'a -> 'b option) -> 'b option

val queue_delete : 'a Queue.t -> 'a -> unit

val matrix_size : 'a array array -> int * int

val logprintf : ('a, unit, string, unit) format4 -> 'a

val gamepad_of_event : Types.gp_event -> Types.gamepad_num

val gamepad_of_binding : Types.gp_binding -> Types.gamepad_num
