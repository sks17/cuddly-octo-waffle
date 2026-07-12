import { useWorkspaceStore } from '../store';
import { workspace } from '../controller';
import { PanelTypeContent } from '../panels';
import { ScrollArea } from '@/components/ui/scroll-area';

/** Shared inner content for a panel in any mode (tabbed/floating/maximized). */
export function PanelBody({ panelId }: { panelId: string }) {
  const p = useWorkspaceStore((s) => s.panels[panelId]);
  if (!p) return null;
  const maxed = p.mode === 'maximized';

  return (
    <div className="wp-body">
      <div className="wp-body__meta">
        <span className="wp-body__type">{p.type}</span>
        <code className="wp-body__id">{p.id}</code>
        <span className="wp-body__mode">{p.mode}</span>
      </div>

      <ScrollArea className="wp-body__content">
        <PanelTypeContent panelId={panelId} />
      </ScrollArea>

      <div className="wp-body__actions">
        <button
          className="wp-btn wp-btn--primary"
          onClick={() => (maxed ? workspace.restorePanel(p.id) : workspace.maximizePanel(p.id))}
        >
          {maxed ? 'Restore' : 'Maximize'}
        </button>
        {p.mode !== 'floating' && !maxed && (
          <button className="wp-btn" onClick={() => workspace.floatPanel(p.id)}>
            Float
          </button>
        )}
        {p.mode !== 'tabbed' && !maxed && (
          <button className="wp-btn" onClick={() => workspace.tabPanel(p.id)}>
            Tab
          </button>
        )}
        <button className="wp-btn" onClick={() => workspace.closePanel(p.id)}>
          Close
        </button>
      </div>
    </div>
  );
}
