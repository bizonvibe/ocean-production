#!/usr/bin/env bash
# Рендер главы + мастеринг громкости (−14 LUFS) + QC монтажа.
# Использование: scripts/render.sh <CompositionId> [имя-файла]
#   scripts/render.sh Example-ch01 example-ch01        → out/example-ch01.mp4
# Переменные: CONCURRENCY (4), SKIP_QC=1 (черновик без проверки), QC_MAX_SHOT (макс. длина плана, с; 8).
set -euo pipefail
cd "$(dirname "$0")/.."

COMP="${1:?Укажи id композиции, например Example-ch01}"
NAME="${2:-$(echo "$COMP" | tr '[:upper:]' '[:lower:]')}"
mkdir -p out

# В облачной среде Claude Code есть готовый headless Chromium — используем его.
CLOUD_SHELL=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
if [[ -z "${REMOTION_BROWSER:-}" && -x "$CLOUD_SHELL" ]]; then
	export REMOTION_BROWSER="$CLOUD_SHELL"
fi

npx tsc -p .
npx remotion render src/index.ts "$COMP" "out/$NAME.raw.mp4" --concurrency="${CONCURRENCY:-4}"
scripts/master.sh "out/$NAME.raw.mp4" "out/$NAME.mp4"
rm "out/$NAME.raw.mp4"

ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "out/$NAME.mp4"
echo "Готово: out/$NAME.mp4"

# Контроль монтажа: нет застывших планов и повторов кадров (docs/03-montage-rules.md).
if [[ "${SKIP_QC:-0}" != "1" ]]; then
	python3 scripts/qc_shots.py "out/$NAME.mp4" --max-shot "${QC_MAX_SHOT:-8}" || echo "⚠️  QC нашёл замечания — см. out/$NAME.qc.json"
fi
