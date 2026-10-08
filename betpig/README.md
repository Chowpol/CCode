# BetPig — Tools · Edge Room · Picks

A mobile-first UI for the **Storyboard & User Flow** in the *Edge Room Draft* Figma file (Page 2).
It is static HTML, CSS and vanilla JS with no build step.

## Run

Open `betpig/index.html` in a browser, or serve the folder:

```sh
cd betpig && python3 -m http.server 8000   # or any static server
```

- **Desktop (≥1100px):** the left rail shows the four storyboard flows (B1–B4). Click any step to open the live screen. Decision and state nodes switch the data state, so every branch can be seen.
- **Mobile:** the same flows open from the **◆ Flows** button.

## What's covered

| Flow | Screens and states |
| --- | --- |
| **B1 Shot Lab** | Player search (recent/popular). Season default: 2026-27 if the player has appeared, otherwise the full 2025-26 season, so the court is never empty. Court map with made/missed dots. Shots/Zones toggle, All/2PT/3PT, Season/Last 5/10/20. Filter sheet. Replay (event-order dot reveal, optional "reconstructed path" arcs). The Eye's Outlook, or "Outlook unavailable". Mapped ≠ box-count state. Hand-off to Alt Line. |
| **B2 Alt Line Explorer** | Market + Over/Under, The Eye's Range (integer histogram), slider/stepper/chips updating chance, fair odds, best price and est. EV together. Historical-only state for non-slate days. Per-book quotes (ok / no quote / old "as at" / absent). Compare alternatives. Recorded results (last 5/10/20/season). Read-only published pick. |
| **B3 Edge Room** | Tool tabs Simulator · Arbitrage · +EV · Middles · Odds. Snapshot strip (on time / delayed / unavailable / loading skeleton). Region and timezone. Game picker sheet. Sport chips. Arbitrage calculator: either stake editable, the other rebalances; invalid-stake and price-changed states. Middles with ≥3-pt band graph and historical landing frequency + sample n. +EV cards with two timestamps and no stake calculator. Plain-text odds board. Empty-board state. |
| **B4 Piggy's Picks** | Simulator per sport: published / pre-season / none. Pick of the Day with View/Hide analysis. Free-visitor paywall vs trial/paid. Inside the Pick evidence with a season toggle. Settled grading. Results with the headline Piggy's Picks tally, plus separate Alt Picks, Degen Zone and Multis records. |

Every screen also has the 18+ strip, the reserved messaging slot, and separate history / model / price timestamps. My bookmakers, odds format (decimal/American) and timezone are saved per device in `localStorage`.

## Notes

- All players, prices and records are **fictional sample data** (`js/data.js`). "Now" is fixed at Thu 1 Oct 2026, 8:10am AEST, so timestamps line up with the storyboard.
- Design tokens (lime `#c6ff4a`, surfaces, borders, type scale) come from the Figma frames. The BetPig pig logo is a placeholder SVG because Figma image assets couldn't be downloaded from this environment. Swap in the real asset at `BP.icon.logo` in `js/core.js`.
- Panels marked "to design" in the storyboard (Replay, Slide the line, My bookmakers, Recorded results, Inside the Pick) are implemented here as proposals.

## Structure

```
betpig/
  index.html
  css/styles.css          tokens + components
  js/data.js              sample data
  js/core.js              state, formatting, maths, icons
  js/components.js        shared UI pieces
  js/app.js               router, header/drawer/tab bar, sheets, events
  js/screens/tools.js     Home, Tools, Shot Lab, Alt Line Explorer
  js/screens/edge.js      Edge Room
  js/screens/picks.js     Picks, Results, Inside the Pick
  js/screens/account.js   Account, My bookmakers, Plans, Research
  js/flows.js             storyboard flow rail
```
