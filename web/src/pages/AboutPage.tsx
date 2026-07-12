import { PageHeader } from '@/components/ui/PageHeader';
import { Island } from '@/components/ui/Island';

export function AboutPage() {
  return (
    <>
      <PageHeader title="About" section="About" />
      <div className="content">
        <Island>
          <div className="prose">
            <p>
              This is a wireframe. In the real site this page renders markdown supplied by the Atlas
              service, and custom blocks (like the billboard) are registered components.
            </p>
            <p>
              Quant, builder, and occasional writer. Most of the site is data — documents, links, and
              a navigable graph — with only the workspace and chat as hands-on features.
            </p>
          </div>
        </Island>
      </div>
    </>
  );
}
