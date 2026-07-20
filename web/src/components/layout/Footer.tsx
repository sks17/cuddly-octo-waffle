import { Link } from 'react-router-dom';

interface FooterLink {
  label: string;
  /** In-app route, or an absolute/mailto href for anything off-site. */
  to: string;
}

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Site',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Projects', to: '/projects' },
      { label: 'Experiences', to: '/experiences' },
      { label: 'Blogs', to: '/blogs' },
    ],
  },
  {
    heading: 'More',
    links: [
      { label: 'Links', to: '/links' },
      { label: 'Drafts', to: '/drafts' },
      // Résumés go stale; the contact page asks for one instead of serving an old PDF.
      { label: 'Résumé', to: '/contact' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Elsewhere',
    links: [
      { label: 'GitHub', to: 'https://github.com/sks17' },
      { label: 'LinkedIn', to: 'https://www.linkedin.com/in/saksham-singh-a08a43282/' },
      { label: 'Email', to: 'mailto:sks17@outlook.com' },
    ],
  },
];

const isExternal = (to: string) => /^(https?:|mailto:)/.test(to);

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__name">sks17</span>
          </span>
          <p>
            Saksham Singh — computer vision, AI safety, and full-stack work, kept in one workspace of
            documents, graphs and half-finished ideas.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4>{col.heading}</h4>
            {col.links.map((link) =>
              isExternal(link.to) ? (
                <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="f-link">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="f-link">
                  {link.label}
                </Link>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="footer__bar">
        <span>© 2026 Saksham Singh</span>
        <span className="spacer" />
      </div>
    </footer>
  );
}
