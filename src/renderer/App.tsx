import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
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
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
