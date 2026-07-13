import { useEffect } from 'react'

interface ShortcutHandlers {
  onRefresh?: () => void
  onNewTask?: () => void
  onSearch?: () => void
  onEscape?: () => void
  onSave?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R: 刷新
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        handlers.onRefresh?.()
      }
      // Ctrl+N: 新建任务
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handlers.onNewTask?.()
      }
      // Ctrl+F: 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        handlers.onSearch?.()
      }
      // Ctrl+S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handlers.onSave?.()
      }
      // Escape: 关闭
      if (e.key === 'Escape') {
        handlers.onEscape?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
