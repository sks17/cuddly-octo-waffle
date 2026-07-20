import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { WallpaperArt } from '@/components/wallpaper/WallpaperArt';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Scroll so the top of the viewport rests on the description island below the hero. */
function scrollToDescription() {
  const el = document.getElementById('home-description');
  if (!el) return;
  const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h'), 10) || 60;
  const target = Math.max(0, Math.round(window.scrollY + el.getBoundingClientRect().top - taskbarH));
  // Two-arg (instant) — native smooth scroll is unreliable in this app.
  window.scrollTo(0, target);
}

/** The Netflix-style hero: determinant wallpaper + scrim + hero copy. */
export function Billboard() {
  return (
    <header className="billboard">
      <WallpaperArt seed={7} blur={3} className="billboard__wp" />
      <div className="bb-scrim" />
      <div className="bb-hero">
        <p className="eyebrow">Fullstack Development · Computer Vision · AI Safety</p>
        <h1 className="bb-title">Hello</h1>
        <p className="bb-blurb">
          I'm Saksham Singh, a student at the University of Washington studying computer science
          &amp; engineering, mathematics and data science — passionate about computer vision and
          experienced in developing across the tech stack. I currently work in a fullstack
          and R&amp;D capacity for BioSyft, doing computer vision R&amp;D for pose segmentation and
          building a bioinformatics platform. I enjoy using maths and code to model and explore.
          Check out{' '}
          <a className="bb-blurb__link" href="https://graphview.org" target="_blank" rel="noreferrer">
            graphview.org
          </a>{' '}
          — my most recent consumer B2C.
        </p>
        <div className="bb-actions">
          <button type="button" className={buttonVariants({ size: 'lg' })} onClick={scrollToDescription}>
            Explore the workspace
            <ArrowDown />
          </button>
          <Link
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-white/25 text-white hover:bg-white/10 hover:text-white',
            )}
            to="/blogs"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </header>
  );
}
