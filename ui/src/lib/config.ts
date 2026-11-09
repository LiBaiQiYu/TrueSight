import { computed, reactive, watch } from 'vue'

export type Theme = 'truesight' | 'standard'
export type ThemeMode = 'light' | 'dark'
export type Depth = 'rough' | 'advanced'
export type SourceMode = 'auto' | 'opendota' | 'stratz' | 'both'
export type ProviderId = 'opencode' | 'minimax' | 'deepseek' | 'openai' | 'xiaomi' | 'custom'
export type CustomProtocol = 'chat' | 'responses' | 'anthropic'

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
  /** 自定义 OpenAI 兼容服务：允许空 Key（Ollama / LM Studio 等本地服务） */
  allowEmptyKey?: boolean
  /** 自定义服务需要在设置页填写模型名 */
  requiresModel?: boolean
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
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    desc: 'DeepSeek 官方 API，支持 deepseek-chat 与 deepseek-reasoner 深度思考。',
    defaultBaseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    efforts: [],
    defaultEffort: '',
    keyHint: 'sk-...',
    siteUrl: 'https://platform.deepseek.com/api_keys'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI / Codex',
    desc: 'OpenAI 官方 API Key；Codex 订阅/CLI 登录不走此入口。',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: [],
    efforts: ['low', 'medium', 'high', 'xhigh'],
    defaultEffort: 'medium',
    keyHint: 'sk-proj-...',
    siteUrl: 'https://platform.openai.com/api-keys'
  },
  xiaomi: {
    id: 'xiaomi',
    name: '小米 MiMo',
    desc: '小米 MiMo 官方 API，OpenAI 兼容，内置 MiMo-V2.6 系列。',
    defaultBaseUrl: 'https://api.xiaomimimo.com/v1',
    models: [
      'mimo-v2.6-flash',
      'mimo-v2.6-pro',
      'mimo-v2.6-pro-ultraspeed',
      'mimo-v2.5',
      'mimo-v2.5-pro'
    ],
    efforts: [],
    defaultEffort: '',
    keyHint: 'API Key',
    siteUrl: 'https://platform.xiaomimimo.com'
  },
  custom: {
    id: 'custom',
    name: '自定义',
    desc: '连接中转站、自部署服务或其他兼容 OpenAI / Anthropic 协议的接口。',
    defaultBaseUrl: '',
    models: [],
    efforts: [],
    defaultEffort: '',
    keyHint: 'API Key（本地服务可留空）',
    siteUrl: '',
    allowEmptyKey: true,
    requiresModel: true
  }
}

export const PROVIDER_LIST = Object.values(PROVIDERS)

function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PROVIDERS, value)
}

export interface PersistedConfig {
  provider: ProviderId
  keys: Record<ProviderId, string>
  baseUrls: Record<ProviderId, string>
  stratzToken: string
  model: string
  customId: string
  customName: string
  customProtocol: CustomProtocol
  customModel: string
  customCatalog: string[]
  customEfforts: string[]
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
    keys: { opencode: '', minimax: '', deepseek: '', openai: '', xiaomi: '', custom: '' },
    baseUrls: {
      opencode: PROVIDERS.opencode.defaultBaseUrl,
      minimax: PROVIDERS.minimax.defaultBaseUrl,
      deepseek: PROVIDERS.deepseek.defaultBaseUrl,
      openai: PROVIDERS.openai.defaultBaseUrl,
      xiaomi: PROVIDERS.xiaomi.defaultBaseUrl,
      custom: ''
    },
    stratzToken: '',
    model: '',
    customId: '',
    customName: '自定义',
    customProtocol: 'chat',
    customModel: '',
    customCatalog: [],
    customEfforts: [],
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
    merged.customId = text(parsed.customId)
    merged.customName = text(parsed.customName) || '自定义'
    merged.customProtocol =
      parsed.customProtocol === 'responses' || parsed.customProtocol === 'anthropic'
        ? parsed.customProtocol
        : 'chat'
    merged.customModel = text(parsed.customModel)
    merged.customCatalog = Array.isArray(parsed.customCatalog)
      ? parsed.customCatalog.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    merged.customEfforts = Array.isArray(parsed.customEfforts)
      ? parsed.customEfforts
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      : []
    merged.effortLevel = text(parsed.effortLevel)
    merged.depth = parsed.depth === 'advanced' ? 'advanced' : 'rough'
    merged.sourceMode =
      parsed.sourceMode === 'opendota' ||
      parsed.sourceMode === 'stratz' ||
      parsed.sourceMode === 'both'
        ? parsed.sourceMode
        : 'auto'
    merged.provider = isProviderId(parsed.provider) ? parsed.provider : 'opencode'

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
    const param = params.get('provider')
    if (isProviderId(param)) merged.provider = param
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

export function providerName(id: ProviderId = config.provider): string {
  if (id === 'custom') return config.customName.trim() || '自定义'
  return PROVIDERS[id].name
}

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
