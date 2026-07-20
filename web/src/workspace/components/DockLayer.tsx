import { X } from 'lucide-react';
import {
  DockviewReact,
  themeAbyss,
  type DockviewReadyEvent,
  type IDockviewPanelHeaderProps,
  type IDockviewPanelProps,
} from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import { setDockApi } from '../refs';
import { workspace } from '../controller';
import type { WorkspaceVariant } from '../types';
import { startPanelDrag } from '../drag';
import { useWorkspaceStore } from '../store';
import { PanelBody } from './PanelBody';

const DRAG_THRESHOLD = 5;

/** Custom tab: click activates; dragging past a threshold detaches to floating. */
function CustomTab(props: IDockviewPanelHeaderProps) {
  const panelId = props.api.id;
  const title = useWorkspaceStore((s) => s.panels[panelId]?.title) ?? panelId;

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let started = false;
    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    const onMove = (ev: PointerEvent) => {
      if (started) return;
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > DRAG_THRESHOLD) {
        started = true;
        cleanup();
        startPanelDrag(panelId, ev, { fromTab: true });
      }
    };
    const onUp = () => {
      cleanup();
      if (!started) props.api.setActive();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="wp-tab" data-panel-id={panelId} onPointerDown={onPointerDown} title={String(title)}>
      <span className="wp-tab__title">{title}</span>
      <button data-no-drag className="wp-tab__close" title="Close" onClick={() => workspace.closePanel(panelId)}>
        <X size={11} />
      </button>
    </div>
  );
}

const components = {
  workspacePanel: (props: IDockviewPanelProps) => {
    const panelId = (props.params as { panelId?: string }).panelId ?? props.api.id;
    return (
      <div className="wp-tabbed-slot">
        <div className="wp-card wp-card--tabbed" data-panel-id={panelId}>
          <PanelBody panelId={panelId} />
        </div>
      </div>
    );
  },
};

/**
 * Dockview drives the tabbed dock (the browser tab strip). Native DnD/floating
 * are disabled; the `workspace` controller + `startPanelDrag` own all movement,
 * so tab drag-out and drag-in are custom and precise.
 */
export function DockLayer({ variant = 'debug', onReady }: { variant?: WorkspaceVariant; onReady?: () => void }) {
  const handleReady = (event: DockviewReadyEvent) => {
    setDockApi(event.api);
    workspace.bind(event.api, variant);
    onReady?.();
  };

  return (
    <DockviewReact
      className="wp-dock"
      theme={themeAbyss}
      disableDnd
      disableFloatingGroups
      components={components}
      defaultTabComponent={CustomTab}
      onReady={handleReady}
    />
  );
}
