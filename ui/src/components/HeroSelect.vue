<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'

export interface HeroOption {
  value: number
  label: string
  meta?: string
  avatar?: string
  avatarFallback?: string
  side?: 'radiant' | 'dire'
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: number
    options: HeroOption[]
    label?: string
    placeholder?: string
  }>(),
  { label: '', placeholder: '选择英雄' }
)

const emit = defineEmits<{ (event: 'update:modelValue', value: number): void }>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const position = ref({ left: 0, top: 0, width: 280, up: false })

const selected = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? props.options[0]
)

const groups = computed(() => {
  const radiant = props.options.filter((option) => option.side === 'radiant')
  const dire = props.options.filter((option) => option.side === 'dire')
  const other = props.options.filter((option) => !option.side)
  return [
    { key: 'radiant', label: '天辉', options: radiant },
    { key: 'dire', label: '夜魇', options: dire },
    { key: 'other', label: '英雄', options: other }
  ].filter((group) => group.options.length > 0)
})

function place(): void {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const width = Math.max(260, Math.min(320, rect.width))
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const below = window.innerHeight - rect.bottom
  const up = below < 320 && rect.top > below
  const top = up ? Math.max(8, rect.top - 8) : rect.bottom + 8
  position.value = { left, top, width, up }
}

function openMenu(): void {
  if (open.value) return
  open.value = true
  nextTick(place)
}

function close(): void {
  open.value = false
}

function toggle(): void {
  if (open.value) close()
  else openMenu()
}

function choose(option: HeroOption): void {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  close()
  trigger.value?.focus()
}

function onDocumentPointer(event: MouseEvent): void {
  if (!open.value) return
  const target = event.target as Node | null
  if (trigger.value?.contains(target) || pop.value?.contains(target)) return
  close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

function onViewportChange(): void {
  if (open.value) place()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <div class="hero-select">
    <button
      ref="trigger"
      type="button"
      class="hs-trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <img
        v-if="selected?.avatar"
        class="hs-avatar"
        :src="selected.avatar"
        :data-fallback="selected.avatarFallback"
        alt=""
      />
      <span class="hs-text">
        <b>{{ selected?.label || placeholder }}</b>
        <small>{{ selected?.meta || '点击切换' }}</small>
      </span>
      <em v-if="label" class="hs-tag">{{ label }}</em>
      <AppIcon class="hs-chevron" name="chevronRight" :size="14" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="pop"
        class="hs-pop"
        :class="{ up: position.up }"
        :style="{ left: `${position.left}px`, top: `${position.top}px`, width: `${position.width}px` }"
        role="listbox"
        @click.stop
      >
        <div class="hs-head">
          <span>{{ label || '选择英雄' }}</span>
          <small>{{ options.length }} 名英雄</small>
        </div>

        <div class="hs-list">
          <template v-for="group in groups" :key="group.key">
            <div class="hs-group">{{ group.label }}</div>
            <button
              v-for="option in group.options"
              :key="option.value"
              type="button"
              class="hs-option"
              :class="{ on: option.value === modelValue, disabled: option.disabled }"
              :disabled="option.disabled"
              role="option"
              :aria-selected="option.value === modelValue"
              @click="choose(option)"
            >
              <img
                v-if="option.avatar"
                :src="option.avatar"
                :data-fallback="option.avatarFallback"
                alt=""
              />
              <span class="hs-option-text">
                <b>{{ option.label }}</b>
                <small>{{ option.meta || '' }}</small>
              </span>
              <span v-if="option.side" class="hs-side" :class="option.side">
                {{ option.side === 'radiant' ? '天辉' : '夜魇' }}
              </span>
              <AppIcon v-if="option.value === modelValue" name="check" :size="14" />
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hero-select {
  display: inline-flex;
  min-width: 0;
}

.hs-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  min-height: 44px;
  padding: 4px 9px 4px 11px;
  border: 1px solid var(--accent-line);
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s;
}

.hs-trigger:hover {
  border-color: var(--accent-hi);
  background: var(--hover);
}

.hs-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--accent-line);
}

.hs-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  line-height: 1.2;
}

.hs-text b {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.hs-text small {
  color: var(--text-mute);
  font-size: 9px;
}

.hs-tag {
  flex: none;
  padding: 1px 4px;
  border: 1px solid var(--accent-line);
  border-radius: 4px;
  color: var(--accent-text);
  font-size: 8px;
  font-style: normal;
  line-height: 12px;
}

.hs-chevron {
  flex: none;
  color: var(--text-mute);
  transform: rotate(90deg);
}

.hs-pop {
  position: fixed;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  max-height: 360px;
  padding: 6px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: var(--card-solid);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
  transform: translateY(0);
}

.hs-pop.up {
  transform: translateY(-100%);
}

.hs-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 7px 7px;
  color: var(--text-dim);
  font-size: 10px;
}

.hs-head small {
  color: var(--text-mute);
  font-size: 9px;
}

.hs-list {
  overflow: auto;
  overscroll-behavior: contain;
}

.hs-group {
  padding: 5px 7px 3px;
  color: var(--text-mute);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.hs-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 7px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.hs-option:hover,
.hs-option.on {
  background: var(--accent-soft);
  color: var(--text);
}

.hs-option.disabled {
  opacity: 0.4;
  cursor: default;
}

.hs-option img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
}

.hs-option-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.hs-option-text b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 550;
}

.hs-option-text small {
  color: var(--text-mute);
  font-size: 9px;
}

.hs-side {
  margin-left: auto;
  flex: none;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 8px;
  line-height: 12px;
}

.hs-side.radiant {
  color: var(--radiant);
  background: var(--hover);
}

.hs-side.dire {
  color: var(--dire);
  background: var(--hover);
}

.hs-option.on :deep(svg) {
  color: var(--accent-text);
}
</style>
