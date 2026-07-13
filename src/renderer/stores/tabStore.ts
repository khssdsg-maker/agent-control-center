import { create } from 'zustand'

export interface Tab {
  id: string
  title: string
  path: string
  icon?: string
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  closeOtherTabs: (id: string) => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [
    { id: 'dashboard', title: '仪表盘', path: '/', icon: '📊' },
  ],
  activeTabId: 'dashboard',

  addTab: (tab) => {
    const { tabs } = get()
    // 检查是否已存在相同路径的标签
    const existing = tabs.find((t) => t.path === tab.path)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }
    set({ tabs: [...tabs, tab], activeTabId: tab.id })
  },

  removeTab: (id) => {
    const { tabs, activeTabId } = get()
    if (tabs.length <= 1) return // 至少保留一个标签
    const newTabs = tabs.filter((t) => t.id !== id)
    const newActiveTabId = activeTabId === id
      ? newTabs[newTabs.length - 1]?.id || null
      : activeTabId
    set({ tabs: newTabs, activeTabId: newActiveTabId })
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  closeOtherTabs: (id) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (tab) {
      set({ tabs: [tab], activeTabId: tab.id })
    }
  },
}))
