import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

/** Header breadcrumb trail. In production the trail comes from the GraphView API. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="sep" aria-hidden="true">
              /
            </span>
          )}
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="current">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
