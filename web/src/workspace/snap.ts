import type { Rect, SnapRegion } from './types';

export interface SnapMetrics {
  /** Half-edge band width (px) for left/right half snapping (middle of an edge). */
  edge: number;
  /** Corner hitbox width/height (px) — size-relative so it stays sane at island and full size. */
  cornerX: number;
  cornerY: number;
}

/**
 * Snap hitbox sizes, relative to the live workspace so corners stay reachable
 * whether the workspace is a small centered island or full-screen.
 */
export function snapMetrics(ws: Rect): SnapMetrics {
  return {
    edge: Math.min(56, ws.width * 0.1),
    cornerX: Math.min(150, ws.width * 0.3),
    cornerY: Math.min(150, ws.height * 0.34),
  };
}

/**
 * Detect a snap region from a pointer position in workspace-local coordinates.
 * Corners (quarters) take precedence over edges (halves); null → stays floating.
 * Explicit 2-D corner boxes make the bottom corners reliably reachable even when
 * the pointer sits below the inset stage (py > height reads as "near bottom").
 */
export function detectSnap(px: number, py: number, ws: Rect): SnapRegion | null {
  const { edge, cornerX, cornerY } = snapMetrics(ws);
  const nearLeft = px <= cornerX;
  const nearRight = px >= ws.width - cornerX;
  const nearTop = py <= cornerY;
  const nearBottom = py >= ws.height - cornerY;

  // (1) corners beat edges
  if (nearBottom && nearLeft) return 'bottom-left';
  if (nearBottom && nearRight) return 'bottom-right';
  if (nearTop && nearLeft) return 'top-left';
  if (nearTop && nearRight) return 'top-right';

  // (2) half-edges (the middle band of a side)
  if (px <= edge) return 'left';
  if (px >= ws.width - edge) return 'right';
  return null;
}

/** Target rectangle for a snap region, always a percentage of the workspace. */
export function snapRect(region: SnapRegion, ws: Rect): Rect {
  const halfW = Math.round(ws.width / 2);
  const halfH = Math.round(ws.height / 2);
  const rightX = ws.width - halfW;
  const bottomY = ws.height - halfH;
  switch (region) {
    case 'left':
      return { x: 0, y: 0, width: halfW, height: ws.height };
    case 'right':
      return { x: rightX, y: 0, width: halfW, height: ws.height };
    case 'top-left':
      return { x: 0, y: 0, width: halfW, height: halfH };
    case 'top-right':
      return { x: rightX, y: 0, width: halfW, height: halfH };
    case 'bottom-left':
      return { x: 0, y: bottomY, width: halfW, height: halfH };
    case 'bottom-right':
      return { x: rightX, y: bottomY, width: halfW, height: halfH };
  }
}
