import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV } from '@/app/nav';
import { Logo } from '@/components/ui/Logo';
import { ThemesButton } from '@/theme/ThemesButton';
import { MobileMenu } from './MobileMenu';

/**
 * Sticky application taskbar — the only page-level chrome above the workspace.
 * Sticky (never fixed), so the workspace offset by --taskbar-h begins below it.
 */
export function AppTaskbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 h-[var(--taskbar-h)] border-b border-border bg-taskbar backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-full w-full max-w-[var(--island-max)] items-center gap-2 px-5">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground" aria-label="Home">
            <Logo size={24} className="flex-none" />
            <span className="text-[15px]">sks17</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-[13.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                    isActive && 'bg-accent text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <ThemesButton />
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-accent md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
