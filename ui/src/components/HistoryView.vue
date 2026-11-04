<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { clearHistory, history, removeHistory, type HistoryItem } from '../lib/history'
import type { NamesIndex } from '../lib/names'

const props = defineProps<{ names?: NamesIndex | null }>()
const emit = defineEmits<{
  (e: 'open', item: HistoryItem): void
  (e: 'open-timeline', item: HistoryItem): void
}>()

function heroCn(item: HistoryItem): string {
  return props.names?.heroById.get(item.heroId)?.cn || item.heroName
}

function when(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<template>
  <section class="history card">
    <header class="head">
      <h2>
        <AppIcon name="clock" :size="17" />
        历史记录
        <span class="count">{{ history.length }}</span>
      </h2>
      <button v-if="history.length" class="btn btn-ghost clear" type="button" @click="clearHistory()">
        <AppIcon name="trash" :size="14" />
        清空
      </button>
    </header>

    <div v-if="!history.length" class="empty">
      <AppIcon name="clock" :size="26" />
      <p>还没有分析记录</p>
      <span>完成一次分析后，会自动保存在这里。</span>
    </div>

    <ul v-else class="list">
      <li v-for="item in history" :key="item.id" class="item" @click="emit('open', item)">
        <div class="row1">
          <span class="match">#{{ item.matchId }}</span>
          <span class="hero">{{ heroCn(item) }}</span>
          <span class="player">{{ item.playerName }}</span>
          <span class="depth" :class="item.depth">
            {{ item.depth === 'advanced' ? '高级' : '粗略' }}
          </span>
          <span class="time">{{ when(item.createdAt) }}</span>
        </div>
        <p class="snippet">{{ item.answer.replace(/[#*>`]/g, '').slice(0, 120) }}…</p>
        <div class="row2">
          <span class="model">{{ item.model }}</span>
          <div class="actions">
            <button
              v-if="item.depth === 'advanced'"
              class="timeline"
              type="button"
              title="查看历史分析的时间轴"
              @click.stop="emit('open-timeline', item)"
            >
              <AppIcon name="clock" :size="13" />
              时间轴
            </button>
            <button class="del" type="button" title="删除" @click.stop="removeHistory(item.id)">
              <AppIcon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.history {
  padding: 16px 20px 20px;
  flex: 1;
  min-height: 320px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.head h2 {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 650;
}

.count {
  height: 20px;
  min-width: 20px;
  padding: 0 6px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  font-size: 11px;
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.clear {
  height: 32px;
  font-size: 12px;
}

.empty {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-mute);
}

.empty p {
  font-size: 14px;
  color: var(--text-dim);
}

.empty span {
  font-size: 12px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--input-bg);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s;
}

.item:hover {
  border-color: var(--line-strong);
  background: var(--hover);
}

.row1 {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.match {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-mute);
}

.hero {
  font-size: 13.5px;
  font-weight: 600;
}

.player {
  font-size: 12px;
  color: var(--text-dim);
}

.depth {
  height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 10.5px;
  border: 1px solid var(--line);
  color: var(--text-mute);
}

.depth.advanced {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.time {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-mute);
}

.snippet {
  margin-top: 7px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
}

.model {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-mute);
}

.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline {
  height: 26px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--accent-line);
  border-radius: 7px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 11px;
  font-weight: 600;
}

.timeline:hover {
  border-color: var(--accent);
  background: var(--accent-soft-strong, var(--accent-soft));
}

.del {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-mute);
}

.del:hover {
  color: var(--dire);
  background: rgba(242, 109, 109, 0.12);
}
</style>
