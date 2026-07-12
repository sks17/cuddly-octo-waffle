import { useLayoutEffect, useMemo, useRef } from 'react';
import { Minimize2, X } from 'lucide-react';
import { useWorkspaceStore } from '../store';
import { workspace } from '../controller';
import { getScrollFocus, setRootEl, setScrollFocus, setWorkspaceEl } from '../refs';
import { isFloatingLike } from '../types';
import { WorkspaceBackground } from './WorkspaceBackground';
import { DockLayer } from './DockLayer';
import { FloatingWindow } from './FloatingWindow';
import { SnapPreview, TabDockHighlight } from './SnapPreview';
import { PanelBody } from './PanelBody';
import { CommandLine } from './CommandLine';

function MaximizedWindow({ panelId }: { panelId: string }) {
  const p = useWorkspaceStore((s) => s.panels[panelId]);
  if (!p) return null;
  return (
    <div className="wp-card wp-max is-active" data-panel-id={panelId}>
      <div className="wp-winbar">
        <span className="wp-winbar__title">{p.title} — maximized</span>
        <span className="wp-winbar__spacer" />
        <button className="wp-winbtn" title="Restore" onClick={() => workspace.restorePanel(panelId)}>
          <Minimize2 size={12} />
        </button>
        <button className="wp-winbtn" title="Close" onClick={() => workspace.closePanel(panelId)}>
          <X size={13} />
        </button>
      </div>
      <div className="wp-window__content">
        <PanelBody panelId={panelId} />
      </div>
    </div>
  );
}

export function Workspace() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panels = useWorkspaceStore((s) => s.panels);
  const maximizedId = useWorkspaceStore((s) => s.maximizedId);

  const floatingIds = useMemo(
    () => Object.values(panels).filter((p) => isFloatingLike(p.mode) && p.id !== maximizedId).map((p) => p.id),
    [panels, maximizedId],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const el = stageRef.current;
    setRootEl(root);
    if (!el || !root) return;
    setWorkspaceEl(el);

    const update = () => {
      const r = el.getBoundingClientRect();
      useWorkspaceStore.setState({ workspaceRect: { x: 0, y: 0, width: r.width, height: r.height } });
      workspace.reflow();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    // Scroll focus follows the last click, not the hover position.
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.wp-cli')) {
        setScrollFocus({ kind: 'cli' });
        return;
      }
      const panelEl = t.closest<HTMLElement>('[data-panel-id]');
      if (panelEl?.dataset.panelId) setScrollFocus({ kind: 'panel', id: panelEl.dataset.panelId });
    };
    const onWheel = (e: WheelEvent) => {
      const focus = getScrollFocus();
      if (!focus) return;
      const viewport =
        focus.kind === 'cli'
          ? root.querySelector<HTMLElement>('.wp-cli__log .wp-scroll__viewport')
          : root.querySelector<HTMLElement>(`[data-panel-id="${CSS.escape(focus.id)}"] .wp-scroll__viewport`);
      if (!viewport) return;
      const maxTop = viewport.scrollHeight - viewport.clientHeight;
      const maxLeft = viewport.scrollWidth - viewport.clientWidth;
      const canV = (e.deltaY < 0 && viewport.scrollTop > 0) || (e.deltaY > 0 && viewport.scrollTop < maxTop - 0.5);
      const canH = (e.deltaX < 0 && viewport.scrollLeft > 0) || (e.deltaX > 0 && viewport.scrollLeft < maxLeft - 0.5);
      if (!canV && !canH) return; // at boundary → let the event chain (e.g. back to the intro)
      if (canV) viewport.scrollTop += e.deltaY;
      if (canH) viewport.scrollLeft += e.deltaX;
      e.preventDefault();
    };
    root.addEventListener('pointerdown', onDown, true);
    root.addEventListener('wheel', onWheel, { capture: true, passive: false });

    return () => {
      ro.disconnect();
      root.removeEventListener('pointerdown', onDown, true);
      root.removeEventListener('wheel', onWheel, true);
      setWorkspaceEl(null);
      setRootEl(null);
      setScrollFocus(null);
    };
  }, []);

  return (
    <section className="wp-root" aria-label="Workspace" ref={rootRef}>
      <WorkspaceBackground />
      <DockLayer />
      <TabDockHighlight />
      <div className="wp-stage" ref={stageRef}>
        {floatingIds.map((id) => (
          <FloatingWindow key={id} panelId={id} />
        ))}
        <SnapPreview />
      </div>
      {maximizedId && <MaximizedWindow panelId={maximizedId} />}
      <CommandLine />
    </section>
  );
}
