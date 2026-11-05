import { reactive } from 'vue'

export interface NameHero {
  id: number
  key: string
  en: string
  cn: string
  primary_attr: string
  ability_count: number
  abilities: string[]
}

export interface NameAbility {
  id: number | null
  key: string
  hero_id: number
  en: string
  cn: string
  type: string
  max_level: number | null
  /** 官方 CDN 技能图标路径（先天技能可能缺失或复用） */
  img?: string
}

export interface NameTalent {
  id: number | null
  key: string
  hero_id: number | null
  en: string
  cn: string
  tier: number | null
  unlock_levels: number[] | null
  resolved: boolean
  /** hero=本体天赋树，bear=小熊独立天赋树 */
  tree?: 'hero' | 'bear'
  max_level?: number
  desc_cn?: string
}

export interface NameItem {
  id: number | null
  key: string
  key_od: string
  en: string
  cn: string
  cost: number | null
  category?: string
  components: string[]
  created: boolean
  consumable: boolean
  /** 官方 CDN 图标路径（图纸共用 recipe.png） */
  icon?: string
}

export interface NamesIndex {
  heroById: Map<number, NameHero>
  heroByKey: Map<string, NameHero>
  abilityByKey: Map<string, NameAbility>
  abilityById: Map<number, NameAbility>
  talentById: Map<number, NameTalent>
  talentByHero: Map<number, NameTalent[]>
  talentByHeroId: Map<number, Map<number, NameTalent>>
  talentByHeroKey: Map<string, NameTalent>
  itemByKey: Map<string, NameItem>
  itemById: Map<number, NameItem>
  itemCost: Map<string, number>
}

/** 名称表加载状态：时间轴据此区分「加载中 / 加载失败 / 真的未收录」。 */
export const namesState = reactive({
  loading: false,
  loaded: false,
  error: ''
})

const CACHE_KEY = 'truesight.names.v2'
const BASE = import.meta.env.BASE_URL || './'

let pending: Promise<NamesIndex | null> | null = null
let cache: NamesIndex | null = null
let lastIndex: NamesIndex | null = null

function emptyIndex(): NamesIndex {
  return {
    heroById: new Map(),
    heroByKey: new Map(),
    abilityByKey: new Map(),
    abilityById: new Map(),
    talentById: new Map(),
    talentByHero: new Map(),
    talentByHeroId: new Map(),
    talentByHeroKey: new Map(),
    itemByKey: new Map(),
    itemById: new Map(),
    itemCost: new Map()
  }
}

interface NamePayload {
  heroes: NameHero[]
  abilities: NameAbility[]
  talents: NameTalent[]
  items: NameItem[]
}

/** 录像里的物品内部 key 与 OpenDota 常量不一致时，补一份别名。 */
const ITEM_ALIASES: Record<string, string> = {
  item_ironwood_branch: 'item_branches',
  item_boots_of_travel: 'item_travel_boots',
  item_boots_of_travel_2: 'item_travel_boots_2',
  item_divine_rapier: 'item_rapier',
  item_mask_of_death: 'item_lifesteal',
  item_boots_of_elven: 'item_boots_of_elves',
  item_manta_style: 'item_manta',
  item_teleport_scroll: 'item_tpscroll',
  item_lesser_critical: 'item_lesser_crit',
  item_greater_critical: 'item_greater_crit',
  item_chain_mail: 'item_chainmail',
  item_ghost_scepter: 'item_ghost',
  item_gris_gris: 'item_grisgris',
  item_observer_ward: 'item_ward_observer',
  item_sentry_ward: 'item_ward_sentry',
  item_perseverance: 'item_pers',
  item_plate_mail: 'item_platemail',
  item_ring_of_regeneration: 'item_ring_of_regen',
  item_robe_of_magi: 'item_robe',
  item_splint_mail: 'item_splintmail',
  item_empty_bottle: 'item_bottle',
  item_invisibility_edge: 'item_invis_sword',
  item_battlefury: 'item_bfury',
  item_gem_of_true_sight: 'item_gem',
  item_orchid_malevolence: 'item_orchid',
  item_cranium_basher: 'item_basher',
  item_forage_health: 'item_foragers_health',
  item_forage_mana: 'item_foragers_mana',
  item_forage_stats: 'item_foragers_stats',
  item_forage_kit: 'item_foragers_kit',
  item_recipe_battlefury: 'item_recipe_bfury',
  item_recipe_perseverance: 'item_recipe_pers',
  item_sheep_stick: 'item_sheepstick'
}

function buildIndex(data: NamePayload): NamesIndex {
  const index = emptyIndex()

  for (const hero of data.heroes) {
    index.heroById.set(hero.id, hero)
    index.heroByKey.set(hero.key, hero)
  }

  for (const ability of data.abilities) {
    index.abilityByKey.set(ability.key, ability)
    if (ability.id != null) index.abilityById.set(ability.id, ability)
  }

  for (const talent of data.talents) {
    if (talent.id != null) index.talentById.set(talent.id, talent)
    if (talent.hero_id == null) continue
    const list = index.talentByHero.get(talent.hero_id) ?? []
    list.push(talent)
    index.talentByHero.set(talent.hero_id, list)
    const byId = index.talentByHeroId.get(talent.hero_id) ?? new Map<number, NameTalent>()
    if (talent.id != null) byId.set(talent.id, talent)
    index.talentByHeroId.set(talent.hero_id, byId)
    index.talentByHeroKey.set(`${talent.hero_id}:${talent.key}`, talent)
  }

  for (const item of data.items) {
    index.itemByKey.set(item.key, item)
    if (item.key_od) index.itemByKey.set(item.key_od, item)
    if (item.id != null) index.itemById.set(item.id, item)
    if (item.cost != null) {
      index.itemCost.set(item.key, item.cost)
      if (item.key_od) index.itemCost.set(item.key_od, item.cost)
    }
  }

  // 录像/回放里的物品内部 key 偶尔和 OpenDota 常量不同，补齐别名
  for (const [alias, canonical] of Object.entries(ITEM_ALIASES)) {
    const item = index.itemByKey.get(canonical)
    if (!item) continue
    index.itemByKey.set(alias, item)
    if (item.cost != null) index.itemCost.set(alias, item.cost)
  }

  return index
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/**
 * 依次尝试：随前端打包的 ./names/*.json → 旧版 /api/names 接口。
 * 返回非 JSON（例如旧服务把 /api/names 当 SPA 路由回 index.html）时自动跳过。
 */
async function fetchJson<T>(file: string): Promise<T | null> {
  const sources = [`${BASE}names/${file}.json`, `/api/names?file=${encodeURIComponent(file)}`]
  for (const url of sources) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const res = await fetch(url)
        if (!res.ok) break
        const type = res.headers.get('content-type') ?? ''
        if (!type.includes('json')) break
        return (await res.json()) as T
      } catch {
        if (attempt === 0) await delay(120)
      }
    }
  }
  return null
}

export function loadNames(): Promise<NamesIndex | null> {
  if (cache) return Promise.resolve(cache)
  if (pending) return pending
  namesState.loading = true
  namesState.error = ''
  pending = (async () => {
    const [heroes, abilities, talents, items] = await Promise.all([
      fetchJson<NameHero[]>('heroes'),
      fetchJson<NameAbility[]>('abilities'),
      fetchJson<NameTalent[]>('talents'),
      fetchJson<NameItem[]>('items')
    ])
    const missing: string[] = []
    if (!heroes) missing.push('英雄')
    if (!abilities) missing.push('技能')
    if (!talents) missing.push('天赋')
    if (!items) missing.push('装备')

    namesState.loading = false
    pending = null
    if (missing.length === 4) {
      namesState.error = '名称数据加载失败'
      return null
    }

    const index = buildIndex({
      heroes: heroes ?? [],
      abilities: abilities ?? [],
      items: items ?? [],
      talents: talents ?? []
    })
    lastIndex = index
    namesState.loaded = true
    namesState.error = missing.length ? `部分名称未加载：${missing.join('、')}` : ''
    // 只有完整加载才作为缓存复用；缺文件时下次调用会再补一次
    if (!missing.length) {
      cache = index
      try {
        localStorage.setItem(CACHE_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    return index
  })()
  return pending
}

/** 同步取已加载的索引（没加载过返回 null）。 */
export function namesNow(): NamesIndex | null {
  return cache ?? lastIndex
}
