import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Activity, HardDrive, Cpu, RefreshCw, Search, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { estimateCPU, getMemoryInfo, simulateAgentMetrics } from '@/lib/monitor'
import { t, useLanguage } from '@/lib/i18n'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'secondary' }> = {
  online: { label: '在线', variant: 'success' },
  idle: { label: '空闲', variant: 'secondary' },
  running: { label: '运行中', variant: 'info' },
  error: { label: '错误', variant: 'error' },
  offline: { label: '未安装', variant: 'secondary' },
}

const typeLabels: Record<string, string> = { cli: 'CLI', desktop: '桌面' }

function formatSize(mb: number): string {
  if (mb === 0) return '0 MB'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function Dashboard() {
  const navigate = useNavigate()
  const lang = useLanguage()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [systemCpu, setSystemCpu] = useState(0)
  const [systemMem, setSystemMem] = useState({ used: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [agentIcons, setAgentIcons] = useState<Record<string, string>>({})

  useEffect(() => {
    loadFromCache()
    startMonitor()
  }, [])

  function loadFromCache() {
    const cached = localStorage.getItem('agent-scan-cache')
    if (cached) {
      setAgents(JSON.parse(cached))
      setLoading(false)
    } else {
      scanAgents()
    }
    // 加载自定义图标
    const settings = localStorage.getItem('app-settings')
    if (settings) {
      const s = JSON.parse(settings)
      if (s.agentIcons) setAgentIcons(s.agentIcons)
    }
  }

  async function scanAgents() {
    setScanning(true)
    if (window.electronAPI?.scanAgents) {
      const detected = await window.electronAPI.scanAgents()
      setAgents(detected)
      localStorage.setItem('agent-scan-cache', JSON.stringify(detected))
    }
    setScanning(false)
    setLoading(false)
  }

  function startMonitor() {
    const timer = setInterval(async () => {
      const cpu = await estimateCPU()
      const mem = getMemoryInfo()
      setSystemCpu(cpu)
      setSystemMem(mem)
    }, 3000)
    return () => clearInterval(timer)
  }

  const filteredAgents = agents.filter((a: any) =>
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineCount = agents.filter((a: any) => a.status !== 'offline').length
  const runningCount = agents.filter((a: any) => a.status === 'running').length

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full"><p className="text-muted-foreground">{t('app.loading')}</p></div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('dashboard.subtitle', { count: agents.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('dashboard.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={scanAgents} disabled={scanning} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-1 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? t('dashboard.scanning') : t('dashboard.scan')}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.agents')}</p>
                <p className="text-3xl font-bold">{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.installed')}</p>
                <p className="text-3xl font-bold">{onlineCount}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.running')}</p>
                <p className="text-3xl font-bold">{runningCount}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.cpu')}</p>
                <p className="text-3xl font-bold">{systemCpu}%</p>
              </div>
              <Cpu className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent 列表 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.detected')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent: any) => (
            <Card
              key={agent.id}
              className="hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/agent/${agent.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 图标：自定义 > 真实 > emoji */}
                  {agentIcons[agent.id] ? (
                    <img src={agentIcons[agent.id]} alt={agent.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xl">{agent.icon}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{agent.name}</h3>
                      <Badge variant={statusConfig[agent.status]?.variant ?? 'secondary'} className="text-xs">
                        {statusConfig[agent.status]?.label ?? agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{typeLabels[agent.type] || agent.type}</p>
                  </div>
                </div>
                {/* 资源条 */}
                {agent.status !== 'offline' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>CPU</span>
                      <span>{agent.cpu_usage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${agent.cpu_usage || 0}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
