type position = float * float

type direction = U | D | L | R

type player = unit (* not yet implemented *)

type tile_event =
  | Arrow of direction
  | Wall
  | Sink of player
