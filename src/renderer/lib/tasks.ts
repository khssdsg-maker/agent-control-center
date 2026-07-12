export interface Task {
  id: string
  agentId: string
  agentName: string
  agentIcon: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'normal' | 'high'
  input: string
  output: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

const STORAGE_KEY = 'agent-tasks'

// 获取所有任务
export function getAllTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 保存任务
function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

// 创建任务
export function createTask(task: Omit<Task, 'id' | 'createdAt' | 'status' | 'startedAt' | 'completedAt'>): Task {
  const tasks = getAllTasks()
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  }
  tasks.unshift(newTask)
  saveTasks(tasks)
  return newTask
}

// 更新任务状态
export function updateTaskStatus(id: string, status: Task['status'], output?: string) {
  const tasks = getAllTasks()
  const task = tasks.find((t) => t.id === id)
  if (task) {
    task.status = status
    if (status === 'running') task.startedAt = new Date().toISOString()
    if (status === 'completed' || status === 'failed') {
      task.completedAt = new Date().toISOString()
      if (output) task.output = output
    }
    saveTasks(tasks)
  }
}

// 删除任务
export function deleteTask(id: string) {
  const tasks = getAllTasks().filter((t) => t.id !== id)
  saveTasks(tasks)
}

// 清空任务
export function clearTasks() {
  saveTasks([])
}
