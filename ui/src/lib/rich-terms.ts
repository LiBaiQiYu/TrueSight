import type { NamesIndex } from './names'
import type { HeroInfo } from './heroes'

const CDN = 'https://cdn.cloudflare.steamstatic.com'
const HERO_ICON = '/apps/dota2/images/dota_react/heroes/icons'
const ITEM_ICON = '/apps/dota2/images/dota_react/items'
const ABILITY_ICON = '/apps/dota2/images/dota_react/abilities'

interface Term {
  cn: string
  en: string
  icon: string
  /** 图标 404 时退回英雄头像（主要给先天技能用） */
  fallback?: string
  /** 物品内部 key，用于修复“中文_mask”这类混合串 */
  key?: string
  /** 两个字的中文物品名容易和普通词撞车，需要上下文才加图标 */
  shortItem?: boolean
}

export interface NameTerms {
  regex: RegExp
  lookup: Map<string, Term>
  items: Term[]
}

/** 这些技能名本身是通用词，出现在正文里多半不是技能，不注册中文匹配（英文名仍然翻译）。 */
const ABILITY_STOPWORDS = new Set([
  '威胁', '闪避', '重击', '眩晕', '沉默', '治疗', '减速', '加速', '暴击', '吸血',
  '护盾', '恐惧', '缠绕', '击退', '跳跃', '冲锋', '隐身', '侦测', '免疫', '驱散',
  '净化', '复活', '传送', '召唤', '分裂', '溅射', '反伤', '格挡', '连击', '眩晕'
])

/** 模型常见的近义/错写中文名 → 官方中文名。 */
const CN_ALIASES: Record<string, string> = {
  坚韧鼓: '韧鼓',
  坚韧之鼓: '韧鼓',
  坚毅鼓: '韧鼓',
  战鼓: '韧鼓'
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function heroSlug(key: string): string {
  return key.replace(/^npc_dota_hero_/, '')
}

function cleanIcon(path: string | undefined): string {
  if (!path) return ''
  return path.replace(/\?.*$/, '')
}

/**
 * 用现有中文名称表构建「英文/中文 → 中文名 + 图标」的匹配器。
 * 只收长度 ≥2 的中文名、≥3 的英文名，避免单字误伤。
 */
export function buildNameTerms(
  names: NamesIndex | null,
  heroes: Map<number, HeroInfo> | null,
  heroIds?: number[] | null
): NameTerms | null {
  if (!names) return null
  const lookup = new Map<string, Term>()
  const items: Term[] = []
  const abilityHeroes = heroIds && heroIds.length ? new Set(heroIds) : null

  const heroIcon = (heroId: number): string => {
    const hero = names.heroById.get(heroId)
    if (!hero) return ''
    return heroes?.get(heroId)?.img || `${CDN}${HERO_ICON}/${heroSlug(hero.key)}.png`
  }

  const add = (
    cn: string,
    en: string,
    icon: string,
    options: { withCnKey?: boolean; fallback?: string; key?: string; shortItem?: boolean } = {}
  ): Term | null => {
    const cleanCn = (cn || '').trim()
    const cleanEn = (en || '').trim()
    if (cleanCn.length < 2) return null
    const term: Term = {
      cn: cleanCn,
      en: cleanEn,
      icon,
      fallback: options.fallback,
      key: options.key,
      shortItem: options.shortItem
    }
    if (cleanEn.length >= 3 && /[a-z]/i.test(cleanEn)) {
      const key = cleanEn.toLowerCase()
      if (!lookup.has(key)) lookup.set(key, term)
    }
    if (options.withCnKey !== false && !lookup.has(cleanCn)) lookup.set(cleanCn, term)
    return term
  }

  for (const hero of names.heroById.values()) {
    add(hero.cn, hero.en, heroIcon(hero.id))
  }
  for (const item of names.itemById.values()) {
    // 中立装备的“强化词条”（神秘/迅捷/壮实…）不是可购买道具，不参与图标匹配
    if (item.key.startsWith('item_enhancement')) continue
    if ((item.category || '') === '强化') continue
    const icon = item.icon
      ? `${CDN}${cleanIcon(item.icon)}`
      : `${CDN}${ITEM_ICON}/${item.key.replace(/^item_/, '')}.png`
    const term = add(item.cn, item.en, icon, {
      key: item.key,
      shortItem: (item.cn || '').trim().length === 2
    })
    if (term) items.push(term)
  }
  for (const ability of names.abilityByKey.values()) {
    const inMatch = !abilityHeroes || abilityHeroes.has(ability.hero_id)
    const cn = (ability.cn || '').trim()
    const en = (ability.en || '').trim()
    if (inMatch) {
      const path = cleanIcon(ability.img) || `${ABILITY_ICON}/${ability.key}.png`
      add(cn, en, `${CDN}${path}`, {
        withCnKey: !ABILITY_STOPWORDS.has(cn),
        fallback: heroIcon(ability.hero_id),
        key: ability.key
      })
    } else if (cn.length >= 2 && en.length >= 3 && /[a-z]/i.test(en)) {
      // 非本场技能仍然把英文名换成中文，但不加图标，也不注册中文词
      const key = en.toLowerCase()
      if (!lookup.has(key)) lookup.set(key, { cn, en, icon: '' })
    }
  }

  // 常见错写/近义名指向官方中文名，长词会优先匹配（如「坚韧鼓」→「韧鼓」）
  for (const [alias, canonical] of Object.entries(CN_ALIASES)) {
    const term = lookup.get(canonical)
    if (term && !lookup.has(alias)) lookup.set(alias, term)
  }

  if (!lookup.size) return null
  const enParts = [...lookup.keys()]
    .filter((key) => /[a-z]/i.test(key) && key.length >= 3)
    .sort((a, b) => b.length - a.length)
    .map((key) => escapeRe(key))
  const cnParts = [...lookup.keys()]
    .filter((key) => !/[a-z]/i.test(key))
    .sort((a, b) => b.length - a.length)
    .map((key) => escapeRe(key))
  const regex = new RegExp(`(?:${[...cnParts, ...enParts].join('|')})`, 'gi')
  return { regex, lookup, items }
}

function richTerm(term: Term): string {
  if (!term.icon) return term.cn
  const fallback = term.fallback
  const onerror = fallback
    ? `if(this.dataset.fb){this.remove()}else{this.dataset.fb='1';this.src='${fallback}'}`
    : 'this.remove()'
  return `<span class="rich-term"><img src="${term.icon}" alt="" loading="lazy" onerror="${onerror}" />${term.cn}</span>`
}

/** 修复模型偶发的“贤者面_mask”这类「中文 + 内部 key 后缀」混合串。 */
function repairMixed(text: string, terms: NameTerms): string {
  if (!terms.items.length || !/[\u4e00-\u9fa5]_[A-Za-z]/.test(text)) return text
  return text.replace(
    /([\u4e00-\u9fa5]{2,})_([A-Za-z][A-Za-z0-9_]*)/g,
    (raw, cnPart: string, suffix: string) => {
      const term = terms.items.find(
        (item) =>
          item.cn.startsWith(cnPart) &&
          (item.key === `item_${suffix}` || (item.key ? item.key.endsWith(`_${suffix}`) : false))
      )
      return term ? richTerm(term) : raw
    }
  )
}

/** 装备语境词：两字物品名只有在这种上下文里才加图标，避免「王冠之力」这类误判。 */
const ITEM_CONTEXT_RE =
  /(出|买|合|装|带|换|卖|做|裸|补|背|格|道具|装备|物品|身上|拥有|提供|升级|购买|出售|路线|合成|消耗|使用|携带|属性)/

function hasItemContext(text: string, offset: number, length: number): boolean {
  const start = Math.max(0, offset - 8)
  const end = Math.min(text.length, offset + length + 8)
  return ITEM_CONTEXT_RE.test(text.slice(start, end))
}

function decorateText(text: string, terms: NameTerms): string {
  const replaced = text.replace(terms.regex, (raw, offset: number, whole: string) => {
    const term = terms.lookup.get(raw) ?? terms.lookup.get(raw.toLowerCase())
    if (!term) return raw
    // 英文词要求前后不是字母，避免 Lunatic 里命中 Luna
    if (/^[a-z]/i.test(raw)) {
      const before = whole[offset - 1] ?? ''
      const after = whole[offset + raw.length] ?? ''
      if (/[a-z]/i.test(before) || /[a-z]/i.test(after)) return raw
      // 短英文词（≤4）只在首字母大写时替换，减少 axe/satan 之类的误伤
      if (raw.length <= 4 && raw[0] === raw[0].toLowerCase()) return raw
    }
    // 两个字的中文物品名（王冠/蝴蝶/圆环…）只有在装备语境或独立成词时才加图标
    if (
      term.shortItem &&
      raw === term.cn &&
      whole.trim().length > raw.length + 2 &&
      !hasItemContext(whole, offset, raw.length)
    ) {
      return raw
    }
    return richTerm(term)
  })
  return repairMixed(replaced, terms)
}

/** 在已渲染的 HTML 文本节点中把名称替换成「图标 + 中文名」，跳过 code/pre。 */
export function decorateNames(html: string, terms: NameTerms | null): string {
  if (!terms || !html) return html
  let out = ''
  let last = 0
  let codeDepth = 0
  const tagRe = /<[^>]+>/g
  let match: RegExpExecArray | null
  while ((match = tagRe.exec(html))) {
    const text = html.slice(last, match.index)
    out += codeDepth > 0 ? text : decorateText(text, terms)
    const tag = match[0]
    out += tag
    if (/^<(code|pre)(\s|>)/i.test(tag)) codeDepth += 1
    else if (/^<\/(code|pre)>/i.test(tag)) codeDepth = Math.max(0, codeDepth - 1)
    last = match.index + tag.length
  }
  const tail = html.slice(last)
  out += codeDepth > 0 ? tail : decorateText(tail, terms)
  return out
}
