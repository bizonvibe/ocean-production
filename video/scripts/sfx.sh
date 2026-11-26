#!/usr/bin/env bash
# Синтез звуков FFmpeg (воспроизводимо, без внешних файлов) → public/sfx/*.wav
# Использование: scripts/sfx.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/sfx
F="ffmpeg -v error -y"
O="-ar 48000 -ac 2"

# Щелчок кашалота: очень короткий широкополосный импульс + низкий «тук» корпуса + подводное эхо.
$F -f lavfi -i "anoisesrc=c=white:a=1:d=0.6:seed=21" -f lavfi -i "sine=f=95:d=0.6" -filter_complex \
 "[0]highpass=f=900,lowpass=f=9000,afade=t=in:d=0.0008,afade=t=out:st=0.002:d=0.012:curve=exp,volume=1.6[n];\
  [1]afade=t=in:d=0.001,afade=t=out:st=0.004:d=0.05:curve=exp,volume=0.9[b];\
  [n][b]amix=inputs=2:normalize=0,aecho=0.8:0.5:60|140:0.35|0.2,lowpass=f=7000,loudnorm=I=-16:TP=-2" $O public/sfx/click.wav

# Серия щелчков кашалота (эхолокация, ~1 щелчок в 0.7 с, слегка неровно), 6 с.
$F -i public/sfx/click.wav -filter_complex \
 "[0]asplit=6[a][b][c][d][e][f];[b]adelay=700|700,volume=0.9[b2];[c]adelay=1350|1350,volume=0.85[c2];\
  [d]adelay=2100|2100,volume=0.9[d2];[e]adelay=2780|2780,volume=0.8[e2];[f]adelay=3500|3500,volume=0.75[f2];\
  [a][b2][c2][d2][e2][f2]amix=inputs=6:normalize=0,apad=pad_dur=1.5,aecho=0.7:0.4:400:0.25" $O public/sfx/clicks.wav

# Выдох кашалота: мощный шипящий поток воздуха с водяной пылью, 2.4 с.
$F -f lavfi -i "anoisesrc=c=pink:a=0.9:d=2.4:seed=5" -f lavfi -i "anoisesrc=c=brown:a=0.9:d=2.4:seed=6" -filter_complex \
 "[0]highpass=f=500,lowpass=f=6000,afade=t=in:d=0.06,afade=t=out:st=0.5:d=1.9:curve=exp[h];\
  [1]lowpass=f=260,afade=t=in:d=0.03,afade=t=out:st=0.25:d=1.2:curve=exp,volume=1.4[l];\
  [h][l]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-2" $O public/sfx/blow.wav

# Низкий гул глубины (подложка под тьму), 12 с, плавные края — зацикливается.
$F -f lavfi -i "sine=f=41:d=12" -f lavfi -i "sine=f=61.5:d=12" -f lavfi -i "anoisesrc=c=brown:a=0.5:d=12:seed=9" -filter_complex \
 "[0]volume=0.6,tremolo=f=0.15:d=0.5[a];[1]volume=0.25,tremolo=f=0.11:d=0.7[b];[2]lowpass=f=180,volume=0.8[c];\
  [a][b][c]amix=inputs=3:normalize=0,afade=t=in:d=2,afade=t=out:st=9.5:d=2.5,loudnorm=I=-24:TP=-6" $O public/sfx/drone.wav

# «Вжух» (быстрое движение объекта), 0.9 с.
$F -f lavfi -i "anoisesrc=c=pink:a=0.7:d=0.9:seed=11" -af \
 "highpass=f=400,lowpass=f=4000,afade=t=in:d=0.55:curve=exp,afade=t=out:st=0.55:d=0.35,loudnorm=I=-22:TP=-4" $O public/sfx/whoosh.wav

# Влажный шлепок (щупальца), 0.5 с.
$F -f lavfi -i "anoisesrc=c=pink:a=0.9:d=0.5:seed=14" -f lavfi -i "sine=f=120:d=0.5" -filter_complex \
 "[0]bandpass=f=900:w=1200,afade=t=in:d=0.004,afade=t=out:st=0.02:d=0.3:curve=exp[n];[1]afade=t=out:st=0.0:d=0.12:curve=exp,volume=0.6[s];\
  [n][s]amix=inputs=2:normalize=0,loudnorm=I=-20:TP=-3" $O public/sfx/slap.wav

# Металлический скрежет и хлопок сминаемого корпуса, 1.6 с.
$F -f lavfi -i "sine=f=170:d=1.6" -f lavfi -i "sine=f=243:d=1.6" -f lavfi -i "anoisesrc=c=brown:a=1:d=1.6:seed=3" -filter_complex \
 "[0]vibrato=f=7:d=0.6,volume=0.5[a];[1]vibrato=f=5:d=0.8,volume=0.35[b];[2]lowpass=f=400,afade=t=out:st=0.05:d=0.7:curve=exp,volume=1.5[c];\
  [a][b]amix=inputs=2:normalize=0,afade=t=in:d=0.3,afade=t=out:st=0.6:d=1:curve=exp,aecho=0.8:0.6:90|170:0.4|0.25[m];\
  [m][c]amix=inputs=2:normalize=0,loudnorm=I=-18:TP=-2" $O public/sfx/crunch.wav

# «Бип» сонара (появление узла на схеме), 0.8 с.
$F -f lavfi -i "sine=f=1320:d=0.8" -af \
 "afade=t=in:d=0.005,afade=t=out:st=0.03:d=0.5:curve=exp,aecho=0.6:0.5:180:0.3,volume=0.6,loudnorm=I=-24:TP=-6" $O public/sfx/beep.wav

# Мягкий низкий удар (акцент, титр), 2.5 с.
$F -f lavfi -i "sine=f=48:d=2.5" -f lavfi -i "anoisesrc=c=pink:a=0.4:d=2.5:seed=3" -filter_complex \
 "[0]volume=1.2[a];[1]lowpass=f=600,volume=0.5[b];[a][b]amix=inputs=2:normalize=0,afade=t=in:d=0.008,afade=t=out:st=0.03:d=2.4:curve=exp,loudnorm=I=-18:TP=-2" $O public/sfx/hit.wav

ls -1 public/sfx
