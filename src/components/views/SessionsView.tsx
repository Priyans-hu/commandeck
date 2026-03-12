import { useState } from 'react'
import {
  Plus,
  Check,
  X,
  Minus,
  Terminal,
  GitBranch,
  FileCode,
  RotateCcw,
  Square,
  ExternalLink,
  Cpu,
  Clock,
  Diff,
  Eye,
  Bot,
} from 'lucide-react'
import type { AISession, SessionStatus } from '../../types'

type FilterTab = 'all' | 'running' | 'completed' | 'failed'

const MOCK_SESSIONS: AISession[] = [
  {
    id: 'sess_01',
    ticketId: 'SER-1847',
    ticketUrl: '#',
    taskDescription:
      'Implement account migration flow with validation and rollback support',
    status: 'running',
    model: 'Claude Opus 4.6',
    duration: 'Running for 3m 42s',
    repo: 'contacto-core',
    branch: 'feat/account-migration',
    startedAt: '2 min ago',
    completedAt: null,
    resultSummary: null,
    logsUrl: null,
  },
  {
    id: 'sess_02',
    ticketId: 'SER-1832',
    ticketUrl: '#',
    taskDescription:
      'Fix billing webhook retry logic for failed charge events',
    status: 'completed',
    model: 'Claude Opus 4.6',
    duration: 'Completed in 8m 15s',
    repo: 'hodor',
    branch: 'fix/webhook-retry',
    filesChanged: 4,
    startedAt: '25 min ago',
    completedAt: '2026-03-12T09:08:00Z',
    resultSummary:
      'Fixed exponential backoff logic and added dead letter queue. PR #482 opened.',
    logsUrl: '#',
  },
  {
    id: 'sess_03',
    ticketId: 'SER-1851',
    ticketUrl: '#',
    taskDescription:
      'Add data-testid attributes to all billing page interactive elements',
    status: 'running',
    model: 'Claude Sonnet 4',
    duration: 'Running for 1m 08s',
    repo: 'contacto-console',
    branch: 'chore/billing-testids',
    startedAt: '1 min ago',
    completedAt: null,
    resultSummary: null,
    logsUrl: null,
  },
  {
    id: 'sess_04',
    ticketId: 'SER-1790',
    ticketUrl: '#',
    taskDescription:
      'Refactor org deactivation endpoint to use soft-delete pattern',
    status: 'failed',
    model: 'Claude Opus 4.6',
    duration: 'Failed after 5m 33s',
    repo: 'contacto-core',
    branch: 'fix/org-deactivation',
    filesChanged: 7,
    startedAt: '1 hour ago',
    completedAt: '2026-03-12T08:05:00Z',
    resultSummary:
      'Failed: Could not resolve circular dependency in org-service module. Manual intervention required.',
    logsUrl: '#',
  },
  {
    id: 'sess_05',
    ticketId: 'SER-1815',
    ticketUrl: '#',
    taskDescription:
      'Generate unit tests for the notification service handlers',
    status: 'cancelled',
    model: 'Claude Sonnet 4',
    duration: 'Cancelled after 2m 10s',
    repo: 'hodor',
    branch: 'test/notification-handlers',
    startedAt: '3 hours ago',
    completedAt: '2026-03-12T06:32:00Z',
    resultSummary: null,
    logsUrl: '#',
  },
]

const statusConfig: Record<
  SessionStatus,
  {
    label: string
    dotClass: string
    badgeClass: string
    icon: typeof Check
  }
> = {
  running: {
    label: 'Running',
    dotClass: 'bg-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
    icon: Check,
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-danger',
    badgeClass: 'bg-danger/10 text-danger border-danger/20',
    icon: X,
  },
  cancelled: {
    label: 'Cancelled',
    dotClass: 'bg-text-secondary',
    badgeClass:
      'bg-text-secondary/10 text-text-secondary border-text-secondary/20',
    icon: Minus,
  },
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
]

function StatusBadge({ status }: { status: SessionStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${config.badgeClass}`}
    >
      {status === 'running' ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {config.label}
    </span>
  )
}

function ActionButton({
  children,
  variant = 'secondary',
  icon: Icon,
}: {
  children: React.ReactNode
  variant?: 'secondary' | 'danger' | 'accent'
  icon?: typeof Check
}) {
  const variantClasses = {
    secondary:
      'border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
    danger: 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
    accent: 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20',
  }
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${variantClasses[variant]}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}

function SessionCard({ session }: { session: AISession }) {
  const isRunning = session.status === 'running'
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-surface-secondary transition-all duration-200 hover:bg-surface-hover ${
        isRunning
          ? 'border-accent/30 shadow-[0_0_24px_-8px_rgba(99,102,241,0.2)]'
          : 'border-border hover:border-border'
      }`}
    >
      {/* Subtle animated gradient border for running sessions */}
      {isRunning && (
        <div className="pointer-events-none absolute inset-0 rounded-xl">
          <div className="absolute inset-0 rounded-xl border border-accent/25 animate-pulse" />
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </div>
      )}

      <div className="relative p-5">
        {/* Header: Status + Ticket + Time */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={session.status} />
            <a
              href={session.ticketUrl}
              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              {session.ticketId}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
          <span className="text-[11px] text-text-secondary">
            {session.startedAt}
          </span>
        </div>

        {/* Task description */}
        <p className="mb-3.5 text-[13px] font-medium leading-relaxed text-text-primary line-clamp-2">
          {session.taskDescription}
        </p>

        {/* Meta row */}
        <div className="mb-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-accent/60" />
            {session.model}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {session.duration}
          </span>
          {session.filesChanged !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              {session.filesChanged} files changed
            </span>
          )}
        </div>

        {/* Repo + Branch */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-mono text-text-secondary">
            <GitBranch className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {session.repo}
              <span className="mx-0.5 text-border">/</span>
              <span className="text-text-primary">{session.branch}</span>
            </span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 border-t border-border pt-3.5">
          {session.status === 'running' && (
            <>
              <ActionButton icon={Terminal}>View Logs</ActionButton>
              <ActionButton icon={Square} variant="danger">
                Stop
              </ActionButton>
            </>
          )}
          {session.status === 'completed' && (
            <>
              <ActionButton icon={Terminal}>View Logs</ActionButton>
              <ActionButton icon={Diff}>View Diff</ActionButton>
              <ActionButton icon={Eye} variant="accent">
                Review Changes
              </ActionButton>
            </>
          )}
          {session.status === 'failed' && (
            <>
              <ActionButton icon={Terminal}>View Logs</ActionButton>
              <ActionButton icon={RotateCcw} variant="danger">
                Retry
              </ActionButton>
            </>
          )}
          {session.status === 'cancelled' && (
            <ActionButton icon={Terminal}>View Logs</ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-secondary">
        <Bot className="h-7 w-7 text-text-secondary" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-text-primary">
        No AI sessions yet
      </h3>
      <p className="mb-4 text-xs text-text-secondary">
        Start a new session to delegate work to an AI agent.
      </p>
      <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
        <Plus className="h-4 w-4" />
        New Session
      </button>
    </div>
  )
}

export default function SessionsView() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const counts = {
    running: MOCK_SESSIONS.filter((s) => s.status === 'running').length,
    completed: MOCK_SESSIONS.filter((s) => s.status === 'completed').length,
    failed: MOCK_SESSIONS.filter((s) => s.status === 'failed').length,
  }

  const filteredSessions =
    activeFilter === 'all'
      ? MOCK_SESSIONS
      : MOCK_SESSIONS.filter((s) => s.status === activeFilter)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sessions</h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            <span className="font-medium text-success">
              {counts.running} Running
            </span>
            <span className="mx-1.5 text-border">&middot;</span>
            <span>{counts.completed} Completed</span>
            <span className="mx-1.5 text-border">&middot;</span>
            <span className="font-medium text-danger">
              {counts.failed} Failed
            </span>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all duration-150 hover:bg-accent-hover hover:shadow-accent/30">
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border px-6 pt-2">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key
          const count =
            tab.key === 'all'
              ? MOCK_SESSIONS.length
              : MOCK_SESSIONS.filter((s) => s.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'bg-surface-hover text-text-secondary'
                  }`}
                >
                  {count}
                </span>
              </span>
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Session cards grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredSessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
