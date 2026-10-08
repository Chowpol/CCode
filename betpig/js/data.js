/* BetPig prototype data. All players and figures are fictional sample data. */
window.BP = window.BP || {};

(function (BP) {
  // Fixed "now" so every timestamp in the prototype is consistent:
  // Thu 1 Oct 2026, 8:10am AEST.
  BP.NOW = Date.parse('2026-09-30T22:10:00Z');
  BP.CAPTURED_AT = Date.parse('2026-09-30T22:00:00Z'); // 8:00am AEST
  BP.NEXT_CAPTURE = Date.parse('2026-09-30T22:30:00Z'); // ~8:30am AEST
  BP.MODEL_ASSESSED = Date.parse('2026-09-30T21:55:00Z'); // 7:55am AEST

  BP.BOOKS = ['Sportsbet', 'TAB', 'Ladbrokes', 'Neds', 'Pointsbet', 'Bet365', 'Unibet', 'Betr'];
  BP.DEFAULT_BOOKS = ['Sportsbet', 'TAB', 'Ladbrokes', 'Neds'];

  BP.TIMEZONES = [
    { id: 'Australia/Sydney', label: 'Sydney · AEST' },
    { id: 'Australia/Melbourne', label: 'Melbourne · AEST' },
    { id: 'Australia/Brisbane', label: 'Brisbane · AEST' },
    { id: 'Australia/Perth', label: 'Perth · AWST' },
    { id: 'Pacific/Auckland', label: 'Auckland · NZST' },
    { id: 'America/New_York', label: 'New York · ET' },
    { id: 'America/Los_Angeles', label: 'Los Angeles · PT' }
  ];
  BP.IP_DEFAULT_TZ = 'Australia/Sydney';

  BP.SPORTS = ['NFL', 'NBA', 'WNBA', 'NBL', 'MLB'];

  /* ---------------- Shot Lab / Alt Line players ---------------- */
  // Shot profile params drive a deterministic shot generator.
  BP.PLAYERS = [
    {
      id: 'hale', name: 'Marcus Hale', team: 'Phoenix', league: 'NBA', pos: 'G',
      has2627: false, mappedGap: 0,
      profile: { three: 0.46, rim: 0.24, mid: 0.30, fg3: 0.38, fgRim: 0.64, fgMid: 0.44, fga: 18 },
      outlook: { opp: 'vs Denver', tip: '2026-10-22T02:00:00Z', minutes: [31, 37], fga: [15, 21], tpa: [6, 9], minutesMid: 34, fgaMid: 18.0, tpaMid: 7.0 },
      markets: { points: 24.1, threes: 2.7, rebounds: 4.2, assists: 5.6, pra: 33.9 }
    },
    {
      id: 'brandt', name: 'Theo Brandt', team: 'Denver', league: 'NBA', pos: 'C',
      has2627: true, mappedGap: 0,
      profile: { three: 0.12, rim: 0.58, mid: 0.30, fg3: 0.33, fgRim: 0.71, fgMid: 0.48, fga: 15 },
      outlook: { opp: '@ Phoenix', tip: '2026-10-22T02:00:00Z', minutes: [30, 36], fga: [12, 18], tpa: [0, 3], minutesMid: 33, fgaMid: 15.2, tpaMid: 1.4 },
      markets: { points: 22.3, threes: 0.9, rebounds: 11.8, assists: 6.4, pra: 40.5 }
    },
    {
      id: 'cole', name: 'Isaiah Cole', team: 'Boston', league: 'NBA', pos: 'F',
      has2627: false, mappedGap: 2,
      profile: { three: 0.38, rim: 0.32, mid: 0.30, fg3: 0.36, fgRim: 0.62, fgMid: 0.41, fga: 17 },
      outlook: { opp: 'vs New York', tip: '2026-10-21T23:30:00Z', minutes: [32, 38], fga: [14, 20], tpa: [5, 8], minutesMid: 35, fgaMid: 17.1, tpaMid: 6.3 },
      markets: { points: 21.7, threes: 2.3, rebounds: 7.9, assists: 3.8, pra: 33.4 }
    },
    {
      id: 'morrow', name: 'Kia Morrow', team: 'Atlanta', league: 'WNBA', pos: 'G',
      has2627: false, mappedGap: 0,
      profile: { three: 0.41, rim: 0.27, mid: 0.32, fg3: 0.37, fgRim: 0.60, fgMid: 0.42, fga: 14 },
      outlook: null,
      markets: { points: 17.4, threes: 2.1, rebounds: 4.8, assists: 4.1, pra: 26.3 }
    },
    {
      id: 'okafor', name: 'Dev Okafor', team: 'Sacramento', league: 'NBA', pos: 'G',
      has2627: false, mappedGap: 0,
      profile: { three: 0.52, rim: 0.20, mid: 0.28, fg3: 0.40, fgRim: 0.58, fgMid: 0.43, fga: 16 },
      outlook: { opp: '@ Utah', tip: '2026-10-23T02:00:00Z', minutes: [28, 34], fga: [13, 18], tpa: [7, 10], minutesMid: 31, fgaMid: 15.4, tpaMid: 8.2 },
      markets: { points: 19.8, threes: 3.4, rebounds: 3.1, assists: 4.4, pra: 27.3 }
    }
  ];
  BP.RECENT_PLAYERS = ['hale', 'cole'];
  BP.POPULAR_PLAYERS = ['brandt', 'okafor', 'morrow'];

  BP.MARKETS = [
    { id: 'points', label: 'Points', sd: 0.26 },
    { id: 'threes', label: 'Threes made', sd: 0.55 },
    { id: 'rebounds', label: 'Rebounds', sd: 0.32 },
    { id: 'assists', label: 'Assists', sd: 0.38 },
    { id: 'pra', label: 'PTS+REB+AST', sd: 0.2 }
  ];

  // A published Piggy's Pick that the Alt Line explorer shows read-only.
  BP.PUBLISHED_ALT = { player: 'hale', market: 'threes', side: 'over', line: 2.5, price: 1.80, book: 'Sportsbet', publishedAt: Date.parse('2026-09-30T21:52:00Z') };

  /* ---------------- Edge Room ---------------- */
  BP.GAMES = [
    { id: 'kc-buf', sport: 'NFL', away: 'Kansas City Chiefs', home: 'Buffalo Bills', short: 'Chiefs @ Bills', start: '2026-10-01T00:15:00Z', plays: 2, topEdge: 7.7 },
    { id: 'sf-sea', sport: 'NFL', away: 'San Francisco 49ers', home: 'Seattle Seahawks', short: '49ers @ Seahawks', start: '2026-10-01T00:15:00Z', plays: 1, topEdge: 7.5 },
    { id: 'was-ind', sport: 'NFL', away: 'Washington Commanders', home: 'Indianapolis Colts', short: 'Commanders @ Colts', start: '2026-10-03T18:05:00Z', plays: 1, topEdge: 3.1 },
    { id: 'nyl-lva', sport: 'WNBA', away: 'New York Liberty', home: 'Las Vegas Aces', short: 'Liberty @ Aces', start: '2026-10-01T02:00:00Z', plays: 3, topEdge: 9.5 },
    { id: 'atl-con', sport: 'WNBA', away: 'Atlanta Dream', home: 'Connecticut Sun', short: 'Dream @ Sun', start: '2026-10-01T00:15:00Z', plays: 2, topEdge: 6.2 },
    { id: 'tor-bal', sport: 'MLB', away: 'Toronto Blue Jays', home: 'Baltimore Orioles', short: 'Blue Jays @ Orioles', start: '2026-09-30T20:36:00Z', plays: 1, topEdge: 7.7 },
    { id: 'min-sf', sport: 'MLB', away: 'Minnesota Twins', home: 'San Francisco Giants', short: 'Twins @ SF Giants', start: '2026-09-30T23:46:00Z', plays: 1, topEdge: 12.7 }
  ];

  BP.ARBS = [
    { id: 'arb1', game: 'kc-buf', market: 'Total points 47.5 · includes overtime', a: { label: 'OVER 47.5', price: 2.08, book: 'Sportsbet' }, b: { label: 'UNDER 47.5', price: 2.02, book: 'TAB' } },
    { id: 'arb2', game: 'nyl-lva', market: 'Head to head · includes overtime', a: { label: 'LIBERTY', price: 2.04, book: 'TAB', changed: { at: Date.parse('2026-09-30T22:12:00Z'), was: 2.06 } }, b: { label: 'ACES', price: 2.02, book: 'Sportsbet' } },
    { id: 'arb3', game: 'min-sf', market: 'Head to head · 9 innings + extras', a: { label: 'TWINS', price: 2.10, book: 'Ladbrokes' }, b: { label: 'GIANTS', price: 1.95, book: 'Neds' } },
    { id: 'arb4', game: 'tor-bal', market: 'Total runs 8.5 · includes extra innings', a: { label: 'OVER 8.5', price: 2.00, book: 'Bet365' }, b: { label: 'UNDER 8.5', price: 2.05, book: 'Pointsbet' } }
  ];

  BP.MIDDLES = [
    {
      id: 'mid1', game: 'was-ind', market: 'Total points · includes overtime',
      over: { line: 44.5, price: 1.91, book: 'Sportsbet' }, under: { line: 47.5, price: 1.91, book: 'TAB' },
      sample: 1284, mean: 45.2, sd: 10.5
    },
    {
      id: 'mid2', game: 'nyl-lva', market: 'Total points · includes overtime',
      over: { line: 163.5, price: 1.87, book: 'Neds' }, under: { line: 167.5, price: 1.95, book: 'Ladbrokes' },
      sample: 642, mean: 165.0, sd: 13.5
    }
  ];

  BP.EVS = [
    { id: 'ev1', game: 'sf-sea', sport: 'NFL', player: 'Owen Mercer', selection: 'Over 49.5 receiving yards', chance: 0.524, price: 2.05, book: 'Sportsbet', hist: { over: 6, n: 10 } },
    { id: 'ev2', game: 'nyl-lva', sport: 'WNBA', player: 'Rae Lindqvist', selection: 'Over 7.5 rebounds', chance: 0.571, price: 1.92, book: 'TAB', hist: { over: 9, n: 14 } },
    { id: 'ev3', game: 'min-sf', sport: 'MLB', player: 'Tomás Reyes', selection: 'Over 1.5 total bases', chance: 0.468, price: 2.40, book: 'Ladbrokes', hist: { over: 11, n: 20 } },
    { id: 'ev4', game: 'kc-buf', sport: 'NFL', player: 'Jalen Pryce', selection: 'Over 64.5 rushing yards', chance: 0.55, price: 1.95, book: 'Bet365', hist: { over: 5, n: 10 } }
  ];

  // Odds board: plain-text prices per book; null = no quote.
  BP.ODDS = [
    { game: 'kc-buf', market: 'Head to head', sides: ['Chiefs', 'Bills'], prices: { Sportsbet: [1.95, 1.87], TAB: [1.92, 1.90], Ladbrokes: [1.96, 1.85], Neds: [1.96, 1.85], Bet365: [1.94, 1.88] } },
    { game: 'kc-buf', market: 'Total 47.5', sides: ['Over', 'Under'], prices: { Sportsbet: [2.08, 1.77], TAB: [1.80, 2.02], Ladbrokes: [1.90, 1.90], Neds: [1.90, 1.90], Bet365: [1.91, 1.91] } },
    { game: 'nyl-lva', market: 'Head to head', sides: ['Liberty', 'Aces'], prices: { Sportsbet: [1.98, 2.02], TAB: [2.04, 1.80], Ladbrokes: [1.95, 1.87], Neds: null, Bet365: [1.97, 1.85] } },
    { game: 'min-sf', market: 'Head to head', sides: ['Twins', 'Giants'], prices: { Sportsbet: [2.02, 1.82], TAB: [2.00, 1.83], Ladbrokes: [2.10, 1.76], Neds: [1.98, 1.95], Bet365: [2.05, 1.80] } },
    { game: 'was-ind', market: 'Line −2.5', sides: ['Commanders', 'Colts'], prices: { Sportsbet: [1.91, 1.91], TAB: [1.88, 1.93], Ladbrokes: [1.90, 1.90], Neds: [1.90, 1.90], Bet365: null } }
  ];

  /* ---------------- Picks ---------------- */
  // status: pending | won | lost
  BP.PICKS = [
    {
      id: 'pk-morrow', lane: 'piggy', sport: 'WNBA', potd: true, player: 'Kia Morrow', matchup: 'Atlanta Dream @ Connecticut Sun', game: 'atl-con',
      start: '2026-10-01T00:15:00Z', selection: 'Over 5.5 points', market: 'Points', price: 2.0, book: 'Sportsbet', units: 1,
      publishedAt: Date.parse('2026-09-30T22:00:00Z'), status: 'pending', lockAt: '2026-10-01T00:00:00Z',
      analysis: { simAvg: 7.4, chance: 0.58, lastN: '9 / 14', lastLabel: 'Last 14 games', note: 'Minutes and recent role inform the scoring distribution. Changes to the rotation can materially affect this estimate.' },
      evidence: { minutes: [18, 22, 15, 24, 21, 19, 26, 23, 20, 22], shots: [5, 7, 4, 8, 6, 6, 9, 7, 6, 7], matchup: 'Connecticut allow the 4th-most bench points per game.' }
    },
    {
      id: 'pk-lindqvist', lane: 'piggy', sport: 'WNBA', player: 'Rae Lindqvist', matchup: 'Atlanta Dream @ Connecticut Sun', game: 'atl-con',
      start: '2026-10-01T00:15:00Z', selection: 'Over 5.5 rebounds + assists', market: 'Rebounds + assists', price: 1.82, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-30T22:00:00Z'), status: 'pending',
      analysis: { simAvg: 6.6, chance: 0.6, lastN: '8 / 12', lastLabel: 'Last 12 games', note: 'Rebound share has held steady across the last month of starts.' },
      evidence: { minutes: [29, 31, 30, 27, 33, 32, 30, 28, 31, 30], shots: [9, 11, 8, 10, 12, 9, 10, 11, 9, 10], matchup: 'Opponent rank 11th in defensive rebound rate.' }
    },
    {
      id: 'pk-robinson', lane: 'piggy', sport: 'NFL', player: 'Bijan Ross', matchup: 'Falcons @ Panthers', game: null,
      start: '2026-10-04T17:00:00Z', selection: 'Over 71.5 rushing yards', market: 'Rush yards', price: 1.87, book: 'Sportsbet', units: 1.5, confident: true,
      publishedAt: Date.parse('2026-09-30T06:52:00Z'), status: 'pending',
      analysis: { simAvg: 82.3, chance: 0.61, lastN: '7 / 10', lastLabel: 'Last 10 games', note: 'Projected carry share stays above 60% with the backup listed out.' },
      evidence: { minutes: [58, 61, 55, 64, 60, 62, 59, 57, 63, 60], shots: [18, 21, 16, 22, 19, 20, 17, 19, 21, 20], matchup: 'Carolina rank 27th in rush EPA allowed.' }
    },
    {
      id: 'pk-titans', lane: 'piggy', sport: 'NFL', player: 'Cal Whitford', matchup: 'Titans @ Giants', game: null,
      start: '2026-10-04T17:00:00Z', selection: 'Over 4.5 receptions', market: 'Receptions', price: 1.95, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-30T06:52:00Z'), status: 'pending',
      analysis: { simAvg: 5.3, chance: 0.56, lastN: '6 / 10', lastLabel: 'Last 10 games', note: 'Target share rose after the WR2 injury.' },
      evidence: { minutes: [52, 55, 50, 57, 54, 53, 56, 55, 51, 54], shots: [7, 8, 6, 9, 7, 8, 9, 7, 8, 8], matchup: 'Giants allow the 6th-most receptions to slot receivers.' }
    },
    {
      id: 'pk-kelce', lane: 'piggy', sport: 'NFL', player: 'Drew Kessler', matchup: 'Chiefs @ Bills', start: '2026-09-21T20:25:00Z',
      selection: 'Over 54.5 receiving yards', market: 'Receiving yards', price: 1.87, book: 'Sportsbet', units: 1.5,
      publishedAt: Date.parse('2026-09-21T08:00:00Z'), status: 'won', settledAt: Date.parse('2026-09-22T00:04:00Z'), result: '71 yards'
    },
    {
      id: 'pk-goff', lane: 'piggy', sport: 'NFL', player: 'Jared Hollis', matchup: 'Lions @ Ravens', start: '2026-09-23T00:15:00Z',
      selection: 'Over 1.5 pass TDs', market: 'Pass TDs', price: 1.72, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-22T08:00:00Z'), status: 'lost', settledAt: Date.parse('2026-09-23T03:41:00Z'), result: '1 TD'
    },
    {
      id: 'pk-w1', lane: 'piggy', sport: 'WNBA', player: 'Rae Lindqvist', matchup: 'Liberty @ Aces', start: '2026-09-28T02:00:00Z',
      selection: 'Over 7.5 rebounds', market: 'Rebounds', price: 1.90, book: 'Ladbrokes', units: 1,
      publishedAt: Date.parse('2026-09-27T22:00:00Z'), status: 'won', settledAt: Date.parse('2026-09-28T04:15:00Z'), result: '10 rebounds'
    },
    {
      id: 'pk-w2', lane: 'piggy', sport: 'WNBA', player: 'Kia Morrow', matchup: 'Dream @ Sky', start: '2026-09-27T00:00:00Z',
      selection: 'Over 2.5 threes made', market: 'Threes made', price: 2.25, book: 'Neds', units: 1,
      publishedAt: Date.parse('2026-09-26T22:00:00Z'), status: 'lost', settledAt: Date.parse('2026-09-27T02:10:00Z'), result: '2 threes'
    },
    {
      id: 'pk-m1', lane: 'piggy', sport: 'MLB', player: 'Tomás Reyes', matchup: 'Twins @ Guardians', start: '2026-09-29T23:10:00Z',
      selection: 'Over 0.5 hits', market: 'Hits', price: 1.55, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-29T21:00:00Z'), status: 'won', settledAt: Date.parse('2026-09-30T02:20:00Z'), result: '2 hits'
    },
    {
      id: 'pk-m2', lane: 'piggy', sport: 'MLB', player: 'Luis Ortega', matchup: 'Blue Jays @ Orioles', start: '2026-09-30T20:36:00Z',
      selection: 'Over 5.5 strikeouts', market: 'Pitcher strikeouts', price: 1.83, book: 'Sportsbet', units: 1,
      publishedAt: Date.parse('2026-09-30T20:00:00Z'), status: 'pending'
    },
    // Other lanes — separate records, never merged into the headline.
    {
      id: 'alt1', lane: 'alt', sport: 'NFL', player: 'Drew Kessler', matchup: 'Chiefs @ Bills', start: '2026-09-21T20:25:00Z',
      selection: 'Over 39.5 receiving yards', market: 'Alt receiving yards', price: 1.45, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-21T08:00:00Z'), status: 'won', settledAt: Date.parse('2026-09-22T00:04:00Z'), result: '71 yards'
    },
    {
      id: 'alt2', lane: 'alt', sport: 'WNBA', player: 'Kia Morrow', matchup: 'Dream @ Sky', start: '2026-09-27T00:00:00Z',
      selection: 'Over 1.5 threes made', market: 'Alt threes made', price: 1.40, book: 'Sportsbet', units: 1,
      publishedAt: Date.parse('2026-09-26T22:00:00Z'), status: 'won', settledAt: Date.parse('2026-09-27T02:10:00Z'), result: '2 threes'
    },
    {
      id: 'alt3', lane: 'alt', sport: 'NFL', player: 'Bijan Ross', matchup: 'Falcons @ Panthers', start: '2026-10-04T17:00:00Z',
      selection: 'Over 49.5 rushing yards', market: 'Alt rush yards', price: 1.35, book: 'TAB', units: 1,
      publishedAt: Date.parse('2026-09-30T06:52:00Z'), status: 'pending'
    },
    {
      id: 'dg1', lane: 'degen', sport: 'NFL', player: 'Jared Hollis', matchup: 'Lions @ Ravens', start: '2026-09-23T00:15:00Z',
      selection: 'Over 324.5 passing yards', market: 'Passing yards', price: 3.60, book: 'Ladbrokes', units: 0.25,
      publishedAt: Date.parse('2026-09-22T08:00:00Z'), status: 'lost', settledAt: Date.parse('2026-09-23T03:41:00Z'), result: '268 yards'
    },
    {
      id: 'dg2', lane: 'degen', sport: 'WNBA', player: 'Rae Lindqvist', matchup: 'Liberty @ Aces', start: '2026-09-28T02:00:00Z',
      selection: '20+ rebounds', market: 'Rebounds', price: 11.0, book: 'Neds', units: 0.1,
      publishedAt: Date.parse('2026-09-27T22:00:00Z'), status: 'lost', settledAt: Date.parse('2026-09-28T04:15:00Z'), result: '10 rebounds'
    }
  ];

  BP.MULTIS = [
    {
      id: 'ms1', title: 'Sunday NFL 3-leg', price: 5.42, book: 'Sportsbet', units: 0.5, status: 'won',
      publishedAt: Date.parse('2026-09-20T08:00:00Z'), settledAt: Date.parse('2026-09-22T00:04:00Z'),
      legs: [{ text: 'Drew Kessler · Over 54.5 receiving yards', ok: true }, { text: 'Chiefs @ Bills · Over 44.5 total points', ok: true }, { text: 'Bills to win', ok: true }]
    },
    {
      id: 'ms2', title: 'WNBA double', price: 3.30, book: 'TAB', units: 0.5, status: 'lost',
      publishedAt: Date.parse('2026-09-26T22:00:00Z'), settledAt: Date.parse('2026-09-27T02:10:00Z'),
      legs: [{ text: 'Kia Morrow · Over 2.5 threes made', ok: false }, { text: 'Rae Lindqvist · Over 7.5 rebounds', ok: true }]
    }
  ];

  // Sport state for the Simulator board (decision: sport has published picks?)
  BP.SIM_SPORT_STATE = { NFL: 'live', WNBA: 'live', MLB: 'live', NBA: 'preseason', NBL: 'none' };

  BP.ARTICLES = [
    { id: 'shot-chart', tag: 'Article', title: 'What a shot chart reveals', mins: 6, body: [
      'A shot chart is a map of decisions. Before you look at a prop line, look at where a player actually takes his shots and how that changes by period and opponent.',
      'In Shot Lab, made shots are filled dots and misses are hollow. Narrow to three-pointers and the last 20 games to see whether a recent hot streak is volume or accuracy.',
      'Mapped shots can differ from the box score while the league corrects play-by-play. BetPig shows both counts until they settle — we never quietly fill the gap.'
    ] },
    { id: 'arb', tag: 'Edge Room explainer', title: 'Arbitrage, explained plainly', mins: 4, body: [
      'An arbitrage appears when two bookmakers price the two sides of the same market so that backing both returns more than you stake, if both bets are accepted at those odds.',
      'BetPig shows the exact market, selections, bookmaker names and prices. The calculator balances stakes so both sides pay the same.',
      'Prices move between captures, bets can be limited or rejected, and settlement rules can differ. Nothing here is guaranteed.'
    ] },
    { id: 'middles', tag: 'Edge Room explainer', title: 'Middles and the three-point band', mins: 4, body: [
      'A middle backs the over at a lower line and the under at a higher line. If the result lands between them, both bets win.',
      'We only list middles with a band of at least three points. The chance shown is the historical landing frequency for comparable games, with the sample size, not a model probability.'
    ] },
    { id: 'ev', tag: 'Edge Room explainer', title: 'Reading a +EV card', mins: 3, body: [
      'Estimated EV compares a published price with the model’s estimated fair odds. A higher chance can still offer a poorer price.',
      'Every card carries two timestamps: when the model assessed the line and when the price was captured.'
    ] },
    { id: 'method', tag: 'Methodology', title: 'Methodology & public record notes', mins: 5, body: [
      'Piggy’s Picks are published by the engine, never hand-picked. Each pick is graded at its published price forever, and losses stay visible.',
      'The headline tally counts Piggy’s Picks only. Alt Picks, Degen Zone and Multis keep separate records that are never merged into the headline.',
      'Records are paper-traded at level stakes. No real money is placed.'
    ] }
  ];
})(window.BP);
