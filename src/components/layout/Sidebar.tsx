import { NavLink } from 'react-router-dom'
import {
  Inbox,
  ListTodo,
  GitPullRequest,
  Bot,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'

const mainNavItems = [
  { to: '/', label: 'Inbox', icon: Inbox, badgeKey: 'inbox' as const },
  { to: '/tickets', label: 'Tickets', icon: ListTodo },
  {
    to: '/pull-requests',
    label: 'Pull Requests',
    icon: GitPullRequest,
    badgeKey: 'prs' as const,
  },
  { to: '/sessions', label: 'AI Sessions', icon: Bot },
]

const bottomNavItems = [{ to: '/settings', label: 'Settings', icon: Settings }]

// Badge counts — later these can come from a store
const badgeCounts: Record<string, number> = {
  inbox: 3,
  prs: 2,
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  const renderNavItem = (item: {
    to: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badgeKey?: string
  }) => {
    const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'border-l-2 border-accent bg-surface-hover text-accent'
              : 'border-l-2 border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`
        }
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-[11px] font-semibold text-accent">
                {badge}
              </span>
            )}
          </>
        )}
        {sidebarCollapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
            {badge}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface-secondary transition-all duration-200"
      style={{ width: sidebarCollapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Layers className="h-4 w-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-bold tracking-tight text-text-primary">
            CommanDeck
          </span>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {mainNavItems.map(renderNavItem)}

        {/* Divider */}
        <div className="my-2 border-t border-border" />

        {bottomNavItems.map(renderNavItem)}
      </nav>

      {/* User info */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            P
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                Priyanshu
              </p>
              <p className="truncate text-xs text-text-secondary">IC Mode</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border px-2 py-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
