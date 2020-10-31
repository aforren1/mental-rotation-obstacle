import numpy as np
import cairo
import matplotlib.pyplot as plt
import itertools as it
import csv

import cv2
from pprint import pformat
vis = False
"""
Generating a block:

1. Specify vertices of barrier (assume (0, 0) is center and 
     (800, 800) are screen dims)

e.g. a 100x100 square in the middle would be 
[(-50, -50), (50, -50), (50, 50), (-50, 50)]

2. Load images of letters (TODO: load directly from ttf/otf?)

3. 

"""

obstacle_verts = [(0, -50), (-50, 50), (50, 50)]

dim = 800
d2 = dim//2
obstacle_data = np.zeros((dim, dim), dtype='u1')
letter_data = np.zeros_like(obstacle_data)

surf_o = cairo.ImageSurface.create_for_data(obstacle_data, cairo.FORMAT_A8,
                                            *obstacle_data.shape)
surf_l = cairo.ImageSurface.create_for_data(letter_data, cairo.FORMAT_A8,
                                            *letter_data.shape)

co = cairo.Context(surf_o)
cl = cairo.Context(surf_l)

co.set_antialias(cairo.ANTIALIAS_NONE)
cl.set_antialias(cairo.ANTIALIAS_NONE)

letters = {}
letters['f'] = cairo.ImageSurface.create_from_png('src/assets/f.png')
letters['r'] = cairo.ImageSurface.create_from_png('src/assets/r.png')
letter_wid = letters['f'].get_width()
letter_hei = letters['f'].get_height()
# clear to black
co.set_source_rgb(0.0, 0.0, 0.0)
cl.set_source_rgb(0.0, 0.0, 0.0)

# set up the obstacle
co.save()  # save default orientation
co.translate(d2, d2)
co.move_to(*obstacle_verts[0])
for vert in obstacle_verts[1:]:
    co.line_to(*vert)
co.close_path()
co.fill()
# co.stroke()
co.restore()  # restore default orientation

# plt.imshow(obstacle_data, origin='upper')
# plt.show()
# now iterate through all possible orientations, by 1deg
letter_angles = np.radians(np.arange(-90, 91, 1))
# position relative to center
# radii = np.arange(75, 126, 25)  # in pixels
radii = [60, 80, 100]
circle_angles = np.arange(0, 2 * np.pi, np.pi / 16)
flips = [True, False]

output = []
if vis:
    plt.show(block=False)

cl.set_font_size(20)

prods = list(it.product(radii, circle_angles, letters, flips))

writer = cv2.VideoWriter('opts.mp4',
                         cv2.VideoWriter_fourcc(*'mp4v'),
                         60, (800, 800), False)
for radius, circle_angle, letter, flip in prods:
    for letter_angle in letter_angles:

        letter_data[:] = 0
        cl.save()
        cl.translate(d2, d2)  # move to center

        x2 = radius * np.cos(circle_angle)
        y2 = radius * np.sin(circle_angle)

        cl.translate(x2, y2)
        cl.rotate(letter_angle)
        if flip:
            cl.scale(-1.0, 1.0)
        cl.translate(-letter_wid / 2, -letter_hei / 2)

        cl.set_source_surface(letters[letter], 0, 0)

        cl.paint()
        intersect = np.sum((letter_data > 0) & (obstacle_data > 0))
        foo = {'radius': radius,
               'circle_angle': np.degrees(circle_angle),
               'letter_angle': np.degrees(letter_angle),
               'letter': letter,
               'flip': int(flip),
               'pix_intersect': intersect,
               }
        cl.restore()
        cl.move_to(50, 50)
        for count, k in enumerate(foo):
            try:
                st = f'{k}: {foo[k]:.2f}'
            except ValueError:
                st = f'{k}: {foo[k]}'
            cl.show_text(st)
            cl.move_to(50, 50)
            cl.rel_move_to(0, 30 * (count + 1))
        either_or = (letter_data > 0) | (obstacle_data > 0)
        writer.write(either_or.astype('uint8') * 255)
        if vis:
            plt.imshow(either_or, origin='upper')
            # plt.show(block=False)
            plt.pause(0.02)
            plt.clf()

        output.append(foo)

print(len(output))

with open('out.csv', 'w', newline='') as f:
    dw = csv.DictWriter(f, fieldnames=output[0].keys())
    dw.writeheader()
    dw.writerows(output)
