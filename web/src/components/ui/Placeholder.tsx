import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Loading/skeleton placeholders — stand in for Atlas-supplied content. */

export function PlaceholderCard() {
  return (
    <Card className="flex flex-col gap-2.5 rounded-[4px] border-border/50 bg-white/[0.02] p-3">
      <div className="aspect-[16/10] rounded-[3px] border border-border/50 bg-gradient-to-br from-brand/20 to-brand-2/10" />
      <Skeleton className="h-3.5 w-[62%]" />
      <Skeleton className="h-2.5 w-[90%]" />
      <Skeleton className="h-2.5 w-[68%]" />
    </Card>
  );
}

export function CardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
      {Array.from({ length: count }, (_, i) => (
        <PlaceholderCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonLines({ count = 4 }: { count?: number }) {
  const widths = ['92%', '80%', '86%', '64%', '74%'];
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-2.5" style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  );
}
