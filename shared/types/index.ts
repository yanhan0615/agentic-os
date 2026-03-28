// Shared type definitions for Agentic OS
// Used by both frontend and backend

// ─── Window ───────────────────────────────────────────────────────────────────

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  focused: boolean
  minimized: boolean
  maximized: boolean
}

// ─── App ──────────────────────────────────────────────────────────────────────

export interface AppManifest {
  id: string
  name: string
  icon: string
  defaultWindowSize: { width: number; height: number }
  singleInstance?: boolean
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  appId: string
  title: string
  body: string
  timestamp: Date
  read: boolean
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string
    message: string
    detail?: Record<string, unknown>
  }
}

export interface AgentInvokeRequest {
  prompt: string
  context?: Record<string, unknown>
}

export interface AgentInvokeResponse {
  id: string
  status: 'streaming' | 'done' | 'error'
  content?: string
}
