<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { hideTip, tipState } from '../lib/tooltip'

const content = computed(() => tipState.content)
const accent = computed(() => content.value?.accent ?? 'item')

const style = computed(() => {
  const margin = 8
  const width = 300
  const x = tipState.x + 14
  const left = x + width > window.innerWidth - margin ? tipState.x - width - 14 : x
  const top = Math.min(tipState.y + 16, window.innerHeight - 90)
  return {
    left: `${Math.max(margin, left)}px`,
    top: `${Math.max(margin, top)}px`
  }
})

function hideIcon(event: Event): void {
  const target = event.target as HTMLImageElement | null
  if (target) target.style.display = 'none'
}

function onScroll(): void {
  hideTip()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('blur', hideTip)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('blur', hideTip)
  hideTip()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="tipState.visible && content"
      class="tip"
      :class="[`accent-${accent}`, { 'no-icon': !content.icon }]"
      :style="style"
      role="tooltip"
    >
      <img v-if="content.icon" :src="content.icon" alt="" @error="hideIcon" />
      <div class="tip-body">
        <div class="tip-title">{{ content.title }}</div>
        <div v-for="(line, index) in content.lines ?? []" :key="index" class="tip-line">{{ line }}</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tip {
  position: fixed;
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 300px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: var(--card-solid);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  pointer-events: none;
  animation: tip-in 0.06s ease-out;
}

.tip.no-icon {
  padding-left: 10px;
}

.tip img {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--line);
  object-fit: cover;
}

.tip-body {
  min-width: 0;
}

.tip-title {
  font-size: 12px;
  font-weight: 650;
  line-height: 1.3;
  color: var(--text);
  white-space: normal;
  word-break: break-word;
}

.tip-line {
  margin-top: 2px;
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--text-mute);
  white-space: normal;
  word-break: break-word;
}

.tip.accent-neutral,
.tip.accent-ultimate {
  border-color: rgba(245, 158, 11, 0.65);
}

.tip.accent-ultimate {
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.14), var(--shadow);
}

.tip.accent-ability {
  border-color: var(--accent-line);
}

.tip.accent-talent {
  border-color: rgba(253, 230, 138, 0.34);
}

.tip.accent-sold {
  border-color: rgba(248, 113, 113, 0.4);
}

@keyframes tip-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
