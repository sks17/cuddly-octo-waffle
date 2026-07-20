import { Link } from 'react-router-dom';
import { FolderGit2, PenLine, Sparkles } from 'lucide-react';
import { useResolvedManifest } from '@/core/atlas/hooks';

// Counts are content, not copy — they come from the Atlas so they can't go stale.
const STATS = [
  { label: 'Projects', collectionId: 'projects', to: '/projects' },
  { label: 'Experiences', collectionId: 'experiences', to: '/experiences' },
  { label: 'Written', collectionId: 'blogs', to: '/blogs' },
];

/**
 * The homepage description island — a customizable, non-markdown component that
 * sits above the explorer. Free to hold headings, buttons, cards, stats, etc.
 */
export function DescriptionIsland() {
  const { data } = useResolvedManifest();
  const countFor = (id: string) => data?.collections.find((c) => c.collection.id === id)?.docs.length;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-[0_10px_40px_-28px_var(--panel-shadow)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[54ch]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.09em] text-brand">
            <Sparkles size={13} /> Frontend &amp; UI
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            I also do frontend and UI work.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Portfolio coming soon — though this website isn't the prettiest. I prefer it because you can see
            everything in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FolderGit2 size={14} /> Browse projects
            </Link>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-accent"
            >
              <PenLine size={14} /> Read Works
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:w-[280px]">
          {STATS.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="group rounded-lg border border-border bg-surface-elevated px-3 py-3 text-center transition-colors hover:border-brand/50"
            >
              <div className="text-lg font-semibold">{countFor(s.collectionId) ?? '–'}</div>
              <div className="mt-0.5 text-center text-[11px] text-muted-foreground">{s.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
