import { WallpaperArt } from '@/components/wallpaper/WallpaperArt';

/** The persistent workspace wallpaper (the app's second wallpaper, seed 42). */
export function WorkspaceBackground() {
  return (
    <div className="wp-bg" aria-hidden="true">
      <WallpaperArt seed={42} blur={26} className="wp-bg__art" />
      <div className="wp-bg__tint" />
    </div>
  );
}
