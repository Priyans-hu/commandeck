import { create } from 'zustand'
import type { AISession, SessionOutputLine, SessionStatus } from '../types'

interface SessionState {
  sessions: AISession[]
  outputBuffers: Record<string, SessionOutputLine[]>
  activeSessionId: string | null

  setSessions: (sessions: AISession[]) => void
  addSession: (session: AISession) => void
  updateSessionStatus: (sessionId: string, status: SessionStatus) => void
  appendOutput: (sessionId: string, line: SessionOutputLine) => void
  setActiveSession: (sessionId: string | null) => void
  removeSession: (sessionId: string) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  outputBuffers: {},
  activeSessionId: null,

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      outputBuffers: { ...state.outputBuffers, [session.id]: [] },
    })),

  updateSessionStatus: (sessionId, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status } : s,
      ),
    })),

  appendOutput: (sessionId, line) =>
    set((state) => ({
      outputBuffers: {
        ...state.outputBuffers,
        [sessionId]: [...(state.outputBuffers[sessionId] || []), line],
      },
    })),

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      outputBuffers: Object.fromEntries(
        Object.entries(state.outputBuffers).filter(([k]) => k !== sessionId),
      ),
    })),
}))
