<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { NamesIndex } from '../lib/names'
import type { FightAbsentee, FightParticipant, TeamfightInfo } from '../lib/teamfights'

const props = defineProps<{
  fights: TeamfightInfo[]
  names: NamesIndex | null
}>()

const selected = ref(0)

watch(
  () => props.fights,
  () => {
    selected.value = Math.min(selected.value, Math.max(0, props.fights.length - 1))
  }
)

const current = computed(() => props.fights[selected.value] ?? null)

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function compact(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(Math.round(value))
}

function winnerText(fight: TeamfightInfo): string {
  return fight.winner === 'radiant' ? '天辉胜' : fight.winner === 'dire' ? '夜魇胜' : '均势'
}

function statusClass(entry: FightAbsentee): string {
  return entry.status
}

function sortedParticipants(fight: TeamfightInfo, side: 'radiant' | 'dire'): FightParticipant[] {
  return fight.participants
    .filter((row) => row.side === side)
    .sort((a, b) => b.damage - a.damage)
}

function sideLabel(side: 'radiant' | 'dire'): string {
  return side === 'radiant' ? '天辉' : '夜魇'
}

function absenteeSide(entry: FightAbsentee): string {
  return sideLabel(entry.side)
}
</script>

<template>
  <div class="tf">
    <div v-if="!fights.length" class="tf-empty">
      <b>没有 6 人以上的团战</b>
      <p>本场没有检测到至少 6 名玩家参与的大规模团战，或缺少 OpenDota 团战数据。</p>
    </div>

    <template v-else>
      <aside class="tf-list">
        <div class="tf-list-head">大规模团战</div>
        <button
          v-for="(fight, index) in fights"
          :key="fight.index"
          type="button"
          class="tf-item"
          :class="{ on: index === selected }"
          @click="selected = index"
        >
          <span class="tf-time">{{ clock(fight.start) }}</span>
          <span class="tf-meta">{{ fight.participantCount }} 人 · {{ Math.round(fight.duration) }}s</span>
          <span class="tf-badge" :class="fight.winner">{{ winnerText(fight) }}</span>
        </button>
      </aside>

      <section v-if="current" class="tf-detail">
        <header class="tf-head">
          <div>
            <div class="tf-title">
              {{ clock(current.start) }} – {{ clock(current.end) }}
              <span class="tf-dur">{{ Math.round(current.duration) }} 秒</span>
            </div>
            <div class="tf-sub">
              {{ current.participantCount }} 人参团 · 天辉 {{ current.totals.radiant.kills }} /
              {{ current.totals.radiant.deaths }} · 夜魇 {{ current.totals.dire.kills }} /
              {{ current.totals.dire.deaths }} · 经济差
              {{ compact(current.totals.radiant.gold - current.totals.dire.gold) }} · 经验差
              {{ compact(current.totals.radiant.xp - current.totals.dire.xp) }}
            </div>
          </div>
          <span class="tf-result" :class="current.winner">{{ winnerText(current) }}</span>
        </header>

        <div class="tf-totals">
          <div class="tf-side radiant">
            <span class="tf-side-label">天辉</span>
            <div class="tf-stats">
              <span><b>{{ current.totals.radiant.kills }}</b>击杀</span>
              <span><b>{{ current.totals.radiant.deaths }}</b>死亡</span>
              <span><b>{{ compact(current.totals.radiant.damage) }}</b>伤害</span>
              <span><b>{{ compact(current.totals.radiant.gold) }}</b>经济</span>
              <span><b>{{ compact(current.totals.radiant.xp) }}</b>经验</span>
            </div>
          </div>
          <div class="tf-side dire">
            <span class="tf-side-label">夜魇</span>
            <div class="tf-stats">
              <span><b>{{ current.totals.dire.kills }}</b>击杀</span>
              <span><b>{{ current.totals.dire.deaths }}</b>死亡</span>
              <span><b>{{ compact(current.totals.dire.damage) }}</b>伤害</span>
              <span><b>{{ compact(current.totals.dire.gold) }}</b>经济</span>
              <span><b>{{ compact(current.totals.dire.xp) }}</b>经验</span>
            </div>
          </div>
        </div>

        <div class="tf-block">
          <div class="tf-block-title">参团玩家</div>
          <table class="tf-table">
            <thead>
              <tr>
                <th>玩家</th>
                <th>伤害</th>
                <th>治疗</th>
                <th>击杀/死亡</th>
                <th>经济</th>
                <th>经验</th>
                <th>关键技能</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="side in (['radiant', 'dire'] as const)" :key="side">
                <tr class="tf-side-row">
                  <td :colspan="7">{{ sideLabel(side) }}</td>
                </tr>
                <tr v-for="row in sortedParticipants(current, side)" :key="row.slot">
                  <td>
                    <span class="tf-hero">{{ row.heroName }}</span>
                    <span class="tf-player">{{ row.playerName }}</span>
                  </td>
                  <td>{{ compact(row.damage) }}</td>
                  <td>{{ compact(row.healing) }}</td>
                  <td>{{ row.kills }} / {{ row.deaths }}</td>
                  <td>{{ compact(row.gold) }}</td>
                  <td>{{ compact(row.xp) }}</td>
                  <td class="tf-abilities">
                    <span v-for="ability in row.abilities.slice(0, 3)" :key="ability.key" class="tf-chip">
                      {{ ability.label }} ×{{ ability.count }}
                    </span>
                    <span v-for="item in row.items.slice(0, 2)" :key="item.key" class="tf-chip item">
                      {{ item.label }} ×{{ item.count }}
                    </span>
                    <span v-if="!row.abilities.length && !row.items.length" class="tf-muted">—</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="current.absentees.length" class="tf-block">
          <div class="tf-block-title">没来团战的玩家（{{ current.absentees.length }}）</div>
          <div class="tf-absentees">
            <article v-for="entry in current.absentees" :key="entry.slot" class="tf-absentee" :class="statusClass(entry)">
              <header>
                <span class="tf-hero">{{ entry.heroName }}</span>
                <span class="tf-player">{{ entry.playerName }} · {{ absenteeSide(entry) }}</span>
                <span class="tf-status">{{ entry.statusLabel }}</span>
              </header>
              <div class="tf-absentee-meta">
                <span>
                  距战场
                  {{
                    entry.distance == null
                      ? '未知'
                      : `${entry.direction ? entry.direction + ' ' : ''}${Math.round(entry.distance)} 格`
                  }}
                </span>
                <span>补刀 +{{ entry.lastHits }}</span>
                <span>经济 +{{ entry.gold }}</span>
                <span>经验 +{{ entry.xp }}</span>
              </div>
              <div v-if="entry.purchases.length" class="tf-purchases">
                <span class="tf-muted">期间购买：</span>
                <span v-for="purchase in entry.purchases.slice(0, 3)" :key="purchase.key" class="tf-chip">
                  {{ purchase.label }}
                </span>
              </div>
              <div class="tf-verdict">
                <div v-if="entry.pros.length" class="tf-pros">
                  <span class="tf-verdict-label">利</span>
                  <ul>
                    <li v-for="(note, index) in entry.pros" :key="index">{{ note }}</li>
                  </ul>
                </div>
                <div v-if="entry.cons.length" class="tf-cons">
                  <span class="tf-verdict-label">弊</span>
                  <ul>
                    <li v-for="(note, index) in entry.cons" :key="index">{{ note }}</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-else class="tf-block">
          <div class="tf-block-title">没人缺席</div>
          <p class="tf-muted">10 人全部参与了这次团战。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.tf {
  display: flex;
  gap: 14px;
  padding-top: 14px;
  min-height: 0;
}

.tf-empty {
  padding: 28px;
  color: var(--text-mute);
  font-size: 12px;
}

.tf-empty b {
  color: var(--text);
  font-size: 14px;
}

.tf-list {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tf-list-head {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-mute);
  padding: 0 4px 2px;
}

.tf-item {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: 'time badge' 'meta badge';
  gap: 2px 8px;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--dock-soft);
  color: var(--text);
  cursor: pointer;
}

.tf-item.on {
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.tf-time {
  grid-area: time;
  font-size: 14px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.tf-meta {
  grid-area: meta;
  font-size: 10px;
  color: var(--text-mute);
}

.tf-badge,
.tf-result {
  grid-area: badge;
  align-self: center;
  justify-self: end;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  color: var(--text-dim);
  white-space: nowrap;
}

.tf-badge.radiant,
.tf-result.radiant {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.tf-badge.dire,
.tf-result.dire {
  color: var(--dock-warn);
  border-color: var(--dock-warn-line);
  background: rgba(251, 191, 36, 0.08);
}

.tf-detail {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tf-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.tf-title {
  font-size: 18px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.tf-dur {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-mute);
  margin-left: 6px;
}

.tf-sub {
  font-size: 11px;
  color: var(--text-mute);
  margin-top: 2px;
}

.tf-totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tf-side {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--dock-soft);
}

.tf-side.radiant {
  border-color: var(--accent-line);
}

.tf-side.dire {
  border-color: var(--dock-warn-line);
}

.tf-side-label {
  font-size: 10px;
  color: var(--text-mute);
}

.tf-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-mute);
}

.tf-stats b {
  font-size: 13px;
  color: var(--text);
  margin-right: 3px;
}

.tf-block {
  border-top: 1px solid var(--line);
  padding-top: 8px;
}

.tf-block-title {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.tf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.tf-table th {
  text-align: left;
  font-weight: 500;
  color: var(--text-mute);
  padding: 4px 6px;
  border-bottom: 1px solid var(--line);
}

.tf-table td {
  padding: 5px 6px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.tf-side-row td {
  font-size: 10px;
  color: var(--text-mute);
  background: var(--dock-soft);
  padding-top: 7px;
}

.tf-hero {
  display: block;
  font-weight: 600;
  color: var(--text);
}

.tf-player {
  display: block;
  font-size: 10px;
  color: var(--text-mute);
}

.tf-abilities {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.tf-chip.item {
  color: var(--dock-warn);
  background: rgba(251, 191, 36, 0.1);
}

.tf-chip {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--dock-soft-strong);
  color: var(--text-dim);
  white-space: nowrap;
}

.tf-absentees {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
}

.tf-absentee {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--dock-soft);
}

.tf-absentee header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.tf-status {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--dock-soft-strong);
  color: var(--text-dim);
}

.tf-absentee.dead .tf-status {
  color: var(--dock-warn);
  background: var(--dock-warn-line);
}

.tf-absentee.farming .tf-status {
  color: var(--accent-text);
  background: var(--accent-soft);
}

.tf-absentee-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 5px;
  font-size: 10px;
  color: var(--text-mute);
}

.tf-purchases {
  margin-top: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
}

.tf-verdict {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 7px;
  font-size: 10.5px;
  line-height: 1.55;
}

.tf-pros,
.tf-cons {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.tf-verdict-label {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
}

.tf-pros .tf-verdict-label {
  color: var(--accent-text);
  background: var(--accent-soft);
}

.tf-cons .tf-verdict-label {
  color: var(--dock-warn);
  background: var(--dock-warn-line);
}

.tf-verdict ul {
  margin: 0;
  padding-left: 14px;
  color: var(--text-dim);
}

.tf-muted {
  color: var(--text-mute);
  font-size: 10.5px;
}
</style>
