import { Link } from 'react-router-dom';
import { WallpaperArt } from '@/components/wallpaper/WallpaperArt';
import { Workspace } from '@/workspace/components/Workspace';
import '@/workspace/workspace.css';

/**
 * Standalone, full-screen "browser". The initial section is the wallpaper
 * "before the browser"; scrolling past it reveals the sticky workspace and its
 * thin tab bar.
 */
export function WorkspacePage() {
  return (
    <div className="wp-page">
      <section className="wp-intro">
        <WallpaperArt seed={7} blur={3} className="wp-intro__art" />
        <div className="wp-intro__scrim" />
        <Link to="/" className="wp-intro__back">
          ← Back to site
        </Link>
        <div className="wp-intro__copy">
          <p className="eyebrow">Workspace</p>
          <h1 className="wp-intro__title">The browser</h1>
          <p className="wp-intro__blurb">
            A tabbed, floating, snappable panel surface over the wallpaper. Scroll down to enter —
            the thin tab bar appears as you reach the workspace.
          </p>
          <div className="wp-intro__hint">↓ scroll to enter</div>
        </div>
      </section>

      <Workspace />
    </div>
  );
}
