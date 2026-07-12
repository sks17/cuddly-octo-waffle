/**
 * Local determinant-block generator — a stand-in for the real WallpaperPort.
 * Deterministic per seed so the wallpaper is stable across renders/reloads.
 */
export interface WallBlock {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const WALL_W = 1600;
export const WALL_H = 1000;

export function genBlocks(seed: number): WallBlock[] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647;

  const cell = 64;
  const out: WallBlock[] = [];
  for (let y = 0; y < WALL_H; y += cell) {
    for (let x = 0; x < WALL_W; x += cell) {
      if (rnd() < 0.45) continue;
      out.push({
        x,
        y,
        size: Number((cell * (0.45 + rnd() * 0.55)).toFixed(1)),
        opacity: Number((0.12 + rnd() * 0.55).toFixed(2)),
      });
    }
  }
  return out;
}
