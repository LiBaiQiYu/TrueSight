<script setup lang="ts">
import { computed, useId } from 'vue'
import markSvg from '../assets/brand-mark.svg?raw'

const props = withDefaults(defineProps<{ size?: number; glow?: boolean }>(), { glow: true })

const uid = 'b' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
const markup = markSvg.replace(/__UID__/g, uid)
const style = computed(() => (props.size ? { '--mark-size': `${props.size}px` } : {}))
</script>

<template>
  <span class="brand-mark" :class="{ 'is-glow': glow }" :style="style" aria-hidden="true" v-html="markup" />
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  flex: none;
  width: var(--mark-size, 64px);
  height: var(--mark-size, 64px);
  line-height: 0;
}

.brand-mark.is-glow {
  filter: drop-shadow(0 0 12px rgba(34, 220, 130, 0.4));
}

.brand-mark :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
