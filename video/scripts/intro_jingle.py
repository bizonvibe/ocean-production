#!/usr/bin/env python3
"""
Игривый джингл заставки (3 с): маримба-арпеджио вверх, «бульки» пузырей, щелчки клешней, финальный аккорд.
  python3 scripts/intro_jingle.py public/sfx/intro-jingle.wav
Тайминги совпадают с анимацией src/intro/ChannelIntro.tsx (30 fps).
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 3.2
t = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t)


def note(at, freq, dur=0.45, amp=0.35, bright=1.0):
    """Маримба: основной тон + 4-я гармоника, быстрый спад."""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    env = np.exp(-tt * 9) * (1 - np.exp(-tt * 400))
    sig = np.sin(2 * np.pi * freq * tt) + 0.35 * bright * np.sin(2 * np.pi * freq * 4 * tt) * np.exp(-tt * 25)
    i = int(SR * at)
    out[i:i + n] += amp * env * sig[: len(out[i:i + n])]


def bloop(at, f0=300, f1=900, dur=0.09, amp=0.25):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    freq = f0 + (f1 - f0) * tt / dur
    sig = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.sin(np.pi * tt / dur)
    i = int(SR * at)
    out[i:i + n] += amp * sig[: len(out[i:i + n])]


def snap(at, amp=0.5):
    n = int(SR * 0.04)
    rng = np.random.default_rng(int(at * 1000))
    sig = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 160)
    i = int(SR * at)
    out[i:i + n] += amp * sig[: len(out[i:i + n])]


# Пузыри в начале.
rng = np.random.default_rng(7)
for k in range(12):
    bloop(0.02 + k * 0.03 + rng.random() * 0.02, 250 + rng.random() * 300, 700 + rng.random() * 600, amp=0.12)
# Прыжок краба — «пружинка» вверх.
bloop(0.22, 200, 1200, dur=0.25, amp=0.3)
# Щелчки клешней (кадры 24 и 30).
snap(0.80); snap(1.00)
# Арпеджио на появление букв (C-мажорная пентатоника вверх).
for k, f in enumerate([523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5, 1568.0, 1760.0]):
    note(1.10 + k * 0.08, f, amp=0.28)
# Подпись — лёгкий «дзынь».
note(1.95, 2093.0, dur=0.6, amp=0.15, bright=0.5)
# Финальный аккорд и «боинг» диафрагмы.
for f in (523.25, 659.25, 783.99, 1046.5):
    note(2.55, f, dur=0.65, amp=0.22)
bloop(2.80, 600, 150, dur=0.25, amp=0.3)
# Лёгкий бас-пульс для энергии.
for k in range(6):
    note(0.2 + k * 0.5, 130.81 if k % 2 == 0 else 196.0, dur=0.3, amp=0.25, bright=0.2)

out /= max(1e-9, np.abs(out).max()) / 0.9
fade = np.minimum(1, (len(out) - np.arange(len(out))) / (SR * 0.15))
out *= fade
pcm = (out * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(stereo.tobytes())
print('Джингл:', sys.argv[1])
