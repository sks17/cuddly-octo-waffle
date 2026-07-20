/**
 * Bakes the mock service into static files under `web/public/atlas/`, so a
 * deployed build serves byte-for-byte what `npm run dev` serves on :8787 — no
 * server, no origin. Every response comes from the real routes via `app.fetch`,
 * so the snapshot cannot drift from the running mock.
 *
 * Two shapes change on the way out, because a static host has no routing:
 *   - `/atlas/manifest`            → `/atlas/manifest.json`
 *   - `/atlas/documents/<id>/content` → `…/content.md` | `…/content.pdf`
 *     (extension-less files are served as octet-stream, which breaks the PDF pane)
 * The manifest is rewritten to point at those, so it stays the source of truth.
 *
 *   npm run snapshot            # → web/public/atlas
 *   npm run snapshot -- <dir>
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { documents } from './fixtures.js';
import { bodyText } from './retrieve.js';
import type { AtlasManifest } from './types.js';

const outArg = process.argv[2];
const OUT = outArg
  ? new URL(`file://${outArg.replace(/\\/g, '/')}/`)
  : new URL('../../web/public/atlas/', import.meta.url);

/** Call a route in-process and return its bytes. */
async function grab(path: string): Promise<Uint8Array> {
  const res = await app.fetch(new Request(`http://snapshot${path}`));
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function emit(relPath: string, bytes: Uint8Array | string): Promise<number> {
  const file = fileURLToPath(new URL(relPath, OUT));
  await mkdir(dirname(file), { recursive: true });
  const data = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  await writeFile(file, data);
  return data.byteLength;
}

/** `/atlas/thumbnails/x.png` → `thumbnails/x.png` (paths are already root-relative). */
const strip = (url: string): string => url.replace(/^\/atlas\//, '');

async function main(): Promise<void> {
  await rm(OUT, { recursive: true, force: true });

  const manifest = JSON.parse(new TextDecoder().decode(await grab('/atlas/manifest'))) as AtlasManifest;
  let files = 0;
  let bytes = 0;
  const count = async (rel: string, data: Uint8Array | string) => {
    bytes += await emit(rel, data);
    files++;
  };

  for (const doc of documents) {
    const ext = doc.type === 'pdf' ? 'pdf' : 'md';
    await count(`documents/${doc.id}/content.${ext}`, await grab(`/atlas/documents/${doc.id}/content`));
    await count(strip(doc.thumbnailUrl), await grab(doc.thumbnailUrl));
    for (const file of doc.associated) await count(strip(file.url), await grab(file.url));

    // Point the manifest at the static content file.
    const out = manifest.documents.find((d) => d.id === doc.id);
    if (out) out.contentUrl = `/atlas/documents/${doc.id}/content.${ext}`;
  }

  await count('manifest.json', JSON.stringify(manifest));
  // The search corpus, so the browser can run the same ranking without a server.
  await count(
    'search-index.json',
    JSON.stringify(documents.map((d) => ({ docId: d.id, title: d.title, tags: d.tags, text: bodyText(d.id) }))),
  );

  console.log(`snapshot → ${fileURLToPath(OUT)}\n  ${files} files, ${(bytes / 1e6).toFixed(1)} MB`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
