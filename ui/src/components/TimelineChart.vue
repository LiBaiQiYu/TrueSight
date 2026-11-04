<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  type ChartDataset,
  type TooltipItem,
  type TooltipModel
} from 'chart.js'
import { config } from '../lib/config'
import type { ChartSeries } from '../lib/timeline'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

const props = withDefaults(
  defineProps<{
    series: ChartSeries[]
    durationSec: number
    cursorSec: number
    metricLabel: string
  }>(),
  { metricLabel: '' }
)

const emit = defineEmits<{ (event: 'seek', sec: number): void }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLElement | null>(null)
const tip = ref<HTMLElement | null>(null)
let chart: Chart | null = null

const minutes = computed(() => Math.max(1, Math.ceil(props.durationSec / 60)))

function short(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000) return `${(value / 1000).toFixed(1)}k`
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(Math.round(value))
}

function clock(sec: number): string {
  const total = Math.max(0, Math.round(sec))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function cssVar(name: string, fallback: string): string {
  const el = wrap.value
  if (!el) return fallback
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  return value || fallback
}

function buildData(): ChartDataset<'line'>[] {
  return props.series.map((item) => ({
    label: item.label,
    data: item.values
      .map((value, index) => (value == null ? null : { x: (index * (item.stepSec || 60)) / 60, y: value }))
      .filter((point): point is { x: number; y: number } => point != null),
    borderColor: item.color,
    backgroundColor: `${item.color}22`,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 3,
    pointHoverBackgroundColor: item.color,
    tension: 0.25,
    fill: false,
    spanGaps: true
  }))
}

const cursorPlugin = {
  id: 'truesightCursor',
  afterDatasetsDraw(instance: Chart) {
    const xScale = instance.scales.x
    if (!xScale) return
    const seconds = (instance as unknown as { _cursorSec?: number })._cursorSec ?? 0
    const x = xScale.getPixelForValue(Math.min(seconds / 60, xScale.max))
    const { top, bottom } = instance.chartArea
    const ctx = instance.ctx
    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([3, 3])
    ctx.lineWidth = 1
    ctx.strokeStyle = cssVar('--text-mute', 'rgba(148, 163, 184, 0.7)')
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.stroke()
    ctx.restore()
  }
}

Chart.register(cursorPlugin)

function valueText(value: number | null | undefined): string {
  if (value == null) return '—'
  return props.metricLabel.includes('补刀') ? String(Math.round(value)) : short(value)
}

/**
 * 自绘浮窗：Chart.js 原生 tooltip 只能画色块，这里换成 DOM，
 * 每一行显示「英雄头像 + 名称 + 数值」，并按数值从高到低排列。
 */
function externalTooltip(context: { chart: Chart; tooltip: TooltipModel<'line'> }): void {
  const el = tip.value
  if (!el) return
  const model = context.tooltip
  if (!model.opacity || !model.dataPoints?.length) {
    el.classList.remove('show')
    return
  }

  const rows = model.dataPoints
    .map((point) => ({ point, series: props.series[point.datasetIndex] }))
    .sort(
      (a, b) =>
        (b.point.parsed?.y ?? Number.NEGATIVE_INFINITY) -
        (a.point.parsed?.y ?? Number.NEGATIVE_INFINITY)
    )

  el.textContent = ''
  const title = document.createElement('div')
  title.className = 'tip-title'
  title.textContent = model.title?.[0] ?? ''
  el.appendChild(title)

  for (const { point, series } of rows) {
    const row = document.createElement('div')
    row.className = 'tip-row'

    if (series?.img) {
      const avatar = document.createElement('img')
      avatar.className = 'tip-avatar'
      avatar.src = series.img
      avatar.alt = ''
      avatar.draggable = false
      avatar.addEventListener('error', () => {
        avatar.style.visibility = 'hidden'
      })
      row.appendChild(avatar)
    } else {
      const dot = document.createElement('span')
      dot.className = 'tip-dot'
      dot.style.background = series?.color ?? 'var(--text-mute)'
      row.appendChild(dot)
    }

    const name = document.createElement('span')
    name.className = 'tip-name'
    name.textContent = series?.label ?? ''
    const value = document.createElement('b')
    value.className = 'tip-value'
    value.textContent = valueText(point.parsed?.y)
    row.appendChild(name)
    row.appendChild(value)
    el.appendChild(row)
  }

  el.classList.add('show')

  const parent = wrap.value
  const width = el.offsetWidth
  const height = el.offsetHeight
  const gap = 12
  let left = model.caretX + gap
  if (left + width > (parent?.clientWidth ?? 0) - 6) left = model.caretX - width - gap
  left = Math.max(6, left)
  const maxTop = (parent?.clientHeight ?? 0) - height - 6
  const top = Math.max(6, Math.min(model.caretY - height / 2, maxTop))
  el.style.left = `${left}px`
  el.style.top = `${top}px`
}

function createChart(): void {
  if (!canvas.value) return
  const tick = cssVar('--text-mute', '#94a3b8')
  const grid = cssVar('--line', 'rgba(148, 163, 184, 0.18)')
  const text = cssVar('--text-dim', '#cbd5e1')

  chart = new Chart(canvas.value, {
    type: 'line',
    data: { datasets: buildData() },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4, right: 6, bottom: 0, left: 0 } },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: minutes.value,
          grid: { color: grid, drawTicks: false },
          border: { color: grid },
          ticks: {
            color: tick,
            font: { size: 10 },
            maxTicksLimit: 10,
            stepSize: Math.max(1, Math.round(minutes.value / 8)),
            callback: (value) => `${value}m`
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: grid, drawTicks: false },
          border: { display: false },
          ticks: {
            color: tick,
            font: { size: 10 },
            maxTicksLimit: 5,
            callback: (value) => short(Number(value))
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: text,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 10,
            font: { size: 10 }
          }
        },
        tooltip: {
          // 自绘 HTML 浮窗（带英雄头像），关闭 canvas 原生绘制
          enabled: false,
          external: externalTooltip,
          backgroundColor: cssVar('--card-solid', 'rgba(15, 36, 26, 0.96)'),
          borderColor: grid,
          borderWidth: 1,
          titleColor: text,
          bodyColor: text,
          padding: 8,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          // 浮窗始终按当前时间点的数值从高到低排序
          itemSort: (a: TooltipItem<'line'>, b: TooltipItem<'line'>) =>
            (b.parsed?.y ?? Number.NEGATIVE_INFINITY) - (a.parsed?.y ?? Number.NEGATIVE_INFINITY),
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => {
              const x = items[0]?.parsed?.x ?? 0
              return clock(Number(x) * 60)
            },
            label: (item: TooltipItem<'line'>) => {
              const value = item.parsed.y
              if (value == null) return `${item.dataset.label}: —`
              const formatted = props.metricLabel.includes('补刀') ? String(Math.round(value)) : short(value)
              return `${item.dataset.label}: ${formatted}`
            }
          }
        }
      }
    }
  })
  ;(chart as unknown as { _cursorSec: number })._cursorSec = props.cursorSec
}

function updateCursor(): void {
  if (!chart) return
  ;(chart as unknown as { _cursorSec: number })._cursorSec = props.cursorSec
  chart.update('none')
}

function rebuild(): void {
  if (!chart) return
  tip.value?.classList.remove('show')
  chart.data.datasets = buildData()
  const x = chart.options.scales?.x
  if (x) x.max = minutes.value
  chart.update('none')
}

function onCanvasClick(event: MouseEvent): void {
  if (!chart || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const x = chart.scales.x.getValueForPixel(event.clientX - rect.left)
  if (x == null) return
  emit('seek', Math.max(0, Math.min(props.durationSec, Number(x) * 60)))
}

watch(
  () => props.series,
  () => rebuild(),
  { deep: true }
)

watch(
  () => props.durationSec,
  () => rebuild()
)

watch(
  () => props.cursorSec,
  () => updateCursor()
)

watch(
  () => [config.theme, config.mode] as const,
  () => {
    if (!chart) return
    chart.destroy()
    chart = null
    createChart()
  }
)

onMounted(() => {
  createChart()
  canvas.value?.addEventListener('click', onCanvasClick)
})

onBeforeUnmount(() => {
  canvas.value?.removeEventListener('click', onCanvasClick)
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div ref="wrap" class="chart">
    <div class="chart-head">
      <span class="label">{{ metricLabel }}走势</span>
      <span class="hint">点击图表跳转</span>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvas" />
      <div ref="tip" class="chart-tip" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
  min-height: 0;
}

.chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 2px;
}

.label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.hint {
  font-size: 9.5px;
  color: var(--text-mute);
}

.canvas-wrap {
  position: relative;
  height: var(--chart-h, 280px);
  min-width: 0;
  flex: 1 1 auto;
  min-height: 210px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  cursor: crosshair;
}

.chart-tip {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 6;
  min-width: 156px;
  max-width: 260px;
  padding: 7px 9px;
  border-radius: 8px;
  background: var(--card-solid);
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.12s ease;
}

.chart-tip.show {
  opacity: 1;
}

/* 浮窗内容由 Chart.js 回调动态创建，没有 scoped 属性，需用 :deep 命中 */
.chart-tip :deep(.tip-title) {
  margin-bottom: 3px;
  font-size: 10.5px;
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
}

.chart-tip :deep(.tip-row) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px 0;
}

.chart-tip :deep(.tip-avatar) {
  width: 16px;
  height: 16px;
  flex: none;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--line-strong);
}

.chart-tip :deep(.tip-dot) {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
}

.chart-tip :deep(.tip-name) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--text);
}

.chart-tip :deep(.tip-value) {
  flex: none;
  font-size: 11px;
  font-weight: 650;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
</style>
