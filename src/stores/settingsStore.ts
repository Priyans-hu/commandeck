import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConnectionStatus } from '../types'

interface SettingsState {
  githubToken: string
  githubUsername: string
  linearApiKey: string
  slackBotToken: string
  onboardingCompleted: boolean
  connections: {
    github: ConnectionStatus
    linear: ConnectionStatus
    slack: ConnectionStatus
  }
  notifications: {
    permissionGranted: boolean
    pr: boolean
    ticket: boolean
    aiSessionComplete: boolean
    aiSessionFailure: boolean
    slack: boolean
  }
  appearance: {
    theme: 'dark' | 'light'
    density: 'compact' | 'comfortable'
    viewMode: 'ic' | 'lead'
  }
  aiConfig: {
    model: string
    autoPush: boolean
    autoCreatePR: boolean
    systemPrompt: string
    repoPath: string
  }

  setGithubToken: (token: string) => void
  setGithubUsername: (username: string) => void
  setLinearApiKey: (key: string) => void
  setSlackBotToken: (token: string) => void
  setOnboardingCompleted: (completed: boolean) => void
  setConnection: (service: 'github' | 'linear' | 'slack', status: ConnectionStatus) => void
  setNotificationPermission: (granted: boolean) => void
  setNotificationPreference: (type: keyof Omit<SettingsState['notifications'], 'permissionGranted'>, enabled: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  setDensity: (density: 'compact' | 'comfortable') => void
  setViewMode: (mode: 'ic' | 'lead') => void
  setAiModel: (model: string) => void
  setAutoPush: (enabled: boolean) => void
  setAutoCreatePR: (enabled: boolean) => void
  setSystemPrompt: (prompt: string) => void
  setRepoPath: (path: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      githubToken: '',
      githubUsername: '',
      linearApiKey: '',
      slackBotToken: '',
      onboardingCompleted: false,
      connections: {
        github: 'disconnected',
        linear: 'disconnected',
        slack: 'disconnected',
      },
      notifications: {
        permissionGranted: false,
        pr: true,
        ticket: true,
        aiSessionComplete: true,
        aiSessionFailure: true,
        slack: false,
      },
      appearance: {
        theme: 'dark',
        density: 'comfortable',
        viewMode: 'ic',
      },
      aiConfig: {
        model: 'claude-opus-4-6',
        autoPush: false,
        autoCreatePR: false,
        systemPrompt: '',
        repoPath: '',
      },

      setGithubToken: (token) => set({ githubToken: token }),
      setGithubUsername: (username) => set({ githubUsername: username }),
      setLinearApiKey: (key) => set({ linearApiKey: key }),
      setSlackBotToken: (token) => set({ slackBotToken: token }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      setConnection: (service, status) =>
        set((state) => ({
          connections: { ...state.connections, [service]: status },
        })),

      setNotificationPermission: (granted) =>
        set((state) => ({
          notifications: { ...state.notifications, permissionGranted: granted },
        })),

      setNotificationPreference: (type, enabled) =>
        set((state) => ({
          notifications: { ...state.notifications, [type]: enabled },
        })),

      setTheme: (theme) =>
        set((state) => ({
          appearance: { ...state.appearance, theme },
        })),

      setDensity: (density) =>
        set((state) => ({
          appearance: { ...state.appearance, density },
        })),

      setViewMode: (mode) =>
        set((state) => ({
          appearance: { ...state.appearance, viewMode: mode },
        })),

      setAiModel: (model) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, model },
        })),

      setAutoPush: (enabled) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, autoPush: enabled },
        })),

      setAutoCreatePR: (enabled) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, autoCreatePR: enabled },
        })),

      setSystemPrompt: (prompt) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, systemPrompt: prompt },
        })),

      setRepoPath: (path) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, repoPath: path },
        })),
    }),
    {
      name: 'commandeck-settings',
    }
  )
)
