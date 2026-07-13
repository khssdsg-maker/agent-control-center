import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getAllTasks, type Task } from '@/lib/tasks'

function TaskReport() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    const allTasks = await getAllTasks()
    setTasks(allTasks)
    setLoading(false)
  }

  if (loading) return <div className="text-center text-muted-foreground py-4">加载中...</div>

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // 按 Agent 统计
  const agentStats = tasks.reduce((acc, t) => {
    if (!acc[t.agentName]) acc[t.agentName] = { total: 0, completed: 0 }
    acc[t.agentName].total++
    if (t.status === 'completed') acc[t.agentName].completed++
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          任务统计报表
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 完成率 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">完成率</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* 状态统计 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">等待</p>
          </div>
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-blue-400">{stats.running}</p>
            <p className="text-xs text-muted-foreground">运行</p>
          </div>
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-green-400">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">完成</p>
          </div>
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-red-400">{stats.failed}</p>
            <p className="text-xs text-muted-foreground">失败</p>
          </div>
        </div>

        {/* Agent 统计 */}
        {Object.keys(agentStats).length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">按 Agent 统计</p>
            <div className="space-y-2">
              {Object.entries(agentStats).map(([name, stat]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted-foreground">{stat.completed}/{stat.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskReport
