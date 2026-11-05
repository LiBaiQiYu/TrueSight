import { computed, reactive, watch } from 'vue'
import {
  activeApiKey,
  activeBaseUrl,
  config,
  defaultLevel,
  PROVIDERS
} from './config'

export interface ModelMeta {
  efforts: string[]
  supported: boolean
}

interface ApiModel {
  id?: string
  capabilities?: {
    reasoning?: { supported?: boolean; effort?: string[]; toggle?: boolean }
  }
}

export const modelState = reactive({
  list: [] as string[],
  meta: {} as Record<string, ModelMeta>,
  loading: false,
  error: ''
})

let seq = 0
let timer: number | undefined

export const hasApiKey = computed(() => normalizeKey(activeApiKey()).key.length > 0)

export function normalizeKey(raw: string): { key: string; error: string } {
  const key = raw.replace(/[\u200b-\u200d\ufeff]/g, '').trim()
  let index = 0
  for (const ch of key) {
    index += 1
    const code = ch.codePointAt(0) ?? 0
    if (code < 32 || code > 126) {
      return {
        key,
        error: `API Key 第 ${index} 个字符不是 ASCII（${ch}），请重新复制粘贴`
      }
    }
  }
  return { key, error: '' }
}

function clearModels(): void {
  modelState.list = []
  modelState.meta = {}
  config.model = ''
}

function useStaticModels(models: string[]): void {
  const list = [...models]
  modelState.list = list
  modelState.meta = {}
  modelState.error = ''
  modelState.loading = false
  if (!config.model || !list.includes(config.model)) {
    config.model = list[0] ?? ''
  }
}

export async function refreshModels(): Promise<void> {
  const provider = PROVIDERS[config.provider]
  const { key, error } = normalizeKey(activeApiKey())
  const current = ++seq
  modelState.error = ''
  if (error) {
    modelState.error = error
    clearModels()
    modelState.loading = false
    return
  }
  if (!key) {
    clearModels()
    modelState.loading = false
    return
  }
  // MiniMax 等内置模型清单：不依赖 /v1/models（该接口在 MiniMax 上不可用）
  if (provider.models.length) {
    useStaticModels(provider.models)
    return
  }
  modelState.loading = true
  try {
    const url =
      '/api/models?base=' +
      encodeURIComponent(activeBaseUrl()) +
      '&key=' +
      encodeURIComponent(key)
    const res = await fetch(url)
    const bodyText = await res.text()
    if (current !== seq) return
    let body: { data?: ApiModel[]; error?: string } | null = null
    try {
      body = JSON.parse(bodyText)
    } catch {
      body = null
    }
    if (res.status === 401) {
      modelState.error = `${provider.name} API Key 无效或已过期`
      clearModels()
      return
    }
    if (!res.ok || !body) {
      throw new Error(body?.error || `拉取 ${provider.name} 模型列表失败: HTTP ` + res.status)
    }
    const list: string[] = []
    const meta: Record<string, ModelMeta> = {}
    for (const item of body.data ?? []) {
      const id = item.id
      if (!id) continue
      list.push(id)
      const reasoning = item.capabilities?.reasoning
      meta[id] = {
        efforts: Array.isArray(reasoning?.effort) ? reasoning.effort : [],
        supported: reasoning?.supported !== false
      }
    }
    modelState.list = list
    modelState.meta = meta
    if (!list.length) {
      modelState.error = '该 Key 没有可用模型'
      config.model = ''
    } else if (!config.model || !list.includes(config.model)) {
      config.model = list[0]
    }
  } catch (e) {
    if (current !== seq) return
    clearModels()
    modelState.error = e instanceof Error ? e.message : String(e)
  } finally {
    if (current === seq) modelState.loading = false
  }
}

function schedule(delay: number): void {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    void refreshModels()
  }, delay)
}

watch(
  [() => config.keys[config.provider], () => config.baseUrls[config.provider]],
  () => schedule(600)
)

watch(
  () => config.provider,
  () => {
    modelState.list = []
    modelState.meta = {}
    modelState.error = ''
    schedule(150)
  }
)

watch(
  [() => config.model, () => modelState.list],
  () => {
    const levels = levelsFor(config.model)
    if (!levels.includes(config.effortLevel)) {
      config.effortLevel = defaultLevel(levels)
    }
  },
  { immediate: true, deep: true }
)

if (hasApiKey.value) void refreshModels()

export function levelsFor(model: string): string[] {
  const meta = modelState.meta[model]
  if (meta && meta.efforts.length) return meta.efforts
  return PROVIDERS[config.provider].efforts
}

export function modelReady(): boolean {
  return modelState.list.length > 0
}
