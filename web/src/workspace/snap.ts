import type { Rect, SnapRegion } from './types';

/** Hit band (px) from a workspace edge that triggers a snap. */
export const SNAP_EDGE = 60;
/** Below this fraction of workspace height, a left/right edge becomes a corner. */
const CORNER_BAND = 0.6;

/**
 * Detect a snap region from a pointer position expressed in workspace-local
 * coordinates. Returns null when not near an edge (i.e. stays floating).
 * The top tab bar is handled separately (docking) and takes priority — it is
 * physically above the workspace area, so it never overlaps these bands.
 */
export function detectSnap(px: number, py: number, ws: Rect): SnapRegion | null {
  const nearLeft = px <= SNAP_EDGE;
  const nearRight = px >= ws.width - SNAP_EDGE;
  const inBottom = py >= ws.height * CORNER_BAND;
  if (nearLeft) return inBottom ? 'bottom-left' : 'left';
  if (nearRight) return inBottom ? 'bottom-right' : 'right';
  return null;
}

/** Target rectangle for a snap region, always a percentage of the workspace. */
export function snapRect(region: SnapRegion, ws: Rect): Rect {
  const halfW = Math.round(ws.width / 2);
  const halfH = Math.round(ws.height / 2);
  switch (region) {
    case 'left':
      return { x: 0, y: 0, width: halfW, height: ws.height };
    case 'right':
      return { x: ws.width - halfW, y: 0, width: halfW, height: ws.height };
    case 'bottom-left':
      return { x: 0, y: ws.height - halfH, width: halfW, height: halfH };
    case 'bottom-right':
      return { x: ws.width - halfW, y: ws.height - halfH, width: halfW, height: halfH };
  }
}
