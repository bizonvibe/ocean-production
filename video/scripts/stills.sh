#!/usr/bin/env bash
# Контрольные кадры перед полным рендером: scripts/stills.sh <CompositionId> 150 520 990 ...
set -euo pipefail
cd "$(dirname "$0")/.."
COMP="${1:?Укажи id композиции}"; shift
CLOUD_SHELL=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
if [[ -z "${REMOTION_BROWSER:-}" && -x "$CLOUD_SHELL" ]]; then export REMOTION_BROWSER="$CLOUD_SHELL"; fi
mkdir -p out/stills
for f in "$@"; do
	npx remotion still src/index.ts "$COMP" "out/stills/$COMP-$f.jpg" --frame="$f" --scale=0.5 --log=error
	echo "out/stills/$COMP-$f.jpg"
done
