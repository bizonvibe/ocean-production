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
generativelanguage.googleapis.com, заголовок x-goog-api-key). Локально и в GitHub Actions — переменные GEMINI_API_KEY и GEMINI_API_KEY_2
(второй ключ используется, когда первый упёрся в квоту).
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
DEFAULT_MODEL = 'gemini-2.5-flash-preview-tts'  # у Pro на бесплатном тарифе лимит 0 запросов
DEFAULT_VOICE = 'Orus'
# Мужские голоса Gemini TTS, подходящие для спокойного документального диктора.
MALE_CANDIDATES = ['Charon', 'Orus', 'Iapetus', 'Algenib', 'Gacrux', 'Sadaltager', 'Schedar']
STYLE = (
    'Прочитай по-русски как диктор документального фильма: низкий спокойный мужской голос, '
    'размеренный темп, естественные паузы, без театральности и без восторженных интонаций. '
    'Текст:\n'
)


def _keys() -> list[str]:
    """Ключи по порядку: основной, запасной. В облаке Claude Code ключ подставляет прокси."""
    keys = [os.environ.get(k, '').strip() for k in ('GEMINI_API_KEY', 'GEMINI_API_KEY_2')]
    keys = [k for k in keys if k]
    return keys or ['injected-by-proxy']


def _post(url: str, body: dict, key: str) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': key},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)


def tts_models(key: str) -> list[str]:
    """Список моделей с поддержкой TTS (на случай, если модель по умолчанию переименовали)."""
    req = urllib.request.Request(
        'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', headers={'x-goog-api-key': key})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    return [m['name'].split('/')[-1] for m in data.get('models', []) if 'tts' in m['name']]


_model_override: str | None = None


def synth(text: str, voice: str, model: str, style: str) -> bytes:
    """Один запрос → сырые PCM s16le 24 кГц моно.
    Квота исчерпана (429) → следующий ключ; модель не найдена (404) → подбор доступной TTS-модели."""
    global _model_override
    body = {
        'contents': [{'parts': [{'text': style + text}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}},
        },
    }
    keys = _keys()
    ki = 0
    for attempt in range(8):
        m = _model_override or model
        try:
            data = _post(API.format(model=m), body, keys[ki])
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:500]
            if e.code == 429 and ki + 1 < len(keys):
                ki += 1
                print(f'  квота ключа {ki} исчерпана — переключаюсь на ключ {ki + 1}', flush=True)
                continue
            if e.code == 429 and 'limit: 0' in msg and 'flash' not in m:
                _model_override = DEFAULT_MODEL
                ki = 0
                print(f'  у {m} нет бесплатной квоты — перехожу на {DEFAULT_MODEL}', flush=True)
                continue
            if e.code == 404 and _model_override is None:
                avail = tts_models(keys[ki])
                print(f'  модель {m} не найдена; доступные TTS-модели: {avail}', flush=True)
                pro = [x for x in avail if 'pro' in x] or avail
                if not pro:
                    sys.exit('Нет доступных TTS-моделей')
                _model_override = pro[0]
                continue
            if e.code in (429, 500, 503) and attempt < 7:
                time.sleep(min(60, 5 * 2 ** attempt))
                continue
            sys.exit(f'Gemini TTS: HTTP {e.code}: {msg}')
    else:
        sys.exit('Gemini TTS: не удалось получить ответ')
    parts = data['candidates'][0]['content']['parts']
    pcm = b''.join(base64.b64decode(p['inlineData']['data']) for p in parts if 'inlineData' in p)
    if not pcm:
        sys.exit(f'Gemini TTS: в ответе нет аудио: {json.dumps(data, ensure_ascii=False)[:500]}')
    return pcm


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
    ap.add_argument('--gap', type=float, default=0.6, help='пауза между кусками текста, с')
    ap.add_argument('--max-chars', type=int, default=4000, help='макс. длина одного запроса, символов')
    ap.add_argument('--style', default=STYLE, help='инструкция для голоса перед текстом')
    ap.add_argument('--compare', metavar='TEXT', help='озвучить TEXT голосами из --voices (по умолчанию MALE_CANDIDATES)')
    ap.add_argument('--voices', help='список голосов через запятую для --compare')
    a = ap.parse_args()

    if a.compare:
        outdir = Path(a.out)
        outdir.mkdir(parents=True, exist_ok=True)
        for v in (a.voices.split(',') if a.voices else MALE_CANDIDATES):
            print(f'{v}…', flush=True)
            d = to_wav([synth(a.compare, v, a.model, a.style)], 0, outdir / f'{v}.wav')
            print(f'{v}: {d:.1f} с → {outdir / (v + ".wav")}')
        return 0

    text = a.text if a.text else Path(a.input).read_text(encoding='utf-8')
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if not paragraphs:
        sys.exit('Пустой текст')
    # Экономим квоту и держим ровную интонацию: абзацы объединяются в куски до --max-chars,
    # обычно вся глава уходит одним запросом (паузы между абзацами диктор делает сам).
    chunks_txt: list[str] = []
    for para in paragraphs:
        if chunks_txt and len(chunks_txt[-1]) + len(para) + 2 <= a.max_chars:
            chunks_txt[-1] += '\n\n' + para
        else:
            chunks_txt.append(para)
    paragraphs = chunks_txt
    chunks = []
    for i, p in enumerate(paragraphs, 1):
        print(f'Кусок {i}/{len(paragraphs)} ({len(p)} симв.)…', flush=True)
        chunks.append(synth(p, a.voice, a.model, a.style))
    out = Path(a.out)
    dur = to_wav(chunks, a.gap, out)
    meta = {'durationMs': round(dur * 1000), 'voice': a.voice, 'model': _model_override or a.model, 'paragraphs': len(paragraphs)}
    out.with_suffix('.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    print(f'Готово: {out} ({dur:.2f} с), метаданные → {out.with_suffix(".json")}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
