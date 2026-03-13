import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useSettingsStore } from '../stores/settingsStore'
import type { PullRequest } from '../types'

interface RustPullRequest {
  id: string
  title: string
  number: number
  repo_name: string
  repo_owner: string
  state: string
  created_at: string
  updated_at: string
  additions: number
  deletions: number
  review_decision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null
  url: string
  author: string
  head_ref: string
  base_ref: string
  is_draft: boolean
}

function mapReviewDecision(
  decision: RustPullRequest['review_decision']
): PullRequest['reviewStatus'] {
  switch (decision) {
    case 'APPROVED':
      return 'approved'
    case 'CHANGES_REQUESTED':
      return 'changes_requested'
    case 'REVIEW_REQUIRED':
    case null:
    default:
      return 'pending'
  }
}

function mapPullRequest(raw: RustPullRequest): PullRequest {
  return {
    id: raw.id,
    title: raw.title,
    number: raw.number,
    repoName: raw.repo_name,
    repoOwner: raw.repo_owner,
    sourceBranch: raw.head_ref,
    targetBranch: raw.base_ref,
    author: raw.author,
    authorAvatar: '',
    additions: raw.additions,
    deletions: raw.deletions,
    reviewStatus: mapReviewDecision(raw.review_decision),
    ciStatus: 'none',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    isDraft: raw.is_draft,
    url: raw.url,
  }
}

export function usePullRequests() {
  const githubToken = useSettingsStore((s) => s.githubToken)
  const githubUsername = useSettingsStore((s) => s.githubUsername)

  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!githubToken || !githubUsername) return

    setLoading(true)
    setError(null)

    try {
      const rawPrs = await invoke<RustPullRequest[]>('fetch_pull_requests', {
        token: githubToken,
        username: githubUsername,
      })
      setPullRequests(rawPrs.map(mapPullRequest))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [githubToken, githubUsername])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { pullRequests, loading, error, refetch }
}
