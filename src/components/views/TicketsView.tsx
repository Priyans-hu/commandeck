import { useState, useMemo } from 'react'
import {
  Search,
  Bot,
  ChevronDown,
  Circle,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  SignalHigh,
} from 'lucide-react'
import type { LinearIssue } from '../../types'

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_TICKETS: LinearIssue[] = [
  {
    id: '1',
    identifier: 'SER-1234',
    title: 'Fix authentication token refresh failing silently on session expiry',
    description: '',
    state: { id: 's1', name: 'In Progress', color: '#f59e0b', type: 'started' },
    priority: 1,
    assignee: { name: 'Priyanshu Garg', avatar: '' },
    team: { id: 't1', name: 'Server', key: 'SER', icon: '' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'bug', color: '#ef4444' }, { name: 'auth', color: '#6366f1' }],
  },
  {
    id: '2',
    identifier: 'SER-1235',
    title: 'Add rate limiting to public API endpoints',
    description: '',
    state: { id: 's2', name: 'Todo', color: '#94a3b8', type: 'unstarted' },
    priority: 2,
    assignee: { name: 'Amit Sharma', avatar: '' },
    team: { id: 't1', name: 'Server', key: 'SER', icon: '' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'security', color: '#f59e0b' }],
  },
  {
    id: '3',
    identifier: 'FE-892',
    title: 'Dashboard widgets layout breaks on viewport < 1024px',
    description: '',
    state: { id: 's3', name: 'In Review', color: '#6366f1', type: 'started' },
    priority: 2,
    assignee: { name: 'Neha Patel', avatar: '' },
    team: { id: 't2', name: 'Frontend', key: 'FE', icon: '' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'bug', color: '#ef4444' }, { name: 'responsive', color: '#22c55e' }],
  },
  {
    id: '4',
    identifier: 'SER-1236',
    title: 'Migrate user accounts to new billing provider',
    description: '',
    state: { id: 's1', name: 'In Progress', color: '#f59e0b', type: 'started' },
    priority: 1,
    assignee: null,
    team: { id: 't1', name: 'Server', key: 'SER', icon: '' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'migration', color: '#8b5cf6' }],
  },
  {
    id: '5',
    identifier: 'FE-893',
    title: 'Implement dark mode toggle in user preferences',
    description: '',
    state: { id: 's4', name: 'Done', color: '#22c55e', type: 'completed' },
    priority: 3,
    assignee: { name: 'Ravi Kumar', avatar: '' },
    team: { id: 't2', name: 'Frontend', key: 'FE', icon: '' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'feature', color: '#22c55e' }, { name: 'ux', color: '#f472b6' }],
  },
  {
    id: '6',
    identifier: 'SER-1237',
    title: 'Webhook delivery retries not respecting exponential backoff',
    description: '',
    state: { id: 's2', name: 'Todo', color: '#94a3b8', type: 'unstarted' },
    priority: 0,
    assignee: { name: 'Priyanshu Garg', avatar: '' },
    team: { id: 't1', name: 'Server', key: 'SER', icon: '' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'bug', color: '#ef4444' }, { name: 'webhooks', color: '#06b6d4' }],
  },
  {
    id: '7',
    identifier: 'FE-894',
    title: 'Add keyboard shortcuts for common navigation actions',
    description: '',
    state: { id: 's2', name: 'Todo', color: '#94a3b8', type: 'unstarted' },
    priority: 4,
    assignee: null,
    team: { id: 't2', name: 'Frontend', key: 'FE', icon: '' },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'feature', color: '#22c55e' }],
  },
  {
    id: '8',
    identifier: 'SER-1238',
    title: 'Database connection pool exhausted under high concurrency',
    description: '',
    state: { id: 's1', name: 'In Progress', color: '#f59e0b', type: 'started' },
    priority: 1,
    assignee: { name: 'Amit Sharma', avatar: '' },
    team: { id: 't1', name: 'Server', key: 'SER', icon: '' },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    url: '',
    labels: [{ name: 'critical', color: '#ef4444' }, { name: 'infra', color: '#94a3b8' }],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>

const PRIORITY_META: Record<number, { label: string; color: string; Icon: IconComponent }> = {
  0: { label: 'No priority', color: '#94a3b8', Icon: Minus },
  1: { label: 'Urgent', color: '#ef4444', Icon: AlertTriangle },
  2: { label: 'High', color: '#f97316', Icon: SignalHigh },
  3: { label: 'Medium', color: '#f59e0b', Icon: ArrowUp },
  4: { label: 'Low', color: '#3b82f6', Icon: ArrowDown },
}

const STATUS_LABELS = ['All', 'Todo', 'In Progress', 'In Review', 'Done'] as const
const PRIORITY_LABELS = ['All', 'Urgent', 'High', 'Medium', 'Low', 'None'] as const
const SORT_OPTIONS = ['Priority', 'Created', 'Updated'] as const

const PRIORITY_NAME_TO_VALUE: Record<string, number> = {
  Urgent: 1,
  High: 2,
  Medium: 3,
  Low: 4,
  None: 0,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Dropdown component ─────────────────────────────────────────────────

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <span className="text-text-secondary">{label}:</span>
        <span className="text-text-primary">{value}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-surface-secondary py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-surface-hover ${
                  opt === value ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Ticket row ─────────────────────────────────────────────────────────

function TicketRow({ ticket }: { ticket: LinearIssue }) {
  const prio = PRIORITY_META[ticket.priority]
  const PrioIcon = prio.Icon

  return (
    <div className="group flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors hover:bg-surface-hover">
      {/* Priority icon */}
      <div className="flex w-5 shrink-0 items-center justify-center" title={prio.label}>
        <PrioIcon size={14} style={{ color: prio.color }} />
      </div>

      {/* Identifier */}
      <span className="w-[72px] shrink-0 text-xs font-medium text-text-secondary">
        {ticket.identifier}
      </span>

      {/* Title + labels */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-text-primary">{ticket.title}</span>
        {ticket.labels.map((l) => (
          <span
            key={l.name}
            className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium lg:inline-flex"
            style={{
              backgroundColor: l.color + '18',
              color: l.color,
              border: `1px solid ${l.color}30`,
            }}
          >
            {l.name}
          </span>
        ))}
      </div>

      {/* Status badge */}
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{
          backgroundColor: ticket.state.color + '18',
          color: ticket.state.color,
        }}
      >
        {ticket.state.name}
      </span>

      {/* Assignee */}
      <div className="flex w-7 shrink-0 items-center justify-center">
        {ticket.assignee ? (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: avatarColor(ticket.assignee.name) }}
            title={ticket.assignee.name}
          >
            {getInitials(ticket.assignee.name)}
          </div>
        ) : (
          <Circle className="h-5 w-5 text-border" strokeDasharray="3 3" />
        )}
      </div>

      {/* Created */}
      <span className="w-12 shrink-0 text-right text-[11px] text-text-secondary">
        {timeAgo(ticket.createdAt)}
      </span>

      {/* Assign to AI button */}
      <button
        className="ml-1 flex shrink-0 items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent opacity-0 transition-all hover:bg-accent/20 group-hover:opacity-100"
        title="Assign to AI"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <Bot size={12} />
        <span>AI</span>
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────

export default function TicketsView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [teamFilter, setTeamFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('Priority')

  const teamNames = useMemo(() => {
    const names = new Set(MOCK_TICKETS.map((t) => t.team.name))
    return ['All', ...Array.from(names)]
  }, [])

  const filtered = useMemo(() => {
    let tickets = [...MOCK_TICKETS]

    // Search
    if (search) {
      const q = search.toLowerCase()
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || t.identifier.toLowerCase().includes(q)
      )
    }

    // Status
    if (statusFilter !== 'All') {
      tickets = tickets.filter((t) => t.state.name === statusFilter)
    }

    // Priority
    if (priorityFilter !== 'All') {
      const pVal = PRIORITY_NAME_TO_VALUE[priorityFilter]
      if (pVal !== undefined) tickets = tickets.filter((t) => t.priority === pVal)
    }

    // Team
    if (teamFilter !== 'All') {
      tickets = tickets.filter((t) => t.team.name === teamFilter)
    }

    // Sort
    tickets.sort((a, b) => {
      if (sortBy === 'Priority') return a.priority - b.priority
      if (sortBy === 'Created')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return tickets
  }, [search, statusFilter, priorityFilter, teamFilter, sortBy])

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-text-primary">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </h1>

          {/* Filters */}
          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={STATUS_LABELS}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            options={PRIORITY_LABELS}
            onChange={setPriorityFilter}
          />
          <FilterDropdown
            label="Team"
            value={teamFilter}
            options={teamNames}
            onChange={setTeamFilter}
          />
          <FilterDropdown
            label="Sort"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-md border border-border bg-surface-secondary py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Column header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-secondary/50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
        <span className="w-5 shrink-0" />
        <span className="w-[72px] shrink-0">ID</span>
        <span className="min-w-0 flex-1">Title</span>
        <span className="shrink-0">Status</span>
        <span className="w-7 shrink-0 text-center">Owner</span>
        <span className="w-12 shrink-0 text-right">Created</span>
        <span className="ml-1 w-[52px] shrink-0" />
      </div>

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-secondary">
            No tickets match your filters.
          </div>
        ) : (
          filtered.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </div>
  )
}
