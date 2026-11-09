<script setup lang="ts">
import { computed } from 'vue'
import type { HeroInfo } from '../lib/heroes'
import type { NamesIndex } from '../lib/names'
import { itemName as formatItemName } from '../lib/labels'
import {
  formatClock,
  inventoryAt,
  type InventoryEntry,
  type Purchase,
  type TimelinePlayer
} from '../lib/timeline'
import type { TipContent } from '../lib/tooltip'

const props = defineProps<{
  players: TimelinePlayer[]
  cursorSec: number
  durationSec: number
  heroes: Map<number, HeroInfo> | null
  names: NamesIndex | null
  /** Only exact replay inventories are trustworthy enough to show the bag. */
  showInventory: boolean
}>()

const emit = defineEmits<{ (event: 'seek', sec: number): void }>()

const CDN = 'https://cdn.cloudflare.steamstatic.com'

function heroImage(player: TimelinePlayer): string {
  return props.heroes?.get(player.heroId)?.img ?? ''
}

function itemIcon(key: string): string {
  const item = props.names?.itemByKey.get(key) ?? props.names?.itemByKey.get(key.replace(/^item_/, ''))
  if (item?.icon) return `${CDN}${item.icon}`
  const iconKey = item?.key_od ?? item?.key?.replace(/^item_/, '') ?? key.replace(/^item_/, '')
  return `${CDN}/apps/dota2/images/dota_react/items/${iconKey}.png`
}

function itemName(key: string): string {
  const item = props.names?.itemByKey.get(key) ?? props.names?.itemByKey.get(key.replace(/^item_/, ''))
  if (item?.cn) return item.cn
  if (item?.en) return item.en
  return formatItemName(key, props.names) || '未知装备'
}

/** 当前物品库没有的 key 不进入时间轴；内部类名别名由 names 统一解析。 */
function isKnownItem(key: string): boolean {
  if (!props.names || props.names.itemByKey.size === 0) return true
  return Boolean(
    props.names.itemByKey.get(key) ?? props.names.itemByKey.get(key.replace(/^item_/, ''))
  )
}

function itemDisplayName(key: string): string {
  const name = itemName(key)
  if (key === 'item_ward_observer' || key === 'item_observer_ward') return `${name}（假眼）`
  if (key === 'item_ward_sentry' || key === 'item_sentry_ward') return `${name}（真眼）`
  return name
}

function pct(sec: number): string {
  if (!props.durationSec) return '0%'
  return `${Math.min(100, Math.max(0, (sec / props.durationSec) * 100)).toFixed(2)}%`
}

function purchaseTip(purchase: Purchase, count = 1): TipContent {
  const lines = [`${formatClock(purchase.sec)} 购买`]
  if (purchase.cost != null) lines.push(`${purchase.cost} 金`)
  if (purchase.recipe) lines.push('图纸')
  if (purchase.soldAt != null) {
    lines.push(`已卖出 ${formatClock(purchase.soldAt)}`)
  } else if (purchase.mergedInto != null) {
    lines.push('已合成')
  } else if (purchase.consumedAt != null) {
    const label =
      purchase.consumedReason === 'transferred'
        ? '已交给熊'
        : purchase.consumedReason === 'upgraded'
          ? '已升级为福佑'
          : purchase.consumedReason === 'used'
            ? '已使用'
            : '已消耗'
    lines.push(`${label} ${formatClock(purchase.consumedAt)}`)
  }
  if (count > 1) lines.push(`同批 ×${count}`)
  return {
    title: itemDisplayName(purchase.key),
    lines,
    icon: itemIcon(purchase.key),
    accent: purchase.soldAt != null ? 'sold' : 'item'
  }
}

function bagTip(entry: InventoryEntry): TipContent {
  const slot =
    entry.slotKind === 'neutral'
      ? '打野装备'
      : entry.slotKind === 'backpack'
        ? `背包 ${(entry.slot ?? 0) + 1}`
        : `装备栏 ${(entry.slot ?? 0) + 1}`
  return {
    title: itemDisplayName(entry.key),
    lines: [slot],
    icon: itemIcon(entry.key),
    accent: entry.slotKind === 'neutral' ? 'neutral' : 'item'
  }
}

function hideBroken(event: Event): void {
  const target = event.target as HTMLImageElement | null
  if (target) target.style.visibility = 'hidden'
}

const cursorPct = computed(() => pct(props.cursorSec))

const focus = computed(() => props.players.find((player) => player.isFocus) ?? props.players[0])

const OBSERVER_KEYS = new Set(['item_ward_observer', 'item_observer_ward'])
const SENTRY_KEYS = new Set(['item_ward_sentry', 'item_sentry_ward'])

/**
 * 轨道只放“还留在身上/最终成型”的购买：
 * 跳过卷轴、消耗品（TP/真假眼/药等）和已经被合成掉的配件，避免重复与误导。
 */
interface TrackNode {
  id: string
  sec: number
  left: number
  lane: number
  width: number
  purchase: Purchase
  count: number
  combo: boolean
  components: Purchase[]
}

/**
 * 出装路线包含所有购买：消耗品、守卫、榴弹、雾、粉、图纸、合成前散件。
 * 合成品会显示「小件 → 成品」，同一时间点的多个购买纵向堆叠。
 */
const trackNodes = computed<TrackNode[]>(() => {
  const player = focus.value
  if (!player) return []
  // 组合守卫拆成真眼/假眼两条独立记录；回放通常也会同时给出两条散件购买，
  // 若已经有对应散件就只隐藏组合件，避免重复。
  const raw = player.purchases
  const hidden = new Set<Purchase>()
  const wardExtra: Purchase[] = []
  for (const purchase of raw) {
    if (purchase.key !== 'item_ward_dispenser') continue
    hidden.add(purchase)
    const hasObserver = raw.some(
      (entry) => OBSERVER_KEYS.has(entry.key) && Math.abs(entry.sec - purchase.sec) <= 1.5
    )
    const hasSentry = raw.some(
      (entry) => SENTRY_KEYS.has(entry.key) && Math.abs(entry.sec - purchase.sec) <= 1.5
    )
    if (!hasObserver) {
      wardExtra.push({
        ...purchase,
        key: 'item_ward_observer',
        cost: null,
        mergedInto: undefined,
        consumedAt: undefined,
        soldAt: undefined
      })
    }
    if (!hasSentry) {
      wardExtra.push({
        ...purchase,
        key: 'item_ward_sentry',
        cost: null,
        mergedInto: undefined,
        consumedAt: undefined,
        soldAt: undefined
      })
    }
  }
  const purchases = [...raw.filter((entry) => !hidden.has(entry)), ...wardExtra].sort(
    (a, b) => a.sec - b.sec
  )
  const itemOf = (key: string) =>
    props.names?.itemByKey.get(key) ?? props.names?.itemByKey.get(key.replace(/^item_/, ''))

  const combos = new Map<Purchase, Purchase[]>()
  const absorbed = new Set<Purchase>()
  for (const purchase of purchases) {
    const item = itemOf(purchase.key)
    if (!item?.created) continue
    const actual = purchases.filter(
      (entry) =>
        entry !== purchase &&
        entry.mergedInto === purchase.key &&
        entry.consumedAt != null &&
        isKnownItem(entry.key)
    )
    const recipeKey = `item_recipe_${purchase.key.replace(/^item_/, '')}`
    const recipe = purchases.find(
      (entry) =>
        entry.key === recipeKey &&
        isKnownItem(entry.key) &&
        (entry.mergedInto === purchase.key || entry.sec <= purchase.sec + 1)
    )
    const components = [...actual]
    if (recipe && !components.includes(recipe)) components.push(recipe)
    if (!components.length) {
      const fallback = (item.components ?? [])
        .filter((key) => key !== purchase.key && isKnownItem(key))
        .map((key) => purchases.find((entry) => entry.key === key && entry.sec <= purchase.sec + 1))
        .filter((entry): entry is Purchase => Boolean(entry))
      components.push(...fallback)
    }
    // 动力鞋的第三件可能是力量腰带/精灵布带/法师长袍；回放的 mergedInto
    // 只会标出实际使用的那一件，这里补上最近购买的一件变体。
    if (purchase.key === 'item_power_treads') {
      const variants = ['item_belt_of_strength', 'item_boots_of_elves', 'item_robe']
      if (!components.some((entry) => variants.includes(entry.key))) {
        const candidate = [...purchases]
          .reverse()
          .find(
            (entry) =>
              variants.includes(entry.key) &&
              entry.sec <= purchase.sec &&
              purchase.sec - entry.sec <= 900
          )
        if (candidate) components.push(candidate)
      }
    }
    if (!components.length) continue
    combos.set(purchase, components)
    for (const component of components) {
      if (Math.abs(component.sec - purchase.sec) <= 1.5) absorbed.add(component)
    }
  }

  const nodes: TrackNode[] = []
  const grouped = new Map<string, TrackNode>()
  for (const purchase of purchases) {
    if (!isKnownItem(purchase.key)) continue
    if (combos.has(purchase)) {
      nodes.push({
        id: `combo-${purchase.sec}-${purchase.key}`,
        sec: purchase.sec,
        left: 0,
        lane: 0,
        width: 0,
        purchase,
        count: 1,
        combo: true,
        components: combos.get(purchase) ?? []
      })
      continue
    }
    if (absorbed.has(purchase)) continue
    // 同种物品 10 秒内合并显示数量（如连买 3 组真眼）
    const id = `${purchase.key}|${Math.floor(purchase.sec / 10)}`
    const existing = grouped.get(id)
    if (existing) {
      existing.count += 1
      existing.sec = Math.min(existing.sec, purchase.sec)
    } else {
      const node: TrackNode = {
        id,
        sec: purchase.sec,
        left: 0,
        lane: 0,
        width: 0,
        purchase,
        count: 1,
        combo: false,
        components: []
      }
      grouped.set(id, node)
      nodes.push(node)
    }
  }

  nodes.sort((a, b) => a.sec - b.sec || Number(a.combo) - Number(b.combo))
  const laneEnds: number[] = []
  const duration = Math.max(1, props.durationSec)
  for (const node of nodes) {
    const width = node.combo ? 2.6 + node.components.length * 1.35 + 2.6 : 2.8
    let left = Math.max(2, Math.min(98.5, (node.sec / duration) * 100))
    left = Math.min(left, 99 - width)
    let lane = laneEnds.findIndex((end) => left >= end + 0.2)
    if (lane < 0) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = left + width
    node.left = left
    node.lane = lane
    node.width = width
  }
  return nodes
})

const trackHeight = computed(() => {
  const maxLane = trackNodes.value.reduce((max, node) => Math.max(max, node.lane), -1)
  return Math.max(100, (maxLane + 1) * 24 + 8)
})

function pregameCount(player: TimelinePlayer): number {
  return player.pregameCount
}

const inventory = computed(() => {
  const player = focus.value
  if (!player || !props.showInventory) return []
  // 快照里的新物品可能还没收录进名称表，也要显示出来
  return inventoryAt(player, props.cursorSec).filter(
    (entry) => Boolean(entry.key) && !entry.key.startsWith('item_enhancement')
  )
})

function makeBag(entries: InventoryEntry[]) {
  const at = (kind: 'main' | 'backpack', slot: number): InventoryEntry | null =>
    entries.find((entry) => entry.slotKind === kind && entry.slot === slot) ?? null
  return {
    main: Array.from({ length: 6 }, (_, slot) => at('main', slot)),
    neutral: entries.find((entry) => entry.slotKind === 'neutral') ?? null,
    backpack: Array.from({ length: 3 }, (_, slot) => at('backpack', slot))
  }
}

const bag = computed(() => makeBag(inventory.value))

const isLoneDruid = computed(() => focus.value?.heroId === 80)

const bearInventory = computed(() => {
  const player = focus.value
  if (!player || !props.showInventory) return []
  return inventoryAt(player, props.cursorSec, 'bear').filter(
    (entry) => isKnownItem(entry.key) && !entry.key.startsWith('item_enhancement')
  )
})

const hasBear = computed(() => focus.value?.heroId === 80 && Boolean(focus.value?.bearInventorySnapshots.length))

const bearBag = computed(() => makeBag(bearInventory.value))

const bagSets = computed(() => {
  const sets: Array<{
    key: string
    label: string
    bag: ReturnType<typeof makeBag>
    entries: InventoryEntry[]
  }> = [{ key: 'hero', label: hasBear.value ? '本体' : '', bag: bag.value, entries: inventory.value }]
  if (hasBear.value) {
    sets.push({ key: 'bear', label: '小熊', bag: bearBag.value, entries: bearInventory.value })
  }
  return sets
})
</script>

<template>
  <div class="items" :class="{ single: players.length === 1 }">
    <div v-for="player in players" :key="player.slot" class="row" :class="{ focus: player.isFocus }">
      <div class="who">
        <img v-if="heroImage(player)" class="avatar" :src="heroImage(player)" alt="" loading="lazy" />
        <span class="name">{{ names?.heroById.get(player.heroId)?.cn ?? '未知英雄' }}</span>
        <span class="badge" :class="player.isRadiant ? 'radiant' : 'dire'">
          {{ player.isRadiant ? '天辉' : '夜魇' }}
        </span>
        <span v-if="player.purchaseSource === 'replay'" class="src">回放</span>
        <span v-if="pregameCount(player)" class="src" title="赛前购买的出门装">赛前 {{ pregameCount(player) }}</span>
      </div>
      <div class="track" :style="{ height: `${trackHeight}px` }">
        <template v-for="node in trackNodes" :key="node.id">
          <span
            v-if="node.combo"
            class="mark combo-node"
            :class="{ sold: node.purchase.soldAt != null }"
            :style="{ left: `${node.left}%`, top: `${node.lane * 24 + 2}px` }"
          >
            <span class="combo">
              <span
                v-for="(component, ci) in node.components"
                :key="`${node.id}-${ci}-${component.key}`"
                class="comp"
                :class="{ recipe: component.recipe }"
                v-tip="purchaseTip(component)"
                @click.stop="emit('seek', component.sec)"
              >
                <img :src="itemIcon(component.key)" alt="" loading="lazy" @error="hideBroken" />
              </span>
              <span class="arrow">›</span>
              <span
                class="result"
                v-tip="purchaseTip(node.purchase)"
                @click.stop="emit('seek', node.purchase.sec)"
              >
                <img :src="itemIcon(node.purchase.key)" alt="" loading="lazy" @error="hideBroken" />
              </span>
            </span>
          </span>
          <span
            v-else
            class="mark"
            :class="{
              sold: node.purchase.soldAt != null,
              consumed:
                node.purchase.soldAt == null &&
                node.purchase.mergedInto == null &&
                node.purchase.consumedAt != null,
              recipe: node.purchase.recipe,
              consumable: node.purchase.consumable
            }"
            :style="{ left: `${node.left}%`, top: `${node.lane * 24 + 5}px` }"
            v-tip="purchaseTip(node.purchase, node.count)"
            @click.stop="emit('seek', node.sec)"
          >
            <img :src="itemIcon(node.purchase.key)" alt="" loading="lazy" @error="hideBroken" />
            <em v-if="node.count > 1" class="count">{{ node.count }}</em>
          </span>
        </template>
        <span class="cursor" :style="{ left: cursorPct }" />
      </div>
    </div>

    <div v-if="showInventory" class="bags">
      <div v-for="set in bagSets" :key="set.key" class="bag">
        <span class="bag-title">此刻背包<span v-if="set.label"> · {{ set.label }}</span></span>
        <div class="bag-groups">
          <div class="bag-group">
            <span class="bag-label">装备栏</span>
            <div class="slots">
              <span
                v-for="(entry, index) in set.bag.main"
                :key="`main-${set.key}-${index}`"
                class="slot"
                :class="{ filled: entry }"
                v-tip="entry ? bagTip(entry) : null"
              >
                <img v-if="entry" :src="itemIcon(entry.key)" alt="" loading="lazy" @error="hideBroken" />
              </span>
            </div>
          </div>
          <div class="bag-group">
            <span class="bag-label">打野装备</span>
            <div class="slots">
              <span
                class="slot neutral"
                :class="{ filled: set.bag.neutral }"
                v-tip="set.bag.neutral ? bagTip(set.bag.neutral) : null"
              >
                <img v-if="set.bag.neutral" :src="itemIcon(set.bag.neutral.key)" alt="" loading="lazy" @error="hideBroken" />
              </span>
            </div>
          </div>
          <div class="bag-group">
            <span class="bag-label">背包</span>
            <div class="slots">
              <span
                v-for="(entry, index) in set.bag.backpack"
                :key="`backpack-${set.key}-${index}`"
                class="slot small"
                :class="{ filled: entry }"
                v-tip="entry ? bagTip(entry) : null"
              >
                <img v-if="entry" :src="itemIcon(entry.key)" alt="" loading="lazy" @error="hideBroken" />
              </span>
            </div>
          </div>
        </div>
        <span v-if="!set.entries.length" class="bag-empty">—</span>
      </div>
      <p v-if="isLoneDruid && !hasBear" class="bag-hint">小熊背包需要高级分析（回放）才能显示</p>
    </div>
  </div>
</template>

<style scoped>
.items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 6px;
  border-radius: 8px;
  background: var(--dock-soft);
}

.row.focus {
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 1px var(--accent-line);
}

.who {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.avatar {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  object-fit: cover;
}

.name {
  font-size: 11px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  font-size: 9px;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 14px;
}

.badge.radiant {
  color: var(--accent-text);
  background: rgba(74, 222, 128, 0.12);
}

.badge.dire {
  color: var(--danger-text);
  background: rgba(248, 113, 113, 0.12);
}

.src {
  font-size: 9px;
  color: var(--text-mute);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 0 3px;
  line-height: 13px;
}

.track {
  position: relative;
  min-height: 100px;
  border-radius: 8px;
  background: var(--dock-track);
  border: 1px solid var(--line);
  overflow: hidden;
}

.mark {
  position: absolute;
  width: 18px;
  height: 18px;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 2;
}

.mark img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.35);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
}

.mark.sold img {
  opacity: 0.4;
  filter: grayscale(0.7) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
}

.mark.consumed img {
  opacity: 0.62;
  filter: saturate(0.7) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
}

.mark.recipe img {
  opacity: 0.55;
  transform: scale(0.9);
}

.mark.consumable img {
  opacity: 0.9;
}

.mark .count {
  position: absolute;
  right: -4px;
  bottom: -4px;
  min-width: 12px;
  height: 12px;
  padding: 0 2px;
  border-radius: 6px;
  background: var(--dock-rail);
  border: 1px solid var(--line-strong);
  color: var(--text);
  font-style: normal;
  font-size: 8px;
  line-height: 10px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.combo-node {
  width: auto;
  height: 24px;
  transform: none;
}

.combo {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 24px;
  padding: 2px 3px;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
}

.comp {
  display: inline-flex;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  overflow: hidden;
  opacity: 0.82;
}

.comp img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
}

.comp.recipe {
  opacity: 0.5;
}

.arrow {
  font-size: 9px;
  line-height: 1;
  color: var(--text-mute);
}

.result {
  width: 24px;
  height: 24px;
  padding: 1px;
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.75);
  background: rgba(245, 158, 11, 0.1);
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.12);
}

.result img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  object-fit: cover;
  border: none;
}

.combo-node.sold .result img {
  opacity: 0.4;
  filter: grayscale(0.7);
}

.cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
  z-index: 3;
  pointer-events: none;
}

.bag {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 6px 2px;
  flex-wrap: wrap;
}

.bags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bag-hint {
  margin: 0;
  padding: 0 6px;
  font-size: 10px;
  color: var(--text-mute);
}

.bag-title {
  padding-top: 4px;
  font-size: 10px;
  color: var(--text-mute);
  white-space: nowrap;
}

.bag-groups {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.bag-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bag-label {
  font-size: 9px;
  line-height: 11px;
  color: var(--text-mute);
  white-space: nowrap;
}

.slots {
  display: flex;
  gap: 3px;
}

.slot {
  position: relative;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--line-strong);
  border-radius: 4px;
  background: var(--dock-soft);
  overflow: hidden;
}

.slot.filled {
  border-style: solid;
}

.slot img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  object-fit: cover;
}

.slot.neutral {
  width: 26px;
  height: 26px;
  border-color: rgba(245, 158, 11, 0.7);
  background: rgba(245, 158, 11, 0.12);
}

.slot.small {
  width: 18px;
  height: 18px;
}

.bag-empty {
  padding-top: 12px;
  font-size: 10px;
  color: var(--text-mute);
}

.recent {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px 0;
  min-height: 28px;
}

.recent-label {
  font-size: 10px;
  color: var(--text-mute);
  margin-right: 2px;
}

.recent-item {
  position: relative;
  display: inline-flex;
}

.recent-item.backpack {
  margin-left: 4px;
}

.recent-item img {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 1px solid var(--line);
  object-fit: cover;
}

.items.single .recent-item img {
  width: 22px;
  height: 22px;
}

.recent-item .count {
  position: absolute;
  right: -4px;
  bottom: -4px;
  font-style: normal;
  font-size: 9px;
  line-height: 12px;
  padding: 0 2px;
  border-radius: 4px;
  background: var(--dock-rail);
  border: 1px solid var(--line);
  color: var(--text);
}

.recent-empty,
.recent-more {
  font-size: 10px;
  color: var(--text-mute);
}
</style>
