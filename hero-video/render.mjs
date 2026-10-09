// Captures shot-explorer.html frame-by-frame and encodes the hero video.
// Usage: node hero-video/render.mjs [fps] [width height suffix]   (requires playwright + ffmpeg)
//   portrait (default): node hero-video/render.mjs
//   landscape:          node hero-video/render.mjs 30 1600 1000 -landscape
import { chromium } from 'playwright';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'out');
const fps = Number(process.argv[2] || 30);
const [w, h] = [Number(process.argv[3] || 1040), Number(process.argv[4] || 1240)];
const name = 'hero-shot-explorer' + (process.argv[5] || '');
mkdirSync(out, { recursive: true });
const frames = mkdtempSync(join(tmpdir(), 'hero-frames-'));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w / 2, height: h / 2 } });
await page.goto(pathToFileURL(join(here, 'shot-explorer.html')).href + `?capture&w=${w}&h=${h}`);
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.HERO.DURATION);
const total = Math.round(duration * fps);
for (let i = 0; i < total; i++) {
  const data = await page.evaluate((t) => {
    window.HERO.render(t);
    return document.getElementById('c').toDataURL('image/png');
  }, i / fps);
  writeFileSync(join(frames, `f${String(i).padStart(4, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();

const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const input = ['-framerate', String(fps), '-i', join(frames, 'f%04d.png')];
ff(...input, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', join(out, `${name}.mp4`));
ff(...input, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-pix_fmt', 'yuv420p', join(out, `${name}.webm`));
ff('-i', join(frames, 'f0090.png'), join(out, `${name}-poster.jpg`));
// half-size GIF for Figma (Figma accepts GIF fills; it has no video upload via API)
ff(...input, '-vf', `fps=15,scale=${w / 2}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a`, '-loop', '0', join(out, `${name}.gif`));
rmSync(frames, { recursive: true, force: true });
console.log(`rendered ${total} frames → ${out}`);
