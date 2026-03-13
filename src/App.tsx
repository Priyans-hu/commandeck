import { useEffect } from 'react'
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

function App() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const theme = useSettingsStore((s) => s.appearance.theme)
  const density = useSettingsStore((s) => s.appearance.density)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

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
    </div>
  )
}

export default App
