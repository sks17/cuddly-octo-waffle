import { useWorkspaceStore } from '../store';
import { shell } from '../shell/controller';
import { useCollectionDocs } from '@/core/atlas/hooks';
import { compileCollectionMarkdown } from './destination';
import { MiniMarkdown } from './MiniMarkdown';

const openDoc = (id: string) => shell.openDestination({ type: 'document', docId: id, selectedFileId: id });

/** A collection compiled into one markdown page (e.g. Links) — items open in-workspace. */
export function CompiledPanel({ panelId }: { panelId: string }) {
  const collectionId = useWorkspaceStore((s) => (s.panels[panelId]?.data?.collectionId as string) ?? null);
  const { data, loading, error } = useCollectionDocs(collectionId ?? '');
  if (!collectionId) return null;
  if (loading) return <div className="wp-reader wp-reader--empty">Loading…</div>;
  if (error) return <div className="wp-reader wp-reader--empty">Couldn't reach the Atlas.</div>;

  const md = data ? compileCollectionMarkdown(data.collection?.title ?? 'Page', data.collection?.description, data.docs) : '';
  return (
    <article className="wp-reader">
      <MiniMarkdown source={md} onDocLink={openDoc} />
    </article>
  );
}
