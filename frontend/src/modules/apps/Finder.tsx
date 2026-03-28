import { useState } from 'react'

interface FileItem {
  name: string
  type: 'folder' | 'file'
  size?: string
  modified?: string
  children?: FileItem[]
}

const MOCK_FS: Record<string, FileItem[]> = {
  Desktop: [
    { name: 'Projects', type: 'folder', modified: 'Today' },
    { name: 'screenshot.png', type: 'file', size: '2.1 MB', modified: 'Today' },
    { name: 'notes.txt', type: 'file', size: '4 KB', modified: 'Yesterday' },
  ],
  Documents: [
    { name: 'Work', type: 'folder', modified: 'Mar 20' },
    { name: 'Personal', type: 'folder', modified: 'Mar 15' },
    { name: 'resume.pdf', type: 'file', size: '156 KB', modified: 'Mar 10' },
    { name: 'budget.xlsx', type: 'file', size: '88 KB', modified: 'Feb 28' },
  ],
  Downloads: [
    { name: 'setup.dmg', type: 'file', size: '124 MB', modified: 'Mar 25' },
    { name: 'archive.zip', type: 'file', size: '45 MB', modified: 'Mar 22' },
    { name: 'photo.jpg', type: 'file', size: '3.4 MB', modified: 'Mar 18' },
  ],
  Projects: [
    { name: 'agentic-os', type: 'folder', modified: 'Today' },
    { name: 'portfolio', type: 'folder', modified: 'Mar 20' },
  ],
  Work: [
    { name: 'Q1 Report.docx', type: 'file', size: '220 KB', modified: 'Mar 20' },
    { name: 'Meeting Notes.txt', type: 'file', size: '12 KB', modified: 'Mar 18' },
  ],
  Personal: [
    { name: 'diary.txt', type: 'file', size: '8 KB', modified: 'Mar 15' },
  ],
  'agentic-os': [
    { name: 'frontend', type: 'folder', modified: 'Today' },
    { name: 'backend', type: 'folder', modified: 'Today' },
    { name: 'README.md', type: 'file', size: '2 KB', modified: 'Today' },
  ],
  portfolio: [
    { name: 'index.html', type: 'file', size: '18 KB', modified: 'Mar 20' },
  ],
  frontend: [
    { name: 'src', type: 'folder', modified: 'Today' },
    { name: 'package.json', type: 'file', size: '1 KB', modified: 'Today' },
  ],
  backend: [
    { name: 'src', type: 'folder', modified: 'Today' },
    { name: 'package.json', type: 'file', size: '1 KB', modified: 'Today' },
  ],
}

const SIDEBAR_ITEMS = ['Desktop', 'Documents', 'Downloads']

function fileIcon(item: FileItem) {
  if (item.type === 'folder') return '📁'
  const ext = item.name.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📄', txt: '📝', md: '📝', png: '🖼️', jpg: '🖼️',
    zip: '🗜️', dmg: '💿', xlsx: '📊', docx: '📃', html: '🌐',
    json: '⚙️',
  }
  return icons[ext ?? ''] ?? '📄'
}

export default function Finder() {
  const [currentFolder, setCurrentFolder] = useState('Desktop')
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Desktop'])

  const files = MOCK_FS[currentFolder] ?? []

  function navigate(folder: string) {
    setBreadcrumb((prev) => [...prev, folder])
    setCurrentFolder(folder)
  }

  function navigateTo(index: number) {
    const crumb = breadcrumb[index]
    setBreadcrumb(breadcrumb.slice(0, index + 1))
    setCurrentFolder(crumb)
  }

  function selectSidebar(folder: string) {
    setBreadcrumb([folder])
    setCurrentFolder(folder)
  }

  return (
    <div className="flex w-full h-full text-sm" style={{ color: '#e5e5e7' }}>
      {/* Sidebar */}
      <div
        className="w-40 shrink-0 flex flex-col gap-1 py-3 px-2"
        style={{ background: 'rgba(40,40,44,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider px-2 mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Favorites
        </div>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => selectSidebar(item)}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors"
            style={{
              background: currentFolder === item && breadcrumb.length === 1
                ? 'rgba(255,255,255,0.12)'
                : 'transparent',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <span>{item === 'Desktop' ? '🖥️' : item === 'Documents' ? '📂' : '⬇️'}</span>
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar / Breadcrumb */}
        <div
          className="flex items-center gap-1 px-3 h-9 shrink-0 text-xs"
          style={{ background: 'rgba(50,50,54,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>}
              <button
                onClick={() => navigateTo(i)}
                className="hover:underline"
                style={{ color: i === breadcrumb.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
            {files.map((item) => (
              <button
                key={item.name}
                onDoubleClick={() => item.type === 'folder' && navigate(item.name)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-colors hover:bg-white/10 active:bg-white/20 cursor-default"
                title={item.name + (item.size ? ` — ${item.size}` : '')}
              >
                <span className="text-3xl">{fileIcon(item)}</span>
                <span
                  className="text-xs leading-tight break-words w-full"
                  style={{ color: 'rgba(255,255,255,0.85)', wordBreak: 'break-word' }}
                >
                  {item.name}
                </span>
              </button>
            ))}
          </div>
          {files.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Empty folder
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-3 h-6 flex items-center text-xs shrink-0"
          style={{ background: 'rgba(40,40,44,0.8)', color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {files.length} items
        </div>
      </div>
    </div>
  )
}
