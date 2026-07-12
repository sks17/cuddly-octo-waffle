import { useRef } from 'react';
import { GripVertical, Maximize2, X } from 'lucide-react';
import { useWorkspaceStore } from '../store';
import { workspace } from '../controller';
import { startPanelDrag } from '../drag';
import { PanelBody } from './PanelBody';

const MIN_W = 240;
const MIN_H = 150;
const HANDLES = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'] as const;

/** A movable/resizable tool window (floating or snapped panel). */
export function FloatingWindow({ panelId }: { panelId: string }) {
  const p = useWorkspaceStore((s) => s.panels[panelId]);
  const geom = useRef({ x: 0, y: 0, width: 0, height: 0 });

  if (!p || p.x == null || p.y == null || p.width == null || p.height == null) return null;

  const onHeaderDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.preventDefault();
    startPanelDrag(panelId, e);
  };

  const beginResize = (dir: (typeof HANDLES)[number]) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    workspace.focusPanel(panelId);
    const cur = useWorkspaceStore.getState().panels[panelId];
    if (!cur || cur.x == null || cur.y == null || cur.width == null || cur.height == null) return;
    const start = { x: cur.x, y: cur.y, width: cur.width, height: cur.height };
    const sx = e.clientX;
    const sy = e.clientY;
    geom.current = { ...start };
    const onMove = (ev: PointerEvent) => {
      const area = useWorkspaceStore.getState().workspaceRect;
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      let { x, y, width, height } = start;
      if (dir.includes('e')) width = start.width + dx;
      if (dir.includes('s')) height = start.height + dy;
      if (dir.includes('w')) { width = start.width - dx; x = start.x + dx; }
      if (dir.includes('n')) { height = start.height - dy; y = start.y + dy; }
      if (width < MIN_W) { if (dir.includes('w')) x = start.x + (start.width - MIN_W); width = MIN_W; }
      if (height < MIN_H) { if (dir.includes('n')) y = start.y + (start.height - MIN_H); height = MIN_H; }
      x = Math.max(0, x);
      y = Math.max(0, y);
      width = Math.min(width, area.width - x);
      height = Math.min(height, area.height - y);
      geom.current = { x, y, width, height };
      workspace.setGeometry(panelId, 'floating', { x, y, width, height });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      workspace.commitGeometry(panelId, geom.current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={`wp-card wp-window ${p.isActive ? 'is-active' : ''} ${p.mode !== 'floating' ? 'is-snapped' : ''}`}
      style={{ left: p.x, top: p.y, width: p.width, height: p.height, zIndex: p.zIndex ?? 1 }}
      data-panel-id={panelId}
      onPointerDown={() => workspace.focusPanel(panelId)}
    >
      <div className="wp-winbar" onPointerDown={onHeaderDown}>
        <span className="wp-winbar__grip" aria-hidden="true">
          <GripVertical size={13} />
        </span>
        <span className="wp-winbar__title">{p.title}</span>
        <span className="wp-winbar__spacer" />
        <button data-no-drag className="wp-winbtn" title="Maximize" onClick={() => workspace.maximizePanel(panelId)}>
          <Maximize2 size={12} />
        </button>
        <button data-no-drag className="wp-winbtn" title="Close" onClick={() => workspace.closePanel(panelId)}>
          <X size={13} />
        </button>
      </div>
      <div className="wp-window__content">
        <PanelBody panelId={panelId} />
      </div>
      {HANDLES.map((h) => (
        <div key={h} className={`wp-resize wp-resize--${h}`} onPointerDown={beginResize(h)} />
      ))}
    </div>
  );
}
