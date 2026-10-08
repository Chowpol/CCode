/* Home, Tools hub, Shot Lab (flow B1) and Alt Line Explorer (flow B2). */
(function (BP) {
  const S = BP.S, C = BP.C, e = BP.esc;

  /* =========================================================
     HOME
     ========================================================= */
  BP.screens.home = function () {
    const sports = ['all', 'NFL', 'MLB', 'WNBA', 'NBA'];
    const potd = BP.PICKS.find(p => p.potd);
    const showPotd = S.sport === 'all' || S.sport === potd.sport;
    const locked = S.scenario.access === 'free';
    const card = (href, eyebrow, title, body) => `<a class="card link" href="${href}"><span class="eyebrow accent">${eyebrow}</span><div class="h3">${title}</div><p class="sub">${body}</p></a>`;
    return `
      <nav class="tabs left white" aria-label="Sport">${sports.map(s => `<button class="${S.sport === s ? 'on' : ''}" data-act="sport" data-arg="${s}">${s === 'all' ? 'All' : s}</button>`).join('')}</nav>
      <div class="banner"><span class="eyebrow">BETPIG</span><h1 class="h1">Research, then decide.</h1><p class="sub" style="max-width:220px">Simulations, shot data and plain-text prices. Every pick graded in public.</p></div>
      ${showPotd ? `<a class="card featured link" href="${locked ? '#/picks' : '#/edge/sims'}">
        <div class="potd-head"><div style="flex:1"><div class="eyebrow">TODAY · ${e(BP.day(BP.NOW).toUpperCase())}</div><div class="t">PICK OF THE DAY</div></div><span class="accent" style="font-size:22px">☆</span></div>
        <div class="pick-body"><div class="row">${C.sportTag(potd.sport)}<span class="muted small">${e(potd.matchup)}</span></div>
          <div class="who">${e(potd.player)}</div>
          ${locked ? `<div class="row"><span class="sel" style="filter:blur(6px)" aria-hidden="true">Over 0.0 points</span><span class="spacer"></span><span class="tag grey">🔒 Trial</span></div>` : `<div class="sel">${e(potd.selection)}</div><div class="row"><span class="price accent">${BP.odds(potd.price)}</span><span class="small">${e(potd.book)}</span></div>`}
        </div></a>` : C.empty(`No Pick of the Day for ${S.sport}`, 'Pick of the Day is today’s highest-edge eligible public Piggy’s Pick. Try All sports.')}
      ${card('#/tools', 'TOOLS', 'Interactive research', 'Shot Lab and Alt Line Explorer — research a player before you look at a price.')}
      ${card('#/edge/sims', 'EDGE ROOM', 'Hunt a price', 'Simulator · Arbitrage · +EV · Middles · Odds, refreshed from timestamped captures.')}
      ${card('#/picks', 'PICKS', 'From pick to grade', 'Piggy’s Picks, Alt Picks, Degen Zone and Multis — each with its own record.')}
      ${card('#/research', 'RESEARCH', 'The reading section', 'Articles, Edge Room explainers and methodology notes.')}
      ${C.footer(['Model estimates are not guarantees. Historical frequency is not model probability.'])}
    `;
  };

  /* =========================================================
     TOOLS HUB
     ========================================================= */
  BP.screens.tools = function () {
    const item = (href, title, body, tag) => `<a class="card link" href="${href}"><div class="row"><div class="h3">${title}</div><span class="spacer"></span>${tag || ''}</div><p class="sub">${body}</p></a>`;
    return `
      ${C.title('Tools', 'Interactive research. Every screen carries the season toggle and separate timestamps for history, model and price.')}
      ${item('#/tools/shot-lab', 'Shot Lab', 'Where does he actually shoot from? Court map, filters, replay and The Eye’s Outlook.')}
      ${item('#/tools/alt-line', 'Alt Line Explorer', 'Slide the line and watch chance, fair odds and prices update together.')}
      ${item('#/pick/pk-morrow', 'Inside the Pick', 'The evidence behind a published pick: minutes, shot volume and matchup.', '<span class="tag grey">Desktop</span>')}
      <button class="card" style="text-align:left;opacity:.6" data-act="toast" data-arg="Scoring Blueprint is a desktop tool and is still being designed."><div class="row"><div class="h3">Scoring Blueprint</div><span class="spacer"></span><span class="tag grey">Desktop · soon</span></div><p class="sub">How a player’s points are built, possession by possession.</p></button>
      ${C.footer(['Historical frequency is not model probability.'])}
    `;
  };

  /* =========================================================
     SHOT LAB  (B1)
     ========================================================= */
  const BASKET = { x: 250, y: 52.5 };
  const SHOT_TYPES = { rim: ['layup', 'putback', 'floater'], mid: ['pull-up', 'catch-and-shoot', 'floater'], three: ['pull-up', 'catch-and-shoot', 'step-back'] };
  const cache = {};

  function genShots(player, season) {
    const key = player.id + season;
    if (cache[key]) return cache[key];
    const pr = player.profile;
    const nGames = season === '2026-27' ? (player.has2627 ? 3 : 0) : 60;
    const rnd = BP.rng(key);
    const shots = [];
    const startTs = season === '2026-27' ? Date.parse('2026-10-21T00:00:00Z') : Date.parse('2025-10-22T00:00:00Z');
    const opps = ['Denver', 'Utah', 'Boston', 'Miami', 'Dallas', 'Golden State', 'Chicago', 'New York', 'Memphis', 'Houston'];
    for (let g = 0; g < nGames; g++) {
      const home = rnd() < 0.5;
      const date = startTs + g * 2.8 * 86400000;
      const opp = opps[Math.floor(rnd() * opps.length)];
      const n = Math.max(6, Math.round(pr.fga + (rnd() - 0.5) * 9));
      for (let i = 0; i < n; i++) {
        const z = rnd();
        let zone, x, y, three = false;
        if (z < pr.rim) {
          zone = 'rim';
          const r = 5 + rnd() * 40, t = rnd() * Math.PI;
          x = BASKET.x + r * Math.cos(t); y = BASKET.y + r * Math.sin(t) * 0.9 + 4;
        } else if (z < pr.rim + pr.mid) {
          zone = 'mid';
          const r = 60 + rnd() * 155, t = (0.05 + rnd() * 0.9) * Math.PI;
          x = BASKET.x + r * Math.cos(t); y = BASKET.y + r * Math.sin(t);
        } else {
          three = true;
          if (rnd() < 0.22) {
            zone = rnd() < 0.5 ? 'c3l' : 'c3r';
            x = zone === 'c3l' ? 8 + rnd() * 18 : 474 + rnd() * 18; y = 8 + rnd() * 120;
          } else {
            zone = 'ab3';
            const r = 242 + rnd() * 45, t = (0.22 + rnd() * 0.56) * Math.PI;
            x = BASKET.x + r * Math.cos(t); y = BASKET.y + r * Math.sin(t);
          }
        }
        const pct = zone === 'rim' ? pr.fgRim : zone === 'mid' ? pr.fgMid : pr.fg3;
        const types = SHOT_TYPES[zone === 'rim' ? 'rim' : zone === 'mid' ? 'mid' : 'three'];
        const dist = Math.hypot(x - BASKET.x, y - BASKET.y) / 10;
        shots.push({
          g, date, opp, home, x, y, zone, three,
          made: rnd() < pct, period: 1 + Math.floor(rnd() * 4), clock: Math.floor(rnd() * 720),
          type: types[Math.floor(rnd() * types.length)], dist
        });
      }
    }
    cache[key] = { shots, nGames };
    return cache[key];
  }

  function shotView() {
    const sh = S.shot;
    const player = BP.player(sh.player);
    const data = genShots(player, sh.season);
    const win = sh.window === 'season' ? data.nGames : parseInt(sh.window.replace('last', ''), 10);
    const firstGame = Math.max(0, data.nGames - win);
    const f = sh.filters;
    const list = data.shots.filter(s => {
      if (s.g < firstGame) return false;
      if (sh.type === '2pt' && s.three) return false;
      if (sh.type === '3pt' && !s.three) return false;
      if (f.location !== 'all' && (f.location === 'home') !== s.home) return false;
      if (f.period !== 'all' && String(s.period) !== f.period) return false;
      if (f.outcome === 'made' && !s.made) return false;
      if (f.outcome === 'missed' && s.made) return false;
      if (f.shotType !== 'all' && s.type !== f.shotType) return false;
      if (f.distance !== 'all') {
        const [lo, hi] = f.distance.split('-').map(Number);
        if (s.dist < lo || s.dist >= (hi || 99)) return false;
      }
      return true;
    });
    const games = Math.min(win, data.nGames);
    const made = list.filter(s => s.made).length;
    return { player, data, list, games, made, firstGame };
  }

  function clockStr(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }

  function courtLines() {
    return `
      <rect class="line" x="2" y="2" width="496" height="466" />
      <rect class="line" x="170" y="2" width="160" height="188" />
      <circle class="line" cx="250" cy="190" r="60" />
      <path class="line" d="M 30 2 L 30 140 A 237.5 237.5 0 0 0 470 140 L 470 2" />
      <path class="line" d="M 210 52.5 A 40 40 0 0 0 290 52.5" />
      <line class="line" x1="220" y1="40" x2="280" y2="40" />
      <circle class="line" cx="250" cy="52.5" r="7.5" />
      <path class="line" d="M 190 468 A 60 60 0 0 1 310 468" />`;
  }

  function courtSvg(v) {
    const sh = S.shot;
    let dots = '';
    let extra = '';
    if (sh.mode === 'zones') {
      const zones = [
        { id: 'rim', label: 'Restricted', x: 250, y: 100 },
        { id: 'mid', label: 'Mid-range', x: 250, y: 250 },
        { id: 'c3l', label: 'Corner 3', x: 75, y: 60 },
        { id: 'c3r', label: 'Corner 3', x: 425, y: 60 },
        { id: 'ab3', label: 'Above the break', x: 250, y: 395 }
      ];
      extra = zones.map(z => {
        const zs = v.list.filter(s => s.zone === z.id);
        if (!zs.length) return `<text class="zone-sub" x="${z.x}" y="${z.y}">${z.label} · —</text>`;
        const pct = zs.filter(s => s.made).length / zs.length;
        const rad = 26 + Math.min(30, zs.length / 4);
        return `<circle cx="${z.x}" cy="${z.y - 5}" r="${rad}" fill="rgba(198,255,74,${(0.08 + pct * 0.45).toFixed(2)})" />
          <text class="zone-label" x="${z.x}" y="${z.y}">${Math.round(pct * 100)}%</text>
          <text class="zone-sub" x="${z.x}" y="${z.y + 16}">${z.label} · ${zs.length}</text>`;
      }).join('');
    } else if (sh.replay.on) {
      const seq = replaySeq(v);
      const shown = seq.slice(0, sh.replay.i);
      dots = shown.map((s, idx) => dot(s, idx === shown.length - 1 ? 7 : 5)).join('');
      const cur = shown[shown.length - 1];
      if (cur && sh.replay.arcs) {
        const cx = (cur.x + BASKET.x) / 2, cy = Math.min(cur.y, BASKET.y) - 30;
        extra = `<path class="arc" d="M ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${BASKET.x} ${BASKET.y}" />
          <text class="zone-sub" x="${cx.toFixed(1)}" y="${(cy - 6).toFixed(1)}">reconstructed path</text>`;
      }
    } else {
      dots = v.list.map(s => dot(s, 5)).join('');
    }
    return `<svg class="court-svg" viewBox="0 0 500 470" role="img" aria-label="Shot chart: ${v.list.length} attempts, ${v.made} made">${courtLines()}${extra}${dots}</svg>`;
  }
  function dot(s, r) {
    return s.made ? `<circle class="made" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${r}" />` : `<circle class="miss" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${r}" />`;
  }
  function replaySeq(v) {
    const last = v.data.nGames - 1;
    return v.data.shots.filter(s => s.g === last && (S.shot.type === 'all' || (S.shot.type === '3pt') === s.three))
      .sort((a, b) => a.period - b.period || b.clock - a.clock);
  }

  let replayTimer = null;
  function stopReplay() { clearInterval(replayTimer); replayTimer = null; S.shot.replay.playing = false; }
  function tickReplay() {
    const v = shotView();
    const seq = replaySeq(v);
    if (S.shot.replay.i >= seq.length) { stopReplay(); BP.render(); return; }
    S.shot.replay.i++;
    const court = document.getElementById('court');
    const bar = document.getElementById('replay-info');
    const range = document.getElementById('replay-range');
    if (court) court.innerHTML = courtSvg(v);
    if (bar) bar.innerHTML = replayInfo(seq);
    if (range) range.value = S.shot.replay.i;
  }
  function replayInfo(seq) {
    const i = S.shot.replay.i;
    if (!i) return `<span class="muted small">Event order · press play to reveal shots</span>`;
    const s = seq[i - 1];
    return `<span class="small"><b>Q${s.period} · ${clockStr(s.clock)}</b> — ${e(s.type)} ${s.three ? '3PT' : '2PT'} · ${s.made ? '<span class="accent">Made</span>' : 'Missed'}</span>`;
  }

  function playerResults(q) {
    q = (q || '').trim().toLowerCase();
    const pr = id => BP.player(id);
    const row = p => `<button data-act="shot-player" data-arg="${p.id}"><span class="tag sport flat">${p.league}</span><span class="grow"><span class="title">${e(p.name)}</span><br><span class="dim small">${e(p.team)} · ${p.pos}</span></span></button>`;
    if (q) {
      const hits = BP.PLAYERS.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
      return hits.length ? `<div class="list">${hits.map(row).join('')}</div>` : C.empty('No players found', 'Try a surname or team.');
    }
    return `<div class="eyebrow">Recent</div><div class="list">${BP.RECENT_PLAYERS.map(id => row(pr(id))).join('')}</div>
      <div class="eyebrow">Popular</div><div class="list">${BP.POPULAR_PLAYERS.map(id => row(pr(id))).join('')}</div>`;
  }

  BP.inputs['shot-search'] = function (el) {
    S.shot.query = el.value;
    const box = document.getElementById('player-results');
    if (box && (el.value || !S.shot.player)) box.innerHTML = playerResults(el.value);
    else BP.render();
  };
  BP.inputs['shot-replay'] = function (el) {
    stopReplay();
    S.shot.replay.i = parseInt(el.value, 10);
    const v = shotView();
    document.getElementById('court').innerHTML = courtSvg(v);
    document.getElementById('replay-info').innerHTML = replayInfo(replaySeq(v));
  };

  Object.assign(BP.actions, {
    'shot-player': (el) => {
      const p = BP.player(el.dataset.arg);
      stopReplay();
      S.shot.player = p.id;
      S.shot.season = p.has2627 ? '2026-27' : '2025-26';
      S.shot.window = 'season';
      S.shot.type = 'all';
      S.shot.mode = 'shots';
      S.shot.filters = { location: 'all', period: 'all', outcome: 'all', shotType: 'all', distance: 'all' };
      S.shot.replay = { on: false, i: 0, playing: false, arcs: false };
      S.shot.query = '';
      S.ui.sheet = null;
    },
    'shot-clear': () => { stopReplay(); S.shot.player = null; },
    'shot-season': (el) => { S.shot.season = el.value; stopReplay(); S.shot.replay.on = false; },
    'shot-window': (el) => { S.shot.window = el.dataset.arg; },
    'shot-mode': (el) => { S.shot.mode = el.dataset.arg; stopReplay(); S.shot.replay.on = false; },
    'shot-type': (el) => { S.shot.type = el.dataset.arg; S.shot.replay.i = 0; },
    'shot-filter': (el) => { const [k, v] = el.dataset.arg.split(':'); S.shot.filters[k] = v; },
    'shot-filter-reset': () => { S.shot.filters = { location: 'all', period: 'all', outcome: 'all', shotType: 'all', distance: 'all' }; },
    'shot-replay': () => {
      const r = S.shot.replay;
      S.shot.mode = 'shots';
      if (!r.on) { r.on = true; r.i = 0; }
      if (r.playing) { stopReplay(); return; }
      const seq = replaySeq(shotView());
      if (r.i >= seq.length) r.i = 0;
      r.playing = true;
      replayTimer = setInterval(tickReplay, 420);
    },
    'shot-replay-exit': () => { stopReplay(); S.shot.replay.on = false; S.shot.replay.i = 0; },
    'shot-arcs': () => { S.shot.replay.arcs = !S.shot.replay.arcs; }
  });

  BP.sheets.shotFilters = function () {
    const f = S.shot.filters;
    const opt = (k, label, opts) => `<div class="stack"><span class="label">${label}</span><div class="chips">${opts.map(([v, l]) =>
      `<button class="chip ${f[k] === v ? 'on' : ''}" data-act="shot-filter" data-arg="${k}:${v}">${l}</button>`).join('')}</div></div>`;
    return BP.sheetHeader('Refine your view', 'Filters apply to historical data.') +
      opt('location', 'Location', [['all', 'All'], ['home', 'Home'], ['away', 'Away']]) +
      opt('period', 'Game period', [['all', 'Full game, including overtime'], ['1', 'Q1'], ['2', 'Q2'], ['3', 'Q3'], ['4', 'Q4']]) +
      opt('outcome', 'Shot outcome', [['all', 'All'], ['made', 'Made'], ['missed', 'Missed']]) +
      opt('shotType', 'Shot type', [['all', 'All'], ['pull-up', 'Pull-up'], ['catch-and-shoot', 'Catch & shoot'], ['layup', 'Layup'], ['floater', 'Floater'], ['putback', 'Putback'], ['step-back', 'Step-back']]) +
      opt('distance', 'Distance', [['all', 'All'], ['0-8', '0–8 ft'], ['8-16', '8–16 ft'], ['16-24', '16–24 ft'], ['24-99', '24+ ft']]) +
      `<p class="dim small" style="margin:0">ⓘ No defender distance or shot-clock filters — play-by-play doesn’t carry them.</p>
      <div class="row"><button class="btn secondary" style="flex:1" data-act="shot-filter-reset">Reset</button><button class="btn primary" style="flex:2" data-act="close-ui">Apply filters</button></div>`;
  };

  BP.screens.shotLab = function () {
    const sh = S.shot;
    const head = C.back('#/tools', 'Shot Explorer', `<button class="icon-btn" style="background:transparent" aria-label="About Shot Explorer" data-act="toast" data-arg="Made shots are filled, misses are hollow. Data is historical play-by-play.">${BP.icon.info}</button>`);
    const search = `<div class="stack"><span class="label">Choose a player</span>
      <label class="field">${BP.icon.search}<span class="sr-only">Search player</span><input type="search" placeholder="${sh.player ? e(BP.player(sh.player).name) : 'Search player'}" value="${e(sh.query)}" data-input="shot-search" autocomplete="off"></label></div>`;

    if (!sh.player || sh.query) {
      return `${head}${search}<div id="player-results" class="stack">${playerResults(sh.query)}</div>
        ${!sh.player ? '<p class="dim small center" style="margin:0">Pick a player to load their shot map. We never show an empty court.</p>' : ''}
        ${C.footer(['Historical frequency is not model probability.'])}`;
    }

    const v = shotView();
    const p = v.player;
    const fActive = Object.values(sh.filters).filter(x => x !== 'all').length;
    const seasonNote = sh.season === '2025-26' && !p.has2627
      ? `<p class="dim small" style="margin:-4px 0 0">No 2026-27 appearance yet — showing the full 2025-26 season.</p>` : '';
    const windows = [['season', 'Season'], ['last5', 'Last 5'], ['last10', 'Last 10'], ['last20', 'Last 20']];
    const box = v.list.length + (fActive === 0 && sh.type === 'all' ? p.mappedGap : 0);
    const mappedState = p.mappedGap && fActive === 0 && sh.type === 'all'
      ? `<div class="notice" role="status"><b>Mapped ${v.list.length} ≠ box score ${box}.</b> Both counts are shown while the league’s play-by-play corrections settle.</div>` : '';

    let courtBody;
    if (!v.list.length && !sh.replay.on) {
      courtBody = `<div style="padding:24px 16px">${C.empty('No shots match these filters', 'Widen the window or reset filters to bring the dots back.', '<button class="btn secondary small" data-act="shot-filter-reset">Reset filters</button>')}</div>`;
    } else {
      courtBody = `<div id="court">${courtSvg(v)}</div>`;
    }
    const seq = sh.replay.on ? replaySeq(v) : [];
    const replayBar = sh.replay.on ? `
      <div class="replay-bar">
        <button class="icon-btn" style="width:32px;height:32px" aria-label="${sh.replay.playing ? 'Pause' : 'Play'} replay" data-act="shot-replay">${sh.replay.playing ? BP.icon.pause : BP.icon.play}</button>
        <input id="replay-range" type="range" min="0" max="${seq.length}" value="${sh.replay.i}" data-input="shot-replay" aria-label="Replay position">
        <button class="chip ${sh.replay.arcs ? 'on' : ''}" data-act="shot-arcs" style="padding:4px 8px;font-size:11px">Arcs</button>
      </div>
      <div class="row" style="padding:0 12px 10px"><span id="replay-info">${replayInfo(seq)}</span><span class="spacer"></span><button class="linkish" data-act="shot-replay-exit">Done</button></div>
      <p class="dim tiny" style="margin:0;padding:0 12px 10px">Latest game · ${e(BP.day(v.data.shots.find(s => s.g === v.data.nGames - 1).date))} · event order (period + clock). Arcs are reconstructed, not tracked.</p>` : '';

    const o = p.outlook;
    const outlook = S.scenario.upcoming && o ? `
      <div class="card outlook">
        <div><div class="eyebrow spaced">THE EYE’S OUTLOOK</div><div class="muted small">Upcoming game ${e(o.opp)} · ${e(BP.day(o.tip))} · Model estimates</div></div>
        <div class="stats">
          <div><div class="muted small">Minutes</div><div class="v">${o.minutesMid}</div><div class="r">${o.minutes[0]}–${o.minutes[1]}</div></div>
          <div><div class="muted small">Attempts</div><div class="v">${o.fgaMid.toFixed(1)}</div><div class="r">${o.fga[0]}–${o.fga[1]}</div></div>
          <div><div class="muted small">3PA</div><div class="v">${o.tpaMid.toFixed(1)}</div><div class="r">${o.tpa[0]}–${o.tpa[1]}</div></div>
        </div>
        <p class="dim small" style="margin:0">Three-point attempts are included in total attempts. Model assessed ${BP.time(BP.MODEL_ASSESSED)}.</p>
        ${p.id === BP.PUBLISHED_ALT.player ? `<a class="btn secondary" href="#/tools/alt-line?player=${p.id}&market=${BP.PUBLISHED_ALT.market}&line=${BP.PUBLISHED_ALT.line}">View pick analysis ›</a>` : ''}
      </div>` : `
      <div class="card outlook">
        <div class="eyebrow spaced">THE EYE’S OUTLOOK</div>
        <b>Outlook unavailable</b>
        <p class="sub" style="margin:0">${o ? 'No simulated fixture yet. Forward numbers appear only on simulated slate days.' : 'No upcoming fixture on the schedule.'} We never show an invented forecast.</p>
      </div>`;

    return `${head}${search}
      <div class="row">
        <select class="select" style="flex:1" data-change="shot-season" aria-label="Season">
          <option value="2026-27" ${sh.season === '2026-27' ? 'selected' : ''} ${p.has2627 ? '' : 'disabled'}>2026–27 · Regular season${p.has2627 ? '' : ' (no games yet)'}</option>
          <option value="2025-26" ${sh.season === '2025-26' ? 'selected' : ''}>2025–26 · Regular season</option>
        </select>
        <button class="chip solid" style="padding:9px 12px;border-radius:10px" data-act="sheet" data-arg="shotFilters">${BP.icon.filter} Filters${fActive ? ` <span class="tag lime" style="padding:1px 6px">${fActive}</span>` : ''}</button>
      </div>
      ${seasonNote}
      <div class="seg" role="tablist" aria-label="Window">${windows.map(([k, l]) => `<button class="${sh.window === k ? 'on' : ''}" role="tab" aria-selected="${sh.window === k}" data-act="shot-window" data-arg="${k}">${l}</button>`).join('')}</div>
      <div class="court-card">
        <div class="bar">
          <div class="mini-seg"><button class="${sh.mode === 'shots' ? 'on' : ''}" data-act="shot-mode" data-arg="shots">Shots</button><button class="${sh.mode === 'zones' ? 'on' : ''}" data-act="shot-mode" data-arg="zones">Zones</button></div>
          <span class="spacer"></span>
          <div class="mini-seg"><button class="${sh.type === 'all' ? 'on' : ''}" data-act="shot-type" data-arg="all">All</button><button class="${sh.type === '2pt' ? 'on' : ''}" data-act="shot-type" data-arg="2pt">2PT</button><button class="${sh.type === '3pt' ? 'on' : ''}" data-act="shot-type" data-arg="3pt">3PT</button></div>
        </div>
        ${courtBody}
        ${sh.replay.on ? replayBar : `<div class="bar"><div class="legend"><span><i class="m"></i>Made</span><span><i class="x"></i>Missed</span></div><span class="spacer"></span><button class="chip" data-act="shot-replay" ${v.data.nGames ? '' : 'disabled'}>${BP.icon.replay} Replay</button></div>`}
      </div>
      <div class="row small"><span>${v.games} games · ${v.list.length} attempts · ${v.list.length ? BP.pct(v.made / v.list.length) : '—'} FG</span><span class="spacer"></span><span class="dim">History · ${sh.season}</span></div>
      ${mappedState}
      ${outlook}
      <a class="btn primary" href="#/tools/alt-line?player=${p.id}">Explore lines ›</a>
      ${C.footer(['Historical frequency is not model probability.', 'Shot type comes from play-by-play; no defender distance or shot-clock filters.'])}`;
  };
  BP.screens.shotLab.enter = function (r) {
    if (r.query.player && BP.player(r.query.player)) BP.actions['shot-player']({ dataset: { arg: r.query.player } });
    BP.onLeave = stopReplay;
  };

  /* =========================================================
     ALT LINE EXPLORER  (B2)
     ========================================================= */
  const STEP = { points: 5, pra: 5, rebounds: 2, assists: 2, threes: 1 };

  function dist(player, marketId) {
    const key = player.id + marketId;
    if (cache[key]) return cache[key];
    const m = BP.MARKETS.find(x => x.id === marketId);
    const mu = player.markets[marketId];
    const sd = Math.max(0.9, mu * m.sd);
    const maxK = Math.ceil(mu + 4 * sd);
    const P = [];
    let tot = 0;
    for (let k = 0; k <= maxK; k++) {
      const lo = k === 0 ? -1e9 : k - 0.5;
      P[k] = BP.normCdf(k + 0.5, mu, sd) - BP.normCdf(lo, mu, sd);
      tot += P[k];
    }
    for (let k = 0; k <= maxK; k++) P[k] /= tot;
    const d = { mu, sd, P, maxK, main: Math.floor(mu) + 0.5, minLine: 0.5, maxLine: Math.floor(mu + 3 * sd) + 0.5 };
    cache[key] = d;
    return d;
  }
  function chance(d, line, side) {
    let over = 0;
    for (let k = Math.ceil(line); k <= d.maxK; k++) if (k > line) over += d.P[k];
    return side === 'over' ? over : 1 - over;
  }
  function quotes(player, marketId, side, line, d) {
    const p = chance(d, line, side);
    const far = Math.abs(line - d.main) / (STEP[marketId] || 1);
    return BP.BOOKS.map(book => {
      const r = BP.rng(player.id + marketId + side + line + book);
      const roll = r();
      let state = 'ok';
      if (roll < 0.06 + far * 0.1) state = 'none';
      else if (roll > 0.94) state = 'absent';
      else if (roll > 0.86) state = 'old';
      let price = 1 / (p * (1 + (-0.05 + r() * 0.13)));
      price = Math.min(51, Math.max(1.01, Math.round(price * 100) / 100));
      const pub = BP.PUBLISHED_ALT;
      if (pub.player === player.id && pub.market === marketId && pub.side === side && pub.line === line && book === pub.book) { price = pub.price; state = 'ok'; }
      const capturedAt = state === 'old' ? BP.CAPTURED_AT - (45 + Math.floor(r() * 60)) * 60000 : BP.CAPTURED_AT;
      return { book, state, price, capturedAt };
    });
  }
  function bestQuote(qs) {
    return qs.filter(q => BP.inBooks(q.book) && (q.state === 'ok' || q.state === 'old')).sort((a, b) => b.price - a.price)[0] || null;
  }
  function recorded(player, marketId, n, d) {
    const r = BP.rng(player.id + marketId + 'log');
    const vals = [];
    for (let i = 0; i < 60; i++) {
      // inverse-CDF sample from the discrete distribution
      let u = r(), k = 0, acc = d.P[0];
      while (u > acc && k < d.maxK) { k++; acc += d.P[k]; }
      vals.push(k);
    }
    return n === 'season' ? vals : vals.slice(-parseInt(n, 10));
  }

  function histSvg(d, line, side, interactive) {
    const lo = Math.max(0, Math.floor(d.mu - 3.2 * d.sd)), hi = Math.min(d.maxK, Math.ceil(d.mu + 3.2 * d.sd));
    const n = hi - lo + 1, W = 340, H = 150, padB = 20, bw = W / n;
    const maxP = Math.max.apply(null, d.P.slice(lo, hi + 1));
    let bars = '';
    for (let k = lo; k <= hi; k++) {
      const h = (d.P[k] / maxP) * (H - padB - 22);
      const win = side === 'over' ? k > line : k < line;
      const x = (k - lo) * bw;
      bars += `<rect x="${(x + bw * 0.15).toFixed(1)}" y="${(H - padB - h).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${win ? '#c6ff4a' : 'rgba(198,255,74,0.18)'}" />`;
      if (n <= 14 || (k % Math.ceil(n / 10) === 0)) bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 5}" fill="#8e8e93" font-size="10" text-anchor="middle">${k}</text>`;
    }
    const lx = ((line - lo + 0.5) * bw).toFixed(1);
    const label = `${side === 'over' ? 'Over' : 'Under'} ${line}`;
    return `<svg class="hist" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="The Eye's Range: ${BP.pct(chance(d, line, side), 0)} of simulations ${label}">
      ${bars}
      <line x1="${lx}" y1="18" x2="${lx}" y2="${H - padB}" stroke="#fff" stroke-width="1.5" />
      <rect x="${(lx - 32)}" y="0" width="64" height="17" rx="4" fill="#0a0910" stroke="#c6ff4a" />
      <text x="${lx}" y="12.5" fill="#c6ff4a" font-size="10" font-weight="700" text-anchor="middle">${label}</text>
    </svg>`;
  }

  function altModel() {
    const a = S.alt;
    const player = BP.player(a.player);
    const d = dist(player, a.market);
    const p = chance(d, a.line, a.side);
    const qs = quotes(player, a.market, a.side, a.line, d);
    const best = bestQuote(qs);
    return { player, d, p, qs, best, fair: 1 / p, ev: best ? p * best.price - 1 : null };
  }

  function selectedLineCard(m) {
    const a = S.alt;
    const slate = S.scenario.slate;
    const pub = BP.PUBLISHED_ALT;
    const isPub = pub.player === a.player && pub.market === a.market && pub.side === a.side && pub.line === a.line;
    const best = m.best;
    return `
      <div class="card">
        <div class="row"><span class="eyebrow spaced">SELECTED LINE</span><span class="spacer"></span><span class="dim small">${a.side === 'over' ? 'Over' : 'Under'} ${a.line}</span></div>
        <div class="tiles">
          <div class="tile"><span class="k">Estimated chance</span><span class="v">${slate ? BP.pct(m.p, 0) : '—'}</span></div>
          <div class="tile"><span class="k">Estimated fair odds</span><span class="v">${slate ? BP.odds(m.fair) : '—'}</span></div>
        </div>
        <div class="tiles">
          <div class="tile"><span class="k">Best available odds</span><span class="v">${best ? BP.odds(best.price) : 'No quote'}</span><span class="dim tiny">${best ? `${e(best.book)} · ${best.state === 'old' ? 'as at ' : ''}${BP.time(best.capturedAt)}` : 'None of your books quote this line'}</span></div>
          <div class="tile"><span class="k">Estimated EV</span><span class="v ${m.ev > 0 ? 'pos' : m.ev < 0 ? 'neg' : ''}">${slate && m.ev != null ? BP.signedPct(m.ev) : '—'}</span><span class="dim tiny">${slate ? `Model assessed ${BP.time(BP.MODEL_ASSESSED)}` : 'No model numbers today'}</span></div>
        </div>
        ${isPub ? `<div class="readonly"><div class="row"><span class="tag lime">PUBLISHED PICK</span><span class="spacer"></span><span class="mono">Published ${BP.time(pub.publishedAt)}</span></div>
          <div class="small">Piggy’s Picks · ${a.side === 'over' ? 'Over' : 'Under'} ${pub.line} ${e(BP.MARKETS.find(x => x.id === pub.market).label.toLowerCase())} @ ${BP.odds(pub.price)} ${e(pub.book)}</div>
          <div class="dim tiny">Read-only. Graded at the published price forever.</div></div>` : ''}
        <div class="row" style="gap:8px"><button class="btn primary" style="flex:1" data-act="alt-view" data-arg="compare">Compare lines</button><button class="btn secondary" style="flex:1" data-act="alt-view" data-arg="prices">See prices</button></div>
      </div>`;
  }

  function altLive() {
    const m = altModel();
    const slate = S.scenario.slate;
    const range = slate ? `
      <div class="range-card">
        <div class="center"><div class="eyebrow spaced">THE EYE’S RANGE</div><div class="dim tiny">100,000 simulations · discrete outcomes · assessed ${BP.time(BP.MODEL_ASSESSED)}</div></div>
        ${histSvg(m.d, S.alt.line, S.alt.side)}
      </div>` : `
      <div class="card" style="border-style:dashed"><b>Historical only today</b><p class="sub" style="margin:0">Model numbers appear on slate days only, when The Eye publishes a distribution file for this game. Recorded results and prices are still shown.</p></div>`;
    return range + selectedLineCard(m);
  }

  function recordedCard(m) {
    const a = S.alt;
    const vals = recorded(m.player, a.market, a.rec, m.d);
    const hits = vals.filter(v => a.side === 'over' ? v > a.line : v < a.line).length;
    const push = vals.filter(v => v === a.line).length;
    const miss = vals.length - hits - push;
    const wins = [['5', 'Last 5'], ['10', 'Last 10'], ['20', 'Last 20'], ['season', 'Season']];
    return `<div class="card">
      <div class="eyebrow spaced">RECORDED RESULTS</div>
      <div class="seg">${wins.map(([k, l]) => `<button class="${a.rec === k ? 'on' : ''}" data-act="alt-rec" data-arg="${k}">${l}</button>`).join('')}</div>
      <div class="center" style="font-size:16px">${a.side === 'over' ? 'Over' : 'Under'} ${a.line} in <b>${hits} of ${vals.length}</b> games</div>
      <div class="row small center" style="justify-content:center;gap:14px"><span class="accent">${hits} hits</span><span class="muted">${push} pushes</span><span class="neg">${miss} misses</span></div>
      <div class="log" aria-label="Game log, oldest to newest">${vals.slice(-20).map(v => { const c = v === a.line ? 'p' : ((a.side === 'over' ? v > a.line : v < a.line) ? 'h' : 'm'); return `<span class="${c}" title="${v}">${v}</span>`; }).join('')}</div>
      <p class="dim small center" style="margin:0">History · 2025–26 season to date. Historical frequency is not model probability.</p>
      <a class="btn secondary" href="#/tools/shot-lab?player=${m.player.id}">Explore shot profile ›</a>
    </div>`;
  }

  function compareView(m) {
    const a = S.alt;
    const step = STEP[a.market] || 1;
    const lines = [];
    for (let i = -2; i <= 2; i++) {
      const l = a.line + i * step;
      if (l >= m.d.minLine && l <= m.d.maxLine) lines.push(l);
    }
    const rows = lines.map(l => {
      const p = chance(m.d, l, a.side);
      const best = bestQuote(quotes(m.player, a.market, a.side, l, m.d));
      const ev = best ? p * best.price - 1 : null;
      return `<tr class="${l === a.line ? 'sel' : ''}" data-act="alt-line-set" data-arg="${l}" tabindex="0">
        <td><b>${a.side === 'over' ? 'Over' : 'Under'} ${l}</b><div class="dim tiny">${best ? `${e(best.book)} · ${BP.time(best.capturedAt)}` : 'No quote'}</div></td>
        <td>${S.scenario.slate ? BP.pct(p, 0) : '—'}</td>
        <td>${best ? BP.odds(best.price) : '—'}</td>
        <td class="r ${ev > 0 ? 'pos' : ev < 0 ? 'neg' : ''}">${S.scenario.slate && ev != null ? BP.signedPct(ev) : '—'}</td></tr>`;
    }).join('');
    return `<div class="card">
      <div><h2 class="h2">Compare alternatives</h2><p class="sub">Best price among your selected bookmakers.</p></div>
      <table class="table"><thead><tr><th>Line</th><th>Est. chance</th><th>Price</th><th class="r">Est. EV</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="dim small" style="margin:0">ⓘ A higher chance can still offer a poorer price. Model estimate, history and price are kept visually distinct.</p>
      <button class="linkish" data-act="alt-view" data-arg="explore">‹ Back to The Eye’s Range</button>
    </div>`;
  }

  function pricesView(m) {
    const a = S.alt;
    const mine = m.qs.filter(q => BP.inBooks(q.book));
    const bestPrice = m.best ? m.best.price : null;
    const row = q => {
      let right;
      if (q.state === 'ok') right = `<b class="p">${BP.odds(q.price)}</b><div class="dim tiny">captured ${BP.time(q.capturedAt)}</div>`;
      else if (q.state === 'old') right = `<b class="p">${BP.odds(q.price)}</b><div class="warn-text tiny">as at ${BP.time(q.capturedAt)} · ${BP.ago(q.capturedAt)}</div>`;
      else if (q.state === 'none') right = `<span class="dim small">No quote</span><div class="dim tiny">no quoted EV</div>`;
      else right = `<span class="dim small">Unavailable</span><div class="dim tiny">absent from ${BP.time(BP.CAPTURED_AT)} snapshot</div>`;
      const ev = (q.state === 'ok' || q.state === 'old') && S.scenario.slate ? m.p * q.price - 1 : null;
      return `<div class="book-row ${q.price === bestPrice && (q.state === 'ok' || q.state === 'old') ? 'best' : ''}"><span style="flex:1">${e(q.book)}</span>${ev != null ? `<span class="small ${ev > 0 ? 'pos' : 'neg'}">${BP.signedPct(ev)}</span>` : ''}<div style="text-align:right;min-width:110px">${right}</div></div>`;
    };
    return `<div class="card">
      <div><h2 class="h2">Prices · ${a.side === 'over' ? 'Over' : 'Under'} ${a.line}</h2><p class="sub">Plain-text prices from your bookmakers. No featured book, no links.</p></div>
      <div>${mine.map(row).join('') || C.empty('No bookmakers selected', 'Choose at least one bookmaker to see prices.')}</div>
      <div class="row small"><span class="dim">Showing ${mine.length} of ${BP.BOOKS.length} books</span><span class="spacer"></span><a class="linkish accent" href="#/account/bookmakers">My bookmakers ›</a></div>
      <button class="linkish" data-act="alt-view" data-arg="explore">‹ Back to The Eye’s Range</button>
    </div>`;
  }

  BP.inputs['alt-slider'] = function (el) {
    S.alt.line = parseFloat(el.value);
    const live = document.getElementById('alt-live');
    if (live) live.innerHTML = altLive();
    const val = document.getElementById('alt-val');
    if (val) val.textContent = `${S.alt.side === 'over' ? 'Over' : 'Under'} ${S.alt.line}`;
  };
  BP.inputs['alt-search'] = function (el) {
    S.alt.query = el.value;
    const box = document.getElementById('alt-results');
    if (!box || !el.value) { if (el.dataset.rendering !== '1') BP.render(); return; }
    const q = el.value.trim().toLowerCase();
    const hits = q ? BP.PLAYERS.filter(p => p.name.toLowerCase().includes(q)) : BP.PLAYERS;
    box.innerHTML = hits.length ? `<div class="list">${hits.map(p => `<button data-act="alt-player" data-arg="${p.id}"><span class="tag sport flat">${p.league}</span><span class="grow title">${e(p.name)}</span><span class="dim small">${e(p.team)}</span></button>`).join('')}</div>` : C.empty('No players found', 'Try a surname.');
  };

  function setPlayer(id, market, line) {
    const p = BP.player(id);
    if (!p) return;
    S.alt.player = id;
    S.alt.market = market && p.markets[market] != null ? market : S.alt.market;
    const d = dist(p, S.alt.market);
    S.alt.line = line != null && !isNaN(line) ? line : d.main;
    S.alt.query = '';
  }

  Object.assign(BP.actions, {
    'alt-player': (el) => { setPlayer(el.dataset.arg); S.alt.view = 'explore'; },
    'alt-market': (el) => { S.alt.market = el.value; S.alt.line = dist(BP.player(S.alt.player), el.value).main; },
    'alt-side': (el) => { S.alt.side = el.dataset.arg; },
    'alt-step': (el) => {
      const d = dist(BP.player(S.alt.player), S.alt.market);
      S.alt.line = Math.min(d.maxLine, Math.max(d.minLine, S.alt.line + parseFloat(el.dataset.arg)));
    },
    'alt-line-set': (el) => { S.alt.line = parseFloat(el.dataset.arg); },
    'alt-view': (el) => { S.alt.view = el.dataset.arg; },
    'alt-rec': (el) => { S.alt.rec = el.dataset.arg; }
  });

  BP.screens.altLine = function () {
    const a = S.alt;
    const m = altModel();
    const d = m.d;
    const head = C.back('#/tools', 'Alt Line Explorer', `<button class="icon-btn" style="background:transparent" aria-label="About Alt Line Explorer" data-act="toast" data-arg="All values derive from the same simulation histogram. Real integer bars only — no smoothed curve.">${BP.icon.info}</button>`);
    const picker = `<div class="stack"><span class="label">Choose a player</span>
      <label class="field">${BP.icon.search}<span class="sr-only">Search player</span><input type="search" placeholder="${e(m.player.name)}" value="${e(a.query)}" data-input="alt-search" autocomplete="off"></label></div>`;
    if (a.query) return `${head}${picker}<div id="alt-results"></div>`;

    const step = STEP[a.market] || 1;
    const chips = [];
    for (let i = -1; i <= 2; i++) { const l = d.main + (i - 0) * step; if (l >= d.minLine && l <= d.maxLine) chips.push(l); }
    let body;
    if (a.view === 'compare') body = compareView(m);
    else if (a.view === 'prices') body = pricesView(m);
    else {
      body = `
        <div class="stack">
          <div class="stepper">
            <button class="icon-btn" aria-label="Lower line" data-act="alt-step" data-arg="-1">−</button>
            <div class="val" id="alt-val">${a.side === 'over' ? 'Over' : 'Under'} ${a.line}</div>
            <button class="icon-btn" aria-label="Raise line" data-act="alt-step" data-arg="1">+</button>
          </div>
          <input class="line-slider" type="range" min="${d.minLine}" max="${d.maxLine}" step="1" value="${a.line}" data-input="alt-slider" aria-label="Line">
          <div class="line-chips">${chips.map(l => `<button class="${l === a.line ? 'on' : ''}" data-act="alt-line-set" data-arg="${l}">${l}</button>`).join('')}</div>
          <p class="dim tiny center" style="margin:0">Drag to change the line — chance, fair odds and prices update together.</p>
        </div>
        <div id="alt-live" class="stack lg">${altLive()}</div>`;
    }

    return `${head}${picker}
      <div class="row">
        <select class="select" style="flex:1" data-change="alt-market" aria-label="Market">${BP.MARKETS.map(x => `<option value="${x.id}" ${a.market === x.id ? 'selected' : ''}>${x.label}</option>`).join('')}</select>
        <span class="chip solid" style="padding:9px 12px;border-radius:10px">${e(m.player.outlook ? m.player.outlook.opp : 'Next game')}</span>
      </div>
      <div class="seg"><button class="${a.side === 'over' ? 'on' : ''}" data-act="alt-side" data-arg="over">Over</button><button class="${a.side === 'under' ? 'on' : ''}" data-act="alt-side" data-arg="under">Under</button></div>
      ${body}
      ${recordedCard(m)}
      <div class="card tight">${C.acc('alt-inputs', 'Model inputs & limitations', BP.isOpen('alt-inputs'), `
        <ul class="sub" style="margin:0;padding-left:18px;line-height:20px">
          <li>The Eye simulates each game 100,000 times; the bars are the integer outcomes.</li>
          <li>Inputs: projected minutes, recent role, usage, opponent pace. Injury news after ${BP.time(BP.MODEL_ASSESSED)} is not reflected.</li>
          <li>Prices are captured snapshots; they can move before you place a bet.</li>
          <li>Recorded results are history, not model probability.</li>
        </ul>`)}</div>
      ${C.footer(['Higher chance does not always mean better value.', 'Model estimates are not guarantees.'])}`;
  };
  BP.screens.altLine.enter = function (r) {
    if (r.query.player) setPlayer(r.query.player, r.query.market, r.query.line != null ? parseFloat(r.query.line) : null);
    S.alt.view = 'explore';
  };
  BP.screens.altLine.after = function () {
    if (S.alt.query && document.getElementById('alt-results')) {
      const inp = document.querySelector('[data-input="alt-search"]');
      inp.dataset.rendering = '1';
      BP.inputs['alt-search'](inp);
      inp.dataset.rendering = '';
      inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  };
  BP.screens.shotLab.after = function () {
    if (S.shot.query) {
      const inp = document.querySelector('[data-input="shot-search"]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
  };
})(window.BP);
