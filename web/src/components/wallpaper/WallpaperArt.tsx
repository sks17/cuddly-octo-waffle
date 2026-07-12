import { useMemo } from 'react';
import { genBlocks, WALL_H, WALL_W } from '@/lib/wallpaper';

interface Props {
  seed: number;
  blur: number;
  className?: string;
}

/**
 * Renders the determinant wallpaper as an inline SVG. Placeholder for the real
 * WallpaperPort (which will serve a cached image or a render-spec).
 */
export function WallpaperArt({ seed, blur, className }: Props) {
  const blocks = useMemo(() => genBlocks(seed), [seed]);
  const filterId = `wp-blur-${seed}`;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${WALL_W} ${WALL_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      <rect width={WALL_W} height={WALL_H} fill="var(--wp-bg)" />
      <g filter={`url(#${filterId})`}>
        {blocks.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.size}
            height={b.size}
            fill="var(--wp-accent)"
            opacity={b.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
