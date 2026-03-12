import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/core'
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
  Loader2,
  FolderOpen,
  Send,
  Pause,
} from 'lucide-react'
import { useSessionStore } from '../../stores/sessionStore'
import { useSessionEvents } from '../../hooks/useSessionEvents'
import type { AISession, SessionStatus } from '../../types'

type FilterTab = 'all' | 'running' | 'completed' | 'failed'

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
  waiting_for_input: {
    label: 'Waiting',
    dotClass: 'bg-accent',
    badgeClass: 'bg-accent/10 text-accent border-accent/20',
    icon: Pause,
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
  stopped: {
    label: 'Stopped',
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
  const config = statusConfig[status] || statusConfig.stopped
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
  onClick,
}: {
  children: React.ReactNode
  variant?: 'secondary' | 'danger' | 'accent'
  icon?: typeof Check
  onClick?: () => void
}) {
  const variantClasses = {
    secondary:
      'border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
    danger: 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
    accent: 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${variantClasses[variant]}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}

function SessionCard({ session }: { session: AISession }) {
  const navigate = useNavigate()
  const isRunning = session.status === 'running'

  const openSession = () => navigate(`/sessions/${session.id}`)
  const stopSession = async () => {
    try {
      await invoke('stop_session', { sessionId: session.id })
    } catch (e) {
      console.error('Failed to stop session:', e)
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-surface-secondary transition-all duration-200 hover:bg-surface-hover cursor-pointer ${
        isRunning
          ? 'border-accent/30 shadow-[0_0_24px_-8px_rgba(99,102,241,0.2)]'
          : 'border-border hover:border-border'
      }`}
      onClick={openSession}
    >
      {isRunning && (
        <div className="pointer-events-none absolute inset-0 rounded-xl">
          <div className="absolute inset-0 rounded-xl border border-accent/25 animate-pulse" />
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </div>
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={session.status} />
            {session.ticket_id && (
              <span className="font-mono text-xs font-medium text-accent">
                {session.ticket_id}
              </span>
            )}
          </div>
          <span className="text-[11px] text-text-secondary">
            {session.started_at}
          </span>
        </div>

        {/* Task description */}
        <p className="mb-3.5 text-[13px] font-medium leading-relaxed text-text-primary line-clamp-2">
          {session.task_description}
        </p>

        {/* Meta row */}
        <div className="mb-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          {session.model && (
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-accent/60" />
              {session.model}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 border-t border-border pt-3.5">
          <ActionButton icon={Terminal} variant="accent" onClick={openSession}>
            Open Session
          </ActionButton>
          {(session.status === 'running' || session.status === 'waiting_for_input') && (
            <ActionButton
              icon={Square}
              variant="danger"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                stopSession()
              } as unknown as () => void}
            >
              Stop
            </ActionButton>
          )}
          {session.status === 'failed' && (
            <ActionButton icon={RotateCcw} variant="danger">
              Retry
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// New Session Dialog
// ---------------------------------------------------------------------------

function NewSessionDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { addSession } = useSessionStore()
  const [taskDescription, setTaskDescription] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!taskDescription.trim()) return
    setLoading(true)
    try {
      const session = await invoke<AISession>('spawn_claude_session', {
        taskDescription: taskDescription.trim(),
        repoPath: repoPath.trim() || null,
        ticketId: ticketId.trim() || null,
        model: null,
      })
      addSession(session)
      onClose()
      navigate(`/sessions/${session.id}`)
    } catch (e) {
      console.error('Failed to spawn session:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface-secondary p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          New AI Session
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Task Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              placeholder="Describe the task for Claude..."
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Repository Path
            </label>
            <div className="relative">
              <FolderOpen
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="~/Projects/my-repo"
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Ticket ID (optional)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="SER-1234"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!taskDescription.trim() || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Send size={14} />
                Start Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onNew }: { onNew: () => void }) {
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
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        New Session
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export default function SessionsView() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { sessions, setSessions } = useSessionStore()

  // Listen to session events from Tauri backend
  useSessionEvents()

  // Fetch sessions on mount
  useEffect(() => {
    invoke<AISession[]>('get_active_sessions')
      .then(setSessions)
      .catch((e) => console.error('Failed to fetch sessions:', e))
  }, [setSessions])

  const counts = {
    running: sessions.filter(
      (s) => s.status === 'running' || s.status === 'waiting_for_input',
    ).length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    failed: sessions.filter((s) => s.status === 'failed').length,
  }

  const filteredSessions =
    activeFilter === 'all'
      ? sessions
      : activeFilter === 'running'
        ? sessions.filter(
            (s) => s.status === 'running' || s.status === 'waiting_for_input',
          )
        : sessions.filter((s) => s.status === activeFilter)

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
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all duration-150 hover:bg-accent-hover hover:shadow-accent/30"
        >
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
              ? sessions.length
              : tab.key === 'running'
                ? sessions.filter(
                    (s) =>
                      s.status === 'running' ||
                      s.status === 'waiting_for_input',
                  ).length
                : sessions.filter((s) => s.status === tab.key).length
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
          <EmptyState onNew={() => setDialogOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* New session dialog */}
      <NewSessionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
