import { useState, useEffect, useRef } from 'react'

// 清理 ANSI 转义码
function stripAnsi(str: string): string {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~]/g,
    ''
  )
}

interface SimpleTerminalProps {
  agentId: string
  agentName: string
}

function SimpleTerminal({ agentId, agentName }: SimpleTerminalProps) {
  const [output, setOutput] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [sessionId] = useState(`term-${agentId}-${Date.now()}`)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 监听终端输出
    if (window.electronAPI?.onTerminalOutput) {
      window.electronAPI.onTerminalOutput((id, data) => {
        if (id === sessionId) {
          const clean = stripAnsi(data)
          if (clean.trim()) {
            setOutput((prev) => [...prev, clean])
          }
          setTimeout(() => {
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight
            }
          }, 50)
        }
      })
    }

    // 监听终端关闭
    if (window.electronAPI?.onTerminalClose) {
      window.electronAPI.onTerminalClose((id, code) => {
        if (id === sessionId) {
          setOutput((prev) => [...prev, `\n[进程已退出，代码: ${code}]\n`])
          setConnected(false)
        }
      })
    }

    startTerminal()

    return () => {
      if (window.electronAPI?.terminalKill) {
        window.electronAPI.terminalKill(sessionId)
      }
    }
  }, [agentId])

  async function startTerminal() {
    // Agent 启动命令
    const commands: Record<string, string> = {
      mimocode: 'mimo',
      claude: 'claude',
      codex: 'codex',
      coffee: '"C:\\Users\\海辰\\AppData\\Local\\Coffee CLI\\coffee-cli.exe"',
      claw: 'cd "C:\\Users\\海辰\\WorkBuddy\\Claw" && claude',
    }

    const cmd = commands[agentId] || ''
    setOutput([`正在启动 ${agentName}...\n`, `$ ${cmd}\n`])

    if (window.electronAPI?.terminalCreate) {
      // 传入空命令，先启动 cmd.exe
      const result = await window.electronAPI.terminalCreate(sessionId, '')
      if (result.success) {
        setConnected(true)
        // 等待 cmd.exe 启动后，再发送 agent 命令
        if (cmd) {
          setTimeout(() => {
            if (window.electronAPI?.terminalInput) {
              window.electronAPI.terminalInput(sessionId, cmd + '\n')
            }
          }, 800)
        }
      } else {
        setOutput((prev) => [...prev, `连接失败: ${result.error}\n`])
      }
    }
  }

  const handleSend = () => {
    if (!input.trim() || !connected) return

    if (window.electronAPI?.terminalInput) {
      window.electronAPI.terminalInput(sessionId, input + '\n')
    }

    setInput('')
  }

  const handleClear = () => {
    setOutput([])
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-2 flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-muted-foreground">{agentName} 终端</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {connected ? '已连接' : '未连接'}
        </span>
        <button onClick={handleClear} className="px-2 py-1 text-xs rounded bg-secondary hover:bg-secondary/80">
          清屏
        </button>
        <button onClick={startTerminal} className="px-2 py-1 text-xs rounded bg-secondary hover:bg-secondary/80">
          重启
        </button>
      </div>

      <div ref={outputRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0a0a0b]">
        {output.map((line, i) => (
          <div key={i} className="text-green-300 whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3 bg-[#0a0a0b]">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder={connected ? '输入命令...' : '等待连接...'}
            className="flex-1 bg-transparent text-green-300 font-mono text-sm focus:outline-none"
            disabled={!connected}
          />
        </div>
      </div>
    </div>
  )
}

export default SimpleTerminal
