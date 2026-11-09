import type { OpenDotaMatch, OpenDotaPlayer } from './opendota'
import type { RosterPlayer } from './roster'
import type { ReplayInventorySnapshot, ReplayParse, ReplayPositions } from './replay'
import type { NamesIndex } from './names'
import { buildTeamfights, type TeamfightInfo } from './teamfights'
import { buildCombatNodes, type CombatNode } from './combatNodes'

export type MetricKey = 'netWorth' | 'lastHits' | 'xp' | 'heroDamage'

export interface ChartSeries {
  slot: number
  label: string
  color: string
  /** 英雄头像（用于图表浮窗） */
  img: string
  values: Array<number | null>
  /** 采样间隔（秒）：回放 5 秒，OpenDota 60 秒 */
  stepSec: number
}

export interface TimelinePoint {
  /** 分钟（细采样时是小数） */
  minute: number
  /** 秒（回放 5 秒采样用） */
  sec: number
  netWorth: number | null
  lastHits: number | null
  denies: number | null
  xp: number | null
  level: number | null
  kills: number
  deaths: number
  assists: number | null
  heroDamage: number | null
}

export interface Purchase {
  sec: number
  key: string
  cost: number | null
  source: 'replay' | 'opendota'
  /** 被合成进哪件装备；null 表示一直保留 */
  mergedInto?: string | null
  /** 离开背包的时间（被合成/卖出/消耗，秒）；null 表示没被消耗 */
  consumedAt?: number | null
  /** 因背包满而被卖出的时间（秒） */
  soldAt?: number | null
  /** 离开背包但不是卖出：使用/升级/交给熊等 */
  consumedReason?: 'used' | 'upgraded' | 'transferred' | 'removed'
  recipe?: boolean
  consumable?: boolean
  /** 永久生效、不占格子的物品（如魔晶） */
  permanent?: boolean
  /** 组合守卫拆出来的真眼/假眼记录 */
  origin?: 'dispenser'
}

/** 一次物品使用（真假眼、吃树、清晰等）。 */
export interface UseEvent {
  sec: number
  key: string
}

/** A real sell event parsed from the replay's item entities. */
export interface SellEvent {
  sec: number
  key: string
}

/** A removal event that may be a sale, consumption, upgrade or bear transfer. */
export interface RemovalEvent {
  sec: number
  key: string
  added: string[]
}

/** Exact 6 equipment + 1 neutral + 3 backpack slots at one replay timestamp. */
export interface InventorySnapshot {
  sec: number
  main: string[]
  neutral: string
  backpack: string[]
}

export type UpgradeKind = 'ability' | 'talent' | 'attribute' | 'unknown'

export interface Upgrade {
  order: number
  key: string
  kind: UpgradeKind
  tier: number | null
  label: string
}

export interface TimelinePlayer {
  slot: number
  heroId: number
  playerName: string
  isRadiant: boolean
  position: number | null
  laneRole: number | null
  isFocus: boolean
  isMatchup: boolean
  points: TimelinePoint[]
  /** 回放 5 秒采样；没有时退回 points（OpenDota 分钟） */
  finePoints?: TimelinePoint[]
  chartStepSec: number
  purchases: Purchase[]
  purchaseSource: 'replay' | 'opendota' | 'none'
  /** 背包是否来自回放的真实格位（否则只显示基础出装路线，不显示此刻背包） */
  inventoryExact: boolean
  inventorySnapshots: InventorySnapshot[]
  /** 小熊背包（仅德鲁伊）：6+1+3 格真实快照 */
  bearInventoryExact: boolean
  bearInventorySnapshots: InventorySnapshot[]
  pregameCount: number
  upgrades: Upgrade[]
  talents: Array<{
    key: string
    tier: number
    cn: string
    picked: boolean
    unlockLevels: number[]
    tree: 'hero' | 'bear'
  }>
  attributePicks: number
  finalItems: string[]
  finalKda: { kills: number; deaths: number; assists: number }
}

export interface TimelineModel {
  matchId: number
  durationSec: number
  players: TimelinePlayer[]
  selected: TimelinePlayer[]
  focus: TimelinePlayer | null
  teamfights: TeamfightInfo[]
  combatNodes: CombatNode[]
  positions: ReplayPositions | null
  hasItems: boolean
  hasSkills: boolean
  sources: string[]
}

export interface PairSnapshot {
  netWorth: number | null
  lastHits: number | null
  xp: number | null
  level: number | null
  kills: number
  deaths: number
  diff: {
    netWorth: number | null
    lastHits: number | null
    xp: number | null
    level: number | null
  }
}

export interface PositionPair {
  position: number
  ally: TimelinePlayer
  enemy: TimelinePlayer
  at10: PairSnapshot | null
  at20: PairSnapshot | null
  coreAlly: Purchase | null
  coreEnemy: Purchase | null
  coreDiffSec: number | null
}

const INVOKER_LEVELABLE = new Set([
  'invoker_quas',
  'invoker_wex',
  'invoker_exort',
  'invoker_invoke'
])

// 官方经验表（累计到该等级所需经验，1–30 级）
const XP_TOTAL = [
  0, 240, 640, 1160, 1760, 2440, 3200, 4000, 4900, 5900, 7000, 8200, 9500, 10900, 12400,
  14000, 15700, 17500, 19400, 21400, 23600, 26000, 28600, 31400, 34400, 38400, 43400,
  49400, 56400, 63900
]

export function levelFromXp(xp: number | null | undefined): number | null {
  if (xp == null) return null
  let level = 1
  for (let i = 1; i < XP_TOTAL.length; i += 1) {
    if (xp >= XP_TOTAL[i]) level = i + 1
  }
  return level
}

export function formatClock(sec: number): string {
  const value = Math.max(0, Math.floor(sec))
  const m = Math.floor(value / 60)
  const s = value % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function parseClock(text: string): number | null {
  const match = text?.match(/^(\d+):(\d{1,2})$/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function normalizeItemKey(key: string): string {
  if (!key) return ''
  return key.startsWith('item_') ? key : `item_${key}`
}

/**
 * 版本相关的内部 key 映射。内部类名可能在版本间复用到不同物品，
 * 因此只按已验证的 build 做映射；没有 build 的旧缓存不做跨版本猜测。
 */
const VERSIONED_ITEM_ALIASES: Record<number, Record<string, string>> = {
  10836: { item_guardian_shell: 'item_defiant_shell' },
  10939: { item_guardian_shell: 'item_defiant_shell' }
}

function versionedItemKey(key: string, build: number | undefined): string {
  if (build == null) return key
  return VERSIONED_ITEM_ALIASES[build]?.[key] ?? key
}

function padSeries(source: number[] | undefined, count: number): Array<number | null> {
  if (!Array.isArray(source) || !source.length) return new Array(count).fill(null)
  const out: Array<number | null> = []
  for (let i = 0; i < count; i += 1) {
    const value = source[i]
    out.push(typeof value === 'number' ? value : null)
  }
  return out
}

function countBefore(events: Array<{ time?: number }> | undefined, sec: number): number {
  if (!events?.length) return 0
  let total = 0
  for (const event of events) {
    if (typeof event.time === 'number' && event.time <= sec) total += 1
  }
  return total
}

function resolveUpgrade(
  id: number,
  heroId: number,
  names: NamesIndex | null
): { key: string; kind: UpgradeKind; tier: number | null; label: string } {
  if (id === 730) {
    return { key: 'special_bonus_attributes', kind: 'attribute', tier: null, label: '属性附加' }
  }
  if (names) {
    const talent =
      names.talentByHeroId.get(heroId)?.get(id) ?? names.talentById.get(id)
    if (talent) {
      return {
        key: talent.key,
        kind: 'talent',
        tier: talent.tier,
        label: talent.cn || talent.en || talent.key
      }
    }
    const ability = names.abilityById.get(id)
    if (ability) {
      return { key: ability.key, kind: 'ability', tier: null, label: ability.cn || ability.en || ability.key }
    }
  }
  return { key: `ability#${id}`, kind: 'unknown', tier: null, label: '未收录技能' }
}

function purchaseCost(key: string, names: NamesIndex | null): number | null {
  if (!names) return null
  return names.itemCost.get(key) ?? names.itemCost.get(key.replace(/^item_/, '')) ?? null
}

/** 永久生效、不占背包格子的物品（购买后立即消失）。 */
const PERMANENT_ITEMS = new Set(['item_aghanims_shard'])

function itemOf(key: string, names: NamesIndex | null) {
  return names?.itemByKey.get(key) ?? names?.itemByKey.get(key.replace(/^item_/, ''))
}

/**
 * 还原「购买 → 合成 → 卖出」的购买记录：
 * - 合成装买入时，把对应配件标记为已消耗（保留在购买记录里，便于回看早期背包）；
 * - 卷轴、消耗品、魔晶等不进入背包；
 * - 有回放卖出清单时按真实时间标记 soldAt，不再用 6 格上限猜；
 * - 只有基础数据（OpenDota）时才用 6 格上限做近似。
 */
function applyBuildState(
  purchases: Purchase[],
  names: NamesIndex | null,
  finalItems: string[],
  exactSells: SellEvent[] | null,
  exactRemovals: RemovalEvent[] | null,
  exactUses: UseEvent[] | null
): Purchase[] {
  const finalSet = new Set(finalItems)
  const meta = new Map<Purchase, { created: boolean; components: string[] }>()

  for (const purchase of purchases) {
    const item = itemOf(purchase.key, names)
    purchase.recipe = purchase.key.startsWith('item_recipe_')
    purchase.consumable = Boolean(item?.consumable)
    purchase.permanent = PERMANENT_ITEMS.has(purchase.key)
    const components = (item?.created ? item.components ?? [] : []).filter(
      (key) => key.startsWith('item_') && key.length > 5
    )
    meta.set(purchase, { created: Boolean(item?.created && components.length), components })
  }

  // 同一秒内先买散件、后合成品
  const ordered = purchases
    .slice()
    .sort((a, b) => a.sec - b.sec || Number(meta.get(a)?.created ?? false) - Number(meta.get(b)?.created ?? false))

  const active: Purchase[] = []
  const mergeComponents = (purchase: Purchase) => {
    const info = meta.get(purchase)
    if (!info?.created) return
    for (const component of info.components) {
      const index = active.findIndex((entry) => entry.key === component && entry.sec <= purchase.sec + 1)
      if (index < 0) continue
      const [instance] = active.splice(index, 1)
      instance.consumedAt = purchase.sec
      instance.mergedInto = purchase.key
    }
  }
  const applySell = (sell: SellEvent) => {
    const index = active.findIndex((entry) => entry.key === sell.key)
    if (index < 0) return
    const [sold] = active.splice(index, 1)
    sold.consumedAt = sell.sec
    sold.soldAt = sell.sec
  }

  /**
   * 可堆叠消耗品按「先买先消耗」的队列归属：
   * - 同一物品的多次购买进入同一队列；
   * - 每次使用扣最早仍未用完的那一批（吃树一批 3 点，其余 1 点）；
   * - 组合守卫已拆成 1 真眼 + 1 假眼，录像的组合使用事件按最早批次依次扣。
   */
  const applyQueuedUses = (uses: UseEvent[] | null) => {
    if (!uses?.length) return
    const remaining = new Map<Purchase, number>()
    const queues = new Map<string, Purchase[]>()
    for (const purchase of purchases) {
      if (!purchase.consumable || purchase.recipe || purchase.permanent) continue
      if (purchase.consumedAt != null || purchase.soldAt != null || purchase.mergedInto != null) continue
      const list = queues.get(purchase.key) ?? []
      list.push(purchase)
      queues.set(purchase.key, list)
    }
    for (const list of queues.values()) list.sort((a, b) => a.sec - b.sec)
    const charges = (purchase: Purchase): number => (purchase.key === 'item_tango' ? 3 : 1)
    const leftOf = (purchase: Purchase): number => remaining.get(purchase) ?? charges(purchase)
    const consume = (purchase: Purchase, sec: number) => {
      const left = leftOf(purchase) - 1
      remaining.set(purchase, left)
      if (left <= 0) {
        purchase.consumedAt = sec
        purchase.consumedReason = 'used'
      }
    }
    for (const use of uses.slice().sort((a, b) => a.sec - b.sec)) {
      if (!use.key.startsWith('item_')) continue
      let candidates: Purchase[] = []
      if (use.key === 'item_ward_dispenser') {
        const wardPool = [...(queues.get('item_ward_observer') ?? []), ...(queues.get('item_ward_sentry') ?? [])]
          .filter((purchase) => purchase.sec <= use.sec + 0.5 && leftOf(purchase) > 0)
          .sort((a, b) => a.sec - b.sec || (a.key === 'item_ward_observer' ? -1 : 1))
        candidates = wardPool.filter((purchase) => purchase.origin === 'dispenser')
        if (!candidates.length) candidates = wardPool
      } else {
        candidates = (queues.get(use.key) ?? []).filter(
          (purchase) => purchase.sec <= use.sec + 0.5 && leftOf(purchase) > 0
        )
      }
      const target = candidates[0]
      if (target) consume(target, use.sec)
    }
  }

  const markConsumed = () => {
    if (!exactRemovals?.length) return
    const pending = exactRemovals.slice().sort((a, b) => a.sec - b.sec)
    for (const purchase of purchases.slice().sort((a, b) => a.sec - b.sec)) {
      if (purchase.consumedAt != null || purchase.soldAt != null || purchase.mergedInto != null) continue
      const index = pending.findIndex(
        (removal) => removal.key === purchase.key && removal.sec >= purchase.sec - 0.5
      )
      if (index < 0) continue
      const removal = pending.splice(index, 1)[0]
      purchase.consumedAt = removal.sec
      const mergedTarget = removal.added.find(
        (key) => key.startsWith('item_') && key !== purchase.key
      )
      if (mergedTarget) purchase.mergedInto = mergedTarget
      purchase.consumedReason =
        purchase.key === 'item_ultimate_scepter' ||
        purchase.key === 'item_ultimate_scepter_2' ||
        purchase.key === 'item_aghanims_scepter'
          ? 'upgraded'
          : removal.added.includes('bear')
            ? 'transferred'
            : purchase.consumable
              ? 'used'
              : 'removed'
    }
  }

  if (exactSells) {
    // 回放：把买入/合成/卖出放进同一条时间线，卖出后不会再被后续合成误扣。
    const sells = exactSells.slice().sort((a, b) => a.sec - b.sec)
    let sellIndex = 0
    for (const purchase of ordered) {
      while (sellIndex < sells.length && sells[sellIndex].sec <= purchase.sec) {
        applySell(sells[sellIndex++])
      }
      mergeComponents(purchase)
      if (purchase.recipe || purchase.consumable || purchase.permanent) continue
      active.push(purchase)
    }
    while (sellIndex < sells.length) {
      applySell(sells[sellIndex++])
    }
    applyQueuedUses(exactUses)
    markConsumed()
    return purchases
  }

  for (const purchase of ordered) {
    mergeComponents(purchase)
    if (purchase.recipe || purchase.consumable || purchase.permanent) continue
    active.push(purchase)

    // 6 格上限：优先淘汰终局不在身上的旧件（大概率已被卖掉）
    while (active.length > 6) {
      let index = active.findIndex((entry) => entry !== purchase && !finalSet.has(entry.key))
      if (index < 0) index = active.findIndex((entry) => entry !== purchase)
      if (index < 0) break
      const [sold] = active.splice(index, 1)
      sold.consumedAt = purchase.sec
      sold.soldAt = purchase.sec
    }
  }
  return purchases
}

export type SlotKind = 'main' | 'neutral' | 'backpack'

export interface InventoryEntry {
  key: string
  count: number
  lastSec: number
  /** 0–5 main, 0 neutral, 0–2 backpack */
  slot?: number
  slotKind?: SlotKind
}

/**
 * 某个时间点真正在背包里的物品。
 * 高级分析（回放）直接用录像里的 6+1+3 格快照；基础模式退回购买记录近似。
 */
export function inventoryAt(player: TimelinePlayer, sec: number, unit: 'hero' | 'bear' = 'hero'): InventoryEntry[] {
  const exact = unit === 'bear' ? player.bearInventoryExact : player.inventoryExact
  const snapshots = unit === 'bear' ? player.bearInventorySnapshots : player.inventorySnapshots
  if (exact && snapshots.length) {
    let snapshot = snapshots[0]
    for (const candidate of snapshots) {
      if (candidate.sec <= sec) snapshot = candidate
      else break
    }
    const entries: InventoryEntry[] = []
    snapshot.main.forEach((key, slot) => {
      if (key) entries.push({ key, count: 1, lastSec: snapshot.sec, slot, slotKind: 'main' })
    })
    if (snapshot.neutral) {
      entries.push({ key: snapshot.neutral, count: 1, lastSec: snapshot.sec, slot: 0, slotKind: 'neutral' })
    }
    snapshot.backpack.forEach((key, slot) => {
      if (key) entries.push({ key, count: 1, lastSec: snapshot.sec, slot, slotKind: 'backpack' })
    })
    return entries
  }

  if (unit === 'bear') {
    return []
  }

  const buckets = new Map<string, InventoryEntry>()
  for (const purchase of player.purchases) {
    if (purchase.sec > sec) continue
    if (purchase.recipe || purchase.consumable || purchase.permanent) continue
    if (purchase.consumedAt != null && purchase.consumedAt <= sec) continue
    const entry = buckets.get(purchase.key) ?? { key: purchase.key, count: 0, lastSec: 0 }
    entry.count += 1
    entry.lastSec = Math.max(entry.lastSec, purchase.sec)
    buckets.set(purchase.key, entry)
  }
  return [...buckets.values()].sort((a, b) => b.lastSec - a.lastSec)
}

const WARD_OBSERVER_KEYS = new Set(['item_ward_observer', 'item_observer_ward'])
const WARD_SENTRY_KEYS = new Set(['item_ward_sentry', 'item_sentry_ward'])

/**
 * 组合守卫拆成「1 真眼 + 1 假眼」两条独立记录；如果回放本身已经在同一秒
 * 记录了两种散件，就只丢掉组合件，避免重复。
 */
function splitWardDispensers(purchases: Purchase[]): Purchase[] {
  const out: Purchase[] = []
  for (const purchase of purchases) {
    if (purchase.key !== 'item_ward_dispenser') {
      out.push(purchase)
      continue
    }
    const hasObserver = purchases.some(
      (entry) => WARD_OBSERVER_KEYS.has(entry.key) && Math.abs(entry.sec - purchase.sec) <= 1.5
    )
    const hasSentry = purchases.some(
      (entry) => WARD_SENTRY_KEYS.has(entry.key) && Math.abs(entry.sec - purchase.sec) <= 1.5
    )
    if (!hasObserver) {
      out.push({
        ...purchase,
        key: 'item_ward_observer',
        cost: null,
        origin: 'dispenser',
        mergedInto: undefined,
        consumedAt: undefined,
        consumedReason: undefined,
        soldAt: undefined
      })
    }
    if (!hasSentry) {
      out.push({
        ...purchase,
        key: 'item_ward_sentry',
        cost: null,
        origin: 'dispenser',
        mergedInto: undefined,
        consumedAt: undefined,
        consumedReason: undefined,
        soldAt: undefined
      })
    }
  }
  return out.sort((a, b) => a.sec - b.sec)
}

function buildPurchases(
  player: OpenDotaPlayer,
  replay: ReplayParse | null | undefined,
  heroKey: string | undefined,
  names: NamesIndex | null
): {
  purchases: Purchase[]
  source: 'replay' | 'opendota' | 'none'
  sells: SellEvent[]
  removals: RemovalEvent[]
  snapshots: InventorySnapshot[]
  uses: UseEvent[]
} {
  const focusUnit = replay?.focus?.unit
  const replayApplies = Boolean(
    replay && heroKey && focusUnit === heroKey &&
    (replay.focus.purchases.length > 0 || (replay.focus.items?.length ?? 0) > 0)
  )
  if (replayApplies && replay) {
    const isLoneDruid = heroKey === 'npc_dota_hero_lone_druid'
    const canon = (key: string): string => {
      const normalized = versionedItemKey(normalizeItemKey(key), replay.build)
      return itemOf(normalized, names)?.key ?? normalized
    }
    const purchases = replay.focus.purchases
      .map((event) => {
        const sec = parseClock(event.t)
        const key = canon(event.a)
        return { sec: sec == null ? 0 : Math.max(0, sec), key, cost: purchaseCost(key, names), source: 'replay' as const }
      })
      .sort((a, b) => a.sec - b.sec)
    // 回放战斗日志没有赛前购买；从 OpenDota 的负数时间补齐（同一件只补一次）。
    const earlyKeys = new Set(purchases.filter((purchase) => purchase.sec <= 2).map((purchase) => purchase.key))
    const pregame = (player.purchase_log ?? [])
      .filter((entry) => (entry.time ?? 0) < 0)
      .map((entry) => {
        const key = canon(entry.key)
        return { sec: 0, key, cost: purchaseCost(key, names), source: 'opendota' as const }
      })
      .filter((entry) => !earlyKeys.has(entry.key))
    const mergedPurchases = [...pregame, ...purchases].sort((a, b) => a.sec - b.sec)
    const wardPlacements = (replay.focus.wardPlacements ?? [])
      .map((event) => {
        const sec = parseClock(event.t)
        return { sec: sec == null ? 0 : Math.max(0, sec), key: canon(event.a) }
      })
      .filter((event) => event.key === 'item_ward_observer' || event.key === 'item_ward_sentry')
      .sort((a, b) => a.sec - b.sec)
    // 守卫单位可能因战争迷雾延迟出现，按“插眼顺序 ↔ 守卫创建顺序”对齐：
    // 明确写了真假眼的用眼事件负责校准指针，组合守卫用它后面最近的一个守卫类型。
    let wardPointer = 0
    const uses = (replay.focus.uses ?? [])
      .map((event) => {
        const sec = parseClock(event.t)
        const at = sec == null ? 0 : Math.max(0, sec)
        let key = canon(event.a)
        if (key === 'item_ward_observer' || key === 'item_ward_sentry') {
          let cursor = wardPointer
          while (cursor < wardPlacements.length && wardPlacements[cursor].key !== key) cursor += 1
          if (cursor < wardPlacements.length) wardPointer = cursor + 1
        } else if (key === 'item_ward_dispenser') {
          if (wardPointer < wardPlacements.length) {
            key = wardPlacements[wardPointer].key
            wardPointer += 1
          }
        }
        return { sec: at, key }
      })
      .filter((event) => event.key.startsWith('item_'))
      .sort((a, b) => a.sec - b.sec)
    const readSnapshot = (snapshot: {
      t: string
      main?: string[]
      neutral?: string
      backpack?: string[]
      s?: string[]
    }): InventorySnapshot => {
      const sec = parseClock(snapshot.t)
      const legacy = snapshot.s ?? []
      return {
        sec: sec == null ? 0 : Math.max(0, sec),
        main: (snapshot.main ?? legacy.slice(0, 6)).map((key) => (key ? canon(key) : '')),
        neutral: snapshot.neutral ? canon(snapshot.neutral) : '',
        backpack: (snapshot.backpack ?? legacy.slice(6, 9)).map((key) =>
          key ? canon(key) : ''
        )
      }
    }
    const snapshots = (replay.focus.items ?? [])
      .map(readSnapshot)
      .filter((snapshot) => snapshot.main.some(Boolean) || snapshot.neutral || snapshot.backpack.some(Boolean))
    const bearSnapshots = (replay.focus.bearItems ?? [])
      .map(readSnapshot)
      .filter((snapshot) => snapshot.main.some(Boolean) || snapshot.neutral || snapshot.backpack.some(Boolean))
    const inBear = (key: string, sec: number): boolean =>
      bearSnapshots.some(
        (snapshot) =>
          Math.abs(snapshot.sec - sec) <= 10 &&
          (snapshot.main.includes(key) || snapshot.neutral === key || snapshot.backpack.includes(key))
      )
    // 消耗品、永久生效道具、A 杖/魔晶、以及已经交到德鲁伊小熊身上的装备不是“卖出”。
    const NEVER_SELL = new Set([
      'item_ultimate_scepter',
      'item_ultimate_scepter_2',
      'item_aghanims_scepter',
      'item_aghanims_shard',
      'item_aegis',
      'item_cheese',
      'item_refresher_shard',
      'item_moon_shard',
      'item_branches',
      'item_blood_grenade',
      'item_tome_of_knowledge',
      'item_roshans_banner',
      'item_tango_secondary'
    ])
    const isNeverSell = (key: string, sec: number): boolean => {
      const item = names?.itemByKey.get(key) ?? names?.itemByKey.get(key.replace(/^item_/, ''))
      if (item?.consumable) return true
      if (NEVER_SELL.has(key)) return true
      return inBear(key, sec)
    }
    const removals = (replay.focus.removed ?? [])
      .map((event) => {
        const sec = parseClock(event.t)
        const key = canon(event.a)
        const added = (event.b ?? '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry) => (entry === 'bear' ? 'bear' : canon(entry)))
        if (inBear(key, sec == null ? 0 : Math.max(0, sec))) added.push('bear')
        // 德鲁伊的装备可能直接给小熊；回放里小熊实体不一定稳定，按英雄类型兜底标记。
        if (isLoneDruid) {
          const item = names?.itemByKey.get(key) ?? names?.itemByKey.get(key.replace(/^item_/, ''))
          if (
            item &&
            !item.consumable &&
            !key.startsWith('item_recipe_') &&
            !key.includes('scepter') &&
            !key.includes('aghanims')
          ) {
            added.push('bear')
          }
        }
        return { sec: sec == null ? 0 : Math.max(0, sec), key, added }
      })
      .filter((event) => event.key.startsWith('item_'))
      .sort((a, b) => a.sec - b.sec)
    const sells = (replay.focus.sells ?? [])
      .map((event) => {
        const sec = parseClock(event.t)
        const key = canon(event.a)
        return { sec: sec == null ? 0 : Math.max(0, sec), key }
      })
      .filter((event) => event.key.startsWith('item_') && !isNeverSell(event.key, event.sec) && !isLoneDruid)
      .sort((a, b) => a.sec - b.sec)
    return {
      purchases: splitWardDispensers(mergedPurchases),
      source: 'replay',
      sells,
      removals,
      snapshots,
      uses
    }
  }
  const log = player.purchase_log ?? []
  if (!log.length) return { purchases: [], source: 'none', sells: [], removals: [], snapshots: [], uses: [] }
  const purchases = log
    .map((entry) => {
      const normalized = normalizeItemKey(entry.key)
      const key = itemOf(normalized, names)?.key ?? normalized
      return {
        sec: Math.max(0, entry.time ?? 0),
        key,
        cost: purchaseCost(key, names),
        source: 'opendota' as const
      }
    })
    .sort((a, b) => a.sec - b.sec)
  return {
    purchases: splitWardDispensers(purchases),
    source: 'opendota',
    sells: [],
    removals: [],
    snapshots: [],
    uses: []
  }
}

function replayPlayerSlot(player: OpenDotaPlayer): number {
  return player.player_slot >= 128 ? player.player_slot - 128 + 5 : player.player_slot
}

function buildReplayPoints(
  player: OpenDotaPlayer,
  replay: ReplayParse | null | undefined
): TimelinePoint[] | null {
  const series = replay?.series
  if (!series?.players?.length) return null
  const row = series.players.find((entry) => entry.slot === replayPlayerSlot(player))
  if (!row) return null
  const step = series.step || 5
  const length = Math.max(
    row.netWorth?.length ?? 0,
    row.lastHits?.length ?? 0,
    row.xp?.length ?? 0,
    row.level?.length ?? 0,
    row.kills?.length ?? 0,
    row.deaths?.length ?? 0,
    row.assists?.length ?? 0,
    row.heroDamage?.length ?? 0
  )
  if (!length) return null
  const numberAt = (values: Array<number | null> | undefined, index: number): number | null =>
    typeof values?.[index] === 'number' ? values[index] : null
  const points: TimelinePoint[] = []
  for (let index = 0; index < length; index += 1) {
    const sec = index * step
    points.push({
      minute: sec / 60,
      sec,
      netWorth: numberAt(row.netWorth, index),
      lastHits: numberAt(row.lastHits, index),
      denies: numberAt(row.denies, index),
      xp: numberAt(row.xp, index),
      level: numberAt(row.level, index),
      kills: numberAt(row.kills, index) ?? 0,
      deaths: numberAt(row.deaths, index) ?? 0,
      assists: numberAt(row.assists, index),
      heroDamage: numberAt(row.heroDamage, index)
    })
  }
  return points
}

function normalizeSnapshots(
  source: ReplayInventorySnapshot[] | undefined,
  build: number | undefined,
  names: NamesIndex | null
): InventorySnapshot[] {
  const canon = (key: string): string => {
    const normalized = versionedItemKey(normalizeItemKey(key), build)
    return itemOf(normalized, names)?.key ?? normalized
  }
  return (source ?? [])
    .map((snapshot) => {
      const sec = parseClock(snapshot.t)
      const legacy = (snapshot as unknown as { s?: string[] }).s ?? []
      return {
        sec: sec == null ? 0 : Math.max(0, sec),
        main: (snapshot.main ?? legacy.slice(0, 6)).map((key) => (key ? canon(key) : '')),
        neutral: snapshot.neutral ? canon(snapshot.neutral) : '',
        backpack: (snapshot.backpack ?? legacy.slice(6, 9)).map((key) => (key ? canon(key) : ''))
      }
    })
    .filter((snapshot) => snapshot.main.some(Boolean) || snapshot.neutral || snapshot.backpack.some(Boolean))
}

function buildPlayer(
  player: OpenDotaPlayer,
  rosterPlayer: RosterPlayer | undefined,
  model: {
    focusSlot: number | null
    selectedSlots: Set<number>
    replay: ReplayParse | null
    replays?: Record<number, ReplayParse> | null
    names: NamesIndex | null
    durationSec: number
    abilityDraft: boolean
  }
): TimelinePlayer {
  const minutes = Math.max(1, Math.floor(model.durationSec / 60) + 1)
  const netWorth = padSeries(player.networth_t, minutes)
  const lastHits = padSeries(player.lh_t, minutes)
  const denies = padSeries(player.dn_t, minutes)
  const xp = padSeries(player.xp_t, minutes)
  const heroDamage = padSeries(player.hero_damage_t, minutes)

  const points: TimelinePoint[] = []
  for (let minute = 0; minute < minutes; minute += 1) {
    points.push({
      minute,
      sec: minute * 60,
      netWorth: netWorth[minute],
      lastHits: lastHits[minute],
      denies: denies[minute],
      xp: xp[minute],
      level: levelFromXp(xp[minute]),
      kills: countBefore(player.kills_log, minute * 60),
      deaths: countBefore(player.deaths_log, minute * 60),
      assists: null,
      heroDamage: heroDamage[minute]
    })
  }
  const playerReplay =
    model.replays?.[player.hero_id] ??
    (player.player_slot === model.focusSlot ? model.replay : null)
  const finePoints = buildReplayPoints(player, playerReplay)
  const chartStepSec = finePoints ? playerReplay?.series?.step ?? 5 : 60

  const finalFields = [
    'item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5',
    'backpack_0', 'backpack_1', 'backpack_2', 'item_neutral', 'item_neutral2'
  ]
  const finalItems = finalFields
    .map((field) => (player as unknown as Record<string, unknown>)[field])
    .map((value) => {
      if (typeof value === 'string' && value.length > 0) return normalizeItemKey(value)
      if (typeof value === 'number' && value > 0) return model.names?.itemById.get(value)?.key ?? ''
      return ''
    })
    .filter((key): key is string => Boolean(key) && !key.startsWith('item_enhancement'))

  const heroKey = model.names?.heroById.get(player.hero_id)?.key
  const built = buildPurchases(player, playerReplay, heroKey, model.names)
  const inventoryExact = built.source === 'replay' && built.snapshots.length > 0
  const bearSnapshots = normalizeSnapshots(playerReplay?.focus.bearItems, playerReplay?.build, model.names)
  const purchases = applyBuildState(
    built.purchases,
    model.names,
    finalItems,
    inventoryExact ? built.sells : null,
    inventoryExact ? built.removals : null,
    inventoryExact ? built.uses : null
  )
  const firstSnapshot = built.snapshots[0]
  const pregameCount = inventoryExact && firstSnapshot
    ? firstSnapshot.main.filter(Boolean).length
      + (firstSnapshot.neutral ? 1 : 0)
      + firstSnapshot.backpack.filter(Boolean).length
    : purchases.filter((purchase) => purchase.sec <= 0 && !purchase.recipe).length

  const upgrades: Upgrade[] = (player.ability_upgrades_arr ?? [])
    .map((id, index) => {
      const resolved = resolveUpgrade(id, player.hero_id, model.names)
      return { order: index + 1, ...resolved }
    })
    .filter((upgrade) => {
      if (upgrade.kind !== 'ability') return true
      // 技能征召里所有技能都是非原生技能，不做过滤
      if (model.abilityDraft) return true
      const hero = model.names?.heroById.get(player.hero_id)
      const native = hero?.abilities ?? []
      if (!native.length) return true
      if (hero?.key === 'npc_dota_hero_invoker') {
        // 祈求者只把 Q/W/E/R 四个可加点技能计入；10 个组合技能不占点
        return INVOKER_LEVELABLE.has(upgrade.key)
      }
      // 拉比克窃取、水人变形等“临时获得”的技能不属于原生技能，不计入加点
      return native.includes(upgrade.key)
    })

  const talentRows = (model.names?.talentByHero.get(player.hero_id) ?? []).map((talent) => ({
    key: talent.key,
    tier: talent.tier ?? 0,
    cn: talent.cn || talent.en || talent.key,
    picked: upgrades.some((up) => up.key === talent.key),
    unlockLevels: talent.unlock_levels ?? [],
    tree: (talent.tree ?? (talent.key.includes('spirit_bear') ? 'bear' : 'hero')) as 'hero' | 'bear'
  }))

  return {
    slot: player.player_slot,
    heroId: player.hero_id,
    playerName: rosterPlayer?.playerName ?? player.personaname ?? '未知玩家',
    isRadiant: player.isRadiant,
    position: rosterPlayer?.position ?? null,
    laneRole: rosterPlayer?.laneRole ?? null,
    isFocus: player.player_slot === model.focusSlot,
    isMatchup: model.selectedSlots.has(player.player_slot),
    points,
    finePoints: finePoints ?? undefined,
    chartStepSec,
    purchases,
    purchaseSource: built.source,
    inventoryExact,
    inventorySnapshots: built.snapshots,
    bearInventoryExact: bearSnapshots.length > 0,
    bearInventorySnapshots: bearSnapshots,
    pregameCount,
    upgrades,
    talents: talentRows,
    attributePicks: upgrades.filter((up) => up.kind === 'attribute').length,
    finalItems,
    finalKda: {
      kills: player.kills ?? 0,
      deaths: player.deaths ?? 0,
      assists: player.assists ?? 0
    }
  }
}

export interface BuildTimelineInput {
  match: OpenDotaMatch
  roster: RosterPlayer[]
  focusSlot: number | null
  allySlots: number[]
  enemySlots: number[]
  replay?: ReplayParse | null
  /** 按 heroId 缓存的所有英雄回放解析结果（切换分析对象时直接复用） */
  replays?: Record<number, ReplayParse> | null
  names?: NamesIndex | null
}

export function buildTimelineModel(input: BuildTimelineInput): TimelineModel {
  const selectedSlots = new Set<number>()
  if (input.focusSlot != null) selectedSlots.add(input.focusSlot)
  for (const slot of [...input.allySlots, ...input.enemySlots]) selectedSlots.add(slot)

  const rosterBySlot = new Map(input.roster.map((player) => [player.slot, player]))
  const durationSec = Math.max(0, input.match.duration ?? 0)
  const context = {
    focusSlot: input.focusSlot,
    selectedSlots,
    replay: input.replay ?? null,
    replays: input.replays ?? null,
    names: input.names ?? null,
    durationSec,
    abilityDraft: input.match.game_mode === 18
  }

  const players = input.match.players.map((player) =>
    buildPlayer(player, rosterBySlot.get(player.player_slot), context)
  )

  const focus = players.find((player) => player.slot === input.focusSlot) ?? null
  const selected: TimelinePlayer[] = []
  const selectedSeen = new Set<number>()
  const addSelected = (slot: number): void => {
    if (selectedSeen.has(slot)) return
    const player = players.find((row) => row.slot === slot)
    if (!player) return
    selectedSeen.add(slot)
    selected.push(player)
  }
  if (input.focusSlot != null) addSelected(input.focusSlot)
  for (const slot of input.allySlots) addSelected(slot)
  for (const slot of input.enemySlots) addSelected(slot)

  const hasItems = players.some((player) => player.purchases.length > 0 || player.inventorySnapshots.length > 0)
  const hasSkills = players.some((player) => player.upgrades.length > 0)
  const sources: string[] = []
  if (players.some((player) => player.purchaseSource === 'replay')) sources.push('回放')
  if (input.match.players.some((player) => (player.networth_t?.length ?? 0) > 1)) sources.push('OpenDota')

  return {
    matchId: input.match.match_id,
    durationSec,
    players,
    selected,
    focus,
    teamfights: buildTeamfights(input.match, input.replay, input.names ?? null),
    combatNodes: buildCombatNodes(input.match, input.replay, input.names ?? null),
    positions: input.replay?.positions ?? null,
    hasItems,
    hasSkills,
    sources
  }
}

export function pointAt(player: TimelinePlayer, sec: number): TimelinePoint {
  const minute = Math.min(Math.max(0, Math.floor(sec / 60)), player.points.length - 1)
  return player.points[Math.max(0, minute)]
}

export function valueAt(player: TimelinePlayer, sec: number, metric: MetricKey): number | null {
  return pointAt(player, sec)[metric]
}

export function interpolationAt(player: TimelinePlayer, sec: number, metric: MetricKey): number | null {
  const clamped = Math.min(Math.max(0, sec), player.points.length > 0 ? (player.points.length - 1) * 60 : 0)
  const minute = Math.floor(clamped / 60)
  const next = Math.min(minute + 1, player.points.length - 1)
  const a = player.points[minute]?.[metric]
  const b = player.points[next]?.[metric]
  if (a == null || b == null) return a ?? b ?? null
  const ratio = (clamped - minute * 60) / 60
  return a + (b - a) * ratio
}

/** 优先使用回放 5 秒采样；没有时退回 OpenDota 分钟点。 */
export function pointAtDetailed(player: TimelinePlayer, sec: number): TimelinePoint {
  const points = player.finePoints
  if (points?.length) {
    const step = player.chartStepSec || 5
    const index = Math.min(Math.max(0, Math.floor(sec / step)), points.length - 1)
    return points[index]
  }
  return pointAt(player, sec)
}

/** 优先使用回放 5 秒采样做线性插值。 */
export function interpolationAtDetailed(player: TimelinePlayer, sec: number, metric: MetricKey): number | null {
  const points = player.finePoints
  if (points?.length) {
    const step = player.chartStepSec || 5
    const clamped = Math.min(Math.max(0, sec), (points.length - 1) * step)
    const index = Math.floor(clamped / step)
    const next = Math.min(index + 1, points.length - 1)
    const a = points[index]?.[metric]
    const b = points[next]?.[metric]
    if (a == null || b == null) return a ?? b ?? null
    const ratio = (clamped - index * step) / step
    return a + (b - a) * ratio
  }
  return interpolationAt(player, sec, metric)
}

export function purchasesBefore(player: TimelinePlayer, sec: number): Purchase[] {
  return player.purchases.filter((purchase) => purchase.sec <= sec)
}

export function coreItem(player: TimelinePlayer, threshold = 2000): Purchase | null {
  return (
    player.purchases.find(
      (purchase) => purchase.sec >= 180 && (purchase.cost ?? 0) >= threshold
    ) ?? null
  )
}

function snapshotAt(pair: { ally: TimelinePlayer; enemy: TimelinePlayer }, minute: number): PairSnapshot {
  const ally = pointAtDetailed(pair.ally, minute * 60)
  const enemy = pointAtDetailed(pair.enemy, minute * 60)
  const diff = (a: number | null, b: number | null): number | null =>
    a == null || b == null ? null : a - b
  return {
    netWorth: ally.netWorth,
    lastHits: ally.lastHits,
    xp: ally.xp,
    level: ally.level,
    kills: ally.kills,
    deaths: ally.deaths,
    diff: {
      netWorth: diff(ally.netWorth, enemy.netWorth),
      lastHits: diff(ally.lastHits, enemy.lastHits),
      xp: diff(ally.xp, enemy.xp),
      level: diff(ally.level, enemy.level)
    }
  }
}

/** 双方同位置对比；没有位置数据时返回空数组。 */
export function buildPositionPairs(players: TimelinePlayer[], focusIsRadiant: boolean): PositionPair[] {
  const hasPosition = players.filter((player) => player.position != null).length >= 6
  if (!hasPosition) return []
  const allyTeam = players.filter((player) => player.isRadiant === focusIsRadiant)
  const enemyTeam = players.filter((player) => player.isRadiant !== focusIsRadiant)
  const pairs: PositionPair[] = []
  for (let position = 1; position <= 5; position += 1) {
    const ally = allyTeam.find((player) => player.position === position)
    const enemy = enemyTeam.find((player) => player.position === position)
    if (!ally || !enemy) continue
    const coreAlly = coreItem(ally)
    const coreEnemy = coreItem(enemy)
    pairs.push({
      position,
      ally,
      enemy,
      at10: snapshotAt({ ally, enemy }, 10),
      at20: snapshotAt({ ally, enemy }, 20),
      coreAlly,
      coreEnemy,
      coreDiffSec: coreAlly && coreEnemy ? coreAlly.sec - coreEnemy.sec : null
    })
  }
  return pairs
}

/** 加点顺序在某个等级下已经学到的前缀（按顺序 + 天赋解锁等级约束，属于估算）。 */
export function acquiredUpgrades(player: TimelinePlayer, level: number | null): Upgrade[] {
  if (level == null) return []
  const taken: Upgrade[] = []
  let spent = 0
  for (const upgrade of player.upgrades) {
    if (spent >= level) break
    if (upgrade.kind === 'talent') {
      const need = upgrade.tier ? [10, 15, 20, 25][upgrade.tier - 1] ?? 10 : 10
      if (level < need) break
    }
    taken.push(upgrade)
    spent += 1
  }
  return taken
}
