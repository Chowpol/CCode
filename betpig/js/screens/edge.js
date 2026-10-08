/* Edge Room (flow B3): Simulator · Arbitrage · +EV · Middles · Odds. */
(function (BP) {
  const S = BP.S, C = BP.C, e = BP.esc;

  const TABS = [
    { id: 'sims', label: 'Simulator', title: 'Simulator', sub: 'Powered by The Eye, our simulation engine.' },
    { id: 'arbitrage', label: 'Arbitrage', title: 'Arbitrage', sub: 'Matching markets. Balanced stakes. Clear calculations.' },
    { id: 'ev', label: '+EV', title: '+EV', sub: 'Published prices alongside the model’s estimated fair odds.' },
    { id: 'middles', label: 'Middles', title: 'Middles', sub: 'The exact winning range, with the evidence behind it.' },
    { id: 'odds', label: 'Odds', title: 'Odds', sub: 'Every book’s price, side by side. Best available prices highlighted.' }
  ];
  const SORTS = { arbitrage: ['Highest ROI', 'Start time'], ev: ['Highest est. EV', 'Start time'], middles: ['Widest band', 'Start time'], odds: ['Start time'] };

  /* ---------------- Data per tool ---------------- */
  function bothBooks(a, b) { return BP.inBooks(a) && BP.inBooks(b); }
  function roi(a, b) { return 1 / (1 / a + 1 / b) - 1; }

  function itemsFor(tab) {
    if (S.scenario.boardEmpty) return { items: [], hidden: 0 };
    let all, ok;
    if (tab === 'arbitrage') { all = BP.ARBS; ok = x => bothBooks(x.a.book, x.b.book); }
    else if (tab === 'ev') { all = BP.EVS; ok = x => BP.inBooks(x.book); }
    else if (tab === 'middles') { all = BP.MIDDLES; ok = x => bothBooks(x.over.book, x.under.book); }
    else { all = BP.ODDS; ok = () => true; }
    const visible = all.filter(ok);
    return { items: visible, hidden: all.length - visible.length };
  }
  function filterItems(items) {
    return items.filter(x => {
      const g = BP.game(x.game);
      if (S.edge.game !== 'all' && x.game !== S.edge.game) return false;
      if (S.sport !== 'all' && g.sport !== S.sport) return false;
      return true;
    });
  }
  function sportCounts(items) {
    const c = { all: items.length };
    ['NFL', 'WNBA', 'NBA', 'NBL', 'MLB'].forEach(s => { c[s] = items.filter(x => BP.game(x.game).sport === s).length || null; });
    return c;
  }

  /* ---------------- Cards ---------------- */
  function gameHead(g, extraRight) {
    return `<div class="row top">
      <div style="flex:1;min-width:0" class="stack"><div>${C.sportTag(g.sport)}</div><div class="h3">${e(g.away)} @ ${e(g.home)}</div></div>
      ${extraRight || ''}
    </div>`;
  }

  function arbCard(x) {
    const g = BP.game(x.game);
    const r = roi(x.a.price, x.b.price);
    const calc = S.edge.calc[x.id] || (S.edge.calc[x.id] = { open: x.id === 'arb1', a: 100, b: +(100 * x.a.price / x.b.price).toFixed(2) });
    const changed = x.a.changed;
    const leg = (s, key) => `<div class="leg"><span class="k">${e(s.label)}</span><span class="price">${BP.odds(s.price)}</span><span class="src">${e(s.book)} · ${BP.time(BP.CAPTURED_AT)}</span>
      ${s.changed ? `<span class="changed">Changed ${BP.time(s.changed.at)} · was ${BP.odds(s.changed.was)} · recalculated</span>` : ''}
      <div class="divider"></div>${C.acc(`${x.id}-${key}-mkt`, '<span class="small">Full market</span>', BP.isOpen(`${x.id}-${key}-mkt`), `<div class="dim tiny">${e(x.market)}. Settles on the official result${/overtime|extra/.test(x.market) ? ', including overtime' : ''}.</div>`)}</div>`;
    const calcBody = calc.open ? calcHtml(x, calc) : '';
    return `<article class="card">
      ${gameHead(g, `<div style="text-align:right"><div class="dim tiny">Calculated ROI</div><div class="roi">${BP.pct(r, 2)}</div></div>`)}
      <div class="muted small" style="margin-top:-6px">${e(x.market)} · ${e(BP.when(g.start))}</div>
      <div class="legs">${leg(x.a, 'a')}${leg(x.b, 'b')}</div>
      <div class="dim small">Best available prices at publication · ${e(BP.when(BP.CAPTURED_AT))} ${BP.tzAbbr()}</div>
      <div class="divider"></div>
      <button class="acc-head" aria-expanded="${calc.open}" data-act="arb-calc" data-arg="${x.id}">Calculate stakes<span class="chev">${BP.icon.chev}</span></button>
      ${calcBody}
    </article>`;
  }

  function calcNumbers(x, calc) {
    const a = calc.a, b = calc.b;
    const valid = a > 0 && b > 0;
    return valid ? { valid, total: a + b, payout: a * x.a.price, net: a * x.a.price - (a + b) } : { valid };
  }
  function calcHtml(x, calc) {
    const n = calcNumbers(x, calc);
    const changed = x.a.changed;
    return `<div class="stack" data-calc="${x.id}">
      ${changed ? `<div class="notice">Price changed ${BP.time(changed.at)} · ${e(x.a.book)} ${BP.odds(changed.was)} → ${BP.odds(x.a.price)}. Stakes and ROI recalculated.</div>` : ''}
      <div class="row" style="gap:8px">
        <label class="stake ${calc.edited !== 'b' ? 'active' : ''} ${calc.a > 0 ? '' : 'invalid'}" id="${x.id}-wa"><span>${e(x.a.book)} stake</span><span class="in">$<input inputmode="decimal" value="${calc.a > 0 ? calc.a.toFixed(2) : ''}" placeholder="0.00" data-input="arb-stake" data-id="${x.id}" data-side="a" aria-label="${e(x.a.book)} stake in dollars"></span></label>
        <label class="stake ${calc.edited === 'b' ? 'active' : ''} ${calc.b > 0 ? '' : 'invalid'}" id="${x.id}-wb"><span>${e(x.b.book)} stake</span><span class="in">$<input inputmode="decimal" value="${calc.b > 0 ? calc.b.toFixed(2) : ''}" placeholder="0.00" data-input="arb-stake" data-id="${x.id}" data-side="b" aria-label="${e(x.b.book)} stake in dollars"></span></label>
      </div>
      <p class="warn-text small" id="${x.id}-msg" style="margin:0;${n.valid ? 'display:none' : ''}">Enter a stake above $0 to calculate the other side.</p>
      <div class="tiles">
        <div class="tile"><span class="k">Total stake</span><span class="v" id="${x.id}-tot">${n.valid ? BP.money(n.total) : '—'}</span></div>
        <div class="tile"><span class="k">Payout · either side</span><span class="v" id="${x.id}-pay">${n.valid ? '≈ ' + BP.money(n.payout) : '—'}</span></div>
        <div class="tile"><span class="k">Net profit</span><span class="v accent" id="${x.id}-net">${n.valid ? '≈ ' + BP.money(n.net) : '—'}</span></div>
      </div>
      <p class="muted small" style="margin:0">Edit either stake — the other rebalances so both sides pay the same. If both bets are accepted at these odds and settlement rules match.</p>
      ${C.acc(x.id + '-how', '<span class="muted small" style="font-weight:600">How it works</span>', BP.isOpen(x.id + '-how'), `<p class="dim small" style="margin:0">Stake B = Stake A × ${x.a.price.toFixed(2)} ÷ ${x.b.price.toFixed(2)}. ROI = 1 ÷ (1/${x.a.price.toFixed(2)} + 1/${x.b.price.toFixed(2)}) − 1 = ${BP.pct(roi(x.a.price, x.b.price), 2)}. Money is shown to 2dp; full precision is used internally. Bookmakers can limit or reject bets.</p>`)}
    </div>`;
  }

  BP.inputs['arb-stake'] = function (el) {
    const x = BP.ARBS.find(a => a.id === el.dataset.id);
    const calc = S.edge.calc[x.id];
    const side = el.dataset.side;
    const v = parseFloat(el.value.replace(/[^0-9.]/g, ''));
    calc.edited = side;
    const other = document.querySelector(`[data-input="arb-stake"][data-id="${x.id}"][data-side="${side === 'a' ? 'b' : 'a'}"]`);
    if (side === 'a') { calc.a = v; calc.b = v > 0 ? v * x.a.price / x.b.price : 0; }
    else { calc.b = v; calc.a = v > 0 ? v * x.b.price / x.a.price : 0; }
    if (other) other.value = (side === 'a' ? calc.b : calc.a) > 0 ? (side === 'a' ? calc.b : calc.a).toFixed(2) : '';
    const n = calcNumbers(x, calc);
    document.getElementById(`${x.id}-tot`).textContent = n.valid ? BP.money(n.total) : '—';
    document.getElementById(`${x.id}-pay`).textContent = n.valid ? '≈ ' + BP.money(n.payout) : '—';
    document.getElementById(`${x.id}-net`).textContent = n.valid ? '≈ ' + BP.money(n.net) : '—';
    document.getElementById(`${x.id}-msg`).style.display = n.valid ? 'none' : '';
    ['a', 'b'].forEach(s => {
      const w = document.getElementById(`${x.id}-w${s}`);
      w.classList.toggle('active', s === side);
      w.classList.toggle('invalid', !(calc[s] > 0));
    });
  };

  function middleCard(x) {
    const g = BP.game(x.game);
    const lo = Math.ceil(x.over.line), hi = Math.floor(x.under.line);
    const width = hi - lo + 1;
    const p = BP.normCdf(hi + 0.5, x.mean, x.sd) - BP.normCdf(lo - 0.5, x.mean, x.sd);
    const st = 100;
    const hit = st * x.over.price + st * x.under.price - 2 * st;
    const overOnly = st * x.over.price - 2 * st, underOnly = st * x.under.price - 2 * st;
    // Band graph
    const a = Math.floor(x.mean - 2.6 * x.sd), b = Math.ceil(x.mean + 2.6 * x.sd), n = b - a + 1, W = 320, H = 90, bw = W / n;
    let bars = '', maxP = 0;
    const ps = [];
    for (let k = a; k <= b; k++) { const q = BP.normCdf(k + 0.5, x.mean, x.sd) - BP.normCdf(k - 0.5, x.mean, x.sd); ps.push(q); maxP = Math.max(maxP, q); }
    ps.forEach((q, i) => {
      const k = a + i, h = (q / maxP) * (H - 22), inBand = k >= lo && k <= hi;
      bars += `<rect x="${(i * bw + bw * 0.1).toFixed(1)}" y="${(H - 16 - h).toFixed(1)}" width="${(bw * 0.8).toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${inBand ? '#c6ff4a' : 'rgba(255,255,255,0.14)'}"/>`;
    });
    const bx = (lo - a) * bw, bwid = width * bw;
    const svg = `<svg class="band-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Historical totals with the ${lo} to ${hi} band highlighted">
      <rect x="${bx.toFixed(1)}" y="0" width="${bwid.toFixed(1)}" height="${H - 16}" fill="rgba(198,255,74,0.08)"/>${bars}
      <text x="${(bx + bwid / 2).toFixed(1)}" y="${H - 3}" fill="#c6ff4a" font-size="10" font-weight="700" text-anchor="middle">${lo}–${hi}</text>
      <text x="2" y="${H - 3}" fill="#5b616c" font-size="10">${a}</text><text x="${W - 2}" y="${H - 3}" fill="#5b616c" font-size="10" text-anchor="end">${b}</text></svg>`;
    return `<article class="card">
      ${gameHead(g, `<span class="band-tag">${width}-POINT BAND</span>`)}
      <div class="muted small" style="margin-top:-6px">${e(x.market)} · ${e(BP.when(g.start))}</div>
      <div class="legs">
        <div class="leg"><span class="k">OVER ${x.over.line}</span><span class="price">${BP.odds(x.over.price)}</span><span class="src">${e(x.over.book)} · ${BP.time(BP.CAPTURED_AT)}</span></div>
        <div class="leg"><span class="k">UNDER ${x.under.line}</span><span class="price">${BP.odds(x.under.price)}</span><span class="src">${e(x.under.book)} · ${BP.time(BP.CAPTURED_AT)}</span></div>
      </div>
      <div class="inset stack">
        <div class="row small"><b>Wins both if the total lands ${lo}–${hi}</b></div>
        ${svg}
        <div class="small">Historical landing in band: <b>${BP.pct(p)}</b> <span class="dim">· ${x.sample.toLocaleString('en-AU')} comparable games</span></div>
        <div class="dim tiny">Historical landing distribution, not a model probability.</div>
      </div>
      <div class="tiles">
        <div class="tile"><span class="k">Lands ${lo}–${hi} · both win</span><span class="v accent">+${BP.money(hit)}</span></div>
        <div class="tile"><span class="k">Misses · one side wins</span><span class="v neg">${overOnly === underOnly ? '−' + BP.money(-overOnly) : `−${BP.money(-Math.max(overOnly, underOnly))} to −${BP.money(-Math.min(overOnly, underOnly))}`}</span></div>
      </div>
      <p class="dim small" style="margin:0">Example uses $100 on each side. If both bets are accepted at these odds and settlement rules match.</p>
    </article>`;
  }

  function evCard(x) {
    const g = BP.game(x.game);
    const ev = x.chance * x.price - 1;
    return `<article class="card">
      <div class="row top">
        <div style="flex:1;min-width:0" class="stack"><div>${C.sportTag(x.sport)}</div><div class="h3">${e(x.player)}</div></div>
        <div style="text-align:right"><div class="dim tiny">Estimated EV</div><div class="roi">${BP.signedPct(ev)}</div></div>
      </div>
      <div class="muted small" style="margin-top:-6px">${e(g.away)} @ ${e(g.home)} · ${e(BP.when(g.start))}</div>
      <div class="h3" style="font-size:18px">${e(x.selection)}</div>
      <div class="tiles">
        <div class="tile"><span class="k">Price</span><span class="v">${BP.odds(x.price)}</span><span class="dim tiny">${e(x.book)} · captured ${BP.time(BP.CAPTURED_AT)}</span></div>
        <div class="tile"><span class="k">Est. fair odds</span><span class="v">${BP.odds(1 / x.chance)}</span><span class="dim tiny">Est. chance ${BP.pct(x.chance)}</span></div>
      </div>
      <div class="inset row small"><span>History vs this line</span><span class="spacer"></span><b>${x.hist.over} of last ${x.hist.n}</b><span class="dim">over</span></div>
      <div class="row dim tiny"><span>Model assessed ${BP.time(BP.MODEL_ASSESSED)}</span><span class="spacer"></span><span>Price captured ${BP.time(BP.CAPTURED_AT)}</span></div>
    </article>`;
  }

  function oddsCard(x) {
    const g = BP.game(x.game);
    const books = BP.S.prefs.books.filter(b => x.prices[b] !== undefined || BP.BOOKS.includes(b));
    const best = [0, 1].map(i => Math.max.apply(null, books.map(b => (x.prices[b] ? x.prices[b][i] : 0))));
    const rows = books.map(b => {
      const pr = x.prices[b];
      if (!pr) return `<tr><td>${e(b)}</td><td class="nq" colspan="2">No quote</td></tr>`;
      return `<tr><td>${e(b)}</td>${pr.map((v, i) => `<td class="${v === best[i] ? 'best' : ''}">${BP.odds(v)}</td>`).join('')}</tr>`;
    }).join('');
    return `<article class="card">
      ${gameHead(g, `<span class="dim small">${e(BP.when(g.start))}</span>`)}
      <div class="row"><span class="tag grey">${e(x.market)}</span><span class="spacer"></span><span class="dim tiny">Captured ${BP.time(BP.CAPTURED_AT)}</span></div>
      <table class="odds-grid"><thead><tr><th>Bookmaker</th><th>${e(x.sides[0])}</th><th>${e(x.sides[1])}</th></tr></thead><tbody>${rows}</tbody></table>
    </article>`;
  }

  /* ---------------- Simulator ---------------- */
  function simBody() {
    const sport = S.edge.simSport;
    const state = BP.SIM_SPORT_STATE[sport];
    const sports = ['NFL', 'NBA', 'WNBA', 'NBL', 'MLB'];
    const nav = `<nav class="tabs left white" aria-label="Sport">${sports.map(s => `<button class="${s === sport ? 'on' : ''}" data-act="sim-sport" data-arg="${s}">${s}</button>`).join('')}<span class="spacer"></span><a href="#/results">Results</a></nav>`;
    const lanes = [['piggy', 'PIGGY’S PICKS'], ['degen', 'DEGEN ZONE<br>(TRAPS)'], ['alt', 'ALT PICKS'], ['multis', 'MULTIS']];
    const laneTabs = `<nav class="tabs lanes" aria-label="Lane">${lanes.map(([k, l]) => `<button class="${S.edge.lane === k ? 'on' : ''}" data-act="sim-lane" data-arg="${k}">${l}</button>`).join('')}</nav>`;
    const filters = `<div class="row"><span class="chip solid">Today · ${e(BP.day(BP.NOW))} <span class="caret">⌄</span></span><button class="chip" data-act="sheet" data-arg="gamePicker">${S.edge.game === 'all' ? 'All games' : e(BP.game(S.edge.game).short)} <span class="caret">⌄</span></button><span class="spacer"></span><button class="chip ghost" data-act="sheet" data-arg="tz">${BP.tzAbbr()} <span class="caret">⌄</span></button></div>`;
    let content;
    if (state === 'preseason') {
      content = C.empty('Season starting soon', `${sport} simulations publish once the regular-season fixture is released. The first board appears about a week before opening night.`, '<a class="btn secondary small" href="#/tools/shot-lab">Research players in Shot Lab ›</a>');
    } else if (state === 'none') {
      content = C.empty(`No published picks for ${sport} today`, 'The engine only publishes when a pick clears its edge threshold. Nothing is hand-picked to fill the board.');
    } else {
      const list = BP.PICKS.filter(p => p.lane === S.edge.lane && p.sport === sport && p.status === 'pending' && (S.edge.game === 'all' || p.game === S.edge.game));
      if (!list.length) content = C.empty(`No ${S.edge.lane === 'piggy' ? 'Piggy’s Picks' : lanes.find(l => l[0] === S.edge.lane)[1].replace('<br>', ' ')} for ${sport} right now`, 'Check another lane or sport. Settled picks stay on Results.');
      else content = BP.C.pickList(list, 'edge');
    }
    return `${nav}${filters}${laneTabs}${content}
      <div class="card tight row"><span class="muted small">All players · projections and full statistics</span><span class="spacer"></span><a class="linkish" href="#/tools/alt-line">Explore ›</a></div>`;
  }

  /* ---------------- Screen ---------------- */
  Object.assign(BP.actions, {
    'arb-calc': (el) => { const c = S.edge.calc[el.dataset.arg]; c.open = !c.open; },
    'edge-sport': (el) => { S.sport = el.dataset.arg; S.edge.game = 'all'; },
    'edge-sort': (el) => {
      const tab = el.dataset.arg, opts = SORTS[tab];
      const cur = S.edge.sort[tab] || opts[0];
      S.edge.sort[tab] = opts[(opts.indexOf(cur) + 1) % opts.length];
    },
    'sim-sport': (el) => { S.edge.simSport = el.dataset.arg; S.edge.game = 'all'; },
    'sim-lane': (el) => { S.edge.lane = el.dataset.arg; },
    'pick-game': (el) => { S.edge.game = el.dataset.arg; S.ui.sheet = null; },
    'picker-sport': (el) => { S.edge.sheetSport = el.dataset.arg; }
  });

  BP.inputs['picker-search'] = function (el) {
    S.edge.sheetQuery = el.value;
    const box = document.getElementById('picker-list');
    if (box) box.innerHTML = pickerList();
  };

  function pickerList() {
    const q = S.edge.sheetQuery.trim().toLowerCase();
    const games = BP.GAMES.filter(g => (S.edge.sheetSport === 'all' || g.sport === S.edge.sheetSport) &&
      (!q || (g.away + ' ' + g.home).toLowerCase().includes(q)));
    if (!games.length) return C.empty('No games match', 'Try another team, player or sport.');
    const byDay = {};
    games.slice().sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).forEach(g => { (byDay[BP.day(g.start)] = byDay[BP.day(g.start)] || []).push(g); });
    return Object.keys(byDay).map(day => `<div class="eyebrow">${e(day)}</div><div class="list" style="padding:0">${byDay[day].map(g => `
      <button class="game-row" data-act="pick-game" data-arg="${g.id}" aria-pressed="${S.edge.game === g.id}">
        ${C.sportTag(g.sport)}<span style="flex:1;min-width:0"><b>${e(g.short)}</b><br><span class="dim small">${BP.time(g.start)} · ${g.plays} play${g.plays > 1 ? 's' : ''}</span></span>
        <span class="edge"><small>TOP EDGE</small><b>+${g.topEdge.toFixed(1)}%</b></span>
      </button>`).join('')}</div>`).join('');
  }

  BP.sheets.gamePicker = function () {
    const total = BP.GAMES.reduce((n, g) => n + g.plays, 0);
    const counts = { all: BP.GAMES.length };
    BP.GAMES.forEach(g => { counts[g.sport] = (counts[g.sport] || 0) + 1; });
    return BP.sheetHeader('Choose a game', `${BP.GAMES.length} games · ${total} plays this capture`) +
      `<label class="field">${BP.icon.search}<span class="sr-only">Search team or player</span><input type="search" placeholder="Search team or player" value="${e(S.edge.sheetQuery)}" data-input="picker-search"></label>
      ${C.sportChips(counts, S.edge.sheetSport, 'picker-sport')}
      <button class="all-games" data-act="pick-game" data-arg="all"><span style="flex:1"><b>All games</b><br><span class="dim small">Every game on the board, biggest edge first</span></span>${S.edge.game === 'all' ? '<span class="check">✓</span>' : ''}</button>
      <div id="picker-list" class="stack">${pickerList()}</div>`;
  };

  let loadTimer;
  BP.screens.edge = function (r) {
    const tab = TABS.find(t => t.id === r.params.tab) || TABS[0];
    const tabs = `<nav class="tabs" aria-label="Edge Room tools">${TABS.map(t => `<a href="#/edge/${t.id}" class="${t.id === tab.id ? 'on' : ''}" ${t.id === tab.id ? 'aria-current="page"' : ''}>${t.label}</a>`).join('')}</nav>`;
    const loading = S.scenario.snapshot === 'loading' || (S.edge.loadingUntil && Date.now() < S.edge.loadingUntil);

    if (tab.id === 'sims') {
      return `<div class="banner"><h1 class="h1">Simulator</h1><p class="sub">Powered by The Eye,<br>our simulation engine <button class="tag grey" style="padding:0 6px" aria-label="How the Simulator works" data-act="toast" data-arg="The Eye simulates each game 100,000 times. Picks publish when the edge clears a threshold — never hand-picked.">i</button></p></div>
        ${tabs}
        ${S.scenario.snapshot === 'loading' ? C.skeleton(2) : C.snapshot() + simBody()}
        ${C.footer(['Model estimates are not guarantees. Historical frequency is not model probability.'])}`;
    }

    const { items, hidden } = itemsFor(tab.id);
    const shown = filterItems(items);
    if (tab.id !== 'odds') {
      const sort = S.edge.sort[tab.id] || SORTS[tab.id][0];
      shown.sort((a, b) => {
        if (sort === 'Start time') return Date.parse(BP.game(a.game).start) - Date.parse(BP.game(b.game).start);
        if (tab.id === 'arbitrage') return roi(b.a.price, b.b.price) - roi(a.a.price, a.b.price);
        if (tab.id === 'ev') return (b.chance * b.price) - (a.chance * a.price);
        return (b.under.line - b.over.line) - (a.under.line - a.over.line);
      });
    }
    const counts = sportCounts(items);
    const gameLabel = S.edge.game === 'all' ? 'All games' : BP.game(S.edge.game).short;
    const gameCount = new Set(items.map(x => x.game)).size;
    const card = { arbitrage: arbCard, ev: evCard, middles: middleCard, odds: oddsCard }[tab.id];
    const bookNote = { arbitrage: 'My bookmakers · both books required', middles: 'My bookmakers · both books required', ev: 'My bookmakers · best selected price', odds: 'My bookmakers · plain-text prices' }[tab.id];

    let list;
    if (loading) list = C.skeleton(2);
    else if (S.scenario.boardEmpty) list = C.empty('No opportunities on the board right now', 'Expired opportunities drop on the next capture cycle — we don’t keep an archive. New prices appear after the next update.');
    else if (!shown.length) list = C.empty('No games match these filters.', 'Try another sport or date. New prices appear after the next update.', '<button class="btn secondary small" data-act="edge-sport" data-arg="all">Show all sports</button>');
    else list = `<div class="stack lg">${shown.map(card).join('')}</div>`;

    return `${C.title(tab.title, tab.sub)}
      ${tabs}
      ${C.snapshot()}
      ${C.regionRow()}
      <button class="game-select" data-act="sheet" data-arg="gamePicker"><span class="ring">◎</span><span><span class="eyebrow" style="font-size:9px">GAME</span><br><b style="font-size:15px">${e(gameLabel)}</b></span><span class="spacer"></span><span class="muted small">${gameCount} games ⌄</span></button>
      ${C.sportChips(counts, S.sport, 'edge-sport')}
      <div class="row"><span class="dim small">${bookNote}</span><span class="spacer"></span>${SORTS[tab.id].length > 1 ? `<button class="small muted" style="font-weight:600" data-act="edge-sort" data-arg="${tab.id}">${e(S.edge.sort[tab.id] || SORTS[tab.id][0])} ⌄</button>` : ''}</div>
      ${list}
      ${hidden && !S.scenario.boardEmpty ? `<a class="card tight row" href="#/account/bookmakers"><span class="small muted">${hidden} more need bookmakers you haven’t selected</span><span class="spacer"></span><span class="linkish accent">Edit ›</span></a>` : ''}
      ${C.footer([tab.id === 'arbitrage' || tab.id === 'middles' ? 'Prices move between captures. Calculations assume both bets are accepted at the shown prices.' : 'Prices move between captures.', 'Model estimates are not guarantees. Historical frequency is not model probability.'])}`;
  };
  BP.screens.edge.enter = function (r) {
    // Brief loading skeleton on tab switch so the loading state is designed, not blank.
    S.edge.loadingUntil = Date.now() + 350;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { S.edge.loadingUntil = 0; if (BP.current && BP.current.name === 'edge') BP.render(); }, 360);
  };
})(window.BP);
