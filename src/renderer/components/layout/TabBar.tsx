import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTabStore } from '@/stores/tabStore'
import { cn } from '@/lib/utils'

function TabBar() {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTabStore()
  const navigate = useNavigate()

  const handleTabClick = (tab: { id: string; path: string }) => {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeTab(id)
  }

  return (
    <div className="h-10 border-b border-border bg-card/30 flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab)}
          className={cn(
            'flex items-center gap-2 px-4 h-full cursor-pointer border-r border-border transition-colors group',
            'hover:bg-accent/50',
            activeTabId === tab.id && 'bg-accent text-accent-foreground'
          )}
        >
          {tab.icon && <span className="text-sm">{tab.icon}</span>}
          <span className="text-sm whitespace-nowrap">{tab.title}</span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => handleClose(e, tab.id)}
              className="ml-1 p-0.5 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default TabBar
