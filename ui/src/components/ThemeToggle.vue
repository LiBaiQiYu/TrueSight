<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { config } from '../lib/config'

function setLight(): void {
  if (config.mode !== 'light') config.mode = 'light'
}

function setDark(): void {
  if (config.mode !== 'dark') config.mode = 'dark'
}
</script>

<template>
  <div class="toggle" role="group" aria-label="明暗切换">
    <button
      type="button"
      class="opt"
      :class="{ on: config.mode === 'light' }"
      title="浅色模式"
      @click="setLight"
    >
      <AppIcon name="sun" :size="16" />
    </button>
    <button
      type="button"
      class="opt"
      :class="{ on: config.mode === 'dark' }"
      title="深色模式"
      @click="setDark"
    >
      <AppIcon name="moon" :size="15" />
    </button>
  </div>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: var(--toggle-bg);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.opt {
  width: 34px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--text-mute);
  transition: background 0.18s, color 0.18s;
}

.opt:hover {
  color: var(--text);
}

.opt.on {
  color: #fff;
  background: var(--accent);
  box-shadow: var(--seg-shadow);
}
</style>
