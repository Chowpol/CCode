# Hero video — Shot Explorer 3D

A looping 12s motion piece (portrait 520×620 and landscape 800×500, rendered @2x) for the waitlist hero's right column:
a 3D half-court that swings into view while ~180 illustrative shots arc into the rim,
leaving lime (made) and ring (missed) markers plus a live FG% tally.

- `shot-explorer.html`: the deterministic canvas animation. Open it directly to play it live.
- `render.mjs`: captures every frame with Playwright and encodes the outputs into `out/`.
- `out/hero-shot-explorer.{mp4,webm}`: web video. `.gif`: Figma-compatible. `-poster.jpg`: first paint.

Re-render (needs `playwright` and `ffmpeg`):
- portrait: `node hero-video/render.mjs`
- landscape: `node hero-video/render.mjs 30 1600 1000 -landscape` (writes `hero-shot-explorer-landscape.*`)

## Embed in the hero

```html
<video class="hero-visual" autoplay muted loop playsinline
       poster="hero-video/out/hero-shot-explorer-poster.jpg" width="520" height="620">
  <source src="hero-video/out/hero-shot-explorer.webm" type="video/webm">
  <source src="hero-video/out/hero-shot-explorer.mp4" type="video/mp4">
</video>
```

The video background is `#0b0f0d`, the same as the page, so it blends without a frame.
