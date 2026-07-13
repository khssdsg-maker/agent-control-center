import { useState, useEffect, useRef } from 'react'
import { Settings, Save, RotateCcw, Palette, Globe, Image, Info, Upload, X, Bell, Plus, Trash2, Bot, Wallpaper, Download, FolderInput } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { t, setLanguage } from '@/lib/i18n'
import { exportAllData, importData, downloadFile } from '@/lib/export-import'

interface AppSettings {
  theme: string
  language: string
  agentIcons: Record<string, string>
  notificationsEnabled: boolean
  wallpaper: string
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh',
  agentIcons: {},
  notificationsEnabled: true,
  wallpaper: '',
}

const themes = [
  { id: 'dark', name: '深色', color: '#0a0a0b', textColor: '#e4e4e7' },
  { id: 'light', name: '浅色', color: '#ffffff', textColor: '#18181b' },
  { id: 'dark-blue', name: '深蓝', color: '#0a1628', textColor: '#93c5fd' },
  { id: 'dark-green', name: '深绿', color: '#0a1a0f', textColor: '#86efac' },
  { id: 'dark-purple', name: '深紫', color: '#1a0a2e', textColor: '#d8b4fe' },
  { id: 'dark-red', name: '暗红', color: '#1a0a0a', textColor: '#fca5a5' },
  { id: 'dark-orange', name: '暗橙', color: '#1a120a', textColor: '#fdba74' },
]

const agentNames: Record<string, string> = {
  mimocode: 'MiMo Code', claude: 'Claude Code', codex: 'OpenAI Codex',
  coffee: 'Coffee CLI', doubao: '豆包', kimi: 'Kimi',
  qianwen: '千问', yuanbao: '腾讯元宝', claw: '龙虾 (Claw)', antigravity: 'Antigravity',
}

function applyTheme(themeId: string) {
  document.documentElement.className = ''
  document.documentElement.classList.add(themeId)
}

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [customAgents, setCustomAgents] = useState<any[]>([])
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [, forceUpdate] = useState(0)

  useEffect(() => { loadSettings(); loadCustomAgents() }, [])

  async function loadSettings() {
    if (window.electronAPI?.getSettings) {
      const data = await window.electronAPI.getSettings()
      if (data) {
        setSettings({ ...defaultSettings, ...data })
        applyTheme(data.theme || 'dark')
        setLanguage(data.language || 'zh')
        if (data.wallpaper) applyWallpaper(data.wallpaper)
        if (window.electronAPI?.setNotificationsEnabled) {
          await window.electronAPI.setNotificationsEnabled(data.notificationsEnabled ?? true)
        }
        return
      }
    }
    const saved = localStorage.getItem('app-settings')
    if (saved) { const p = JSON.parse(saved); setSettings({ ...defaultSettings, ...p }); applyTheme(p.theme || 'dark'); setLanguage(p.language || 'zh') }
  }

  async function loadCustomAgents() {
    if (window.electronAPI?.getCustomAgents) {
      const agents = await window.electronAPI.getCustomAgents()
      setCustomAgents(agents || [])
    }
  }

  const handleSave = async () => {
    if (window.electronAPI?.saveSettings) await window.electronAPI.saveSettings(settings)
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => { setSettings(defaultSettings); localStorage.removeItem('app-settings'); document.body.style.backgroundImage = '' }

  const handleThemeChange = (themeId: string) => {
    setSettings(prev => ({ ...prev, theme: themeId }))
    applyTheme(themeId)
  }

  const applyWallpaper = (dataUrl: string) => {
    document.body.style.backgroundImage = `url(${dataUrl})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
  }

  const handleWallpaperUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setSettings(prev => ({ ...prev, wallpaper: dataUrl }))
      applyWallpaper(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveWallpaper = () => {
    setSettings(prev => ({ ...prev, wallpaper: '' }))
    document.body.style.backgroundImage = ''
  }

  const handleIconUpload = (agentId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSettings(prev => ({ ...prev, agentIcons: { ...prev.agentIcons, [agentId]: e.target?.result as string } }))
    }
    reader.readAsDataURL(file)
  }

  const handleToggleNotifications = async () => {
    const v = !settings.notificationsEnabled
    setSettings(prev => ({ ...prev, notificationsEnabled: v }))
    if (window.electronAPI?.setNotificationsEnabled) await window.electronAPI.setNotificationsEnabled(v)
    if (v && window.electronAPI?.sendNotification) await window.electronAPI.sendNotification('通知已开启', '现在可以接收任务提醒了')
  }

  const handleAddCustomAgent = async (agent: any) => {
    const updated = [...customAgents, { ...agent, id: `custom-${Date.now()}` }]
    setCustomAgents(updated)
    if (window.electronAPI?.saveCustomAgents) await window.electronAPI.saveCustomAgents(updated)
  }

  const handleDeleteCustomAgent = async (id: string) => {
    const updated = customAgents.filter((a) => a.id !== id)
    setCustomAgents(updated)
    if (window.electronAPI?.saveCustomAgents) await window.electronAPI.saveCustomAgents(updated)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">应用设置与配置</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-2" />{t('settings.reset')}</Button>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />{saved ? t('settings.saved') : t('app.save')}</Button>
        </div>
      </div>

      {/* 主题选择 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />主题设置</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-3 rounded-lg border-2 transition-all ${settings.theme === theme.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border hover:border-border/80'}`}
              >
                <div className="w-full h-12 rounded mb-2 flex items-center justify-center" style={{ backgroundColor: theme.color, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-xs" style={{ color: theme.textColor }}>Aa</span>
                </div>
                <p className="text-xs font-medium text-center">{theme.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 壁纸设置 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wallpaper className="h-5 w-5" />壁纸设置</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {settings.wallpaper ? (
              <div className="relative">
                <img src={settings.wallpaper} alt="壁纸" className="w-32 h-20 rounded-lg object-cover border" />
                <button onClick={handleRemoveWallpaper} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ) : (
              <label className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">上传壁纸</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWallpaperUpload(f) }} />
              </label>
            )}
            <div className="text-sm text-muted-foreground">
              <p>支持 JPG、PNG 格式</p>
              <p>建议分辨率 1920x1080 以上</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />通知设置</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">系统通知</p>
              <p className="text-sm text-muted-foreground">任务完成、失败时弹出桌面通知</p>
            </div>
            <button onClick={handleToggleNotifications} className={`w-12 h-6 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-blue-500' : 'bg-secondary'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 语言设置 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t('settings.language')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'zh', flag: '🇨🇳', name: '中文' },
              { id: 'en', flag: '🇺🇸', name: 'English' },
              { id: 'ja', flag: '🇯🇵', name: '日本語' },
              { id: 'ko', flag: '🇰🇷', name: '한국어' },
              { id: 'fr', flag: '🇫🇷', name: 'Français' },
              { id: 'de', flag: '🇩🇪', name: 'Deutsch' },
              { id: 'es', flag: '🇪🇸', name: 'Español' },
              { id: 'ru', flag: '🇷🇺', name: 'Русский' },
            ].map((lang) => (
              <button key={lang.id}
                onClick={() => { setSettings(p => ({ ...p, language: lang.id })); setLanguage(lang.id as any); forceUpdate(n => n + 1) }}
                className={`p-3 rounded-lg border-2 transition-colors ${settings.language === lang.id ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-border/80'}`}>
                <span className="text-2xl">{lang.flag}</span>
                <p className="text-xs mt-1">{lang.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent 图标 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />{t('settings.icons')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(agentNames).map(([id, name]) => (
              <div key={id} className="flex flex-col items-center p-3 border rounded-lg">
                {settings.agentIcons[id] ? (
                  <div className="relative mb-2">
                    <img src={settings.agentIcons[id]} alt={name} className="w-12 h-12 rounded-lg object-cover" />
                    <button onClick={() => setSettings(p => { const i = { ...p.agentIcons }; delete i[id]; return { ...p, agentIcons: i } })} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><X className="h-3 w-3 text-white" /></button>
                  </div>
                ) : (
                  <label className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-blue-500 mb-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIconUpload(id, f) }} />
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
            <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Agent 配置</CardTitle>
            <Button size="sm" onClick={() => setShowAddAgent(true)}><Plus className="h-4 w-4 mr-1" />添加 Agent</Button>
          </div>
        </CardHeader>
        <CardContent>
          {customAgents.length > 0 ? (
            <div className="space-y-2">
              {customAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.icon}</span>
                    <div><p className="font-medium">{agent.name}</p><p className="text-xs text-muted-foreground">{agent.description}</p></div>
                  </div>
                  <button onClick={() => handleDeleteCustomAgent(agent.id)} className="p-2 rounded hover:bg-red-500/20"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-4">暂无自定义 Agent</p>}
        </CardContent>
      </Card>

      {/* 数据导出/导入 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />数据管理</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={async () => {
              const data = await exportAllData()
              const filename = `agent-control-center-backup-${new Date().toISOString().split('T')[0]}.json`
              downloadFile(data, filename)
            }}>
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
              <FolderInput className="h-4 w-4 mr-2" />
              导入数据
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                const result = await importData(text)
                if (result.success) {
                  alert(result.message)
                  window.location.reload()
                } else {
                  alert(result.message)
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">导出/导入所有设置、Agent、技能、任务数据</p>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />{t('settings.about')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('settings.version')}</span><span className="font-medium">1.9.0</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('settings.tech')}</span><span className="font-medium">Electron + React + TypeScript</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('settings.github')}</span><a href="https://github.com/khssdsg-maker/agent-control-center" target="_blank" className="text-blue-400 hover:underline">GitHub</a></div>
        </CardContent>
      </Card>

      {showAddAgent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddAgent(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">添加 Agent</h2><button onClick={() => setShowAddAgent(false)} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button></div>
            <AddAgentForm onAdd={(a) => { handleAddCustomAgent(a); setShowAddAgent(false) }} />
          </div>
        </div>
      )}
    </div>
  )
}

function AddAgentForm({ onAdd }: { onAdd: (agent: any) => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [icon, setIcon] = useState('🤖')
  const [type, setType] = useState('cli')
  const [path, setPath] = useState('')

  return (
    <div className="space-y-3">
      <div><label className="text-sm text-muted-foreground">名称 *</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="text-sm text-muted-foreground">描述</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="text-sm text-muted-foreground">图标</label><input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div><label className="text-sm text-muted-foreground">类型</label><select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm"><option value="cli">CLI</option><option value="desktop">桌面</option></select></div>
      <div><label className="text-sm text-muted-foreground">路径</label><input type="text" value={path} onChange={e => setPath(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => onAdd(null)}>取消</Button><Button onClick={() => name.trim() && onAdd({ name, description: desc, icon, type, executablePath: path })} disabled={!name.trim()}>添加</Button></div>
    </div>
  )
}

export default SettingsPage
