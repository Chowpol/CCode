/* Picks (flow B4): Piggy's Picks, paywall, Inside the Pick, Results. */
(function (BP) {
  const S = BP.S, C = BP.C, e = BP.esc;
  const LANES = { piggy: 'Piggy’s Picks', alt: 'Alt Picks', degen: 'Degen Zone', multis: 'Multis' };
  const locked = () => S.scenario.access === 'free';

  /* ---------------- Pick cards ---------------- */
  function analysis(p) {
    const a = p.analysis;
    if (!a) return '';
    return `<div class="inset tiles" style="padding:10px">
        <div style="flex:1"><div class="dim tiny">Simulated average</div><b>${a.simAvg}</b></div>
        <div style="flex:1"><div class="dim tiny">Estimated chance</div><b>${BP.pct(a.chance)}</b></div>
        <div style="flex:1"><div class="dim tiny">${e(a.lastLabel)}</div><b>${e(a.lastN)}</b></div>
      </div>
      <p class="muted small" style="margin:0">${e(a.note)}</p>
      <p class="muted small" style="margin:0">The historical count uses this exact line. Historical frequency is not model probability.</p>
      <p class="dim small" style="margin:0">Source: The Eye · 100,000 simulations<br>Assessed ${BP.time(p.publishedAt - 5 * 60000)} · odds captured ${BP.time(p.publishedAt)} ${BP.tzAbbr()}</p>
      <a class="linkish" href="#/pick/${p.id}">Full player stats ↗</a>`;
  }

  C.pickCard = function (p) {
    const open = BP.isOpen('an-' + p.id) || (p.potd && !(S.ui.open && S.ui.open['an-' + p.id] === false));
    const head = p.potd ? `<div class="potd-head"><div style="flex:1"><div class="eyebrow" style="color:var(--text-muted)">TODAY · ${e(BP.day(BP.NOW).toUpperCase())}</div><div class="t">PICK OF THE DAY</div></div><span class="accent" style="font-size:22px" aria-hidden="true">☆</span></div>` : '';
    return `<article class="card ${p.potd ? 'featured' : ''}" style="${p.potd ? '' : 'padding:0;gap:0'}">
      ${head}
      <div class="pick-body">
        <div class="row">${C.sportTag(p.sport, true)}<span class="dim small" style="flex:1">${e(p.matchup)}</span>${p.confident ? '<span class="tag lime">CONFIDENT</span>' : ''}</div>
        <div><div class="who">${e(p.player)}</div><div class="dim small">${e(BP.when(p.start))} ${BP.tzAbbr()}</div></div>
        <div class="sel">${e(p.selection)}</div>
        <div class="divider"></div>
        <div class="row"><span class="price ${p.potd ? 'accent' : ''}">${BP.odds(p.price)}</span><span class="small" style="font-weight:500">${e(p.book)}</span><span class="spacer"></span><span class="dim small">${p.units}u</span></div>
        <div class="muted tiny">Best available at publication · ${e(BP.when(p.publishedAt))} ${BP.tzAbbr()}</div>
        <div class="divider"></div>
        <button class="acc-head" aria-expanded="${open}" data-act="toggle-analysis" data-arg="${p.id}" data-potd="${p.potd ? 1 : ''}" style="font-size:13px">${open ? 'Hide analysis' : 'View analysis'}<span class="chev">${BP.icon.chev}</span></button>
        ${open ? analysis(p) : ''}
      </div>
    </article>`;
  };

  function lockedPotd(p) {
    return `<article class="card featured">
      <div class="potd-head"><div style="flex:1"><div class="eyebrow" style="color:var(--text-muted)">TODAY · ${e(BP.day(BP.NOW).toUpperCase())}</div><div class="t">PICK OF THE DAY</div></div><span class="accent" style="font-size:22px" aria-hidden="true">☆</span></div>
      <div class="pick-body">
        <div class="row">${C.sportTag(p.sport, true)}<span class="dim small">${e(p.matchup)}</span></div>
        <div class="who">${e(p.player)}</div>
        <div class="row"><span class="sel" style="filter:blur(7px);user-select:none" aria-hidden="true">Over 0.0 market</span><span class="sr-only">Selection hidden</span><span class="spacer"></span><span class="tag grey">🔒 Trial</span></div>
        <button class="btn primary" data-act="go" data-arg="#/picks">See what a trial includes</button>
      </div>
    </article>`;
  }

  function gate(list) {
    const days = [...new Set(list.map(p => BP.day(p.start)))];
    const sports = [...new Set(list.map(p => p.sport))];
    const label = `${list.length} ${sports.length === 1 ? sports[0] + ' ' : ''}pick${list.length > 1 ? 's' : ''}${days.length === 1 ? ' · ' + days[0] : ''}`;
    return `<article class="card gate">
      <div class="stack" style="background:rgba(198,255,74,0.06);padding:14px">
        <div class="row"><span class="tag lime">PENDING</span><b class="small">${e(label)}</b></div>
        <p class="muted small" style="margin:0">Piggy’s Picks has ${list.length} pending pick${list.length > 1 ? 's' : ''}. Start a trial to see the player, market, line, odds and units before the start.</p>
        <span class="mono">Published ${BP.time(list[0].publishedAt)}</span>
      </div>
      ${list.map(p => `<div class="locked-row">${C.sportTag(p.sport, true)}<div style="flex:1;min-width:0"><b class="small">${e(p.matchup)}</b><div class="dim tiny">${e(BP.when(p.start))}</div></div><span class="muted small">🔒 Trial</span></div>`).join('')}
      <div class="stack" style="padding:12px 14px 14px">
        <button class="btn primary" data-act="set-access" data-arg="trial" data-toast="Free trial started — pending picks unlocked.">Start free trial</button>
        <a class="btn secondary" href="#/plans">See plans</a>
        <p class="dim tiny center" style="margin:0">Membership includes every pending pick, full analysis and Inside the Pick. No guarantee of profit.</p>
      </div>
    </article>`;
  }

  // Pending list with access gating. Pick of the Day first and counted once.
  C.pickList = function (list, ctx) {
    const sorted = list.slice().sort((a, b) => (b.potd ? 1 : 0) - (a.potd ? 1 : 0) || Date.parse(a.start) - Date.parse(b.start));
    if (locked()) {
      if (ctx !== 'edge') return gate(sorted);
      const potd = sorted.find(p => p.potd);
      const rest = sorted.filter(p => !p.potd);
      return (potd ? lockedPotd(potd) : '') + (rest.length ? gate(rest) : '');
    }
    return `<div class="stack lg">${sorted.map(C.pickCard).join('')}</div>`;
  };

  BP.actions['toggle-analysis'] = function (el) {
    const id = 'an-' + el.dataset.arg;
    S.ui.open = S.ui.open || {};
    const cur = BP.isOpen(id) || (el.dataset.potd && S.ui.open[id] !== false);
    S.ui.open[id] = !cur;
  };

  /* ---------------- Picks screen ---------------- */
  function recordStrip(lane, sport) {
    const list = BP.PICKS.filter(p => p.lane === lane && (sport === 'all' || p.sport === sport));
    const r = BP.record(list);
    return `<div class="card raised tight">
      <div class="row"><span class="tag amber">PAPER-TRADED</span>${sport !== 'all' ? C.sportTag(sport, true) : ''}<span class="muted small" style="font-weight:600">Full game</span><span class="spacer"></span><a class="dim small" href="#/research/method">How we track ›</a></div>
      <div class="row"><div class="record"><span class="wl">${r.w}–${r.l}</span><span class="u ${r.u < 0 ? 'neg' : ''}">${BP.units(r.u)}</span></div><span class="spacer"></span><div style="text-align:right"><div class="eyebrow" style="font-size:8.5px">FRESH RECORD SINCE</div><b class="small">1 Sep 2026</b></div></div>
      <p class="dim small" style="margin:0">${e(LANES[lane])} · ${sport === 'all' ? 'All sports' : e(sport)} · Full game. Tracked at the published odds and stake — no real money placed.</p>
    </div>`;
  }

  Object.assign(BP.actions, {
    'picks-lane': (el) => { S.picks.lane = el.dataset.arg; S.picks.date = 'all'; },
    'picks-sport': (el) => { S.picks.sport = el.dataset.arg; S.picks.date = 'all'; },
    'picks-date': (el) => { S.picks.date = el.dataset.arg; }
  });

  BP.screens.picks = function () {
    const st = S.picks;
    const lanes = [['piggy', 'Piggy’s Picks'], ['alt', 'Alt Picks'], ['degen', 'Degen Zone']];
    const laneList = BP.PICKS.filter(p => p.lane === st.lane);
    const counts = { all: laneList.length };
    BP.SPORTS.forEach(s => { const n = laneList.filter(p => p.sport === s).length; if (n) counts[s] = n; });
    if (st.sport !== 'all' && !counts[st.sport]) st.sport = 'all';
    const bySport = laneList.filter(p => st.sport === 'all' || p.sport === st.sport);
    const pendingAll = bySport.filter(p => p.status === 'pending');
    const dayKeys = [...new Set(pendingAll.map(p => BP.dayKey(p.start)))].sort();
    const pending = pendingAll.filter(p => st.date === 'all' || BP.dayKey(p.start) === st.date);
    const settled = bySport.filter(p => p.status !== 'pending').sort((a, b) => b.settledAt - a.settledAt);
    const lastPub = Math.max.apply(null, BP.PICKS.map(p => p.publishedAt));
    const access = { free: 'FREE', trial: 'TRIAL', paid: 'MEMBER' }[S.scenario.access];
    const dateChip = (key, top, label, n) => `<button class="date-chip ${st.date === key ? 'on' : ''}" data-act="picks-date" data-arg="${key}"><small>${top}</small><span>${label}<span class="ct">${n}</span></span></button>`;

    return `${C.title('Picks', locked() ? 'Settled picks are public. Pending picks unlock with a free trial or paid plan.' : 'Published by the engine. Every pick is graded at its published price.')}
      <nav class="tabs left" aria-label="Lane">${lanes.map(([k, l]) => `<button class="${st.lane === k ? 'on' : ''}" data-act="picks-lane" data-arg="${k}">${l}</button>`).join('')}<a href="#/results?lane=${st.lane}">Results</a></nav>
      <div class="snap" style="background:var(--surface);font-weight:600"><span class="dot"></span><span class="muted">Engine published ${BP.time(lastPub)} · ${e(BP.day(lastPub))}</span><span class="spacer"></span><span class="dim tiny" style="font-weight:700;letter-spacing:.5px">${access}</span></div>
      ${C.sportChips(counts, st.sport, 'picks-sport')}
      ${dayKeys.length ? `<div class="stack"><div class="chips">${dateChip('all', 'ALL', 'Dates', pendingAll.length)}${dayKeys.map(k => { const p = pendingAll.find(x => BP.dayKey(x.start) === k); const [wd, d, m] = BP.day(p.start).split(' '); return dateChip(k, wd.toUpperCase(), `${d} ${m}`, pendingAll.filter(x => BP.dayKey(x.start) === k).length); }).join('')}</div>
        <span class="dim tiny">Counts follow the selected lane and sport · ${e(LANES[st.lane])} · ${st.sport === 'all' ? 'All sports' : e(st.sport)}</span></div>` : ''}
      ${recordStrip(st.lane, st.sport)}
      <div class="row"><span class="eyebrow" style="color:var(--text-muted)">PENDING${st.date !== 'all' && pending[0] ? ' · ' + e(BP.day(pending[0].start).toUpperCase()) : ''}</span><span class="spacer"></span><span class="dim small">${pending.length} pick${pending.length === 1 ? '' : 's'}</span></div>
      ${pending.length ? C.pickList(pending, 'picks') : C.empty('No pending picks', `${LANES[st.lane]} has nothing pending for ${st.sport === 'all' ? 'any sport' : st.sport}. The engine publishes only when a pick clears its edge threshold.`)}
      <div class="row"><span class="eyebrow" style="color:var(--text-muted)">SETTLED · PUBLIC</span><span class="spacer"></span><a class="linkish accent small" href="#/results?lane=${st.lane}">See all results ›</a></div>
      ${settled.length ? `<div class="stack">${settled.slice(0, 3).map(p => C.resultCard(p, LANES[p.lane])).join('')}</div>` : C.empty('Nothing settled yet', 'Settled picks appear here with the result and units.')}
      <p class="dim small" style="margin:0">Settled picks are public: player, market, line, odds, result and units.</p>
      ${C.footer(['No guaranteed profit. Picks are model output, not advice.'])}`;
  };

  /* ---------------- Results ---------------- */
  Object.assign(BP.actions, {
    'res-lane': (el) => { S.results.lane = el.dataset.arg; },
    'res-sport': (el) => { S.results.sport = el.dataset.arg; },
    'res-period': () => { const o = ['7', '30', 'season']; S.results.period = o[(o.indexOf(S.results.period) + 1) % o.length]; }
  });

  BP.screens.results = function () {
    const st = S.results;
    const periodLabel = { '7': 'Last 7 days', '30': 'Last 30 days', season: 'Season' }[st.period];
    const since = st.period === 'season' ? 0 : BP.NOW - parseInt(st.period, 10) * 86400000;
    const lanes = [['piggy', 'PIGGY’S PICKS'], ['degen', 'DEGEN ZONE<br>(TRAPS)'], ['alt', 'ALT PICKS'], ['multis', 'MULTIS']];
    const sports = ['all', 'NFL', 'NBA', 'WNBA', 'NBL', 'MLB'];
    let body, rec;
    if (st.lane === 'multis') {
      const slips = BP.MULTIS.filter(m => m.publishedAt >= since);
      rec = BP.record(slips);
      body = slips.map(m => {
        const u = BP.unitsFor(m);
        return `<article class="card raised tight">
          <div class="row"><span class="tag grey">MULTI · ${m.legs.length} LEGS</span><span class="spacer"></span>${C.statusTag(m.status)}</div>
          <div class="row"><b style="flex:1">${e(m.title)}</b><div style="text-align:right"><b>${BP.odds(m.price)}</b><div class="${u >= 0 ? 'pos' : 'neg'} small" style="font-weight:700">${BP.units(u)}</div></div></div>
          ${m.legs.map(l => `<div class="row small"><span class="${l.ok ? 'pos' : 'neg'}" aria-label="${l.ok ? 'won' : 'lost'}">${l.ok ? '✓' : '✕'}</span><span class="muted">${e(l.text)}</span></div>`).join('')}
          <div class="row"><span class="dim tiny">${e(m.book)} · ${m.units}u</span><span class="spacer"></span><span class="mono">Settled ${BP.when(m.settledAt)}</span></div>
        </article>`;
      }).join('') || C.empty('No multis in this period', 'Try a longer period.');
    } else {
      const list = BP.PICKS.filter(p => p.lane === st.lane && (st.sport === 'all' || p.sport === st.sport) && Date.parse(p.start) >= since);
      rec = BP.record(list);
      const settled = list.filter(p => p.status !== 'pending').sort((a, b) => b.settledAt - a.settledAt);
      body = settled.map(p => C.resultCard(p, LANES[p.lane])).join('') || C.empty('No settled picks in this period', 'Try another sport or a longer period.');
    }
    return `<div class="banner"><span class="eyebrow">BETPIG</span><h1 class="h1">Results</h1><p class="sub">Every published pick, settled on paper<br>at level stakes.</p></div>
      <nav class="tabs left white" aria-label="Sport">${sports.map(s => `<button class="${st.sport === s ? 'on' : ''}" data-act="res-sport" data-arg="${s}">${s === 'all' ? 'All' : s}</button>`).join('')}</nav>
      <div class="row"><button class="chip solid" data-act="res-period">${periodLabel} <span class="caret">⌄</span></button><span class="spacer"></span><button class="chip ghost" data-act="sheet" data-arg="tz">${e(BP.tzLabel())} <span class="caret">⌄</span></button></div>
      <nav class="tabs lanes" aria-label="Lane">${lanes.map(([k, l]) => `<button class="${st.lane === k ? 'on' : ''}" data-act="res-lane" data-arg="${k}">${l}</button>`).join('')}</nav>
      <div class="card">
        <div><div class="h3">${e(LANES[st.lane])} record</div><div class="dim small">${st.sport === 'all' ? 'All sports' : e(st.sport)} · ${periodLabel.toLowerCase()} · level stakes</div></div>
        <div class="tally"><div><div class="v" style="color:var(--win)">${rec.w}</div><div class="k">Wins</div></div><div><div class="v">${rec.l}</div><div class="k">Losses</div></div><div><div class="v">${rec.p}</div><div class="k">Pending</div></div><div><div class="v ${rec.u >= 0 ? '' : 'neg'}">${BP.units(rec.u)}</div><div class="k">Net units</div></div></div>
        ${st.lane === 'piggy' ? '<span class="dim tiny">This is the headline tally shown in the Results pill.</span>' : '<span class="dim tiny">Separate record — never merged into the Piggy’s Picks headline.</span>'}
      </div>
      <div class="stack">${body}</div>
      ${C.footer(['Graded at the published price forever. Losses stay visible.', 'No backfilled prices.'])}`;
  };
  BP.screens.results.enter = function (r) { if (r.query.lane && LANES[r.query.lane]) S.results.lane = r.query.lane; };

  /* ---------------- Inside the Pick ---------------- */
  BP.actions['pick-season'] = function (el) { S.pick.season = el.dataset.arg; };

  BP.screens.pick = function (r) {
    const p = BP.PICKS.find(x => x.id === r.params.id);
    const head = C.back('#/picks', 'Picks');
    if (!p) return head + C.empty('Pick not found', 'It may have been removed from this prototype.');
    if (p.status === 'pending' && locked()) {
      return `${head}<div class="banner"><h1 class="h1">Inside the Pick</h1><p class="sub">Evidence behind every published pick.</p></div>${gate([p])}${C.footer([])}`;
    }
    const seasons = p.sport === 'NBA' ? ['2026-27', '2025-26'] : ['2026', '2025'];
    if (seasons.indexOf(S.pick.season) === -1) S.pick.season = seasons[0];
    const lastSeason = S.pick.season === seasons[1];
    const ev = p.evidence;
    const scale = (arr, k) => arr.map((v, i) => Math.max(1, Math.round(v * (0.85 + BP.rng(p.id + k + i)() * 0.25))));
    const minutes = ev ? (lastSeason ? scale(ev.minutes, 'm') : ev.minutes) : null;
    const shots = ev ? (lastSeason ? scale(ev.shots, 's') : ev.shots) : null;
    const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    const bars = (a) => { const mx = Math.max.apply(null, a); return `<div class="bars" aria-hidden="true">${a.map(v => `<span style="height:${(v / mx * 100).toFixed(0)}%" title="${v}"></span>`).join('')}</div>`; };
    const volLabel = { WNBA: 'Field-goal attempts', NBA: 'Field-goal attempts', NFL: 'Touches', MLB: 'Plate appearances', NBL: 'Field-goal attempts' }[p.sport];
    const minLabel = p.sport === 'NFL' ? 'Snap share %' : p.sport === 'MLB' ? 'Innings in field' : 'Minutes';
    const u = BP.unitsFor(p);
    return `${head}
      <div class="title-block"><span class="eyebrow accent">INSIDE THE PICK</span><h1 class="h1">${e(p.player)}</h1><p class="sub">${e(p.matchup)} · ${e(BP.when(p.start))} ${BP.tzAbbr()}</p></div>
      <div class="card ${p.potd ? 'featured' : ''}" style="${p.potd ? 'padding:16px;gap:10px' : ''}">
        <div class="row">${C.sportTag(p.sport, true)}<span class="dim small">${e(LANES[p.lane])}${p.potd ? ' · Pick of the Day' : ''}</span><span class="spacer"></span>${C.statusTag(p.status)}</div>
        <div class="sel" style="font-size:20px;font-weight:700">${e(p.selection)}</div>
        <div class="row"><span style="font-size:24px;font-weight:700" class="accent">${BP.odds(p.price)}</span><span class="small">${e(p.book)}</span><span class="spacer"></span><span class="dim small">${p.units}u</span></div>
        <div class="row dim tiny"><span>Published ${e(BP.when(p.publishedAt))}</span><span class="spacer"></span>${p.status !== 'pending' ? `<span class="mono">Settled ${BP.when(p.settledAt)}</span>` : '<span>Locks at start time</span>'}</div>
        ${p.status !== 'pending' ? `<div class="inset row small"><span>Result: <b>${e(p.result)}</b></span><span class="spacer"></span><b class="${u >= 0 ? 'pos' : 'neg'}">${BP.units(u)}</b></div><span class="dim tiny">Graded at the published price forever.</span>` : ''}
      </div>
      ${ev ? `
      <div class="row"><span class="eyebrow" style="color:var(--text-muted)">EVIDENCE</span><span class="spacer"></span>
        <div class="mini-seg" style="border-color:var(--border)">${seasons.map(s => `<button class="${S.pick.season === s ? 'on' : ''}" data-act="pick-season" data-arg="${s}">${s}</button>`).join('')}</div></div>
      ${p.analysis ? `<div class="tiles"><div class="tile"><span class="k">Simulated average</span><span class="v">${p.analysis.simAvg}</span></div><div class="tile"><span class="k">Estimated chance</span><span class="v">${BP.pct(p.analysis.chance)}</span></div><div class="tile"><span class="k">${e(p.analysis.lastLabel)}</span><span class="v">${e(p.analysis.lastN)}</span></div></div>` : ''}
      <div class="card"><div class="row"><b>${minLabel}</b><span class="spacer"></span><span class="muted small">avg ${avg(minutes)} · last 10</span></div>${bars(minutes)}<span class="dim tiny">History · ${S.pick.season}</span></div>
      <div class="card"><div class="row"><b>${volLabel}</b><span class="spacer"></span><span class="muted small">avg ${avg(shots)} · last 10</span></div>${bars(shots)}<span class="dim tiny">History · ${S.pick.season}</span></div>
      <div class="card tight"><b>Matchup</b><p class="sub" style="margin:0">${e(ev.matchup)}</p><span class="dim tiny">Zone and matchup data are historical.</span></div>
      <p class="dim small" style="margin:0">Only factors the engine actually used are shown. Model assessed ${BP.time(p.publishedAt - 5 * 60000)} · price captured ${BP.time(p.publishedAt)}.</p>` :
      C.empty('Evidence archived', 'This settled pick keeps its published price, result and units. Detailed evidence is shown for current picks.')}
      ${C.footer(['Model estimates are not guarantees. Historical frequency is not model probability.'])}`;
  };
})(window.BP);
