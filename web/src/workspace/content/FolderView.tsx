import { useWorkspaceStore } from '../store';
import { shell } from '../shell/controller';
import { useCollectionDocs } from '@/core/atlas/hooks';
import { atlas } from '@/core/atlas/client';
import type { AtlasDocument } from '@/core/atlas/types';
import { destinationForDoc } from './destination';
import { MiniMarkdown } from './MiniMarkdown';

function DocCard({ doc, collectionId }: { doc: AtlasDocument; collectionId: string }) {
  return (
    <button className="wp-tile" onClick={() => shell.openDestination(destinationForDoc(doc, collectionId))}>
      <img className="wp-tile__thumb" src={atlas.abs(doc.thumbnailUrl)} alt="" loading="lazy" />
      <span className="wp-tile__title">{doc.title}</span>
      {doc.description && <span className="wp-tile__desc">{doc.description}</span>}
    </button>
  );
}

/** A collection rendered as a grid of document cards (the /projects, /blogs… view). */
export function FolderView({ panelId }: { panelId: string }) {
  const collectionId = useWorkspaceStore((s) => (s.panels[panelId]?.data?.collectionId as string) ?? null);
  const { data, loading, error } = useCollectionDocs(collectionId ?? '');
  if (!collectionId) return null;

  return (
    <div className="wp-folder">
      {data?.collection?.description && <p className="wp-folder__desc">{data.collection.description}</p>}
      {loading && <p className="wp-featured__msg">Loading…</p>}
      {error && <p className="wp-featured__msg">Couldn't reach the Atlas ({error.message}).</p>}
      {data &&
        (data.docs.length ? (
          <div className="wp-sec__row">
            {data.docs.map((d) => (
              <DocCard key={d.id} doc={d} collectionId={collectionId} />
            ))}
          </div>
        ) : (
          <p className="wp-featured__msg">Nothing here yet.</p>
        ))}
      {data?.collection?.note && (
        <div className="wp-folder__note">
          <MiniMarkdown source={data.collection.note} onDocLink={(id) => shell.openDestination({ type: 'document', docId: id, selectedFileId: id })} />
        </div>
      )}
    </div>
  );
}
