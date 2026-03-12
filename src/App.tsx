import { Routes, Route } from 'react-router-dom'
import { useAppStore } from './stores/appStore'
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

  return (
    <div className="flex h-screen bg-surface">
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
