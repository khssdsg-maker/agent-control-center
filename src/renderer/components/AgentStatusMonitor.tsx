import { useState, useEffect } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface AgentStatus {
  id: string
  name: string
  status: 'online' | 'idle' | 'running' | 'offline'
  memoryUsage: number
}

function AgentStatusMonitor() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const refreshStatus = async () => {
    setLoading(true)
    if (window.electronAPI?.scanAgents) {
      const detected = await window.electronAPI.scanAgents()
      setAgents(detected.map((a: any) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        memoryUsage: a.memoryUsage || 0,
      })))
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshStatus()
    const timer = setInterval(refreshStatus, 30000) // 每30秒刷新
    return () => clearInterval(timer)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Agent 状态监控
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdate && <span className="text-xs text-muted-foreground">{lastUpdate}</span>}
          <Button size="sm" variant="ghost" onClick={refreshStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between text-sm">
              <span>{agent.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{agent.memoryUsage}MB</span>
                <Badge variant={agent.status === 'running' ? 'success' : agent.status === 'idle' ? 'secondary' : 'secondary'}>
                  {agent.status === 'running' ? '运行中' : agent.status === 'idle' ? '空闲' : '离线'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentStatusMonitor
