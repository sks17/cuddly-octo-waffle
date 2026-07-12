import { WallpaperArt } from '@/components/wallpaper/WallpaperArt';

/** Fixed, heavily-blurred wallpaper backdrop that shows through island margins. */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <WallpaperArt seed={42} blur={34} className="ambient__wp" />
      <div className="ambient__tint" />
    </div>
  );
}
