# Remotion-проект

| Команда | Что делает |
|---|---|
| `npm run studio` | предпросмотр с таймлайном |
| `npm run typecheck` | проверка типов |
| `python3 scripts/tts.py voice.txt voice.wav --voice <голос>` | озвучка главы (Gemini TTS) |
| `python3 scripts/tts.py --compare "<фраза>" out/voices/` | пробы мужских голосов |
| `python3 scripts/transcribe.py voice.wav` | тайминги слов (WhisperX, `requirements-captions.txt`) |
| `scripts/stills.sh <Composition> 60 300` | контрольные кадры → `out/stills/` |
| `scripts/render.sh <Composition> <имя>` | рендер + мастеринг −14 LUFS + QC → `out/<имя>.mp4` |
| `scripts/remix.sh <Composition> <имя>` | заменить только звук готовой главы (музыка, звуки) — ~2 мин вместо полного рендера |
| `scripts/join.sh <имя> out/a.mp4 out/b.mp4 …` | склейка глав в один ролик |

Структура кода — в [../docs/04-tools.md](../docs/04-tools.md). Материалы проектов — `public/projects/` (не в git),
демо-заглушки — `public/example/`.
