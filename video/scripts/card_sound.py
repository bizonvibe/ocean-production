#!/usr/bin/env python3
"""
Звук слайда главы (3 с): «вжух», пинг сонара, мягкий низкий удар: пинг сонара, «вжухи» на быстрых склейках,
нарастающий райзер, мощный удар на логотипе, хвост из низкого гула.
  python3 scripts/card_sound.py public/sfx/chapter-card.wav
Тайминги совпадают с анимацией src/intro/ChapterCard.tsx (30 fps).
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 3.0
N = int(SR * DUR)
out = np.zeros(N)
rng = np.random.default_rng(3)


def add(at, sig):
    i = int(SR * at)
    out[i:i + len(sig)] += sig[: max(0, N - i)]


def tt(d):
    return np.arange(int(SR * d)) / SR


def lowpass(x, a):
    """Однополюсный НЧ-фильтр; a — число или массив (меняющаяся во времени частота среза)."""
    a = np.broadcast_to(np.asarray(a, dtype=float), x.shape)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = y[i - 1] + a[i] * (x[i] - y[i - 1])
    return y


def ping(at, f=1450, amp=0.35):
    t = tt(1.2)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 7)
    # «подводное» эхо
    e = np.zeros_like(s); d = int(SR * 0.18)
    e[d:] = 0.4 * s[:-d]
    add(at, amp * (s + e))


def whoosh(at, d=0.35, amp=0.3):
    t = tt(d)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi * t / d) ** 2
    add(at, amp * lowpass(n, 0.25) * env)


def boom(at, amp=0.9):
    t = tt(1.8)
    f = 70 * np.exp(-t * 3) + 38
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    click = rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.6
    add(at, amp * (s + lowpass(click, 0.4)))


def riser(at, d=1.1, amp=0.25):
    t = tt(d)
    n = lowpass(rng.standard_normal(len(t)), 0.05 + 0.5 * (t / d))
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * 0.3
    add(at, amp * (n + tone) * (t / d) ** 2)


def drone(at, d, amp=0.25):
    t = tt(d)
    s = np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t) + 0.25 * np.sin(2 * np.pi * 110 * t)
    env = np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.8)
    add(at, amp * s * env)



whoosh(0.05, 0.45, 0.35)
ping(0.25, f=1300, amp=0.3)
t = tt(1.5)
add(0.28, 0.35 * np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 2) + 40) / SR) * np.exp(-t * 2.5))
drone(0.0, 3.0, amp=0.12)
out /= max(1e-9, np.abs(out).max()) / 0.92
out *= np.minimum(1, (N - np.arange(N)) / (SR * 0.25))
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print('Звук слайда:', sys.argv[1])
