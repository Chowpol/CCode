/* Account (site-side state), Plans, Research. */
(function (BP) {
  const S = BP.S, C = BP.C, e = BP.esc;
  const ACCESS = { free: 'Free', trial: 'Free trial · 7 days left', paid: 'Member' };

  BP.screens.account = function () {
    const fmt = S.prefs.oddsFormat;
    return `${C.title('Account', 'Settings are stored on this device.')}
      <a class="card link" href="#/plans"><div class="row"><span class="eyebrow accent">MEMBERSHIP</span><span class="spacer"></span><span class="linkish">Plans ›</span></div><div class="h3">${e(ACCESS[S.scenario.access])}</div><p class="sub">${S.scenario.access === 'free' ? 'Settled picks and research tools are free. Pending picks need a trial or plan.' : 'Every pending pick, full analysis and Inside the Pick.'}</p></a>
      <div class="list">
        <a href="#/account/bookmakers"><span class="grow"><span class="title">My bookmakers</span><br><span class="dim small">${S.prefs.books.length} selected · filters prices, arbs, middles and +EV</span></span><span class="muted">›</span></a>
        <div><span class="grow"><span class="title">Odds format</span><br><span class="dim small">Example: ${BP.odds(2.08)}</span></span>
          <div class="mini-seg" style="border-color:var(--border)"><button class="${fmt === 'decimal' ? 'on' : ''}" data-act="set-odds-format" data-arg="decimal">Decimal</button><button class="${fmt === 'american' ? 'on' : ''}" data-act="set-odds-format" data-arg="american">American</button></div></div>
        <button data-act="sheet" data-arg="tz"><span class="grow"><span class="title">Timezone</span><br><span class="dim small">${S.prefs.tz === 'auto' ? 'Automatic (IP) · ' : 'Override · '}${e(BP.tzLabel())}</span></span><span class="muted">›</span></button>
      </div>
      <div class="list">
        <a href="#/research/method"><span class="grow title">Methodology & public record</span><span class="muted">›</span></a>
        <a href="#/research"><span class="grow title">Research articles</span><span class="muted">›</span></a>
      </div>
      ${C.footer(['Need a break? Set deposit limits with your bookmaker or visit gamblinghelponline.org.au.'])}`;
  };

  BP.actions['toggle-book'] = function (el) {
    const b = el.dataset.arg, books = S.prefs.books;
    const i = books.indexOf(b);
    if (i !== -1) {
      if (books.length === 1) { BP.toast('Keep at least one bookmaker selected.'); return; }
      books.splice(i, 1);
    } else books.push(b);
    BP.savePrefs();
  };

  BP.screens.bookmakers = function () {
    return `${C.back('#/account', 'Account')}
      ${C.title('My bookmakers', 'Prices, arbitrage, middles and +EV only use the books you select. No featured book and no affiliate links.')}
      <div class="list">${BP.BOOKS.map(b => `<button data-act="toggle-book" data-arg="${e(b)}" role="switch" aria-checked="${BP.inBooks(b)}"><span class="grow title">${e(b)}</span><span class="switch ${BP.inBooks(b) ? 'on' : ''}"></span></button>`).join('')}</div>
      <p class="dim small" style="margin:0">Arbitrage and middles need both books selected.</p>
      ${C.footer([])}`;
  };

  BP.screens.plans = function () {
    const a = S.scenario.access;
    const plan = (id, title, price, items, cta, toast) => `<div class="plan ${a === id ? 'on' : ''}">
      <div class="row"><div class="h3">${title}</div><span class="spacer"></span><b>${price}</b></div>
      <ul>${items.map(i => `<li>${e(i)}</li>`).join('')}</ul>
      ${a === id ? '<span class="tag lime" style="align-self:flex-start">CURRENT</span>' : `<button class="btn ${id === 'free' ? 'secondary' : 'primary'}" data-act="set-access" data-arg="${id}" data-toast="${e(toast)}">${cta}</button>`}
    </div>`;
    return `${C.back('#/account', 'Account')}
      ${C.title('Membership', 'What membership includes. No guaranteed-profit claims — ever.')}
      ${plan('free', 'Free', '$0', ['Settled picks and full public record', 'Shot Lab and Alt Line Explorer', 'Edge Room: Odds board'], 'Switch to free', 'Switched to the free plan.')}
      ${plan('trial', 'Free trial', '7 days', ['Every pending Piggy’s Pick before the start', 'Pick of the Day with full analysis', 'Inside the Pick evidence'], 'Start free trial', 'Free trial started — pending picks unlocked.')}
      ${plan('paid', 'Member', '$19 / month', ['Everything in the trial', 'Alt Picks, Degen Zone and Multis lanes', 'Cancel any time'], 'Become a member', 'Membership active.')}
      <div class="card tight"><b>Members are capped while we grow</b><p class="sub" style="margin:0">If the plan is full you’ll join the waitlist and we’ll email you when a spot opens.</p><button class="btn secondary" data-act="toast" data-arg="You’re on the waitlist. We’ll email you when a spot opens.">Join waitlist</button></div>
      ${C.footer(['18+ only. Membership is for research, not financial advice.'])}`;
  };

  BP.screens.research = function () {
    return `${C.title('Research', 'The reading section.')}
      <div class="stack">${BP.ARTICLES.map(a => `<a class="card link" href="#/research/${a.id}"><span class="eyebrow ${a.tag === 'Article' ? 'accent' : ''}" style="${a.tag !== 'Article' ? 'color:var(--info)' : ''}">${e(a.tag.toUpperCase())}</span><div class="h3">${e(a.title)}</div><span class="dim small">${a.mins} min read</span></a>`).join('')}</div>
      ${C.footer([])}`;
  };
  BP.screens.article = function (r) {
    const a = BP.ARTICLES.find(x => x.id === r.params.id);
    if (!a) return C.back('#/research', 'Research') + C.empty('Article not found', 'Try the Research list.');
    const cta = { 'shot-chart': ['#/tools/shot-lab', 'Open Shot Lab'], arb: ['#/edge/arbitrage', 'Open Arbitrage'], middles: ['#/edge/middles', 'Open Middles'], ev: ['#/edge/ev', 'Open +EV board'], method: ['#/results', 'See the public record'] }[a.id];
    return `${C.back('#/research', 'Research')}
      <div class="title-block"><span class="eyebrow accent">${e(a.tag.toUpperCase())} · ${a.mins} MIN</span><h1 class="h1">${e(a.title)}</h1></div>
      <div class="article">${a.body.map(p => `<p>${e(p)}</p>`).join('')}</div>
      ${cta ? `<a class="btn primary" href="${cta[0]}">${cta[1]} ›</a>` : ''}
      ${C.footer([])}`;
  };
})(window.BP);
