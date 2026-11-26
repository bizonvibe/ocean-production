#!/usr/bin/env python3
"""
Паузы (тишина) в озвучке — для безопасных разрезов при вставке драматических пауз.

  python3 scripts/silences.py public/projects/<проект>/chNN/voice.wav src/chapters/<проект>/chNN/voice.silences.json

Результат: [[начало_мс, конец_мс], ...] — участки тише --db дольше --min секунд (FFmpeg silencedetect).
Разрез озвучки ставится только в середину такой паузы, тайминги слов WhisperX — лишь ориентир.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('out')
    ap.add_argument('--db', type=float, default=-40, help='порог тишины, дБ')
    ap.add_argument('--min', type=float, default=0.15, help='минимальная длина паузы, с')
    a = ap.parse_args()
    log = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', a.audio, '-af', f'silencedetect=n={a.db}dB:d={a.min}', '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', log)]
    out = [[round(s * 1000), round(e * 1000)] for s, e in zip(starts, ends)]
    Path(a.out).write_text(json.dumps(out))
    print(f'Пауз: {len(out)} → {a.out}')


if __name__ == '__main__':
    main()
