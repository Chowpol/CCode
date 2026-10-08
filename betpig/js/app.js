/* App shell: router, chrome (header, drawer, tab bar), sheets and event delegation. */
(function (BP) {
  const S = BP.S;
  const e = BP.esc;
  BP.screens = BP.screens || {};
  BP.sheets = BP.sheets || {};
  BP.actions = BP.actions || {};
  BP.inputs = BP.inputs || {};

  /* ---------------- Router ---------------- */
  BP.route = function () {
    const raw = (location.hash || '#/').slice(1);
    const [path, qs] = raw.split('?');
    const seg = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach(kv => {
      const [k, v] = kv.split('=');
      query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    let name = 'home', params = {};
    if (seg[0] === 'tools') name = seg[1] === 'shot-lab' ? 'shotLab' : seg[1] === 'alt-line' ? 'altLine' : 'tools';
    else if (seg[0] === 'edge') { name = 'edge'; params.tab = seg[1] || 'sims'; }
    else if (seg[0] === 'picks') name = 'picks';
    else if (seg[0] === 'results') name = 'results';
    else if (seg[0] === 'pick') { name = 'pick'; params.id = seg[1]; }
    else if (seg[0] === 'research') { name = seg[1] ? 'article' : 'research'; params.id = seg[1]; }
    else if (seg[0] === 'account') name = seg[1] === 'bookmakers' ? 'bookmakers' : 'account';
    else if (seg[0] === 'plans') name = 'plans';
    return { name, params, query, path };
  };

  BP.go = function (hash) {
    if (location.hash === hash) BP.render();
    else location.hash = hash;
  };

  function tabFor(name) {
    if (['picks', 'results', 'pick'].includes(name)) return 'picks';
    if (name === 'edge') return 'edge';
    if (['tools', 'shotLab', 'altLine'].includes(name)) return 'tools';
    if (['account', 'bookmakers', 'plans'].includes(name)) return 'account';
    return '';
  }

  /* ---------------- Chrome ---------------- */
  function header() {
    const r = BP.record(BP.PICKS.filter(p => p.lane === 'piggy'));
    return `<header class="topbar">
      <div class="brand">
        <button class="icon-btn" aria-label="Open menu" data-act="drawer">☰</button>
        <a href="#/" class="brand" style="gap:8px" aria-label="BetPig home">${BP.icon.logo}<span class="wordmark" aria-label="BetPig">BET<span class="pig">PIG</span></span></a>
      </div>
      <div class="actions">
        <a class="results-pill" href="#/results" aria-label="Piggy's Picks results: ${r.w} won, ${r.l} lost">RESULTS <span class="score">${r.w}</span> – ${r.l} ›</a>
      </div>
    </header>`;
  }

  function tabbar(active) {
    const t = (id, href, label, icon) => `<a href="${href}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon}${label}</a>`;
    return `<div class="bottom">
      <div class="legal">GAMBLE RESPONSIBLY. 18+</div>
      <nav class="tabbar" aria-label="Primary">
        ${t('picks', '#/picks', 'PICKS', BP.icon.picks)}
        ${t('edge', '#/edge/sims', 'EDGE ROOM', BP.icon.edge)}
        ${t('tools', '#/tools', 'TOOLS', BP.icon.tools)}
        ${t('account', '#/account', 'ACCOUNT', BP.icon.account)}
      </nav>
    </div>`;
  }

  function drawer() {
    const g = (title, sub, links, blue) => `<div class="sitemap-group ${blue ? 'blue' : ''}"><h4>${title}</h4><p>${sub}</p>${links.map(l =>
      l.soon ? `<button class="soon" data-act="toast" data-arg="${e(l.soon)}">${e(l.label)}</button>` : `<a href="${l.href}" data-act="close-ui">${e(l.label)}</a>`).join('')}</div>`;
    return `<div class="scrim drawer-scrim" data-act="close-ui" data-self="1">
      <nav class="drawer" aria-label="Site map">
        <div class="row"><span class="brand">${BP.icon.logo}<span class="wordmark" aria-label="BetPig">BET<span class="pig">PIG</span></span></span><span class="spacer"></span><button class="icon-btn" aria-label="Close menu" data-act="close-ui">${BP.icon.close}</button></div>
        ${g('TOOLS', 'Interactive research', [
          { label: 'Shot Lab / Shot Explorer', href: '#/tools/shot-lab' },
          { label: 'Alt Line Explorer', href: '#/tools/alt-line' },
          { label: 'Inside the Pick (desktop)', href: '#/pick/pk-morrow' },
          { label: 'Scoring Blueprint (desktop)', soon: 'Scoring Blueprint is a desktop tool and is still being designed.' }
        ])}
        ${g('EDGE ROOM', 'Tool tabs: Sims · Arbitrage · +EV · Middles · Odds', [
          { label: 'Simulator (per sport; Pick of the Day)', href: '#/edge/sims' },
          { label: 'Arbitrage + calculator', href: '#/edge/arbitrage' },
          { label: '+EV board', href: '#/edge/ev' },
          { label: 'Middles (≥3-pt band)', href: '#/edge/middles' },
          { label: 'Odds (plain-text books)', href: '#/edge/odds' },
          { label: 'My bookmakers', href: '#/account/bookmakers' }
        ])}
        ${g('PICKS', 'Lane records stay separate', [
          { label: "Piggy's Picks", href: '#/picks' },
          { label: "Results — Piggy's Picks (headline)", href: '#/results' },
          { label: 'Results — Alt Picks', href: '#/results?lane=alt' },
          { label: 'Results — Multis (slips)', href: '#/results?lane=multis' }
        ])}
        ${g('RESEARCH', 'The reading section', [
          { label: 'Articles', href: '#/research' },
          { label: 'Edge Room explainers', href: '#/research/arb' },
          { label: 'Methodology & public record notes', href: '#/research/method' }
        ], true)}
        ${g('ACCOUNT', 'Site-side state', [
          { label: 'Membership / waitlist', href: '#/plans' },
          { label: 'My bookmakers selection', href: '#/account/bookmakers' },
          { label: 'Odds format & timezone', href: '#/account' }
        ], true)}
      </nav>
    </div>`;
  }

  function sheetWrap(inner, label) {
    return `<div class="scrim" data-act="close-ui" data-self="1"><div class="sheet" role="dialog" aria-modal="true" aria-label="${e(label || 'Sheet')}"><div class="grabber"></div>${inner}</div></div>`;
  }
  BP.sheetHeader = function (title, sub) {
    return `<div class="row top"><div class="title-block" style="flex:1"><h2 class="h1" style="font-size:22px">${e(title)}</h2>${sub ? `<p class="sub">${e(sub)}</p>` : ''}</div><button class="icon-btn" aria-label="Close" data-act="close-ui" style="border:1px solid var(--border-strong);background:transparent">${BP.icon.close}</button></div>`;
  };

  // Timezone sheet (global header override).
  BP.sheets.tz = function () {
    const cur = S.prefs.tz;
    const ipLabel = BP.TIMEZONES.find(z => z.id === BP.IP_DEFAULT_TZ).label;
    const row = (id, label, sub) => `<button data-act="set-tz" data-arg="${id}"><span class="radio ${cur === id ? 'on' : ''}"></span><span class="grow"><span class="title" style="font-weight:600">${e(label)}</span>${sub ? `<br><span class="dim small">${e(sub)}</span>` : ''}</span></button>`;
    return BP.sheetHeader('Timezone', 'All kick-off, capture and settlement times follow this setting.') +
      `<div class="list">${row('auto', `Automatic · ${ipLabel}`, 'From your IP location')}${BP.TIMEZONES.map(z => row(z.id, z.label)).join('')}</div>`;
  };

  /* ---------------- Render ---------------- */
  let lastRouteKey = '';
  BP.render = function () {
    const r = BP.route();
    BP.current = r;
    const screen = BP.screens[r.name] || BP.screens.home;
    const routeKey = r.name + JSON.stringify(r.params) + JSON.stringify(r.query);
    const routeChanged = routeKey !== lastRouteKey;
    if (routeChanged && BP.onLeave) { BP.onLeave(); BP.onLeave = null; }
    if (routeChanged && screen.enter) screen.enter(r);
    lastRouteKey = routeKey;

    const app = document.getElementById('app');
    const scrollY = window.scrollY;
    const body = screen(r);
    app.innerHTML = header() + `<main class="screen" id="main">${body}</main>` + tabbar(tabFor(r.name));

    const overlay = document.getElementById('overlay');
    let ov = '';
    if (S.ui.drawer) ov = drawer();
    else if (S.ui.sheet && BP.sheets[S.ui.sheet]) ov = sheetWrap(BP.sheets[S.ui.sheet](r), S.ui.sheet);
    else if (S.ui.flows && BP.flowsSheet) ov = sheetWrap(BP.flowsSheet(), 'Storyboard flows');
    overlay.innerHTML = ov + (S.ui.toast ? `<div class="toast" role="status">${e(S.ui.toast)}</div>` : '');
    document.body.style.overflow = ov ? 'hidden' : '';

    if (BP.renderRail) BP.renderRail(r);
    if (screen.after) screen.after(r);
    if (routeChanged) window.scrollTo(0, 0); else window.scrollTo(0, scrollY);
  };

  let toastTimer;
  BP.toast = function (msg) {
    S.ui.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { S.ui.toast = null; BP.render(); }, 2600);
  };

  /* ---------------- Global actions ---------------- */
  Object.assign(BP.actions, {
    'drawer': () => { S.ui.drawer = true; },
    'sheet': (el) => { S.ui.sheet = el.dataset.arg; S.ui.flows = false; },
    'close-ui': (el, ev) => {
      if (el.dataset.self && ev.target !== el) return false;
      S.ui.drawer = false; S.ui.sheet = null; S.ui.flows = false;
    },
    'toast': (el) => { BP.toast(el.dataset.arg); },
    'set-tz': (el) => { S.prefs.tz = el.dataset.arg; BP.savePrefs(); S.ui.sheet = null; },
    'set-odds-format': (el) => { S.prefs.oddsFormat = el.dataset.arg; BP.savePrefs(); },
    'set-access': (el) => {
      S.scenario.access = el.dataset.arg; S.prefs.access = el.dataset.arg; BP.savePrefs();
      if (el.dataset.toast) BP.toast(el.dataset.toast);
    },
    'toggle-open': (el) => {
      const id = el.dataset.arg;
      S.ui.open = S.ui.open || {};
      S.ui.open[id] = !S.ui.open[id];
    },
    'go': (el) => { S.ui.sheet = null; S.ui.drawer = false; S.ui.flows = false; BP.go(el.dataset.arg); return false; },
    'sport': (el) => { S.sport = el.dataset.arg; }
  });
  BP.isOpen = function (id) { return !!(S.ui.open && S.ui.open[id]); };

  document.addEventListener('click', function (ev) {
    const el = ev.target.closest('[data-act]');
    if (!el) {
      // Plain links inside the drawer close it via data-act; nothing else to do.
      return;
    }
    const fn = BP.actions[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'BUTTON' || el.tagName === 'TR' || el.dataset.prevent) ev.preventDefault();
    const res = fn(el, ev);
    if (el.tagName === 'A' && el.getAttribute('href')) {
      // Let the link navigate; hashchange will render.
      if (res !== false && location.hash === el.getAttribute('href')) BP.render();
      return;
    }
    if (res !== false) BP.render();
  });

  document.addEventListener('input', function (ev) {
    const el = ev.target.closest('[data-input]');
    if (!el) return;
    const fn = BP.inputs[el.dataset.input];
    if (fn) fn(el, ev);
  });
  document.addEventListener('change', function (ev) {
    const el = ev.target.closest('[data-change]');
    if (!el) return;
    const fn = BP.actions[el.dataset.change];
    if (fn && fn(el, ev) !== false) BP.render();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && (S.ui.drawer || S.ui.sheet || S.ui.flows)) {
      S.ui.drawer = false; S.ui.sheet = null; S.ui.flows = false; BP.render();
    }
  });

  window.addEventListener('hashchange', function () {
    S.ui.drawer = false; S.ui.sheet = null; S.ui.flows = false;
    BP.render();
  });
  document.addEventListener('DOMContentLoaded', BP.render);
})(window.BP);
