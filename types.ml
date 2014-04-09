type position = float * float

type direction = U | D | L | R

type tile_event =
  | Arrow of direction
  | Wall
