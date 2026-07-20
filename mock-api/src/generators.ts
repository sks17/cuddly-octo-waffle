/**
 * Purely-local generators. Nothing here calls an external API — the 50 wallpaper
 * images are produced in-process (mirroring the prod plan: prebake the cache by
 * running the generator locally once, then serve statically; never 50 live calls).
 */
import type { Document, ThemePalette, ThemeVariant } from './types.js';

/** Small deterministic string hash → non-negative int. */
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (LCG) so wallpapers are stable across restarts. */
function rng(seed: number): () => number {
  let s = seed % 0x7fffffff;
  if (s <= 0) s += 0x7fffffed;
  return () => {
    s = (Math.imul(s, 48271) % 0x7fffffff) >>> 0;
    return s / 0x7fffffff;
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

/** Deterministic palette for a theme name + variant. */
export function paletteFor(name: string, variant: ThemeVariant): ThemePalette {
  const hue = hash(name) % 360;
  return variant === 'dark'
    ? {
        bg: `hsl(${hue} 28% 8%)`,
        fg: `hsl(${hue} 14% 92%)`,
        sub: `hsl(${hue} 12% 58%)`,
        accent: `hsl(${(hue + 18) % 360} 68% 62%)`,
      }
    : {
        bg: `hsl(${hue} 42% 96%)`,
        fg: `hsl(${hue} 24% 14%)`,
        sub: `hsl(${hue} 14% 42%)`,
        accent: `hsl(${(hue + 18) % 360} 62% 46%)`,
      };
}

interface Block {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

/** The determinant-style block field, generated locally from the palette. */
function blocks(seed: number): { W: number; H: number; cell: number; items: Block[] } {
  const W = 1600, H = 1000, cell = 64;
  const rnd = rng(seed);
  const items: Block[] = [];
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      if (rnd() < 0.45) continue;
      items.push({
        x,
        y,
        size: +(cell * (0.45 + rnd() * 0.55)).toFixed(1),
        opacity: +(0.12 + rnd() * 0.6).toFixed(2),
      });
    }
  }
  return { W, H, cell, items };
}

/** An ambient determinant wallpaper as a self-contained SVG. */
export function wallpaperSvg(palette: ThemePalette, seed: number): string {
  const { W, H, items } = blocks(seed);
  const rects = items
    .map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.size}" height="${b.size}" fill="${palette.accent}" opacity="${b.opacity}"/>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<defs><filter id="b" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7"/></filter></defs>` +
    `<rect width="100%" height="100%" fill="${palette.bg}"/>` +
    `<g filter="url(#b)">${rects}</g></svg>`
  );
}

/** The same wallpaper as a render-spec (the client can paint this on a canvas). */
export function wallpaperSpec(palette: ThemePalette, seed: number) {
  const { W, H, cell, items } = blocks(seed);
  return { canvas: { width: W, height: H, cell }, palette, blocks: items };
}

/** Greedy wrap on whole words, at most `max` lines (the last one elided). */
function wrap(text: string, perLine: number, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) {
      lines.push(line);
      line = word;
      if (lines.length === max) break;
    } else {
      line = next;
    }
  }
  if (lines.length < max && line) lines.push(line);
  const used = lines.join(' ').length;
  if (used < text.length) lines[lines.length - 1] += '…';
  return lines;
}

/** A simple thumbnail card (wrapped title + accent bar). */
export function thumbnailSvg(doc: Document): string {
  const bg = doc.type === 'pdf' ? '#2a1520' : '#12121a';
  const accent = doc.type === 'pdf' ? '#f0709a' : '#8b8cf7';
  const lines = wrap(doc.title, 22, 3);
  // Centre the block vertically: 300/2, minus half the stack, plus cap-height nudge.
  const top = 150 - ((lines.length - 1) * 38) / 2 + 11;
  const text = lines
    .map((l, i) => `<tspan x="28" y="${top + i * 38}">${escapeXml(l)}</tspan>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">` +
    `<rect width="480" height="300" fill="${bg}"/>` +
    `<rect x="0" y="0" width="480" height="6" fill="${accent}"/>` +
    `<text fill="#f4f4f5" font-family="system-ui,sans-serif" font-size="30" font-weight="700">${text}</text>` +
    `</svg>`
  );
}

/** Encode a string to a Uint8Array backed by a concrete ArrayBuffer. */
function toBytes(str: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(str);
  const buffer = new ArrayBuffer(encoded.byteLength);
  const view = new Uint8Array(buffer);
  view.set(encoded);
  return view;
}
const blen = (str: string): number => new TextEncoder().encode(str).length;

/** A minimal, valid single-page PDF stamped with the title (offset-correct xref). */
export function makePdf(title: string): Uint8Array<ArrayBuffer> {
  const esc = (s: string) => s.replace(/([()\\])/g, '\\$1');
  const stream = `BT /F1 28 Tf 72 700 Td (${esc(title)}) Tj 0 -40 Td /F1 12 Tf (Mock PDF served by the local Atlas dev API.) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${blen(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets[i] = blen(pdf);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = blen(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return toBytes(pdf);
}

/** Extract a ~140-char snippet around the first query match. */
export function snippet(text: string, query: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!query) return clean.slice(0, 140);
  const i = clean.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return clean.slice(0, 140) + (clean.length > 140 ? '…' : '');
  const start = Math.max(0, i - 50);
  return (start > 0 ? '…' : '') + clean.slice(start, start + 140) + '…';
}
