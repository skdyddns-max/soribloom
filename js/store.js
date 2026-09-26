/* 소리블룸 저장 계층 — Supabase REST + localStorage 캐시/아웃박스
 * 서버가 꺼져 있어도(일시중지·오프라인) 앱은 동작하고, 결과는 아웃박스에 쌓였다가 다음 기회에 전송된다. */
window.SBStore = (function () {
  const cfg = (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG) || window.SUPABASE_CONFIG || {};
  const enabled = !!(cfg.url && cfg.anonKey && !/xxxx/.test(cfg.url));
  const LS = {
    children: 'sb.children',   // 선생님 화면 로컬 캐시 {code: config}
    outbox: 'sb.outbox',       // 미전송 결과 [result]
    history: 'sb.history.',    // + code → [result] (부모 폰 로컬 이력)
  };
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  async function rest(path, opt = {}) {
    if (!enabled) throw new Error('supabase-disabled');
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), opt.timeout || 8000);
    try {
      const r = await fetch(cfg.url + '/rest/v1/' + path, {
        method: opt.method || 'GET', signal: ctl.signal,
        headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Content-Type': 'application/json', Prefer: opt.prefer || 'return=representation' },
        body: opt.body ? JSON.stringify(opt.body) : undefined,
      });
      if (!r.ok) throw new Error('http-' + r.status + ' ' + (await r.text()).slice(0, 120));
      const txt = await r.text(); return txt ? JSON.parse(txt) : null;
    } finally { clearTimeout(t); }
  }

  /* ---- 아동 설정 ---- */
  async function saveChild(config) {
    const all = lsGet(LS.children, {}); all[config.code] = config; lsSet(LS.children, all);
    if (!enabled) return { online: false };
    try {
      await rest(cfg.childTable + '?on_conflict=code', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { code: config.code, data: config, updated_at: new Date().toISOString() } });
      return { online: true };
    } catch (e) { return { online: false, error: String(e.message || e) }; }
  }
  async function getChild(code) {
    if (enabled) {
      try {
        const rows = await rest(cfg.childTable + '?code=eq.' + encodeURIComponent(code) + '&select=data');
        if (rows && rows[0]) { const all = lsGet(LS.children, {}); all[code] = rows[0].data; lsSet(LS.children, all); return rows[0].data; }
      } catch {}
    }
    return lsGet(LS.children, {})[code] || null;
  }
  async function listChildren() {
    const local = lsGet(LS.children, {});
    if (enabled) {
      try {
        const rows = await rest(cfg.childTable + '?select=data,updated_at&order=updated_at.desc');
        rows.forEach(r => { local[r.data.code] = r.data; }); lsSet(LS.children, local);
        return { online: true, children: Object.values(local).sort((a, b) => (b.created || 0) - (a.created || 0)) };
      } catch (e) { return { online: false, error: String(e.message || e), children: Object.values(local).sort((a, b) => (b.created || 0) - (a.created || 0)) }; }
    }
    return { online: false, children: Object.values(local) };
  }
  async function deleteChild(code) {
    const all = lsGet(LS.children, {}); delete all[code]; lsSet(LS.children, all);
    if (enabled) { try { await rest(cfg.childTable + '?code=eq.' + encodeURIComponent(code), { method: 'DELETE', prefer: 'return=minimal' }); } catch {} }
  }

  /* ---- 결과 ---- */
  async function saveResult(result) {
    const h = lsGet(LS.history + result.code, []); h.unshift(result); lsSet(LS.history + result.code, h.slice(0, 200));
    const out = lsGet(LS.outbox, []); out.push(result); lsSet(LS.outbox, out);
    return flushOutbox();
  }
  async function flushOutbox() {
    const out = lsGet(LS.outbox, []);
    if (!out.length) return { sent: 0, pending: 0, online: enabled };
    if (!enabled) return { sent: 0, pending: out.length, online: false };
    let sent = 0;
    for (const r of [...out]) {
      try {
        await rest(cfg.resultTable, { method: 'POST', prefer: 'return=minimal', body: { code: r.code, at: r.at, data: r } });
        out.splice(out.indexOf(r), 1); sent++; lsSet(LS.outbox, out);
      } catch (e) { return { sent, pending: out.length, online: false, error: String(e.message || e) }; }
    }
    return { sent, pending: 0, online: true };
  }
  function localHistory(code) { return lsGet(LS.history + code, []); }
  async function listResults(code) {
    if (enabled) {
      try {
        const rows = await rest(cfg.resultTable + '?code=eq.' + encodeURIComponent(code) + '&select=data,at&order=at.desc&limit=200');
        return { online: true, results: rows.map(r => r.data) };
      } catch (e) { return { online: false, error: String(e.message || e), results: localHistory(code) }; }
    }
    return { online: false, results: localHistory(code) };
  }
  async function ping() {
    if (!enabled) return { ok: false, reason: 'disabled' };
    try { await rest(cfg.childTable + '?select=code&limit=1', { timeout: 5000 }); return { ok: true }; }
    catch (e) { return { ok: false, reason: String(e.message || e) }; }
  }

  /* ---- 링크 인코딩(설정을 URL 해시에 동봉 → 서버 없이도 열림) ---- */
  const b64u = {
    enc: s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))),
  };
  function encodeConfig(c) { return b64u.enc(JSON.stringify(c)); }
  function decodeConfig(s) { try { return JSON.parse(b64u.dec(s)); } catch { return null; } }
  function childLink(config) {
    const base = location.href.replace(/[^/]*$/, '').replace(/teacher\.html.*$/, '');
    return base + 'index.html?c=' + config.code + '#' + encodeConfig(config);
  }

  return { enabled, saveChild, getChild, listChildren, deleteChild, saveResult, flushOutbox, listResults, localHistory, ping, encodeConfig, decodeConfig, childLink };
})();
