#!/usr/bin/env python3
"""
Проверка монтажа готового MP4 по правилам монтажа (docs/03-montage-rules.md):

  1. ТЕМП:      любые два кадра на расстоянии --max-shot (по умолчанию 8 с) должны отличаться — SSIM < 0.90.
                (то есть картинка заметно меняется не реже, чем раз в 8 секунд)
  2. ДЛИНА ПЛАНА: ни один план (между склейками) не длиннее --max-shot (+0.5 с — погрешность поиска склейки).
  3. УНИКАЛЬНОСТЬ: любые два плана ролика похожи не более чем на 90 % (SSIM ≤ 0.90),
                в том числе не соседние (нельзя вернуться к тому же кадру).

SSIM считается по уменьшенным серым кадрам (192×108) — так зерно и мелкий шум не влияют.
Использование:
  python3 scripts/qc_shots.py out/snow-leopard.mp4           # отчёт в out/snow-leopard.qc.json
  python3 scripts/qc_shots.py out/x.mp4 --max-shot 8 --ssim 0.90
Код выхода 1, если есть нарушения.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

W, H = 192, 108


def read_frames(path: str, fps: float) -> np.ndarray:
    cmd = [
        'ffmpeg', '-v', 'error', '-i', path,
        '-vf', f'fps={fps},scale={W}:{H}:flags=area,format=gray',
        '-f', 'rawvideo', '-',
    ]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.float64)


def _box(img: np.ndarray, r: int) -> np.ndarray:
    """Среднее по окну (2r+1)² через интегральное изображение."""
    k = 2 * r + 1
    pad = np.pad(img, r, mode='reflect')
    c = pad.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    return s / (k * k)


def ssim(a: np.ndarray, b: np.ndarray, r: int = 3) -> float:
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mu_a, mu_b = _box(a, r), _box(b, r)
    va = _box(a * a, r) - mu_a ** 2
    vb = _box(b * b, r) - mu_b ** 2
    cov = _box(a * b, r) - mu_a * mu_b
    m = ((2 * mu_a * mu_b + c1) * (2 * cov + c2)) / ((mu_a ** 2 + mu_b ** 2 + c1) * (va + vb + c2))
    return float(m.mean())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--fps', type=float, default=4.0, help='частота анализа, кадров/с')
    ap.add_argument('--max-shot', type=float, default=8.0, help='макс. длина плана, с')
    ap.add_argument('--tolerance', type=float, default=0.5, help='допуск: погрешность определения склейки (шаг анализа 0.25 с + наплыв до 0.5 с)')
    ap.add_argument('--ssim', type=float, default=0.90, help='порог сходства')
    ap.add_argument('--cut', type=float, default=0.6, help='SSIM кадров через 1 с ниже этого = склейка')
    ap.add_argument('--skip-edges', type=float, default=0.75, help='не проверять первые/последние N с (затемнения)')
    args = ap.parse_args()

    f = read_frames(args.video, args.fps)
    n = len(f)
    dt = 1.0 / args.fps
    t = np.arange(n) * dt
    dark = f.mean(axis=(1, 2)) < 12  # почти чёрные кадры (затемнения) не считаем
    lo, hi = int(args.skip_edges / dt), n - int(args.skip_edges / dt)

    # 1. Темп: кадр t против кадра t+max_shot
    step = int(round(args.max_shot / dt))
    pace = []
    for i in range(lo, max(lo, hi - step)):
        j = i + step
        if dark[i] or dark[j]:
            continue
        s = ssim(f[i], f[j])
        if s >= args.ssim:
            pace.append({'from_s': round(t[i], 2), 'to_s': round(t[j], 2), 'ssim': round(s, 3)})

    # 2. Склейки и длина планов
    # Склейки: сравниваем кадры через 1 с (захватывает и резкие склейки, и наплывы до 0.5 с).
    # Склейка ставится в точку наибольшего изменения внутри участка, где SSIM < порога.
    lag = max(1, int(round(1.0 / dt)))
    adj = [ssim(f[i], f[i + lag]) for i in range(n - lag)]
    # Склейка = локальный минимум сходства ниже порога (±2 отсчёта). Так быстрый футаж, у которого
    # сходство «внутри плана» тоже низкое, не склеивает соседние склейки в одну.
    cut_idx = [
        i for i, s in enumerate(adj)
        if s < args.cut and s <= min(adj[max(0, i - 2):i + 3])
    ]
    cut_times = [round(t[i] + 0.5 * lag * dt, 2) for i in cut_idx]
    cuts = [0.0] + cut_times + [round(t[-1] + dt, 2)]
    merged = [cuts[0]]
    for c in cuts[1:]:
        if c - merged[-1] >= 0.75:
            merged.append(c)
    shots = [{'start_s': a, 'end_s': b, 'len_s': round(b - a, 2)} for a, b in zip(merged[:-1], merged[1:])]
    long_shots = [s for s in shots if s['len_s'] > args.max_shot + args.tolerance
                  and not (s['start_s'] < args.skip_edges or s['end_s'] > t[-1] - args.skip_edges and s['len_s'] < args.max_shot + 1)]

    # 3. Уникальность планов: средний кадр каждого плана против всех остальных
    reps = []
    for s in shots:
        i = int(((s['start_s'] + s['end_s']) / 2) / dt)
        i = min(max(i, 0), n - 1)
        if not dark[i]:
            reps.append((s, i))
    dup = []
    for x in range(len(reps)):
        for y in range(x + 1, len(reps)):
            s = ssim(f[reps[x][1]], f[reps[y][1]])
            if s > args.ssim:
                dup.append({'shot_a_s': reps[x][0]['start_s'], 'shot_b_s': reps[y][0]['start_s'], 'ssim': round(s, 3)})

    report = {
        'video': args.video,
        'rules': {'max_shot_s': args.max_shot, 'max_ssim': args.ssim},
        'duration_s': round(n * dt, 2),
        'shots': len(shots),
        'avg_shot_s': round(float(np.mean([s['len_s'] for s in shots])), 2) if shots else 0,
        'violations': {
            'pace_4s_similar': pace,
            'shots_too_long': long_shots,
            'shots_too_similar': dup,
        },
        'shot_list': shots,
    }
    ok = not (pace or long_shots or dup)
    report['pass'] = ok
    out = Path(args.video).with_suffix('.qc.json')
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))

    print(f"Планов: {len(shots)}, средняя длина {report['avg_shot_s']} с")
    print(f"  темп (кадры через max-shot похожи ≥ {args.ssim}): {len(pace)} нарушений")
    print(f"  планы длиннее {args.max_shot} с: {len(long_shots)}")
    print(f"  похожие планы (SSIM > {args.ssim}): {len(dup)}")
    print(('✅ QC пройден' if ok else '❌ QC не пройден') + f' — отчёт: {out}')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
