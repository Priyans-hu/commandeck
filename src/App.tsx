import { useEffect, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAppStore } from './stores/appStore'
import { useSettingsStore } from './stores/settingsStore'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import InboxView from './components/views/InboxView'
import TicketsView from './components/views/TicketsView'
import PullRequestsView from './components/views/PullRequestsView'
import SessionsView from './components/views/SessionsView'
import SessionPanel from './components/views/SessionPanel'
import SettingsView from './components/views/SettingsView'
import OnboardingWizard from './components/onboarding/OnboardingWizard'
import CommandPalette from './components/CommandPalette'

function App() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const theme = useSettingsStore((s) => s.appearance.theme)
  const density = useSettingsStore((s) => s.appearance.density)
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted)

  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!onboardingCompleted) {
    return <OnboardingWizard />
  }

  return (
    <div className="flex h-screen bg-surface" data-theme={theme} data-density={density}>
      <Sidebar />
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
      >
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<InboxView />} />
            <Route path="/tickets" element={<TicketsView />} />
            <Route path="/pull-requests" element={<PullRequestsView />} />
            <Route path="/sessions" element={<SessionsView />} />
            <Route path="/sessions/:sessionId" element={<SessionPanel />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

export default App
