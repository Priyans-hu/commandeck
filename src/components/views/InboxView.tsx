import { useState, useMemo } from 'react'
import {
  GitPullRequest,
  ListTodo,
  Inbox,
  ArrowRight,
  Circle,
  Loader2,
} from 'lucide-react'
import { useTickets } from '../../hooks/useTickets'
import { usePullRequests } from '../../hooks/usePullRequests'

type ItemType = 'pr' | 'ticket'
type Priority = 'urgent' | 'high' | 'medium' | 'low'
type FilterTab = 'all' | 'pr' | 'ticket'

interface InboxItem {
  id: string
  type: ItemType
  title: string
  source: string
  timestamp: string
  status: string
  priority: Priority
  author: string
}

const TYPE_CONFIG: Record<
  ItemType,
  {
    icon: typeof GitPullRequest
    borderColor: string
    action: string
  }
> = {
  pr: {
    icon: GitPullRequest,
    borderColor: 'border-l-purple-500',
    action: 'Review',
  },
  ticket: {
    icon: ListTodo,
    borderColor: 'border-l-blue-500',
    action: 'Open',
  },
}

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  urgent: { color: 'bg-danger/15 text-danger', label: 'Urgent' },
  high: { color: 'bg-warning/15 text-warning', label: 'High' },
  medium: { color: 'bg-accent/15 text-accent', label: 'Medium' },
  low: { color: 'bg-text-secondary/15 text-text-secondary', label: 'Low' },
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pr', label: 'Pull Requests' },
  { key: 'ticket', label: 'Tickets' },
]

const TICKET_PRIORITY_MAP: Record<number, Priority> = {
  0: 'low',
  1: 'urgent',
  2: 'high',
  3: 'medium',
  4: 'low',
}

const PR_STATUS_MAP: Record<string, string> = {
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  pending: 'Pending Review',
  dismissed: 'No Reviews',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function InboxView() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const { tickets, loading: ticketsLoading } = useTickets()
  const { pullRequests, loading: prsLoading } = usePullRequests()
  const loading = ticketsLoading || prsLoading

  const inboxItems = useMemo(() => {
    const ticketItems: InboxItem[] = tickets.map((ticket) => ({
      id: ticket.id,
      type: 'ticket',
      title: ticket.title,
      source: ticket.team.name,
      timestamp: ticket.updatedAt,
      status: ticket.state.name,
      priority: TICKET_PRIORITY_MAP[ticket.priority] ?? 'low',
      author: ticket.assignee?.name || 'Unassigned',
    }))

    const prItems: InboxItem[] = pullRequests.map((pr) => ({
      id: pr.id,
      type: 'pr',
      title: pr.title,
      source: `${pr.repoOwner}/${pr.repoName}`,
      timestamp: pr.updatedAt,
      status: PR_STATUS_MAP[pr.reviewStatus] ?? pr.reviewStatus,
      priority: 'medium' as Priority,
      author: pr.author,
    }))

    return [...ticketItems, ...prItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [tickets, pullRequests])

  const filteredItems =
    activeFilter === 'all'
      ? inboxItems
      : inboxItems.filter((item) => item.type === activeFilter)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Inbox</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your work items across all integrations
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-lg bg-surface-secondary p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-surface-hover text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-secondary py-16">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-text-secondary/50" />
          <p className="text-sm font-medium text-text-secondary">
            Loading items...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-secondary py-16">
          <Inbox className="mb-3 h-10 w-10 text-text-secondary/50" />
          <p className="text-sm font-medium text-text-secondary">
            No items to show
          </p>
          <p className="mt-1 text-xs text-text-secondary/70">
            Items matching this filter will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const config = TYPE_CONFIG[item.type]
            const priority = PRIORITY_CONFIG[item.priority]
            const Icon = config.icon

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-4 rounded-xl border border-l-2 border-border bg-surface-secondary p-4 transition-colors hover:bg-surface-hover ${config.borderColor}`}
              >
                {/* Type Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                  <Icon className="h-[18px] w-[18px] text-text-secondary" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                    <span>{item.source}</span>
                    <Circle className="h-1 w-1 fill-current" />
                    <span>{timeAgo(item.timestamp)}</span>
                    <Circle className="h-1 w-1 fill-current" />
                    <span>{item.author}</span>
                  </div>
                </div>

                {/* Status + Priority */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.color}`}
                  >
                    {priority.label}
                  </span>
                  <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {item.status}
                  </span>
                </div>

                {/* Action Button */}
                <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-secondary opacity-0 transition-all hover:bg-accent hover:text-white group-hover:opacity-100">
                  {config.action}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
