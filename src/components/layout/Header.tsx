import { useLocation } from 'react-router-dom'
import { Search, Bell, RefreshCw } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'

const routeTitles: Record<string, string> = {
  '/': 'Inbox',
  '/tickets': 'Tickets',
  '/pull-requests': 'Pull Requests',
  '/sessions': 'AI Sessions',
  '/settings': 'Settings',
}

export default function Header() {
  const location = useLocation()
  const { viewMode, setViewMode, notifications } = useAppStore()
  const unreadCount = notifications.filter((n) => !n.read).length
  const title = routeTitles[location.pathname] || 'CommanDeck'

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-surface-secondary px-6"
      style={{ height: 52 }}
    >
      {/* Left: Page title */}
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      {/* Spacer + Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search... (Cmd+K)"
            className="h-8 w-56 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Refresh */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* View mode toggle */}
        <div className="flex h-8 items-center rounded-lg border border-border bg-surface">
          <button
            onClick={() => setViewMode('ic')}
            className={`h-full rounded-l-lg px-3 text-xs font-medium transition-colors ${
              viewMode === 'ic'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            IC
          </button>
          <button
            onClick={() => setViewMode('lead')}
            className={`h-full rounded-r-lg px-3 text-xs font-medium transition-colors ${
              viewMode === 'lead'
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Lead
          </button>
        </div>

        {/* Notification bell */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
          )}
        </button>
      </div>
    </header>
  )
}
