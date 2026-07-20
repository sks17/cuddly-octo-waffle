/**
 * Real bytes for the Atlas. Most of the mock is generated (SVG thumbnails, stub
 * PDFs); anything dropped into `mock-api/public/` is served verbatim instead, so
 * genuine content can be pinned here while the upstream Atlas can't serve it.
 *
 *   public/thumbnails/<docId>.<ext>      → /atlas/thumbnails/<docId>.<ext>
 *   public/documents/<docId>.pdf         → /atlas/documents/<docId>/content
 *   public/assets/<docId>/<name>         → /atlas/assets/<docId>/<name>
 */
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../public/', import.meta.url);

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.csv': 'text/csv; charset=utf-8',
};

export interface StaticFile {
  bytes: Uint8Array<ArrayBuffer>;
  mime: string;
}

/** A path segment safe to join under `public/` (no traversal, no nesting). */
const safe = (segment: string): boolean => segment.length > 0 && !/[/\\]|^\.\.?$/.test(segment);

/** Read `public/<segments…>`, or null when it isn't there (caller falls back). */
export async function staticFile(...segments: string[]): Promise<StaticFile | null> {
  if (!segments.every(safe)) return null;
  const path = segments.join('/');
  let buf: Buffer;
  try {
    buf = await readFile(new URL(path, ROOT));
  } catch {
    return null;
  }
  // Copy onto a concrete ArrayBuffer so the body type is exact.
  const bytes = new Uint8Array(new ArrayBuffer(buf.byteLength));
  bytes.set(buf);
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return { bytes, mime: MIME[ext] ?? 'application/octet-stream' };
}
