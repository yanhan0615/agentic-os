import { useState, useRef } from 'react'

export default function TextEdit() {
  const [content, setContent] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [fileName, setFileName] = useState('Untitled')
  const [editingName, setEditingName] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  function ToolButton({
    active,
    onClick,
    children,
    title,
  }: {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
    title?: string
  }) {
    return (
      <button
        title={title}
        onClick={onClick}
        className="px-2 py-1 rounded text-xs transition-colors"
        style={{
          background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
          color: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="flex flex-col w-full h-full" style={{ background: '#1c1c1e', color: '#e5e5e7' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 h-10 shrink-0 flex-wrap"
        style={{ background: 'rgba(44,44,46,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Font size */}
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
          >
            −
          </button>
          <span className="text-xs w-6 text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {fontSize}
          </span>
          <button
            className="w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setFontSize((s) => Math.min(32, s + 1))}
          >
            +
          </button>
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Format buttons */}
        <ToolButton active={bold} onClick={() => setBold((b) => !b)} title="Bold">
          <strong>B</strong>
        </ToolButton>
        <ToolButton active={italic} onClick={() => setItalic((i) => !i)} title="Italic">
          <em>I</em>
        </ToolButton>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* New */}
        <ToolButton
          onClick={() => {
            setContent('')
            setFileName('Untitled')
          }}
          title="New document"
        >
          New
        </ToolButton>
      </div>

      {/* Filename */}
      <div
        className="flex items-center px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {editingName ? (
          <input
            ref={nameRef}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            autoFocus
            className="bg-transparent outline-none border-b text-sm font-medium"
            style={{ color: '#e5e5e7', borderColor: 'rgba(255,255,255,0.3)' }}
          />
        ) : (
          <span
            className="text-sm font-medium cursor-text"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onDoubleClick={() => setEditingName(true)}
            title="Double-click to rename"
          >
            {fileName}
          </span>
        )}
      </div>

      {/* Editor */}
      <textarea
        className="flex-1 resize-none outline-none border-none bg-transparent px-5 py-4 leading-relaxed"
        style={{
          fontSize,
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? 'italic' : 'normal',
          color: '#e5e5e7',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />

      {/* Status bar */}
      <div
        className="px-4 h-6 flex items-center gap-4 text-xs shrink-0"
        style={{
          background: 'rgba(40,40,42,0.8)',
          color: 'rgba(255,255,255,0.35)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  )
}
