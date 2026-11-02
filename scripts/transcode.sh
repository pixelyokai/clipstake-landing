#!/usr/bin/env bash
# Transcodes Assets/ into public/media/. Re-run after replacing source clips.
# Cards: 540x960, 8s loop, H.264 MP4 + AV1 WebM + AVIF poster.
# Dome: 8 clips tiled 4x2 into one 640x568 mosaic (6s loop) + AVIF/WebP poster atlas.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=Assets
OUT=public/media
mkdir -p "$OUT/cards" "$OUT/dome"

CARD_SECONDS=8
DOME_SECONDS=6

for name in Clipping Logo Music UGC; do
  in="$SRC/$name.mp4"
  base="$OUT/cards/$(echo "$name" | tr '[:upper:]' '[:lower:]')"
  vf="fps=30,scale=540:960:flags=lanczos,setsar=1"

  ffmpeg -v error -y -t "$CARD_SECONDS" -i "$in" -an -vf "$vf" \
    -c:v libx264 -preset slow -crf 27 -maxrate 1100k -bufsize 2200k \
    -profile:v high -pix_fmt yuv420p -movflags +faststart "$base.mp4"

  ffmpeg -v error -y -t "$CARD_SECONDS" -i "$in" -an -vf "$vf" \
    -c:v libsvtav1 -preset 6 -crf 40 -pix_fmt yuv420p "$base.webm"

  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale=540:960:flags=lanczos" \
    -c:v libaom-av1 -still-picture 1 -crf 32 "$base.avif"
done

# Dome mosaic: each cell is 160x284 (9:16), grid 4 columns x 2 rows. Tiles render ~150px tall, so this is enough.
inputs=()
filters=""
for i in 1 2 3 4 5 6 7 8; do
  inputs+=(-t "$DOME_SECONDS" -i "$SRC/Dome/$i.mp4")
  filters+="[$((i-1)):v]fps=24,scale=160:284:force_original_aspect_ratio=increase:flags=lanczos,crop=160:284,setsar=1[v$i];"
done
layout="0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0"
filters+="[v1][v2][v3][v4][v5][v6][v7][v8]xstack=inputs=8:layout=$layout[m]"

ffmpeg -v error -y "${inputs[@]}" -an -filter_complex "$filters" -map "[m]" \
  -c:v libx264 -preset slow -crf 28 -maxrate 500k -bufsize 1000k \
  -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/dome/mosaic.mp4"
# No AV1 for the dome: at 640px it was larger than H.264, which also decodes in hardware everywhere.

ffmpeg -v error -y -i "$OUT/dome/mosaic.mp4" -frames:v 1 \
  -c:v libaom-av1 -still-picture 1 -crf 34 "$OUT/dome/atlas.avif"
ffmpeg -v error -y -i "$OUT/dome/mosaic.mp4" -frames:v 1 \
  -c:v libwebp -q:v 72 "$OUT/dome/atlas.webp"

du -b "$OUT"/cards/* "$OUT"/dome/*

# JackBit case study clips: Dome clips 1-7 as standalone 9:16 cards, same
# encoding as the campaign cards (they render up to ~260px wide).
mkdir -p "$OUT/clips"
for i in 1 2 3 4 5 6 7; do
  in="$SRC/Dome/$i.mp4"
  base="$OUT/clips/$i"
  vf="fps=30,scale=540:960:force_original_aspect_ratio=increase:flags=lanczos,crop=540:960,setsar=1"

  ffmpeg -v error -y -t "$CARD_SECONDS" -i "$in" -an -vf "$vf" \
    -c:v libx264 -preset slow -crf 27 -maxrate 1100k -bufsize 2200k \
    -profile:v high -pix_fmt yuv420p -movflags +faststart "$base.mp4"

  ffmpeg -v error -y -t "$CARD_SECONDS" -i "$in" -an -vf "$vf" \
    -c:v libsvtav1 -preset 6 -crf 40 -pix_fmt yuv420p "$base.webm"

  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale=540:960:force_original_aspect_ratio=increase:flags=lanczos,crop=540:960" \
    -c:v libaom-av1 -still-picture 1 -crf 32 "$base.avif"
done
