<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  CombatHero,
  CombatNode,
  CombatNodeType,
  DamageBreakdown,
  FocusRole
} from '../lib/combatNodes'

const props = defineProps<{
  nodes: CombatNode[]
}>()

const selected = ref(0)

watch(
  () => props.nodes,
  () => {
    selected.value = Math.min(selected.value, Math.max(0, props.nodes.length - 1))
  }
)

const current = computed<CombatNode | null>(() => props.nodes[selected.value] ?? null)

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
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

function sortedParticipants(node: CombatNode): CombatHero[] {
  return [...node.participants].sort((a, b) => {
    if (a.slot === node.focusSlot) return -1
    if (b.slot === node.focusSlot) return 1
    return b.damage.total - a.damage.total
  })
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
      <div class="cn-list-head">战斗节点</div>
      <button
        v-for="(node, index) in nodes"
        :key="node.index"
        type="button"
        class="cn-item"
        :class="{ on: index === selected }"
        @click="selected = index"
      >
        <span class="cn-time">{{ clock(node.start) }}</span>
        <span class="cn-type">{{ typeLabel(node.type) }}</span>
        <span class="cn-role" :class="node.focusRole">{{ roleLabel(node.focusRole) }}</span>
        <span class="cn-meta">{{ node.participants.length }} 人 · {{ Math.round(node.duration) }}s</span>
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
            {{ current.participants.length }} 人参战 · {{ current.deaths.length }} 次阵亡
          </div>
        </div>
        <span class="cn-result-badge" :class="current.result">{{ resultLabel(current.result) }}</span>
      </header>

      <div v-if="current.focus" class="cn-focus-card">
        <div class="cn-focus-head">
          <div>
            <span class="cn-focus-kicker">分析对象</span>
            <strong>{{ current.focus.heroName }}</strong>
            <small>{{ current.focus.playerName }} · {{ sideLabel(current.focus.side) }}</small>
          </div>
          <div class="cn-focus-kda">
            <span><b>{{ current.focus.kills }}</b>击杀</span>
            <span><b>{{ current.focus.assists }}</b>助攻</span>
            <span><b>{{ current.focus.deaths }}</b>阵亡</span>
          </div>
        </div>

        <div class="cn-focus-grid">
          <div><span>造成伤害</span><b>{{ damageLabel(current.focus.damage) }}</b></div>
          <div><span>承受伤害</span><b>{{ damageLabel(current.focus.taken) }}</b></div>
          <div><span>普攻</span><b>{{ current.focus.basicHits }} 次 / {{ compact(current.focus.basicDamage) }}</b></div>
          <div><span>治疗</span><b>{{ compact(current.focus.healing) }}</b></div>
          <div><span>HP</span><b>{{ hpText(current.focus) }}，最低 {{ pct(current.focus.hp.min) }}</b></div>
          <div><span>MP</span><b>{{ mpText(current.focus) }}，最低 {{ pct(current.focus.mp.min) }}</b></div>
          <div><span>金钱</span><b>{{ delta(current.focus.gold.delta) }}</b></div>
          <div><span>经验</span><b>{{ delta(current.focus.xp.delta) }}</b></div>
        </div>

        <div class="cn-chips">
          <span v-for="ability in current.focus.abilities" :key="ability.key" class="cn-chip">
            {{ ability.label }} ×{{ ability.count }}
          </span>
          <span v-for="item in current.focus.items" :key="item.key" class="cn-chip item">
            {{ item.label }} ×{{ item.count }}
          </span>
          <span v-if="!current.focus.abilities.length && !current.focus.items.length" class="cn-muted">无技能/物品记录</span>
        </div>
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
                <td>{{ row.actorHero }}<small>{{ row.actorName }}</small></td>
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
              <tr v-for="hero in sortedParticipants(current)" :key="hero.slot" :class="{ focus: hero.slot === current.focusSlot }">
                <td>
                  <span class="cn-hero">{{ hero.heroName }}</span>
                  <small>{{ hero.playerName }} · {{ sideLabel(hero.side) }}</small>
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
                  <span v-for="ability in hero.abilities.slice(0, 3)" :key="ability.key" class="cn-chip">
                    {{ ability.label }} ×{{ ability.count }}
                  </span>
                  <span v-for="item in hero.items.slice(0, 2)" :key="item.key" class="cn-chip item">
                    {{ item.label }} ×{{ item.count }}
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
          <small>只显示参战英雄事件</small>
        </div>
        <div class="cn-timeline">
          <div v-for="(event, index) in current.timeline" :key="index" class="cn-event" :class="event.kind.toLowerCase()">
            <span class="cn-event-time">{{ clock(event.t) }}</span>
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

.cn-list-head {
  padding: 0 4px 2px;
  color: var(--text-mute);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.cn-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'time type result'
    'role meta result';
  gap: 3px 7px;
  padding: 8px 9px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--dock-soft);
  color: var(--text);
  cursor: pointer;
}

.cn-item:hover {
  border-color: var(--line-strong);
}

.cn-item.on {
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.cn-time {
  grid-area: time;
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.cn-type {
  grid-area: type;
  align-self: center;
  color: var(--text-dim);
  font-size: 10px;
}

.cn-role {
  grid-area: role;
  width: fit-content;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--dock-soft-strong);
  color: var(--text-mute);
  font-size: 9px;
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
  font-size: 9.5px;
}

.cn-result {
  grid-area: result;
  align-self: center;
  color: var(--text-mute);
  font-size: 9px;
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
  font-size: 10px;
  font-weight: 400;
}

.cn-sub {
  margin-top: 2px;
  color: var(--text-mute);
  font-size: 10.5px;
}

.cn-result-badge {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--text-dim);
  font-size: 10px;
}

.cn-focus-card {
  margin-top: 10px;
  padding: 11px 12px;
  border: 1px solid var(--accent-line);
  border-radius: 10px;
  background: var(--accent-soft);
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
  font-size: 8px;
  letter-spacing: 0.12em;
}

.cn-focus-head strong {
  margin-right: 7px;
  font-size: 14px;
}

.cn-focus-head small {
  color: var(--text-mute);
  font-size: 10px;
}

.cn-focus-kda {
  display: flex;
  gap: 9px;
  color: var(--text-mute);
  font-size: 9.5px;
  white-space: nowrap;
}

.cn-focus-kda b {
  margin-right: 2px;
  color: var(--text);
  font-size: 14px;
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
  font-size: 9px;
}

.cn-focus-grid b {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: var(--text-dim);
  font-size: 10.5px;
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
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--dock-soft-strong);
  color: var(--text-dim);
  font-size: 9.5px;
  white-space: nowrap;
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
  font-size: 11px;
}

.cn-block-head small {
  color: var(--text-mute);
  font-size: 9px;
}

.cn-table-wrap {
  max-width: 100%;
  overflow-x: auto;
}

.cn-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
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
  font-size: 8.5px;
}

.cn-table tr.focus td {
  background: var(--accent-soft);
}

.cn-hero {
  display: block;
  color: var(--text);
  font-size: 10.5px;
  font-weight: 600;
}

.cn-heroes td {
  max-width: 220px;
}

.cn-hero-actions {
  white-space: normal;
}

.cn-hero-actions .cn-chip {
  display: inline-block;
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
  font-size: 10px;
}

.cn-event-time {
  flex: none;
  width: 35px;
  color: var(--text-mute);
  font-family: var(--mono);
  font-size: 9px;
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
  font-size: 9px;
}

.cn-event-value em {
  margin-left: 4px;
  color: var(--text-mute);
  font-style: normal;
}

.cn-muted {
  color: var(--text-mute);
  font-size: 10px;
}

.cn-empty {
  padding: 28px;
  color: var(--text-mute);
  font-size: 12px;
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
