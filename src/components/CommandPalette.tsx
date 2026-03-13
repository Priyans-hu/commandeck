import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Inbox, ListTodo, GitPullRequest, Bot, Settings, ArrowRight } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/' },
  { id: 'tickets', label: 'Tickets', icon: ListTodo, path: '/tickets' },
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, path: '/pull-requests' },
  { id: 'sessions', label: 'Sessions', icon: Bot, path: '/sessions' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

function PaletteContent({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const filteredItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeItem = useCallback(
    (index: number) => {
      const item = filteredItems[index]
      if (item) {
        navigate(item.path)
        onClose()
      }
    },
    [filteredItems, navigate, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          filteredItems.length === 0
            ? 0
            : (prev - 1 + filteredItems.length) % filteredItems.length
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        executeItem(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [filteredItems.length, selectedIndex, executeItem, onClose]
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          <div className="px-3 py-1.5 text-xs font-medium text-text-secondary">
            Navigation
          </div>
          {filteredItems.map((item, i) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm ${
                i === selectedIndex
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-primary hover:bg-surface-hover'
              }`}
              onClick={() => {
                navigate(item.path)
                onClose()
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-50" />
            </button>
          ))}
        </div>
        <div className="border-t border-border px-4 py-2 text-xs text-text-secondary">
          ↑↓ navigate · ↵ open · esc close
        </div>
      </div>
    </div>
  )
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  if (!open) return null
  return <PaletteContent onClose={onClose} />
}
