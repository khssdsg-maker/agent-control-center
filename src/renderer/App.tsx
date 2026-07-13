import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import GlobalSearch from './components/GlobalSearch'
import Dashboard from './pages/Dashboard'
import SkillsPage from './pages/SkillsPage'
import ChatPage from './pages/ChatPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import ChangelogPage from './pages/ChangelogPage'
import AgentDetailPage from './pages/AgentDetailPage'
import AnalyticsPage from './pages/AnalyticsPage'
import WorkflowPage from './pages/WorkflowPage'

function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    // Ctrl+F 打开搜索
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="changelog" element={<ChangelogPage />} />
            <Route path="agent/:agentId" element={<AgentDetailPage />} />
          </Route>
        </Routes>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
