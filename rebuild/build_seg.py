#!/usr/bin/env python3
"""음절 세기용 끊어 읽기 음성: 음절마다 따로 녹음(일레븐랩스) → 앞뒤 무음 트리밍 → 0.45초 간격으로 이어 붙여 audio/seg-<img>.mp3
사용: python3 rebuild/build_seg.py
"""
import json, os, subprocess, urllib.request, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
ROOT = pathlib.Path(__file__).resolve().parent.parent
GAP = 0.45
SEC = {}
for line in open(os.path.expanduser('~/.talkbloom-secrets')):
    if '=' in line and not line.startswith('#'):
        k, v = line.strip().split('=', 1); SEC[k] = v.strip().strip('"').strip("'")
VOICE = 'L72yGesuLoTFfO1fHS6p'
VS = {'stability': 0.6, 'similarity_boost': 0.85, 'style': 0.15, 'use_speaker_boost': True, 'speed': 0.9}
RAW = ROOT / 'rebuild/raw'; RAW.mkdir(exist_ok=True)
words = json.loads(subprocess.run(['node', '-e', "global.window={};require('./js/words.js');console.log(JSON.stringify(window.SB_PAIRS.filter(p=>p.count).map(p=>[p.a, window.SB_WORDS[p.a].img])))"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)

def tts(text, dst):
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
        data=json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': VS}).encode(), method='POST',
        headers={'xi-api-key': SEC['ELEVENLABS_API_KEY'], 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=120) as r: dst.write_bytes(r.read())

def clean(src, dst):   # 앞뒤 무음 제거 + 음량 정규화 → wav
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-ac', '1', '-ar', '44100', '-af',
        'silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.04,areverse,loudnorm=I=-16:TP=-1.5:LRA=7',
        str(dst)], check=True)

for w, img in words:
    parts = []
    for i, syl in enumerate(w):
        raw = RAW / f'syl-{syl}.mp3'
        if not raw.exists(): tts(syl, raw)
        wav = RAW / f'syl-{syl}.wav'; clean(raw, wav); parts.append(wav)
    inputs, filt = [], ''
    for i, p in enumerate(parts): inputs += ['-i', str(p)]
    n = len(parts)
    pads = ''.join(f'[{i}:a]apad=pad_dur={GAP if i < n - 1 else 0.05}[p{i}];' for i in range(n))
    filt = pads + ''.join(f'[p{i}]' for i in range(n)) + f'concat=n={n}:v=0:a=1,afade=t=in:st=0:d=0.01[o]'
    out = ROOT / 'audio' / f'seg-{img}.mp3'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', filt, '-map', '[o]', '-codec:a', 'libmp3lame', '-q:a', '3', str(out)], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)], capture_output=True, text=True).stdout)
    print(f'✅ seg-{img:10} {"·".join(w):8} {d:.2f}s')
