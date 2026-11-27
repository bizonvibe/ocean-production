#!/usr/bin/env bash
# Склейка фильма с ЕДИНОЙ громкостью:
#   заставка → (слайд главы → глава) × N → концовка «Подпишись».
# Звук глав рендерится заново без помастерного выравнивания (голос везде −16 LUFS, музыка по одной формуле),
# заставка/слайды/концовка подгоняются под уровень глав, затем весь фильм мастерится ОДНИМ проходом
# (линейное усиление) — соотношение голоса и музыки одинаково во всех главах.
# Картинка глав берётся из готовых out/<prefix>-chNN.mp4 без перекодирования.
#
#   scripts/film.sh <имя-фильма> <prefix-файлов> <prefix-композиций> <число глав>
#   scripts/film.sh sperm-whale-film sperm-whale SpermWhale 7
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="${1:?имя}"; FILE="${2:?prefix файлов}"; COMP="${3:?prefix композиций}"; N="${4:?число глав}"
INTRO_LUFS=-17; CARD_LUFS=-21
T=out/film-tmp; rm -rf "$T"; mkdir -p "$T"
CLOUD_SHELL=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
if [[ -z "${REMOTION_BROWSER:-}" && -x "$CLOUD_SHELL" ]]; then export REMOTION_BROWSER="$CLOUD_SHELL"; fi
npx tsc -p .

lufs() { ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | grep -oE '\-?[0-9.]+'; }
# Сегмент «оформления» (заставка/слайд/концовка): видео отдельно, звук — к целевой громкости.
deco() { # <composition> <id> <target LUFS>
	npx remotion render src/index.ts "$1" "$T/$2.mp4" --log=error
	ffmpeg -v error -y -i "$T/$2.mp4" -map 0:v -c copy "$T/$2.v.mp4"
	ffmpeg -v error -y -i "$T/$2.mp4" -map 0:a -ar 48000 -ac 2 -c:a pcm_s16le "$T/$2.raw.wav"
	local g; g=$(python3 -c "print(round($3-($(lufs "$T/$2.raw.wav")),2))")
	# Звук обрезается ровно по длине картинки — иначе на стыках копится рассинхрон.
	local vd; vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$T/$2.v.mp4")
	ffmpeg -v error -y -i "$T/$2.raw.wav" -af "volume=${g}dB,atrim=0:${vd},apad=whole_dur=${vd}" -ar 48000 -ac 2 -c:a pcm_s16le "$T/$2.wav"
	echo "  $2: звук ${g} дБ → $3 LUFS"
}

echo "Заставка, слайды, концовка…"
deco Intro-KokoCrabs intro $INTRO_LUFS
deco Outro-Subscribe outro $INTRO_LUFS
SEG=(intro)
for i in $(seq -f "%02g" 1 "$N"); do
	deco "Card-ch$i" "card$i" $CARD_LUFS
	echo "Глава $i: звук без помастерного выравнивания…"
	npx remotion render src/index.ts "$COMP-ch$i" "$T/ch$i.wav" --codec=wav --log=error
	ffmpeg -v error -y -i "$T/ch$i.wav" -ar 48000 -ac 2 -c:a pcm_s16le "$T/ch$i.n.wav" && mv "$T/ch$i.n.wav" "$T/ch$i.wav"
	ffmpeg -v error -y -i "out/$FILE-ch$i.mp4" -map 0:v -c copy "$T/ch$i.v.mp4"
	SEG+=("card$i" "ch$i")
done
SEG+=(outro)

: > "$T/v.txt"; : > "$T/a.txt"
for s in "${SEG[@]}"; do
	echo "file '$(realpath "$T/$s.v.mp4")'" >> "$T/v.txt"
	echo "file '$(realpath "$T/$s.wav")'" >> "$T/a.txt"
done
echo "Склейка…"
ffmpeg -v error -y -f concat -safe 0 -i "$T/v.txt" -c copy "$T/video.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$T/a.txt" -c:a pcm_s16le "$T/audio.wav"
ffmpeg -v error -y -i "$T/video.mp4" -i "$T/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "$T/mux.mp4"
scripts/master.sh "$T/mux.mp4" "out/$NAME.mp4"
ffprobe -v error -show_entries format=duration,size -of compact "out/$NAME.mp4"
echo "Готово: out/$NAME.mp4"
