import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WallpaperArt } from '@/components/wallpaper/WallpaperArt';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** The Netflix-style hero: determinant wallpaper + scrim + hero copy. */
export function Billboard() {
  return (
    <header className="billboard">
      <WallpaperArt seed={7} blur={3} className="billboard__wp" />
      <div className="bb-scrim" />
      <div className="bb-hero">
        <p className="eyebrow">Quant · Data · Motion</p>
        <h1 className="bb-title">Saksham Singh</h1>
        <p className="bb-blurb">
          I build things that are simple on the surface and dense underneath — trading systems,
          data tools, and the mathematics of moving pictures.
        </p>
        <div className="bb-actions">
          <Link className={buttonVariants({ size: 'lg' })} to="/work">
            View work
            <ArrowRight />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-white/25 text-white hover:bg-white/10 hover:text-white',
            )}
            to="/writing"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </header>
  );
}
