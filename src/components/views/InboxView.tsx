import { useState } from 'react'
import {
  GitPullRequest,
  ListTodo,
  MessageSquare,
  Inbox,
  ArrowRight,
  Circle,
} from 'lucide-react'

type ItemType = 'pr' | 'ticket' | 'mention'
type Priority = 'urgent' | 'high' | 'medium' | 'low'
type FilterTab = 'all' | 'pr' | 'ticket' | 'mention'

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

const MOCK_ITEMS: InboxItem[] = [
  {
    id: '1',
    type: 'pr',
    title: 'Fix race condition in session cleanup',
    source: 'commandeck/core',
    timestamp: '25m ago',
    status: 'Review requested',
    priority: 'urgent',
    author: 'alex',
  },
  {
    id: '2',
    type: 'ticket',
    title: 'Dashboard widgets not loading on first visit',
    source: 'Frontend Team',
    timestamp: '2h ago',
    status: 'In Progress',
    priority: 'high',
    author: 'sarah',
  },
  {
    id: '3',
    type: 'mention',
    title: 'Mentioned you in: API rate limiting discussion',
    source: 'commandeck/api',
    timestamp: '4h ago',
    status: 'Unread',
    priority: 'medium',
    author: 'mike',
  },
  {
    id: '4',
    type: 'pr',
    title: 'Add dark mode toggle to settings panel',
    source: 'commandeck/ui',
    timestamp: '6h ago',
    status: 'Changes requested',
    priority: 'low',
    author: 'jordan',
  },
]

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
  mention: {
    icon: MessageSquare,
    borderColor: 'border-l-green-500',
    action: 'Reply',
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
  { key: 'mention', label: 'Mentions' },
]

export default function InboxView() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const filteredItems =
    activeFilter === 'all'
      ? MOCK_ITEMS
      : MOCK_ITEMS.filter((item) => item.type === activeFilter)

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
      {filteredItems.length === 0 ? (
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
                    <span>{item.timestamp}</span>
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
