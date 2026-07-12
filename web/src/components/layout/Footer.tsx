/** Placeholder footer. Links are dead in the wireframe. */
export function Footer() {
  const columns = [
    { heading: 'Site', links: ['Home', 'Work', 'Writing', 'Projects'] },
    { heading: 'More', links: ['About', 'Résumé', 'Now', 'Uses'] },
    { heading: 'Elsewhere', links: ['GitHub', 'X', 'LinkedIn', 'Email'] },
  ];
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__name">sks17</span>
          </span>
          <p>Quant, builder, and occasional writer — a workspace for documents, graphs, and half-finished ideas.</p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h4>{col.heading}</h4>
            {col.links.map((label) => (
              <a key={label} href="#" className="f-link">
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__bar">
        <span>© 2026 Saksham Singh</span>
        <span className="spacer" />
        <span>Placeholder footer — wireframe</span>
      </div>
    </footer>
  );
}
