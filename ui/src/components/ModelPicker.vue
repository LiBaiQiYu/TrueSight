<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { config, defaultLevel } from '../lib/config'
import { hasApiKey, levelsFor, modelState, refreshModels } from '../lib/models'

const emit = defineEmits<{ (e: 'settings'): void }>()

const open = ref(false)
const view = ref<'reason' | 'models'>('reason')
const root = ref<HTMLElement | null>(null)

const ready = computed(() => modelState.list.length > 0)
const levels = computed(() => levelsFor(config.model))
const index = computed(() => {
  const i = levels.value.indexOf(config.effortLevel)
  return i < 0 ? 0 : i
})
const single = computed(() => levels.value.length <= 1)
const fraction = computed(() => {
  const n = levels.value.length
  if (n <= 1) return 0
  return index.value / (n - 1)
})
const fillStyle = computed(() => ({
  left: '12px',
  width: `calc((100% - 24px) * ${fraction.value})`
}))
const isMax = computed(
  () => ready.value && levels.value.length > 0 && index.value === levels.value.length - 1
)
const levelTitle = computed(() => (ready.value ? levels.value[index.value] ?? '' : '—'))
const hint = computed(() =>
  !hasApiKey.value
    ? '先在设置里填写 API Key'
    : !ready.value && modelState.loading
      ? '正在获取模型…'
      : !ready.value
        ? '暂无可用模型'
        : isMax.value
          ? '使用额度消耗更快'
          : '档位：' + levels.value.join(' / ')
)

const particles = computed(() =>
  Array.from({ length: 18 }, (_, i) => ({
    left: (i * 29 + 7) % 100,
    delay: ((i * 17) % 24) / 10,
    duration: 1.2 + ((i * 7) % 10) / 10,
    size: 2 + (i % 3)
  }))
)

function stopPct(i: number): string {
  const n = levels.value.length
  const fraction = n <= 1 ? 0 : i / (n - 1)
  return `calc(12px + (100% - 24px) * ${fraction})`
}

function onSlide(event: Event): void {
  const i = Number((event.target as HTMLInputElement).value)
  const level = levels.value[i]
  if (level) config.effortLevel = level
}

function resetLevel(): void {
  config.effortLevel = defaultLevel(levels.value)
}

function choose(model: string): void {
  config.model = model
  view.value = 'reason'
}

function toggle(): void {
  if (!open.value) view.value = 'reason'
  open.value = !open.value
}

function goSettings(): void {
  open.value = false
  emit('settings')
}

function onDocClick(event: MouseEvent): void {
  if (!open.value) return
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div ref="root" class="picker">
    <div v-if="open" class="pop">
      <div v-if="!hasApiKey" class="pop-head">
        <span>选择模型</span>
        <button class="icon-btn" type="button" title="刷新模型" disabled>
          <AppIcon name="refresh" :size="13" />
        </button>
      </div>

      <div v-if="!hasApiKey" class="need-key">
        <p>还没有配置 API Key</p>
        <button class="btn btn-primary" type="button" @click="goSettings">去设置</button>
      </div>

      <template v-else-if="view === 'reason'">
        <div class="pop-head">
          <span>推理级别</span>
          <button
            class="icon-btn"
            type="button"
            title="重置档位"
            :disabled="!ready"
            @click="resetLevel"
          >
            <AppIcon name="refresh" :size="13" />
          </button>
        </div>

        <div class="reason">
          <div class="reason-head">
            <span class="level" :class="{ maxed: isMax }">{{ levelTitle }}</span>
            <button class="model-link" type="button" @click="view = 'models'">
              <span class="model-name">{{ config.model || '未选择模型' }}</span>
              <AppIcon name="chevronRight" :size="12" class="model-chev" />
            </button>
          </div>

          <div class="slider-wrap" :class="{ maxed: isMax, disabled: !ready }">
            <div class="track">
              <span class="rail" />
              <span class="fill" :class="{ maxed: isMax }" :style="fillStyle" />
              <span v-if="isMax" class="sparkles" :style="fillStyle">
                <b
                  v-for="(p, i) in particles"
                  :key="i"
                  :style="{
                    left: p.left + '%',
                    animationDelay: p.delay + 's',
                    animationDuration: p.duration + 's',
                    width: p.size + 'px',
                    height: p.size + 'px'
                  }"
                />
              </span>
              <i
                v-for="(lv, i) in levels"
                :key="lv"
                class="stop"
                :class="{ on: i <= index }"
                :style="{ left: stopPct(i) }"
              />
              <input
                v-if="!single"
                class="range"
                type="range"
                min="0"
                :max="levels.length - 1"
                step="1"
                :value="index"
                :disabled="!ready"
                @input="onSlide"
              />
            </div>
          </div>

          <p class="hint" :class="{ warn: isMax }">{{ hint }}</p>
          <p v-if="modelState.error" class="err">{{ modelState.error }}</p>
        </div>
      </template>

      <template v-else>
        <div class="pop-head">
          <button class="back" type="button" title="返回" @click="view = 'reason'">
            <AppIcon name="chevronRight" :size="13" />
          </button>
          <span class="head-title">选择模型</span>
          <button
            class="icon-btn"
            type="button"
            title="刷新模型"
            :disabled="modelState.loading"
            @click="refreshModels"
          >
            <AppIcon name="refresh" :size="13" :class="{ spin: modelState.loading }" />
          </button>
        </div>

        <div class="list">
          <button
            v-for="m in modelState.list"
            :key="m"
            type="button"
            class="row"
            :class="{ on: m === config.model }"
            @click="choose(m)"
          >
            <span class="row-name">{{ m }}</span>
            <AppIcon v-if="m === config.model" name="check" :size="15" class="tick" />
          </button>
          <p v-if="modelState.loading && !modelState.list.length" class="empty">获取模型…</p>
          <p v-if="!modelState.loading && !modelState.list.length" class="empty">暂无可用模型</p>
        </div>
      </template>
    </div>

    <button type="button" class="pill" :class="{ open }" @click="toggle">
      <span class="pill-model">{{ config.model || '选择模型' }}</span>
      <span v-if="ready" class="pill-level" :class="{ maxed: isMax }">{{ levelTitle }}</span>
      <AppIcon name="chevronRight" :size="13" class="chev" />
    </button>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
}

.pill {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  height: 38px;
  padding: 0 11px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--line);
  transition: border-color 0.16s, background 0.16s;
}

.pill:hover {
  border-color: var(--line-strong);
  background: var(--hover);
}

.pill.open {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.pill-model {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 12.5px;
}

.pill-level {
  flex: none;
  font-size: 11.5px;
  font-weight: 650;
  color: var(--accent-text);
}

.pill-level.maxed {
  background: var(--slider-text-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.chev {
  flex: none;
  color: var(--text-mute);
  transform: rotate(-90deg);
}

.pill.open .chev {
  transform: rotate(90deg);
}

.pop {
  position: absolute;
  left: 0;
  bottom: calc(100% + 10px);
  width: 332px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 14px;
  background: var(--card-solid);
  border: 1px solid var(--line-strong);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  z-index: 80;
}

.pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-mute);
  margin-bottom: 8px;
}

.icon-btn {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-mute);
}

.icon-btn:hover:not(:disabled) {
  color: var(--text);
  background: var(--hover);
}

.need-key {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 6px;
  font-size: 12.5px;
  color: var(--text-dim);
}

.reason {
  padding: 2px 2px 6px;
}

.reason-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}

.level {
  font-size: 15px;
  font-weight: 700;
}

:root[data-theme="standard"] .level:not(.maxed) {
  color: var(--accent);
}

.level.maxed {
  background: var(--slider-text-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.model-link {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 0;
  text-align: left;
  font-size: 11.5px;
  color: var(--text-mute);
}

.model-link:hover {
  color: var(--text);
}

.model-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-chev {
  flex: none;
  opacity: 0.7;
}

.back {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-mute);
  transform: rotate(180deg);
}

.back:hover {
  color: var(--text);
  background: var(--hover);
}

.head-title {
  margin-right: auto;
}

.slider-wrap {
  padding: 2px 0;
}

.slider-wrap.disabled {
  opacity: 0.5;
}

.track {
  position: relative;
  height: 18px;
  border-radius: 999px;
}

.rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 12px;
  right: 12px;
  border-radius: 999px;
  background: var(--line);
}

.fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: var(--slider-grad);
  box-shadow: 0 0 12px var(--slider-glow);
  transition: width 0.18s ease;
}

.fill.maxed {
  background-image: var(--slider-max-grad);
  background-size: 200% 100%;
  background-repeat: repeat-x;
  animation: flow 4s linear infinite;
  box-shadow: var(--slider-max-glow);
}

@keyframes flow {
  from {
    background-position: 0% 50%;
  }
  to {
    background-position: 200% 50%;
  }
}

.sparkles {
  position: absolute;
  left: 0;
  top: -8px;
  bottom: -8px;
  border-radius: 999px;
  pointer-events: none;
}

.sparkles b {
  position: absolute;
  bottom: 4px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  box-shadow: var(--sparkle-glow);
  animation-name: rise;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0) scale(0.4);
    opacity: 0;
  }
  22% {
    opacity: 0.95;
  }
  65% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-16px) scale(1.05);
    opacity: 0;
  }
}

.stop {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--stop);
  pointer-events: none;
}

.stop.on {
  background: rgba(255, 255, 255, 0.85);
}

.range {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 26px;
  margin: 0;
  transform: translateY(-50%);
  appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.range:disabled {
  cursor: default;
}

.range::-webkit-slider-runnable-track {
  height: 18px;
  background: transparent;
}

.range::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -3px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.slider-wrap.maxed .range::-webkit-slider-thumb {
  box-shadow: var(--thumb-glow);
}

.range::-moz-range-track {
  height: 18px;
  background: transparent;
  border: 0;
}

.range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.hint {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-mute);
}

.hint.warn {
  color: var(--accent-text);
}

.err {
  margin-top: 5px;
  font-size: 11px;
  color: var(--dire);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.divider {
  height: 1px;
  margin: 8px -12px;
  background: var(--line);
}

.list {
  overflow-y: auto;
  max-height: 280px;
  padding-right: 2px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 8px;
  border-radius: 8px;
  text-align: left;
  font-size: 13px;
  color: var(--text);
}

.row:hover {
  background: var(--hover);
}

.row.on {
  background: var(--accent-soft);
}

.row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tick {
  color: var(--accent);
}

.empty {
  padding: 14px 8px;
  text-align: center;
  font-size: 12px;
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
</style>
