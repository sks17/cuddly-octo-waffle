import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { NAV } from '@/app/nav';
import { Logo } from '@/components/ui/Logo';
import { MobileMenu } from './MobileMenu';

interface Props {
  /** Transparent over the billboard (home), solid elsewhere. */
  transparent: boolean;
}

export function TopBar({ transparent }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className={`topbar ${transparent ? 'topbar--transparent' : 'topbar--solid'}`}>
        <div className="topbar__inner">
          <Link to="/" className="brand" aria-label="Home">
            <Logo size={24} className="brand__logo" />
            <span className="brand__name">sks17</span>
          </Link>

          <nav className="nav-desktop" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
