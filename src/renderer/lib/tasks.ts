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

// 获取所有任务（从数据库）
export async function getAllTasks(): Promise<Task[]> {
  if (window.electronAPI?.getTasks) {
    return await window.electronAPI.getTasks()
  }
  return []
}

// 保存任务到数据库
async function saveTasks(tasks: Task[]) {
  if (window.electronAPI?.saveTasks) {
    await window.electronAPI.saveTasks(tasks)
  }
}

// 创建任务
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'status' | 'startedAt' | 'completedAt'>): Promise<Task> {
  const tasks = await getAllTasks()
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  }
  tasks.unshift(newTask)
  await saveTasks(tasks)
  return newTask
}

// 更新任务状态
export async function updateTaskStatus(id: string, status: Task['status'], output?: string) {
  const tasks = await getAllTasks()
  const task = tasks.find((t) => t.id === id)
  if (task) {
    task.status = status
    if (status === 'running') task.startedAt = new Date().toISOString()
    if (status === 'completed' || status === 'failed') {
      task.completedAt = new Date().toISOString()
      if (output) task.output = output
    }
    await saveTasks(tasks)
  }
}

// 删除任务
export async function deleteTask(id: string) {
  const tasks = (await getAllTasks()).filter((t) => t.id !== id)
  await saveTasks(tasks)
}

// 清空任务
export async function clearTasks() {
  await saveTasks([])
}
