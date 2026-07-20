import { useState } from 'react';
import { useShellStore } from '@/workspace/shell/store';
import { shell } from '@/workspace/shell/controller';
import { Workspace } from '@/workspace/components/Workspace';

/**
 * The ONE persistent workspace instance. Mounted once in the app shell so route
 * changes never remount Dockview/the explorer. It renders a centered island that
 * animates to a full-width, full-height workspace when content opens.
 */
export function WorkspaceShell() {
  // Restore explorer state once, during render, before any child effects run.
  useState(() => {
    shell.init();
  });
  const presentation = useShellStore((s) => s.presentation);
  const layout = useShellStore((s) => s.layout);

  return (
    <div className="wp-shell" data-presentation={presentation} data-layout={layout}>
      <div className="wp-shell__frame">
        <Workspace variant="content" onReady={() => shell.reconcile()} />
      </div>
    </div>
  );
}
