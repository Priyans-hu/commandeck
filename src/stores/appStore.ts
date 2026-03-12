import { create } from 'zustand'
import type { Notification, ViewMode } from '../types'

interface AppState {
  sidebarCollapsed: boolean
  viewMode: ViewMode
  activeTab: string
  notifications: Notification[]

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setViewMode: (mode: ViewMode) => void
  setActiveTab: (tab: string) => void
  addNotification: (notification: Notification) => void
  dismissNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  viewMode: 'ic',
  activeTab: 'inbox',
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))
