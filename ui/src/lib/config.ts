import { computed, reactive, watch } from 'vue'

export type Theme = 'truesight' | 'standard'
export type ThemeMode = 'light' | 'dark'
export type Depth = 'rough' | 'advanced'
export type SourceMode = 'auto' | 'opendota' | 'stratz' | 'both'
export type ProviderId = 'opencode' | 'minimax'

export interface ProviderDef {
  id: ProviderId
  name: string
  desc: string
  defaultBaseUrl: string
  altBaseUrl?: string
  altBaseLabel?: string
  /** 内置模型清单；为空表示通过 /v1/models 动态获取 */
  models: string[]
  efforts: string[]
  defaultEffort: string
  keyHint: string
  siteUrl: string
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  opencode: {
    id: 'opencode',
    name: 'OpenCode Go',
    desc: 'OpenCode Go 推理服务，模型列表由接口返回。',
    defaultBaseUrl: 'https://opencode.ai/inference/go/openai/v1',
    models: [],
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'low',
    keyHint: 'sk-...',
    siteUrl: 'https://opencode.ai'
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    desc: 'MiniMax M3 系列（OpenAI 兼容接口，支持思考档位）。',
    defaultBaseUrl: 'https://api.minimax.cn/v1',
    altBaseUrl: 'https://api.minimax.io/v1',
    altBaseLabel: '海外线路',
    models: ['MiniMax-M3.1-Flash', 'MiniMax-M3'],
    efforts: ['low', 'medium', 'high', 'xhigh', 'max'],
    defaultEffort: 'high',
    keyHint: 'eyJhbGciOi...',
    siteUrl: 'https://platform.minimax.cn'
  }
}

export const PROVIDER_LIST = Object.values(PROVIDERS)

export interface PersistedConfig {
  provider: ProviderId
  keys: Record<ProviderId, string>
  baseUrls: Record<ProviderId, string>
  stratzToken: string
  model: string
  effortLevel: string
  depth: Depth
  sourceMode: SourceMode
  theme: Theme
  mode: ThemeMode
}

const KEY = 'truesight.config.v1'

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function defaults(): PersistedConfig {
  return {
    provider: 'opencode',
    keys: { opencode: '', minimax: '' },
    baseUrls: {
      opencode: PROVIDERS.opencode.defaultBaseUrl,
      minimax: PROVIDERS.minimax.defaultBaseUrl
    },
    stratzToken: '',
    model: '',
    effortLevel: '',
    depth: 'rough',
    sourceMode: 'auto',
    theme: 'truesight',
    mode: 'dark'
  }
}

function load(): PersistedConfig {
  const merged = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}

    // 旧版本只有单个 apiKey / baseUrl，迁移到 OpenCode Go 配置槽
    const legacyKey = text(parsed.apiKey)
    const legacyBase = text(parsed.baseUrl)
    const storedKeys = isRecord(parsed.keys) ? parsed.keys : null
    const storedBases = isRecord(parsed.baseUrls) ? parsed.baseUrls : null
    for (const id of Object.keys(PROVIDERS) as ProviderId[]) {
      merged.keys[id] = storedKeys ? text(storedKeys[id]) : id === 'opencode' ? legacyKey : ''
      merged.baseUrls[id] = (storedBases ? text(storedBases[id]) : '') || (id === 'opencode' && legacyBase) ||
        PROVIDERS[id].defaultBaseUrl
    }

    merged.stratzToken = text(parsed.stratzToken)
    merged.model = text(parsed.model)
    merged.effortLevel = text(parsed.effortLevel)
    merged.depth = parsed.depth === 'advanced' ? 'advanced' : 'rough'
    merged.sourceMode =
      parsed.sourceMode === 'opendota' ||
      parsed.sourceMode === 'stratz' ||
      parsed.sourceMode === 'both'
        ? parsed.sourceMode
        : 'auto'
    merged.provider = parsed.provider === 'minimax' ? 'minimax' : 'opencode'

    const storedTheme = String(parsed.theme ?? '')
    const storedMode = String(parsed.mode ?? '')
    if (storedTheme === 'truesight-dark' || storedTheme === 'dark') {
      merged.theme = 'truesight'
      merged.mode = 'dark'
    } else if (storedTheme === 'truesight-light' || storedTheme === 'light') {
      merged.theme = 'truesight'
      merged.mode = 'light'
    } else if (storedTheme === 'standard') {
      merged.theme = 'standard'
      merged.mode = 'light'
    } else if (storedTheme === 'truesight' || storedTheme === 'standard') {
      merged.theme = storedTheme
    }

    if (storedMode === 'light' || storedMode === 'dark') {
      merged.mode = storedMode
    }

    const params = new URLSearchParams(location.search)
    const paramProvider = params.get('provider')
    if (paramProvider === 'minimax' || paramProvider === 'opencode') {
      merged.provider = paramProvider
    }
    const paramBase = params.get('base')
    if (paramBase) merged.baseUrls[merged.provider] = paramBase

    const paramTheme = params.get('theme')
    if (paramTheme === 'truesight' || paramTheme === 'standard') {
      merged.theme = paramTheme
    } else if (paramTheme === 'truesight-dark' || paramTheme === 'dark') {
      merged.theme = 'truesight'
      merged.mode = 'dark'
    } else if (paramTheme === 'truesight-light' || paramTheme === 'light') {
      merged.theme = 'truesight'
      merged.mode = 'light'
    }
    const paramMode = params.get('mode')
    if (paramMode === 'light' || paramMode === 'dark') merged.mode = paramMode

    const effort = params.get('effort')
    if (effort) merged.effortLevel = effort
    return merged
  } catch {
    return merged
  }
}

export const config = reactive<PersistedConfig>(load())

export const activeProvider = computed(() => PROVIDERS[config.provider])

export function activeApiKey(): string {
  return config.keys[config.provider] ?? ''
}

export function activeBaseUrl(): string {
  return config.baseUrls[config.provider] || PROVIDERS[config.provider].defaultBaseUrl
}

export function setProvider(id: ProviderId): void {
  if (config.provider === id) return
  config.provider = id
  if (!config.baseUrls[id]) config.baseUrls[id] = PROVIDERS[id].defaultBaseUrl
  config.model = ''
  config.effortLevel = ''
}

export function applyTheme(): void {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.mode = config.mode
}

export function toggleTheme(): void {
  config.mode = config.mode === 'dark' ? 'light' : 'dark'
}

export function defaultLevel(levels: string[]): string {
  const preferred = PROVIDERS[config.provider].defaultEffort
  if (levels.includes(preferred)) return preferred
  if (levels.includes('low')) return 'low'
  return levels[0] ?? ''
}

watch(
  config,
  (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      /* localStorage 不可用时忽略 */
    }
  },
  { deep: true }
)

watch(
  [() => config.theme, () => config.mode],
  () => applyTheme()
)

applyTheme()

export function sessionId(): string {
  const key = 'truesight.session'
  let value = ''
  try {
    value = localStorage.getItem(key) || ''
  } catch {
    value = ''
  }
  if (!value) {
    value = 'truesight-' + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  }
  return value
}
