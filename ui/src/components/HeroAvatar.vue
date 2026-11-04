<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HeroInfo } from '../lib/heroes'

const props = withDefaults(
  defineProps<{
    hero?: HeroInfo
    size?: number
    selected?: boolean
    dim?: boolean
    round?: boolean
    title?: string
    clickable?: boolean
    placeholder?: boolean
  }>(),
  { size: 46, selected: false, dim: false, round: false, title: '', clickable: false, placeholder: false }
)

const failed = ref(false)
const initial = computed(() => (props.hero?.localized ?? '?').slice(0, 1))
const style = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
</script>

<template>
  <div
    class="avatar"
    :class="{ selected, dim, round, clickable }"
    :style="style"
    :title="title || hero?.localized || ''"
  >
    <img
      v-if="hero && !failed"
      :src="hero.img"
      :alt="hero.localized"
      loading="eager"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
    <svg v-else-if="placeholder" class="ghost" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4l10 6v12l-10 6-10-6V10z" fill="none" stroke="currentColor" stroke-width="1.4" />
      <circle cx="16" cy="16" r="3.4" fill="currentColor" opacity="0.55" />
    </svg>
    <span v-else class="fallback">{{ initial }}</span>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  flex: none;
  overflow: hidden;
  border-radius: 10px;
  background: var(--avatar-bg);
  border: 1px solid var(--line);
  transition: transform 0.16s, border-color 0.16s, box-shadow 0.16s, opacity 0.16s;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar.round {
  border-radius: 50%;
}

.avatar.fallback {
  display: grid;
  place-items: center;
}

.fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dim);
}

.ghost {
  width: 100%;
  height: 100%;
  padding: 26%;
  color: var(--text-mute);
  opacity: 0.55;
}

.avatar.clickable {
  cursor: pointer;
}

.avatar.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--accent-line);
}

.avatar.selected {
  border-color: var(--accent);
  box-shadow: var(--selected-glow);
}

.avatar.dim {
  opacity: 0.42;
  filter: grayscale(0.35);
}
</style>
