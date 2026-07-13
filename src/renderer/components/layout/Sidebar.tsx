import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Wrench, ListTodo, Settings, ChevronRight, FileText, GitBranch, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, useLanguage } from '@/lib/i18n'
import { useTabStore } from '@/stores/tabStore'

const statusColors: Record<string, string> = {
  online: 'bg-status-online',
  idle: 'bg-status-idle',
  running: 'bg-status-running',
  error: 'bg-status-error',
  offline: 'bg-status-offline',
}

const statusLabels: Record<string, string> = {
  online: '在线', idle: '空闲', running: '运行中', error: '错误', offline: '未安装',
}

const navIcons: Record<string, string> = {
  '/': '📊', '/skills': '🔧', '/chat': '💬', '/tasks': '📋',
  '/workflow': '🔀', '/analytics': '📈', '/changelog': '📝', '/settings': '⚙️',
}

const agentIcons: Record<string, string> = {
  mimocode: '🤖', claude: '🧠', codex: '⚡', coffee: '☕',
  doubao: '🫘', kimi: '🌙', qianwen: '🔮', yuanbao: '💎',
  claw: '🦞', antigravity: '🌌',
}

function Sidebar() {
  const [agents, setAgents] = useState<any[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const lang = useLanguage()
  const { addTab } = useTabStore()

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    const cached = localStorage.getItem('agent-scan-cache')
    if (cached) {
      setAgents(JSON.parse(cached))
    } else if (window.electronAPI?.scanAgents) {
      const detected = await window.electronAPI.scanAgents()
      setAgents(detected)
      localStorage.setItem('agent-scan-cache', JSON.stringify(detected))
    }
  }

  const handleAgentClick = (agent: any) => {
    const tabId = `agent-${agent.id}`
    addTab({
      id: tabId,
      title: agent.name,
      path: `/agent/${agent.id}`,
      icon: agentIcons[agent.id] || '🤖',
    })
    navigate(`/agent/${agent.id}`)
  }

  return (
    <aside className="w-60 border-r border-border bg-card/50 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Agents ({agents.length})
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => handleAgentClick(agent)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group',
              'hover:bg-accent hover:text-accent-foreground hover:translate-x-1',
              location.pathname === `/agent/${agent.id}` && 'bg-accent text-accent-foreground'
            )}
          >
            <div className="relative flex-shrink-0">
              <span className="text-lg">{agentIcons[agent.id] || '🤖'}</span>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                  statusColors[agent.status] || 'bg-status-offline'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm truncate block">{agent.name}</span>
              <span className="text-xs text-muted-foreground">
                {statusLabels[agent.status] || agent.status}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        {[
          { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
          { to: '/skills', icon: Wrench, label: t('nav.skills') },
          { to: '/chat', icon: MessageSquare, label: t('nav.chat') },
          { to: '/tasks', icon: ListTodo, label: t('nav.tasks') },
          { to: '/workflow', icon: GitBranch, label: '工作流' },
          { to: '/analytics', icon: BarChart3, label: '数据分析' },
          { to: '/changelog', icon: FileText, label: t('nav.changelog') },
          { to: '/settings', icon: Settings, label: t('nav.settings') },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => addTab({ id: item.to, title: item.label, path: item.to, icon: navIcons[item.to] })}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
              location.pathname === item.to
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
