open Tools
open Types

class ['game] spawner parent ipos (dir:direction) =
  let dom = div_class "spawner" in
  let (x, y) = ipos in
  let pos = (float x, float y) in
  let _ = style_pos dom pos in
  let _ = Dom.appendChild parent dom in
object
  method anim (g:'game) =
    let f () =
      g#add_mouse pos dir
    in
    g#every_nth_frame 10 f
end
