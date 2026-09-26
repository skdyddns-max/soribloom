/* 소리블룸 — 선생님 화면(PIN · 아동 설정 · 링크 · 결과) */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const PAIRS = window.SB_PAIRS, GROUPS = window.SB_GROUPS;
  const pairById = Object.fromEntries(PAIRS.map(p => [p.id, p]));
  const groupLabel = Object.fromEntries([...GROUPS.jong, ...GROUPS.cho].map(g => [g.id, g.label]));
  let children = [], current = null, editing = null;

  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); }
  async function sha256(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  const fmtDate = iso => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const genCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };

  /* ---- PIN ---- */
  async function gate() {
    if (sessionStorage.getItem('sb.teacher') === '1') { $('#t-main').classList.remove('hidden'); boot(); return; }
    $('#t-pin').classList.remove('hidden');
    $('#pinform').onsubmit = async e => {
      e.preventDefault();
      if (await sha256($('#pin').value.trim()) === TEACHER_PIN_HASH) { sessionStorage.setItem('sb.teacher', '1'); $('#t-pin').classList.add('hidden'); $('#t-main').classList.remove('hidden'); boot(); }
      else $('#pinerr').textContent = 'PIN이 맞지 않아요.';
    };
  }

  /* ---- 탭 ---- */
  function showTab(k) {
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === k));
    $('#tab-list').classList.toggle('hidden', k !== 'list');
    $('#tab-new').classList.toggle('hidden', k !== 'new');
    $('#tab-detail-body').classList.toggle('hidden', k !== 'detail');
    if (k === 'detail') $('#tab-detail').classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  /* ---- 목록 ---- */
  async function loadList() {
    const r = await SBStore.listChildren(); children = r.children;
    $('#online').textContent = r.online ? '● 서버 연결됨' : '○ 서버 연결 안 됨(로컬)';
    $('#netnotice').innerHTML = r.online ? '' : `<div class="notice" style="margin-bottom:12px">⚠️ Supabase에 연결되지 않아 이 브라우저에 저장된 목록만 보여요. 링크는 설정이 동봉돼 있어 부모님 폰에서는 정상 작동하지만, 결과는 서버가 복구된 뒤 수집돼요.${r.error ? ` <span class="muted">(${r.error})</span>` : ''}</div>`;
    $('#children').innerHTML = children.length ? children.map(c => `
      <div class="item" data-code="${c.code}">
        <span style="font-size:22px">🧒</span>
        <div class="grow"><div class="title">${c.nick || '(별칭 없음)'} <span class="muted">· ${c.code}</span></div>
        <div class="meta">${c.pairs.length}쌍 · ${c.n}문항 · ${[...new Set(c.pairs.map(id => pairById[id]?.group))].map(g => groupLabel[g]?.split(' ')[0]).join(', ')}</div></div>
        <span class="muted">›</span>
      </div>`).join('') : '<p class="muted">아직 등록한 아동이 없어요. ‘＋ 새 아동’에서 만들어 주세요.</p>';
    $$('#children .item').forEach(el => el.onclick = () => openDetail(el.dataset.code));
  }

  /* ---- 새 아동 폼 ---- */
  function renderGroups() {
    const box = (kind) => GROUPS[kind].map(g => {
      const ps = PAIRS.filter(p => p.group === g.id);
      return `<div class="group-box" data-g="${g.id}">
        <label class="chk"><input type="checkbox" class="gchk" data-g="${g.id}"><span><b>${g.label}</b><br><span class="desc">${g.desc}</span></span></label>
        <div class="pairs">${ps.map(p => `<label><input type="checkbox" class="pchk" data-g="${g.id}" value="${p.id}">${p.a}/${p.b}</label>`).join('')}</div>
      </div>`;
    }).join('');
    $('#groups-jong').innerHTML = box('jong'); $('#groups-cho').innerHTML = box('cho');
    $$('.gchk').forEach(g => g.onchange = () => { $$(`.pchk[data-g="${g.dataset.g}"]`).forEach(p => p.checked = g.checked); count(); });
    $$('.pchk').forEach(p => p.onchange = () => { const g = p.dataset.g; $(`.gchk[data-g="${g}"]`).checked = $$(`.pchk[data-g="${g}"]`).every(x => x.checked); count(); });
  }
  function selected() { return $$('.pchk:checked').map(p => p.value); }
  function count() { const n = selected().length; $('#selcount').textContent = n ? `선택된 대립쌍 ${n}개` : '대립쌍을 1개 이상 선택해 주세요.'; }
  function fillForm(c) {
    editing = c || null; $('#formtitle').textContent = c ? `목표 수정 · ${c.nick}` : '새 아동';
    $('#nick').value = c?.nick || ''; $('#n').value = c?.n || 10; $('#retry').checked = c ? !!c.retry : true;
    $('#showText').checked = c ? c.showText !== false : true; $('#showJamo').checked = c ? c.showJamo !== false : true;
    const set = new Set(c?.pairs || []); $$('.pchk').forEach(p => p.checked = set.has(p.value));
    $$('.gchk').forEach(g => g.checked = $$(`.pchk[data-g="${g.dataset.g}"]`).every(x => x.checked));
    count();
  }
  async function save() {
    const pairs = selected(); if (!pairs.length) { toast('대립쌍을 선택해 주세요'); return; }
    const nick = $('#nick').value.trim(); if (!nick) { toast('별칭을 입력해 주세요'); $('#nick').focus(); return; }
    const c = { ...(editing || { code: genCode(), created: Date.now() }), nick, pairs, n: +$('#n').value, retry: $('#retry').checked, showText: $('#showText').checked, showJamo: $('#showJamo').checked, updated: Date.now() };
    $('#save').disabled = true; const r = await SBStore.saveChild(c); $('#save').disabled = false;
    toast(r.online ? '저장했어요' : '이 브라우저에 저장했어요(서버 미연결)');
    await loadList(); openDetail(c.code);
  }

  /* ---- 상세 ---- */
  async function openDetail(code) {
    current = children.find(c => c.code === code) || await SBStore.getChild(code); if (!current) return;
    showTab('detail');
    $('#d-title').textContent = `${current.nick} · ${current.code}`;
    $('#d-meta').textContent = `${current.n}문항/세트 · 재시도 ${current.retry ? '켬' : '끔'} · 글자 ${current.showText === false ? '숨김' : '표시'} · 만든 날 ${new Date(current.created).toLocaleDateString('ko-KR')}`;
    $('#d-targets').innerHTML = current.pairs.map(id => `<span class="chip wash">${pairById[id].a}/${pairById[id].b}</span>`).join('');
    const link = SBStore.childLink(current); $('#d-link').value = link;
    $('#qr').innerHTML = ''; if (window.qrcode) { try { const q = qrcode(0, 'M'); q.addData(link); q.make(); $('#qr').innerHTML = q.createSvgTag({ cellSize: 3, margin: 3, scalable: true }); $('#qr svg').style.width = '200px'; } catch (e) { $('#qr').innerHTML = '<p class="muted">QR을 만들 수 없어요(링크가 너무 길어요)</p>'; } }
    $('#copy').onclick = () => navigator.clipboard.writeText(link).then(() => toast('링크를 복사했어요'));
    $('#copymsg').onclick = () => navigator.clipboard.writeText(`[소리블룸 홈워크] ${current.nick} 어머님/아버님, 오늘 배운 소리 구별 연습이에요. 하루 1~2번, 아이가 소리를 듣고 그림을 누르게 해 주세요. 끝나면 결과가 저에게 자동으로 전달돼요 🌱\n${link}`).then(() => toast('안내 문구를 복사했어요'));
    $('#share').onclick = () => { if (navigator.share) navigator.share({ title: '소리블룸', text: `${current.nick} 소리 구별 연습`, url: link }).catch(() => {}); else { navigator.clipboard.writeText(link); toast('링크를 복사했어요'); } };
    $('#preview').onclick = () => window.open(link, '_blank');
    $('#edit').onclick = () => { fillForm(current); showTab('new'); };
    $('#del').onclick = async () => { if (confirm(`${current.nick}(${current.code}) 설정을 삭제할까요? 기록은 서버에 남아요.`)) { await SBStore.deleteChild(current.code); toast('삭제했어요'); await loadList(); showTab('list'); } };
    renderResults(code);
  }
  async function renderResults(code) {
    $('#d-sessions').innerHTML = '<p class="muted">불러오는 중…</p>';
    const r = await SBStore.listResults(code); const rs = r.results;
    $('#d-count').textContent = `${rs.length}회${r.online ? '' : ' (로컬)'}`;
    if (!rs.length) { $('#d-trend').innerHTML = '<p class="muted" style="margin:auto">아직 기록이 없어요</p>'; $('#d-pairs').innerHTML = ''; $('#d-sessions').innerHTML = '<p class="muted">부모님이 연습을 마치면 여기에 쌓여요.</p>'; return; }
    const asc = [...rs].reverse().slice(-20);
    $('#d-trend').innerHTML = asc.map(s => `<b class="${s.pct < 60 ? 'low' : ''}" style="height:${Math.max(6, s.pct)}%" title="${fmtDate(s.at)} ${s.pct}%"></b>`).join('');
    const agg = {}; rs.forEach(s => Object.entries(s.byPair || {}).forEach(([id, b]) => { const a = agg[id] || (agg[id] = { n: 0, first: 0 }); a.n += b.n; a.first += b.first; }));
    $('#d-pairs').innerHTML = '<tr><th>대립쌍</th><th>맞힘</th><th>정확도</th></tr>' + Object.entries(agg).sort((a, b) => (a[1].first / a[1].n) - (b[1].first / b[1].n)).map(([id, a]) => {
      const p = pairById[id] || { a: id, b: '' }, pct = Math.round(a.first / a.n * 100);
      return `<tr><td>${p.a}/${p.b} <span class="muted">${groupLabel[p.group]?.split(' ')[0] || ''}</span></td><td class="num">${a.first}/${a.n}</td><td style="width:40%"><div class="row" style="gap:6px"><div class="bar ${pct < 60 ? 'low' : ''}" style="flex:1"><b style="width:${pct}%"></b></div><span class="num" style="min-width:38px;text-align:right">${pct}%</span></div></td></tr>`;
    }).join('');
    $('#d-sessions').innerHTML = rs.map(s => {
      const worst = Object.entries(s.byPair || {}).filter(([, b]) => b.first < b.n).map(([id, b]) => `${pairById[id]?.a}/${pairById[id]?.b} ${b.first}/${b.n}`).join(', ');
      return `<div class="session"><span class="muted">${fmtDate(s.at)}</span><span>${s.first}/${s.n}${s.second ? ` <span class="muted">(+${s.second} 재시도)</span>` : ''}${worst ? `<br><span class="muted" style="font-size:13px">틀린 쌍: ${worst}</span>` : ''}</span><span class="pct">${s.pct}%</span></div>`;
    }).join('');
  }

  async function boot() {
    renderGroups(); fillForm(null);
    $$('.tabs button').forEach(b => b.onclick = () => { if (b.dataset.tab === 'new') fillForm(null); showTab(b.dataset.tab); });
    $('#save').onclick = save; $('#cancel').onclick = () => showTab(current ? 'detail' : 'list');
    $('#refresh').onclick = loadList;
    await loadList();
    const qs = new URLSearchParams(location.search); if (qs.get('c')) openDetail(qs.get('c'));
  }
  document.addEventListener('DOMContentLoaded', gate);
})();
