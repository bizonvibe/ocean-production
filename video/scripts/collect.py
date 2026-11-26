#!/usr/bin/env python3
"""
Собирает материалы главы из трёх репозиториев-источников в public/projects/<проект>/chNN/:

  stock/  ← ocean-stocks-video/<папка>/<NN …>/   (видео, фото, LICENSES.txt)
  anim/   ← ocean-animations/<папка>/<NN_…>/     (README с ТЗ, scenes.json, scene-*/layers/*.svg)
  music/  ← ocean-music-sounds/<папка>/<NN …>/   (трек + «Подбор и лицензия.txt»)

  python3 scripts/collect.py sperm-whale 01
  SOURCES_DIR=/путь/к/клонам python3 scripts/collect.py sperm-whale 01

Соответствие папок — ../projects.json. Клоны репозиториев ищутся в SOURCES_DIR (по умолчанию /home/user).
Стоки .ogv/.gif перекодируются в .mp4 (Remotion/Chromium читает их ненадёжно).
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPOS = {'stocks': 'ocean-stocks-video', 'animations': 'ocean-animations', 'music': 'ocean-music-sounds'}
TARGET = {'stocks': 'stock', 'animations': 'anim', 'music': 'music'}


def chapter_dir(base: Path, nn: str) -> Path | None:
    for d in sorted(base.iterdir()) if base.is_dir() else []:
        if d.is_dir() and (d.name.startswith(nn + ' ') or d.name.startswith(nn + '_')):
            return d
    return None


def main() -> int:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    project, nn = sys.argv[1], sys.argv[2].zfill(2)
    cfg = json.loads((ROOT / 'projects.json').read_text())[project]
    src_root = Path(os.environ.get('SOURCES_DIR', '/home/user'))
    out = ROOT / 'video/public/projects' / project / f'ch{nn}'
    for kind, repo in REPOS.items():
        base = src_root / repo / cfg[kind]
        d = chapter_dir(base, nn)
        dst = out / TARGET[kind]
        if d is None:
            print(f'⚠️  {kind}: нет папки главы {nn} в {base}')
            continue
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(d, dst)
        print(f'{kind}: {d} → {dst}')
    # Перекодирование форматов, которые Chromium не играет надёжно.
    for f in list((out / 'stock').glob('*')) if (out / 'stock').exists() else []:
        if f.suffix.lower() in ('.ogv', '.gif', '.webm', '.mov'):
            mp4 = f.with_suffix('.mp4')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(f), '-c:v', 'libx264', '-crf', '18',
                            '-pix_fmt', 'yuv420p', '-an', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', str(mp4)], check=True)
            print(f'  перекодировано: {f.name} → {mp4.name}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
