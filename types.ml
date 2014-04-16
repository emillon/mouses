type position = float * float

type direction = U | D | L | R

type player =
  | P1
  | P2

type tile_event =
  | Arrow of direction
  | Wall
  | Sink of player
