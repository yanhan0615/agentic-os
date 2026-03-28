import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WindowState } from '@agentic-os/types'

let nextId = 1
let nextZ = 100

interface WindowStore {
  windows: WindowState[]
  openWindow: (appId: string, title: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindow: (id: string, patch: Partial<WindowState>) => void
}

export const useWindowStore = create<WindowStore>()(
  immer((set) => ({
    windows: [],

    openWindow: (appId, title) =>
      set((state) => {
        state.windows.push({
          id: `win-${nextId++}`,
          appId,
          title,
          x: 80 + (nextId % 5) * 30,
          y: 40 + (nextId % 5) * 30,
          width: 680,
          height: 460,
          zIndex: ++nextZ,
          focused: true,
          minimized: false,
          maximized: false,
        })
        // unfocus others
        state.windows.forEach((w) => {
          if (w.id !== state.windows[state.windows.length - 1].id) w.focused = false
        })
      }),

    closeWindow: (id) =>
      set((state) => {
        state.windows = state.windows.filter((w) => w.id !== id)
      }),

    focusWindow: (id) =>
      set((state) => {
        state.windows.forEach((w) => {
          w.focused = w.id === id
          if (w.id === id) w.zIndex = ++nextZ
        })
      }),

    updateWindow: (id, patch) =>
      set((state) => {
        const win = state.windows.find((w) => w.id === id)
        if (win) Object.assign(win, patch)
      }),
  })),
)
