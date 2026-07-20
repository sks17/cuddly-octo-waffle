import { useShellStore } from './shell/store';

// Sustained overscroll (px) at an inner boundary before the page takes over.
const HANDOFF_THRESHOLD = 240;
// Intent decays if the user pauses or reverses within this window.
const INTENT_WINDOW_MS = 320;
const BOUNDARY_EPS = 1;

/**
 * Intent-based scroll handoff for the expanded content workspace. The inner
 * scroll area (document pane or explorer) is consumed first — the workspace feels
 * temporarily locked — and only *sustained* overscroll at a boundary hands off to
 * the page (revealing the header above / footer below). Never permanently traps.
 * Supports wheel, touch, and keyboard. Returns a cleanup function.
 */
export function installScrollHandoff(root: HTMLElement): () => void {
  let accum = 0;
  let lastTs = 0;
  let dir = 0; // -1 up, +1 down
  let released = false; // broke through the boundary → keep flowing to the page

  const expanded = () => useShellStore.getState().presentation === 'expanded';
  const scroller = (t: EventTarget | null): HTMLElement | null =>
    (t as HTMLElement | null)?.closest<HTMLElement>('.wp-scroll__viewport, .wp-side__tree') ?? null;

  // Decide what a scroll of `deltaY` over viewport `v` should do.
  const decide = (deltaY: number, v: HTMLElement): 'inner' | 'lock' | 'page' => {
    const up = deltaY < 0;
    const maxTop = v.scrollHeight - v.clientHeight;
    const canInner = (up && v.scrollTop > BOUNDARY_EPS) || (!up && v.scrollTop < maxTop - BOUNDARY_EPS);
    if (canInner) {
      accum = 0;
      released = false;
      return 'inner';
    }
    const now = performance.now();
    const thisDir = up ? -1 : 1;
    if (now - lastTs > INTENT_WINDOW_MS || thisDir !== dir) {
      accum = 0; // decay on pause or reversal…
      released = false; // …and re-arm the boundary lock
    }
    dir = thisDir;
    lastTs = now;
    if (released) return 'page'; // already broke through — flow freely until reversal/idle
    accum += Math.abs(deltaY);
    if (accum < HANDOFF_THRESHOLD) return 'lock';
    accum = 0;
    released = true;
    return 'page';
  };

  const onWheel = (e: WheelEvent) => {
    if (!expanded()) return; // centered island scrolls the page natively
    const v = scroller(e.target);
    if (!v) return;
    const r = decide(e.deltaY, v);
    if (r === 'inner') return; // let the inner viewport scroll (overscroll-behavior: contain keeps it in)
    e.preventDefault();
    if (r === 'page') window.scrollBy(0, e.deltaY);
  };

  let touchY = 0;
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!expanded()) return;
    const v = scroller(e.target);
    if (!v) return;
    const y = e.touches[0]?.clientY ?? touchY;
    const deltaY = touchY - y; // finger up (content moves up) → positive
    touchY = y;
    const r = decide(deltaY, v);
    if (r === 'inner') return;
    e.preventDefault();
    if (r === 'page') window.scrollBy(0, deltaY);
  };

  const onKey = (e: KeyboardEvent) => {
    if (!expanded()) return;
    const active = document.activeElement;
    if (active && /^(input|textarea|select)$/i.test(active.tagName)) return; // don't hijack typing
    const v = root.querySelector<HTMLElement>('.wp-card--tabbed .wp-scroll__viewport');
    if (!v) return;
    const page = v.clientHeight * 0.9;
    let amount = 0;
    if (e.key === 'PageDown') amount = page;
    else if (e.key === 'PageUp') amount = -page;
    else if (e.key === ' ') amount = e.shiftKey ? -page : page;
    else if (e.key === 'ArrowDown') amount = 60;
    else if (e.key === 'ArrowUp') amount = -60;
    else return;
    const r = decide(amount, v);
    e.preventDefault();
    if (r === 'inner') v.scrollTop += amount;
    else if (r === 'page') window.scrollBy(0, amount);
  };

  root.addEventListener('wheel', onWheel, { capture: true, passive: false });
  root.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
  root.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
  window.addEventListener('keydown', onKey);
  return () => {
    root.removeEventListener('wheel', onWheel, true);
    root.removeEventListener('touchstart', onTouchStart, true);
    root.removeEventListener('touchmove', onTouchMove, true);
    window.removeEventListener('keydown', onKey);
  };
}
