import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Ambient } from './Ambient';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

/** App shell: fixed ambient backdrop, persistent top bar, routed page, footer. */
export function AppLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <Ambient />
      <TopBar transparent={isHome} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
