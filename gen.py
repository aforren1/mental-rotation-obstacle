# assume 800x800 px workspace
# draw the barrier surface,
# the letter surface,
# then calc the intersection of the two
import numpy as np
import cairo
import matplotlib.pyplot as plt

data = np.zeros((800, 800), dtype=np.uint8)

surf = cairo.ImageSurface.create_for_data(data, cairo.FORMAT_A8, *data.shape)
cr = cairo.Context(surf)
cr.set_antialias(cairo.ANTIALIAS_NONE)  # disable antialiasing for shapes

# try using actual font
cr.select_font_face('Instruction', cairo.FONT_SLANT_NORMAL,
                    cairo.FONT_WEIGHT_NORMAL)
cr.set_font_size(128)
# these are 43 x 64
letter_f = cairo.ImageSurface.create_from_png('src/assets/f.png')
letter_r = cairo.ImageSurface.create_from_png('src/assets/r.png')
letter_wid = letter_f.get_width()
letter_hei = letter_f.get_height()
# clear to black
cr.set_source_rgb(0.0, 0.0, 0.0)
# cr.paint()
cr.save()
cr.translate(400, 400)
cr.translate(100, 0)
cr.show_text('F')
cr.translate(-100, 0)

#cr.arc(0, 0, 80, 0, 2*np.pi)
# cr.set_line_width(1)
#
cr.move_to(0, -50)
cr.line_to(-50, 50)
cr.line_to(50, 50)
cr.close_path()
cr.stroke()

# draw the F in a random place
cr.set_source_surface(letter_f, 200, 200)
cr.paint()

# draw the letter at some distance from the center
radius = 20  # pix
angle = 0  # degrees
x2 = radius * np.cos(np.radians(angle))
y2 = radius * np.sin(np.radians(angle))

cr.translate(x2, y2)  # move to position on circle
cr.scale(1.5625, 1.5625)

# rotate letter around center in-place
cr.rotate(np.radians(30))
cr.translate(-letter_wid / 2, -letter_hei / 2)
cr.set_source_surface(letter_r, 0, 0)
#cairo.Pattern.set_filter(cr.get_source(), cairo.FILTER_NEAREST)
cr.paint()
cr.restore()
plt.imshow(data > 0, origin='upper')
plt.show()

data[:] = 0
cr.translate(400, 400)
cr.move_to(0, 0)
cr.line_to(0, 200)
cr.line_to(50, 100)
cr.close_path()
cr.fill()

plt.imshow(data, origin='upper')
plt.show()
