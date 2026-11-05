<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import TimelineChart from './TimelineChart.vue'
import TimelineItems from './TimelineItems.vue'
import TeamfightPanel from './TeamfightPanel.vue'
import TimelineBuild from './TimelineBuild.vue'
import TooltipLayer from './TooltipLayer.vue'
import HeroSelect from './HeroSelect.vue'
import type { HeroInfo } from '../lib/heroes'
import type { NamesIndex } from '../lib/names'
import type { MatchupPreset } from '../lib/matchup'
import { config } from '../lib/config'
import { positionLabel } from '../lib/roster'
import {
  buildPositionPairs,
  formatClock,
  interpolationAtDetailed,
  pointAtDetailed,
  type ChartSeries,
  type MetricKey,
  type PositionPair,
  type TimelineModel,
  type TimelinePlayer
} from '../lib/timeline'

const props = defineProps<{
  model: TimelineModel
  heroes: Map<number, HeroInfo> | null
  names: NamesIndex | null
  matchupPreset?: MatchupPreset
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'focus', slot: number): void
  (event: 'change-matchup', preset: MatchupPreset): void
  (event: 'custom-matchup', allySlots: number[], enemySlots: number[]): void
}>()

const cursor = ref(600)
const playing = ref(false)
const speed = ref(1)
const metric = ref<MetricKey>('netWorth')
const buildSlot = ref<number | null>(null)
const posTab = ref(1)
const modalEl = ref<HTMLElement | null>(null)
const bodyEl = ref<HTMLElement | null>(null)
const view = ref<'timeline' | 'fights'>('timeline')
const bodyScrolled = ref(false)
let timer: number | null = null

const METRICS: Array<{ key: MetricKey; label: string }> = [
  { key: 'netWorth', label: '经济' },
  { key: 'lastHits', label: '补刀' },
  { key: 'xp', label: '经验' },
  { key: 'heroDamage', label: '英雄伤害' }
]

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6']

const focus = computed(() => props.model.focus)
const isLight = computed(() => config.mode === 'light')
const enemies = computed(() => {
  const me = focus.value
  if (!me) return []
  return props.model.selected.filter((player) => player.isRadiant !== me.isRadiant)
})

const allies = computed(() => {
  const me = focus.value
  if (!me) return []
  return props.model.selected.filter(
    (player) => player.slot !== me.slot && player.isRadiant === me.isRadiant
  )
})

const customOpen = ref(false)
const customAllies = ref<number[]>([])
const customEnemies = ref<number[]>([])
const allyCandidates = computed(() =>
  props.model.players.filter((player) => player.isRadiant === focus.value?.isRadiant)
)
const enemyCandidates = computed(() =>
  props.model.players.filter((player) => player.isRadiant !== focus.value?.isRadiant)
)

function selectHero(player: TimelinePlayer): void {
  buildSlot.value = player.slot
  customOpen.value = false
  emit('focus', player.slot)
}

function onFocusSelectValue(slot: number): void {
  customOpen.value = false
  emit('focus', slot)
}

function openCustomMatchup(): void {
  const me = focus.value
  if (!me) return
  customAllies.value = [
    me.slot,
    ...props.model.selected
      .filter((player) => player.slot !== me.slot && player.isRadiant === me.isRadiant)
      .map((player) => player.slot)
  ].slice(0, 2)
  customEnemies.value = props.model.selected
    .filter((player) => player.isRadiant !== me.isRadiant)
    .map((player) => player.slot)
    .slice(0, 3)
  customOpen.value = true
}

function onMatchupSelect(event: Event): void {
  const preset = (event.target as HTMLSelectElement).value as MatchupPreset
  if (preset === 'custom') {
    openCustomMatchup()
    return
  }
  emit('change-matchup', preset)
}

function toggleCustom(side: 'ally' | 'enemy', player: TimelinePlayer): void {
  if (side === 'ally' && player.slot === focus.value?.slot) return
  const list = side === 'ally' ? customAllies : customEnemies
  const index = list.value.indexOf(player.slot)
  if (index >= 0) {
    list.value = list.value.filter((slot) => slot !== player.slot)
    return
  }
  const limit = side === 'ally' ? 2 : 3
  if (list.value.length < limit) list.value = [...list.value, player.slot]
}

function saveCustomMatchup(): void {
  const me = focus.value
  if (!me) return
  emit(
    'custom-matchup',
    [me.slot, ...customAllies.value.filter((slot) => slot !== me.slot)].slice(0, 2),
    customEnemies.value.slice(0, 3)
  )
  customOpen.value = false
}

const primaryRival = computed<TimelinePlayer | null>(() => {
  const me = focus.value
  if (!me) return enemies.value[0] ?? null
  // 优先全场同位置的敌方（即使不在对位选择里）
  if (me.position != null) {
    const samePosition = props.model.players.find(
      (player) => player.isRadiant !== me.isRadiant && player.position === me.position
    )
    if (samePosition) return samePosition
  }
  // 没有位置数据时，按分路找对线对手：优势路(1) 对 劣势路(3)，中路(2) 对 中路
  const oppositeLane = me.laneRole === 1 ? 3 : me.laneRole === 3 ? 1 : me.laneRole
  if (oppositeLane != null) {
    const laneRival = props.model.players.find(
      (player) => player.isRadiant !== me.isRadiant && player.laneRole === oppositeLane
    )
    if (laneRival) return laneRival
  }
  return enemies.value[0] ?? null
})

const rivalName = computed(() => {
  const rival = primaryRival.value
  if (!rival) return ''
  return props.names?.heroById.get(rival.heroId)?.cn ?? '未知英雄'
})

const positionMismatch = computed(() => {
  const me = focus.value
  const rival = primaryRival.value
  if (!me || !rival) return false
  return me.position != null && rival.position != null && me.position !== rival.position
})

const duration = computed(() => Math.max(60, props.model.durationSec))

const buildPlayer = computed<TimelinePlayer | null>(() => {
  const selected = props.model.selected
  if (!selected.length) return null
  return selected.find((player) => player.slot === buildSlot.value) ?? selected[0]
})

const pairs = computed<PositionPair[]>(() =>
  buildPositionPairs(props.model.players, focus.value?.isRadiant ?? true)
)

const activePair = computed<PositionPair | null>(() => {
  if (!pairs.value.length) return null
  return pairs.value.find((pair) => pair.position === posTab.value) ?? pairs.value[0]
})

const focusPosition = computed(() => focus.value?.position ?? null)

const alignPairTab = (): void => {
  if (!pairs.value.length) return
  const preferred = pairs.value.find((pair) => pair.position === focusPosition.value)
  posTab.value = preferred?.position ?? pairs.value[0].position
}

const heroImage = (player: TimelinePlayer): string => props.heroes?.get(player.heroId)?.img ?? ''
const heroName = (player: TimelinePlayer): string =>
  props.names?.heroById.get(player.heroId)?.cn ?? '未知英雄'

const heroOptions = computed(() =>
  props.model.players.map((player) => ({
    value: player.slot,
    label: heroName(player),
    meta: positionLabel(player.position) || (player.isRadiant ? '天辉' : '夜魇'),
    avatar: heroImage(player),
    side: player.isRadiant ? ('radiant' as const) : ('dire' as const)
  }))
)

const metricLabel = computed(() => METRICS.find((item) => item.key === metric.value)?.label ?? '')

const chartSeries = computed<ChartSeries[]>(() =>
  props.model.selected.map((player, index) => {
    const points = player.finePoints?.length ? player.finePoints : player.points
    return {
      slot: player.slot,
      label: heroName(player),
      color: player.isFocus ? COLORS[0] : COLORS[(index % (COLORS.length - 1)) + 1],
      img: heroImage(player),
      values: points.map((point) => point[metric.value]),
      stepSec: player.finePoints?.length ? player.chartStepSec : 60
    }
  })
)

const marks = computed(() => {
  const list: Array<{ pct: string; label: string }> = []
  for (const level of [600, 900, 1200, 1500]) {
    if (level < duration.value) {
      list.push({ pct: `${((level / duration.value) * 100).toFixed(2)}%`, label: `${formatClock(level)} 天赋层` })
    }
  }
  for (const player of props.model.selected) {
    const core = player.purchases.find((purchase) => (purchase.cost ?? 0) >= 2000)
    if (core) {
      list.push({
        pct: `${((core.sec / duration.value) * 100).toFixed(2)}%`,
        label: `${formatClock(core.sec)} ${heroName(player)} 关键装`
      })
    }
  }
  return list
})

function fmtCompact(value: number | null): string {
  if (value == null) return '—'
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}k`
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)}k`
  return String(Math.round(value))
}

function fmtSigned(value: number | null, digits = 0): string {
  if (value == null) return '—'
  const rounded = digits ? Number(value.toFixed(digits)) : Math.round(value)
  return `${rounded > 0 ? '+' : ''}${rounded}`
}

function fmtDuration(seconds: number): string {
  const abs = Math.abs(Math.round(seconds))
  return `${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`
}

function diffClass(value: number | null): string {
  if (value == null || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}

const tiles = computed(() => {
  const player = focus.value
  const rival = primaryRival.value
  if (!player) return null
  const netWorth = interpolationAtDetailed(player, cursor.value, 'netWorth')
  const rivalNetWorth = rival ? interpolationAtDetailed(rival, cursor.value, 'netWorth') : null
  const lastHits = interpolationAtDetailed(player, cursor.value, 'lastHits')
  const rivalLastHits = rival ? interpolationAtDetailed(rival, cursor.value, 'lastHits') : null
  const xp = interpolationAtDetailed(player, cursor.value, 'xp')
  const rivalXp = rival ? interpolationAtDetailed(rival, cursor.value, 'xp') : null
  const point = pointAtDetailed(player, cursor.value)
  const rivalPoint = rival ? pointAtDetailed(rival, cursor.value) : null
  return {
    netWorth,
    netWorthDiff: netWorth != null && rivalNetWorth != null ? netWorth - rivalNetWorth : null,
    lastHits,
    lastHitsDiff: lastHits != null && rivalLastHits != null ? lastHits - rivalLastHits : null,
    xp,
    xpDiff: xp != null && rivalXp != null ? xp - rivalXp : null,
    level: point.level,
    levelDiff:
      point.level != null && rivalPoint?.level != null ? point.level - rivalPoint.level : null,
    kills: point.kills,
    deaths: point.deaths,
    assists: point.assists ?? player.finalKda.assists
  }
})

const conclusionLines = computed(() => {
  const pair = activePair.value
  if (!pair) return []
  const lines: string[] = []
  const itemName = (key: string): string => {
    const item = props.names?.itemByKey.get(key) ?? props.names?.itemByKey.get(key.replace(/^item_/, ''))
    if (item?.cn) return item.cn
    if (item?.en) return item.en
    return key.replace(/^item_/, '').replace(/_/g, ' ') || '未知装备'
  }

  const at10 = pair.at10
  if (at10 && at10.diff.netWorth != null) {
    lines.push(
      `10:00 经济差 ${fmtSigned(at10.diff.netWorth)}，补刀 ${at10.lastHits ?? '—'} vs ${pointAtDetailed(pair.enemy, 600).lastHits ?? '—'}（${fmtSigned(at10.diff.lastHits)}）`
    )
  }
  const at20 = pair.at20
  if (at20 && at20.diff.netWorth != null) {
    lines.push(
      `20:00 经济差 ${fmtSigned(at20.diff.netWorth)}，等级差 ${fmtSigned(at20.diff.level)}（${at20.level ?? '—'} vs ${pointAtDetailed(pair.enemy, 1200).level ?? '—'}）`
    )
  }
  if (pair.coreAlly && pair.coreEnemy) {
    const diff = pair.coreDiffSec ?? 0
    const earlier = diff < 0 ? '早' : '慢'
    lines.push(
      `首件 2000+：${itemName(pair.coreAlly.key)} ${formatClock(pair.coreAlly.sec)} vs ${itemName(pair.coreEnemy.key)} ${formatClock(pair.coreEnemy.sec)}（${earlier} ${fmtDuration(diff)}）`
    )
  } else if (pair.coreAlly) {
    lines.push(`首件 2000+：${itemName(pair.coreAlly.key)} ${formatClock(pair.coreAlly.sec)}，对手未记录`)
  }
  lines.push(
    `终局 KDA：${pair.ally.finalKda.kills}/${pair.ally.finalKda.deaths}/${pair.ally.finalKda.assists} vs ${pair.enemy.finalKda.kills}/${pair.enemy.finalKda.deaths}/${pair.enemy.finalKda.assists}`
  )
  return lines
})

const fallbackLines = computed(() => {
  const player = focus.value
  const rival = primaryRival.value
  if (!player || !rival) return []
  const lines: string[] = []
  const netWorth = interpolationAtDetailed(player, cursor.value, 'netWorth')
  const rivalNetWorth = interpolationAtDetailed(rival, cursor.value, 'netWorth')
  if (netWorth != null && rivalNetWorth != null) {
    lines.push(`${formatClock(cursor.value)} 经济差 ${fmtSigned(netWorth - rivalNetWorth)}`)
  }
  const lh = interpolationAtDetailed(player, cursor.value, 'lastHits')
  const rivalLh = interpolationAtDetailed(rival, cursor.value, 'lastHits')
  if (lh != null && rivalLh != null) {
    lines.push(`补刀 ${Math.round(lh)} vs ${Math.round(rivalLh)}（${fmtSigned(lh - rivalLh)}）`)
  }
  lines.push(`终局 KDA：${player.finalKda.kills}/${player.finalKda.deaths}/${player.finalKda.assists} vs ${rival.finalKda.kills}/${rival.finalKda.deaths}/${rival.finalKda.assists}`)
  return lines
})

function stopTimer(): void {
  if (timer != null) {
    window.clearInterval(timer)
    timer = null
  }
  playing.value = false
}

function togglePlay(): void {
  if (playing.value) {
    stopTimer()
    return
  }
  playing.value = true
  timer = window.setInterval(() => {
    cursor.value = Math.min(duration.value, cursor.value + speed.value)
    if (cursor.value >= duration.value) stopTimer()
  }, 200)
}

function seek(sec: number): void {
  cursor.value = Math.min(duration.value, Math.max(0, sec))
}

function close(): void {
  stopTimer()
  customOpen.value = false
  emit('update:open', false)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    seek(cursor.value - (event.shiftKey ? 300 : 60))
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    seek(cursor.value + (event.shiftKey ? 300 : 60))
    event.preventDefault()
  } else if (event.key === 'Home') {
    seek(0)
    event.preventDefault()
  } else if (event.key === 'End') {
    seek(duration.value)
    event.preventDefault()
  } else if (event.key === ' ') {
    togglePlay()
    event.preventDefault()
  }
}

function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) {
    event.stopPropagation()
    close()
  }
}

function syncBodyLock(open: boolean): void {
  document.body.style.overflow = open ? 'hidden' : ''
}

function onBodyScroll(): void {
  bodyScrolled.value = (bodyEl.value?.scrollTop ?? 0) > 2
}

function switchView(next: 'timeline' | 'fights'): void {
  view.value = next
  if (bodyEl.value) bodyEl.value.scrollTop = 0
  bodyScrolled.value = false
}

watch(
  () => props.open,
  (open) => {
    syncBodyLock(open)
    if (open) {
      window.addEventListener('keydown', onEscape)
      cursor.value = Math.min(cursor.value || 600, duration.value)
      bodyScrolled.value = false
      view.value = 'timeline'
      void nextTick(() => {
        modalEl.value?.focus()
        if (bodyEl.value) bodyEl.value.scrollTop = 0
        bodyScrolled.value = false
      })
    } else {
      window.removeEventListener('keydown', onEscape)
      stopTimer()
    }
  },
  { immediate: true }
)

watch(
  () => props.model.matchId,
  () => {
    stopTimer()
    cursor.value = Math.min(600, duration.value)
    buildSlot.value = focus.value?.slot ?? null
    metric.value = 'netWorth'
    alignPairTab()
  },
  { immediate: true }
)

watch(focusPosition, alignPairTab)

onBeforeUnmount(() => {
  stopTimer()
  window.removeEventListener('keydown', onEscape)
  syncBodyLock(false)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="timeline-overlay" @click.self="close">
      <section
        ref="modalEl"
        class="timeline-modal"
        :class="{ light: isLight }"
        role="dialog"
        aria-modal="true"
        aria-label="时间轴与对位数据"
        @keydown="onKeydown"
        tabindex="-1"
      >
        <header class="modal-head">
          <div class="title">
            <span class="title-icon"><AppIcon name="clock" :size="16" /></span>
            <span class="title-text">
              <b>时间轴</b>
              <small>MATCH TIMELINE</small>
            </span>
          </div>

          <HeroSelect
            v-if="focus"
            :model-value="focus.slot"
            :options="heroOptions"
            label="分析对象"
            @update:model-value="onFocusSelectValue"
          />

          <div class="lane">
            <div v-if="allies.length" class="lane-side">
              <span class="lane-label">我方</span>
              <button
                v-for="mate in allies"
                :key="mate.slot"
                type="button"
                class="rival"
                :class="{ on: buildPlayer?.slot === mate.slot }"
                :title="`切换到 ${heroName(mate)} 的时间轴`"
                @click="selectHero(mate)"
              >
                <img v-if="heroImage(mate)" :src="heroImage(mate)" alt="" />
                <span>{{ heroName(mate) }}</span>
              </button>
            </div>

            <div v-if="enemies.length" class="lane-side">
              <span class="lane-label">对位</span>
              <button
                v-for="rival in enemies"
                :key="rival.slot"
                type="button"
                class="rival"
                :class="{ on: buildPlayer?.slot === rival.slot }"
                :title="`切换到 ${heroName(rival)} 的时间轴`"
                @click="selectHero(rival)"
              >
                <img v-if="heroImage(rival)" :src="heroImage(rival)" alt="" />
                <span>{{ heroName(rival) }}</span>
              </button>
            </div>

            <span v-if="!allies.length && !enemies.length" class="note">未选择对位</span>
          </div>

          <select
            class="matchup-select"
            :value="matchupPreset || 'mid'"
            title="切换对位范围"
            @change="onMatchupSelect"
          >
            <option value="mid">1v1</option>
            <option value="safe">优势路 2v2</option>
            <option value="off">劣势路 2v2</option>
            <option value="custom">自定义</option>
          </select>

          <div class="view-tabs">
            <button type="button" :class="{ on: view === 'timeline' }" @click="switchView('timeline')">
              时间轴
            </button>
            <button
              type="button"
              :class="{ on: view === 'fights' }"
              :disabled="!model.teamfights.length"
              @click="switchView('fights')"
            >
              团战<span v-if="model.teamfights.length">{{ model.teamfights.length }}</span>
            </button>
          </div>

          <button type="button" class="close" aria-label="关闭" @click="close">
            <AppIcon name="close" :size="18" />
          </button>

          <div v-if="customOpen" class="matchup-editor">
            <div class="me-head">
              <b>自定义对位</b>
              <span>分析对象：{{ focus ? heroName(focus) : '' }}</span>
            </div>

            <div class="me-group">
              <span class="me-label">我方 · 最多 2 人（含分析对象）</span>
              <div class="me-list">
                <button
                  v-for="player in allyCandidates"
                  :key="`ally-${player.slot}`"
                  type="button"
                  class="me-chip"
                  :class="{ on: customAllies.includes(player.slot), lock: player.slot === focus?.slot }"
                  :disabled="player.slot === focus?.slot"
                  @click="toggleCustom('ally', player)"
                >
                  <img v-if="heroImage(player)" :src="heroImage(player)" alt="" />
                  <span>{{ heroName(player) }}</span>
                  <em v-if="player.slot === focus?.slot">对象</em>
                </button>
              </div>
            </div>

            <div class="me-group">
              <span class="me-label">对方 · 最多 3 人</span>
              <div class="me-list">
                <button
                  v-for="player in enemyCandidates"
                  :key="`enemy-${player.slot}`"
                  type="button"
                  class="me-chip"
                  :class="{ on: customEnemies.includes(player.slot) }"
                  @click="toggleCustom('enemy', player)"
                >
                  <img v-if="heroImage(player)" :src="heroImage(player)" alt="" />
                  <span>{{ heroName(player) }}</span>
                </button>
              </div>
            </div>

            <div class="me-actions">
              <span class="me-hint">选择后应用，时间轴按此对位显示</span>
              <button type="button" class="me-btn" @click="customOpen = false">取消</button>
              <button type="button" class="me-btn primary" @click="saveCustomMatchup">应用</button>
            </div>
          </div>
        </header>

        <div
          ref="bodyEl"
          class="modal-body"
          :class="{ scrolled: bodyScrolled }"
          @scroll.passive="onBodyScroll"
        >
          <template v-if="view === 'timeline'">
          <div class="scrubber">
            <div class="scrub-top">
              <button type="button" class="play" :aria-label="playing ? '暂停' : '播放'" @click="togglePlay">
                <AppIcon :name="playing ? 'close' : 'bolt'" :size="16" />
              </button>
              <span class="clock">{{ formatClock(cursor) }}</span>
              <span class="duration">/ {{ formatClock(duration) }}</span>
              <div class="speeds">
                <button
                  v-for="value in [1, 2, 4]"
                  :key="value"
                  type="button"
                  :class="{ on: speed === value }"
                  @click="speed = value"
                >
                  {{ value }}×
                </button>
              </div>
            </div>
            <div class="range">
              <input
                v-model.number="cursor"
                type="range"
                min="0"
                :max="duration"
                step="1"
                aria-label="对局时间"
                @input="stopTimer"
              />
              <span v-for="(mark, index) in marks" :key="`${mark.pct}-${index}`" class="mark" :style="{ left: mark.pct }" :title="mark.label" />
            </div>
          </div>

          <div v-if="tiles" class="compare-line">
            对比：<b>{{ rivalName || '—' }}</b>
            <span v-if="positionMismatch" class="warn">非同位置，仅供参考</span>
            <span v-if="primaryRival?.purchaseSource === 'replay'" class="src">回放</span>
          </div>

          <div v-if="tiles" class="tiles">
            <div class="tile">
              <span class="k">财产总和</span>
              <b>{{ fmtCompact(tiles.netWorth) }}</b>
              <small :class="diffClass(tiles.netWorthDiff)">{{ fmtSigned(tiles.netWorthDiff) }}</small>
            </div>
            <div class="tile">
              <span class="k">补刀</span>
              <b>{{ tiles.lastHits == null ? '—' : Math.round(tiles.lastHits) }}</b>
              <small :class="diffClass(tiles.lastHitsDiff)">{{ fmtSigned(tiles.lastHitsDiff) }}</small>
            </div>
            <div class="tile">
              <span class="k">经验</span>
              <b>{{ fmtCompact(tiles.xp) }}</b>
              <small :class="diffClass(tiles.levelDiff)">Lv{{ tiles.level ?? '—' }} {{ fmtSigned(tiles.levelDiff) }}</small>
            </div>
            <div class="tile">
              <span class="k">KDA</span>
              <b>{{ tiles.kills }}/{{ tiles.deaths }}</b>
              <small class="flat" title="回放 5 秒采样；没有回放数据时回退到终局助攻">{{ tiles.assists }}A</small>
            </div>
          </div>

          <section class="block s-items">
            <div class="block-head">
              <span>出装路线 · {{ focus ? heroName(focus) : '分析对象' }}</span>
              <span class="hint">
                {{ focus?.inventoryExact
                  ? '回放购买/卖出 · 小图标=散件/消耗品 · 金框=合成成品 · 6+1+3 背包'
                  : '基础模式仅出装路线 · 此刻背包需高级分析' }}
              </span>
            </div>
            <TimelineItems
              :players="model.focus ? [model.focus] : []"
              :cursor-sec="cursor"
              :duration-sec="duration"
              :heroes="heroes"
              :names="names"
              :show-inventory="Boolean(model.focus?.inventoryExact)"
              @seek="seek"
            />
          </section>

          <div class="layout">
            <div class="col main">
              <section class="block s-chart">
                <div class="block-head">
                  <span>走势</span>
                  <div class="tabs">
                    <button
                      v-for="item in METRICS"
                      :key="item.key"
                      type="button"
                      :class="{ on: metric === item.key }"
                      @click="metric = item.key"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
                <TimelineChart
                  :series="chartSeries"
                  :duration-sec="duration"
                  :cursor-sec="cursor"
                  :metric-label="metricLabel"
                  @seek="seek"
                />
              </section>
            </div>

            <div class="col side">
              <section class="block s-build">
                <div class="block-head">
                  <span>技能与天赋</span>
                  <div class="tabs">
                    <button
                      v-for="player in model.selected"
                      :key="player.slot"
                      type="button"
                      :class="{ on: buildPlayer?.slot === player.slot }"
                      @click="buildSlot = player.slot"
                    >
                      {{ heroName(player) }}
                    </button>
                  </div>
                </div>
                <TimelineBuild
                  v-if="buildPlayer && buildPlayer.upgrades.length"
                  :player="buildPlayer"
                  :cursor-sec="cursor"
                  :names="names"
                />
                <p v-else class="note">本场没有加点数据（OpenDota 未解析或录像里没抓到）。</p>
              </section>

              <section class="block s-conclusion">
                <div class="block-head">
                  <span>同位置结论</span>
                  <div v-if="pairs.length" class="tabs">
                    <button
                      v-for="pair in pairs"
                      :key="pair.position"
                      type="button"
                      :class="{ on: posTab === pair.position }"
                      @click="posTab = pair.position"
                    >
                      {{ pair.position }}
                    </button>
                  </div>
                </div>
                <div v-if="activePair" class="conclusion">
                  <div class="pair-title">
                    <span class="pos">{{ positionLabel(activePair.position) }}</span>
                    <span>{{ heroName(activePair.ally) }}</span>
                    <em>vs</em>
                    <span>{{ heroName(activePair.enemy) }}</span>
                  </div>
                  <ul>
                    <li v-for="(line, index) in conclusionLines" :key="index">{{ line }}</li>
                  </ul>
                </div>
                <div v-else class="conclusion">
                  <div class="pair-title"><span>{{ focus ? heroName(focus) : '分析对象' }} vs 对位</span></div>
                  <ul>
                    <li v-for="(line, index) in fallbackLines" :key="index">{{ line }}</li>
                  </ul>
                  <p class="note">没有 1–5 号位数据，按对位角色给结论；配置 STRATZ 可获得双方同位置对比。</p>
                </div>
              </section>
            </div>
          </div>

          <footer class="foot">
            <span v-for="source in model.sources" :key="source" class="chip">{{ source }}</span>
            <span class="chip">回放 5 秒采样</span>
            <span class="chip">加点按等级估算</span>
            <span class="chip">Esc 关闭</span>
          </footer>
          </template>
          <TeamfightPanel v-else :fights="model.teamfights" :names="names" />
        </div>
      </section>
    </div>
    <TooltipLayer v-if="open" />
  </Teleport>
</template>

<style scoped>
.timeline-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3, 12, 8, 0.62);
  backdrop-filter: blur(6px);
  animation: overlay-in 0.18s ease;
}

.timeline-modal {
  /* 全部走全局主题 token，自动适配 TrueSight / 标准主题的深浅色 */
  --dock-bg: var(--card-solid);
  --dock-rail: var(--input-bg-solid);
  --dock-soft: var(--hover);
  --dock-soft-strong: var(--input-bg);
  --dock-track: var(--input-bg);
  --dock-line-input: var(--line-strong);
  --dock-thumb-border: var(--line-strong);
  --dock-tick: var(--accent-line);
  --dock-warn: #fbbf24;
  --dock-warn-line: rgba(251, 191, 36, 0.28);
  --talent-ink: #fde68a;
  --talent-bg: rgba(253, 230, 138, 0.12);
  --talent-line: rgba(253, 230, 138, 0.3);
  --attr-ink: #93c5fd;
  --attr-bg: rgba(147, 197, 253, 0.12);
  --attr-line: rgba(147, 197, 253, 0.3);
  --scrub-bg: var(--input-bg);
  --scrub-text: var(--text);
  --scrub-dim: var(--text-mute);
  --scrub-accent: var(--accent);
  --scrub-play-bg: var(--accent-soft);
  --scrub-play-border: var(--accent-line);
  --scrub-track-bg: var(--line);
  --scrub-track-hi: var(--accent);
  --scrub-thumb-border: var(--card-solid);
  --scrub-on-bg: var(--hover);
  --scrub-on-border: var(--line-strong);
  display: flex;
  flex-direction: column;
  width: min(1500px, 95vw);
  height: min(940px, 92vh);
  border-radius: var(--radius-xl);
  border: 1px solid var(--line-strong);
  background:
    radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 58%),
    var(--card-solid);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
  animation: modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  outline: none;
}

.timeline-modal.light {
  --dock-warn: #b45309;
  --dock-warn-line: rgba(180, 83, 9, 0.3);
  --talent-ink: #92400e;
  --talent-bg: rgba(217, 119, 6, 0.12);
  --talent-line: rgba(217, 119, 6, 0.32);
  --attr-ink: #1d4ed8;
  --attr-bg: rgba(37, 99, 235, 0.1);
  --attr-line: rgba(37, 99, 235, 0.28);
}

.view-tabs {
  display: flex;
  gap: 4px;
  margin-left: auto;
  padding: 3px;
  border-radius: 9px;
  background: var(--dock-soft);
  border: 1px solid var(--line);
}

.view-tabs button {
  font: inherit;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
}

.view-tabs button.on {
  color: var(--text);
  background: var(--dock-soft-strong);
  border-color: var(--line-strong);
}

.view-tabs button:disabled {
  opacity: 0.45;
  cursor: default;
}

.view-tabs button span {
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-mute);
}

.modal-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent);
  flex: none;
  position: relative;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.title-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.title-text b {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.01em;
}

.title-text small {
  font-family: var(--mono);
  font-size: 8.5px;
  letter-spacing: 0.16em;
  color: var(--text-mute);
  text-transform: uppercase;
}

.focus {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-left: 14px;
  border-left: 1px solid var(--line);
  min-width: 0;
}

.focus.primary {
  padding: 4px 9px 4px 11px;
  border: 1px solid var(--accent-line);
  border-radius: 10px;
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 1px var(--accent-soft);
}

.focus.primary .avatar {
  box-shadow: 0 0 0 1px var(--accent-line);
}

.focus-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 0 4px;
  border: 1px solid var(--accent-line);
  border-radius: 4px;
  color: var(--accent-text);
  font-size: 8px;
  font-style: normal;
  line-height: 13px;
  vertical-align: 1px;
}

.lane {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.lane-side {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.lane-label {
  flex: none;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--text-mute);
}

.matchup-select {
  flex: none;
  height: 26px;
  padding: 0 6px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--hover);
  color: var(--text-dim);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--line-strong);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.focus-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.focus-text b {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.focus-select {
  max-width: 150px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}

.focus-select option {
  color: var(--text);
  background: var(--card-solid);
}

.matchup-editor {
  position: absolute;
  top: calc(100% + 8px);
  right: 18px;
  z-index: 30;
  width: min(540px, calc(100vw - 40px));
  padding: 14px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: var(--card-solid);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

.me-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.me-head b {
  font-size: 13px;
}

.me-head span {
  font-size: 10px;
  color: var(--text-mute);
}

.me-group {
  margin-bottom: 10px;
}

.me-label {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  color: var(--text-mute);
}

.me-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.me-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--hover);
  color: var(--text-dim);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.me-chip img {
  width: 18px;
  height: 18px;
  border-radius: 5px;
}

.me-chip.on {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  color: var(--text);
}

.me-chip.lock {
  opacity: 0.85;
  cursor: default;
}

.me-chip em {
  font-style: normal;
  font-size: 8px;
  color: var(--accent-text);
}

.me-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.me-hint {
  flex: 1;
  font-size: 9px;
  color: var(--text-mute);
}

.me-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--hover);
  color: var(--text-dim);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}

.me-btn.primary {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent-text);
}

.focus-text span {
  font-size: 11px;
  color: var(--text-mute);
}

.rivals {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
  margin-left: 2px;
}

.rivals-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-mute);
}

.rival {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--hover);
  color: var(--text-dim);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.16s, background 0.16s, color 0.16s;
}

.rival:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.rival img {
  width: 18px;
  height: 18px;
  border-radius: 5px;
}

.rival.on {
  border-color: var(--accent-line);
  background: var(--accent-soft);
  color: var(--text);
}

.close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--hover);
  color: var(--text-dim);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.16s, background 0.16s, color 0.16s;
}

.close:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  container-type: inline-size;
}

.scrubber {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--card-solid) 74%, transparent);
  border: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 8;
  backdrop-filter: blur(20px) saturate(150%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
}

.modal-body.scrolled .scrubber {
  border-color: var(--line-strong);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* 吸顶条内的文字/控件跟随亚克力底色 */
.scrubber .clock {
  color: var(--scrub-text);
}

.scrubber .duration {
  color: var(--scrub-dim);
}

.scrubber .play {
  border-color: var(--scrub-play-border);
  background: var(--scrub-play-bg);
  color: var(--scrub-accent);
}

.scrubber .speeds button {
  color: var(--scrub-dim);
}

.scrubber .speeds button.on {
  color: var(--scrub-text);
  border-color: var(--scrub-on-border);
  background: var(--scrub-on-bg);
}

.scrubber .range input::-webkit-slider-runnable-track {
  background: linear-gradient(90deg, var(--scrub-track-hi), var(--scrub-track-bg));
}

.scrubber .range input::-moz-range-track {
  background: var(--scrub-track-bg);
}

.scrubber .range input::-webkit-slider-thumb {
  border-color: var(--scrub-thumb-border);
}

.scrub-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.play {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent-text);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: filter 0.16s, box-shadow 0.16s;
}

.play:hover {
  filter: brightness(1.08);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.clock {
  font-size: 20px;
  font-weight: 650;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.duration {
  font-size: 11.5px;
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
}

.speeds {
  display: flex;
  gap: 3px;
  margin-left: auto;
  padding: 2px;
  border-radius: 8px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.speeds button {
  font: inherit;
  font-size: 10.5px;
  height: 22px;
  min-width: 28px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
}

.speeds button.on {
  color: var(--text);
  border-color: var(--line-strong);
  background: var(--hover);
}

.range {
  position: relative;
  height: 20px;
}

.range input {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 20px;
  margin: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}

.range input::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent-line), var(--dock-line-input));
}

.range input::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  margin-top: -4.5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  border: 1px solid var(--dock-thumb-border);
}

.range input::-moz-range-track {
  height: 5px;
  border-radius: 3px;
  background: var(--dock-line-input);
}

.range input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
}

.mark {
  position: absolute;
  top: 2px;
  z-index: 1;
  width: 1px;
  height: 16px;
  background: var(--dock-tick);
  pointer-events: none;
}

.compare-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-mute);
  margin-top: -6px;
}

.compare-line b {
  color: var(--text-dim);
  font-weight: 600;
}

.compare-line .warn {
  color: var(--dock-warn);
  border: 1px solid var(--dock-warn-line);
  border-radius: 4px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 15px;
}

.compare-line .src {
  font-size: 10px;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 0 4px;
  line-height: 14px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 13px;
  border-radius: var(--radius-lg);
  background: var(--hover);
  border: 1px solid var(--line);
  min-width: 0;
  transition: border-color 0.16s, background 0.16s;
}

.tile:hover {
  border-color: var(--line-strong);
}

.tile .k {
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-mute);
}

.tile b {
  font-size: 20px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.tile small {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

.up {
  color: var(--good-text);
}

.down {
  color: var(--danger-text);
}

.flat {
  color: var(--text-mute);
}

/* 弹窗足够宽：左右两列各自堆叠；窄屏单列 */
.layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

@container (min-width: 860px) {
  .layout {
    flex-direction: row;
    align-items: stretch;
  }

  .col.main {
    flex: 1.9 1 0;
  }

  .col.side {
    flex: 1 1 0;
  }

  .s-chart {
    flex: 1;
    min-height: 0;
  }

  /* 宽布局下能力列表两列，压缩右列高度，让图表和整屏内容都放得下 */
  .s-build :deep(.abilities) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3px 14px;
  }

  .s-build :deep(.ability) {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

  .layout .block {
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--hover);
  }

  .s-items {
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--hover);
  }

  .s-chart {
    --chart-h: 320px;
  }
}

.block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-dim);
  gap: 8px;
}

.block-head .hint {
  font-size: 9.5px;
  font-weight: 400;
  color: var(--text-mute);
}

.tabs {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: var(--input-bg);
  border: 1px solid var(--line);
  overflow: hidden;
}

.tabs button {
  font: inherit;
  font-size: 10.5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.16s, background 0.16s, border-color 0.16s;
}

.tabs button:hover {
  color: var(--text);
}

.tabs button.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.conclusion {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 13px;
  border-radius: var(--radius-lg);
  background: var(--hover);
  border: 1px solid var(--line);
}

.pair-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: var(--text);
  flex-wrap: wrap;
}

.pair-title .pos {
  color: var(--accent-text);
  font-size: 11px;
}

.pair-title em {
  font-style: normal;
  color: var(--text-mute);
  font-size: 10px;
}

.conclusion ul {
  margin: 0;
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.conclusion li {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}

.note {
  margin: 0;
  font-size: 10px;
  color: var(--text-mute);
  line-height: 1.5;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}

.foot .chip {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 4px;
  border: 1px solid var(--line);
  color: var(--text-mute);
  line-height: 16px;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* --- 子面板统一到主题：出装路线 / 技能天赋 / 图表标题 --- */
.s-items :deep(.row) {
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid transparent;
}

.s-items :deep(.row.focus) {
  background: var(--hover);
  border-color: var(--line);
  box-shadow: inset 2px 0 0 var(--accent);
}

.s-items :deep(.name) {
  font-size: 11.5px;
  font-weight: 500;
}

.s-items :deep(.track) {
  background: var(--input-bg);
  border-radius: 10px;
}

.s-items :deep(.slot) {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  background: var(--hover);
}

.s-items :deep(.slot.filled) {
  border-style: solid;
}

.s-items :deep(.bag-title) {
  font-size: 10px;
  color: var(--text-dim);
}

.s-items :deep(.bag-label) {
  font-size: 9.5px;
}

.s-items :deep(.mark img) {
  border-color: var(--line-strong);
}

.s-build :deep(.head) {
  font-size: 12px;
}

.s-build :deep(.head b) {
  font-size: 13px;
}

.s-build :deep(.est) {
  font-size: 9.5px;
}

.s-build :deep(.ability) {
  padding: 4px 6px;
  border-radius: 8px;
  background: var(--hover);
}

.s-build :deep(.ability:hover) {
  border-color: var(--line);
}

.s-build :deep(.ability-icon) {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.s-build :deep(.nm) {
  font-size: 11px;
}

.s-build :deep(.lv) {
  font-size: 10px;
}

.s-build :deep(.pips i) {
  width: 6px;
  height: 6px;
}

.s-build :deep(.seq) {
  gap: 4px;
}

.s-build :deep(.chip) {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.s-build :deep(.talent-title) {
  font-size: 10.5px;
}

.s-build :deep(.talents) {
  padding: 6px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--line);
}

.s-build :deep(.tier) {
  grid-template-columns: 32px 1fr 1fr;
  gap: 5px;
}

.s-build :deep(.tier-label) {
  font-size: 9.5px;
}

.s-build :deep(.node) {
  font-size: 10px;
  min-height: 30px;
  border-radius: 6px;
  background: var(--input-bg);
}

.s-build :deep(.node.picked) {
  background: var(--accent-soft);
}

.s-chart :deep(.chart-head .label) {
  font-size: 11.5px;
  font-weight: 500;
}

.s-chart :deep(.chart-head .hint) {
  font-size: 9.5px;
}

@media (prefers-reduced-motion: reduce) {
  .timeline-overlay,
  .timeline-modal {
    animation: none;
  }
}

@media (max-width: 900px) {
  .timeline-overlay {
    padding: 8px;
  }

  .timeline-modal {
    width: 98vw;
    height: 94vh;
    border-radius: 16px;
  }

  .modal-head {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
  }

  .modal-body {
    padding: 0 12px 12px;
  }

  .scrubber {
    margin-top: 12px;
  }
}

@media (max-width: 640px) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
