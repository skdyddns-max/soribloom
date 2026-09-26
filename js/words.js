/* 소리블룸 대립쌍 데이터
 * kind: 'jong'(종성 유무) | 'cho'(초성 대립)
 * group: 종성 자음 또는 초성 오류 유형
 * 각 단어: w(표기) · img(파일명, img/ 아래 png) · emoji(그림 없을 때 임시) · prompt(실사 이미지 생성 프롬프트)
 */
window.SB_GROUPS = {
  jong: [
    { id: 'k',  label: 'ㄱ 받침', desc: '무/묵 · 구/국 · 새/색' },
    { id: 'n',  label: 'ㄴ 받침', desc: '소/손 · 사/산 · 무/문' },
    { id: 't',  label: 'ㄷ 계열 받침(ㅅ·ㅌ)', desc: '오/옷 · 비/빗 · 소/솥 · 파/팥' },
    { id: 'l',  label: 'ㄹ 받침', desc: '소/솔 · 무/물 · 파/팔 · 구/굴' },
    { id: 'm',  label: 'ㅁ 받침', desc: '배/뱀 · 소/솜 · 사/삼' },
    { id: 'p',  label: 'ㅂ 받침', desc: '배/밥 · 이/입 · 사/삽' },
    { id: 'ng', label: 'ㅇ 받침', desc: '코/콩 · 사/상 · 벼/병' },
  ],
  cho: [
    { id: 'front', label: '연구개음 전방화 (ㄱ·ㅋ → ㄷ·ㅌ)', desc: '굴/둘 · 감/담 · 콩/통 · 칼/탈' },
    { id: 'stop',  label: '마찰음 파열음화 (ㅅ → ㄷ·ㅌ)', desc: '솔/돌 · 손/돈 · 상/탕' },
    { id: 'affr',  label: '파찰음 (ㅈ → ㄷ, ㅈ/ㅊ)', desc: '줄/둘 · 자/차 · 종/총' },
    { id: 'asp',   label: '기식·긴장 대립', desc: '불/풀 · 발/팔 · 달/딸 · 굴/꿀 · 방/빵 · 살/쌀' },
  ],
};

const P = 'Realistic studio photograph, single subject centered, plain soft white background, bright even lighting, high detail, no text, no watermark, square 1:1: ';
window.SB_WORDS = {
  '무': { img: 'mu',    emoji: '🥬', prompt: P + 'one whole fresh Korean white radish (mu) with green leaves' },
  '묵': { img: 'muk',   emoji: '🟫', prompt: P + 'a block of Korean acorn jelly (dotorimuk), cut into cubes on a small white plate' },
  '구': { img: 'gu',    emoji: '9',  number: 9 },
  '국': { img: 'guk',   emoji: '🍲', prompt: P + 'a bowl of Korean clear soup (guk) with steam, spoon beside it' },
  '새': { img: 'sae',   emoji: '🐦', prompt: P + 'a small cute sparrow bird perched on a branch' },
  '색': { img: 'saek',  emoji: '🖍️', prompt: P + 'a fan of colorful crayons in rainbow colors' },
  '소': { img: 'so',    emoji: '🐄', prompt: P + 'a friendly Korean brown cow (hanwoo) standing, full body' },
  '손': { img: 'son',   emoji: '✋', prompt: P + "a child's open hand, palm facing camera" },
  '사': { img: 'sa',    emoji: '4',  number: 4 },
  '산': { img: 'san',   emoji: '⛰️', prompt: P + 'a green mountain with a peak under a clear blue sky' },
  '문': { img: 'mun',   emoji: '🚪', prompt: P + 'a wooden front door with a round handle, closed' },
  '오': { img: 'o',     emoji: '5',  number: 5 },
  '옷': { img: 'ot',    emoji: '👕', prompt: P + "a folded child's yellow t-shirt and blue pants" },
  '비': { img: 'bi',    emoji: '🌧️', prompt: P + 'rain falling with raindrops and a small puddle, gray sky, an umbrella' },
  '빗': { img: 'bit',   emoji: '🪮', prompt: P + 'a pink plastic hair comb' },
  '솥': { img: 'sot',   emoji: '🫕', prompt: P + 'a traditional Korean black iron cauldron pot (gamasot) with lid' },
  '파': { img: 'pa',    emoji: '🧅', prompt: P + 'a bunch of fresh green onions (scallions)' },
  '팥': { img: 'pat',   emoji: '🫘', prompt: P + 'a small pile of dried red adzuki beans' },
  '솔': { img: 'sol',   emoji: '🧹', prompt: P + 'a wooden scrub brush with bristles' },
  '물': { img: 'mul',   emoji: '💧', prompt: P + 'a clear glass of water with a splash' },
  '팔': { img: 'pal',   emoji: '💪', prompt: P + "a child's bare arm stretched out, from shoulder to hand" },
  '굴': { img: 'gul',   emoji: '🦪', prompt: P + 'fresh oysters in open shells on ice' },
  '배': { img: 'bae',   emoji: '🍐', prompt: P + 'one whole Korean pear, round and golden' },
  '뱀': { img: 'baem',  emoji: '🐍', prompt: P + 'a green snake coiled, friendly looking' },
  '솜': { img: 'som',   emoji: '☁️', prompt: P + 'a fluffy ball of white cotton' },
  '삼': { img: 'sam',   emoji: '3',  number: 3 },
  '밥': { img: 'bap',   emoji: '🍚', prompt: P + 'a bowl of steamed white rice with chopsticks' },
  '이': { img: 'i',     emoji: '🦷', prompt: P + "a child's smiling mouth showing white teeth, close-up" },
  '입': { img: 'ip',    emoji: '👄', prompt: P + "a child's closed lips, close-up of the mouth" },
  '삽': { img: 'sap',   emoji: '🪏', prompt: P + 'a garden shovel with a wooden handle' },
  '코': { img: 'ko',    emoji: '👃', prompt: P + "a child's nose, close-up of the face center" },
  '콩': { img: 'kong',  emoji: '🫛', prompt: P + 'a small pile of yellow soybeans' },
  '상': { img: 'sang',  emoji: '🪑', prompt: P + 'a traditional Korean low wooden dining table (sang)' },
  '벼': { img: 'byeo',  emoji: '🌾', prompt: P + 'golden rice plants (rice stalks with grain heads) in a field' },
  '병': { img: 'byeong', emoji: '🍾', prompt: P + 'a clear glass bottle with a cap' },
  '둘': { img: 'dul',   emoji: '2',  number: 2 },
  '감': { img: 'gam',   emoji: '🍊', prompt: P + 'one ripe orange persimmon with leaf' },
  '담': { img: 'dam',   emoji: '🧱', prompt: P + 'a traditional Korean stone wall (doldam) in a garden' },
  '통': { img: 'tong',  emoji: '🪣', prompt: P + 'a blue plastic bucket' },
  '칼': { img: 'kal',   emoji: '🔪', prompt: P + 'a kitchen knife with a wooden handle lying flat' },
  '탈': { img: 'tal',   emoji: '🎭', prompt: P + 'a traditional Korean wooden mask (hahoe tal), smiling' },
  '돌': { img: 'dol',   emoji: '🪨', prompt: P + 'a smooth gray round stone' },
  '돈': { img: 'don',   emoji: '💵', prompt: P + 'Korean coins and a few banknotes' },
  '탕': { img: 'tang',  emoji: '🍜', prompt: P + 'a hot bowl of Korean beef soup (tang) with steam in a black bowl' },
  '줄': { img: 'jul',   emoji: '🪢', prompt: P + 'a coiled rope (jump rope)' },
  '자': { img: 'ja',    emoji: '📏', prompt: P + 'a wooden 30cm ruler' },
  '차': { img: 'cha',   emoji: '🚗', prompt: P + 'a small red toy car' },
  '종': { img: 'jong',  emoji: '🔔', prompt: P + 'a golden hand bell' },
  '총': { img: 'chong', emoji: '🔫', prompt: P + 'a colorful plastic toy water gun' },
  '불': { img: 'bul',   emoji: '🔥', prompt: P + 'a campfire flame burning on logs' },
  '풀': { img: 'pul',   emoji: '🌿', prompt: P + 'a patch of fresh green grass' },
  '발': { img: 'bal',   emoji: '🦶', prompt: P + "a child's bare foot, side view" },
  '달': { img: 'dal',   emoji: '🌕', prompt: P + 'a full moon glowing in the dark night sky' },
  '딸': { img: 'ttal',  emoji: '👧', prompt: P + 'a mother hugging her little daughter, both smiling' },
  '꿀': { img: 'kkul',  emoji: '🍯', prompt: P + 'a glass jar of golden honey with a wooden dipper' },
  '방': { img: 'bang',  emoji: '🛏️', prompt: P + "a cozy child's bedroom with a bed and window" },
  '빵': { img: 'ppang', emoji: '🍞', prompt: P + 'a loaf of soft bread on a wooden board' },
  '살': { img: 'sal',   emoji: '🤏', prompt: P + "a child's chubby cheek being gently pinched, close-up" },
  '쌀': { img: 'ssal',  emoji: '🌾', prompt: P + 'a pile of uncooked white rice grains' },
};

window.SB_PAIRS = [
  // 종성 유무
  { id: 'mu-muk',  kind: 'jong', group: 'k',  a: '무', b: '묵' },
  { id: 'gu-guk',  kind: 'jong', group: 'k',  a: '구', b: '국' },
  { id: 'sae-saek',kind: 'jong', group: 'k',  a: '새', b: '색' },
  { id: 'so-son',  kind: 'jong', group: 'n',  a: '소', b: '손' },
  { id: 'sa-san',  kind: 'jong', group: 'n',  a: '사', b: '산' },
  { id: 'mu-mun',  kind: 'jong', group: 'n',  a: '무', b: '문' },
  { id: 'o-ot',    kind: 'jong', group: 't',  a: '오', b: '옷' },
  { id: 'bi-bit',  kind: 'jong', group: 't',  a: '비', b: '빗' },
  { id: 'so-sot',  kind: 'jong', group: 't',  a: '소', b: '솥' },
  { id: 'pa-pat',  kind: 'jong', group: 't',  a: '파', b: '팥' },
  { id: 'so-sol',  kind: 'jong', group: 'l',  a: '소', b: '솔' },
  { id: 'mu-mul',  kind: 'jong', group: 'l',  a: '무', b: '물' },
  { id: 'pa-pal',  kind: 'jong', group: 'l',  a: '파', b: '팔' },
  { id: 'gu-gul',  kind: 'jong', group: 'l',  a: '구', b: '굴' },
  { id: 'bae-baem',kind: 'jong', group: 'm',  a: '배', b: '뱀' },
  { id: 'so-som',  kind: 'jong', group: 'm',  a: '소', b: '솜' },
  { id: 'sa-sam',  kind: 'jong', group: 'm',  a: '사', b: '삼' },
  { id: 'bae-bap', kind: 'jong', group: 'p',  a: '배', b: '밥' },
  { id: 'i-ip',    kind: 'jong', group: 'p',  a: '이', b: '입' },
  { id: 'sa-sap',  kind: 'jong', group: 'p',  a: '사', b: '삽' },
  { id: 'ko-kong', kind: 'jong', group: 'ng', a: '코', b: '콩' },
  { id: 'sa-sang', kind: 'jong', group: 'ng', a: '사', b: '상' },
  { id: 'byeo-byeong', kind: 'jong', group: 'ng', a: '벼', b: '병' },
  // 초성 대립
  { id: 'gul-dul',  kind: 'cho', group: 'front', a: '굴', b: '둘' },
  { id: 'gam-dam',  kind: 'cho', group: 'front', a: '감', b: '담' },
  { id: 'kong-tong',kind: 'cho', group: 'front', a: '콩', b: '통' },
  { id: 'kal-tal',  kind: 'cho', group: 'front', a: '칼', b: '탈' },
  { id: 'sol-dol',  kind: 'cho', group: 'stop',  a: '솔', b: '돌' },
  { id: 'son-don',  kind: 'cho', group: 'stop',  a: '손', b: '돈' },
  { id: 'sang-tang',kind: 'cho', group: 'stop',  a: '상', b: '탕' },
  { id: 'jul-dul',  kind: 'cho', group: 'affr',  a: '줄', b: '둘' },
  { id: 'ja-cha',   kind: 'cho', group: 'affr',  a: '자', b: '차' },
  { id: 'jong-chong',kind:'cho', group: 'affr',  a: '종', b: '총' },
  { id: 'bul-pul',  kind: 'cho', group: 'asp',   a: '불', b: '풀' },
  { id: 'bal-pal',  kind: 'cho', group: 'asp',   a: '발', b: '팔' },
  { id: 'dal-ttal', kind: 'cho', group: 'asp',   a: '달', b: '딸' },
  { id: 'gul-kkul', kind: 'cho', group: 'asp',   a: '굴', b: '꿀' },
  { id: 'bang-ppang',kind:'cho', group: 'asp',   a: '방', b: '빵' },
  { id: 'sal-ssal', kind: 'cho', group: 'asp',   a: '살', b: '쌀' },
];

/* 안내 음성(talk 톤) */
window.SB_PHRASES = {
  intro:   { file: 'p-intro',   text: '잘 듣고 골라 보세요.' },
  listen:  { file: 'p-listen',  text: '잘 들어 보세요.' },
  correct: { file: 'p-correct', text: '맞았어요! 잘했어요.' },
  retry:   { file: 'p-retry',   text: '다시 한번 들어 볼까요?' },
  reveal:  { file: 'p-reveal',  text: '정답은 이거예요.' },
  done:    { file: 'p-done',    text: '다 했어요! 정말 잘했어요.' },
};

/* 한글 자모 분해 */
window.SB_JAMO = (function () {
  const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return function (ch) {
    const c = ch.charCodeAt(0) - 0xAC00;
    if (c < 0 || c > 11171) return [ch];
    const cho = Math.floor(c / 588), jung = Math.floor((c % 588) / 28), jong = c % 28;
    return [CHO[cho], JUNG[jung], JONG[jong]];
  };
})();
