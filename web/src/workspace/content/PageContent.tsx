import type { ReactElement } from 'react';
import { useWorkspaceStore } from '../store';

/** Bespoke, non-markdown pages that live inside the workspace (e.g. Contact). */
function ContactContent(): ReactElement {
  return (
    <div className="wp-reader">
      <h2 className="md-h">Contact</h2>
      <p className="md-p">
        Please contact me if you would like an up to date resume. I'm always open to collaborate!
      </p>
      <p className="md-p">
        <a className="md-a" href="mailto:sks17@outlook.com">sks17@outlook.com</a> ·{' '}
        <a className="md-a" href="https://github.com/sks17" target="_blank" rel="noreferrer">GitHub</a> ·{' '}
        <a className="md-a" href="https://www.linkedin.com/in/saksham-singh-a08a43282/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </p>
    </div>
  );
}

const PAGES: Record<string, () => ReactElement> = {
  contact: ContactContent,
};

export function PageContent({ panelId }: { panelId: string }) {
  const component = useWorkspaceStore((s) => (s.panels[panelId]?.data?.component as string) ?? '');
  const Component = PAGES[component];
  return Component ? <Component /> : <div className="wp-reader wp-reader--empty">Unknown page.</div>;
}
