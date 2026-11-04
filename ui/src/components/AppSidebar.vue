<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import ModelPicker from './ModelPicker.vue'

defineProps<{ active: string }>()
const emit = defineEmits<{
  (e: 'select', key: string): void
  (e: 'settings'): void
}>()

const items = [
  { key: 'assistant', label: '分析助手', icon: 'sparkle' },
  { key: 'history', label: '历史记录', icon: 'clock' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <BrandMark class="mark" :size="58" />
      <h1 class="brand-word name"><span class="ink">True</span><span class="accent">Sight</span></h1>
      <p class="brand-tagline tagline">Dota 2 Match Analyzer</p>
    </div>

    <nav class="nav">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="nav-item"
        :class="{ active: active === item.key }"
        @click="emit('select', item.key)"
      >
        <AppIcon :name="item.icon" :size="17" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="bottom">
      <ModelPicker @settings="emit('settings')" />

      <button class="settings-btn" type="button" @click="emit('settings')">
        <AppIcon name="settings" :size="16" />
        <span>设置</span>
      </button>

      <div class="credits">
        <a href="https://www.opendota.com" target="_blank" rel="noopener">Powered by OpenDota</a>
        <a href="https://stratz.com" target="_blank" rel="noopener">Powered by STRATZ</a>
        <span class="credit-note">Replay parsing by Clarity</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 26px 16px 20px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--line);
  backdrop-filter: blur(var(--sidebar-blur));
  z-index: 2;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mark {
  --mark-size: 58px;
}

.name {
  margin-top: 9px;
  font-size: 27px;
}

.tagline {
  margin-top: 7px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 34px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  height: 46px;
  padding: 0 15px;
  border-radius: 10px;
  color: var(--text-dim);
  font-size: 13.5px;
  text-align: left;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}

.nav-item:hover {
  background: var(--hover);
  color: var(--text);
}

.nav-item.active {
  color: var(--nav-text);
  background: var(--nav-grad);
  box-shadow: var(--nav-shadow);
}

.credits {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 8px;
}

.credits a {
  font-size: 11px;
  color: var(--text-mute);
  transition: color 0.16s;
}

.credits a:hover {
  color: var(--accent-hi);
}

.credit-note {
  font-size: 10px;
  color: var(--text-mute);
  opacity: 0.75;
}

.bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 11px;
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--text-dim);
  transition: background 0.16s, color 0.16s;
}

.settings-btn:hover {
  background: var(--hover);
  color: var(--text);
}

.settings-btn :deep(svg) {
  color: var(--text-mute);
}
</style>
