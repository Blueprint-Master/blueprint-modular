"""Assemble code-rendered scientific frames after render-science-library-evidence.tsx.
Requires Pillow and ffmpeg. Exported projection proof, not a browser recording.
"""
from pathlib import Path
from PIL import Image
import subprocess
root=Path(__file__).resolve().parents[1]
files=sorted((root/'.science-motion-frames').glob('*.png'))
assert len(files)==120
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','6','-i',str(root/'.science-motion-frames/%03d.png'),'-vf','fps=24,format=yuv420p','-c:v','libx264','-crf','25','-movflags','+faststart',str(root/'docs/previews/science/molecule-motion.mp4')],check=True)
sheet=Image.new('RGB',(1080,1600))
for row,index in enumerate([0,30,60,90]):
    with Image.open(files[index]) as im: sheet.paste(im,(0,row*400))
sheet.save(root/'docs/previews/science/molecule-motion-instants.png')
