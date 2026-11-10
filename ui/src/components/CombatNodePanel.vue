<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HeroAvatar from './HeroAvatar.vue'
import type { HeroInfo } from '../lib/heroes'
import {
  abilityFallbacks,
  itemFallbacks,
  localAbilityIcon,
  localItemIcon
} from '../lib/assets'
import type {
  CombatHero,
  CombatNode,
  CombatNodeType,
  DamageBreakdown,
  FocusRole
} from '../lib/combatNodes'

const props = defineProps<{
  nodes: CombatNode[]
  heroes?: Map<number, HeroInfo> | null
}>()

const selected = ref(0)

watch(
  () => props.nodes,
  () => {
    selected.value = Math.min(selected.value, Math.max(0, filteredNodes.value.length - 1))
    resetFocusCards()
  }
)

type NodeFilter = 'all' | 'kill' | 'assist' | 'death' | 'multi'

const FILTERS: Array<{ key: NodeFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'kill', label: '击杀' },
  { key: 'assist', label: '助攻' },
  { key: 'death', label: '阵亡' },
  { key: 'multi', label: '多杀' }
]

const filter = ref<NodeFilter>('all')

const filteredNodes = computed<CombatNode[]>(() =>
  props.nodes.filter((node) => matchesFilter(node, filter.value))
)

const filterCounts = computed<Record<NodeFilter, number>>(() => {
  const counts: Record<NodeFilter, number> = { all: props.nodes.length, kill: 0, assist: 0, death: 0, multi: 0 }
  for (const node of props.nodes) {
    for (const key of ['kill', 'assist', 'death', 'multi'] as NodeFilter[]) {
      if (matchesFilter(node, key)) counts[key] += 1
    }
  }
  return counts
})

const current = computed<CombatNode | null>(() => filteredNodes.value[selected.value] ?? null)

function setFilter(next: NodeFilter): void {
  filter.value = next
  selected.value = 0
  resetFocusCards()
}


const bearIcon = localAbilityIcon('lone_druid_spirit_bear')
const bearIconFallback = abilityFallbacks('lone_druid_spirit_bear', undefined, 'npc_dota_hero_lone_druid')

const showHero = ref(true)
const showBear = ref(true)

function resetFocusCards(): void {
  showHero.value = true
  showBear.value = true
}

watch(selected, resetFocusCards)

const bearCard = computed<CombatHero | null>(() => {
  const node = current.value
  if (!node) return null
  return (
    node.participants.find(
      (hero) => hero.isBear && hero.ownerSlot === node.focusSlot
    ) ?? null
  )
})

const shownFocusCards = computed(() => {
  const node = current.value
  if (!node?.focus) return []
  const cards: CombatHero[] = []
  if (showHero.value) cards.push(node.focus)
  if (showBear.value && bearCard.value) cards.push(bearCard.value)
  return cards
})

function toggleFocus(kind: 'hero' | 'bear'): void {
  const target = kind === 'hero' ? showHero : showBear
  const other = kind === 'hero' ? showBear : showHero
  if (target.value && !other.value) return
  target.value = !target.value
}

function isBearSlot(slot: number | null | undefined): boolean {
  if (slot == null) return false
  return Boolean(current.value?.participants.find((hero) => hero.slot === slot && hero.isBear))
}

function fullAbilities(hero: CombatHero): Array<{ key: string; label: string; count: number }> {
  return [...hero.abilities].sort((a, b) => b.count - a.count)
}

function fullItems(hero: CombatHero): Array<{ key: string; label: string; count: number }> {
  return [...hero.items].sort((a, b) => b.count - a.count)
}

function heroCount(node: CombatNode): number {
  return node.participants.filter((hero) => !hero.isBear).length
}

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function clockPrecise(sec: number): string {
  const total = Math.max(0, sec)
  const [whole, fraction = '000'] = total.toFixed(3).split('.')
  const minutes = Math.floor(Number(whole) / 60)
  const seconds = Number(whole) % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${fraction}`
}

function compact(value: number | null | undefined): string {
  if (value == null) return '—'
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(Math.round(value))
}

function pct(value: number | null | undefined): string {
  return value == null ? '—' : `${Math.round(value)}%`
}

function delta(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value >= 0 ? '+' : ''}${Math.round(value)}`
}

function typeLabel(type: CombatNodeType): string {
  return {
    solo: '单杀',
    skirmish: '小规模',
    teamfight: '团战',
    multi: '多杀',
    assist: '助攻'
  }[type]
}

function roleLabel(role: FocusRole): string {
  return {
    kill: '击杀',
    death: '阵亡',
    assist: '助攻',
    multi: '多杀',
    participant: '参与'
  }[role]
}

function rolesOf(node: CombatNode): FocusRole[] {
  const roles: FocusRole[] = []
  if ((node.focus?.kills ?? 0) > 0) roles.push('kill')
  if ((node.focus?.assists ?? 0) > 0) roles.push('assist')
  if ((node.focus?.deaths ?? 0) > 0) roles.push('death')
  if (!roles.length) roles.push(node.focusRole)
  return roles
}

function matchesFilter(node: CombatNode, key: NodeFilter): boolean {
  if (key === 'all') return true
  if (key === 'multi') return node.type === 'multi' || (node.focus?.kills ?? 0) >= 2
  return rolesOf(node).includes(key)
}

function resultLabel(result: CombatNode['result']): string {
  return result === 'radiant' ? '天辉胜' : result === 'dire' ? '夜魇胜' : '均势'
}

function sideLabel(side: CombatHero['side']): string {
  return side === 'radiant' ? '天辉' : '夜魇'
}

function damageLabel(damage: DamageBreakdown): string {
  return `${compact(damage.total)}（${compact(damage.physical)} / ${compact(damage.magical)} / ${compact(damage.pure)}）`
}

function damageTypeLabel(type: string): string {
  return type === 'physical'
    ? '物理'
    : type === 'magical'
      ? '魔法'
      : type === 'pure'
        ? '纯粹'
        : '其他'
}


function heroInfo(hero: CombatHero): HeroInfo | undefined {
  return props.heroes?.get(hero.heroId)
}

function heroInfoBySlot(slot: number | null | undefined): HeroInfo | undefined {
  if (slot == null) return undefined
  const hero = current.value?.participants.find((entry) => entry.slot === slot)
  return hero ? heroInfo(hero) : undefined
}

function abilityIcon(key: string): string {
  return localAbilityIcon(key)
}

function abilityIconFallback(key: string): string {
  return abilityFallbacks(key)
}

function itemIcon(key: string): string {
  return localItemIcon(key)
}

function itemIconFallback(key: string): string {
  return itemFallbacks(key)
}

function hideIcon(event: Event): void {
  const target = event.target as HTMLImageElement | null
  if (target) target.style.visibility = 'hidden'
}

function sortedParticipants(node: CombatNode): CombatHero[] {
  const bear = node.participants.find((hero) => hero.isBear)
  const ownerSlot = bear?.ownerSlot ?? null
  const rank = (hero: CombatHero): number => {
    if (hero.slot === node.focusSlot) return 0
    if (hero.isBear) return ownerSlot === node.focusSlot ? 1 : 2
    if (hero.slot === ownerSlot) return 1
    return 3
  }
  return [...node.participants].sort((a, b) => rank(a) - rank(b) || b.damage.total - a.damage.total)
}

function hpText(hero: CombatHero): string {
  return `${pct(hero.hp.start)} → ${pct(hero.hp.end)}`
}

function mpText(hero: CombatHero): string {
  return `${pct(hero.mp.start)} → ${pct(hero.mp.end)}`
}
</script>

<template>
  <div class="cn">
    <aside class="cn-list">
      <div class="cn-list-top">
        <div class="cn-list-head">战斗节点</div>
        <div class="cn-filters">
        <button
          v-for="item in FILTERS"
          :key="item.key"
          type="button"
          class="cn-filter"
          :class="{ on: filter === item.key }"
          @click="setFilter(item.key)"
        >
          {{ item.label }}
          <em>{{ filterCounts[item.key] }}</em>
        </button>
        </div>
      </div>
      <p v-if="!filteredNodes.length" class="cn-muted">没有符合筛选的节点。</p>
      <button
        v-for="(node, index) in filteredNodes"
        :key="node.index"
        type="button"
        class="cn-item"
        :class="{ on: index === selected }"
        @click="selected = index"
      >
        <span class="cn-time">{{ clock(node.start) }}</span>
        <span class="cn-type">{{ typeLabel(node.type) }}</span>
        <span class="cn-roles">
          <span class="cn-role kill" :class="{ on: (node.focus?.kills ?? 0) > 0 }">
            <b>{{ node.focus?.kills ?? 0 }}</b>击杀
          </span>
          <span class="cn-role assist" :class="{ on: (node.focus?.assists ?? 0) > 0 }">
            <b>{{ node.focus?.assists ?? 0 }}</b>助攻
          </span>
          <span class="cn-role death" :class="{ on: (node.focus?.deaths ?? 0) > 0 }">
            <b>{{ node.focus?.deaths ?? 0 }}</b>阵亡
          </span>
        </span>
        <span class="cn-meta">{{ heroCount(node) }} 人 · {{ Math.round(node.duration) }}s</span>
        <span class="cn-result" :class="node.result">{{ resultLabel(node.result) }}</span>
      </button>
    </aside>

    <section v-if="current" class="cn-detail">
      <header class="cn-head">
        <div>
          <div class="cn-title">
            {{ clock(current.start) }} — {{ clock(current.end) }}
            <span class="cn-duration">{{ Math.round(current.duration) }} 秒</span>
          </div>
          <div class="cn-sub">
            {{ typeLabel(current.type) }} · 分析对象{{ roleLabel(current.focusRole) }} ·
            {{ heroCount(current) }} 人参战 · {{ current.deaths.length }} 次阵亡
          </div>
        </div>
        <span class="cn-result-badge" :class="current.result">{{ resultLabel(current.result) }}</span>
      </header>

      <div v-if="current.focus" class="cn-focus-wrap">
        <div v-if="bearCard" class="cn-focus-selector">
          <button type="button" :class="{ on: showHero }" @click="toggleFocus('hero')">德鲁伊</button>
          <button type="button" :class="{ on: showBear }" @click="toggleFocus('bear')">熊灵</button>
          <span class="cn-focus-hint">可单独查看，也可同时显示</span>
        </div>

        <div class="cn-focus-cards">
          <div v-for="card in shownFocusCards" :key="card.slot" class="cn-focus-card">
            <div class="cn-focus-head">
              <div class="cn-focus-id">
                <img
                  v-if="card.isBear"
                  class="cn-bear-avatar"
                  :src="bearIcon" :data-fallback="bearIconFallback"
                  alt=""
                  loading="lazy"
                  @error="hideIcon"
                />
                <HeroAvatar v-else :hero="heroInfo(card)" :size="38" />
                <div>
                  <span class="cn-focus-kicker">{{ card.isBear ? '熊灵伙伴' : '分析对象' }}</span>
                  <strong>{{ card.heroName }}</strong>
                  <small>{{ card.playerName }} · {{ sideLabel(card.side) }}</small>
                </div>
              </div>
              <div class="cn-focus-kda">
                <span><b>{{ card.kills }}</b>击杀</span>
                <span><b>{{ card.assists }}</b>助攻</span>
                <span><b>{{ card.deaths }}</b>阵亡</span>
              </div>
            </div>

            <div class="cn-focus-grid">
              <div><span>造成伤害</span><b>{{ damageLabel(card.damage) }}</b></div>
              <div><span>承受伤害</span><b>{{ damageLabel(card.taken) }}</b></div>
              <div><span>普攻</span><b>{{ card.basicHits }} 次 / {{ compact(card.basicDamage) }}</b></div>
              <div><span>治疗</span><b>{{ compact(card.healing) }}</b></div>
              <div><span>HP</span><b>{{ hpText(card) }}，最低 {{ pct(card.hp.min) }}</b></div>
              <div><span>MP</span><b>{{ mpText(card) }}，最低 {{ pct(card.mp.min) }}</b></div>
              <div><span>金钱</span><b>{{ delta(card.gold.delta) }}</b></div>
              <div><span>经验</span><b>{{ delta(card.xp.delta) }}</b></div>
            </div>

            <div class="cn-chips">
              <span v-for="ability in card.abilities" :key="ability.key" class="cn-chip">
                <img :src="abilityIcon(ability.key)" :data-fallback="abilityIconFallback(ability.key)" alt="" loading="lazy" @error="hideIcon" />
                <span>{{ ability.label }}</span>
                <em>×{{ ability.count }}</em>
              </span>
              <span v-for="item in card.items" :key="item.key" class="cn-chip item">
                <img :src="itemIcon(item.key)" :data-fallback="itemIconFallback(item.key)" alt="" loading="lazy" @error="hideIcon" />
                <span>{{ item.label }}</span>
                <em>×{{ item.count }}</em>
              </span>
              <span v-if="!card.abilities.length && !card.items.length" class="cn-muted">无技能/物品记录</span>
            </div>
          </div>
        </div>
        <p v-if="!shownFocusCards.length" class="cn-muted">至少选择一个分析对象。</p>
      </div>

      <div class="cn-block">
        <div class="cn-block-head">
          <span>谁伤害了分析对象</span>
          <small>按施法者 + 来源 + 伤害类型聚合</small>
        </div>
        <div v-if="current.incoming.length" class="cn-table-wrap">
          <table class="cn-table">
            <thead>
              <tr>
                <th>施法者</th>
                <th>来源</th>
                <th>类型</th>
                <th>命中</th>
                <th>伤害</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in current.incoming" :key="`${row.actorSlot}-${row.source}-${row.damageType}`">
                <td>
                  <div class="cn-actor">
                    <img
                      v-if="isBearSlot(row.actorSlot)"
                      class="cn-bear-avatar small"
                      :src="bearIcon" :data-fallback="bearIconFallback"
                      alt=""
                      loading="lazy"
                      @error="hideIcon"
                    />
                    <HeroAvatar v-else :hero="heroInfoBySlot(row.actorSlot)" :size="20" />
                    <div>{{ row.actorHero }}<small>{{ row.actorName }}</small></div>
                  </div>
                </td>
                <td>{{ row.source }}</td>
                <td>{{ damageTypeLabel(row.damageType) }}</td>
                <td>{{ row.hits }}</td>
                <td>{{ compact(row.damage) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="cn-muted">没有记录到对分析对象的英雄伤害。</p>
      </div>

      <div class="cn-block">
        <div class="cn-block-head">
          <span>参战英雄</span>
          <small>伤害括号内为 物理 / 魔法 / 纯粹</small>
        </div>
        <div class="cn-table-wrap">
          <table class="cn-table cn-heroes">
            <thead>
              <tr>
                <th>英雄</th>
                <th>K/A/D</th>
                <th>造成伤害</th>
                <th>承受伤害</th>
                <th>治疗</th>
                <th>HP</th>
                <th>MP</th>
                <th>金钱</th>
                <th>经验</th>
                <th>技能 / 物品</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="hero in sortedParticipants(current)"
                :key="hero.slot"
                :class="{ focus: hero.slot === current.focusSlot, bear: hero.isBear }"
              >
                <td>
                  <div class="cn-hero-cell">
                    <img
                      v-if="hero.isBear"
                      class="cn-bear-avatar small"
                      :src="bearIcon" :data-fallback="bearIconFallback"
                      alt=""
                      loading="lazy"
                      @error="hideIcon"
                    />
                    <HeroAvatar v-else :hero="heroInfo(hero)" :size="26" />
                    <div>
                      <span class="cn-hero">
                        {{ hero.heroName }}
                        <em v-if="hero.includesBear && !hero.isBear" class="cn-bear-tag">含熊灵</em>
                      </span>
                      <small>{{ hero.playerName }} · {{ sideLabel(hero.side) }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ hero.kills }} / {{ hero.assists }} / {{ hero.deaths }}</td>
                <td>{{ damageLabel(hero.damage) }}</td>
                <td>{{ damageLabel(hero.taken) }}</td>
                <td>{{ compact(hero.healing) }}</td>
                <td>{{ hpText(hero) }}<small>最低 {{ pct(hero.hp.min) }}</small></td>
                <td>{{ mpText(hero) }}<small>最低 {{ pct(hero.mp.min) }}</small></td>
                <td>{{ delta(hero.gold.delta) }}</td>
                <td>{{ delta(hero.xp.delta) }}</td>
                <td class="cn-hero-actions">
                  <span v-for="ability in fullAbilities(hero)" :key="ability.key" class="cn-chip">
                    <img :src="abilityIcon(ability.key)" :data-fallback="abilityIconFallback(ability.key)" alt="" loading="lazy" @error="hideIcon" />
                    <span>{{ ability.label }}</span>
                    <em>×{{ ability.count }}</em>
                  </span>
                  <span v-for="item in fullItems(hero)" :key="item.key" class="cn-chip item">
                    <img :src="itemIcon(item.key)" :data-fallback="itemIconFallback(item.key)" alt="" loading="lazy" @error="hideIcon" />
                    <span>{{ item.label }}</span>
                    <em>×{{ item.count }}</em>
                  </span>
                  <span v-if="!hero.abilities.length && !hero.items.length" class="cn-muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="cn-block">
        <div class="cn-block-head">
          <span>战斗时间线</span>
          <small>事件时间精确到 0.1 秒</small>
        </div>
        <div class="cn-timeline">
          <div v-for="(event, index) in current.timeline" :key="index" class="cn-event" :class="event.kind.toLowerCase()">
            <span class="cn-event-time">{{ clockPrecise(event.t) }}</span>
            <span class="cn-event-dot" />
            <span class="cn-event-label">{{ event.label }}</span>
            <span v-if="event.value" class="cn-event-value">
              {{ compact(event.value) }}
              <em v-if="event.damageType">{{ damageTypeLabel(event.damageType) }}</em>
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cn {
  display: flex;
  gap: 14px;
  min-height: 0;
  padding-top: 12px;
}

.cn-list {
  flex: 0 0 205px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.cn-list-top {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 0 2px 6px;
  background: var(--card-solid);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(8px);
}

.cn-list-head {
  padding: 0 4px 2px;
  color: var(--text-mute);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.cn-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 2px 4px;
}

.cn-filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--dock-soft);
  color: var(--text-mute);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.cn-filter em {
  color: var(--text-mute);
  font-style: normal;
  font-size: 9px;
}

.cn-filter.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.cn-filter.on em {
  color: var(--accent-text);
}

.cn-kda {
  grid-area: kda;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-mute);
  font-size: 9.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cn-kda b {
  margin-right: 1px;
  font-size: 11px;
  font-weight: 650;
}

.cn-kda .k b {
  color: var(--accent-text);
}

.cn-kda .a b {
  color: var(--text-dim);
}

.cn-kda .d b {
  color: var(--dock-warn);
}

.cn-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'time type result'
    'roles roles result'
    'meta meta result';
  gap: 4px 7px;
  padding: 8px 9px;
  min-height: 76px;
  align-content: center;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--dock-soft);
  color: var(--text);
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
}

.cn-item:hover {
  border-color: var(--line-strong);
  background: var(--dock-soft-strong);
}

.cn-item.on {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  box-shadow: inset 2px 0 0 var(--accent);
}

.cn-time {
  grid-area: time;
  font-size: 14.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.cn-type {
  grid-area: type;
  align-self: center;
  color: var(--text-dim);
  font-size: 11px;
}

.cn-roles {
  grid-area: roles;
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.cn-roles .cn-role {
  grid-area: auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 9.5px;
  white-space: nowrap;
}

.cn-roles .cn-role b {
  font-size: 10.5px;
  font-weight: 700;
}

.cn-roles .cn-role:not(.on) {
  opacity: 0.55;
  color: var(--text-mute);
  background: var(--dock-soft);
  border-color: transparent;
}

.cn-roles .cn-role.kill.on {
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.cn-roles .cn-role.assist.on {
  color: var(--text-dim);
  background: var(--dock-soft-strong);
  border: 1px solid var(--line);
}

.cn-roles .cn-role.death.on {
  color: var(--dock-warn);
  background: var(--dock-warn-line);
  border: 1px solid var(--dock-warn-line);
}

.cn-role {
  grid-area: auto;
}

.cn-role {
  grid-area: auto;
  width: fit-content;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--dock-soft-strong);
  color: var(--text-mute);
  font-size: 10px;
}

.cn-role.kill,
.cn-role.multi {
  color: var(--accent-text);
  background: var(--accent-soft);
}

.cn-role.death {
  color: var(--dock-warn);
  background: var(--dock-warn-line);
}

.cn-meta {
  grid-area: meta;
  color: var(--text-mute);
  font-size: 10.5px;
}

.cn-result {
  grid-area: result;
  align-self: center;
  color: var(--text-mute);
  font-size: 10px;
  white-space: nowrap;
}

.cn-result.radiant,
.cn-result-badge.radiant {
  color: var(--accent-text);
}

.cn-result.dire,
.cn-result-badge.dire {
  color: var(--dock-warn);
}

.cn-detail {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 3px 18px 0;
}

.cn-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cn-title {
  font-size: 18px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.cn-duration {
  margin-left: 6px;
  color: var(--text-mute);
  font-size: 11px;
  font-weight: 400;
}

.cn-sub {
  margin-top: 2px;
  color: var(--text-mute);
  font-size: 11.5px;
}

.cn-result-badge {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--text-dim);
  font-size: 11px;
}

.cn-focus-wrap {
  margin-top: 10px;
}

.cn-focus-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.cn-focus-selector button {
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--dock-soft);
  color: var(--text-mute);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.cn-focus-selector button.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.cn-focus-hint {
  color: var(--text-mute);
  font-size: 10px;
}

.cn-focus-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 10px;
}

.cn-bear-avatar {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--dock-soft-strong);
}

.cn-bear-avatar.small {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

.cn-heroes tr.bear td {
  background: rgba(251, 191, 36, 0.06);
}

.cn-heroes tr.bear .cn-hero {
  color: var(--dock-warn);
}

.cn-focus-card {
  margin-top: 10px;
  padding: 11px 12px;
  border: 1px solid var(--accent-line);
  border-radius: 10px;
  background: var(--accent-soft);
}

.cn-focus-id {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cn-actor {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cn-hero-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}

.cn-focus-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cn-focus-kicker {
  display: block;
  margin-bottom: 2px;
  color: var(--accent-text);
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.cn-focus-head strong {
  margin-right: 7px;
  font-size: 16px;
}

.cn-focus-head small {
  display: block;
  margin-top: 2px;
  color: var(--text-mute);
  font-size: 11px;
}

.cn-focus-kda {
  display: flex;
  gap: 9px;
  color: var(--text-mute);
  font-size: 10.5px;
  white-space: nowrap;
}

.cn-focus-kda b {
  margin-right: 2px;
  color: var(--text);
  font-size: 16px;
}

.cn-focus-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px 12px;
  margin-top: 10px;
  padding-top: 9px;
  border-top: 1px solid var(--accent-line);
}

.cn-focus-grid div {
  min-width: 0;
}

.cn-focus-grid span {
  display: block;
  color: var(--text-mute);
  font-size: 10px;
}

.cn-focus-grid b {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: var(--text-dim);
  font-size: 11.5px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cn-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 9px;
}

.cn-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--dock-soft-strong);
  color: var(--text-dim);
  font-size: 10.5px;
  white-space: nowrap;
}

.cn-chip img {
  width: 16px;
  height: 16px;
  flex: none;
  border-radius: 3px;
  object-fit: cover;
  background: var(--dock-soft);
}

.cn-chip em {
  color: var(--text-mute);
  font-style: normal;
}

.cn-chip.item {
  color: var(--dock-warn);
  background: rgba(251, 191, 36, 0.1);
}

.cn-block {
  margin-top: 12px;
  border-top: 1px solid var(--line);
  padding-top: 9px;
}

.cn-block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: var(--text-dim);
  font-size: 12px;
}

.cn-block-head small {
  color: var(--text-mute);
  font-size: 10px;
}

.cn-table-wrap {
  max-width: 100%;
  overflow-x: auto;
}

.cn-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  white-space: nowrap;
}

.cn-table th {
  padding: 4px 6px;
  border-bottom: 1px solid var(--line);
  color: var(--text-mute);
  font-weight: 500;
  text-align: left;
}

.cn-table td {
  padding: 5px 6px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

.cn-table td small {
  display: block;
  margin-top: 1px;
  color: var(--text-mute);
  font-size: 10px;
}

.cn-table tr.focus td {
  background: var(--accent-soft);
}

.cn-bear-tag {
  display: inline-block;
  margin-left: 5px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--dock-warn-line);
  color: var(--dock-warn);
  font-size: 9.5px;
  font-style: normal;
  font-weight: 500;
  vertical-align: 1px;
}

.cn-hero {
  display: block;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
}

.cn-heroes td {
  max-width: 220px;
}

.cn-hero-actions {
  white-space: normal;
}

.cn-hero-actions .cn-chip {
  display: inline-flex;
  margin: 0 3px 3px 0;
}

.cn-timeline {
  max-height: 220px;
  overflow-y: auto;
  border-left: 1px solid var(--line);
  margin-left: 4px;
  padding-left: 10px;
}

.cn-event {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 3px 0;
  color: var(--text-dim);
  font-size: 11px;
}

.cn-event-time {
  flex: none;
  width: 38px;
  color: var(--text-mute);
  font-family: var(--mono);
  font-size: 10px;
}

.cn-event-dot {
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--line-strong);
}

.cn-event.ability .cn-event-dot {
  background: var(--accent);
}

.cn-event.death .cn-event-dot {
  background: var(--dock-warn);
}

.cn-event-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cn-event-value {
  flex: none;
  margin-left: auto;
  color: var(--text-mute);
  font-family: var(--mono);
  font-size: 10px;
}

.cn-event-value em {
  margin-left: 4px;
  color: var(--text-mute);
  font-style: normal;
}

.cn-muted {
  color: var(--text-mute);
  font-size: 11px;
}

.cn-empty {
  padding: 28px;
  color: var(--text-mute);
  font-size: 13px;
}

@media (max-width: 900px) {
  .cn {
    flex-direction: column;
  }

  .cn-list {
    flex: none;
    max-height: 150px;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .cn-list-head {
    display: none;
  }

  .cn-item {
    flex: 0 0 175px;
  }

  .cn-detail {
    overflow: visible;
  }
}

@media (max-width: 680px) {
  .cn-focus-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cn-focus-head {
    flex-direction: column;
  }
}
</style>
