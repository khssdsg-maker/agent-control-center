import { useState, useEffect } from 'react'
import { Activity, Cpu, HardDrive } from 'lucide-react'
import { getAllAgents } from '@/lib/db'
import { estimateCPU, getMemoryInfo } from '@/lib/monitor'

function StatusBar() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [cpuUsage, setCpuUsage] = useState(0)
  const [memUsage, setMemUsage] = useState('0MB')

  useEffect(() => {
    async function update() {
      const agents = getAllAgents()
      const online = agents.filter((a) => a.status !== 'offline').length
      setOnlineCount(online)
      setTotalCount(agents.length)

      const cpu = await estimateCPU()
      setCpuUsage(cpu)

      const mem = getMemoryInfo()
      setMemUsage(`${mem.used}MB`)
    }
    update()
    const timer = setInterval(update, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="h-7 border-t border-border bg-card/80 flex items-center px-4 text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-status-online" />
          {onlineCount}/{totalCount} Agents Online
        </span>
        <span className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3" />
          CPU {cpuUsage}%
        </span>
        <span className="flex items-center gap-1.5">
          <HardDrive className="h-3 w-3" />
          RAM {memUsage}
        </span>
      </div>
    </footer>
  )
}

export default StatusBar
