import { useState } from 'react'
import {
  GitPullRequest,
  GitMerge,
  Check,
  X,
  Loader2,
  ArrowRight,
  Eye,
  ThumbsUp,
  MessageSquareWarning,
} from 'lucide-react'
import type { PullRequest } from '../../types'

// Extended PR type for view-specific fields not in base type
interface PRViewData extends PullRequest {
  state: 'open' | 'draft' | 'closed' | 'merged'
  authorInitials: string
  authorColor: string
  isReviewRequested: boolean
}

const MOCK_PRS: PRViewData[] = [
  {
    id: '1',
    title: 'feat: add OAuth2 PKCE flow for GitHub integration',
    repoName: 'core',
    repoOwner: 'commandeck',
    number: 47,
    sourceBranch: 'feat/oauth-pkce',
    targetBranch: 'main',
    author: 'Priyanshu',
    authorAvatar: '',
    additions: 142,
    deletions: 38,
    reviewStatus: 'approved',
    ciStatus: 'passing',
    createdAt: '2026-03-12T06:00:00Z',
    updatedAt: '2026-03-12T08:00:00Z',
    isDraft: false,
    url: '#',
    state: 'open',
    authorInitials: 'PG',
    authorColor: '#6366f1',
    isReviewRequested: false,
  },
  {
    id: '2',
    title: 'fix: resolve race condition in WebSocket reconnection logic',
    repoName: 'core',
    repoOwner: 'commandeck',
    number: 45,
    sourceBranch: 'fix/ws-reconnect',
    targetBranch: 'main',
    author: 'Priyanshu',
    authorAvatar: '',
    additions: 67,
    deletions: 23,
    reviewStatus: 'changes_requested',
    ciStatus: 'failing',
    createdAt: '2026-03-11T08:00:00Z',
    updatedAt: '2026-03-12T07:00:00Z',
    isDraft: false,
    url: '#',
    state: 'open',
    authorInitials: 'PG',
    authorColor: '#6366f1',
    isReviewRequested: false,
  },
  {
    id: '3',
    title: 'chore: migrate from Webpack to Vite for dev server',
    repoName: 'dashboard',
    repoOwner: 'commandeck',
    number: 42,
    sourceBranch: 'chore/vite-migration',
    targetBranch: 'main',
    author: 'Priyanshu',
    authorAvatar: '',
    additions: 312,
    deletions: 487,
    reviewStatus: 'pending',
    ciStatus: 'pending',
    createdAt: '2026-03-09T10:00:00Z',
    updatedAt: '2026-03-12T06:00:00Z',
    isDraft: true,
    url: '#',
    state: 'draft',
    authorInitials: 'PG',
    authorColor: '#6366f1',
    isReviewRequested: false,
  },
  {
    id: '4',
    title: 'feat: implement notification preferences panel',
    repoName: 'core',
    repoOwner: 'commandeck',
    number: 46,
    sourceBranch: 'feat/notification-prefs',
    targetBranch: 'main',
    author: 'Alex Chen',
    authorAvatar: '',
    additions: 234,
    deletions: 12,
    reviewStatus: 'pending',
    ciStatus: 'passing',
    createdAt: '2026-03-12T03:00:00Z',
    updatedAt: '2026-03-12T07:30:00Z',
    isDraft: false,
    url: '#',
    state: 'open',
    authorInitials: 'AC',
    authorColor: '#22c55e',
    isReviewRequested: true,
  },
  {
    id: '5',
    title: 'refactor: extract sidebar into composable layout system',
    repoName: 'dashboard',
    repoOwner: 'commandeck',
    number: 44,
    sourceBranch: 'refactor/sidebar-layout',
    targetBranch: 'main',
    author: 'Maya Patel',
    authorAvatar: '',
    additions: 89,
    deletions: 156,
    reviewStatus: 'approved',
    ciStatus: 'passing',
    createdAt: '2026-03-11T20:00:00Z',
    updatedAt: '2026-03-12T04:00:00Z',
    isDraft: false,
    url: '#',
    state: 'open',
    authorInitials: 'MP',
    authorColor: '#f59e0b',
    isReviewRequested: true,
  },
  {
    id: '6',
    title: 'fix: dark mode color contrast issues on settings page',
    repoName: 'dashboard',
    repoOwner: 'commandeck',
    number: 41,
    sourceBranch: 'fix/dark-mode-contrast',
    targetBranch: 'main',
    author: 'Sam Lee',
    authorAvatar: '',
    additions: 28,
    deletions: 19,
    reviewStatus: 'approved',
    ciStatus: 'passing',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-10T15:00:00Z',
    isDraft: false,
    url: '#',
    state: 'merged',
    authorInitials: 'SL',
    authorColor: '#ef4444',
    isReviewRequested: true,
  },
]

// --- Sub-components ---

function StatusIcon({ state }: { state: PRViewData['state'] }) {
  switch (state) {
    case 'open':
      return <GitPullRequest className="h-4 w-4 text-success" />
    case 'draft':
      return <GitPullRequest className="h-4 w-4 text-text-secondary" />
    case 'closed':
      return <GitPullRequest className="h-4 w-4 text-danger" />
    case 'merged':
      return <GitMerge className="h-4 w-4 text-accent" />
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

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function PRRow({ pr }: { pr: PRViewData }) {
  const isDraft = pr.state === 'draft'
  const isClosed = pr.state === 'closed' || pr.state === 'merged'

  return (
    <div
      className={`group flex items-center gap-4 border-b border-border px-5 py-3.5 transition-colors hover:bg-surface-hover ${
        isDraft ? 'opacity-60' : ''
      }`}
    >
      {/* Status icon */}
      <div className="flex-shrink-0 pt-0.5">
        <StatusIcon state={pr.state} />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Title line */}
        <div className="flex items-center gap-2">
          <h3
            className={`truncate text-sm font-medium ${
              isClosed
                ? 'text-text-secondary line-through decoration-text-secondary/40'
                : 'text-text-primary'
            }`}
          >
            {pr.title}
          </h3>
          {isDraft && (
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
          style={{ backgroundColor: pr.authorColor }}
          title={pr.author}
        >
          {pr.authorInitials}
        </div>

        {/* Quick action buttons (visible on hover) */}
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover">
            <Eye className="h-3.5 w-3.5" />
            Review
          </button>
          {!isClosed && (
            <>
              <button className="flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20">
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20">
                <MessageSquareWarning className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Main component ---

type Tab = 'my_prs' | 'review_requested'

export default function PullRequestsView() {
  const [activeTab, setActiveTab] = useState<Tab>('my_prs')

  const myPRs = MOCK_PRS.filter((pr) => !pr.isReviewRequested)
  const reviewRequested = MOCK_PRS.filter((pr) => pr.isReviewRequested)
  const activePRs = activeTab === 'my_prs' ? myPRs : reviewRequested
  const openCount = activePRs.filter(
    (pr) => pr.state === 'open' || pr.state === 'draft'
  ).length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'my_prs', label: 'My PRs', count: myPRs.length },
    {
      key: 'review_requested',
      label: 'Review Requested',
      count: reviewRequested.length,
    },
  ]

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
          activePRs.map((pr) => <PRRow key={pr.id} pr={pr} />)
        )}
      </div>
    </div>
  )
}
