/* Storyboard rail: the four user flows from the Figma file, each step linked to
   the live screen, with every decision branch wired to the matching data state. */
(function (BP) {
  const S = BP.S, e = BP.esc;

  function shotPlayer(id) { BP.actions['shot-player']({ dataset: { arg: id } }); }
  const R = () => BP.current || BP.route();

  const FLOWS = [
    {
      id: 'B1', title: 'Shot Lab — research a player', note: 'Entry from Tools, a player card, or a pick’s supporting analysis.',
      steps: [
        { k: 'SCREEN', t: 'Tools → Shot Lab', go: () => { S.shot.player = null; S.shot.query = ''; return '#/tools/shot-lab'; }, match: r => r.name === 'shotLab' && !S.shot.player },
        { k: 'DECISION', t: 'Has 2026-27 appearance?', branches: [
          { label: 'Yes → 2026-27', on: () => S.shot.player === 'brandt', go: () => { shotPlayer('brandt'); return '#/tools/shot-lab'; } },
          { label: 'No → full 2025-26', on: () => S.shot.player === 'hale', go: () => { shotPlayer('hale'); return '#/tools/shot-lab'; } }
        ] },
        { k: 'SCREEN', t: 'Court map', go: () => { if (!S.shot.player) shotPlayer('hale'); S.shot.mode = 'shots'; return '#/tools/shot-lab'; }, match: r => r.name === 'shotLab' && S.shot.player && !S.shot.replay.on && S.ui.sheet !== 'shotFilters' },
        { k: 'SCREEN', t: 'Refine filters', go: () => { if (!S.shot.player) shotPlayer('hale'); S.ui.sheet = 'shotFilters'; return '#/tools/shot-lab'; }, match: () => S.ui.sheet === 'shotFilters' },
        { k: 'TO DESIGN', t: 'Replay', go: () => { if (!S.shot.player) shotPlayer('hale'); setTimeout(() => { BP.actions['shot-replay'](); BP.render(); }, 60); return '#/tools/shot-lab'; }, match: r => r.name === 'shotLab' && S.shot.replay.on },
        { k: 'DECISION', t: 'Upcoming simulated game?', branches: [
          { label: 'Yes → Outlook', on: () => S.scenario.upcoming, go: () => { S.scenario.upcoming = true; if (!S.shot.player) shotPlayer('hale'); return '#/tools/shot-lab'; } },
          { label: 'No → unavailable', on: () => !S.scenario.upcoming, go: () => { S.scenario.upcoming = false; if (!S.shot.player) shotPlayer('hale'); return '#/tools/shot-lab'; } }
        ] },
        { k: 'STATE', t: 'Mapped ≠ box count', go: () => { shotPlayer('cole'); return '#/tools/shot-lab'; }, match: r => r.name === 'shotLab' && S.shot.player === 'cole' },
        { k: 'SCREEN', t: 'Explore lines →', go: () => `#/tools/alt-line?player=${S.shot.player || 'hale'}`, match: r => r.name === 'altLine' && r.query.player }
      ]
    },
    {
      id: 'B2', title: 'Alt Line Explorer — find the right line', note: 'Slate days only for model numbers; otherwise historical-only.',
      steps: [
        { k: 'SCREEN', t: 'Tools → Alt Line Explorer', go: () => { S.alt.view = 'explore'; return '#/tools/alt-line'; }, match: r => r.name === 'altLine' && S.alt.view === 'explore' },
        { k: 'DECISION', t: 'Distribution file for this slate?', branches: [
          { label: 'Yes → The Eye’s Range', on: () => S.scenario.slate, go: () => { S.scenario.slate = true; S.alt.view = 'explore'; return '#/tools/alt-line'; } },
          { label: 'No → historical-only', on: () => !S.scenario.slate, go: () => { S.scenario.slate = false; S.alt.view = 'explore'; return '#/tools/alt-line'; } }
        ] },
        { k: 'TO DESIGN', t: 'Slide the line', go: () => { S.alt.view = 'explore'; return '#/tools/alt-line'; } },
        { k: 'DECISION', t: 'Quote for this line?', sub: 'Per-book prices · no quote · old · absent', go: () => { S.alt.view = 'prices'; return '#/tools/alt-line'; }, match: r => r.name === 'altLine' && S.alt.view === 'prices' },
        { k: 'SCREEN', t: 'Compare alternatives', go: () => { S.alt.view = 'compare'; return '#/tools/alt-line'; }, match: r => r.name === 'altLine' && S.alt.view === 'compare' },
        { k: 'TO DESIGN', t: 'My bookmakers', go: () => '#/account/bookmakers', match: r => r.name === 'bookmakers' },
        { k: 'TO DESIGN', t: 'Recorded results vs line', go: () => { S.alt.view = 'explore'; S.alt.rec = '10'; return '#/tools/alt-line'; } },
        { k: 'STATE', t: 'Published pick shown', go: () => { S.alt.side = 'over'; return '#/tools/alt-line?player=hale&market=threes&line=2.5'; } }
      ]
    },
    {
      id: 'B3', title: 'Edge Room — hunt a price', note: 'Tool tabs: Sims · Arbitrage · +EV · Middles · Odds. Refresh cue reads real capture timestamps.',
      steps: [
        { k: 'SCREEN', t: 'Edge Room → sport tab', go: () => { S.sport = 'NFL'; return '#/edge/odds'; }, match: r => r.name === 'edge' && r.params.tab === 'odds' },
        { k: 'SCREEN', t: 'Pick a tool tab', sub: 'Arbitrage · +EV · Middles · Odds', go: () => '#/edge/arbitrage' },
        { k: 'SCREEN', t: 'Game picker', go: () => { S.ui.sheet = 'gamePicker'; const r = R(); return r.name === 'edge' && r.params.tab !== 'sims' ? location.hash : '#/edge/ev'; }, match: () => S.ui.sheet === 'gamePicker' },
        { k: 'DECISION', t: 'Opportunities on board?', branches: [
          { label: 'Yes → cards', on: () => !S.scenario.boardEmpty, go: () => { S.scenario.boardEmpty = false; return R().name === 'edge' ? location.hash : '#/edge/arbitrage'; } },
          { label: 'No → empty board', on: () => S.scenario.boardEmpty, go: () => { S.scenario.boardEmpty = true; return R().name === 'edge' && R().params.tab !== 'sims' ? location.hash : '#/edge/arbitrage'; } }
        ] },
        { k: 'SCREEN', t: 'Arbitrage → calculator', go: () => { S.sport = 'all'; S.edge.game = 'all'; S.scenario.boardEmpty = false; return '#/edge/arbitrage'; }, match: r => r.name === 'edge' && r.params.tab === 'arbitrage' },
        { k: 'SCREEN', t: 'Middles', go: () => { S.sport = 'all'; S.edge.game = 'all'; S.scenario.boardEmpty = false; return '#/edge/middles'; }, match: r => r.name === 'edge' && r.params.tab === 'middles' },
        { k: 'SCREEN', t: '+EV card', go: () => { S.sport = 'all'; S.edge.game = 'all'; S.scenario.boardEmpty = false; return '#/edge/ev'; }, match: r => r.name === 'edge' && r.params.tab === 'ev' },
        { k: 'STATE', t: 'System states', branches: [
          { label: 'On time', on: () => S.scenario.snapshot === 'ontime', go: () => snap('ontime') },
          { label: 'Delayed', on: () => S.scenario.snapshot === 'delayed', go: () => snap('delayed') },
          { label: 'Unavailable', on: () => S.scenario.snapshot === 'unavailable', go: () => snap('unavailable') },
          { label: 'Loading', on: () => S.scenario.snapshot === 'loading', go: () => snap('loading') }
        ] }
      ]
    },
    {
      id: 'B4', title: 'Piggy’s Picks — from pick to grade', note: 'Headline tally = Piggy’s Picks only. Alt Picks and Multis keep separate records.',
      steps: [
        { k: 'SCREEN', t: 'Edge Room → Sims', go: () => '#/edge/sims', match: r => r.name === 'edge' && r.params.tab === 'sims' },
        { k: 'DECISION', t: 'Sport has published picks?', branches: [
          { label: 'Yes (WNBA)', on: () => S.edge.simSport === 'WNBA', go: () => sims('WNBA') },
          { label: 'Pre-season (NBA)', on: () => S.edge.simSport === 'NBA', go: () => sims('NBA') },
          { label: 'None (NBL)', on: () => S.edge.simSport === 'NBL', go: () => sims('NBL') }
        ] },
        { k: 'SCREEN', t: 'Pick of the Day + analysis', go: () => { S.scenario.access = S.scenario.access === 'free' ? 'trial' : S.scenario.access; return sims('WNBA'); } },
        { k: 'DECISION', t: 'Member access?', branches: [
          { label: 'Free → upsell', on: () => S.scenario.access === 'free', go: () => access('free') },
          { label: 'Trial', on: () => S.scenario.access === 'trial', go: () => access('trial') },
          { label: 'Paid', on: () => S.scenario.access === 'paid', go: () => access('paid') }
        ] },
        { k: 'TO DESIGN', t: 'Inside the Pick', go: () => '#/pick/pk-morrow', match: r => r.name === 'pick' && r.params.id === 'pk-morrow' },
        { k: 'STATE', t: 'Game settles', go: () => '#/pick/pk-kelce', match: r => r.name === 'pick' && r.params.id === 'pk-kelce' },
        { k: 'SCREEN', t: 'Results — Piggy’s Picks', go: () => { S.results.lane = 'piggy'; return '#/results?lane=piggy'; }, match: r => r.name === 'results' && S.results.lane === 'piggy' },
        { k: 'SCREEN', t: 'Other lanes', sub: 'Alt Picks · Multis — never merged', go: () => { S.results.lane = 'alt'; return '#/results?lane=alt'; }, match: r => r.name === 'results' && S.results.lane !== 'piggy' }
      ]
    }
  ];

  function snap(v) { S.scenario.snapshot = v; const r = R(); return r.name === 'edge' ? location.hash : '#/edge/arbitrage'; }
  function sims(sport) { S.edge.simSport = sport; S.edge.lane = 'piggy'; S.edge.game = 'all'; return '#/edge/sims'; }
  function access(v) {
    S.scenario.access = v; S.prefs.access = v; BP.savePrefs();
    const r = R();
    return ['picks', 'pick', 'edge'].includes(r.name) ? location.hash : '#/picks';
  }

  BP.actions.flow = function (el) {
    const [fi, si, bi] = el.dataset.arg.split(':').map(Number);
    const step = FLOWS[fi].steps[si];
    const fn = bi >= 0 && step.branches ? step.branches[bi].go : step.go;
    if (!fn) return;
    S.ui.flows = false; S.ui.drawer = false; S.ui.sheet = null;
    const hash = fn();
    const sheet = S.ui.sheet; // a step may ask for a sheet (filters, game picker)
    if (hash && hash !== location.hash) {
      location.hash = hash;
      // hashchange clears sheets; restore the one this step asked for.
      if (sheet) setTimeout(() => { S.ui.sheet = sheet; BP.render(); }, 30);
      return false;
    }
  };
  BP.actions['flows-open'] = function () { S.ui.flows = true; };

  function stepHtml(step, fi, si, r) {
    const cls = { SCREEN: 'screen', 'TO DESIGN': 'design', DECISION: 'decision', STATE: 'state' }[step.k];
    const current = step.match && step.match(r);
    if (step.branches) {
      return `<div class="step ${cls}"><span class="k">${step.k}</span><span class="t">${e(step.t)}</span>
        <div class="branches">${step.branches.map((b, bi) => `<button class="${b.on() ? 'on' : ''}" data-act="flow" data-arg="${fi}:${si}:${bi}">${e(b.label)}</button>`).join('')}</div></div>`;
    }
    return `<button class="step ${cls} ${current ? 'current' : ''}" data-act="flow" data-arg="${fi}:${si}:-1" ${current ? 'aria-current="step"' : ''}><span class="k">${step.k}</span><span class="t">${e(step.t)}</span>${step.sub ? `<span class="dim tiny">${e(step.sub)}</span>` : ''}</button>`;
  }

  function flowsHtml() {
    const r = R();
    return `<div class="flows">${FLOWS.map((f, fi) => `
      <section class="flow" aria-label="${e(f.id)} ${e(f.title)}">
        <div class="fl-title"><b>${f.id}</b>${e(f.title)}</div>
        <p class="fl-note">${e(f.note)}</p>
        ${f.steps.map((s, si) => stepHtml(s, fi, si, r)).join('')}
      </section>`).join('')}</div>`;
  }

  BP.flowsSheet = function () {
    return BP.sheetHeader('Storyboard flows', 'Jump to any step of the four core journeys. Decisions switch the data state.') + flowsHtml();
  };

  BP.renderRail = function () {
    const rail = document.getElementById('rail');
    if (!rail) return;
    const top = rail.scrollTop;
    rail.innerHTML = `<div class="rail-head"><small>BETPIG · UX · STORYBOARD & FLOW</small><h2 class="h2" style="font-size:22px">How a customer moves through BetPig</h2>
      <p class="sub">Click any step to open the live screen. Decision and state nodes switch the data state so every branch can be seen — none are left blank.</p></div>${flowsHtml()}`;
    rail.scrollTop = top;
    const fab = document.getElementById('flows-fab');
    if (fab) fab.hidden = S.ui.flows || S.ui.sheet || S.ui.drawer;
  };
})(window.BP);
