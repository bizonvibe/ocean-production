#!/usr/bin/env python3
"""
Озвучка → субтитры по словам (WhisperX: распознавание + выравнивание по словам до ~10–50 мс).

  python3 scripts/transcribe.py public/audio/voice.wav --lang ru
  → public/audio/voice.captions.json в формате Caption[] из @remotion/captions:
    [{"text": " Слово", "startMs": 120, "endMs": 480, "timestampMs": 300, "confidence": 0.93}, ...]

Подключение в ролике: skill `remotion-captions` (createTikTokStyleCaptions + подсветка текущего слова).
Нам текст озвучки известен заранее (сценарий) — WhisperX нужен ради точных таймингов слов.

Установка (тяжёлая, ставим только когда есть озвучка): pip install -r requirements-captions.txt
На CPU работает медленно (≈ 1–3× длительности аудио для модели small), для минутных роликов приемлемо.
"""
import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('--lang', default='ru')
    ap.add_argument('--model', default='small', help='tiny/base/small/medium/large-v3 (больше — точнее и медленнее)')
    ap.add_argument('--device', default='cpu')
    ap.add_argument('--out')
    a = ap.parse_args()
    try:
        import whisperx  # noqa: WPS433
    except ImportError:
        sys.exit('Нужен WhisperX: pip install -r requirements-captions.txt')

    compute = 'int8' if a.device == 'cpu' else 'float16'
    model = whisperx.load_model(a.model, a.device, compute_type=compute, language=a.lang)
    audio = whisperx.load_audio(a.audio)
    result = model.transcribe(audio, batch_size=8, language=a.lang)
    align_model, meta = whisperx.load_align_model(language_code=a.lang, device=a.device)
    aligned = whisperx.align(result['segments'], align_model, meta, audio, a.device, return_char_alignments=False)

    captions = []
    for seg in aligned['segments']:
        for w in seg.get('words', []):
            if 'start' not in w:  # слова без выравнивания (числа и т. п.) — берём границы сегмента
                continue
            s, e = int(w['start'] * 1000), int(w['end'] * 1000)
            captions.append({
                'text': ' ' + w['word'].strip(), 'startMs': s, 'endMs': e,
                'timestampMs': (s + e) // 2, 'confidence': round(float(w.get('score', 0)), 3),
            })
    out = Path(a.out or Path(a.audio).with_suffix('.captions.json'))
    out.write_text(json.dumps(captions, ensure_ascii=False, indent=1))
    print(f'Слов: {len(captions)} → {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
