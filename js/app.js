/* 소리블룸 — 부모용 연습 화면(듣고 고르기 2택1) */
(function () {
  const $ = s => document.querySelector(s);
  const W = window.SB_WORDS, PAIRS = window.SB_PAIRS, PH = window.SB_PHRASES, JAMO = window.SB_JAMO;
  const pairById = Object.fromEntries(PAIRS.map(p => [p.id, p]));
  const V = 'v=' + (typeof SB_VER !== 'undefined' ? SB_VER : '1');

  /* ---------- 설정 로드(URL 해시 → 서버 → 기본) ---------- */
  const qs = new URLSearchParams(location.search);
  const code = qs.get('c') || '';
  let config = null;

  async function loadConfig() {
    const h = location.hash.slice(1);
    if (h) config = SBStore.decodeConfig(h);
    if (!config && code) config = await SBStore.getChild(code);
    if (!config) config = { code: code || 'demo', nick: '', pairs: PAIRS.filter(p => p.kind === 'jong').map(p => p.id), ...SB_DEFAULTS, demo: true };
    config = { ...SB_DEFAULTS, ...config };
    config.pairs = (config.pairs || []).filter(id => pairById[id]);
    if (!config.pairs.length) config.pairs = PAIRS.filter(p => p.kind === 'jong').map(p => p.id);
    // 서버에 최신 설정이 있으면 갱신(선생님이 목표를 바꾼 경우)
    if (code && !config.demo) SBStore.getChild(code).then(c => { if (c && c.updated && c.updated > (config.updated || 0)) { config = { ...SB_DEFAULTS, ...c }; } });
  }

  /* ---------- 오디오 ---------- */
  const cache = {};
  function audio(id) { if (!cache[id]) { const a = new Audio('audio/' + id + '.mp3?' + V); a.preload = 'auto'; cache[id] = a; } return cache[id]; }
  function play(id) {
    return new Promise(res => {
      const a = audio(id); let done = false; const fin = () => { if (!done) { done = true; a.onended = a.onerror = null; res(); } };
      try { a.currentTime = 0; } catch {}
      a.onended = fin; a.onerror = fin; a.play().catch(fin);
      setTimeout(fin, 4000);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function unlockAudio() { Object.values(PH).forEach(p => audio(p.file)); }

  /* ---------- 문항 구성 ---------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function buildItems() {
    const n = +config.n || 10; const items = []; let side = Math.random() < .5;
    while (items.length < n) {
      for (const id of shuffle([...config.pairs])) {
        if (items.length >= n) break;
        const p = pairById[id]; const target = side ? p.a : p.b; side = !side;
        if (items.length && items[items.length - 1].pair === id && config.pairs.length > 1) continue;
        items.push({ pair: id, target, other: target === p.a ? p.b : p.a, left: Math.random() < .5 ? p.a : p.b });
      }
    }
    return items;
  }

  /* ---------- 렌더 ---------- */
  function diffIndex(pair) { const a = JAMO(pair.a), b = JAMO(pair.b); for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return i; return 2; }
  function picHTML(w) {
    const d = W[w];
    if (d.number != null) return `<span class="num">${d.number}</span>`;
    return `<img src="img/${d.img}.jpg?${V}" alt="${w}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${d.emoji}'}))">`;
  }
  function jamoHTML(w, pair) {
    const j = JAMO(w), di = diffIndex(pair);
    return '<div class="jamo">' + j.map((c, i) => {
      if (i === 2 && !c) return `<i class="${di === 2 ? 'none hl' : 'none'}">·</i>`;
      return `<i class="${i === di ? 'hl' : ''}">${c}</i>`;
    }).join('') + '</div>';
  }
  function choiceHTML(w, pair) {
    return `<button class="choice" data-w="${w}" aria-label="${w}">
      <div class="pic">${picHTML(w)}</div>
      ${config.showText ? `<div class="word">${w}</div>` : ''}
      ${config.showText && config.showJamo ? jamoHTML(w, pair) : ''}
    </button>`;
  }

  const screens = { start: $('#s-start'), play: $('#s-play'), end: $('#s-end') };
  function show(k) { Object.entries(screens).forEach(([n, el]) => el.classList.toggle('hidden', n !== k)); window.scrollTo(0, 0); }

  /* ---------- 진행 ---------- */
  let items = [], idx = 0, log = [], busy = false, t0 = 0;
  const SPK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>`;

  function renderProgress() {
    $('#progress').innerHTML = items.map((it, i) => {
      const r = log[i]; let cls = i === idx ? 'cur' : '';
      if (r) cls += r.first ? ' ok' : (r.second ? ' half' : ' bad');
      return `<i class="${cls.trim()}"></i>`;
    }).join('');
  }
  async function startSet() {
    unlockAudio(); items = buildItems(); idx = 0; log = [];
    show('play'); renderProgress();
    await play(PH.intro.file); await wait(200);
    trial();
  }
  async function trial() {
    const it = items[idx], pair = pairById[it.pair]; busy = true;
    $('#hint').textContent = ''; $('#hint').className = 'hint';
    const right = it.left === pair.a ? pair.b : pair.a;
    $('#choices').innerHTML = choiceHTML(it.left, pair) + choiceHTML(right, pair);
    $('#counter').textContent = `${idx + 1} / ${items.length}`;
    renderProgress();
    document.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => answer(b)));
    await wait(350); await sayTarget(); busy = false; t0 = Date.now();
  }
  async function sayTarget() {
    const it = items[idx]; const sp = $('#speaker'); sp.classList.add('playing');
    await play(W[it.target].img); sp.classList.remove('playing');
  }
  let attempt = 0;
  async function answer(btn) {
    if (busy) return; busy = true;
    const it = items[idx], w = btn.dataset.w, ok = w === it.target, rt = Date.now() - t0;
    const cards = [...document.querySelectorAll('.choice')]; cards.forEach(c => c.classList.add('locked'));
    if (ok) {
      btn.classList.add('correct'); cards.filter(c => c !== btn).forEach(c => c.classList.add('dim'));
      if (attempt === 0) log[idx] = { pair: it.pair, target: it.target, first: true, second: null, rt };
      else log[idx].second = true;
      $('#hint').textContent = '맞았어요! 잘했어요 👏'; $('#hint').className = 'hint good';
      renderProgress(); await play(PH.correct.file); await wait(400);
      attempt = 0; next(); return;
    }
    btn.classList.add('wrong');
    if (attempt === 0 && config.retry) {
      attempt = 1; log[idx] = { pair: it.pair, target: it.target, first: false, second: null, rt, firstPick: w };
      $('#hint').textContent = '다시 한번 들어 볼까요?'; $('#hint').className = 'hint bad';
      await play(PH.retry.file); await wait(200);
      // 두 단어를 차례로 들려주며 카드 강조
      btn.classList.remove('wrong');
      for (const c of cards) {
        c.classList.add('listen'); await play(W[c.dataset.w].img); await wait(350); c.classList.remove('listen');
      }
      $('#hint').textContent = '이번엔 어떤 소리일까요?'; $('#hint').className = 'hint';
      await wait(200); await sayTarget();
      cards.forEach(c => c.classList.remove('locked')); busy = false; t0 = Date.now(); return;
    }
    // 두 번째 오답(또는 재시도 꺼짐): 정답 보여주기
    if (attempt === 0) log[idx] = { pair: it.pair, target: it.target, first: false, second: null, rt, firstPick: w };
    else log[idx].second = false;
    const good = cards.find(c => c.dataset.w === it.target); good.classList.add('correct'); btn.classList.add('dim');
    $('#hint').textContent = `정답은 '${it.target}'이에요`; $('#hint').className = 'hint';
    renderProgress(); await play(PH.reveal.file); await wait(150); await play(W[it.target].img); await wait(500);
    attempt = 0; next();
  }
  function next() { idx++; if (idx >= items.length) finish(); else trial(); }

  /* ---------- 결과 ---------- */
  function summarize() {
    const byPair = {};
    log.forEach(r => { const b = byPair[r.pair] || (byPair[r.pair] = { n: 0, first: 0, second: 0 }); b.n++; if (r.first) b.first++; else if (r.second) b.second++; });
    const first = log.filter(r => r.first).length, second = log.filter(r => !r.first && r.second).length;
    return { code: config.code, nick: config.nick || '', at: new Date().toISOString(), n: log.length, first, second, pct: Math.round(first / log.length * 100), items: log, byPair, ver: (typeof SB_VER !== 'undefined' ? SB_VER : '1') };
  }
  async function finish() {
    const s = summarize(); show('end');
    $('#score').textContent = `${s.first} / ${s.n}`;
    const stars = s.pct >= 90 ? 3 : s.pct >= 70 ? 2 : 1; $('#stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('#endmsg').textContent = s.pct >= 90 ? '정말 잘했어요! 소리를 아주 잘 구별했어요.' : s.pct >= 70 ? '잘했어요! 조금만 더 연습하면 완벽해요.' : '잘 듣고 있어요. 내일 또 해 봐요!';
    $('#pairtable').innerHTML = `<tr><th>대립쌍</th><th>맞힘</th><th>정확도</th></tr>` + Object.entries(s.byPair).map(([id, b]) => {
      const p = pairById[id], pct = Math.round(b.first / b.n * 100);
      return `<tr><td>${p.a} / ${p.b}</td><td class="num">${b.first}${b.second ? `<span class="muted"> (+${b.second})</span>` : ''} / ${b.n}</td><td style="width:38%"><div class="bar ${pct < 60 ? 'low' : ''}"><b style="width:${pct}%"></b></div></td></tr>`;
    }).join('');
    play(PH.done.file);
    if (config.demo) { $('#sync').innerHTML = '<div class="notice">체험 모드예요. 선생님이 만든 링크로 열면 결과가 자동 전송돼요.</div>'; return; }
    $('#sync').innerHTML = '<div class="notice">결과 전송 중…</div>';
    const r = await SBStore.saveResult(s);
    $('#sync').innerHTML = r.online && r.pending === 0
      ? '<div class="notice ok">✅ 선생님께 결과가 전송됐어요.</div>'
      : `<div class="notice">📱 결과를 이 폰에 저장했어요. 인터넷이 연결되면 자동으로 전송돼요.${r.pending ? ` (대기 ${r.pending}건)` : ''}</div>`;
    $('#sync').insertAdjacentHTML('beforeend', `<div class="row center" style="margin-top:10px"><button class="btn ghost sm" id="copyres">결과 복사</button></div>`);
    $('#copyres').onclick = () => {
      const txt = `[소리블룸] ${s.nick} ${new Date(s.at).toLocaleDateString('ko-KR')} — ${s.first}/${s.n} (${s.pct}%)\n` + Object.entries(s.byPair).map(([id, b]) => `${pairById[id].a}/${pairById[id].b} ${b.first}/${b.n}`).join(', ');
      navigator.clipboard?.writeText(txt).then(() => toast('복사했어요. 카톡으로 보내 주세요.'));
    };
  }

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); }

  /* ---------- 시작 화면 ---------- */
  function renderStart() {
    const nick = config.nick ? `${config.nick}${/[가-힣]$/.test(config.nick) && (config.nick.charCodeAt(config.nick.length - 1) - 0xAC00) % 28 ? '아' : '야'}, ` : '';
    $('#greet').textContent = `${nick}잘 듣고 골라 보자!`;
    const groups = [...new Set(config.pairs.map(id => pairById[id].group))];
    const labels = [...window.SB_GROUPS.jong, ...window.SB_GROUPS.cho].filter(g => groups.includes(g.id)).map(g => g.label);
    $('#targets').innerHTML = labels.map(l => `<span class="chip wash">${l}</span>`).join(' ');
    $('#setinfo').textContent = `한 번에 ${config.n}문항 · 대립쌍 ${config.pairs.length}개`;
    const hist = SBStore.localHistory(config.code);
    $('#history').innerHTML = hist.length ? `<p class="muted">최근 기록: ${hist.slice(0, 5).map(h => `${new Date(h.at).getMonth() + 1}/${new Date(h.at).getDate()} ${h.pct}%`).join(' · ')}</p>` : '';
    if (config.demo) $('#demo').classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig(); renderStart(); show('start');
    $('#speaker').innerHTML = SPK + '<span>다시 듣기</span>';
    $('#btn-start').onclick = startSet;
    $('#speaker').onclick = () => { if (!busy) { busy = true; sayTarget().then(() => { busy = false; }); } };
    $('#btn-again').onclick = startSet;
    $('#btn-home').onclick = () => { renderStart(); show('start'); };
    SBStore.flushOutbox();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  });
})();
