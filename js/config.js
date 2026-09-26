/* 소리블룸 설정 */
const SB_VER = '2';   // 정적 자산 캐시 버스터(index.html ?v= 와 sw.js VERSION 과 함께 올릴 것)

/* Supabase(공유 프로젝트: 키토냉장고·핏메이트·알말카와 동일) — 비어 있으면 로컬 저장만 */
const SUPABASE_CONFIG = {
  url: 'https://wzlapxdnfhgapheuuqnl.supabase.co',
  anonKey: 'sb_publishable_I7P96pUCMlS9eGv_uGdRfg_Etx_0ooc',
  childTable: 'soribloom_child',
  resultTable: 'soribloom_result',
};

const BRAND = { name: '소리블룸', en: 'SoriBloom', emoji: '🌱' };

/* 선생님 화면 PIN — SHA-256 해시. 기본 PIN 은 README 참고, 바꾸려면 rebuild/pin.sh 로 해시 생성 */
const TEACHER_PIN_HASH = 'd8b81dc69b28524f9936c4de2d100b827b68ce8225bb1815e51b94ab2be98b8b';

/* 연습 기본값 */
const SB_DEFAULTS = { n: 10, retry: true, showText: true, showJamo: true };
