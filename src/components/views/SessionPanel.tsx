import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/core'
import {
  ArrowLeft,
  Square,
  X,
  Check,
  Send,
  Loader2,
  CircleDot,
  AlertCircle,
  MinusCircle,
} from 'lucide-react'
import type { SessionOutputLine, SessionStatus } from '../../types'
import { useSessionStore } from '../../stores/sessionStore'

const statusConfig: Record<
  SessionStatus,
  {
    label: string
    dotClass: string
    badgeClass: string
    icon: typeof Check
    pulse?: boolean
  }
> = {
  running: {
    label: 'Claude is working...',
    dotClass: 'bg-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
    icon: Loader2,
    pulse: true,
  },
  waiting_for_input: {
    label: 'Waiting for your input',
    dotClass: 'bg-accent',
    badgeClass: 'bg-accent/10 text-accent border-accent/20',
    icon: CircleDot,
  },
  completed: {
    label: 'Session completed',
    dotClass: 'bg-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
    icon: Check,
  },
  failed: {
    label: 'Session failed',
    dotClass: 'bg-danger',
    badgeClass: 'bg-danger/10 text-danger border-danger/20',
    icon: AlertCircle,
  },
  stopped: {
    label: 'Session stopped',
    dotClass: 'bg-text-secondary',
    badgeClass:
      'bg-text-secondary/10 text-text-secondary border-text-secondary/20',
    icon: MinusCircle,
  },
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${config.badgeClass}`}
    >
      {config.pulse ? (
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

function OutputLine({ line }: { line: SessionOutputLine }) {
  if (line.stream === 'user_input') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
          <span className="text-[11px] font-semibold text-accent mb-0.5 block">
            You:
          </span>
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-text-primary">
            {line.content}
          </pre>
        </div>
      </div>
    )
  }

  const isStderr = line.stream === 'stderr'

  return (
    <div className="flex justify-start">
      <pre
        className={`whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed ${
          isStderr ? 'text-warning/80' : 'text-text-primary'
        }`}
      >
        {line.content}
      </pre>
    </div>
  )
}

export default function SessionPanel() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const sessions = useSessionStore((s) => s.sessions)
  const outputBuffers = useSessionStore((s) => s.outputBuffers)
  const setActiveSession = useSessionStore((s) => s.setActiveSession)
  const appendOutput = useSessionStore((s) => s.appendOutput)

  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [userScrolledUp, setUserScrolledUp] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevOutputLengthRef = useRef(0)

  const session = sessions.find((s) => s.id === sessionId)
  const outputLines = sessionId ? outputBuffers[sessionId] ?? [] : []

  const isTerminal =
    session?.status === 'completed' ||
    session?.status === 'failed' ||
    session?.status === 'stopped'

  // Set active session on mount, load history
  useEffect(() => {
    if (!sessionId) return

    setActiveSession(sessionId)

    invoke<SessionOutputLine[]>('get_session_output', { sessionId })
      .then((lines) => {
        if (lines && lines.length > 0) {
          for (const line of lines) {
            appendOutput(sessionId, line)
          }
        }
      })
      .catch((err) => {
        console.error('SessionPanel: Failed to load session output', err)
      })

    return () => {
      setActiveSession(null)
    }
  }, [sessionId, setActiveSession, appendOutput])

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputLines.length > prevOutputLengthRef.current && !userScrolledUp) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    prevOutputLengthRef.current = outputLines.length
  }, [outputLines.length, userScrolledUp])

  // Track user scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setUserScrolledUp(!isAtBottom)
  }, [])

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value)
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },
    [],
  )

  const handleSend = useCallback(async () => {
    if (!sessionId || !inputValue.trim() || isSending || isTerminal) return

    const message = inputValue.trim()
    setInputValue('')
    setIsSending(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      await invoke('send_session_input', { sessionId, message })
    } catch (err) {
      console.error('SessionPanel: Failed to send input', err)
    } finally {
      setIsSending(false)
    }
  }, [sessionId, inputValue, isSending, isTerminal])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleStop = useCallback(async () => {
    if (!sessionId) return
    try {
      await invoke('stop_session', { sessionId })
    } catch (err) {
      console.error('SessionPanel: Failed to stop session', err)
    }
  }, [sessionId])

  const handleClose = useCallback(() => {
    navigate('/sessions')
  }, [navigate])

  const placeholderText = isTerminal
    ? 'Session has ended'
    : session?.status === 'waiting_for_input'
      ? 'Type your response...'
      : 'Send a message...'

  const titleText = [session?.ticket_id, session?.task_description]
    .filter(Boolean)
    .join(' - ')

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-secondary px-4 py-3">
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-text-primary">
            {titleText || 'Session'}
          </h2>
        </div>

        {session && <StatusBadge status={session.status} />}

        <div className="flex items-center gap-1.5">
          {session?.status === 'running' && (
            <button
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-all duration-150 hover:bg-danger/20"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          )}
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-150 hover:bg-surface-hover hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {outputLines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
              <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
            </div>
            <p className="text-sm text-text-secondary">
              Waiting for session output...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {outputLines.map((line, i) => (
              <OutputLine key={i} line={line} />
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-surface-secondary p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isTerminal}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[13px] text-text-primary placeholder-text-secondary/60 transition-colors focus:border-accent/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isTerminal || !inputValue.trim() || isSending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {!isTerminal && (
          <p className="mt-1.5 text-[11px] text-text-secondary/60">
            Press{' '}
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px]">
              {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter
            </kbd>{' '}
            to send
          </p>
        )}
      </div>
    </div>
  )
}
