#!/usr/bin/env python3
"""생성된 원본 PNG(스크래치패드) → 정사각 640px JPEG 로 img/ 에 넣기. 사용: python3 rebuild/import_images.py <원본디렉토리> [...]"""
import sys, pathlib
from PIL import Image, ImageOps
ROOT = pathlib.Path(__file__).resolve().parent.parent; OUT = ROOT / 'img'; OUT.mkdir(exist_ok=True)
n = 0
for d in sys.argv[1:]:
    for src in sorted(pathlib.Path(d).glob('*.png')):
        dst = OUT / (src.stem + '.jpg')
        if dst.exists() and dst.stat().st_mtime > src.stat().st_mtime: continue
        im = Image.open(src).convert('RGB'); im = ImageOps.fit(im, (640, 640), Image.LANCZOS, centering=(0.5, 0.5))
        im.save(dst, 'JPEG', quality=85, optimize=True, progressive=True); n += 1
        print(f'{src.name} -> {dst.name} {dst.stat().st_size//1024}KB')
print('imported', n)
