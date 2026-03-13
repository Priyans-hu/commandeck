import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useSettingsStore } from '../stores/settingsStore'
import type { LinearIssue } from '../types'

interface RustLinearIssue {
  id: string
  identifier: string
  title: string
  description: string | null
  state: { name: string; color: string }
  priority: { label: string; number: number }
  assignee_name: string | null
  team: { id: string; name: string; key: string } | null
  labels: { name: string; color: string }[]
  created_at: string
  updated_at: string
  url: string
}

function inferStateType(name: string): LinearIssue['state']['type'] {
  const lower = name.toLowerCase()
  if (lower === 'in progress' || lower === 'in review') return 'started'
  if (lower === 'todo' || lower === 'backlog') return 'unstarted'
  if (lower === 'done') return 'completed'
  if (lower === 'canceled' || lower === 'cancelled') return 'canceled'
  return 'backlog'
}

function mapRustIssue(raw: RustLinearIssue): LinearIssue {
  return {
    id: raw.id,
    identifier: raw.identifier,
    title: raw.title,
    description: raw.description ?? '',
    state: {
      id: '',
      name: raw.state.name,
      color: raw.state.color,
      type: inferStateType(raw.state.name),
    },
    priority: raw.priority.number as LinearIssue['priority'],
    assignee: raw.assignee_name ? { name: raw.assignee_name, avatar: '' } : null,
    team: raw.team
      ? { id: raw.team.id, name: raw.team.name, key: raw.team.key, icon: '' }
      : { id: '', name: 'Unknown', key: '?', icon: '' },
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    url: raw.url,
    labels: raw.labels,
  }
}

export function useTickets() {
  const linearApiKey = useSettingsStore((s) => s.linearApiKey)
  const [tickets, setTickets] = useState<LinearIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!linearApiKey) {
      setTickets([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rawIssues = await invoke<RustLinearIssue[]>('fetch_issues', {
        apiKey: linearApiKey,
        teamId: null,
      })
      setTickets(rawIssues.map(mapRustIssue))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [linearApiKey])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { tickets, loading, error, refetch }
}
