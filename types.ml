type position = float * float

type direction = U | D | L | R

type player =
  | P1
  | P2

type ('sink, 'arrow) tile =
  | Sink of 'sink
  | Arrow of 'arrow
  | Spawner

type mouse_act =
  | MA_Sink of player
  | MA_Dir of direction

type action =
  | ActMove of direction
  | ActArrow of direction

type gp_state =
  { gp_ts : int
  ; gp_axes : float array
  ; gp_btns : Gamepad_types.gamepadButton array
  }

type gp_axe_dir =
  | GPA_Neg
  | GPA_Pos

type gamepad_num = int

type gp_event =
  | GP_Axis of gamepad_num * int * gp_axe_dir
  | GP_Btn of gamepad_num * int

type kbd_binding = (int * action) list

type gp_binding = (gp_event * action) list

type control_device =
  | CD_Keyboard of kbd_binding
  | CD_Gamepad of gp_binding
