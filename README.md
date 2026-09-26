# 소리블룸 (SoriBloom)

조음치료 **자음 변별(듣고 고르기)** 홈워크 웹앱. 선생님이 아동별 목표 대립쌍을 골라 링크를 만들고, 부모가 링크를 열어 아이와 연습하면 결과가 선생님에게 모인다.

- 과업: 단어 음성(용디쌤 클론 목소리) → 그림 2장 중 고르기(2택1) · 10문항/세트 · 오답 시 두 단어 다시 듣고 1회 재시도
- 대립쌍 39개: 종성 유무 23쌍(ㄱ·ㄴ·ㄷ계열·ㄹ·ㅁ·ㅂ·ㅇ) + 초성 대립 16쌍(전방화·파열음화·파찰음·기식/긴장)
- 글자 + 자모 칩(대립 자모를 코랄색 강조, 받침 없음은 점선 빈 칸)
- 숫자 단어(사·삼·구·오·둘)는 숫자 카드로 표시

## 파일

| 경로 | 역할 |
|---|---|
| `index.html` + `js/app.js` | 부모·아동용 연습 화면. `?c=코드#설정` 링크로 열림(설정은 URL 해시에 동봉 → 서버 없이도 작동) |
| `teacher.html` + `js/teacher.js` | 선생님 화면(PIN). 아동 등록·목표 선택·링크/QR·결과 조회 |
| `js/words.js` | 대립쌍·단어·이미지 프롬프트·자모 분해 |
| `js/store.js` | Supabase REST + localStorage 캐시/아웃박스(미전송 결과 재전송) |
| `js/config.js` | Supabase 키, PIN 해시, 기본값, `SB_VER` |
| `audio/*.mp3` | 단어 59 + 안내 6 (일레븐랩스 → `rebuild/gen_audio.py`) |
| `img/*.jpg` | 실사풍 단어 그림 640px (codex image_gen → `rebuild/import_images.py`) |
| `supabase/schema.sql` | 테이블 2개(`soribloom_child`, `soribloom_result`) + RLS |

## 실행

```bash
bash run.sh   # http://localhost:8090
```

## 선생님 PIN

PIN은 `rebuild/PIN.txt`(git 제외)에 있음. 바꾸려면 `./rebuild/pin.sh 새PIN` 출력값을 `js/config.js`의 `TEACHER_PIN_HASH`에 넣는다.

## Supabase

1. 대시보드 SQL Editor에서 `supabase/schema.sql` 실행(최초 1회)
2. 프로젝트가 일시중지(무료 플랜 7일 비활성)면 대시보드에서 Restore
3. 서버가 꺼져 있어도: 링크는 작동, 결과는 부모 폰 아웃박스에 쌓였다가 다음 접속 때 자동 전송

## 자산 재생성

```bash
python3 rebuild/gen_audio.py            # 없는 음성만 생성(~/.talkbloom-secrets 의 ELEVENLABS_API_KEY)
python3 rebuild/import_images.py <png폴더>   # 원본 PNG → img/*.jpg
```

## 배포 체크리스트

`index.html`·`teacher.html`의 `?v=`, `js/config.js`의 `SB_VER`, `sw.js`의 `VERSION`·`V` 를 함께 올린다.
