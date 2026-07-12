import { useWorkspaceStore } from '../store';

const LABEL: Record<string, string> = {
  left: 'Snap left half',
  right: 'Snap right half',
  'bottom-left': 'Snap bottom-left',
  'bottom-right': 'Snap bottom-right',
};

/** Snap/floating placement preview (rendered inside the stage). */
export function SnapPreview() {
  const preview = useWorkspaceStore((s) => s.snapPreview);
  if (!preview || preview.kind === 'tab') return null;
  const { rect, kind } = preview;
  return (
    <div className="wp-snap-preview" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
      <span className="wp-snap-preview__label">{LABEL[kind] ?? kind}</span>
    </div>
  );
}

/** Tab-docking preview — highlights the top organizer strip only. */
export function TabDockHighlight() {
  const isTab = useWorkspaceStore((s) => s.snapPreview?.kind === 'tab');
  if (!isTab) return null;
  return (
    <div className="wp-tabdock" aria-hidden="true">
      <span className="wp-tabdock__label">Dock as tab</span>
    </div>
  );
}
