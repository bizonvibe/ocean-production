#!/usr/bin/env python3
"""
Озвучка главы через Gemini TTS (Google AI Studio).

  python3 scripts/tts.py <текст.txt> public/projects/<проект>/chNN/voice.wav
  python3 scripts/tts.py --text "Короткая проба" out/voice-test.wav --voice Orus
  python3 scripts/tts.py --compare "Проба голоса" out/voices/   # пробы нескольких мужских голосов

Результат: WAV 48 кГц моно + рядом voice.json с длительностью ({"durationMs": ...}) — её вписывают
в конфиг главы (voiceover.durationMs). Затем тайминги слов: scripts/transcribe.py voice.wav.

Текст разбивается на абзацы (по пустой строке); каждый озвучивается отдельным запросом,
между абзацами вставляется пауза --gap (с). Так длинные главы не упираются в лимит модели,
а паузы между мыслями получаются ровными.

Ключ API: в облачной среде его подставляет прокси (network secret окружения для хоста
generativelanguage.googleapis.com, заголовок x-goog-api-key). Локально — переменная GEMINI_API_KEY.
В код, конфиги и чат ключ не пишем.
"""
import argparse
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
DEFAULT_MODEL = 'gemini-2.5-pro-preview-tts'
DEFAULT_VOICE = 'Charon'
# Мужские голоса Gemini TTS, подходящие для спокойного документального диктора.
MALE_CANDIDATES = ['Charon', 'Orus', 'Iapetus', 'Algenib', 'Gacrux', 'Sadaltager', 'Schedar']
STYLE = (
    'Прочитай по-русски как диктор документального фильма: низкий спокойный мужской голос, '
    'размеренный темп, естественные паузы, без театральности и без восторженных интонаций. '
    'Текст:\n'
)


def synth(text: str, voice: str, model: str, style: str) -> bytes:
    """Один запрос → сырые PCM s16le 24 кГц моно."""
    body = {
        'contents': [{'parts': [{'text': style + text}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}},
        },
    }
    # В облаке прокси заменяет значение ключа настоящим; локально берём из окружения.
    key = os.environ.get('GEMINI_API_KEY', 'injected-by-proxy')
    req = urllib.request.Request(
        API.format(model=model),
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': key},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:500]
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(5 * 2 ** attempt)
                continue
            sys.exit(f'Gemini TTS: HTTP {e.code}: {msg}')
    parts = data['candidates'][0]['content']['parts']
    return b''.join(base64.b64decode(p['inlineData']['data']) for p in parts if 'inlineData' in p)


def to_wav(pcm_chunks: list[bytes], gap_s: float, out: Path) -> float:
    """Склеивает куски PCM с паузами и пишет WAV 48 кГц; возвращает длительность в секундах."""
    silence = b'\x00\x00' * int(24000 * gap_s)
    raw = silence.join(pcm_chunks)
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.pcm') as tmp:
        tmp.write(raw)
        tmp.flush()
        subprocess.run(
            ['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tmp.name,
             '-af', 'highpass=f=60', '-ar', '48000', '-ac', '1', str(out)],
            check=True,
        )
    dur = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    return float(dur)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('input', nargs='?', help='файл с текстом диктора')
    ap.add_argument('out', help='выходной .wav (для --compare — папка)')
    ap.add_argument('--text', help='текст прямо в аргументе вместо файла')
    ap.add_argument('--voice', default=DEFAULT_VOICE)
    ap.add_argument('--model', default=DEFAULT_MODEL)
    ap.add_argument('--gap', type=float, default=0.6, help='пауза между абзацами, с')
    ap.add_argument('--style', default=STYLE, help='инструкция для голоса перед текстом')
    ap.add_argument('--compare', metavar='TEXT', help='озвучить TEXT всеми голосами из MALE_CANDIDATES')
    a = ap.parse_args()

    if a.compare:
        outdir = Path(a.out)
        for v in MALE_CANDIDATES:
            d = to_wav([synth(a.compare, v, a.model, a.style)], 0, outdir / f'{v}.wav')
            print(f'{v}: {d:.1f} с → {outdir / (v + ".wav")}')
        return 0

    text = a.text if a.text else Path(a.input).read_text(encoding='utf-8')
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if not paragraphs:
        sys.exit('Пустой текст')
    chunks = []
    for i, p in enumerate(paragraphs, 1):
        print(f'Абзац {i}/{len(paragraphs)}…', flush=True)
        chunks.append(synth(p, a.voice, a.model, a.style))
    out = Path(a.out)
    dur = to_wav(chunks, a.gap, out)
    meta = {'durationMs': round(dur * 1000), 'voice': a.voice, 'model': a.model, 'paragraphs': len(paragraphs)}
    out.with_suffix('.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    print(f'Готово: {out} ({dur:.2f} с), метаданные → {out.with_suffix(".json")}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
