import { useState, useEffect } from 'react'
import {
  Clock, CheckCircle, XCircle, AlertCircle, Play,
  Plus, Trash2, Edit2, Filter, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { initDatabase } from '@/lib/db'

interface Task {
  id: string
  agentName: string
  agentIcon: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
}

// 模拟任务数据
const mockTasks: Task[] = [
  { id: '1', agentName: 'MiMo Code', agentIcon: '🤖', title: '优化登录系统', description: '重构 auth.py，添加 JWT 支持', status: 'completed', createdAt: '2小时前' },
  { id: '2', agentName: 'Claude Code', agentIcon: '🧠', title: '分析项目架构', description: '生成项目结构分析报告', status: 'completed', createdAt: '5小时前' },
  { id: '3', agentName: '龙虾 (Claw)', agentIcon: '🦞', title: '自动化部署流程', description: '配置 CI/CD 自动部署', status: 'running', createdAt: '10分钟前' },
  { id: '4', agentName: 'MiMo Code', agentIcon: '🤖', title: '编写单元测试', description: '为核心模块添加测试用例', status: 'pending', createdAt: '刚刚' },
  { id: '5', agentName: 'OpenAI Codex', agentIcon: '⚡', title: '代码审查', description: '审查 PR #42 的代码质量', status: 'failed', createdAt: '1天前' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'secondary'; icon: any }> = {
  pending: { label: '等待中', variant: 'secondary', icon: Clock },
  running: { label: '运行中', variant: 'info', icon: Play },
  completed: { label: '已完成', variant: 'success', icon: CheckCircle },
  failed: { label: '失败', variant: 'error', icon: XCircle },
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    initDatabase()
    // 模拟加载延迟
    setTimeout(() => {
      setTasks(mockTasks)
      setLoading(false)
    }, 500)
  }, [])

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理所有 Agent 的任务 ({tasks.length})
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">总任务</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">等待中</p>
            <p className="text-3xl font-bold mt-1 text-gray-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">运行中</p>
            <p className="text-3xl font-bold mt-1 text-blue-400">{stats.running}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">已完成</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">失败</p>
            <p className="text-3xl font-bold mt-1 text-red-400">{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'pending', 'running', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? '全部' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const statusInfo = statusConfig[task.status]
          const StatusIcon = statusInfo.icon
          return (
            <Card key={task.id} className="hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{task.agentIcon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {task.agentName} · {task.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'running' && (
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无匹配的任务
          </div>
        )}
      </div>
    </div>
  )
}

export default TasksPage
