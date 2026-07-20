import { useShellStore } from '../shell/store';
import { shell } from '../shell/controller';
import { DEFAULT_EXPLORER_W } from '../shell/types';

/** Draggable divider that resizes the explorer (double-click resets). */
export function Splitter() {
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = useShellStore.getState().explorer.width;
    const onMove = (ev: PointerEvent) => shell.setExplorerWidth(startW + (ev.clientX - startX));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.cursor = '';
    };
    document.body.style.cursor = 'col-resize';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className="wp-splitter"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize explorer"
      onPointerDown={onPointerDown}
      onDoubleClick={() => shell.setExplorerWidth(DEFAULT_EXPLORER_W)}
    >
      <span className="wp-splitter__grip" aria-hidden="true" />
    </div>
  );
}
