import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, Palette, Globe, Image, Info, Upload, X, Bell, BellOff, Plus, Trash2, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { t, setLanguage, type Language } from '@/lib/i18n'

interface AppSettings {
  theme: 'dark' | 'light'
  language: 'zh' | 'en'
  agentIcons: Record<string, string>
  notificationsEnabled: boolean
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh',
  agentIcons: {},
  notificationsEnabled: true,
}

const agentNames: Record<string, string> = {
  mimocode: 'MiMo Code',
  claude: 'Claude Code',
  codex: 'OpenAI Codex',
  coffee: 'Coffee CLI',
  doubao: '豆包',
  kimi: 'Kimi',
  qianwen: '千问',
  yuanbao: '腾讯元宝',
  claw: '龙虾 (Claw)',
  antigravity: 'Antigravity',
}

interface CustomAgent {
  id: string
  name: string
  description: string
  icon: string
  type: 'cli' | 'desktop'
  executablePath: string
}

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(theme)
}

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([])
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    loadSettings()
    loadCustomAgents()
  }, [])

  async function loadSettings() {
    // 优先从数据库加载
    if (window.electronAPI?.getSettings) {
      const data = await window.electronAPI.getSettings()
      if (data) {
        setSettings({ ...defaultSettings, ...data })
        applyTheme(data.theme || 'dark')
        setLanguage(data.language || 'zh')
        if (window.electronAPI?.setNotificationsEnabled) {
          await window.electronAPI.setNotificationsEnabled(data.notificationsEnabled ?? true)
        }
        return
      }
    }
    // 回退到 localStorage
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings({ ...defaultSettings, ...parsed })
      applyTheme(parsed.theme || 'dark')
      setLanguage(parsed.language || 'zh')
    }
  }

  async function loadCustomAgents() {
    if (window.electronAPI?.getCustomAgents) {
      const agents = await window.electronAPI.getCustomAgents()
      setCustomAgents(agents || [])
    }
  }

  const handleSave = async () => {
    // 保存到数据库
    if (window.electronAPI?.saveSettings) {
      await window.electronAPI.saveSettings(settings)
    }
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }

  const handleIconUpload = (agentId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setSettings((prev) => ({
        ...prev,
        agentIcons: { ...prev.agentIcons, [agentId]: dataUrl },
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIcon = (agentId: string) => {
    setSettings((prev) => {
      const newIcons = { ...prev.agentIcons }
      delete newIcons[agentId]
      return { ...prev, agentIcons: newIcons }
    })
  }

  const handleToggleNotifications = async () => {
    const newValue = !settings.notificationsEnabled
    setSettings((prev) => ({ ...prev, notificationsEnabled: newValue }))
    if (window.electronAPI?.setNotificationsEnabled) {
      await window.electronAPI.setNotificationsEnabled(newValue)
    }
    if (newValue && window.electronAPI?.sendNotification) {
      await window.electronAPI.sendNotification('通知已开启', '现在可以接收任务提醒了')
    }
  }

  const handleAddCustomAgent = async (agent: Omit<CustomAgent, 'id'>) => {
    const newAgent: CustomAgent = {
      ...agent,
      id: `custom-${Date.now()}`,
    }
    const updated = [...customAgents, newAgent]
    setCustomAgents(updated)
    if (window.electronAPI?.saveCustomAgents) {
      await window.electronAPI.saveCustomAgents(updated)
    }
  }

  const handleDeleteCustomAgent = async (id: string) => {
    const updated = customAgents.filter((a) => a.id !== id)
    setCustomAgents(updated)
    if (window.electronAPI?.saveCustomAgents) {
      await window.electronAPI.saveCustomAgents(updated)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">应用设置与配置</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('settings.reset')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? t('settings.saved') : t('app.save')}
          </Button>
        </div>
      </div>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">系统通知</p>
              <p className="text-sm text-muted-foreground">任务完成、失败时弹出桌面通知</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-blue-500' : 'bg-secondary'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('settings.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                settings.theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="w-full h-20 bg-[#0a0a0b] rounded mb-3 flex items-center justify-center">
                <span className="text-white text-sm">{t('settings.theme.dark')}</span>
              </div>
              <p className="text-sm font-medium">{t('settings.theme.dark')}</p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                settings.theme === 'light'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="w-full h-20 bg-white rounded mb-3 flex items-center justify-center border">
                <span className="text-black text-sm">{t('settings.theme.light')}</span>
              </div>
              <p className="text-sm font-medium">{t('settings.theme.light')}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 语言设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSettings({ ...settings, language: 'zh' })
                forceUpdate((n) => n + 1)
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                settings.language === 'zh'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇨🇳</span>
              <p className="text-sm mt-1">{t('settings.language.zh')}</p>
            </button>
            <button
              onClick={() => {
                setSettings({ ...settings, language: 'en' })
                forceUpdate((n) => n + 1)
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                settings.language === 'en'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇺🇸</span>
              <p className="text-sm mt-1">{t('settings.language.en')}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Agent 图标自定义 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            {t('settings.icons')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t('settings.icons.desc')}</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(agentNames).map(([id, name]) => (
              <div key={id} className="flex flex-col items-center p-3 border rounded-lg">
                {settings.agentIcons[id] ? (
                  <div className="relative mb-2">
                    <img src={settings.agentIcons[id]} alt={name} className="w-12 h-12 rounded-lg object-cover" />
                    <button
                      onClick={() => handleRemoveIcon(id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-blue-500 mb-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleIconUpload(id, file)
                      }}
                    />
                  </label>
                )}
                <span className="text-xs text-center text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent 配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent 配置
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddAgent(true)}>
              <Plus className="h-4 w-4 mr-1" />
              添加 Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">手动添加自定义 Agent</p>
          {customAgents.length > 0 ? (
            <div className="space-y-2">
              {customAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.icon}</span>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomAgent(agent.id)}
                    className="p-2 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">暂无自定义 Agent</p>
          )}
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.version')}</span>
            <span className="font-medium">1.5.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.tech')}</span>
            <span className="font-medium">Electron + React + TypeScript</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.github')}</span>
            <a href="https://github.com/khssdsg-maker/agent-control-center" target="_blank" className="text-blue-400 hover:underline">GitHub</a>
          </div>
        </CardContent>
      </Card>

      {/* 添加 Agent 弹窗 */}
      {showAddAgent && (
        <AddAgentModal
          onClose={() => setShowAddAgent(false)}
          onAdd={handleAddCustomAgent}
        />
      )}
    </div>
  )
}

function AddAgentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (agent: Omit<CustomAgent, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🤖')
  const [type, setType] = useState<'cli' | 'desktop'>('cli')
  const [executablePath, setExecutablePath] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), description: description.trim(), icon, type, executablePath })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">添加 Agent</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">名称 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：My Agent"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agent 的功能描述"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">图标 (emoji)</label>
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'cli' | 'desktop')}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="cli">CLI 命令行</option>
              <option value="desktop">桌面应用</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">可执行文件路径</label>
            <input type="text" value={executablePath} onChange={(e) => setExecutablePath(e.target.value)} placeholder="C:\path\to\agent.exe"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>添加</Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
