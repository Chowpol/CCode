/* Shared UI pieces used across screens. Each returns an HTML string. */
(function (BP) {
  const e = BP.esc;
  const C = BP.C = {};

  C.title = function (title, sub) {
    return `<div class="title-block"><h1 class="h1">${e(title)}</h1>${sub ? `<p class="sub">${e(sub)}</p>` : ''}</div>`;
  };

  C.back = function (href, label, right) {
    return `<div class="row" style="padding-top:4px">
      <a href="${href}" class="row" style="gap:6px;font-size:17px;font-weight:600">${BP.icon.back}${e(label)}</a>
      <span class="spacer"></span>${right || ''}
    </div>`;
  };

  // Snapshot strip — shared by Odds, Arbitrage, Middles, +EV and Simulator.
  C.snapshot = function () {
    const st = BP.S.scenario.snapshot;
    if (st === 'delayed') {
      return `<div class="snap delayed" role="status"><span class="dot"></span>Update delayed · last captured ${BP.time(BP.CAPTURED_AT)}<span class="spacer"></span><span class="est">${BP.ago(BP.CAPTURED_AT)}</span></div>`;
    }
    if (st === 'unavailable') {
      return `<div class="snap unavailable" role="status"><span class="dot"></span>Updates unavailable · showing ${BP.time(BP.CAPTURED_AT)} prices</div>`;
    }
    return `<div class="snap" role="status"><span class="dot"></span>Captured ${BP.time(BP.CAPTURED_AT)} · next update ~${BP.time(BP.NEXT_CAPTURE)}<span class="spacer"></span><span class="est">est.</span></div>`;
  };

  C.regionRow = function () {
    return `<div class="row">
      <button class="chip solid" data-act="toast" data-arg="Region is set from your location. Australian bookmakers shown.">Australia <span class="caret">⌄</span></button>
      <span class="spacer"></span>
      <button class="chip ghost" data-act="sheet" data-arg="tz">${e(BP.tzLabel())} <span class="caret">⌄</span></button>
    </div>`;
  };

  C.sportChips = function (counts, current, act) {
    const keys = Object.keys(counts);
    return `<div class="chips" role="tablist">${keys.map(k => {
      const label = k === 'all' ? 'All' : k;
      const n = counts[k];
      return `<button class="chip ${current === k ? 'on' : ''}" role="tab" aria-selected="${current === k}" data-act="${act}" data-arg="${k}">${label}${n != null ? ' ' + n : ''}</button>`;
    }).join('')}</div>`;
  };

  C.footer = function (lines) {
    return `<div class="footer-notes">${(lines || []).map(l => `<span>${e(l)}</span>`).join('')}<span class="rg">18+ · Gamble responsibly</span></div>
      <div class="reserved">Reserved slot · future gambling messaging</div>`;
  };

  C.skeleton = function (n) {
    let out = '';
    for (let i = 0; i < (n || 2); i++) {
      out += `<div class="card" aria-hidden="true">
        <div class="skel" style="height:16px;width:48px"></div>
        <div class="skel" style="height:18px;width:70%"></div>
        <div class="skel" style="height:12px;width:100%"></div>
        <div class="row"><div class="skel" style="height:40px;flex:1"></div><div class="skel" style="height:40px;flex:1"></div></div>
      </div>`;
    }
    return `<div class="stack lg" role="status" aria-label="Loading">${out}</div>`;
  };

  C.empty = function (title, body, action) {
    return `<div class="empty"><b>${e(title)}</b><p>${e(body)}</p>${action || ''}</div>`;
  };

  C.acc = function (id, label, open, body, cls) {
    return `<button class="acc-head ${cls || ''}" aria-expanded="${!!open}" data-act="toggle-open" data-arg="${id}">${label}<span class="chev">${BP.icon.chev}</span></button>${open ? body : ''}`;
  };

  C.sportTag = function (s, flat) { return `<span class="tag sport ${flat ? 'flat' : ''}">${e(s)}</span>`; };

  C.statusTag = function (status) {
    if (status === 'won') return '<span class="tag lime">WON</span>';
    if (status === 'lost') return '<span class="tag red">LOST</span>';
    return '<span class="tag lime">PENDING</span>';
  };

  // Settled pick card — public for everyone.
  C.resultCard = function (p, laneLabel) {
    const u = BP.unitsFor(p);
    return `<a class="card raised tight link" href="#/pick/${p.id}">
      <div class="row">${C.sportTag(p.sport, true)}<span class="dim small">${e(laneLabel)} · ${e(p.matchup)}</span><span class="spacer"></span>${C.statusTag(p.status)}</div>
      <div class="row">
        <div style="flex:1;min-width:0"><div style="font-weight:700">${e(p.player)}</div><div class="muted small">${e(p.market)} · ${e(p.selection)}</div></div>
        <div style="text-align:right"><div style="font-weight:800">${BP.odds(p.price)}</div><div class="${u >= 0 ? 'pos' : 'neg'}" style="font-weight:700;font-size:13px">${BP.units(u)}</div></div>
      </div>
      <div class="row"><span class="dim tiny">${BP.when(p.start)} · ${e(p.book)} · result ${e(p.result || '')}</span><span class="spacer"></span><span class="mono">Settled ${BP.time(p.settledAt)}</span></div>
    </a>`;
  };
})(window.BP);
