#!/usr/bin/env bash
# Пересобрать ТОЛЬКО звук готовой главы (замена музыки, звуков, громкости) — без рендера кадров.
# Видео копируется из уже готового out/<имя>.mp4 без перекодирования, звук рендерится заново и мастерится.
# Использование: scripts/remix.sh <CompositionId> <имя>     (например SpermWhale-ch02 sperm-whale-ch02)
# Условие: картинка главы не менялась (меняли только music / sfx / громкость в конфиге).
set -euo pipefail
cd "$(dirname "$0")/.."
COMP="${1:?id композиции}"; NAME="${2:?имя файла в out/}"
[[ -f "out/$NAME.mp4" ]] || { echo "Нет out/$NAME.mp4 — сначала полный рендер (scripts/render.sh)"; exit 1; }
CLOUD_SHELL=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
if [[ -z "${REMOTION_BROWSER:-}" && -x "$CLOUD_SHELL" ]]; then export REMOTION_BROWSER="$CLOUD_SHELL"; fi
npx tsc -p .
npx remotion render src/index.ts "$COMP" "out/$NAME.audio.wav" --codec=wav --log=error
cp "out/$NAME.mp4" "out/$NAME.prev.mp4"
ffmpeg -v error -y -i "out/$NAME.prev.mp4" -i "out/$NAME.audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "out/$NAME.mux.mp4"
scripts/master.sh "out/$NAME.mux.mp4" "out/$NAME.mp4"
rm "out/$NAME.mux.mp4" "out/$NAME.audio.wav"
echo "Готово: out/$NAME.mp4 (предыдущая версия — out/$NAME.prev.mp4)"
