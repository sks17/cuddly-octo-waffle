import { useEffect, useRef } from 'react';
import { ChevronRight, FileText, Star } from 'lucide-react';
import { useResolvedManifest } from '@/core/atlas/hooks';
import { useShellStore } from '../shell/store';
import { shell } from '../shell/controller';
import { destinationForDoc } from './destination';

// The Featured collection lives in the main panel, not the file tree.
const HIDDEN = new Set(['featured']);

/** The left file-traversal tree — folder state, selection and scroll live in the shell. */
export function ExplorerSidebar() {
  const { data, loading, error } = useResolvedManifest();
  const openFolders = useShellStore((s) => s.explorer.openFolders);
  const selectedFileId = useShellStore((s) => s.explorer.selectedFileId);
  const treeRef = useRef<HTMLDivElement>(null);

  // Restore the saved scroll position once the tree has content.
  useEffect(() => {
    const el = treeRef.current;
    if (el && data) el.scrollTop = useShellStore.getState().explorer.scrollTop;
  }, [data]);

  const cols = (data?.collections ?? []).filter((c) => !HIDDEN.has(c.collection.id));

  return (
    <aside className="wp-side" aria-label="File explorer">
      <div className="wp-side__head">Explorer</div>
      <div
        className="wp-side__tree"
        ref={treeRef}
        onScroll={(e) => shell.setExplorerScroll(e.currentTarget.scrollTop)}
      >
        <button
          className={`wp-leaf wp-leaf--pinned${selectedFileId === null ? ' is-selected' : ''}`}
          aria-current={selectedFileId === null}
          onClick={() => shell.focusFeatured()}
        >
          <Star size={12} className="wp-leaf__icon" />
          <span className="wp-leaf__label">Featured</span>
        </button>
        {loading && <div className="wp-side__msg">Loading…</div>}
        {error && <div className="wp-side__msg">Atlas offline</div>}
        {cols.map(({ collection, docs }) => {
          const open = openFolders[collection.id] ?? true;
          return (
            <div key={collection.id} className="wp-node">
              <button className="wp-node__row" onClick={() => shell.toggleFolder(collection.id)}>
                <ChevronRight size={13} className={`wp-node__chev${open ? ' is-open' : ''}`} />
                <span className="wp-node__label">{collection.title}</span>
                <span className="wp-node__count">{docs.length}</span>
              </button>
              {open && (
                <div className="wp-node__kids">
                  {docs.map((d) => (
                    <button
                      key={d.id}
                      className={`wp-leaf${selectedFileId === d.id ? ' is-selected' : ''}`}
                      aria-current={selectedFileId === d.id}
                      onClick={() => shell.openDestination(destinationForDoc(d, collection.id))}
                    >
                      <FileText size={12} className="wp-leaf__icon" />
                      <span className="wp-leaf__label">{d.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
