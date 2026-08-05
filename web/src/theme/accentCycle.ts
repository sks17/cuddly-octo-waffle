import { lerpColor } from './derive';
import { accentVars, applyVars } from './vars';
import type { ThemeAnimation } from './types';

/**
 * Drives the accent through a theme's color cycle. Monkeytype animates
 * `--main-color` in CSS for these themes; here the whole accent family follows
 * the cycle, so every accent-derived surface (buttons, links, selection, focus
 * rings, the wallpaper wash) moves with it rather than just the text color.
 *
 * Returns a stop function. It's a no-op — leaving the theme's static accent
 * painted — for themes with no cycle, and when the user prefers reduced motion.
 * `requestAnimationFrame` pauses in background tabs, so an idle tab costs nothing.
 */
export function startAccentCycle(animation: ThemeAnimation | undefined): () => void {
  const stops = animation?.colors ?? [];
  if (stops.length < 2) return () => {};
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};

  const duration = animation!.durationMs;
  const segment = duration / stops.length;
  const started = performance.now();
  let raf = 0;

  const frame = (now: number) => {
    // Position along the cycle in "segments"; the last stop wraps to the first.
    // `now` is the frame's start time, which can predate `started` — hence the
    // positive modulo rather than a bare `%`, which would index at -1.
    const at = ((((now - started) % duration) + duration) % duration) / segment;
    const i = Math.floor(at);
    applyVars(accentVars(lerpColor(stops[i]!, stops[(i + 1) % stops.length]!, at - i)));
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(raf);
}
