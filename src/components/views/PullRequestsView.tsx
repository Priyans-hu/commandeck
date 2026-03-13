import { useState, useEffect, useCallback } from 'react'
import {
  GitPullRequest,
  Check,
  X,
  Loader2,
  ArrowRight,
  Eye,
  ThumbsUp,
  MessageSquareWarning,
  ExternalLink,
  FileCode,
  Plus,
  Minus as MinusIcon,
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import type { PullRequest } from '../../types'
import { usePullRequests } from '../../hooks/usePullRequests'
import { useSettingsStore } from '../../stores/settingsStore'

// --- Helpers ---

interface DiffFile {
  filename: string
  status: string
  additions: number
  deletions: number
  patch: string | null
}

function getAuthorInitials(author: string): string {
  return author.slice(0, 2).toUpperCase()
}

function getAuthorColor(author: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
  let hash = 0
  for (let i = 0; i < author.length; i++) hash = author.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// --- Sub-components ---

function StatusIcon({ state }: { state: 'open' | 'draft' }) {
  switch (state) {
    case 'open':
      return <GitPullRequest className="h-4 w-4 text-success" />
    case 'draft':
      return <GitPullRequest className="h-4 w-4 text-text-secondary" />
  }
}

function CIStatusIcon({ status }: { status: PullRequest['ciStatus'] }) {
  switch (status) {
    case 'passing':
      return <Check className="h-3.5 w-3.5 text-success" />
    case 'failing':
      return <X className="h-3.5 w-3.5 text-danger" />
    case 'pending':
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-warning" />
    case 'none':
      return null
  }
}

const reviewBadgeStyles = {
  approved: {
    label: 'Approved',
    classes: 'border-success/25 bg-success/10 text-success',
  },
  changes_requested: {
    label: 'Changes Requested',
    classes: 'border-danger/25 bg-danger/10 text-danger',
  },
  pending: {
    label: 'Pending Review',
    classes: 'border-warning/25 bg-warning/10 text-warning',
  },
  dismissed: {
    label: 'No Reviews',
    classes: 'border-border bg-surface-hover text-text-secondary',
  },
}

function ReviewBadge({ status }: { status: PullRequest['reviewStatus'] }) {
  const style = reviewBadgeStyles[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${style.classes}`}
    >
      {style.label}
    </span>
  )
}

// --- PR Detail Panel ---

function PRDetailPanel({
  pr,
  onClose,
}: {
  pr: PullRequest
  onClose: () => void
}) {
  const githubToken = useSettingsStore((s) => s.githubToken)
  const [diffFiles, setDiffFiles] = useState<DiffFile[]>([])
  const [diffLoading, setDiffLoading] = useState(true)
  const [diffError, setDiffError] = useState<string | null>(null)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const state = pr.isDraft ? 'draft' : 'open'

  const fetchDiff = useCallback(async () => {
    if (!githubToken) {
      setDiffLoading(false)
      return
    }

    try {
      const files = await invoke<DiffFile[]>('fetch_pr_diff', {
        token: githubToken,
        owner: pr.repoOwner,
        repo: pr.repoName,
        prNumber: pr.number,
      })
      setDiffFiles(files)
    } catch (err) {
      setDiffError(err instanceof Error ? err.message : String(err))
    } finally {
      setDiffLoading(false)
    }
  }, [githubToken, pr.repoOwner, pr.repoName, pr.number])

  useEffect(() => {
    fetchDiff()
  }, [fetchDiff])

  const toggleFile = (filename: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(filename)) next.delete(filename)
      else next.add(filename)
      return next
    })
  }

  const statusBadgeColor: Record<string, string> = {
    added: 'text-success bg-success/10 border-success/25',
    modified: 'text-warning bg-warning/10 border-warning/25',
    removed: 'text-danger bg-danger/10 border-danger/25',
    renamed: 'text-accent bg-accent/10 border-accent/25',
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-40 h-full w-[480px] border-l border-border bg-surface overflow-y-auto shadow-xl">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2">
              <StatusIcon state={state} />
              {pr.isDraft && (
                <span className="rounded border border-border bg-surface-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Draft
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-text-primary mb-2">{pr.title}</h2>

          {/* Repo + PR number */}
          <p className="text-sm text-text-secondary mb-4">
            <span className="font-medium">{pr.repoOwner}/{pr.repoName}</span>
            <span className="ml-2 text-border">#{pr.number}</span>
          </p>

          {/* Branch flow */}
          <div className="flex items-center gap-2 mb-4">
            <code className="rounded bg-surface-secondary px-2 py-1 text-xs text-accent">
              {pr.sourceBranch}
            </code>
            <ArrowRight className="h-3.5 w-3.5 text-text-secondary/60" />
            <code className="rounded bg-surface-secondary px-2 py-1 text-xs text-text-secondary">
              {pr.targetBranch}
            </code>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: getAuthorColor(pr.author) }}
            >
              {getAuthorInitials(pr.author)}
            </div>
            <span className="text-sm text-text-primary">{pr.author}</span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <ReviewBadge status={pr.reviewStatus} />
            {pr.ciStatus !== 'none' && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface-secondary">
                  <CIStatusIcon status={pr.ciStatus} />
                </div>
                <span className="text-xs text-text-secondary capitalize">{pr.ciStatus}</span>
              </div>
            )}
          </div>

          {/* Line changes */}
          <div className="flex items-center gap-3 mb-5 font-mono text-sm">
            <span className="flex items-center gap-1 text-success">
              <Plus className="h-3.5 w-3.5" />
              {pr.additions}
            </span>
            <span className="flex items-center gap-1 text-danger">
              <MinusIcon className="h-3.5 w-3.5" />
              {pr.deletions}
            </span>
          </div>

          {/* Open in GitHub */}
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              invoke('open_url', { url: pr.url }).catch(() => window.open(pr.url, '_blank'))
            }}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <ExternalLink className="h-4 w-4" />
            Open in GitHub
          </a>

          {/* Divider */}
          <div className="border-t border-border mb-5" />

          {/* File changes */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <FileCode className="h-4 w-4 text-text-secondary" />
              File Changes
              {diffFiles.length > 0 && (
                <span className="text-xs font-normal text-text-secondary">
                  ({diffFiles.length} file{diffFiles.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>

            {diffLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading diff...
              </div>
            )}

            {diffError && (
              <p className="py-4 text-sm text-danger">{diffError}</p>
            )}

            {!diffLoading && !diffError && diffFiles.length === 0 && (
              <p className="py-4 text-sm text-text-secondary">No file changes found.</p>
            )}

            {!diffLoading && diffFiles.map((file) => (
              <div key={file.filename} className="mb-2 rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleFile(file.filename)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <span
                    className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeColor[file.status] || 'text-text-secondary bg-surface-secondary border-border'}`}
                  >
                    {file.status.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-mono text-text-primary">
                    {file.filename}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="text-success">+{file.additions}</span>
                    <span className="text-danger">-{file.deletions}</span>
                  </span>
                </button>

                {expandedFiles.has(file.filename) && file.patch && (
                  <div className="border-t border-border bg-surface-secondary/50 overflow-x-auto">
                    <pre className="p-3 text-[11px] leading-relaxed font-mono">
                      {file.patch.split('\n').map((line, i) => {
                        let lineClass = 'text-text-secondary'
                        if (line.startsWith('+')) lineClass = 'text-success bg-success/5'
                        else if (line.startsWith('-')) lineClass = 'text-danger bg-danger/5'
                        else if (line.startsWith('@@')) lineClass = 'text-accent'

                        return (
                          <div key={i} className={`${lineClass} px-1`}>
                            {line}
                          </div>
                        )
                      })}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// --- PR Row ---

function PRRow({
  pr,
  onClick,
}: {
  pr: PullRequest
  onClick: () => void
}) {
  const state = pr.isDraft ? 'draft' : 'open'
  const initials = getAuthorInitials(pr.author)
  const color = getAuthorColor(pr.author)

  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer items-center gap-4 border-b border-border px-5 py-3.5 transition-colors hover:bg-surface-hover ${
        pr.isDraft ? 'opacity-60' : ''
      }`}
    >
      {/* Status icon */}
      <div className="flex-shrink-0 pt-0.5">
        <StatusIcon state={state} />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Title line */}
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-text-primary">
            {pr.title}
          </h3>
          {pr.isDraft && (
            <span className="flex-shrink-0 rounded border border-border bg-surface-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Draft
            </span>
          )}
        </div>

        {/* Meta line */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span className="font-medium">
            {pr.repoOwner}/{pr.repoName}
          </span>

          <span className="text-border">#{pr.number}</span>

          {/* Branch flow */}
          <span className="flex items-center gap-1.5">
            <code className="rounded bg-surface-secondary px-1.5 py-0.5 text-[11px] text-accent">
              {pr.sourceBranch}
            </code>
            <ArrowRight className="h-3 w-3 text-text-secondary/60" />
            <code className="rounded bg-surface-secondary px-1.5 py-0.5 text-[11px] text-text-secondary">
              {pr.targetBranch}
            </code>
          </span>

          {/* Line changes */}
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-success">+{pr.additions}</span>
            <span className="text-danger">-{pr.deletions}</span>
          </span>
        </div>
      </div>

      {/* Right side: badges, CI, age, avatar, actions */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <ReviewBadge status={pr.reviewStatus} />

        {/* CI status circle */}
        {pr.ciStatus !== 'none' && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-secondary">
            <CIStatusIcon status={pr.ciStatus} />
          </div>
        )}

        {/* Age */}
        <span className="w-14 text-right text-xs tabular-nums text-text-secondary">
          {getTimeAgo(pr.updatedAt)}
        </span>

        {/* Author avatar */}
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: color }}
          title={pr.author}
        >
          {initials}
        </div>

        {/* Quick action buttons (visible on hover) */}
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-border bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <Eye className="h-3.5 w-3.5" />
            Review
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20"
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
          >
            <MessageSquareWarning className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main component ---

type Tab = 'my_prs' | 'review_requested'

export default function PullRequestsView() {
  const [activeTab, setActiveTab] = useState<Tab>('my_prs')
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null)

  const { pullRequests, loading, error, refetch } = usePullRequests()
  const githubUsername = useSettingsStore((s) => s.githubUsername)

  const myPRs = pullRequests.filter((pr) => pr.author === githubUsername)
  const reviewRequested = pullRequests.filter((pr) => pr.author !== githubUsername)
  const activePRs = activeTab === 'my_prs' ? myPRs : reviewRequested
  const openCount = activePRs.length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'my_prs', label: 'My PRs', count: myPRs.length },
    {
      key: 'review_requested',
      label: 'Review Requested',
      count: reviewRequested.length,
    },
  ]

  // Loading state
  if (loading && pullRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-text-secondary">Loading pull requests...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
            <X className="h-7 w-7 text-danger" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-text-primary">Failed to load pull requests</h3>
          <p className="mb-4 max-w-xs text-xs text-text-secondary">{error}</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state (no GitHub connection)
  if (!githubUsername && pullRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary">
            <GitPullRequest className="h-7 w-7 text-text-secondary" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-text-primary">No GitHub account connected</h3>
          <p className="text-xs text-text-secondary">
            Connect your GitHub account in Settings to see your pull requests.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                activeTab === tab.key
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-text-secondary'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Summary header */}
      <div className="flex items-center border-b border-border px-5 py-3">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{openCount}</span>{' '}
          open pull request{openCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* PR list */}
      <div className="flex-1 overflow-y-auto">
        {activePRs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary">
                <GitPullRequest className="h-7 w-7 text-text-secondary" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-text-primary">
                {activeTab === 'my_prs'
                  ? 'No pull requests'
                  : 'No reviews requested'}
              </h3>
              <p className="text-xs text-text-secondary">
                {activeTab === 'my_prs'
                  ? 'Your open pull requests will appear here.'
                  : 'PRs needing your review will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          activePRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} onClick={() => setSelectedPR(pr)} />
          ))
        )}
      </div>

      {/* PR Detail Panel */}
      {selectedPR && (
        <PRDetailPanel pr={selectedPR} onClose={() => setSelectedPR(null)} />
      )}
    </div>
  )
}
