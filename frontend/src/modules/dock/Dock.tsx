import { useWindowStore } from '../../stores/windowStore'

const DOCK_APPS = [
  { id: 'finder', name: 'Finder', emoji: '📁' },
  { id: 'terminal', name: 'Terminal', emoji: '🖥️' },
  { id: 'text-edit', name: 'TextEdit', emoji: '📝' },
]

export default function Dock() {
  const openWindow = useWindowStore((s) => s.openWindow)

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div className="glass rounded-2xl px-3 py-2 flex items-end gap-2 shadow-dock">
        {DOCK_APPS.map((app) => (
          <button
            key={app.id}
            title={app.name}
            onClick={() => openWindow(app.id, app.name)}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                       hover:scale-125 transition-transform duration-150 cursor-pointer
                       bg-white/10 hover:bg-white/20"
          >
            {app.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
