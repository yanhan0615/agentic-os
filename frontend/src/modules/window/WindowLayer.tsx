import { Rnd } from 'react-rnd'
import { useWindowStore } from '../../stores/windowStore'
import type { WindowState } from '@agentic-os/types'
import Finder from '../apps/Finder'
import Terminal from '../apps/Terminal'
import TextEdit from '../apps/TextEdit'
import AgentMonitor from '../apps/monitor/AgentMonitor'

function AppContent({ appId }: { appId: string }) {
  switch (appId) {
    case 'finder':
      return <Finder />
    case 'terminal':
      return <Terminal />
    case 'text-edit':
      return <TextEdit />
    case 'agent-monitor':
      return <AgentMonitor />
    default:
      return (
        <div className="flex items-center justify-center w-full h-full text-white/30 text-sm">
          [{appId}] — coming soon
        </div>
      )
  }
}

export default function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)

  return (
    <>
      {windows
        .filter((w) => !w.minimized)
        .map((win) => (
          <WindowFrame key={win.id} win={win} />
        ))}
    </>
  )
}

function WindowFrame({ win }: { win: WindowState }) {
  const { focusWindow, closeWindow, updateWindow } = useWindowStore()

  return (
    <Rnd
      default={{ x: win.x, y: win.y, width: win.width, height: win.height }}
      style={{ zIndex: win.zIndex }}
      dragHandleClassName="window-titlebar"
      onMouseDown={() => focusWindow(win.id)}
      onDragStop={(_e, d) => updateWindow(win.id, { x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        updateWindow(win.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...pos,
        })
      }
    >
      <div
        className="flex flex-col w-full h-full rounded-xl overflow-hidden shadow-window"
        style={{
          background: 'rgba(28, 28, 30, 0.92)',
          backdropFilter: 'blur(20px)',
          border: win.focused
            ? '1px solid rgba(255,255,255,0.2)'
            : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Title bar */}
        <div className="window-titlebar flex items-center gap-2 px-3 h-9 shrink-0 cursor-move"
             style={{ background: 'rgba(50,50,52,0.9)' }}>
          {/* Traffic lights */}
          <button
            onClick={() => closeWindow(win.id)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-60" />
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
          <span className="ml-2 text-xs text-white/70 truncate">{win.title}</span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          <AppContent appId={win.appId} />
        </div>
      </div>
    </Rnd>
  )
}
