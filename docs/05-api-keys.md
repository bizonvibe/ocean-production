# 05. Ключи API

Ключи **никогда** не пишем в код, `.env`, конфиги и чат.

## Озвучка — через GitHub Actions
Ключи Google AI Studio лежат в **GitHub Secrets** репозитория Ocean Production:
`GEMINI_API_KEY` (основной) и `GEMINI_API_KEY_2` (запасной: используется, когда основной упёрся в квоту).
Облачная сессия Claude Code секреты GitHub не видит, поэтому озвучку делает workflow
[`.github/workflows/tts.yml`](../.github/workflows/tts.yml):

1. Агент кладёт текст диктора в `voiceover/<проект>/<NN>/voice.txt` и пушит в основную ветку.
2. Запускает workflow «Озвучка (Gemini TTS)» (`mode: chapter`, `project`, `chapter`, `voice`) или пробы голосов (`mode: compare`).
3. Workflow коммитит результат в ветку `voice`: `voice/<проект>/<NN>/voice.wav` + `voice.json`.
4. Агент забирает файл: `git fetch origin voice && git show origin/voice:voice/<проект>/<NN>/voice.wav > …`.

| Сервис | Для чего | Где взять | Хост |
|---|---|---|---|
| **Gemini API** (Google AI Studio) | озвучка (Gemini TTS) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `generativelanguage.googleapis.com`, заголовок `x-goog-api-key` |

Локально `scripts/tts.py` берёт ключи из переменных `GEMINI_API_KEY` / `GEMINI_API_KEY_2`.
