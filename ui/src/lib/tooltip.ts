import { reactive } from 'vue'
import type { ObjectDirective } from 'vue'

export type TipAccent = 'item' | 'neutral' | 'sold' | 'ability' | 'ultimate' | 'talent'

export interface TipContent {
  title: string
  lines?: string[]
  icon?: string
  accent?: TipAccent
}

type TipValue = TipContent | (() => TipContent) | null | undefined

interface TipState {
  visible: boolean
  x: number
  y: number
  content: TipContent | null
}

export const tipState = reactive<TipState>({
  visible: false,
  x: 0,
  y: 0,
  content: null
})

function resolve(value: TipValue): TipContent | null {
  if (!value) return null
  const content = typeof value === 'function' ? value() : value
  return content && content.title ? content : null
}

export function showTip(event: MouseEvent, value: TipValue): void {
  const content = resolve(value)
  if (!content) return
  tipState.content = content
  tipState.x = event.clientX
  tipState.y = event.clientY
  tipState.visible = true
}

export function moveTip(event: MouseEvent): void {
  if (!tipState.visible) return
  tipState.x = event.clientX
  tipState.y = event.clientY
}

export function hideTip(): void {
  tipState.visible = false
  tipState.content = null
}

interface TipRecord {
  value: TipValue
  enter: (event: MouseEvent) => void
  move: (event: MouseEvent) => void
  leave: () => void
}

const records = new WeakMap<HTMLElement, TipRecord>()

/** v-tip="content | () => content"：鼠标进入立即显示自绘浮窗，不使用原生 title。 */
export const vTip: ObjectDirective<HTMLElement, TipValue> = {
  mounted(el, binding) {
    const record: TipRecord = {
      value: binding.value,
      enter: (event) => showTip(event, record.value),
      move: (event) => moveTip(event),
      leave: () => hideTip()
    }
    records.set(el, record)
    el.addEventListener('mouseenter', record.enter)
    el.addEventListener('mousemove', record.move)
    el.addEventListener('mouseleave', record.leave)
  },
  updated(el, binding) {
    const record = records.get(el)
    if (record) record.value = binding.value
  },
  unmounted(el) {
    const record = records.get(el)
    if (!record) return
    el.removeEventListener('mouseenter', record.enter)
    el.removeEventListener('mousemove', record.move)
    el.removeEventListener('mouseleave', record.leave)
    records.delete(el)
    hideTip()
  }
}
