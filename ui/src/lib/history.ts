import { ref } from 'vue'
import type { Depth } from './config'

export interface HistoryItem {
  id: string
  createdAt: number
  matchId: number
  heroId: number
  heroName: string
  playerName: string
  depth: Depth
  model: string
  answer: string
}

const KEY = 'truesight.history.v1'
const MAX = 40

function load(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export const history = ref<HistoryItem[]>(load())

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(history.value))
  } catch {
    /* ignore */
  }
}

export function addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const entry: HistoryItem = {
    ...item,
    id: 'h-' + Date.now().toString(36),
    createdAt: Date.now()
  }
  history.value = [entry, ...history.value].slice(0, MAX)
  persist()
  return entry
}

export function removeHistory(id: string): void {
  history.value = history.value.filter((item) => item.id !== id)
  persist()
}

export function clearHistory(): void {
  history.value = []
  persist()
}
