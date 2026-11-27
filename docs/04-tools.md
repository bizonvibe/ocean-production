# 04. Инструменты

Основа перенесена из репозитория Wildlife (ноябрь 2026). Принцип: один движок (Remotion) и его skills.

| Инструмент | Роль |
|---|---|
| **Remotion 4** (`remotion`, `@remotion/cli`, `@remotion/transitions`, `@remotion/effects`) | монтаж, анимации, рендер 1920×1080 / 30 fps |
| **skills** в `.claude/skills/` (`remotion-*`, `motion-design`) | правила Remotion; тайминг, кривые и хореография движения |
| **motionmaxxing** (`docs/references/motionmaxxing/`) | справочник: замеры движений и чек-лист «AI-slop» (не skill) |
| **Gemini TTS** — `scripts/tts.py` | озвучка глав, пробы голосов |
| **WhisperX** — `scripts/transcribe.py` | тайминги слов озвучки (акценты, паузы, склейки) |
| **FFmpeg** — `scripts/master.sh`, `scripts/join.sh` | мастеринг громкости −14 LUFS, склейка глав |
| `scripts/film.sh` | фильм целиком: заставка, слайды глав, главы, концовка, единая громкость |
| `scripts/remix.sh` | пересобрать только звук готовой главы (замена музыки) без рендера кадров |
| `scripts/silences.py` | паузы в озвучке (`voice.silences.json`) для вставки драматических пауз |
| `scripts/sfx.sh`, `scripts/intro_jingle.py`, `scripts/outro_sound.py` | синтезированные звуки (щелчки кашалота и т.п.), звук заставки и концовки |
| `.github/workflows/tts.yml` | озвучка и тайминги слов в GitHub Actions (ключи в Secrets) |
| `scripts/render.sh`, `scripts/stills.sh` | рендер главы, контрольные кадры |
| `scripts/qc_shots.py` | QC монтажа: длина планов, повторы |
| Шрифты Manrope, Unbounded (`public/fonts`, SIL OFL) | подписи и акцентные слова, с кириллицей |

## Код
| Путь | Что |
|---|---|
| `video/src/chapter/ChapterVideo.tsx` | композиция главы: планы, наплывы, озвучка, музыка, звуки, акценты |
| `video/src/chapter/timing.ts` | длина главы по озвучке, подгонка планов, доля стоков, громкость музыки, паузы |
| `video/src/chapter/AccentWord.tsx` | акцентное слово |
| `video/src/chapter/AnimatedImage.tsx` | базовая анимация картинки: наезд, отъезд, панорамы, проявление |
| `video/src/templates/` | слой стока с подписью автора (`Footage.tsx`), готовые сцены (заголовок, цифры, сравнения) |
| `video/src/components/ui.tsx` | `RevealText`, `Counter`, `Overline`, `Backdrop`, `Grain`, `Vignette`, `LightLeakOverlay` |
| `video/src/chapter/build.tsx` | `buildChapter`: раскадровка по словам озвучки, якоря сцен, паузы, `musicVolumeFor` |
| `video/src/svg/` | `SvgScene` (слои SVG из Ocean Animations, анимация по id) и `motion.ts` (кривые, `timeMap`) |
| `video/src/intro/` | канал KoKo Crabs: заставка, слайды глав, концовка «Подпишись», обложка канала |
| `video/src/chapters/_example/` | демо-глава на заглушках — образец конфига |

## Не берём из Wildlife
`find_media.py` (стоки приходят из своего репозитория), `beats.py` (длину задаёт озвучка, не ритм музыки),
3D (`@remotion/three`) — добавим, если в ТЗ анимаций появятся 3D-сцены.

## Лицензия Remotion
Бесплатно для частных лиц и компаний до 3 человек; иначе нужна компания-лицензия (skill `remotion-license`).
