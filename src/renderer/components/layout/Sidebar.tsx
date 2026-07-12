import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Wrench, ListTodo, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  online: 'bg-status-online',
  idle: 'bg-status-idle',
  running: 'bg-status-running',
  error: 'bg-status-error',
  offline: 'bg-status-offline',
}

const statusLabels: Record<string, string> = {
  online: '在线',
  idle: '空闲',
  running: '运行中',
  error: '错误',
  offline: '未安装',
}

function Sidebar() {
  const [agents, setAgents] = useState<any[]>([])
  const [icons, setIcons] = useState<Record<string, string>>({})
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    // 先从缓存加载
    const cached = localStorage.getItem('agent-scan-cache')
    if (cached) {
      const data = JSON.parse(cached)
      setAgents(data)
      loadIcons(data)
    } else {
      // 重新扫描
      if (window.electronAPI?.scanAgents) {
        const detected = await window.electronAPI.scanAgents()
        setAgents(detected)
        localStorage.setItem('agent-scan-cache', JSON.stringify(detected))
        loadIcons(detected)
      }
    }
  }

  async function loadIcons(agentList: any[]) {
    for (const agent of agentList) {
      if (agent.iconPath && !icons[agent.id]) {
        if (window.electronAPI?.extractIcon) {
          const iconPath = await window.electronAPI.extractIcon(agent.iconPath)
          if (iconPath) {
            setIcons((prev) => ({ ...prev, [agent.id]: iconPath }))
          }
        }
      }
    }
  }

  const handleAgentClick = (agentId: string) => {
    navigate(`/agent/${agentId}`)
  }

  return (
    <aside className="w-60 border-r border-border bg-card/50 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Agents ({agents.length})
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => handleAgentClick(agent.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group',
              'hover:bg-accent hover:text-accent-foreground',
              location.pathname === `/agent/${agent.id}` && 'bg-accent text-accent-foreground'
            )}
          >
            <div className="relative flex-shrink-0">
              {/* 使用真实图标 */}
              {icons[agent.id] ? (
                <img
                  src={icons[agent.id]}
                  alt={agent.name}
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    // 图标加载失败，显示 emoji
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-lg">{agent.icon}</span>
              )}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                  statusColors[agent.status] || 'bg-status-offline'
                )}
                title={statusLabels[agent.status] || agent.status}
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
        <NavItem to="/" icon={LayoutDashboard} label="仪表盘" active={location.pathname === '/'} />
        <NavItem to="/skills" icon={Wrench} label="技能管理" active={location.pathname === '/skills'} />
        <NavItem to="/chat" icon={MessageSquare} label="聊天记录" active={location.pathname === '/chat'} />
        <NavItem to="/tasks" icon={ListTodo} label="任务中心" active={location.pathname === '/tasks'} />
        <NavItem to="/settings" icon={Settings} label="设置" active={location.pathname === '/settings'} />
      </div>
    </aside>
  )
}

function NavItem({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{label}</span>
    </Link>
  )
}

export default Sidebar
