# 05. Ключи API

Ключи **никогда** не пишем в код, `.env`, конфиги и чат.

Монтаж идёт в облачной сессии Claude Code, а не в GitHub Actions, поэтому **GitHub Secrets сессии недоступны**.
Ключ сохраняется как network secret облачного окружения: агент показывает защищённую форму
(или пользователь сам: меню окружения → Edit → Network secrets). Прокси подставляет ключ в запросы к нужному хосту;
агент значение ключа не видит.

| Сервис | Для чего | Где взять | Как передаётся |
|---|---|---|---|
| **Gemini API** (Google AI Studio) | озвучка (Gemini TTS) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | заголовок `x-goog-api-key`, хост `generativelanguage.googleapis.com` |

Локально (не в облаке) `scripts/tts.py` берёт ключ из переменной `GEMINI_API_KEY`.
