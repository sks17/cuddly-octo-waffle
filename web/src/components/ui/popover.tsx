import * as React from 'react';
import { Popover as Base } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

export const Popover = Base.Root;
export const PopoverTrigger = Base.Trigger;

interface ContentProps extends React.ComponentProps<typeof Base.Popup> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

/** Themed popover surface (portal + positioner + popup). Follows the active theme. */
export function PopoverContent({
  className,
  side = 'bottom',
  align = 'end',
  sideOffset = 8,
  children,
  ...props
}: ContentProps) {
  return (
    <Base.Portal>
      <Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <Base.Popup
          className={cn(
            'origin-[var(--transform-origin)] overflow-hidden rounded-lg border border-border bg-surface-elevated text-foreground shadow-[0_16px_50px_-12px_var(--panel-shadow)] outline-none',
            'transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  );
}
