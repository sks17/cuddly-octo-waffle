import { FileText } from 'lucide-react';
import { useWorkspaceStore } from '../store';
import { shell } from '../shell/controller';
import { useNarrow } from '../useNarrow';
import { useDocMarkdown, useDocument } from '@/core/atlas/hooks';
import { atlas } from '@/core/atlas/client';
import { isPdfFile, isVideoFile, previewFileFor } from '@/core/atlas/meta';
import type { WorkspaceLayout } from '../types';
import { MiniMarkdown } from './MiniMarkdown';

const openDoc = (id: string) => shell.openDestination({ type: 'document', docId: id, selectedFileId: id });

/** Renders a document — markdown or PDF, standard or preview-left. */
export function DocView({ panelId }: { panelId: string }) {
  const docId = useWorkspaceStore((s) => (s.panels[panelId]?.data?.docId as string) ?? null);
  const layout = useWorkspaceStore((s) => (s.panels[panelId]?.data?.layout as WorkspaceLayout) ?? 'standard');
  const { data: doc } = useDocument(docId);
  const { data: md, loading, error } = useDocMarkdown(docId);
  const narrow = useNarrow();

  if (!docId) return <div className="wp-reader wp-reader--empty">Select a document from the Explorer.</div>;
  if (error) return <div className="wp-reader wp-reader--empty">Couldn't load this document.</div>;

  if (doc?.type === 'pdf') {
    // The manifest owns the body URL, so this works against both the live mock and the baked Atlas.
    const href = atlas.abs(doc.contentUrl);
    // Mobile browsers don't render PDFs in an iframe — offer the cover and a way out.
    if (narrow) {
      return (
        <div className="wp-pdf-card">
          <img className="wp-pdf-card__cover" src={atlas.abs(doc.thumbnailUrl)} alt="" />
          {doc.description && <p className="wp-doc__lede">{doc.description}</p>}
          <a className="wp-pdf-card__open" href={href} target="_blank" rel="noreferrer">
            <FileText size={14} />
            Open the PDF
          </a>
        </div>
      );
    }
    return <iframe className="wp-pdf" title={doc.title} src={href} />;
  }

  const body = loading ? (
    <div className="wp-reader wp-reader--empty">Loading…</div>
  ) : (
    <MiniMarkdown source={md ?? ''} onDocLink={openDoc} />
  );

  if (layout === 'preview-left' && doc) {
    const preview = previewFileFor(doc);
    const isVideo = !!preview && isVideoFile(preview);
    // A PDF preview is its own reader: the embedded viewer scrolls the pane's height.
    // Mobile browsers won't render one in an iframe, so there it becomes a link out.
    const pdf = preview && isPdfFile(preview) ? preview : undefined;
    const previewClass = pdf && narrow ? 'wp-doc__preview wp-doc__preview--pdf-link' : 'wp-doc__preview';
    return (
      <div className={pdf && !narrow ? 'wp-doc wp-doc--preview wp-doc--pdf' : 'wp-doc wp-doc--preview'}>
        <div className={previewClass}>
          {pdf ? (
            narrow ? (
              <a className="wp-pdf-card__open" href={atlas.abs(pdf.url)} target="_blank" rel="noreferrer">
                <FileText size={14} />
                Open the {pdf.title ?? 'PDF'}
              </a>
            ) : (
              // Fit-to-width in a column this narrow. Firefox's pdf.js honours both;
              // Chrome ignores them, which is why the pane itself is widened in CSS.
              <iframe className="wp-doc__pdf" title={pdf.title ?? doc.title} src={`${atlas.abs(pdf.url)}#view=FitH&pagemode=none`} />
            )
          ) : isVideo && preview ? (
            // The thumbnail doubles as the poster frame, so the pane fills before play.
            <video
              src={atlas.abs(preview.url)}
              poster={atlas.abs(doc.thumbnailUrl)}
              controls
              preload="metadata"
              playsInline
            />
          ) : (
            <img
              src={preview ? atlas.abs(preview.url) : atlas.abs(doc.thumbnailUrl)}
              alt={preview?.title ?? doc.title}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = atlas.abs(doc.thumbnailUrl);
                if (img.src !== fallback) img.src = fallback;
              }}
            />
          )}
        </div>
        <article className="wp-doc__aside wp-reader">
          {doc.description && <p className="wp-doc__lede">{doc.description}</p>}
          {body}
          {doc.tags.length > 0 && (
            <div className="wp-doc__tags">
              {doc.tags.map((t) => (
                <span key={t} className="wp-doc__tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return <article className="wp-reader">{body}</article>;
}
