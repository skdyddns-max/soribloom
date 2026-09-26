#!/bin/bash
# 사용: ./rebuild/pin.sh 5678  → js/config.js 의 TEACHER_PIN_HASH 에 넣을 해시 출력
printf '%s' "$1" | shasum -a 256 | cut -d' ' -f1
