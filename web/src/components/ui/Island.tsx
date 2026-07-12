import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  sub?: string;
  more?: string;
  className?: string;
  children: ReactNode;
}

/** A content island — an opaque shadcn Card floating on the ambient wallpaper. */
export function Island({ title, sub, more, className, children }: Props) {
  const hasHead = Boolean(title || more);
  return (
    <Card className={cn('rounded-[4px] border-border/60 px-[22px] py-5', className)}>
      {hasHead && (
        <div className="mb-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          {more && (
            <a href="#" className="ml-auto text-xs text-brand hover:underline">
              {more}
            </a>
          )}
        </div>
      )}
      {children}
    </Card>
  );
}
