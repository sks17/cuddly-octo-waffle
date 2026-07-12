import { PageHeader } from './PageHeader';
import { Island } from './Island';
import { CardGrid } from './Placeholder';

interface Props {
  title: string;
  section: string;
  blurb: string;
  count?: number;
}

/** Shared scaffold for the collection-style inner pages (Work / Writing / Projects). */
export function SectionScaffold({ title, section, blurb, count = 6 }: Props) {
  return (
    <>
      <PageHeader title={title} section={section} />
      <div className="content">
        <Island>
          <p className="island__sub" style={{ marginBottom: 14 }}>
            {blurb}
          </p>
          <CardGrid count={count} />
        </Island>
      </div>
    </>
  );
}
