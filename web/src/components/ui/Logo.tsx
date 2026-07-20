/**
 * The site mark — the terminal "›_" glyph from the original far-flare site.
 * Stroke uses `currentColor` so it inherits the active theme (set the color on
 * the parent), unlike the standalone favicon which keys off the OS scheme.
 */
export function Logo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        d="m80 96 40 32-40 32m56 0h40"
      />
      <rect
        width="192"
        height="160"
        x="32"
        y="48"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16.97"
        rx="8.5"
      />
    </svg>
  );
}
