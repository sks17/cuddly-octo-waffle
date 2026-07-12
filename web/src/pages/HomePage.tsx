import { Billboard } from '@/components/layout/Billboard';
import { Island } from '@/components/ui/Island';
import { CardGrid, SkeletonLines } from '@/components/ui/Placeholder';

export function HomePage() {
  return (
    <>
      <Billboard />
      <div className="content">
        <Island title="Selected work" sub="A few things worth showing." more="All work →">
          <CardGrid count={3} />
        </Island>
        <Island title="Writing" sub="Notes on maths, markets, and making." more="All writing →">
          <SkeletonLines count={4} />
        </Island>
      </div>
    </>
  );
}
