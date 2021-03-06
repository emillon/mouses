open Tools
open Types

class ['game] spawner parent ipos (dir:direction) =
  let dom = div_class "spawner" in
  let (x, y) = ipos in
  let pos = (float x, float y) in
  let _ = style_pos dom pos in
  let _ = Dom.appendChild parent dom in
object
  val mutable active = false

  method anim (g:'game) =
    let f () =
      if active then
        let is_cat =
          Random.float 1.0 < 0.05
        in
        g#add_mouse ~is_cat ipos dir
    in
    g#every_nth_frame 10 f

  method activate =
    active <- true

  method deactivate =
    active <- false
end
