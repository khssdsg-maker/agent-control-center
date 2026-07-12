import { useNavigate } from 'react-router-dom'
import { Minus, Square, X, Search, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'

function Header() {
  const navigate = useNavigate()
  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-4 drag-region select-none">
      {/* 左侧：Logo + 标题 */}
      <div className="flex items-center gap-3 no-drag">
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <h1 className="text-sm font-semibold text-foreground">
          Agent Control Center
        </h1>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-1 no-drag">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* 窗口控制 */}
        <div className="flex items-center ml-2 border-l border-border pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none"
            onClick={handleMinimize}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none"
            onClick={handleMaximize}
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-none"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
