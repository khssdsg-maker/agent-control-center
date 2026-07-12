export type Language = 'zh' | 'en'

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // 通用
    'app.name': 'Agent Control Center',
    'app.loading': '加载中...',
    'app.save': '保存',
    'app.cancel': '取消',
    'app.delete': '删除',
    'app.edit': '编辑',
    'app.add': '添加',
    'app.search': '搜索...',
    'app.refresh': '刷新',
    'app.back': '返回',
    'app.confirm': '确认',
    'app.close': '关闭',

    // 导航
    'nav.dashboard': '仪表盘',
    'nav.skills': '技能管理',
    'nav.chat': '聊天记录',
    'nav.tasks': '任务中心',
    'nav.settings': '设置',
    'nav.changelog': '更新日志',

    // 仪表盘
    'dashboard.title': '概览',
    'dashboard.subtitle': '检测到 {count} 个 Agent',
    'dashboard.agents': 'Agents',
    'dashboard.installed': '已安装',
    'dashboard.running': '运行中',
    'dashboard.cpu': 'CPU',
    'dashboard.search': '搜索...',
    'dashboard.scan': '扫描',
    'dashboard.scanning': '扫描中...',
    'dashboard.detected': '检测到的 Agent',

    // Agent 状态
    'status.online': '在线',
    'status.idle': '空闲',
    'status.running': '运行中',
    'status.error': '错误',
    'status.offline': '未安装',
    'status.unknown': '未知',

    // Agent 类型
    'type.cli': 'CLI',
    'type.desktop': '桌面应用',
    'type.web': 'Web 应用',

    // 设置
    'settings.title': '设置',
    'settings.theme': '主题设置',
    'settings.theme.dark': '深色',
    'settings.theme.light': '浅色',
    'settings.language': '语言设置',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.icons': 'Agent 图标自定义',
    'settings.icons.desc': '为每个 Agent 上传自定义图标',
    'settings.about': '关于',
    'settings.version': '版本',
    'settings.tech': '技术栈',
    'settings.github': '项目地址',
    'settings.reset': '重置',
    'settings.saved': '已保存',

    // 技能
    'skills.title': '技能管理',
    'skills.subtitle': '管理所有 Agent 的技能',
    'skills.add': '添加技能',
    'skills.empty': '暂无技能',
    'skills.empty.desc': '点击「添加技能」创建第一个技能',
    'skills.filter.all': '全部',
    'skills.filter.code': '代码',
    'skills.filter.debug': '调试',
    'skills.filter.deploy': '部署',
    'skills.filter.analysis': '分析',
    'skills.filter.automation': '自动化',
    'skills.filter.other': '其他',

    // 聊天
    'chat.title': '聊天记录',
    'chat.empty': '暂无对话',
    'chat.select': '选择一个对话开始',
    'chat.favorites': '收藏',
    'chat.all': '全部',
    'chat.input': '输入消息...',
    'chat.send': '发送',

    // 任务
    'tasks.title': '任务中心',
    'tasks.total': '总任务',
    'tasks.pending': '等待中',
    'tasks.running': '运行中',
    'tasks.completed': '已完成',
    'tasks.failed': '失败',

    // 更新日志
    'changelog.title': '更新日志',
    'changelog.subtitle': '版本更新记录',
    'changelog.feature': '新功能',
    'changelog.fix': '修复',
    'changelog.improve': '优化',

    // Agent 详情
    'agent.skills': '技能',
    'agent.chat': '聊天记录',
    'agent.terminal': '调用终端',
    'agent.launch': '启动',
    'agent.open_dir': '打开目录',
    'agent.disk': '磁盘',
    'agent.mem': '内存',
  },
  en: {
    // General
    'app.name': 'Agent Control Center',
    'app.loading': 'Loading...',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.add': 'Add',
    'app.search': 'Search...',
    'app.refresh': 'Refresh',
    'app.back': 'Back',
    'app.confirm': 'Confirm',
    'app.close': 'Close',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.skills': 'Skills',
    'nav.chat': 'Chat History',
    'nav.tasks': 'Tasks',
    'nav.settings': 'Settings',
    'nav.changelog': 'Changelog',

    // Dashboard
    'dashboard.title': 'Overview',
    'dashboard.subtitle': 'Detected {count} Agents',
    'dashboard.agents': 'Agents',
    'dashboard.installed': 'Installed',
    'dashboard.running': 'Running',
    'dashboard.cpu': 'CPU',
    'dashboard.search': 'Search...',
    'dashboard.scan': 'Scan',
    'dashboard.scanning': 'Scanning...',
    'dashboard.detected': 'Detected Agents',

    // Agent Status
    'status.online': 'Online',
    'status.idle': 'Idle',
    'status.running': 'Running',
    'status.error': 'Error',
    'status.offline': 'Offline',
    'status.unknown': 'Unknown',

    // Agent Type
    'type.cli': 'CLI',
    'type.desktop': 'Desktop',
    'type.web': 'Web',

    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.icons': 'Custom Agent Icons',
    'settings.icons.desc': 'Upload custom icons for each Agent',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.tech': 'Tech Stack',
    'settings.github': 'GitHub',
    'settings.reset': 'Reset',
    'settings.saved': 'Saved',

    // Skills
    'skills.title': 'Skills',
    'skills.subtitle': 'Manage all Agent skills',
    'skills.add': 'Add Skill',
    'skills.empty': 'No skills yet',
    'skills.empty.desc': 'Click "Add Skill" to create the first one',
    'skills.filter.all': 'All',
    'skills.filter.code': 'Code',
    'skills.filter.debug': 'Debug',
    'skills.filter.deploy': 'Deploy',
    'skills.filter.analysis': 'Analysis',
    'skills.filter.automation': 'Automation',
    'skills.filter.other': 'Other',

    // Chat
    'chat.title': 'Chat History',
    'chat.empty': 'No conversations',
    'chat.select': 'Select a conversation to start',
    'chat.favorites': 'Favorites',
    'chat.all': 'All',
    'chat.input': 'Type a message...',
    'chat.send': 'Send',

    // Tasks
    'tasks.title': 'Tasks',
    'tasks.total': 'Total',
    'tasks.pending': 'Pending',
    'tasks.running': 'Running',
    'tasks.completed': 'Completed',
    'tasks.failed': 'Failed',

    // Changelog
    'changelog.title': 'Changelog',
    'changelog.subtitle': 'Version update history',
    'changelog.feature': 'Feature',
    'changelog.fix': 'Fix',
    'changelog.improve': 'Improvement',

    // Agent Detail
    'agent.skills': 'Skills',
    'agent.chat': 'Chat History',
    'agent.terminal': 'Terminal',
    'agent.launch': 'Launch',
    'agent.open_dir': 'Open Directory',
    'agent.disk': 'Disk',
    'agent.mem': 'Memory',
  },
}

let currentLanguage: Language = 'zh'

export function setLanguage(lang: Language) {
  currentLanguage = lang
  localStorage.setItem('app-language', lang)
}

export function getLanguage(): Language {
  const saved = localStorage.getItem('app-language')
  if (saved === 'zh' || saved === 'en') {
    currentLanguage = saved
  }
  return currentLanguage
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = translations[currentLanguage]?.[key] || translations['en']?.[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }
  return text
}
