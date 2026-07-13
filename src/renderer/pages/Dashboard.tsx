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

  async function loadFromCache() {
    // 从数据库加载缓存
    if (window.electronAPI?.getAgents) {
      const cached = await window.electronAPI.getAgents()
      if (cached && cached.length > 0) {
        setAgents(cached)
        setLoading(false)
        return
      }
    }
    scanAgents()
    // 加载自定义图标
    if (window.electronAPI?.getSettings) {
      const settings = await window.electronAPI.getSettings()
      if (settings?.agentIcons) setAgentIcons(settings.agentIcons)
    }
  }

  async function scanAgents() {
    setScanning(true)
    if (window.electronAPI?.scanAgents) {
      const detected = await window.electronAPI.scanAgents()
      setAgents(detected)
      if (window.electronAPI?.saveAgents) {
        await window.electronAPI.saveAgents(detected)
      }
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
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-32 bg-secondary rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
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
        {[
          { label: t('dashboard.agents'), value: agents.length, icon: Bot, color: 'blue' },
          { label: t('dashboard.installed'), value: onlineCount, icon: Activity, color: 'green' },
          { label: t('dashboard.running'), value: runningCount, icon: Zap, color: 'orange' },
          { label: t('dashboard.cpu'), value: `${systemCpu}%`, icon: Cpu, color: 'purple' },
        ].map((stat) => (
          <Card key={stat.label} className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-500/5 border-${stat.color}-500/20`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent 列表 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.detected')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent: any) => (
            <Card
              key={agent.id}
              className="hover:border-blue-500/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/agent/${agent.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {agentIcons[agent.id] ? (
                    <img src={agentIcons[agent.id]} alt={agent.name} className="w-10 h-10 rounded-lg object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-xl">{agent.icon}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate group-hover:text-blue-400 transition-colors">{agent.name}</h3>
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
