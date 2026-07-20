import { useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './context';
import type { ThemeDefinition } from './types';

const SCROLLBAR: React.CSSProperties = {
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--scrollbar-thumb) transparent',
};

function Swatch({ t }: { t: ThemeDefinition }) {
  return (
    <span
      className="flex size-6 flex-none items-center justify-center rounded-md border border-border"
      style={{ background: t.palette.bg }}
      aria-hidden="true"
    >
      <span className="size-2.5 rounded-full" style={{ background: t.palette.main }} />
    </span>
  );
}

function Column({
  title,
  items,
  themeId,
  onPick,
}: {
  title: string;
  items: ThemeDefinition[];
  themeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
        <span className="ml-1 opacity-50">{items.length}</span>
      </div>
      <div className="max-h-72 overflow-y-auto pr-1" style={SCROLLBAR}>
        {items.map((t) => {
          const active = t.id === themeId;
          return (
            <button
              key={t.id}
              data-theme-item
              role="option"
              aria-selected={active}
              onClick={() => onPick(t.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-brand/15 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Swatch t={t} />
              <span className="flex-1 truncate">{t.name}</span>
              {active && <Check size={14} className="flex-none text-brand" />}
            </button>
          );
        })}
        {items.length === 0 && <div className="px-2 py-4 text-center text-[11px] text-muted-foreground">—</div>}
      </div>
    </div>
  );
}

/** Theme selector: heading, search, and dark/light themes split into two columns. */
export function ThemeMenu() {
  const { themes, themeId, setTheme, resetTheme } = useTheme();
  const [q, setQ] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? themes.filter((t) => t.name.includes(s) || t.id.includes(s)) : themes;
  }, [themes, q]);

  const darks = filtered.filter((t) => t.appearance === 'dark');
  const lights = filtered.filter((t) => t.appearance === 'light');
  const current = themes.find((t) => t.id === themeId);

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(gridRef.current?.querySelectorAll<HTMLButtonElement>('[data-theme-item]') ?? []);
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'ArrowDown' ? Math.min(items.length - 1, idx + 1) : Math.max(0, idx - 1);
    (items[next] ?? items[0])?.focus();
  };

  return (
    <div className="flex w-[min(34rem,calc(100vw-1rem))] flex-col">
      <div className="border-b border-border px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          MonkeyType themes
        </div>
        <div className="mt-2 flex h-8 items-center gap-2 rounded-md border border-border bg-background/50 px-2.5">
          <Search size={13} className="flex-none text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search themes…"
            spellCheck={false}
            aria-label="Search themes"
            className="h-full flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div
        ref={gridRef}
        role="listbox"
        aria-label="Themes"
        onKeyDown={onGridKeyDown}
        className="grid grid-cols-1 gap-x-2 gap-y-1 p-2 sm:grid-cols-2"
      >
        <Column title="Dark" items={darks} themeId={themeId} onPick={setTheme} />
        <Column title="Light" items={lights} themeId={themeId} onPick={setTheme} />
        {filtered.length === 0 && (
          <div className="col-span-full px-2 py-6 text-center text-[12px] text-muted-foreground">
            No themes match “{q}”.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <span className="truncate text-[11px] text-muted-foreground">{current?.name}</span>
        <button
          onClick={resetTheme}
          className="inline-flex flex-none items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
    </div>
  );
}
