# Тексты диктора

`voiceover/<проект>/<NN>/voice.txt` — текст диктора главы (дословно из сценария), абзацы через пустую строку.
Озвучку делает GitHub Actions (`.github/workflows/tts.yml`, ключи `GEMINI_API_KEY`, `GEMINI_API_KEY_2` в Secrets)
и кладёт результат в ветку **`voice`**: `voice/<проект>/<NN>/voice.wav` + `voice.json` (длительность, голос, модель).
Пробы голосов — `voice/_samples/<номер запуска>/<Голос>.wav`.
