import MenuBar from './menubar/MenuBar'
import Dock from './dock/Dock'
import WindowLayer from './window/WindowLayer'
import { useWallpaperStore } from '../wallpaper/wallpaperStore'
import { useWallpaperScheduler } from '../wallpaper/useWallpaperScheduler'

const FALLBACK_BG = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'

export default function Desktop() {
  useWallpaperScheduler()
  const wallpaperUrl = useWallpaperStore((s) => s.url)

  const backgroundStyle = wallpaperUrl
    ? {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1.5s ease',
      }
    : { background: FALLBACK_BG }

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      style={backgroundStyle}
    >
      {/* Menu Bar */}
      <MenuBar />

      {/* Window Layer */}
      <div className="absolute inset-0 top-7">
        <WindowLayer />
      </div>

      {/* Dock */}
      <Dock />
    </div>
  )
}
