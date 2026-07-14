import { spawn, exec } from 'child_process'
import { EventEmitter } from 'events'

interface TaskProcess {
  id: string
  process: any
  output: string[]
}

const runningTasks: Map<string, TaskProcess> = new Map()

export function runAgentTask(
  taskId: string,
  command: string,
  cwd?: string,
  onOutput?: (data: string) => void,
  onClose?: (code: number) => void,
  onError?: (error: string) => void
): void {
  // 如果已有任务在运行，先杀掉
  if (runningTasks.has(taskId)) {
    killTask(taskId)
  }

  try {
    const proc = spawn(command, [], {
      shell: true,
      cwd: cwd || process.env.USERPROFILE || '',
      env: { ...process.env },
    })

    const taskProcess: TaskProcess = {
      id: taskId,
      process: proc,
      output: [],
    }
    runningTasks.set(taskId, taskProcess)

    proc.stdout?.on('data', (data: Buffer) => {
      const text = data.toString('utf-8')
      taskProcess.output.push(text)
      onOutput?.(text)
    })

    proc.stderr?.on('data', (data: Buffer) => {
      const text = data.toString('utf-8')
      taskProcess.output.push(text)
      onOutput?.(text)
    })

    proc.on('close', (code) => {
      runningTasks.delete(taskId)
      onClose?.(code ?? 0)
    })

    proc.on('error', (err) => {
      runningTasks.delete(taskId)
      onError?.(err.message)
    })
  } catch (err: any) {
    onError?.(err.message)
  }
}

export function killTask(taskId: string): boolean {
  const task = runningTasks.get(taskId)
  if (task) {
    try {
      task.process.kill()
      runningTasks.delete(taskId)
      return true
    } catch {
      return false
    }
  }
  return false
}

export function isTaskRunning(taskId: string): boolean {
  return runningTasks.has(taskId)
}

export function getTaskOutput(taskId: string): string[] {
  return runningTasks.get(taskId)?.output || []
}
