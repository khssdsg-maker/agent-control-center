import { useState, useEffect } from 'react'

export type Language = 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'

let languageListeners: (() => void)[] = []
let currentLanguage: Language = 'zh'

export function onLanguageChange(listener: () => void) {
  languageListeners.push(listener)
  return () => { languageListeners = languageListeners.filter((l) => l !== listener) }
}

function notifyLanguageChange() {
  languageListeners.forEach((l) => l())
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    'app.name': 'Agent Control Center', 'app.loading': '加载中...', 'app.save': '保存',
    'app.cancel': '取消', 'app.delete': '删除', 'app.edit': '编辑', 'app.add': '添加',
    'app.search': '搜索...', 'app.refresh': '刷新', 'app.back': '返回', 'app.close': '关闭',
    'nav.dashboard': '仪表盘', 'nav.skills': '技能管理', 'nav.chat': '聊天记录',
    'nav.tasks': '任务中心', 'nav.settings': '设置', 'nav.changelog': '更新日志',
    'dashboard.title': '概览', 'dashboard.subtitle': '检测到 {count} 个 Agent',
    'dashboard.agents': 'Agents', 'dashboard.installed': '已安装', 'dashboard.running': '运行中',
    'dashboard.cpu': 'CPU', 'dashboard.search': '搜索...', 'dashboard.scan': '扫描',
    'dashboard.scanning': '扫描中...', 'dashboard.detected': '检测到的 Agent',
    'settings.title': '设置', 'settings.theme': '主题设置', 'settings.theme.dark': '深色',
    'settings.theme.light': '浅色', 'settings.language': '语言设置',
    'settings.language.zh': '中文', 'settings.language.en': 'English',
    'settings.icons': 'Agent 图标自定义', 'settings.icons.desc': '为每个 Agent 上传自定义图标',
    'settings.about': '关于', 'settings.version': '版本', 'settings.tech': '技术栈',
    'settings.github': '项目地址', 'settings.reset': '重置', 'settings.saved': '已保存',
  },
  en: {
    'app.name': 'Agent Control Center', 'app.loading': 'Loading...', 'app.save': 'Save',
    'app.cancel': 'Cancel', 'app.delete': 'Delete', 'app.edit': 'Edit', 'app.add': 'Add',
    'app.search': 'Search...', 'app.refresh': 'Refresh', 'app.back': 'Back', 'app.close': 'Close',
    'nav.dashboard': 'Dashboard', 'nav.skills': 'Skills', 'nav.chat': 'Chat History',
    'nav.tasks': 'Tasks', 'nav.settings': 'Settings', 'nav.changelog': 'Changelog',
    'dashboard.title': 'Overview', 'dashboard.subtitle': 'Detected {count} Agents',
    'dashboard.agents': 'Agents', 'dashboard.installed': 'Installed', 'dashboard.running': 'Running',
    'dashboard.cpu': 'CPU', 'dashboard.search': 'Search...', 'dashboard.scan': 'Scan',
    'dashboard.scanning': 'Scanning...', 'dashboard.detected': 'Detected Agents',
    'settings.title': 'Settings', 'settings.theme': 'Theme', 'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light', 'settings.language': 'Language',
    'settings.language.zh': '中文', 'settings.language.en': 'English',
    'settings.icons': 'Custom Agent Icons', 'settings.icons.desc': 'Upload custom icons for each Agent',
    'settings.about': 'About', 'settings.version': 'Version', 'settings.tech': 'Tech Stack',
    'settings.github': 'GitHub', 'settings.reset': 'Reset', 'settings.saved': 'Saved',
  },
  ja: {
    'app.name': 'Agent Control Center', 'app.loading': '読み込み中...', 'app.save': '保存',
    'app.cancel': 'キャンセル', 'app.delete': '削除', 'app.edit': '編集', 'app.add': '追加',
    'app.search': '検索...', 'app.refresh': '更新', 'app.back': '戻る', 'app.close': '閉じる',
    'nav.dashboard': 'ダッシュボード', 'nav.skills': 'スキル', 'nav.chat': 'チャット履歴',
    'nav.tasks': 'タスク', 'nav.settings': '設定', 'nav.changelog': '更新履歴',
    'dashboard.title': '概要', 'dashboard.subtitle': '{count} 個のエージェントを検出',
    'dashboard.agents': 'エージェント', 'dashboard.installed': 'インストール済み', 'dashboard.running': '実行中',
    'dashboard.cpu': 'CPU', 'dashboard.search': '検索...', 'dashboard.scan': 'スキャン',
    'dashboard.scanning': 'スキャン中...', 'dashboard.detected': '検出されたエージェント',
    'settings.title': '設定', 'settings.theme': 'テーマ設定', 'settings.theme.dark': 'ダーク',
    'settings.theme.light': 'ライト', 'settings.language': '言語設定',
    'settings.language.zh': '中文', 'settings.language.en': 'English',
    'settings.icons': 'カスタムアイコン', 'settings.icons.desc': '各エージェントにカスタムアイコンをアップロード',
    'settings.about': 'について', 'settings.version': 'バージョン', 'settings.tech': '技術スタック',
    'settings.github': 'GitHub', 'settings.reset': 'リセット', 'settings.saved': '保存済み',
  },
  ko: {
    'app.name': 'Agent Control Center', 'app.loading': '로딩 중...', 'app.save': '저장',
    'app.cancel': '취소', 'app.delete': '삭제', 'app.edit': '편집', 'app.add': '추가',
    'app.search': '검색...', 'app.refresh': '새로고침', 'app.back': '뒤로', 'app.close': '닫기',
    'nav.dashboard': '대시보드', 'nav.skills': '스킬', 'nav.chat': '채팅 기록',
    'nav.tasks': '작업', 'nav.settings': '설정', 'nav.changelog': '변경 로그',
    'dashboard.title': '개요', 'dashboard.subtitle': '{count}개 에이전트 감지됨',
    'dashboard.agents': '에이전트', 'dashboard.installed': '설치됨', 'dashboard.running': '실행 중',
    'dashboard.cpu': 'CPU', 'dashboard.search': '검색...', 'dashboard.scan': '스캔',
    'dashboard.scanning': '스캔 중...', 'dashboard.detected': '감지된 에이전트',
    'settings.title': '설정', 'settings.theme': '테마 설정', 'settings.theme.dark': '다크',
    'settings.theme.light': '라이트', 'settings.language': '언어 설정',
    'settings.language.zh': '中文', 'settings.language.en': 'English',
    'settings.icons': '커스텀 아이콘', 'settings.icons.desc': '각 에이전트에 커스텀 아이콘 업로드',
    'settings.about': '정보', 'settings.version': '버전', 'settings.tech': '기술 스택',
    'settings.github': 'GitHub', 'settings.reset': '초기화', 'settings.saved': '저장됨',
  },
  fr: {
    'app.name': 'Agent Control Center', 'app.loading': 'Chargement...', 'app.save': 'Enregistrer',
    'app.cancel': 'Annuler', 'app.delete': 'Supprimer', 'app.edit': 'Modifier', 'app.add': 'Ajouter',
    'app.search': 'Rechercher...', 'app.refresh': 'Actualiser', 'app.back': 'Retour', 'app.close': 'Fermer',
    'nav.dashboard': 'Tableau de bord', 'nav.skills': 'Compétences', 'nav.chat': 'Historique',
    'nav.tasks': 'Tâches', 'nav.settings': 'Paramètres', 'nav.changelog': 'Journal',
    'dashboard.title': 'Aperçu', 'dashboard.subtitle': '{count} agents détectés',
    'settings.title': 'Paramètres', 'settings.theme': 'Thème', 'settings.language': 'Langue',
    'settings.saved': 'Enregistré',
  },
  de: {
    'app.name': 'Agent Control Center', 'app.loading': 'Laden...', 'app.save': 'Speichern',
    'app.cancel': 'Abbrechen', 'app.delete': 'Löschen', 'app.edit': 'Bearbeiten', 'app.add': 'Hinzufügen',
    'app.search': 'Suchen...', 'app.refresh': 'Aktualisieren', 'app.back': 'Zurück', 'app.close': 'Schließen',
    'nav.dashboard': 'Dashboard', 'nav.skills': 'Fähigkeiten', 'nav.chat': 'Chatverlauf',
    'nav.tasks': 'Aufgaben', 'nav.settings': 'Einstellungen', 'nav.changelog': 'Änderungsprotokoll',
    'dashboard.title': 'Übersicht', 'dashboard.subtitle': '{count} Agenten erkannt',
    'settings.title': 'Einstellungen', 'settings.theme': 'Thema', 'settings.language': 'Sprache',
    'settings.saved': 'Gespeichert',
  },
  es: {
    'app.name': 'Agent Control Center', 'app.loading': 'Cargando...', 'app.save': 'Guardar',
    'app.cancel': 'Cancelar', 'app.delete': 'Eliminar', 'app.edit': 'Editar', 'app.add': 'Agregar',
    'app.search': 'Buscar...', 'app.refresh': 'Actualizar', 'app.back': 'Volver', 'app.close': 'Cerrar',
    'nav.dashboard': 'Panel', 'nav.skills': 'Habilidades', 'nav.chat': 'Historial',
    'nav.tasks': 'Tareas', 'nav.settings': 'Configuración', 'nav.changelog': 'Registro',
    'dashboard.title': 'Resumen', 'dashboard.subtitle': '{count} agentes detectados',
    'settings.title': 'Configuración', 'settings.theme': 'Tema', 'settings.language': 'Idioma',
    'settings.saved': 'Guardado',
  },
  ru: {
    'app.name': 'Agent Control Center', 'app.loading': 'Загрузка...', 'app.save': 'Сохранить',
    'app.cancel': 'Отмена', 'app.delete': 'Удалить', 'app.edit': 'Редактировать', 'app.add': 'Добавить',
    'app.search': 'Поиск...', 'app.refresh': 'Обновить', 'app.back': 'Назад', 'app.close': 'Закрыть',
    'nav.dashboard': 'Панель', 'nav.skills': 'Навыки', 'nav.chat': 'История',
    'nav.tasks': 'Задачи', 'nav.settings': 'Настройки', 'nav.changelog': 'Журнал',
    'dashboard.title': 'Обзор', 'dashboard.subtitle': 'Обнаружено {count} агентов',
    'settings.title': 'Настройки', 'settings.theme': 'Тема', 'settings.language': 'Язык',
    'settings.saved': 'Сохранено',
  },
}

export function setLanguage(lang: Language) {
  currentLanguage = lang
  localStorage.setItem('app-language', lang)
  notifyLanguageChange()
}

export function getLanguage(): Language {
  const saved = localStorage.getItem('app-language')
  if (saved && saved in translations) {
    currentLanguage = saved as Language
  }
  return currentLanguage
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(getLanguage())
  useEffect(() => {
    const unsubscribe = onLanguageChange(() => setLang(getLanguage()))
    return unsubscribe
  }, [])
  return lang
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
