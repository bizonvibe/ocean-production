#!/usr/bin/env bash
# Мастеринг громкости под YouTube: −14 LUFS, true peak −1 dBTP. Видео копируется без перекодирования.
# Использование: scripts/master.sh <вход.mp4> <выход.mp4>
set -euo pipefail
IN="${1:?вход}"; OUT="${2:?выход}"
# Двухпроходный loudnorm: сначала замер, потом точная нормализация (однопроходный ошибается на ±1–2 LU).
M=$(ffmpeg -hide_banner -i "$IN" -af "loudnorm=I=-14:TP=-1:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r II ITP ILRA ITH OFF <<< "$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
ffmpeg -v error -y -i "$IN" -c:v copy \
	-af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$II:measured_TP=$ITP:measured_LRA=$ILRA:measured_thresh=$ITH:offset=$OFF:linear=true" \
	-c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
