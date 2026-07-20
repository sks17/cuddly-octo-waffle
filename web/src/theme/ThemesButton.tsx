import { Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from './context';
import { ThemeMenu } from './ThemeMenu';

/** Top-right taskbar control that opens the MonkeyType theme menu. */
export function ThemesButton() {
  const { theme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[13px] font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Themes — current theme ${theme.name}`}
        title={`Theme: ${theme.name}`}
      >
        <Palette size={15} className="text-brand" />
        <span className="hidden sm:inline">Themes</span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={10}>
        <ThemeMenu />
      </PopoverContent>
    </Popover>
  );
}
