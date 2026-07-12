import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV } from '@/app/nav';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** A working slide-in drawer: backdrop + Escape close, body-scroll lock, and
 * links that navigate then close. */
export function MobileMenu({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`drawer ${open ? 'drawer--open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer__head">
          <span className="brand__name">sks17</span>
          <button type="button" className="menu-btn" aria-label="Close menu" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="drawer__nav" aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'drawer__link' + (isActive ? ' active' : '')}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
