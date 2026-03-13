import { useState, useEffect, useCallback } from 'react'
import {
  Github,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  ExternalLink,
  Bug,
  Info,
  Sparkles,
  Bell,
  BellOff,
  Palette,
  Link2,
  ChevronDown,
  Users,
  User,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  FolderOpen,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAppStore } from '../../stores/appStore'
import type { ConnectionStatus, ViewMode } from '../../types'

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Save button with confirmation
// ---------------------------------------------------------------------------

function SaveButton({ onClick }: { onClick: () => void }) {
  const [saved, setSaved] = useState(false)

  const handleClick = () => {
    onClick()
    setSaved(true)
  }

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(t)
  }, [saved])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
        saved
          ? 'bg-success/15 text-success'
          : 'bg-accent text-white hover:bg-accent-hover'
      }`}
    >
      {saved ? (
        <>
          <CheckCircle2 size={14} />
          Saved
        </>
      ) : (
        <>
          <Save size={14} />
          Save
        </>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  onSave,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  children: React.ReactNode
  onSave?: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="text-xs text-text-secondary">{description}</p>
          </div>
        </div>
        {onSave && <SaveButton onClick={onSave} />}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Connection status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const map: Record<
    ConnectionStatus,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    connected: {
      label: 'Connected',
      cls: 'bg-success/10 text-success',
      icon: <CheckCircle2 size={12} />,
    },
    disconnected: {
      label: 'Not configured',
      cls: 'bg-border/60 text-text-secondary',
      icon: <XCircle size={12} />,
    },
    connecting: {
      label: 'Testing...',
      cls: 'bg-warning/10 text-warning',
      icon: <Loader2 size={12} className="animate-spin" />,
    },
    error: {
      label: 'Failed',
      cls: 'bg-danger/10 text-danger',
      icon: <XCircle size={12} />,
    },
  }

  const { label, cls, icon } = map[status]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {icon}
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Password input with reveal toggle
// ---------------------------------------------------------------------------

function SecretInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        disabled={disabled}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary disabled:cursor-not-allowed"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Selectable card with description
// ---------------------------------------------------------------------------

function SelectableCard({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
  badge,
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description?: string
  badge?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 transition-all ${
        selected
          ? 'border-accent bg-accent/5 text-accent'
          : 'border-border bg-surface text-text-secondary hover:border-border hover:bg-surface-hover'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <Icon size={20} />
      <span className={`text-xs font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}>
        {label}
      </span>
      {description && (
        <span className="text-[10px] text-text-secondary">{description}</span>
      )}
      {badge && (
        <span className="absolute -top-2 right-1.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
          {badge}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Connection row
// ---------------------------------------------------------------------------

function ConnectionRow({
  icon: Icon,
  name,
  helpLink,
  helpLinkText,
  scopeInfo,
  tokenValue,
  onTokenChange,
  placeholder,
  status,
  onTest,
  comingSoon = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  name: string
  helpLink: string
  helpLinkText: string
  scopeInfo?: string
  tokenValue: string
  onTokenChange: (v: string) => void
  placeholder: string
  status: ConnectionStatus
  onTest: () => void
  comingSoon?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 ${comingSoon ? '' : ''}`}
    >
      {comingSoon && (
        <span className="absolute -top-2 right-3 rounded-full bg-warning/15 px-2 py-0.5 text-[9px] font-semibold text-warning">
          Coming soon
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="text-text-primary" />
          <span className="text-sm font-medium text-text-primary">{name}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className={comingSoon ? 'opacity-50' : ''}>
        <SecretInput
          value={tokenValue}
          onChange={onTokenChange}
          placeholder={placeholder}
          disabled={comingSoon}
        />
      </div>

      <div
        className={`flex items-center justify-between ${comingSoon ? 'opacity-50' : ''}`}
      >
        <div className="text-[11px] text-text-secondary">
          {scopeInfo && (
            <span>
              Required scopes:{' '}
              {scopeInfo.split(', ').map((scope, i) => (
                <span key={scope}>
                  {i > 0 && ' '}
                  <code className="rounded bg-surface-hover px-1 py-0.5 text-[10px] text-text-primary">
                    {scope}
                  </code>
                </span>
              ))}
              {' \u00B7 '}
            </span>
          )}
          <a
            href={helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-accent hover:underline"
          >
            {helpLinkText}
            <ExternalLink size={10} />
          </a>
        </div>
        <button
          type="button"
          onClick={onTest}
          disabled={!tokenValue.trim() || status === 'connecting' || comingSoon}
          className="shrink-0 rounded-lg border border-border bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'connecting' ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Testing...
            </span>
          ) : (
            'Test Connection'
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Notification row
// ---------------------------------------------------------------------------

function NotificationRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Linear icon (inline SVG)
// ---------------------------------------------------------------------------

function LinearIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M2.1 13.32a10.28 10.28 0 0 0 8.58 8.58L2.1 13.32ZM1.76 10.62a10.3 10.3 0 0 0 11.62 11.62L1.76 10.62ZM4.15 4.15a10.29 10.29 0 0 0 .52 14.2L18.35 4.67a10.29 10.29 0 0 0-14.2-.52ZM22.24 13.38a10.3 10.3 0 0 1-11.62-11.62l11.62 11.62ZM21.9 10.68a10.28 10.28 0 0 1-8.58-8.58L21.9 10.68ZM19.85 19.85a10.29 10.29 0 0 0-.52-14.2L5.65 19.33a10.29 10.29 0 0 0 14.2.52Z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// AI model options
// ---------------------------------------------------------------------------

const AI_MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SettingsView() {
  const store = useSettingsStore()
  const { viewMode, setViewMode } = useAppStore()

  // Local form state -- connections
  const [ghToken, setGhToken] = useState(store.githubToken)
  const [linearKey, setLinearKey] = useState(store.linearApiKey)
  const [slackToken, setSlackToken] = useState(store.slackBotToken)

  // Local form state -- AI
  const [aiModel, setAiModel] = useState(store.aiConfig.model)
  const [autoPush, setAutoPush] = useState(store.aiConfig.autoPush)
  const [autoCreatePR, setAutoCreatePR] = useState(store.aiConfig.autoCreatePR)
  const [systemPrompt, setSystemPrompt] = useState(store.aiConfig.systemPrompt)
  const [defaultRepoPath, setDefaultRepoPath] = useState(store.aiConfig.repoPath)

  // Local form state -- notifications
  const [notifPermission, setNotifPermission] = useState(
    store.notifications.permissionGranted,
  )
  const [notifPR, setNotifPR] = useState(store.notifications.pr)
  const [notifTicket, setNotifTicket] = useState(store.notifications.ticket)
  const [notifAIComplete, setNotifAIComplete] = useState(
    store.notifications.aiSessionComplete,
  )
  const [notifAIFailure, setNotifAIFailure] = useState(
    store.notifications.aiSessionFailure,
  )
  const [notifSlack, setNotifSlack] = useState(store.notifications.slack)

  // Local form state -- appearance
  const [theme, setTheme] = useState<'dark' | 'light'>(store.appearance.theme)
  const [density, setDensity] = useState<'compact' | 'comfortable'>(
    store.appearance.density,
  )
  const [localViewMode, setLocalViewMode] = useState<ViewMode>(viewMode)

  // Simulate connection test
  const testConnection = useCallback(
    (service: 'github' | 'linear' | 'slack') => {
      store.setConnection(service, 'connecting')
      setTimeout(() => {
        const token =
          service === 'github'
            ? ghToken
            : service === 'linear'
              ? linearKey
              : slackToken
        store.setConnection(service, token.trim().length > 8 ? 'connected' : 'error')
      }, 1500)
    },
    [ghToken, linearKey, slackToken, store],
  )

  // Request notification permission (simulated Tauri notification API)
  const requestNotifPermission = useCallback(() => {
    setNotifPermission(true)
    store.setNotificationPermission(true)
  }, [store])

  // Save handlers
  const saveConnections = () => {
    store.setGithubToken(ghToken)
    store.setLinearApiKey(linearKey)
    store.setSlackBotToken(slackToken)
  }

  const saveAI = () => {
    store.setAiModel(aiModel)
    store.setAutoPush(autoPush)
    store.setAutoCreatePR(autoCreatePR)
    store.setSystemPrompt(systemPrompt)
    store.setRepoPath(defaultRepoPath)
  }

  const saveNotifications = () => {
    store.setNotificationPreference('pr', notifPR)
    store.setNotificationPreference('ticket', notifTicket)
    store.setNotificationPreference('aiSessionComplete', notifAIComplete)
    store.setNotificationPreference('aiSessionFailure', notifAIFailure)
    store.setNotificationPreference('slack', notifSlack)
  }

  const saveAppearance = () => {
    store.setTheme(theme)
    store.setDensity(density)
    store.setViewMode(localViewMode)
    setViewMode(localViewMode)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      {/* Connections */}
      <SectionCard
        icon={Link2}
        title="Connections"
        description="Connect your services to sync data into CommanDeck"
        onSave={saveConnections}
      >
        <div className="space-y-3">
          <ConnectionRow
            icon={Github}
            name="GitHub"
            helpLink="https://github.com/settings/tokens"
            helpLinkText="Generate a token at github.com/settings/tokens"
            scopeInfo="repo, read:user"
            tokenValue={ghToken}
            onTokenChange={setGhToken}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            status={store.connections.github}
            onTest={() => testConnection('github')}
          />
          <ConnectionRow
            icon={LinearIcon}
            name="Linear"
            helpLink="https://linear.app/settings/api"
            helpLinkText="Get your API key at linear.app/settings/api"
            tokenValue={linearKey}
            onTokenChange={setLinearKey}
            placeholder="lin_api_xxxxxxxxxxxxxxxxxxxx"
            status={store.connections.linear}
            onTest={() => testConnection('linear')}
          />
          <ConnectionRow
            icon={MessageSquare}
            name="Slack"
            helpLink="https://api.slack.com/apps"
            helpLinkText="Create a Slack app at api.slack.com/apps"
            tokenValue={slackToken}
            onTokenChange={setSlackToken}
            placeholder="xoxb-xxxxxxxxxxxxxxxxxxxx"
            status={store.connections.slack}
            onTest={() => testConnection('slack')}
            comingSoon
          />
        </div>
      </SectionCard>

      {/* AI Configuration */}
      <SectionCard
        icon={Sparkles}
        title="AI Configuration"
        description="Configure AI model and automation behaviour"
        onSave={saveAI}
      >
        <div className="space-y-4">
          {/* Model selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Default Model
            </label>
            <div className="relative">
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-9 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Auto-push</p>
              <p className="text-xs text-text-secondary">
                Automatically push AI changes to a branch
              </p>
            </div>
            <Toggle checked={autoPush} onChange={setAutoPush} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Auto-create PR
              </p>
              <p className="text-xs text-text-secondary">
                Create a PR after AI completes a task
              </p>
            </div>
            <Toggle checked={autoCreatePR} onChange={setAutoCreatePR} />
          </div>

          {/* System prompt */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Custom System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="Additional instructions for AI sessions..."
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Default repo path */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Default Repository Path
            </label>
            <div className="relative">
              <FolderOpen
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                value={defaultRepoPath}
                onChange={(e) => setDefaultRepoPath(e.target.value)}
                placeholder="~/Projects"
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              Base directory for repositories
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard
        icon={Bell}
        title="Notifications"
        description="Choose which events trigger desktop notifications"
        onSave={saveNotifications}
      >
        <div className="space-y-4">
          {!notifPermission && (
            <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <BellOff size={16} className="text-warning" />
                <span className="text-xs font-medium text-warning">
                  Notification permission not granted
                </span>
              </div>
              <button
                onClick={requestNotifPermission}
                className="rounded-lg bg-warning px-3 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
              >
                Request Permission
              </button>
            </div>
          )}

          <div className="space-y-3">
            <NotificationRow
              label="PR Reviews"
              description="When a pull request you authored receives a review"
              checked={notifPR}
              onChange={setNotifPR}
              disabled={!notifPermission}
            />
            <NotificationRow
              label="Ticket Assignments"
              description="When a Linear ticket is assigned to you"
              checked={notifTicket}
              onChange={setNotifTicket}
              disabled={!notifPermission}
            />
            <NotificationRow
              label="AI Session Completion"
              description="When an AI session finishes its task successfully"
              checked={notifAIComplete}
              onChange={setNotifAIComplete}
              disabled={!notifPermission}
            />
            <NotificationRow
              label="AI Session Failure"
              description="When an AI session encounters an error"
              checked={notifAIFailure}
              onChange={setNotifAIFailure}
              disabled={!notifPermission}
            />
            <NotificationRow
              label="Slack Mentions"
              description="When someone mentions you in a connected Slack workspace"
              checked={notifSlack}
              onChange={setNotifSlack}
              disabled={!notifPermission}
            />
          </div>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard
        icon={Palette}
        title="Appearance"
        description="Customize how CommanDeck looks and feels"
        onSave={saveAppearance}
      >
        <div className="space-y-5">
          {/* Theme */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              Theme
            </label>
            <div className="flex gap-3">
              <SelectableCard
                selected={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={Moon}
                label="Dark"
                description="Easy on the eyes"
              />
              <SelectableCard
                selected={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={Sun}
                label="Light"
                description="Classic bright look"
              />
            </div>
          </div>

          {/* Density */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              Density
            </label>
            <div className="flex gap-3">
              <SelectableCard
                selected={density === 'comfortable'}
                onClick={() => setDensity('comfortable')}
                icon={Maximize2}
                label="Comfortable"
                description="More spacing, easier to scan"
              />
              <SelectableCard
                selected={density === 'compact'}
                onClick={() => setDensity('compact')}
                icon={Minimize2}
                label="Compact"
                description="Fit more on screen"
              />
            </div>
          </div>

          {/* View mode */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
              View Mode
            </label>
            <div className="flex gap-3">
              <SelectableCard
                selected={localViewMode === 'ic'}
                onClick={() => setLocalViewMode('ic')}
                icon={User}
                label="IC"
                description="Individual contributor view"
              />
              <SelectableCard
                selected={localViewMode === 'lead'}
                onClick={() => setLocalViewMode('lead')}
                icon={Users}
                label="Lead / Manager"
                description="Team overview and delegation"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard
        icon={Info}
        title="About"
        description="CommanDeck — your developer command center"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">App Version</p>
              <p className="font-mono text-xs text-text-secondary">v0.1.0</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-text-primary">
              <RefreshCw size={12} />
              Check for updates
            </button>
          </div>

          <div className="flex gap-3">
            <a
              href="https://github.com/Priyans-hu/commandeck"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              <Github size={14} />
              GitHub Repo
              <ExternalLink size={10} className="text-text-secondary" />
            </a>
            <a
              href="https://github.com/Priyans-hu/commandeck/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              <Bug size={14} />
              Report a Bug
              <ExternalLink size={10} className="text-text-secondary" />
            </a>
            <a
              href="https://github.com/Priyans-hu/commandeck#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              <BookOpen size={14} />
              Documentation
              <ExternalLink size={10} className="text-text-secondary" />
            </a>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
