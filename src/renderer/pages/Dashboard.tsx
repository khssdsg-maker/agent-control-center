import { useState, useEffect } from 'react'
import { Bot, Activity, HardDrive, FolderOpen, X, Cpu, MemoryStick } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { estimateCPU, getMemoryInfo, simulateAgentMetrics } from '@/lib/monitor'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'secondary' }> = {
  online: { label: '在线', variant: 'success' },
  idle: { label: '已安装', variant: 'success' },
  running: { label: '运行中', variant: 'info' },
  error: { label: '错误', variant: 'error' },
  offline: { label: '未安装', variant: 'secondary' },
}

const typeLabels: Record<string, string> = {
  cli: '命令行工具',
  desktop: '桌面应用',
  web: 'Web 应用',
}

function formatSize(mb: number): string {
  if (mb === 0) return '0 MB'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function Dashboard() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [systemCpu, setSystemCpu] = useState(0)
  const [systemMem, setSystemMem] = useState({ used: 0, total: 0 })
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  useEffect(() => {
    async function load() {
      if (window.electronAPI?.scanAgents) {
        const detected = await window.electronAPI.scanAgents()
        const withMetrics = detected.map((a: any) => {
          if (a.status === 'offline') return { ...a, cpu_usage: 0, memory_usage: 0 }
          const m = simulateAgentMetrics()
          return { ...a, cpu_usage: m.cpu, memory_usage: m.mem }
        })
        setAgents(withMetrics)
      }
      setLoading(false)

      const cpu = await estimateCPU()
      const mem = getMemoryInfo()
      setSystemCpu(cpu)
      setSystemMem(mem)
    }
    load()

    const timer = setInterval(async () => {
      const cpu = await estimateCPU()
      const mem = getMemoryInfo()
      setSystemCpu(cpu)
      setSystemMem(mem)

      setAgents((prev) =>
        prev.map((a: any) => {
          if (a.status === 'offline') return a
          const m = simulateAgentMetrics()
          return { ...a, cpu_usage: m.cpu, memory_usage: m.mem }
        })
      )
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const onlineCount = agents.filter((a: any) => a.status !== 'offline').length
  const totalDiskMB = agents.reduce((sum: number, a: any) => sum + (a.diskSpace || 0), 0)

  const stats = [
    { label: 'Agents', value: agents.length, icon: Bot, color: 'text-blue-400' },
    { label: 'Installed', value: onlineCount, icon: Activity, color: 'text-green-400' },
    { label: 'Total Size', value: formatSize(totalDiskMB), icon: HardDrive, color: 'text-orange-400' },
    { label: 'CPU', value: `${systemCpu}%`, icon: Cpu, color: 'text-purple-400' },
  ]

  const handleOpenPath = (p: string | null, e: React.MouseEvent) => {
    e.stopPropagation()
    if (p && window.electronAPI?.openPath) {
      window.electronAPI.openPath(p)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">正在扫描系统 Agent...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          检测到 {agents.length} 个 Agent，已安装 {onlineCount} 个
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 系统资源 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{systemCpu}%</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${systemCpu}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{systemMem.used}MB</span>
              <div className="flex-1">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(systemMem.used / systemMem.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemMem.used}MB / {systemMem.total}MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent 卡片网格 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Detected Agents</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent: any) => (
            <Card
              key={agent.id}
              className="hover:border-blue-500/50 transition-colors cursor-pointer group"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{typeLabels[agent.type] || agent.type}</p>
                    </div>
                  </div>
                  <Badge variant={statusConfig[agent.status]?.variant ?? 'secondary'}>
                    {statusConfig[agent.status]?.label ?? agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="text-xs leading-relaxed">{agent.description}</p>

                  {/* 磁盘占用 */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      磁盘占用
                    </span>
                    <span className="font-medium text-foreground">{formatSize(agent.diskSpace || 0)}</span>
                  </div>

                  {/* 资源监控（仅已安装的显示） */}
                  {agent.status !== 'offline' && (
                    <>
                      <div className="flex justify-between">
                        <span>CPU</span>
                        <span>{agent.cpu_usage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${agent.cpu_usage}%` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>内存</span>
                        <span>{agent.memory_usage > 0 ? `${agent.memory_usage}MB` : '-'}</span>
                      </div>
                    </>
                  )}

                  {agent.status === 'offline' && (
                    <p className="text-xs text-yellow-500/70">未检测到安装</p>
                  )}

                  {/* 打开目录按钮 */}
                  {(agent.executablePath || agent.dataPath) && (
                    <button
                      onClick={(e) => handleOpenPath(agent.dataPath || agent.executablePath, e)}
                      className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors text-xs opacity-0 group-hover:opacity-100"
                    >
                      <FolderOpen className="h-3 w-3" />
                      打开目录
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Agent 详情弹窗 */}
      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}

// Agent 详情弹窗
function AgentDetailModal({ agent, onClose }: { agent: any; onClose: () => void }) {
  const [metrics, setMetrics] = useState({ cpu: agent.cpu_usage || 0, mem: agent.memory_usage || 0 })

  useEffect(() => {
    if (agent.status === 'offline') return
    const timer = setInterval(async () => {
      const m = simulateAgentMetrics()
      setMetrics({ cpu: m.cpu, mem: m.mem })
    }, 2000)
    return () => clearInterval(timer)
  }, [agent.status])

  const handleOpen = (path: string | null) => {
    if (path && window.electronAPI?.openPath) {
      window.electronAPI.openPath(path)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 状态信息 */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">状态</p>
              <Badge variant={statusConfig[agent.status]?.variant ?? 'secondary'} className="mt-1">
                {statusConfig[agent.status]?.label ?? agent.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">类型</p>
              <p className="font-medium mt-1">{typeLabels[agent.type] || agent.type}</p>
            </CardContent>
          </Card>
        </div>

        {/* 磁盘占用详情 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">磁盘占用</p>
              <span className="text-2xl font-bold">{formatSize(agent.diskSpace || 0)}</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min((agent.diskSpace || 0) / 100 * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 资源监控 */}
        {agent.status !== 'offline' && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <p className="text-sm text-muted-foreground">CPU</p>
                </div>
                <p className="text-3xl font-bold">{metrics.cpu}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="h-4 w-4 text-purple-400" />
                  <p className="text-sm text-muted-foreground">内存</p>
                </div>
                <p className="text-3xl font-bold">{metrics.mem}MB</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 路径信息 */}
        <div className="space-y-2">
          {agent.executablePath && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">可执行文件</p>
                <p className="text-sm truncate">{agent.executablePath}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpen(agent.executablePath)}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
          {agent.configPath && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">配置目录</p>
                <p className="text-sm truncate">{agent.configPath}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpen(agent.configPath)}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
          {agent.dataPath && agent.dataPath !== agent.configPath && (
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">数据目录</p>
                <p className="text-sm truncate">{agent.dataPath}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleOpen(agent.dataPath)}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>关闭</Button>
          {(agent.executablePath || agent.dataPath) && (
            <Button onClick={() => handleOpen(agent.dataPath || agent.executablePath)}>
              <FolderOpen className="h-4 w-4 mr-2" />
              打开目录
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
