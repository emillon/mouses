type position = float * float

type direction = U | D | L | R

type player =
  | P1
  | P2

type ('sink, 'arrow) tile =
  | Sink of 'sink
  | Arrow of 'arrow
  | Wall
