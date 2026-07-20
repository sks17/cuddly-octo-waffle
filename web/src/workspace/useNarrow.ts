import { useEffect, useState } from 'react';

/** The workspace's mobile breakpoint, shared with `workspace.css`. */
export const NARROW_QUERY = '(max-width: 767px)';

/**
 * True on viewports where the two-pane workspace collapses. Layout is CSS's job
 * almost everywhere; this exists for the cases where the *markup* has to differ —
 * an embedded PDF, for instance, which mobile browsers refuse to render.
 */
export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(NARROW_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return narrow;
}
