#!/usr/bin/env bash
# Склейка одобренных глав в один ролик + общий мастеринг громкости.
# Использование: scripts/join.sh <выход-имя> out/proj-ch01.mp4 out/proj-ch02.mp4 ...
#   scripts/join.sh ocean-full out/ocean-ch0{1,2,3}.mp4   → out/ocean-full.mp4
# Главы уже начинаются из чёрного и кончаются в чёрное, поэтому склейка встык выглядит как затемнение.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="${1:?Имя итогового файла}"; shift
[[ $# -ge 2 ]] || { echo "Нужно минимум две главы"; exit 1; }
LIST=$(mktemp)
for f in "$@"; do echo "file '$(realpath "$f")'" >> "$LIST"; done
# Перекодирование (а не -c copy): гарантирует ровные таймстемпы на стыках глав.
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 \
	-c:a aac -b:a 192k -ar 48000 "out/$NAME.raw.mp4"
rm "$LIST"
scripts/master.sh "out/$NAME.raw.mp4" "out/$NAME.mp4"
rm "out/$NAME.raw.mp4"
ffprobe -v error -show_entries format=duration,size -of compact "out/$NAME.mp4"
echo "Готово: out/$NAME.mp4"
