export type ViewMode = 'ic' | 'lead'

export type SessionStatus = 'running' | 'completed' | 'failed' | 'stopped' | 'waiting_for_input'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export type NotificationType = 'pr' | 'ticket' | 'ai_session' | 'slack'

export interface PullRequest {
  id: string
  title: string
  repoName: string
  repoOwner: string
  number: number
  sourceBranch: string
  targetBranch: string
  author: string
  authorAvatar: string
  additions: number
  deletions: number
  reviewStatus: 'approved' | 'changes_requested' | 'pending' | 'dismissed'
  ciStatus: 'passing' | 'failing' | 'pending' | 'none'
  createdAt: string
  updatedAt: string
  isDraft: boolean
  url: string
}

export interface PRFile {
  filename: string
  status: 'added' | 'modified' | 'removed' | 'renamed'
  additions: number
  deletions: number
  patch: string
}

export interface PRReview {
  id: string
  author: string
  authorAvatar: string
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed'
  body: string
  submittedAt: string
}

export interface LinearState {
  id: string
  name: string
  color: string
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'
}

export interface LinearTeam {
  id: string
  name: string
  key: string
  icon: string
}

export interface LinearIssue {
  id: string
  identifier: string
  title: string
  description: string
  state: LinearState
  priority: 0 | 1 | 2 | 3 | 4
  assignee: {
    name: string
    avatar: string
  } | null
  team: LinearTeam
  createdAt: string
  updatedAt: string
  url: string
  labels: { name: string; color: string }[]
}

export interface AISession {
  id: string
  status: SessionStatus
  ticket_id: string | null
  task_description: string
  started_at: string
  model: string | null
}

export interface SessionOutputLine {
  timestamp: string
  stream: 'stdout' | 'stderr' | 'user_input'
  content: string
}

export interface SessionOutputEvent {
  session_id: string
  line: SessionOutputLine
}

export interface SessionStatusEvent {
  session_id: string
  status: SessionStatus
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface Settings {
  connections: {
    github: ConnectionStatus
    linear: ConnectionStatus
    slack: ConnectionStatus
  }
  notifications: {
    pr: boolean
    ticket: boolean
    aiSession: boolean
    slack: boolean
  }
  appearance: {
    theme: 'dark' | 'light'
    density: 'compact' | 'comfortable'
  }
  aiConfig: {
    model: string
    autoPush: boolean
    systemPrompt: string
  }
}
