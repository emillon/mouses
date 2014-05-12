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

type control_device =
  | CD_Keyboard
  | CD_Gamepad

type gp_state =
  { gp_dir : direction option
  }
