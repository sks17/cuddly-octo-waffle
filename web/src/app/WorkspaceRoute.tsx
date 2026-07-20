import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { shell } from '@/workspace/shell/controller';

/**
 * The element every content route renders. It draws nothing — it syncs the
 * current route into the shared workspace (open a destination, or return to
 * centered). All explorer/document behavior lives in the shell, not here.
 */
export function WorkspaceRoute() {
  const { pathname } = useLocation();
  useEffect(() => {
    shell.syncRoute(pathname);
  }, [pathname]);
  return null;
}
