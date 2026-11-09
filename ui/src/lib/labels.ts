import type { NamesIndex } from './names'

/**
 * 录像战斗日志里的名字兜底。
 *
 * Clarity 导出的事件有时带着官方名称表没有的内部类名：
 * `npc_dota_hero_axe`、`npc_dota_creep_goodguys_melee`、`plus_high_five`、
 * `ancient_apparition_ice_blast_release` 等。这里统一转成可读名字，
 * 保证 UI 和 AI 提示词里不会再出现 `npc_xxx` 这类原始变量名。
 */

const UNIT_PREFIX = /^(?:npc_dota_|npc_|cdota_unit_|dota_unit_)/i
const HERO_PREFIX = /^(?:npc_dota_hero_|cdota_unit_hero_|npc_dota_unit_hero_)/i

const SIDE_CN: Record<string, string> = {
  goodguys: '天辉',
  badguys: '夜魇'
}

const LANE_CN: Record<string, string> = {
  top: '上路',
  mid: '中路',
  bot: '下路',
  bottom: '下路'
}

const TIER_CN = ['', '一', '二', '三', '四']

const WORD_CN: Record<string, string> = {
  melee: '近战',
  ranged: '远程',
  siege: '攻城车',
  flagbearer: '旗手',
  upgraded: '',
  creep: '小兵',
  neutral: '野怪'
}

/** 召唤物 / 中立生物 / 特殊单位：按类名片段匹配。 */
const KNOWN_UNITS: Array<[RegExp, string]> = [
  [/lone_druid_bear/, '熊灵'],
  [/lycan_wolf/, '狼'],
  [/invoker_forged_spirit/, '熔炉精灵'],
  [/twin_gate/, '双子之门'],
  [/warlock_golem/, '地狱火'],
  [/monkey_king_soldier/, '猴子猴孙'],
  [/dota_lantern|_lantern$/, '提灯'],
  [/dota_fountain/, '泉水'],
  [/outpost/i, '前哨'],
  [/roshan/, '肉山'],
  [/tormentor/, '痛苦魔方'],
  [/neutral_(?:alpha_wolf)/, '头狼'],
  [/neutral_(?:big_thunder_lizard)/, '雷霆蜥蜴'],
  [/neutral_(?:centaur_khan)/, '半人马可汗'],
  [/neutral_(?:dark_troll_warlord)/, '黑暗巨魔督军'],
  [/neutral_(?:dark_troll)/, '黑暗巨魔'],
  [/neutral_(?:enraged_wildkin)/, '愤怒的野枭'],
  [/neutral_(?:forest_troll_berserker)/, '森林巨魔狂战士'],
  [/neutral_(?:gnoll_assassin)/, '豺狼人刺客'],
  [/neutral_(?:granite_golem)/, '花岗岩魔像'],
  [/neutral_(?:grown_frog)/, '巨型青蛙'],
  [/neutral_(?:mud_golem)/, '泥魔像'],
  [/neutral_(?:ogre_magi)/, '食人魔魔法师'],
  [/neutral_(?:polar_furbolg_champion)/, '极地熊怪斗士'],
  [/neutral_(?:polar_furbolg_ursa_warrior)/, '极地熊怪战士'],
  [/neutral_(?:prowler_shaman)/, '潜行萨满'],
  [/neutral_(?:satyr_trickster)/, '萨特诡诈者'],
  [/neutral_(?:warpine_raider)/, '战争树人突袭者'],
  [/neutral_(?:ghost)/, '鬼魂']
]

/** 名称表里没有、但战斗日志经常出现的技能内部名。 */
const ABILITY_ALIASES: Record<string, string> = {
  plus_high_five: '击掌',
  ability_capture: '占领前哨',
  ability_lamp_use: '提灯',
  twin_gate_portal_warp: '双子之门传送',
  spirit_breaker_greater_bash: '强化攻击（Greater Bash）'
}

/** 回放里常见的子技能/变体后缀，剥掉后再查表。 */
const ABILITY_SUFFIX = /_(release|stop|end|datadriven|legacy|alt|custom|ad)$/

const ACRONYM: Record<string, string> = {
  hp: 'HP',
  mp: 'MP',
  xp: 'XP',
  aoe: 'AOE',
  dot: 'DOT'
}

function titleWords(value: string): string {
  return value
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase()
      if (ACRONYM[lower]) return ACRONYM[lower]
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

function sideOf(tokens: string[]): string {
  for (const token of tokens) {
    if (SIDE_CN[token]) return SIDE_CN[token]
  }
  return ''
}

function laneOf(tokens: string[]): string {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const lane = LANE_CN[tokens[index]]
    if (lane) return `（${lane}）`
  }
  return ''
}

function describeUnit(lower: string, tokens: string[]): string {
  const side = sideOf(tokens)
  const lane = laneOf(tokens)

  if (tokens.includes('fort') || tokens.includes('filler')) return `${side}遗迹`
  if (tokens.includes('tower') || tokens.some((token) => /^tower\d$/.test(token))) {
    const tierToken = tokens.find((token) => /^tower\d$/.test(token))
    const tier = tierToken ? TIER_CN[Number(tierToken.slice(-1))] ?? '' : ''
    return `${side}${tier}塔${lane}`
  }
  if (tokens.includes('rax')) {
    const kind = tokens.includes('range') || tokens.includes('ranged') ? '远程' : '近战'
    return `${side}${kind}兵营${lane}`
  }
  if (tokens.includes('creep') || tokens.includes('siege') || tokens.includes('flagbearer')) {
    if (tokens.includes('siege')) return `${side}攻城车`
    const kind = tokens.includes('flagbearer')
      ? '旗手'
      : tokens.includes('ranged')
        ? '远程兵'
        : tokens.includes('melee')
          ? '近战兵'
          : '小兵'
    return `${side}${kind}`
  }
  if (tokens.includes('neutral')) {
    const rest = tokens.filter((token) => token !== 'neutral')
    return `野怪（${titleWords(rest.join(' '))}）`
  }

  // 未知单位：去掉内部前缀，输出可读英文名，至少不再出现 npc_xxx。
  const words = tokens.map((token) => WORD_CN[token] ?? token).filter(Boolean)
  return words.length ? titleWords(words.join(' ')) : titleWords(lower.replace(UNIT_PREFIX, ''))
}

/** 是否是单位类内部名（英雄/小兵/建筑/召唤物）。 */
export function isUnitKey(raw: string | null | undefined): boolean {
  const value = (raw || '').trim().toLowerCase()
  if (!value) return false
  return (
    value.startsWith('npc_') ||
    value.startsWith('cdota_') ||
    value.startsWith('dota_fountain') ||
    value.startsWith('#dota_')
  )
}

/** 单位名 → 官方中文名 / 可读描述。 */
export function unitName(raw: string | null | undefined, names?: NamesIndex | null): string {
  const value = (raw || '').trim()
  if (!value) return ''

  const direct = names?.heroByKey.get(value)
  if (direct) return direct.cn || direct.en || ''

  const lower = value.toLowerCase()
  if (names) {
    const slug = lower.replace(HERO_PREFIX, '')
    const hero = names.heroByKey.get(`npc_dota_hero_${slug}`)
    if (hero) return hero.cn || hero.en || ''
  }

  // 召唤物常常直接沿用技能 key：npc_dota_witch_doctor_death_ward → 死亡守卫
  const ability = names?.abilityByKey.get(lower.replace(UNIT_PREFIX, ''))
  if (ability) return ability.cn || ability.en || ''

  for (const [pattern, label] of KNOWN_UNITS) {
    if (pattern.test(lower)) return label
  }

  if (HERO_PREFIX.test(lower)) {
    const slug = lower.replace(HERO_PREFIX, '')
    return titleWords(slug)
  }

  const tokens = lower.replace(UNIT_PREFIX, '').split(/[_\s]+/).filter(Boolean)
  if (!tokens.length) return value
  return describeUnit(lower, tokens)
}

/** 技能内部名 → 官方中文名 / 可读名。 */
export function abilityName(raw: string | null | undefined, names?: NamesIndex | null): string {
  const value = (raw || '').trim()
  if (!value) return ''
  const lower = value.toLowerCase()

  const direct = names?.abilityByKey.get(value) ?? names?.abilityByKey.get(lower)
  if (direct) return direct.cn || direct.en || ''

  const alias = ABILITY_ALIASES[lower]
  if (alias) return alias

  // 子技能/变体：剥掉后缀再查一次（如 ice_blast_release → ice_blast）
  const stripped = lower.replace(ABILITY_SUFFIX, '')
  if (stripped !== lower) {
    const base = names?.abilityByKey.get(stripped)
    if (base) {
      const suffix = lower.endsWith('_release') ? '（释放）' : ''
      return `${base.cn || base.en}${suffix}`
    }
    const baseAlias = ABILITY_ALIASES[stripped]
    if (baseAlias) return baseAlias
  }

  // 去掉英雄 slug 前缀，避免 "Axe Berserkers Call" 这类读法。
  let tokens = lower.split(/[_\s]+/).filter(Boolean)
  if (tokens.length > 1 && names?.heroByKey.get(`npc_dota_hero_${tokens[0]}`)) {
    tokens = tokens.slice(1)
  }
  const text = titleWords(tokens.join(' '))
  return text || value
}

/** 装备内部名 → 官方中文名 / 可读名。 */
export function itemName(raw: string | null | undefined, names?: NamesIndex | null): string {
  const value = (raw || '').trim()
  if (!value) return ''
  const key = value.startsWith('item_') ? value : `item_${value}`
  const item = names?.itemByKey.get(key)
  if (item) return item.cn || item.en || ''
  return titleWords(value.replace(/^item_/, '').replace(/_/g, ' '))
}
