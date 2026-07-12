// 系统资源监控（浏览器环境下只能获取有限信息）

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  memoryTotal: number
  memoryUsed: number
}

// 获取系统内存信息（通过 performance API）
export function getMemoryInfo(): { used: number; total: number } {
  const perfMemory = (performance as any).memory
  if (perfMemory) {
    return {
      used: Math.round(perfMemory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(perfMemory.jsHeapSizeLimit / 1024 / 1024),
    }
  }
  // 降级：返回模拟数据
  return { used: 420, total: 8192 }
}

// 估算 CPU 使用率（通过 setTimeout 延迟差）
export function estimateCPU(): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now()
    setTimeout(() => {
      const elapsed = performance.now() - start
      // 简单估算：延迟越大，CPU 越忙
      const usage = Math.min(Math.round((elapsed - 16) / 10), 100)
      resolve(Math.max(0, usage))
    }, 100)
  })
}

// 模拟 Agent 级别的资源使用（实际应通过 IPC 获取进程信息）
export function simulateAgentMetrics(): { cpu: number; mem: number } {
  return {
    cpu: Math.round(Math.random() * 20 + 2),
    mem: Math.round(Math.random() * 500 + 100),
  }
}
