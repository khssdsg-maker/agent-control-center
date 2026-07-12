import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'

export interface RealSkill {
  id: string
  agentId: string
  name: string
  description: string
  category: string
  source: string  // 文件路径
}

// 解析 YAML frontmatter
function parseFrontmatter(content: string): { name: string; description: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return { name: '', description: '' }

  const yaml = match[1]
  let name = ''
  let description = ''

  const nameMatch = yaml.match(/name:\s*["']?([^"'\n]+)["']?/)
  if (nameMatch) name = nameMatch[1].trim()

  const descMatch = yaml.match(/description:\s*["']?([^"'\n]+)["']?/)
  if (descMatch) description = descMatch[1].trim()

  return { name, description }
}

// 扫描 Claude Code 技能
function scanClaudeSkills(homedir: string): RealSkill[] {
  const skills: RealSkill[] = []
  const pluginsDir = path.join(homedir, '.claude', 'plugins', 'marketplaces', 'claude-plugins-official', 'plugins')

  if (!existsSync(pluginsDir)) return skills

  const pluginDirs = readdirSync(pluginsDir)
  for (const pluginDir of pluginDirs) {
    const skillsDir = path.join(pluginsDir, pluginDir, 'skills')
    if (!existsSync(skillsDir)) continue

    const skillDirs = readdirSync(skillsDir)
    for (const skillDir of skillDirs) {
      const skillFile = path.join(skillsDir, skillDir, 'SKILL.md')
      if (!existsSync(skillFile)) continue

      try {
        const content = readFileSync(skillFile, 'utf-8')
        const { name, description } = parseFrontmatter(content)

        if (name) {
          skills.push({
            id: `claude-${pluginDir}-${skillDir}`,
            agentId: 'claude',
            name,
            description: description.substring(0, 200),
            category: '其他',
            source: skillFile,
          })
        }
      } catch {}
    }
  }

  return skills
}

// 扫描 MiMo Code 技能
function scanMiMoSkills(homedir: string): RealSkill[] {
  const skills: RealSkill[] = []
  const skillsDirs = [
    path.join(homedir, '.mimocode', 'skills'),
    path.join(homedir, 'Desktop', '.mimocode', 'skills'),
  ]

  for (const skillsDir of skillsDirs) {
    if (!existsSync(skillsDir)) continue

    const skillDirs = readdirSync(skillsDir)
    for (const skillDir of skillDirs) {
      const skillFile = path.join(skillsDir, skillDir, 'SKILL.md')
      if (!existsSync(skillFile)) continue

      try {
        const content = readFileSync(skillFile, 'utf-8')
        const { name, description } = parseFrontmatter(content)

        if (name) {
          skills.push({
            id: `mimo-${skillDir}`,
            agentId: 'mimocode',
            name,
            description: description.substring(0, 200),
            category: '其他',
            source: skillFile,
          })
        }
      } catch {}
    }
  }

  return skills
}

// 扫描所有 Agent 的技能
export function scanAllSkills(homedir: string): RealSkill[] {
  const allSkills: RealSkill[] = []
  allSkills.push(...scanClaudeSkills(homedir))
  allSkills.push(...scanMiMoSkills(homedir))
  return allSkills
}
