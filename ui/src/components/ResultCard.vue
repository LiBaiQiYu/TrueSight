<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { renderMarkdown } from '../lib/markdown'
import { buildNameTerms, decorateNames } from '../lib/rich-terms'
import type { Depth } from '../lib/config'
import type { NamesIndex } from '../lib/names'
import type { HeroInfo } from '../lib/heroes'

const props = defineProps<{
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'stopped' | 'error'
  answer: string
  reasoning: string
  error: string
  prompt: string
  system: string
  sources: string[]
  matchId: number | null
  heroName: string
  playerName: string
  depth: Depth
  model: string
  elapsed: number
  progress: number
  progressLabel: string
  names?: NamesIndex | null
  heroes?: Map<number, HeroInfo> | null
  heroIds?: number[]
  timelineReady?: boolean
}>()

const emit = defineEmits<{ (event: 'open-timeline'): void }>()

const tab = ref<'result' | 'thoughts'>('result')
const nameTerms = computed(() =>
  buildNameTerms(props.names ?? null, props.heroes ?? null, props.heroIds ?? null)
)
const rendered = computed(() =>
  decorateNames(renderMarkdown(props.answer || ''), nameTerms.value)
)
const busy = computed(() => props.status === 'loading' || props.status === 'streaming')

const reasonBox = ref<HTMLElement | null>(null)
const followReason = ref(true)

function onReasonScroll(): void {
  const el = reasonBox.value
  if (!el) return
  followReason.value = el.scrollHeight - el.scrollTop - el.clientHeight < 28
}

watch(
  () => props.reasoning,
  async (value, previous) => {
    if (!previous && value) followReason.value = true
    if (!followReason.value) return
    await nextTick()
    const el = reasonBox.value
    if (el) el.scrollTop = el.scrollHeight
  }
)

function switchTab(next: 'result' | 'thoughts'): void {
  if (next === 'thoughts' && !props.prompt) return
  tab.value = next
}
</script>

<template>
  <section class="result card">
    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ on: tab === 'result' }"
        @click="switchTab('result')"
      >
        <AppIcon name="chat" :size="16" />
        分析结果
      </button>
      <button
        type="button"
        class="tab"
        :class="{ on: tab === 'thoughts' }"
        :disabled="!prompt"
        @click="switchTab('thoughts')"
      >
        <AppIcon name="doc" :size="16" />
        分析思路
      </button>

      <button
        v-if="timelineReady"
        type="button"
        class="tab timeline-action"
        title="打开时间轴与对位数据"
        @click="emit('open-timeline')"
      >
        <AppIcon name="clock" :size="16" />
        时间轴
      </button>

      <div class="spacer" />

      <div v-if="matchId" class="meta">
        <span class="chip">#{{ matchId }}</span>
        <span v-if="heroName" class="chip">{{ heroName }}</span>
        <span v-if="playerName" class="chip">{{ playerName }}</span>
        <span class="chip accent">{{ depth === 'advanced' ? '高级分析' : '粗略分析' }}</span>
        <span v-for="s in sources" :key="s" class="chip src">{{ s }}</span>
        <span v-if="status === 'done'" class="chip ok">{{ elapsed.toFixed(1) }}s</span>
        <span v-if="status === 'stopped'" class="chip warn">已停止</span>
      </div>
    </div>

    <div v-if="tab === 'result'" class="pane">
      <div v-if="status === 'idle'" class="empty">
        <svg class="mascot" viewBox="0 0 120 110" aria-hidden="true">
          <ellipse cx="60" cy="98" rx="34" ry="6" fill="rgba(3, 20, 13, 0.4)" />
          <path
            d="M34 62c0-16 11-27 26-27s26 11 26 27v13c0 11-9 18-26 18s-26-7-26-18z"
            fill="var(--mascot-body)"
          />
          <path d="M60 35l14 24-14 34-14-34z" fill="rgba(255,255,255,0.16)" />
          <path d="M46 35l-6 24 14 10z" fill="rgba(4,47,31,0.22)" />
          <path d="M74 35l6 24-14 10z" fill="rgba(209,250,229,0.18)" />
          <path d="M40 34l-7-11 15 5zM80 34l7-11-15 5z" fill="var(--mascot-light)" />
          <circle cx="49" cy="58" r="5" fill="var(--mascot-ink)" />
          <circle cx="71" cy="58" r="5" fill="var(--mascot-ink)" />
          <circle cx="50.6" cy="56.4" r="1.6" fill="#fff" />
          <circle cx="72.6" cy="56.4" r="1.6" fill="#fff" />
          <path d="M52 70c3.4 3 12.6 3 16 0" stroke="var(--mascot-ink)" stroke-width="2.6" fill="none" stroke-linecap="round" />
          <path d="M26 76c-6 0-10-4-10-9s4-9 10-9" stroke="var(--mascot-light)" stroke-width="3" fill="none" />
          <g class="bubble">
            <rect x="84" y="18" width="30" height="22" rx="8" fill="var(--mascot-light)" />
            <path d="M92 40l-1 8 8-8z" fill="var(--mascot-light)" />
            <circle cx="94" cy="29" r="2" fill="var(--mascot-ink)" />
            <circle cx="100" cy="29" r="2" fill="var(--mascot-ink)" />
            <circle cx="106" cy="29" r="2" fill="var(--mascot-ink)" />
          </g>
        </svg>

        <p class="empty-title">选择比赛并点击「开始分析」</p>
        <p class="empty-sub">
          <span class="dash" />
          让 TrueSight 为你解析这场比赛吧！
          <span class="dash" />
        </p>
      </div>

      <div v-else class="answer-wrap">
        <div v-if="busy" class="progress">
          <div class="progress-info">
            <span>{{ progressLabel || (status === 'loading' ? '准备中…' : 'AI 正在分析…') }}</span>
            <span v-if="status === 'streaming'">{{ answer.length }} 字</span>
            <span v-else>{{ Math.round(progress * 100) }}%</span>
          </div>
          <div
            class="progress-track"
            :class="{ streaming: status === 'streaming', pending: status === 'loading' }"
          >
            <span :style="{ width: (status === 'streaming' ? 100 : progress * 100) + '%' }" />
          </div>
        </div>

        <div v-if="error" class="error">
          <AppIcon name="info" :size="16" />
          <span>{{ error }}</span>
        </div>

        <details v-if="reasoning" class="reasoning" :open="status === 'streaming'">
          <summary>
            <span>思考过程</span>
            <span class="reason-count">{{ reasoning.length }} 字</span>
          </summary>
          <pre ref="reasonBox" @scroll.passive="onReasonScroll">{{ reasoning }}</pre>
        </details>

        <article v-if="answer" class="markdown" v-html="rendered" />
        <div v-else-if="!busy && !error" class="placeholder">暂无内容</div>
      </div>
    </div>

    <div v-else class="pane thoughts">
      <div class="sources">
        <span class="thought-label">数据来源</span>
        <span v-for="s in sources" :key="s" class="src-chip">{{ s }}</span>
        <span v-if="!sources.length" class="muted">无</span>
      </div>

      <details open class="block">
        <summary>发送给模型的数据</summary>
        <pre>{{ prompt }}</pre>
      </details>

      <details class="block">
        <summary>系统提示词</summary>
        <pre>{{ system }}</pre>
      </details>
    </div>
  </section>
</template>

<style scoped>
.result {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 320px;
  overflow: hidden;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 14px;
  border-bottom: 1px solid var(--line);
  min-height: 52px;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--text-dim);
  border-bottom: 2px solid transparent;
  transition: color 0.16s, border-color 0.16s;
}

.tab:hover:not(:disabled) {
  color: var(--text);
}

.tab.on {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.tab:disabled {
  opacity: 0.4;
  cursor: default;
}

.spacer {
  flex: 1;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px 0;
}

.chip {
  height: 22px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
  color: var(--text-dim);
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.chip.accent {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.chip.src {
  font-family: var(--mono);
  font-size: 10px;
}

.chip.ok {
  color: var(--good-text);
  border-color: rgba(95, 208, 138, 0.35);
}

.chip.warn {
  color: var(--dock-warn, #fbbf24);
  border-color: rgba(251, 191, 36, 0.35);
}

.pane {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.empty {
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px 20px 34px;
}

.mascot {
  width: 128px;
  height: 118px;
  filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.35));
}


.bubble {
  animation: float 3.4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.empty-title {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text);
}

.empty-sub {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: var(--text-mute);
}

.dash {
  width: 42px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong));
}

.dash:last-child {
  background: linear-gradient(90deg, var(--line-strong), transparent);
}

.answer-wrap {
  padding: 14px 20px 22px;
}

.reasoning {
  margin: 0 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input-bg);
  overflow: hidden;
}

.reasoning summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-dim);
  user-select: none;
}

.reasoning summary:hover {
  color: var(--text);
}

.reason-count {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--text-mute);
}

.reasoning pre {
  margin: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--line);
  max-height: 220px;
  overflow: auto;
  font-family: var(--font);
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--text-mute);
  white-space: pre-wrap;
  word-break: break-word;
}

.progress {
  margin-bottom: 10px;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 11.5px;
  color: var(--text-mute);
}

.progress-track {
  height: 6px;
  border-radius: 99px;
  background: var(--input-bg);
  border: 1px solid var(--line);
  overflow: hidden;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--progress-grad);
  transition: width 0.3s ease;
}

.progress-track.pending span {
  animation: progress-pulse 1.6s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

.progress-track.streaming span {
  background: var(--progress-stream-grad);
  background-size: 200% 100%;
  animation: progress-flow 1.4s linear infinite;
}

@keyframes progress-flow {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.model {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-mute);
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
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--danger-text);
  background: rgba(242, 109, 109, 0.1);
  border: 1px solid rgba(242, 109, 109, 0.32);
}

.markdown {
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--text);
}

.markdown :deep(.rich-term) {
  display: inline;
  white-space: nowrap;
}

.markdown :deep(.rich-term img) {
  display: inline-block;
  width: 1.15em;
  height: 1.15em;
  margin-right: 2px;
  vertical-align: -0.18em;
  border-radius: 3px;
  object-fit: cover;
  border: 1px solid var(--line);
  background: var(--input-bg);
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3),
.markdown :deep(h4) {
  margin: 18px 0 8px;
  font-size: 15px;
  font-weight: 650;
}

.markdown :deep(h1:first-child),
.markdown :deep(h2:first-child),
.markdown :deep(h3:first-child) {
  margin-top: 0;
}

.markdown :deep(p) {
  margin: 7px 0;
}

.markdown :deep(ul),
.markdown :deep(ol) {
  margin: 7px 0;
  padding-left: 22px;
}

.markdown :deep(li) {
  margin: 3px 0;
}

.markdown :deep(strong) {
  color: var(--text);
  font-weight: 650;
}

.markdown :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 12px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.markdown :deep(pre) {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
  overflow: auto;
}

.markdown :deep(pre code) {
  border: 0;
  padding: 0;
  background: none;
}

.markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 12.5px;
}

.markdown :deep(th),
.markdown :deep(td) {
  padding: 6px 9px;
  border: 1px solid var(--line);
  text-align: left;
}

.markdown :deep(th) {
  background: var(--input-bg);
}

.markdown :deep(blockquote) {
  margin: 8px 0;
  padding-left: 12px;
  border-left: 2px solid var(--accent-line);
  color: var(--text-dim);
}

.markdown :deep(hr) {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 14px 0;
}

.placeholder {
  font-size: 12.5px;
  color: var(--text-mute);
}

.thoughts {
  padding: 14px 20px 22px;
}

.sources {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.thought-label {
  font-size: 12px;
  color: var(--text-dim);
}

.src-chip {
  height: 24px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.muted {
  font-size: 12px;
  color: var(--text-mute);
}

.block {
  margin-bottom: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input-bg);
  overflow: hidden;
}

.block summary {
  cursor: pointer;
  padding: 9px 12px;
  font-size: 12.5px;
  color: var(--text-dim);
  user-select: none;
}

.block summary:hover {
  color: var(--text);
}

.block pre {
  margin: 0;
  padding: 12px;
  border-top: 1px solid var(--line);
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--text-dim);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 360px;
  overflow: auto;
}
</style>
