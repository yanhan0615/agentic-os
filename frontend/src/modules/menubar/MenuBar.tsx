import { useEffect, useState } from 'react'

export default function MenuBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute top-0 left-0 right-0 h-7 glass flex items-center justify-between px-3 z-50 text-white text-xs">
      {/* Left: Apple menu + app menu */}
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm">🍎</span>
        <span className="font-semibold">Agentic OS</span>
      </div>

      {/* Right: system status */}
      <div className="flex items-center gap-3 text-xs opacity-90">
        <span>{time}</span>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
