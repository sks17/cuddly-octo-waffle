/** Single source of truth for primary navigation (used by nav + drawer). */
export interface NavItem {
  to: string;
  label: string;
}

export const NAV: NavItem[] = [
  { to: '/work', label: 'Work' },
  { to: '/writing', label: 'Writing' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/workspace', label: 'Workspace' },
];
