#!/usr/bin/env python3
"""소리블룸 음성 생성: 일레븐랩스(용디쌤 클론) → 무음 트리밍·정규화 → audio/<id>.mp3
사용: python3 rebuild/gen_audio.py [id ...]   (인자 없으면 없는 파일만 전부)
"""
import json, os, sys, subprocess, urllib.request, wave, struct, math, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
TEXTS = json.load(open(ROOT / 'rebuild/audio_texts.json'))
OUT = ROOT / 'audio'; OUT.mkdir(exist_ok=True)
RAW = ROOT / 'rebuild/raw'; RAW.mkdir(exist_ok=True)
SEC = {}
for line in open(os.path.expanduser('~/.talkbloom-secrets')):
    if '=' in line and not line.startswith('#'):
        k, v = line.strip().split('=', 1); SEC[k] = v.strip().strip('"').strip("'")
KEY = SEC['ELEVENLABS_API_KEY']
VOICE = 'L72yGesuLoTFfO1fHS6p'   # 용디쌤 본인 클론(마음톡 3과 동일)
MODEL = 'eleven_multilingual_v2'
REG = {
    'stim': {'stability': 0.6, 'similarity_boost': 0.85, 'style': 0.15, 'use_speaker_boost': True, 'speed': 0.9},
    'talk': {'stability': 0.42, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True, 'speed': 0.95},
}
SR = 44100

def tts(text, reg, dst):
    payload = json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': REG[reg]}).encode()
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
        data=payload, method='POST',
        headers={'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=120) as r:
        dst.write_bytes(r.read())

def load(mp3):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(mp3), '-ac', '1', '-ar', str(SR), '/tmp/_sb.wav'], check=True)
    w = wave.open('/tmp/_sb.wav'); n = w.getnframes(); s = struct.unpack('<%dh' % n, w.readframes(n)); w.close(); return list(s)

def trim(s, thr_ratio=0.04, pre=0.04, post=0.12):
    win = int(SR * 0.02); n = len(s)
    ps = [0]
    for v in s: ps.append(ps[-1] + v * v)
    def rms(i): a = max(0, i - win); b = min(n, i + win); return math.sqrt((ps[b] - ps[a]) / max(1, b - a))
    peak = max(rms(i) for i in range(0, n, 64)); thr = peak * thr_ratio
    i = 0
    while i < n and rms(i) < thr: i += 64
    j = n
    while j > 0 and rms(j - 1) < thr: j -= 64
    a = max(0, i - int(SR * pre)); b = min(n, j + int(SR * post))
    return s[a:b]

def finish(seg, dst):
    with wave.open('/tmp/_sb2.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(struct.pack('<%dh' % len(seg), *seg))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/_sb2.wav', '-af',
        'loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=in:st=0:d=0.01,areverse,afade=t=in:st=0:d=0.03,areverse',
        '-codec:a', 'libmp3lame', '-q:a', '3', str(dst)], check=True)

ids = sys.argv[1:] or [k for k in TEXTS if not (OUT / f'{k}.mp3').exists()]
ok, fail = [], []
for k in ids:
    t = TEXTS[k]; raw = RAW / f'{k}.mp3'; dst = OUT / f'{k}.mp3'
    try:
        if not raw.exists(): tts(t['text'], t['reg'], raw)
        seg = trim(load(raw)); finish(seg, dst)
        d = len(seg) / SR; ok.append((k, t['text'], round(d, 2))); print(f'✅ {k:10} {t["text"]:14} {d:.2f}s', flush=True)
    except Exception as e:
        fail.append((k, str(e))); print(f'❌ {k} {e}', flush=True)
print(f'\n완료 {len(ok)} / 실패 {len(fail)}')
for f in fail: print('  ', f)
