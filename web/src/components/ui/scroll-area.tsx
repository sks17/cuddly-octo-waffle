import * as React from 'react';
import { ScrollArea as Base } from '@base-ui/react/scroll-area';
import { cn } from '@/lib/utils';

interface Props extends React.ComponentProps<typeof Base.Root> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  viewportClassName?: string;
  children: React.ReactNode;
}

/**
 * Reusable themed scroll area (Base UI). Thin, unobtrusive, appears on
 * hover/scroll, grows on hover — used everywhere the workspace scrolls so no
 * native browser scrollbar is shown.
 */
export function ScrollArea({ className, viewportClassName, orientation = 'vertical', children, ...props }: Props) {
  const vertical = orientation === 'vertical' || orientation === 'both';
  const horizontal = orientation === 'horizontal' || orientation === 'both';
  return (
    <Base.Root className={cn('wp-scroll', className)} {...props}>
      <Base.Viewport className={cn('wp-scroll__viewport', viewportClassName)}>{children}</Base.Viewport>
      {vertical && (
        <Base.Scrollbar orientation="vertical" className="wp-scroll__bar">
          <Base.Thumb className="wp-scroll__thumb" />
        </Base.Scrollbar>
      )}
      {horizontal && (
        <Base.Scrollbar orientation="horizontal" className="wp-scroll__bar">
          <Base.Thumb className="wp-scroll__thumb" />
        </Base.Scrollbar>
      )}
      <Base.Corner />
    </Base.Root>
  );
}
