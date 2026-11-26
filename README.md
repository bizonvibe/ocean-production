# Ocean Production

Монтаж роликов по сценарию: каждая глава — отдельный ролик, после одобрения главы склеиваются в один.
Материалы (звук, анимации с ТЗ, стоки) лежат в трёх отдельных репозиториях; здесь — только инструменты и правила монтажа.

- [Правила](AGENTS.md) · [пайплайн](docs/01-pipeline.md) · [стиль](docs/02-style-guide.md) · [монтаж](docs/03-montage-rules.md)
- [Инструменты](docs/04-tools.md) · [ключи API](docs/05-api-keys.md) · [механика Remotion](docs/06-remotion-mechanics.md)
- [Remotion-проект и скрипты](video/) · [шаблоны документов](templates/)

```bash
cd video && npm install
npm run studio                                    # предпросмотр
scripts/render.sh Example-ch01 example-ch01       # демо-глава на заглушках → out/example-ch01.mp4
```

Формат: 1920×1080, 30 fps, H.264, −14 LUFS. Remotion — бесплатно для частных лиц и компаний до 3 человек.
