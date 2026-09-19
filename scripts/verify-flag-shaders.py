"""Compile actual GLSL ES 1.00 sources and render them with Mesa/EGL.
QA dependencies: moderngl==5.12.0 Pillow==12.3.0 numpy==2.5.3.
This exercises shaders, not browser lifecycle or mobile GPU performance.
"""
import base64
import io
import json
from pathlib import Path
import re
import time
import moderngl
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'packages/core/src/objects/flag-cloth.ts').read_text()
ctx = moderngl.create_standalone_context(backend='egl')
program = ctx.program(**{name + '_shader': '#version 100\n' + re.search(
    'const ' + name + r'=`(.*?)`;', source, re.S)[1] for name in ('vertex', 'fragment')})
vertices = np.array([(x / 64, y / 24) for y in range(25) for x in range(65)], dtype='f4')
indices = []
for y in range(24):
    for x in range(64):
        i = y * 65 + x
        indices.extend((i, i + 1, i + 65, i + 1, i + 66, i + 65))
vao = ctx.vertex_array(program, [(ctx.buffer(vertices.tobytes()), '2f', 'uv')],
    ctx.buffer(np.array(indices, dtype='u2').tobytes()), index_element_size=2)
asset = (ROOT / 'public/objects/flags-v1/fr.svg').read_text()
art = Image.open(io.BytesIO(base64.b64decode(re.search(r'base64,([^"\s]+)', asset)[1]))).convert('RGBA')
texture = ctx.texture(art.size, 4, art.tobytes())
texture.filter = (moderngl.LINEAR, moderngl.LINEAR)
texture.repeat_x = texture.repeat_y = False
texture.use()
for key, value in dict(artwork=0, wind=1., flatMode=0., ratio=art.width/art.height,
                       showArt=1., fabric=1., lighting=1.).items():
    program[key].value = value
out = ROOT / 'docs/previews/flags/render-check'
out.mkdir(exist_ok=True)
def render(t, drawn, size=384, flat=False):
    target = ctx.simple_framebuffer((size, size), components=4)
    target.use(); target.clear(0, 0, 0, 0)
    program['time'].value = t
    program['drawn'].value = float(drawn)
    program['flatMode'].value = float(flat)
    vao.render()
    result = Image.frombytes('RGBA', (size, size), target.read(components=4)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    target.release()
    return result
frames = [render(t, False) for t in (0., 2., 4., 6., 12.)]
assert np.abs(np.array(frames[0], dtype=float)-np.array(frames[-1], dtype=float)).mean() < .1, 'loop mismatch'
assert not np.array_equal(np.array(frames[0]), np.array(frames[1])), 'static renderer'
assert np.array(frames[0])[:, :, 3].min() == 0, 'lost transparency'
assert not np.array_equal(np.array(frames[0]), np.array(render(0., True))), 'styles identical'
assert np.array_equal(np.array(render(0., False, flat=True)), np.array(render(3., False, flat=True))), 'flat moved'
board = Image.new('RGB', (384*3, 414*2), '#f4f1e9')
pen = ImageDraw.Draw(board)
for row, drawn in enumerate((False, True)):
    for col, t in enumerate((0., 2., 4.)):
        im = render(t, drawn)
        board.paste(im, (384*col, 414*row+30), im)
        pen.text((384*col+15, 414*row+10), ('TISSU' if not drawn else 'DESSIN') + f' / {t}s', fill='#132333')
board.save(out / 'comparison.webp', quality=90)
# Proof uses rendered shader pixels; a browser DOM capture is still required.
proof=[]
for i in range(48):
    im=render(i/4,False,320)
    bg=Image.new('RGBA', im.size, '#0b1420');bg.alpha_composite(im)
    proof.append(bg.convert('RGB'))
proof[0].save(out/'cloth.webp',save_all=True,append_images=proof[1:],duration=250,loop=0,quality=82)
print(json.dumps({'renderer':ctx.info['GL_RENDERER'],'checks':5,'proofFrames':48,'resolution':320}))
