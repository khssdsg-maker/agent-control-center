import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import SkillsPage from './pages/SkillsPage'
import ChatPage from './pages/ChatPage'
import AgentDetailPage from './pages/AgentDetailPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="agent/:agentId" element={<AgentDetailPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
