/* Core: state, persistence, formatting, maths helpers, icons. */
(function (BP) {
  /* ---------------- Persistence (per-viewer prefs only) ---------------- */
  const PREFS_KEY = 'betpig.prefs.v1';
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  BP.savePrefs = function () {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(BP.S.prefs)); } catch (e) { /* storage unavailable */ }
  };

  const saved = loadPrefs() || {};

  /* ---------------- State ---------------- */
  BP.S = {
    sport: 'all',
    scenario: {
      slate: true,          // Alt Line: distribution file for this slate?
      upcoming: true,       // Shot Lab: upcoming simulated game?
      snapshot: 'ontime',   // ontime | delayed | unavailable | loading
      boardEmpty: false,    // Edge Room: no opportunities on board
      access: saved.access || 'free' // free | trial | paid
    },
    prefs: {
      books: Array.isArray(saved.books) && saved.books.length ? saved.books : BP.DEFAULT_BOOKS.slice(),
      oddsFormat: saved.oddsFormat || 'decimal',
      tz: saved.tz || 'auto'
    },
    shot: {
      player: null, season: null, window: 'last10', mode: 'shots', type: 'all',
      filters: { location: 'all', period: 'all', outcome: 'all', shotType: 'all', distance: 'all' },
      replay: { on: false, i: 0, playing: false, arcs: false },
      query: ''
    },
    alt: { player: 'hale', market: 'threes', side: 'over', line: 2.5, view: 'explore', rec: '10', inputsOpen: false, query: '' },
    edge: { game: 'all', sort: {}, calc: {}, open: {}, sheetQuery: '', sheetSport: 'all', simSport: 'WNBA', lane: 'piggy' },
    picks: { lane: 'piggy', sport: 'all', date: 'all', open: {} },
    results: { lane: 'piggy', period: '7', sport: 'all' },
    pick: { season: '2025-26' },
    ui: { sheet: null, drawer: false, flows: false, toast: null }
  };
  BP.S.prefs.access = BP.S.scenario.access;

  /* ---------------- Formatting ---------------- */
  BP.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  BP.tz = function () { return BP.S.prefs.tz === 'auto' ? BP.IP_DEFAULT_TZ : BP.S.prefs.tz; };
  BP.tzLabel = function () {
    const t = BP.TIMEZONES.find(z => z.id === BP.tz());
    return t ? t.label : BP.tz();
  };
  BP.tzAbbr = function () { return BP.tzLabel().split('·')[1].trim(); };

  function parts(ts, opts) {
    const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    const out = {};
    new Intl.DateTimeFormat('en-AU', Object.assign({ timeZone: BP.tz() }, opts))
      .formatToParts(d).forEach(p => { out[p.type] = p.value; });
    return out;
  }
  // "8:00am"
  BP.time = function (ts) {
    const p = parts(ts, { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${p.hour}:${p.minute}${(p.dayPeriod || '').toLowerCase().replace(/\s|\./g, '')}`;
  };
  // "Thu 1 Oct"
  BP.day = function (ts) {
    const p = parts(ts, { weekday: 'short', day: 'numeric', month: 'short' });
    return `${p.weekday} ${p.day} ${p.month.replace("Sept", "Sep")}`;
  };
  BP.dayKey = function (ts) {
    const p = parts(ts, { year: 'numeric', month: '2-digit', day: '2-digit' });
    return `${p.year}-${p.month}-${p.day}`;
  };
  // "Thu 1 Oct, 10:15am"
  BP.when = function (ts) { return `${BP.day(ts)}, ${BP.time(ts)}`; };
  BP.ago = function (ts) {
    const mins = Math.round((BP.NOW - ts) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h}h ${m}m ago` : `${h}h ago`;
  };

  BP.odds = function (dec) {
    if (dec == null) return '—';
    if (BP.S.prefs.oddsFormat === 'american') {
      return dec >= 2 ? `+${Math.round((dec - 1) * 100)}` : `−${Math.round(100 / (dec - 1))}`;
    }
    return `$${dec.toFixed(2)}`;
  };
  BP.money = function (n) { return `$${(Math.round(n * 100) / 100).toFixed(2)}`; };
  BP.pct = function (n, dp) { return `${(n * 100).toFixed(dp == null ? 1 : dp)}%`; };
  BP.signedPct = function (n, dp) { const v = (n * 100).toFixed(dp == null ? 1 : dp); return `${n >= 0 ? '+' : '−'}${Math.abs(v)}%`; };
  BP.units = function (u) { return `${u >= 0 ? '+' : '−'}${Math.abs(u).toFixed(2)}u`; };

  /* ---------------- Maths ---------------- */
  BP.hash = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  BP.rng = function (seed) {
    let a = typeof seed === 'string' ? BP.hash(seed) : seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  function erf(x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  BP.normCdf = function (x, mu, sd) { return 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2))); };

  /* ---------------- Misc ---------------- */
  BP.game = function (id) { return BP.GAMES.find(g => g.id === id); };
  BP.player = function (id) { return BP.PLAYERS.find(p => p.id === id); };
  BP.inBooks = function (b) { return BP.S.prefs.books.indexOf(b) !== -1; };

  BP.unitsFor = function (p) {
    if (p.status === 'won') return p.units * (p.price - 1);
    if (p.status === 'lost') return -p.units;
    return 0;
  };
  BP.record = function (list) {
    const r = { w: 0, l: 0, p: 0, u: 0 };
    list.forEach(x => {
      if (x.status === 'won') r.w++; else if (x.status === 'lost') r.l++; else r.p++;
      r.u += BP.unitsFor(x);
    });
    return r;
  };

  /* ---------------- Icons ---------------- */
  BP.icon = {
    logo: '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 6l4 4M25 6l-4 4" stroke="#c6ff4a" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="17" r="11" fill="none" stroke="#c6ff4a" stroke-width="2.4"/><rect x="10.5" y="17" width="11" height="7" rx="3.5" fill="#c6ff4a"/><circle cx="14" cy="20.5" r="1.1" fill="#0d1117"/><circle cx="18" cy="20.5" r="1.1" fill="#0d1117"/><circle cx="12" cy="13.5" r="1.4" fill="#c6ff4a"/><circle cx="20" cy="13.5" r="1.4" fill="#c6ff4a"/></svg>',
    picks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="4"/><path d="M8 2.5v4M16 2.5v4M7 12h10" stroke-linecap="round"/></svg>',
    edge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="10" y="5" width="4" height="16" rx="2"/><rect x="17" y="9" width="4" height="12" rx="2"/></svg>',
    account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" stroke-linecap="round"/></svg>',
    filter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    replay: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
  };
})(window.BP);
