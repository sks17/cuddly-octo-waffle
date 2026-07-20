import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { Minimize2, PanelLeft, X } from 'lucide-react';
import { useWorkspaceStore } from '../store';
import { workspace } from '../controller';
import { getScrollFocus, setRootEl, setScrollFocus, setTabStripEl, setWorkspaceEl } from '../refs';
import { isFloatingLike, type WorkspaceVariant } from '../types';
import { WorkspaceBackground } from './WorkspaceBackground';
import { DockLayer } from './DockLayer';
import { FloatingWindow } from './FloatingWindow';
import { SnapPreview, TabDockHighlight } from './SnapPreview';
import { PanelBody } from './PanelBody';
import { CommandLine } from '../debug/CommandLine';
import { ExplorerSidebar } from '../content/ExplorerSidebar';
import { Splitter } from './Splitter';
import { useShellStore } from '../shell/store';
import { shell } from '../shell/controller';
import { installScrollHandoff } from '../scrollHandoff';

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

/**
 * Narrow viewports can't afford a permanent explorer column, so it becomes a
 * drawer: this is its handle and its scrim. Both are display:none above the
 * breakpoint, where the sidebar is simply always there.
 */
function ExplorerDrawerControls({ open }: { open: boolean }) {
  return (
    <>
      <button
        type="button"
        className="wp-side-toggle"
        aria-expanded={open}
        aria-label={open ? 'Hide files' : 'Show files'}
        onClick={() => shell.setExplorerOpen(!open)}
      >
        <PanelLeft size={14} />
        <span>Files</span>
      </button>
      {open && (
        <button
          type="button"
          className="wp-side-scrim"
          tabIndex={-1}
          aria-label="Close files"
          onClick={() => shell.setExplorerOpen(false)}
        />
      )}
    </>
  );
}

interface WorkspaceProps {
  /** 'debug' = the standalone /workspace (console + scratch panels); 'content' = the homepage. */
  variant?: WorkspaceVariant;
  /** Fired after Dockview binds — the shell uses it to (re)mount the active destination. */
  onReady?: () => void;
}

export function Workspace({ variant = 'debug', onReady }: WorkspaceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const panels = useWorkspaceStore((s) => s.panels);
  const maximizedId = useWorkspaceStore((s) => s.maximizedId);
  const explorerWidth = useShellStore((s) => s.explorer.width);
  const explorerOpen = useShellStore((s) => s.explorerOpen);
  const content = variant === 'content';

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
    setTabStripEl(tabStripRef.current);

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
    // Debug workspace: wheel is redirected to the last-clicked panel's viewport.
    const onWheelDebug = (e: WheelEvent) => {
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
      if (!canV && !canH) return; // at boundary → let the event chain (e.g. back to the page)
      if (canV) viewport.scrollTop += e.deltaY;
      if (canH) viewport.scrollLeft += e.deltaX;
      e.preventDefault();
    };
    root.addEventListener('pointerdown', onDown, true);

    // Content workspace: intent-based scroll handoff to the page (§ scroll handoff).
    let removeScroll: () => void;
    if (content) {
      removeScroll = installScrollHandoff(root);
    } else {
      root.addEventListener('wheel', onWheelDebug, { capture: true, passive: false });
      removeScroll = () => root.removeEventListener('wheel', onWheelDebug, true);
    }

    return () => {
      ro.disconnect();
      root.removeEventListener('pointerdown', onDown, true);
      removeScroll();
      setWorkspaceEl(null);
      setRootEl(null);
      setTabStripEl(null);
      setScrollFocus(null);
    };
  }, [content]);

  const className = `wp-root${content ? ' wp-root--content' : ''}`;
  const style = content ? ({ '--wp-explorer-w': `${explorerWidth}px` } as CSSProperties) : undefined;

  return (
    <section
      className={className}
      style={style}
      aria-label="Workspace"
      ref={rootRef}
      data-explorer={content ? (explorerOpen ? 'open' : 'closed') : undefined}
    >
      <WorkspaceBackground />
      {content && <ExplorerSidebar />}
      {content && <Splitter />}
      {content && <ExplorerDrawerControls open={explorerOpen} />}
      <div className="wp-main">
        <DockLayer variant={variant} onReady={onReady} />
        {/* Explicit tab-dock geometry: always present (docking works with 0 tabs),
            and only THIS strip qualifies as a dock target — never a document body. */}
        <div className="wp-tabstrip-ref" data-tabdock aria-hidden="true" ref={tabStripRef} />
        <TabDockHighlight />
        <div className="wp-stage" ref={stageRef}>
          {floatingIds.map((id) => (
            <FloatingWindow key={id} panelId={id} />
          ))}
          <SnapPreview />
        </div>
      </div>
      {maximizedId && <MaximizedWindow panelId={maximizedId} />}
      {!content && <CommandLine />}
    </section>
  );
}
