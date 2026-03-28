import { useState, useRef, useEffect, KeyboardEvent } from 'react'

const INITIAL_OUTPUT = `agentic-os terminal v1.0.0
Type 'help' for available commands.
`

const MOCK_FS: Record<string, string[]> = {
  '/': ['home', 'usr', 'etc', 'tmp'],
  '/home': ['user'],
  '/home/user': ['Desktop', 'Documents', 'Downloads', 'Projects'],
  '/home/user/Desktop': ['screenshot.png', 'notes.txt', 'Projects'],
  '/home/user/Documents': ['Work', 'Personal', 'resume.pdf', 'budget.xlsx'],
  '/home/user/Downloads': ['setup.dmg', 'archive.zip', 'photo.jpg'],
  '/home/user/Projects': ['agentic-os', 'portfolio'],
}

function resolvePath(cwd: string, input: string): string {
  if (input.startsWith('/')) return input
  if (input === '..') {
    const parts = cwd.split('/').filter(Boolean)
    parts.pop()
    return '/' + parts.join('/')
  }
  if (input === '~') return '/home/user'
  return (cwd === '/' ? '' : cwd) + '/' + input
}

function runCommand(cmd: string, cwd: string): { output: string; newCwd?: string } {
  const parts = cmd.trim().split(/\s+/)
  const bin = parts[0]
  const args = parts.slice(1)

  switch (bin) {
    case '': return { output: '' }

    case 'help':
      return {
        output: `Available commands:
  ls [path]     List directory contents
  cd [path]     Change directory
  pwd           Print working directory
  echo [text]   Print text
  clear         Clear terminal
  help          Show this help`,
      }

    case 'pwd':
      return { output: cwd }

    case 'ls': {
      const target = args[0] ? resolvePath(cwd, args[0]) : cwd
      const contents = MOCK_FS[target]
      if (!contents) return { output: `ls: ${args[0] ?? '.'}: No such file or directory` }
      return { output: contents.join('  ') }
    }

    case 'cd': {
      const target = args[0] ? resolvePath(cwd, args[0]) : '/home/user'
      if (!MOCK_FS[target] && target !== '/') {
        return { output: `cd: ${args[0]}: No such file or directory` }
      }
      return { output: '', newCwd: target || '/' }
    }

    case 'echo':
      return { output: args.join(' ') }

    case 'clear':
      return { output: '\x1b[CLEAR]' }

    default:
      return { output: `${bin}: command not found` }
  }
}

export default function Terminal() {
  const [cwd, setCwd] = useState('/home/user')
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [lines, setLines] = useState<string[]>([INITIAL_OUTPUT])
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  function prompt() {
    return `user@agentic-os:${cwd}$ `
  }

  function submit() {
    const cmd = input.trim()
    const { output, newCwd } = runCommand(cmd, cwd)

    if (output === '\x1b[CLEAR]') {
      setLines([])
    } else {
      setLines((prev) => [
        ...prev,
        prompt() + cmd,
        ...(output ? [output] : []),
      ])
    }

    if (cmd) {
      setCmdHistory((prev) => [cmd, ...prev])
    }
    if (newCwd) setCwd(newCwd)
    setInput('')
    setHistIdx(-1)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx - 1
      if (next < 0) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(next)
        setInput(cmdHistory[next] ?? '')
      }
    }
  }

  return (
    <div
      className="flex flex-col w-full h-full font-mono text-sm"
      style={{ background: '#1a1a1a', color: '#e5e5e5' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div className="flex-1 overflow-auto px-3 py-2 whitespace-pre-wrap leading-5">
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.startsWith('user@') ? '#98e890' : '#e5e5e5' }}>
            {line}
          </div>
        ))}
        {/* Input line */}
        <div className="flex items-center">
          <span style={{ color: '#98e890' }}>{prompt()}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            className="flex-1 bg-transparent outline-none border-none caret-green-400"
            style={{ color: '#e5e5e5', minWidth: 0 }}
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
