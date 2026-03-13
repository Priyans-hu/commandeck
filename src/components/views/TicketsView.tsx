import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/core'
import { useSessionStore } from '../../stores/sessionStore'
import { useTickets } from '../../hooks/useTickets'
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
  X,
  ExternalLink,
  Clock,
} from 'lucide-react'
import type { LinearIssue, AISession } from '../../types'

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// ── Ticket Detail Panel ────────────────────────────────────────────────

function TicketDetailPanel({
  ticket,
  onClose,
}: {
  ticket: LinearIssue
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { addSession } = useSessionStore()
  const prio = PRIORITY_META[ticket.priority]
  const PrioIcon = prio.Icon

  const assignToAI = useCallback(async () => {
    try {
      const session = await invoke<AISession>('spawn_claude_session', {
        taskDescription: `${ticket.title}\n\n${ticket.description || ''}`.trim(),
        repoPath: null,
        ticketId: ticket.identifier,
        model: null,
      })
      addSession(session)
      navigate(`/sessions/${session.id}`)
    } catch (e) {
      console.error('Failed to assign to AI:', e)
    }
  }, [ticket, addSession, navigate])

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 z-40 h-full w-[420px] border-l border-border bg-surface overflow-y-auto shadow-xl transition-transform duration-200 translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{ticket.identifier}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: '#6366f118',
                color: '#6366f1',
                border: '1px solid #6366f130',
              }}
            >
              {ticket.team.key}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5">
          {/* Title */}
          <h2 className="text-base font-semibold leading-snug text-text-primary">{ticket.title}</h2>

          {/* Status */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Status</span>
            <div>
              <span
                className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: ticket.state.color + '18',
                  color: ticket.state.color,
                }}
              >
                {ticket.state.name}
              </span>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Priority</span>
            <div className="flex items-center gap-2">
              <PrioIcon size={14} style={{ color: prio.color }} />
              <span className="text-sm text-text-primary">{prio.label}</span>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Assignee</span>
            <div className="flex items-center gap-2">
              {ticket.assignee ? (
                <>
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ backgroundColor: avatarColor(ticket.assignee.name) }}
                  >
                    {getInitials(ticket.assignee.name)}
                  </div>
                  <span className="text-sm text-text-primary">{ticket.assignee.name}</span>
                </>
              ) : (
                <>
                  <Circle className="h-6 w-6 text-border" strokeDasharray="3 3" />
                  <span className="text-sm text-text-secondary">Unassigned</span>
                </>
              )}
            </div>
          </div>

          {/* Labels */}
          {ticket.labels.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {ticket.labels.map((l) => (
                  <span
                    key={l.name}
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
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
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Description</span>
            <p className="text-sm leading-relaxed text-text-secondary">
              {ticket.description || 'No description'}
            </p>
          </div>

          {/* Timestamps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Clock size={12} />
              <span>Created {formatDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Clock size={12} />
              <span>Updated {formatDate(ticket.updatedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {ticket.url && (
              <a
                href={ticket.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
              >
                <ExternalLink size={13} />
                Open in Linear
              </a>
            )}
            <button
              onClick={assignToAI}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              <Bot size={13} />
              Assign to AI
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Ticket row ─────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  onClick,
}: {
  ticket: LinearIssue
  onClick: (ticket: LinearIssue) => void
}) {
  const navigate = useNavigate()
  const { addSession } = useSessionStore()
  const prio = PRIORITY_META[ticket.priority]
  const PrioIcon = prio.Icon

  const assignToAI = useCallback(async () => {
    try {
      const session = await invoke<AISession>('spawn_claude_session', {
        taskDescription: `${ticket.title}\n\n${ticket.description || ''}`.trim(),
        repoPath: null,
        ticketId: ticket.identifier,
        model: null,
      })
      addSession(session)
      navigate(`/sessions/${session.id}`)
    } catch (e) {
      console.error('Failed to assign to AI:', e)
    }
  }, [ticket, addSession, navigate])

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 transition-colors hover:bg-surface-hover"
      onClick={() => onClick(ticket)}
    >
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
          assignToAI()
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
  const { tickets, loading, error, refetch } = useTickets()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [teamFilter, setTeamFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('Priority')
  const [selectedTicket, setSelectedTicket] = useState<LinearIssue | null>(null)

  const teamNames = useMemo(() => {
    const names = new Set(tickets.map((t) => t.team.name))
    return ['All', ...Array.from(names)]
  }, [tickets])

  const filtered = useMemo(() => {
    let list = [...tickets]

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || t.identifier.toLowerCase().includes(q)
      )
    }

    // Status
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.state.name === statusFilter)
    }

    // Priority
    if (priorityFilter !== 'All') {
      const pVal = PRIORITY_NAME_TO_VALUE[priorityFilter]
      if (pVal !== undefined) list = list.filter((t) => t.priority === pVal)
    }

    // Team
    if (teamFilter !== 'All') {
      list = list.filter((t) => t.team.name === teamFilter)
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'Priority') return a.priority - b.priority
      if (sortBy === 'Created')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return list
  }, [tickets, search, statusFilter, priorityFilter, teamFilter, sortBy])

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <span className="text-sm text-text-secondary">Loading tickets...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <span className="text-sm text-text-secondary">{error}</span>
        <button
          onClick={refetch}
          className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state (no API key or no tickets)
  if (tickets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Circle className="h-8 w-8 text-text-secondary" strokeDasharray="3 3" />
        <span className="text-sm text-text-secondary">
          Connect your Linear account in Settings to see your tickets.
        </span>
      </div>
    )
  }

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
          filtered.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} onClick={setSelectedTicket} />
          ))
        )}
      </div>

      {/* Ticket detail panel */}
      {selectedTicket && (
        <TicketDetailPanel ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  )
}
