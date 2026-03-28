import MenuBar from './menubar/MenuBar'
import Dock from './dock/Dock'
import WindowLayer from './window/WindowLayer'

export default function Desktop() {
  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
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
