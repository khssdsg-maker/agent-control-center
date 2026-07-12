import { IPCMainSendEvent } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'

interface TerminalSession {
  id: string
  process: ChildProcess | null
  output: string[]
}

class TerminalManager extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map()

  createSession(id: string, command: string, args: string[] = [], cwd?: string): boolean {
    try {
      const proc = spawn(command, args, {
        cwd,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, TERM: 'dumb' },
      })

      const session: TerminalSession = {
        id,
        process: proc,
        output: [`[${command}] 已启动\n`],
      }

      proc.stdout?.on('data', (data: Buffer) => {
        const text = data.toString()
        session.output.push(text)
        this.emit('output', id, text)
      })

      proc.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        session.output.push(text)
        this.emit('output', id, text)
      })

      proc.on('close', (code) => {
        session.output.push(`\n[进程已退出，代码: ${code}]\n`)
        this.emit('output', id, `\n[进程已退出，代码: ${code}]\n`)
        this.emit('close', id, code)
      })

      proc.on('error', (err) => {
        session.output.push(`\n[错误: ${err.message}]\n`)
        this.emit('output', id, `\n[错误: ${err.message}]\n`)
      })

      this.sessions.set(id, session)
      return true
    } catch (err: any) {
      return false
    }
  }

  sendInput(id: string, data: string): boolean {
    const session = this.sessions.get(id)
    if (session?.process?.stdin) {
      session.process.stdin.write(data + '\n')
      return true
    }
    return false
  }

  getOutput(id: string): string[] {
    return this.sessions.get(id)?.output || []
  }

  killSession(id: string): boolean {
    const session = this.sessions.get(id)
    if (session?.process) {
      session.process.kill()
      this.sessions.delete(id)
      return true
    }
    return false
  }

  killAll(): void {
    for (const [id] of this.sessions) {
      this.killSession(id)
    }
  }
}

export const terminalManager = new TerminalManager()
