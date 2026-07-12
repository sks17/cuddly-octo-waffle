import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface Props {
  title: string;
  section: string;
}

export function PageHeader({ title, section }: Props) {
  return (
    <div className="page-header">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: section }]} />
      <h1 className="page-title">{title}</h1>
    </div>
  );
}
