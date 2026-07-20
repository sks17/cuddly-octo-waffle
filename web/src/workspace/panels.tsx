import { useWorkspaceStore } from './store';
import { DebugPanelContent } from './debug/DebugPanels';
import { FeaturedPanel } from './content/FeaturedPanel';
import { DocView } from './content/DocView';
import { FolderView } from './content/FolderView';
import { CompiledPanel } from './content/CompiledPanel';
import { PageContent } from './content/PageContent';

/** Routes a panel to its content: content panels (homepage) or debug panels. */
export function PanelTypeContent({ panelId }: { panelId: string }) {
  const type = useWorkspaceStore((s) => s.panels[panelId]?.type);
  if (!type) return null;

  switch (type) {
    case 'featured':
      return <FeaturedPanel panelId={panelId} />;
    case 'reader':
      return <DocView panelId={panelId} />;
    case 'folder':
      return <FolderView panelId={panelId} />;
    case 'compiled':
      return <CompiledPanel panelId={panelId} />;
    case 'page':
      return <PageContent panelId={panelId} />;
    default:
      return <DebugPanelContent panelId={panelId} />;
  }
}
