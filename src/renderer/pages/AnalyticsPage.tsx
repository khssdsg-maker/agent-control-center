import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react'
import { getAllTasks, type Task } from '@/lib/tasks'
import { getAllWorkflows, type Workflow, getWorkflowProgress } from '@/lib/workflow'
import { estimateCPU, getMemoryInfo } from '@/lib/monitor'

function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 0, mem: { used: 0, total: 0 } })
  const [taskHistory, setTaskHistory] = useState<{ time: string; count: number }[]>([])

  useEffect(() => {
    loadData()
    const timer = setInterval(updateMetrics, 5000)
    return () => clearInterval(timer)
  }, [])

  async function loadData() {
    const allTasks = await getAllTasks()
    setTasks(allTasks)
    setWorkflows(getAllWorkflows())

    // 生成任务历史数据（模拟）
    const history = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      history.push({
        time: `${date.getMonth() + 1}/${date.getDate()}`,
        count: Math.floor(Math.random() * 10) + 1,
      })
    }
    setTaskHistory(history)
  }

  async function updateMetrics() {
    const cpu = await estimateCPU()
    const mem = getMemoryInfo()
    setSystemMetrics({ cpu, mem })
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  const workflowStats = {
    total: workflows.length,
    draft: workflows.filter((w) => w.status === 'draft').length,
    running: workflows.filter((w) => w.status === 'running').length,
    completed: workflows.filter((w) => w.status === 'completed').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据分析</h1>
        <p className="text-muted-foreground text-sm mt-1">系统运行数据可视化</p>
      </div>

      {/* 系统资源概览 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              CPU 使用率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{systemMetrics.cpu}%</span>
            </div>
            <div className="mt-3 h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${systemMetrics.cpu}%`,
                  background: systemMetrics.cpu > 80 ? '#ef4444' : systemMetrics.cpu > 50 ? '#eab308' : '#3b82f6',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              内存使用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{systemMetrics.mem.used}MB</span>
              <span className="text-muted-foreground mb-1">/ {systemMetrics.mem.total}MB</span>
            </div>
            <div className="mt-3 h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(systemMetrics.mem.used / systemMetrics.mem.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 任务统计 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '总任务', value: taskStats.total, color: 'text-foreground', icon: BarChart3 },
          { label: '等待中', value: taskStats.pending, color: 'text-gray-400', icon: Clock },
          { label: '运行中', value: taskStats.running, color: 'text-blue-400', icon: Activity },
          { label: '已完成', value: taskStats.completed, color: 'text-green-400', icon: CheckCircle },
          { label: '失败', value: taskStats.failed, color: 'text-red-400', icon: XCircle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 任务趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            任务趋势（近7天）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2">
            {taskHistory.map((item, i) => {
              const maxCount = Math.max(...taskHistory.map((h) => h.count))
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{item.count}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-500"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 工作流统计 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总工作流', value: workflowStats.total, color: 'text-foreground' },
          { label: '草稿', value: workflowStats.draft, color: 'text-gray-400' },
          { label: '运行中', value: workflowStats.running, color: 'text-blue-400' },
          { label: '已完成', value: workflowStats.completed, color: 'text-green-400' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 任务完成率 */}
      <Card>
        <CardHeader>
          <CardTitle>任务完成率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-6 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold">
              {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {taskStats.completed} / {taskStats.total} 任务已完成
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
