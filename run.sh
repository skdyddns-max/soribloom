#!/bin/bash
# 소리블룸 로컬 서버 :8090
cd "$(dirname "$0")" && python3 -m http.server 8090
