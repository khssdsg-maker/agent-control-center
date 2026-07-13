import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const storePath = path.join(app.getPath('userData'), 'store.json')

interface StoreData {
  settings: any
  agentCache: any[]
  skillsCache: any[]
  tasks: any[]
  customAgents: any[]
  windowBounds: { x?: number; y?: number; width: number; height: number }
}

const defaultData: StoreData = {
  settings: {
    theme: 'dark',
    language: 'zh',
    agentIcons: {},
    notificationsEnabled: true,
  },
  agentCache: [],
  skillsCache: [],
  tasks: [],
  customAgents: [],
}

export function loadStore(): StoreData {
  try {
    if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'))
      return { ...defaultData, ...data }
    }
  } catch {}
  return defaultData
}

export function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('保存数据失败:', err)
  }
}

export function getSettings() {
  return loadStore().settings
}

export function saveSettings(settings: any) {
  const data = loadStore()
  data.settings = settings
  saveStore(data)
}

export function getAgentCache() {
  return loadStore().agentCache
}

export function saveAgentCache(agents: any[]) {
  const data = loadStore()
  data.agentCache = agents
  saveStore(data)
}

export function getSkillsCache() {
  return loadStore().skillsCache
}

export function saveSkillsCache(skills: any[]) {
  const data = loadStore()
  data.skillsCache = skills
  saveStore(data)
}

export function getTasks() {
  return loadStore().tasks
}

export function saveTasks(tasks: any[]) {
  const data = loadStore()
  data.tasks = tasks
  saveStore(data)
}

export function getCustomAgents() {
  return loadStore().customAgents
}

export function saveCustomAgents(agents: any[]) {
  const data = loadStore()
  data.customAgents = agents
  saveStore(data)
}

export function getWindowBounds() {
  const data = loadStore()
  return data.windowBounds || { x: undefined, y: undefined, width: 1400, height: 900 }
}

export function saveWindowBounds(bounds: { x?: number; y?: number; width: number; height: number }) {
  const data = loadStore()
  data.windowBounds = bounds
  saveStore(data)
}
