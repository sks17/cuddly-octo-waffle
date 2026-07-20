/** Single source of truth for primary navigation (used by nav + drawer). */
export interface NavItem {
  to: string;
  label: string;
}

export const NAV: NavItem[] = [
  { to: '/projects', label: 'Projects' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/links', label: 'Links' },
  { to: '/drafts', label: 'Drafts' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
];
