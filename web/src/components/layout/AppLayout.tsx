import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Ambient } from './Ambient';
import { AppTaskbar } from './AppTaskbar';
import { Footer } from './Footer';
import { WorkspaceShell } from './WorkspaceShell';
import { HomeIntro } from '@/pages/home/HomeIntro';
import { ChatDock } from '@/features/chat/ChatDock';

/**
 * App shell: ambient backdrop, sticky taskbar, and the ONE persistent workspace.
 * `<Outlet/>` renders `<WorkspaceRoute/>` (which syncs the route into the shell);
 * the home intro + description island render in-flow above the workspace on `/`.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  // Every route navigation lands at the top (before paint, so no scrolled-down
  // flash carried over from the previous page). Opening content within a route is
  // not a navigation — the shell's pin handles that.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Ambient />
      <AppTaskbar />
      <main className="app-main">
        <Outlet />
        {isHome && <HomeIntro />}
        <WorkspaceShell />
      </main>
      <Footer />
      <ChatDock />
    </div>
  );
}
