open Types

class wall dom (pos:int*int) (dir:direction) = object
  val dom = dom
  val pos = pos
  val dir = dir

  method is_at x y dirq =
    pos = (x, y) && dir = dirq
end

