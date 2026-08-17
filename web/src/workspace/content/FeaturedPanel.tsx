import { useState } from 'react';
import { Search } from 'lucide-react';
import { useResolvedManifest, useSearch } from '@/core/atlas/hooks';
import { atlas } from '@/core/atlas/client';
import type { AtlasDocument } from '@/core/atlas/types';
import { shell } from '../shell/controller';
import { destinationForDoc, destinationForDocRef } from './destination';

// Rows surfaced in this panel, led by the curated `featured` collection itself.
const SECTIONS = ['featured', 'projects', 'experiences', 'research', 'links', 'drafts'];

function DocTile({ doc, collectionId }: { doc: AtlasDocument; collectionId: string }) {
  return (
    <button className="wp-tile" onClick={() => shell.openDestination(destinationForDoc(doc, collectionId))}>
      <img className="wp-tile__thumb" src={atlas.abs(doc.thumbnailUrl)} alt="" loading="lazy" />
      <span className="wp-tile__title">{doc.title}</span>
      {doc.description && <span className="wp-tile__desc">{doc.description}</span>}
    </button>
  );
}

/** The "Featured" workspace panel: a search bar over section subheaders. */
export function FeaturedPanel(_props: { panelId: string }) {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useResolvedManifest();
  const search = useSearch(query);
  const q = query.trim();

  const sections = (data?.collections ?? []).filter((c) => SECTIONS.includes(c.collection.id));

  return (
    <div className="wp-featured">
      <div className="wp-search">
        <Search size={14} className="wp-search__icon" />
        <input
          className="wp-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the workspace…"
          spellCheck={false}
          autoComplete="off"
          aria-label="Search"
        />
      </div>

      {error && <p className="wp-featured__msg">Couldn't reach the Atlas ({error.message}).</p>}

      {q ? (
        <div className="wp-hits">
          {search.data?.hits.length ? (
            search.data.hits.map((h) => (
              <button
                key={h.docId}
                className="wp-hit"
                onClick={() => shell.openDestination(destinationForDocRef({ id: h.docId, title: h.title }))}
              >
                <span className="wp-hit__title">{h.title}</span>
                <span className="wp-hit__snippet">{h.snippet}</span>
              </button>
            ))
          ) : (
            <p className="wp-featured__msg">{search.loading ? 'Searching…' : 'No matches.'}</p>
          )}
        </div>
      ) : loading ? (
        <p className="wp-featured__msg">Loading…</p>
      ) : (
        sections.map((s) => (
          <section key={s.collection.id} className="wp-sec">
            <h3 className="wp-sec__head">{s.collection.title}</h3>
            <div className="wp-sec__row">
              {s.docs.length ? (
                s.docs.map((d) => <DocTile key={d.id} doc={d} collectionId={s.collection.id} />)
              ) : (
                <span className="wp-featured__msg">Empty</span>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
