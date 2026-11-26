# 06. Механика Remotion: технические правила и грабли

Версии: Remotion **4.0.545** (все пакеты `@remotion/*` — строго одной версии), React 19. Официальные правила — в `.claude/skills/remotion-*` (загружай перед работой).

## Детерминизм
- Всё анимируется **только** от `useCurrentFrame()` (+ `interpolate`, `spring`). Кадр N должен рендериться
  одинаково в любом порядке — Remotion рендерит кадры параллельно в нескольких вкладках.
- Запрещено: `useFrame()` из R3F, CSS `transition`/`animation`, `setTimeout`, `Math.random()` без сида,
  `Date.now()`. Шум/зерно — с сидом от номера кадра (`seed={frame % 97}`).
- Шейдеры получают время через uniform (`uTime = frame / fps`), сами не анимируются.

## Загрузка ресурсов
- Всё из `public/` через `staticFile('path')`.
- Любая асинхронная загрузка — внутри `delayRender()` / `continueRender()`.
- **Шрифты:** только локальные woff2 + `FontFace` в `theme.ts`. `@remotion/google-fonts` не используем:
  в облачной среде Chromium не доверяет сертификату прокси, шрифты не грузятся, рендер падает по таймауту.
- Футаж: `<OffthreadVideo muted>` (точный покадровый рендер), начало исходника — `trimBefore` (в кадрах).

## Композиция
- Планы идут в `<TransitionSeries>` с наплывами `fade()`; наплыв съедает `crossfadeFrames` у соседних планов
  (это учитывает `src/chapter/timing.ts`).
- Звук: `<Audio>` из `remotion`, эффекты — в `<Sequence from=… durationInFrames=…>`.
- Внутри `AbsoluteFill` нельзя задавать `left/right` для отступов (он растянут на 100%) — используй обычный
  `div` с `position: absolute` или `padding`. (Ещё одна грабля: колонка уезжала за край кадра.)
- Длинные строки заголовков разбивай на несколько `RevealText` вручную — автоперенос может оставить висячее слово.

## Эффекты (`@remotion/effects`)
- `lightLeak()` на `<Solid>` — для склеек. Требует WebGL: в `remotion.config.ts` стоит
  `Config.setChromiumOpenGlRenderer('angle')`.
- Другие полезные: `vignette`, `noise`, `chromaticAberration`, `zoomBlur`, `glow`, `lut` (см. skill `remotion-markup/effects.md`).

## Рендер
- Облачная среда Claude Code: браузер `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  (скрипты `scripts/*.sh` подставляют его сами через `REMOTION_BROWSER`).
- Локально Remotion сам скачает свой Chromium — переменная не нужна.
- Кодек H.264, CRF 18, yuv420p, JPEG-кадры качества 92 (`remotion.config.ts`).
- `--concurrency=4` на 4 ядрах; 1800 кадров ≈ 5–7 мин.

## Чек-лист перед коммитом кода
- [ ] `npx tsc -p .` — 0 ошибок
- [ ] Нет `useFrame`, `Math.random`, CSS-анимаций
- [ ] Все ассеты локальные и есть в манифесте
- [ ] Контрольные кадры просмотрены
