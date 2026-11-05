<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import HeroAvatar from './HeroAvatar.vue'
import type { SelectPlayer } from '../lib/players'
import type { MatchupPreset, MatchupState } from '../lib/matchup'
import { presetLabels } from '../lib/matchup'
import { playerLaneText, type RosterPlayer } from '../lib/roster'
import { config, type Depth } from '../lib/config'
import type { HeroInfo } from '../lib/heroes'
import type { NamesIndex } from '../lib/names'

const props = defineProps<{
  roster: RosterPlayer[]
  matchId: string
  heroes: Map<number, HeroInfo> | null
  names?: NamesIndex | null
  loading: boolean
  error: string
  lookupNote: string
  focusSlot: number | null
  busy: boolean
  matchup: MatchupState
}>()

const emit = defineEmits<{
  (e: 'update:matchId', value: string): void
  (e: 'search', id: string): void
  (e: 'clear'): void
  (e: 'update:focusSlot', slot: number | null): void
  (e: 'update:matchup', value: MatchupState): void
  (e: 'start'): void
  (e: 'stop'): void
}>()

const depth = computed(() => config.depth)
const hasStratz = computed(() => config.stratzToken.trim().length > 0)
const sourceHint = computed(() => {
  switch (config.sourceMode) {
    case 'opendota':
      return '仅 OpenDota'
    case 'stratz':
      return '仅 STRATZ'
    case 'both':
      return '双源结合'
    default:
      return hasStratz.value ? '自动 · 双源' : '自动 · OpenDota'
  }
})

function heroCn(id: number | undefined): string {
  if (id == null) return ''
  return props.names?.heroById.get(id)?.cn || props.heroes?.get(id)?.localized || `英雄 ${id}`
}

const players = computed<SelectPlayer[]>(() => {
  return props.roster
    .slice()
    .sort((a, b) => (a.isRadiant ? 0 : 1) - (b.isRadiant ? 0 : 1))
    .map((p) => {
      const hero = props.heroes?.get(p.heroId)
      return {
        slot: p.slot,
        heroId: p.heroId,
        heroName: heroCn(p.heroId),
        playerName: p.playerName,
        isRadiant: p.isRadiant,
        hero
      }
    })
})

const radiant = computed(() => players.value.filter((p) => p.isRadiant))
const dire = computed(() => players.value.filter((p) => !p.isRadiant))

function playerOf(slot: number): RosterPlayer | undefined {
  return props.roster.find((p) => p.slot === slot)
}

function heroOf(slot: number): HeroInfo | undefined {
  const p = playerOf(slot)
  return p ? props.heroes?.get(p.heroId) : undefined
}

function nameOf(slot: number): string {
  const p = playerOf(slot)
  if (!p) return ''
  return `${heroCn(p.heroId)} · ${p.playerName}`
}

const focus = computed(() => (props.focusSlot == null ? null : playerOf(props.focusSlot) ?? null))

const focusInfo = computed(() => {
  const p = focus.value
  if (!p) return null
  const hero = props.heroes?.get(p.heroId)
  return {
    hero,
    heroName: heroCn(p.heroId),
    playerName: p.playerName,
    team: p.isRadiant ? '天辉' : '夜魇',
    isRadiant: p.isRadiant,
    kda: `${p.kills}-${p.deaths}-${p.assists}`,
    lane: playerLaneText(p)
  }
})

const pickerFor = ref<'ally' | 'enemy' | null>(null)
const pickerPos = ref({ left: 0, top: 0 })
const expanded = ref(true)

/**
 * 选择器用 fixed 定位挂到 body：卡片内部有多层 overflow:hidden（折叠动画），
 * 之前的下拉浮层被裁掉，表现为「点了 + 但选不了英雄」。
 */
function openPicker(side: 'ally' | 'enemy', event: MouseEvent): void {
  if (pickerFor.value === side) {
    pickerFor.value = null
    return
  }
  const el = event.currentTarget as HTMLElement | null
  const rect = el?.getBoundingClientRect()
  const width = 300
  const left = rect ? Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) : 8
  const top = rect ? Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 248)) : 8
  pickerPos.value = { left, top }
  pickerFor.value = side
}

function closePicker(): void {
  pickerFor.value = null
}

function onDocPointer(event: MouseEvent): void {
  if (!pickerFor.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('.picker-pop') || target?.closest('.add')) return
  pickerFor.value = null
}

onMounted(() => {
  document.addEventListener('mousedown', onDocPointer)
  window.addEventListener('scroll', closePicker, true)
  window.addEventListener('resize', closePicker)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocPointer)
  window.removeEventListener('scroll', closePicker, true)
  window.removeEventListener('resize', closePicker)
})

watch(
  () => props.busy,
  (busy) => {
    if (busy) expanded.value = false
  }
)

const pickerCandidates = computed(() => {
  const f = focus.value
  if (!f || !pickerFor.value) return []
  const sameTeam = pickerFor.value === 'ally'
  const selected = sameTeam ? props.matchup.allySlots : props.matchup.enemySlots
  return props.roster
    .filter((p) => p.isRadiant === (sameTeam ? f.isRadiant : !f.isRadiant))
    .filter((p) => !selected.includes(p.slot))
    .map((p) => {
      const hero = props.heroes?.get(p.heroId)
      return {
        slot: p.slot,
        hero,
        heroName: heroCn(p.heroId),
        playerName: p.playerName
      }
    })
})

function patchMatchup(patch: Partial<MatchupState>): void {
  emit('update:matchup', { ...props.matchup, ...patch })
}

function toggleMatchup(enabled: boolean): void {
  pickerFor.value = null
  patchMatchup({ enabled })
}

function choosePreset(preset: MatchupPreset): void {
  pickerFor.value = null
  patchMatchup({ preset })
}

function removeSlot(side: 'ally' | 'enemy', slot: number): void {
  if (side === 'ally' && slot === props.focusSlot) return
  const key = side === 'ally' ? 'allySlots' : 'enemySlots'
  const next = props.matchup[key].filter((s) => s !== slot)
  patchMatchup({ [key]: next, preset: 'custom' } as Partial<MatchupState>)
}

function addSlot(slot: number): void {
  const side = pickerFor.value
  if (!side) return
  const key = side === 'ally' ? 'allySlots' : 'enemySlots'
  const limit = 3
  const next = [...props.matchup[key], slot].slice(0, limit)
  patchMatchup({ [key]: next, preset: 'custom' } as Partial<MatchupState>)
  pickerFor.value = null
}

function setFocus(slot: number): void {
  emit('update:focusSlot', slot)
}

function search(): void {
  emit('search', props.matchId.trim())
}

const canClear = computed(() => props.matchId.trim().length > 0 || props.roster.length > 0)

function clearMatch(): void {
  emit('update:matchId', '')
  emit('clear')
}

function setDepth(value: Depth): void {
  config.depth = value
}

function toggleExpanded(): void {
  expanded.value = !expanded.value
}

function collapse(): void {
  expanded.value = false
}

defineExpose({ collapse })

function onCardClick(): void {
  if (!expanded.value) expanded.value = true
}

const canStart = computed(() => Boolean(props.roster.length && props.focusSlot != null && !props.busy))
</script>

<template>
  <section class="match card" :class="{ collapsed: !expanded }" @click="onCardClick">
    <div class="head-row">
      <div
        class="card-head"
        role="button"
        tabindex="0"
        :aria-expanded="expanded"
        @click.stop="toggleExpanded"
        @keydown.enter.prevent.stop="toggleExpanded"
        @keydown.space.prevent.stop="toggleExpanded"
      >
      <h2 class="card-title">
        <AppIcon name="trophy" :size="17" class="trophy" />
        比赛选择
      </h2>
    </div>

      <div v-if="!expanded" class="summary" @click.stop>
        <span class="summary-match">#{{ matchId || '—' }}</span>

        <div class="summary-focus">
          <HeroAvatar v-if="focusInfo" :hero="focusInfo.hero" :size="44" />
          <div v-if="focusInfo" class="summary-text">
            <div class="summary-title">
              {{ focusInfo.heroName }}
              <span class="team-tag" :class="focusInfo.isRadiant ? 'radiant' : 'dire'">
                {{ focusInfo.team }}
              </span>
              <span v-if="focusInfo.lane" class="lane-tag">{{ focusInfo.lane }}</span>
            </div>
            <div class="summary-sub">{{ focusInfo.playerName }} · KDA {{ focusInfo.kda }}</div>
          </div>
          <span v-else class="summary-empty">未选择分析对象</span>
        </div>

        <div v-if="matchup.enabled" class="summary-matchup">
          <span class="summary-label">对位</span>
          <div class="summary-side">
            <HeroAvatar
              v-for="slot in matchup.allySlots"
              :key="'sa-' + slot"
              :hero="heroOf(slot)"
              :size="28"
              :title="nameOf(slot)"
            />
          </div>
          <span class="summary-vs">VS</span>
          <div class="summary-side">
            <HeroAvatar
              v-for="slot in matchup.enemySlots"
              :key="'se-' + slot"
              :hero="heroOf(slot)"
              :size="28"
              :title="nameOf(slot)"
            />
          </div>
        </div>

      </div>

      <button
        class="collapse-btn"
        type="button"
        :aria-label="expanded ? '收起' : '展开'"
        :title="expanded ? '收起' : '展开'"
        @click.stop="toggleExpanded"
      >
        <AppIcon name="chevronRight" :size="15" class="collapse-icon" :class="{ open: expanded }" />
      </button>
    </div>

    <div class="collapse" :class="{ open: expanded }">
      <div class="collapse-inner">
        <div class="module">
          <label class="label" for="match-id">比赛 ID</label>
          <div class="search-row">
            <input
              id="match-id"
              :value="matchId"
              class="field"
              :class="{ invalid: !!error }"
              :aria-invalid="!!error"
              placeholder="请输入 Dota 2 比赛 ID…"
              inputmode="numeric"
              @input="emit('update:matchId', ($event.target as HTMLInputElement).value)"
              @keydown.enter="search"
            />
            <button
              v-if="canClear"
              class="clear-btn"
              type="button"
              title="清除比赛"
              aria-label="清除比赛"
              :disabled="loading"
              @click="clearMatch"
            >
              <AppIcon name="close" :size="16" />
            </button>
            <button class="search-btn" type="button" :disabled="loading" title="查询比赛" @click="search">
              <AppIcon :name="loading ? 'loader' : 'search'" :size="18" :class="{ spin: loading }" />
            </button>
          </div>
          <p v-if="error" class="error" role="alert">
            <AppIcon name="info" :size="13" />
            <span>{{ error }}</span>
          </p>
        </div>

        <div class="module">
          <span class="label">选择玩家（点击头像设为分析对象）</span>
          <div class="roster">
            <div class="team">
              <span class="team-badge radiant" title="天辉">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l9 5v10l-9 5-9-5V7z" /></svg>
              </span>
              <HeroAvatar
                v-for="p in radiant"
                :key="p.slot"
                :hero="p.hero"
                :size="40"
                clickable
                :selected="focusSlot === p.slot"
                :title="`${p.heroName} · ${p.playerName}`"
                @click="setFocus(p.slot)"
              />
              <HeroAvatar
                v-for="i in Math.max(0, 5 - radiant.length)"
                :key="'r-placeholder-' + i"
                :size="40"
                placeholder
              />
            </div>

            <span class="divider" />

            <div class="team">
              <span class="team-badge dire" title="夜魇">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l9 5v10l-9 5-9-5V7z" /></svg>
              </span>
              <HeroAvatar
                v-for="p in dire"
                :key="p.slot"
                :hero="p.hero"
                :size="40"
                clickable
                :selected="focusSlot === p.slot"
                :title="`${p.heroName} · ${p.playerName}`"
                @click="setFocus(p.slot)"
              />
              <HeroAvatar
                v-for="i in Math.max(0, 5 - dire.length)"
                :key="'d-placeholder-' + i"
                :size="40"
                placeholder
              />
            </div>
          </div>
          <p class="lookup-note">{{ lookupNote }}</p>
        </div>

        <div class="module">
          <span class="label">分析对象</span>
          <div class="focus-line">
            <div v-if="focusInfo" class="focus-chip">
              <HeroAvatar :hero="focusInfo.hero" :size="34" />
              <div class="focus-text">
                <div class="focus-name">
                  {{ focusInfo.heroName }}
                  <span class="team-tag" :class="focusInfo.isRadiant ? 'radiant' : 'dire'">
                    {{ focusInfo.team }}
                  </span>
                  <span v-if="focusInfo.lane" class="lane-tag">{{ focusInfo.lane }}</span>
                </div>
                <div class="focus-sub">{{ focusInfo.playerName }} · KDA {{ focusInfo.kda }}</div>
              </div>
            </div>
            <span v-else class="focus-empty">点击上方头像选择玩家</span>
          </div>
        </div>

        <div class="module">
          <div class="matchup-head">
            <span class="label">对位分析</span>
            <label class="switch">
              <input
                type="checkbox"
                :checked="matchup.enabled"
                @change="toggleMatchup(($event.target as HTMLInputElement).checked)"
              />
              <span class="knob" />
            </label>
            <div v-if="matchup.enabled" class="presets">
              <button
                v-for="p in presetLabels"
                :key="p.key"
                type="button"
                class="preset"
                :class="{ on: matchup.preset === p.key }"
                @click="choosePreset(p.key)"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <div class="fold" :class="{ open: matchup.enabled }">
            <div class="fold-inner">
              <div class="sides">
                <div class="side">
                  <span class="side-title">我方</span>
                  <div class="side-list">
                    <HeroAvatar
                      v-for="slot in matchup.allySlots"
                      :key="slot"
                      :hero="heroOf(slot)"
                      :size="34"
                      :clickable="slot !== focusSlot"
                      :title="nameOf(slot)"
                      @click="removeSlot('ally', slot)"
                    />
                    <button
                      v-if="matchup.allySlots.length < 3"
                      class="add"
                      type="button"
                      title="添加我方成员"
                      @click.stop="openPicker('ally', $event)"
                    >
                      <AppIcon name="plus" :size="13" />
                    </button>
                  </div>
                </div>

                <span class="vs">VS</span>

                <div class="side">
                  <span class="side-title">对方</span>
                  <div class="side-list">
                    <HeroAvatar
                      v-for="slot in matchup.enemySlots"
                      :key="slot"
                      :hero="heroOf(slot)"
                      :size="34"
                      clickable
                      :title="nameOf(slot)"
                      @click="removeSlot('enemy', slot)"
                    />
                    <button
                      v-if="matchup.enemySlots.length < 3"
                      class="add"
                      type="button"
                      title="添加对方成员"
                      @click.stop="openPicker('enemy', $event)"
                    >
                      <AppIcon name="plus" :size="13" />
                    </button>
                  </div>
                </div>

                <p v-if="matchup.note" class="note">{{ matchup.note }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="depth-row">
          <div class="segmented" role="group" aria-label="分析深度">
            <button
              type="button"
              class="seg"
              :class="{ on: depth === 'rough' }"
              @click="setDepth('rough')"
            >
              粗略分析
            </button>
            <button
              type="button"
              class="seg"
              :class="{ on: depth === 'advanced' }"
              title="下载录像并用 Clarity 本地解析（首次可能较慢）"
              @click="setDepth('advanced')"
            >
              高级分析
            </button>
          </div>

          <div class="source">
            <span class="label">数据源</span>
            <select v-model="config.sourceMode" class="field source-select">
              <option value="auto">自动</option>
              <option value="opendota">仅 OpenDota</option>
              <option value="stratz">仅 STRATZ</option>
              <option value="both">双源结合</option>
            </select>
          </div>
          <span class="depth-hint">{{ sourceHint }}</span>

          <button
            v-if="busy"
            class="btn btn-stop start"
            type="button"
            title="停止当前分析"
            @click.stop="emit('stop')"
          >
            <span class="stop-square" aria-hidden="true" />
            停止分析
          </button>
          <button v-else class="btn btn-primary start" type="button" :disabled="!canStart" @click.stop="emit('start')">
            <AppIcon name="sparkle" :size="16" />
            开始分析
            <AppIcon name="chevronRight" :size="15" />
          </button>
        </div>

        <p v-if="depth === 'advanced'" class="advanced-note">
          高级分析会下载回放并用 Clarity 本地解析，首次可能需要几分钟
        </p>

        <button class="collapse-bottom" type="button" @click.stop="toggleExpanded">
          <AppIcon name="chevronRight" :size="13" class="bottom-chev" />
          <span>收起比赛选择</span>
        </button>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="pickerFor"
      class="picker-pop"
      :style="{ left: pickerPos.left + 'px', top: pickerPos.top + 'px' }"
      @mousedown.stop
      @click.stop
    >
      <button
        v-for="c in pickerCandidates"
        :key="c.slot"
        type="button"
        class="cand"
        @click="addSlot(c.slot)"
      >
        <HeroAvatar :hero="c.hero" :size="26" />
        <span class="cand-hero">{{ c.heroName }}</span>
        <span class="cand-player">{{ c.playerName }}</span>
      </button>
      <p v-if="!pickerCandidates.length" class="cand-empty">没有可选玩家</p>
    </div>
  </Teleport>
</template>

<style scoped>
.match {
  position: relative;
  z-index: 20;
  padding: 16px 20px;
  --form-w: 600px;
}

.match.collapsed {
  cursor: pointer;
}

.head-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 2px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  flex: 1;
  min-width: 0;
}

.match.collapsed .card-head {
  flex: 0 0 auto;
}

/* 收起时只剩标题行，去掉与下方内容之间的间距，让卡片上下内边距一致 */
.match.collapsed .head-row {
  margin-bottom: 0;
}

.card-head:focus-visible {
  outline: 2px solid var(--accent-line);
  outline-offset: 2px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 650;
  margin: 0;
}

.trophy {
  color: #f0b429;
}

.summary {
  cursor: default;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
}

.summary-focus {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  height: 64px;
  padding: 0 14px 0 6px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.summary-text {
  min-width: 0;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14.5px;
  font-weight: 650;
}

.summary-sub {
  font-size: 12px;
  color: var(--text-mute);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-empty {
  font-size: 13px;
  color: var(--text-mute);
}

.summary-match {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-mute);
}

.summary-matchup {
  display: flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  height: 64px;
  padding: 0 14px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.summary-label {
  font-size: 11px;
  color: var(--text-mute);
}

.summary-side {
  display: flex;
  align-items: center;
  gap: 5px;
}

.summary-vs {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-mute);
}

.collapse-btn {
  margin-left: auto;
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  color: var(--text-mute);
  transition: color 0.18s;
}

.collapse-btn:hover {
  color: var(--text);
}

.collapse-icon {
  transform: rotate(90deg);
  transition: transform 0.36s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-icon.open {
  transform: rotate(-90deg);
}

.collapse {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.32s ease, opacity 0.24s ease;
}

.collapse.open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.collapse-inner {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.module {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.search-row {
  display: flex;
  gap: 8px;
  width: var(--form-w);
  max-width: 100%;
}

.search-row .field {
  flex: 1;
  min-width: 0;
}

.search-row .field.invalid {
  border-color: var(--dire);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.16);
}

.clear-btn {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--input-bg);
  color: var(--text-mute);
  transition: color 0.16s, border-color 0.16s, background 0.16s;
}

.clear-btn:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--line-strong);
  background: var(--hover);
}

.clear-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.search-btn {
  width: 46px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  color: #fff;
  background: var(--btn-grad);
  box-shadow: var(--btn-shadow);
}

.search-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--dire);
  line-height: 1.4;
}

.roster {
  display: flex;
  align-items: center;
  gap: 10px;
  width: var(--form-w);
  max-width: 100%;
  padding: 9px 10px;
  border-radius: 11px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.team {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.team-badge {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex: none;
}

.team-badge svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke-width: 2;
}

.team-badge.radiant svg {
  stroke: var(--radiant);
}

.team-badge.dire svg {
  stroke: var(--dire);
}

.divider {
  width: 1px;
  height: 34px;
  flex: none;
  background: var(--line);
}

.lookup-note {
  font-size: 11px;
  color: var(--text-mute);
}

.focus-line {
  display: flex;
  align-items: center;
  gap: 10px;
  width: var(--form-w);
  max-width: 100%;
  min-height: 34px;
}

.focus-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 5px 10px 5px 5px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.focus-text {
  min-width: 0;
}

.focus-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.focus-sub {
  font-size: 11px;
  color: var(--text-mute);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-tag {
  font-size: 9.5px;
  padding: 0 5px;
  border-radius: 99px;
  border: 1px solid currentColor;
  font-weight: 500;
}

.team-tag.radiant {
  color: var(--good-text);
}

.team-tag.dire {
  color: var(--dire);
}

.lane-tag {
  font-size: 9.5px;
  padding: 0 5px;
  border-radius: 99px;
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.focus-empty {
  font-size: 12px;
  color: var(--text-mute);
}

.matchup-head {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.switch {
  position: relative;
  width: 34px;
  height: 19px;
  flex: none;
  cursor: pointer;
}

.switch input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.knob {
  position: absolute;
  inset: 0;
  border-radius: 99px;
  background: var(--line-strong);
  transition: background 0.18s;
}

.knob::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s;
}

.switch input:checked + .knob {
  background: var(--seg-grad);
}

.switch input:checked + .knob::after {
  transform: translateX(15px);
}

.presets {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.preset {
  height: 26px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 11.5px;
  color: var(--text-dim);
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.preset:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.preset.on {
  color: var(--seg-text);
  background: var(--seg-grad);
  border-color: transparent;
}

.fold {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.3s ease, opacity 0.24s ease;
}

.fold.open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.fold-inner {
  overflow: hidden;
  min-height: 0;
}

.sides {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  width: var(--form-w);
  max-width: 100%;
  margin-top: 9px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.side-title {
  font-size: 11px;
  color: var(--text-mute);
}

.side-list {
  display: flex;
  align-items: center;
  gap: 5px;
}

.add {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 1px dashed var(--line-strong);
  color: var(--text-mute);
}

.add:hover {
  color: var(--text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.vs {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-mute);
}

.note {
  flex-basis: 100%;
  font-size: 11px;
  color: var(--text-mute);
}

.picker-pop {
  position: fixed;
  width: 300px;
  z-index: 200;
  padding: 6px;
  border-radius: 10px;
  background: var(--card-solid);
  border: 1px solid var(--line-strong);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  max-height: 240px;
  overflow: auto;
}

.cand {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 7px;
  border-radius: 7px;
  text-align: left;
  font-size: 12px;
}

.cand:hover {
  background: var(--hover);
}

.cand-hero {
  flex: none;
}

.cand-player {
  margin-left: auto;
  color: var(--text-mute);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cand-empty {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--text-mute);
}

.depth-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;
}

.advanced-note {
  margin: 8px 0 0;
  font-size: 11.5px;
  color: var(--accent-text);
}

.collapse-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 26px;
  margin-top: -4px;
  border-radius: 8px;
  font-size: 11.5px;
  color: var(--text-mute);
  transition: color 0.16s, background 0.16s;
}

.collapse-bottom:hover {
  color: var(--text);
  background: var(--hover);
}

.bottom-chev {
  transform: rotate(-90deg);
}

.segmented {
  display: inline-flex;
  padding: 3px;
  border-radius: 9px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.seg {
  height: 28px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--text-dim);
  transition: background 0.16s, color 0.16s;
}

.seg:hover {
  color: var(--text);
}

.seg.on {
  color: var(--seg-text);
  background: var(--seg-grad);
  box-shadow: var(--seg-shadow);
}

.source {
  display: flex;
  align-items: center;
  gap: 7px;
}

.source-select {
  height: 32px;
  width: 122px;
  font-size: 12px;
  padding: 0 26px 0 9px;
}

.depth-hint {
  flex: 1;
  font-size: 11.5px;
  color: var(--text-mute);
  min-width: 80px;
}

.start {
  margin-left: auto;
  height: 42px;
  padding: 0 18px;
  font-size: 14px;
}

.btn-stop {
  color: var(--danger-text);
  background: var(--input-bg);
  border: 1px solid var(--dire);
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
}

.btn-stop:hover {
  background: rgba(248, 113, 113, 0.12);
}

.stop-square {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}

@media (max-width: 900px) {
  .roster {
    flex-wrap: wrap;
  }

  .divider {
    display: none;
  }

  .team {
    flex: 1 1 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .start {
    margin-left: 0;
    width: 100%;
  }

  .summary-match {
    display: none;
  }
}
</style>
