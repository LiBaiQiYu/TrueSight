<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from './components/AppIcon.vue'
import AppSidebar from './components/AppSidebar.vue'
import BrandMark from './components/BrandMark.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import MatchCard from './components/MatchCard.vue'
import ResultCard from './components/ResultCard.vue'
import TimelineDock from './components/TimelineDock.vue'
import HistoryView from './components/HistoryView.vue'
import SettingsView from './components/SettingsView.vue'
import {
  activeApiKey,
  activeBaseUrl,
  activeProvider,
  config,
  sessionId,
  type Depth
} from './lib/config'
import { loadHeroes, type HeroInfo } from './lib/heroes'
import { fetchMatch, type OpenDotaMatch } from './lib/opendota'
import { fetchStratzMatch, type StratzMatch } from './lib/stratz'
import { parseReplay, type ReplayParse } from './lib/replay'
import { buildRoster } from './lib/roster'
import { buildTimelineModel } from './lib/timeline'
import { loadNames, type NamesIndex } from './lib/names'
import { buildSystemPrompt, buildUserPrompt } from './lib/prompt'
import { streamChat } from './lib/chat'
import { addHistory, type HistoryItem } from './lib/history'
import { SmoothStream } from './lib/smooth'
import {
  buildMatchup,
  emptyMatchup,
  suggestPreset,
  type MatchupPreset,
  type MatchupState
} from './lib/matchup'

type View = 'assistant' | 'history' | 'settings'
type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'stopped' | 'error'

const activeView = ref<View>('assistant')
const heroes = ref<Map<number, HeroInfo> | null>(null)
const matchIdInput = ref('')
const match = ref<OpenDotaMatch | null>(null)
const lookupStratz = ref<StratzMatch | null>(null)
const lookupError = ref('')
const loadingMatch = ref(false)
const matchError = ref('')
const focusSlot = ref<number | null>(null)
/** 时间轴弹窗内切换查看对象，不影响已经生成的 AI 分析结果。 */
const dockFocusSlot = ref<number | null>(null)
const timelineFocusSlot = computed(() => dockFocusSlot.value ?? focusSlot.value)
watch(focusSlot, (value) => {
  dockFocusSlot.value = value
})
const matchup = ref<MatchupState>({ ...emptyMatchup })
const matchCardRef = ref<{ collapse: () => void } | null>(null)
const replayData = ref<ReplayParse | null>(null)
/** 本场所有英雄的回放解析结果（按 heroId），切换分析对象时直接复用 */
const replays = ref<Record<number, ReplayParse>>({})
const names = ref<NamesIndex | null>(null)
const dockOpen = ref(false)
let analysisRun = 0
let abortCtl: AbortController | null = null

const status = ref<Status>('idle')
const answer = ref('')
const reasoning = ref('')
const errorMsg = ref('')
const promptText = ref('')
const systemText = ref('')
const sources = ref<string[]>([])
const elapsed = ref(0)
const progress = ref(0)
const progressLabel = ref('')
const resultEl = ref<HTMLElement | null>(null)
const resultMeta = ref<{
  matchId: number | null
  heroName: string
  playerName: string
  depth: Depth
  model: string
}>({ matchId: null, heroName: '', playerName: '', depth: 'rough', model: '' })
const activeHistoryItem = ref<HistoryItem | null>(null)

async function ensureNames(attempts = 3): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const index = await loadNames()
      names.value = index
      if (index) return
    } catch {
      names.value = null
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 600 * (i + 1)))
    }
  }
}

onMounted(async () => {
  try {
    heroes.value = await loadHeroes()
  } catch {
    heroes.value = null
  }
  await ensureNames()
  const params = new URLSearchParams(location.search)
  const presetView = params.get('view')
  if (presetView === 'settings' || presetView === 'history') {
    activeView.value = presetView
  }
  const preset = params.get('match')
  if (preset) {
    matchIdInput.value = preset
    await search(preset)
    const heroParam = Number(params.get('hero'))
    if (Number.isFinite(heroParam) && heroParam > 0) {
      const picked = match.value?.players.find((p) => p.hero_id === heroParam)
      if (picked) focusSlot.value = picked.player_slot
    }
    const mu = params.get('matchup')
    if (mu === 'mid' || mu === 'safe' || mu === 'off') {
      matchup.value.enabled = true
      matchup.value.preset = mu
      applyMatchup(mu)
    }
    // 调试/预览用：?replay=1 直接加载本地回放解析，不调用 AI
    if (params.get('replay') === '1' && match.value) {
      const picked = Number(params.get('hero'))
      const heroId = Number.isFinite(picked) && picked > 0
        ? match.value.players.find((p) => p.hero_id === picked)?.hero_id
        : undefined
      if (heroId) {
        try {
          const parsed = await parseReplay(match.value.match_id, heroId)
          if (parsed.result) replayData.value = parsed.result
        } catch {
          /* 回放不可用时忽略 */
        }
      }
    }
  }
})

const lookupNote = computed(() => {  if (!config.stratzToken.trim()) {
    return '定位：OpenDota 分路（配置 STRATZ Token 可精确到 1–5 号位）'
  }
  if (lookupError.value) return lookupError.value
  if (lookupStratz.value) return '定位：OpenDota + STRATZ（1–5 号位）'
  return '定位：OpenDota 分路'
})


const roster = computed(() => buildRoster(match.value, lookupStratz.value))
const matchHeroIds = computed(() => match.value?.players.map((player) => player.hero_id) ?? [])

const focusPlayer = computed(
  () => roster.value.find((p) => p.slot === focusSlot.value) ?? null
)

const timelineModel = computed(() => {
  const current = match.value
  if (!current) return null
  return buildTimelineModel({
    match: current,
    roster: roster.value,
    focusSlot: timelineFocusSlot.value,
    allySlots: matchup.value.enabled ? matchup.value.allySlots : [],
    enemySlots: matchup.value.enabled ? matchup.value.enemySlots : [],
    replay: replayData.value,
    replays: replays.value,
    names: names.value
  })
})

const hasDock = computed(() => {
  // 时间轴只属于高级分析：必须已有回放解析数据，且选了分析对象
  if (focusSlot.value == null || !replayData.value) return false
  const model = timelineModel.value
  return Boolean(model && (model.hasItems || model.hasSkills))
})

watch(hasDock, (value) => {
  if (!value) dockOpen.value = false
})

function heroName(id: number | undefined): string {
  if (id == null) return ''
  return names.value?.heroById.get(id)?.cn || heroes.value?.get(id)?.localized || `英雄 ${id}`
}

function resetResult(): void {
  activeHistoryItem.value = null
  status.value = 'idle'
  answer.value = ''
  reasoning.value = ''
  errorMsg.value = ''
  promptText.value = ''
  systemText.value = ''
  sources.value = []
  elapsed.value = 0
  progress.value = 0
  progressLabel.value = ''
  stopWaiting()
  resultMeta.value = { matchId: null, heroName: '', playerName: '', depth: 'rough', model: '' }
}

let waitTimer: number | null = null
let waitStart = 0

function startWaiting(label: string): void {
  stopWaiting()
  waitStart = performance.now()
  progressLabel.value = label
  waitTimer = window.setInterval(() => {
    const seconds = Math.floor((performance.now() - waitStart) / 1000)
    progressLabel.value = `${label} ${seconds}s`
  }, 1000)
}

function stopWaiting(): void {
  if (waitTimer != null) {
    window.clearInterval(waitTimer)
    waitTimer = null
  }
}

async function search(id: string): Promise<void> {
  const value = id.trim()
  if (!value) {
    matchError.value = '请输入比赛 ID'
    return
  }
  if (!/^\d+$/.test(value)) {
    matchError.value = '比赛 ID 只能包含数字，例如 9027308611'
    return
  }
  matchIdInput.value = value
  cancelAnalysis()
  loadingMatch.value = true
  matchError.value = ''
  match.value = null
  lookupStratz.value = null
  lookupError.value = ''
  focusSlot.value = null
  matchup.value = { ...emptyMatchup }
  dockOpen.value = false
  resetResult()
  try {
    match.value = await fetchMatch(value)
    matchIdInput.value = String(match.value.match_id)
    if (config.stratzToken.trim()) {
      try {
        lookupStratz.value = await fetchStratzMatch(match.value.match_id, config.stratzToken)
      } catch (e) {
        lookupError.value = 'STRATZ 数据获取失败：' + (e instanceof Error ? e.message : String(e))
      }
    }
  } catch (e) {
    matchError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loadingMatch.value = false
  }
}

/** 清空已查询的比赛与所有派生状态，回到初始状态。 */
function clearMatch(): void {
  cancelAnalysis()
  matchIdInput.value = ''
  match.value = null
  lookupStratz.value = null
  lookupError.value = ''
  matchError.value = ''
  focusSlot.value = null
  matchup.value = { ...emptyMatchup }
  dockOpen.value = false
  resetResult()
}

/** 中止当前分析（含后台解析队列），并清空本场回放缓存。 */
function cancelAnalysis(): void {
  analysisRun += 1
  abortCtl?.abort()
  abortCtl = null
  stopWaiting()
  replayData.value = null
  replays.value = {}
}

/** 用户点击「停止分析」：保留已生成的内容，回到可再次开始的状态。 */
function stopAnalysis(): void {
  analysisRun += 1
  abortCtl?.abort()
  abortCtl = null
  stopWaiting()
  progress.value = 0
  progressLabel.value = '已停止分析'
  status.value = answer.value ? 'stopped' : 'idle'
}

watch(matchIdInput, (value) => {
  if (matchError.value && value.trim() !== String(match.value?.match_id ?? '')) {
    matchError.value = ''
  }
})

function fail(message: string): void {
  status.value = 'error'
  errorMsg.value = message
}

function applyMatchup(preset: MatchupPreset): void {
  if (focusSlot.value == null) return
  if (!roster.value.length) return
  matchup.value = buildMatchup(roster.value, focusSlot.value, preset)
}

function sameSlots(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function onMatchupChange(next: MatchupState): void {
  const presetChanged = next.preset !== matchup.value.preset
  const turnedOn = next.enabled && !matchup.value.enabled
  const slotsChanged =
    !sameSlots(next.allySlots, matchup.value.allySlots) ||
    !sameSlots(next.enemySlots, matchup.value.enemySlots)
  matchup.value = { ...next }
  if (!next.enabled) {
    matchup.value.allySlots = []
    matchup.value.enemySlots = []
    matchup.value.note = ''
    return
  }
  if (!match.value || focusSlot.value == null) {
    matchup.value.allySlots = []
    matchup.value.enemySlots = []
    matchup.value.note = '请先在右侧选择分析对象'
    return
  }
  if (turnedOn) {
    const preset = suggestPreset(focusPlayer.value)
    matchup.value.preset = preset
    applyMatchup(preset)
  } else if (presetChanged && !slotsChanged) {
    applyMatchup(next.preset)
  }
}

watch(focusSlot, (slot) => {
  if (!matchup.value.enabled) return
  if (slot == null) {
    matchup.value.allySlots = []
    matchup.value.enemySlots = []
    matchup.value.note = '请先在右侧选择分析对象'
    return
  }
  if (roster.value.length) {
    matchup.value = buildMatchup(roster.value, slot, matchup.value.preset)
  }
})

async function start(): Promise<void> {
  const m = match.value
  const player = focusPlayer.value
  const odPlayer = m?.players.find((p) => p.player_slot === focusSlot.value)
  if (!m || !player || !odPlayer) {
    matchError.value = '先查询比赛并选择一名玩家'
    return
  }
  matchCardRef.value?.collapse()
  if (!activeApiKey().trim()) {
    resetResult()
    fail(`请先在左下角「设置」里填写 ${activeProvider.value.name} API Key`)
    return
  }
  if (!config.model) {
    resetResult()
    fail('请先在左下角选择模型')
    return
  }

  const depth = config.depth
  const hero = heroName(odPlayer.hero_id)

  const hasStratzToken = config.stratzToken.trim().length > 0
  const mode = config.sourceMode
  let useOpenDota = mode === 'opendota' || mode === 'both'
  let useStratz = mode === 'stratz' || mode === 'both'
  if (mode === 'auto') {
    useOpenDota = true
    useStratz = hasStratzToken
  }
  if (useStratz && !hasStratzToken) {
    resetResult()
    fail('当前数据源需要 STRATZ Token，请到左下角「设置」里配置')
    return
  }

  analysisRun += 1
  const run = analysisRun
  abortCtl?.abort()
  abortCtl = new AbortController()
  const signal = abortCtl.signal

  resetResult()
  replayData.value = null
  resultMeta.value = {
    matchId: m.match_id,
    heroName: hero,
    playerName: player.playerName,
    depth,
    model: config.model
  }
  status.value = 'loading'
  progress.value = 0.1
  progressLabel.value = '准备分析…'
  sources.value = []
  if (useOpenDota) sources.value.push('OpenDota')

  let replay: ReplayParse | null = null
  if (depth === 'advanced') {
    progress.value = 0.2
    progressLabel.value = '查询回放并准备本地解析…'
    try {
      const parsed = await parseReplay(
        m.match_id,
        odPlayer.hero_id,
        (message) => {
          progressLabel.value = message
        },
        signal
      )
      replay = parsed.result
      replayData.value = replay
      replays.value = { ...replays.value, [odPlayer.hero_id]: replay }
      // 对位分析先确保双方 2v2 英雄的录像数据就绪，再开始 AI 分析
      if (depth === 'advanced' && matchup.value.enabled) {
        const laneSlots = [...new Set([
          odPlayer.player_slot,
          ...matchup.value.allySlots,
          ...matchup.value.enemySlots
        ])]
        const laneHeroIds = laneSlots
          .map((slot) => m.players.find((player) => player.player_slot === slot)?.hero_id)
          .filter((heroId): heroId is number => heroId != null)
        if (laneHeroIds.length > 1) {
          progressLabel.value = '解析对位英雄数据…'
          await parseHeroesReplays(m, run, signal, laneHeroIds, true)
          if (signal.aborted) return
          progress.value = 0.55
          progressLabel.value = '对位英雄数据就绪'
        }
      }
      // 其余英雄后台继续解析，之后切换分析对象无需重新分析
      void parseHeroesReplays(m, run, signal)
      sources.value = [...sources.value, 'Clarity 录像']
      progress.value = 0.5
      progressLabel.value = parsed.cached ? '已读取本地录像解析缓存' : '录像解析完成'
    } catch (e) {
      progress.value = 0
      progressLabel.value = ''
      if (signal.aborted) return
      fail('高级分析需要本地录像解析：' + (e instanceof Error ? e.message : String(e)))
      return
    }
  }

  progress.value = 0.55
  progressLabel.value = useStratz ? '获取 STRATZ 数据…' : '整理 OpenDota 数据…'

  let stratz: StratzMatch | null = null
  if (useStratz) {
    if (lookupStratz.value && lookupStratz.value.id === m.match_id) {
      stratz = lookupStratz.value
      sources.value = [...sources.value, 'STRATZ']
    } else {
      try {
        stratz = await fetchStratzMatch(m.match_id, config.stratzToken)
        sources.value = [...sources.value, 'STRATZ']
      } catch (e) {
        progress.value = 0
        progressLabel.value = ''
        fail(e instanceof Error ? e.message : String(e))
        return
      }
    }
  }

  progress.value = 0.65
  progressLabel.value = '组装对局数据与对位信息…'

  const system = buildSystemPrompt(depth, matchup.value.enabled, Boolean(replay))
  const user = buildUserPrompt({
    depth,
    sources: { opendota: useOpenDota, stratz: useStratz, clarity: Boolean(replay) },
    match: m,
    stratz,
    replay,
    replays: replays.value,
    roster: roster.value,
    heroId: odPlayer.hero_id,
    heroName: hero,
    playerName: player.playerName,
    isRadiant: player.isRadiant,
    heroes: heroes.value,
    names: names.value,
    matchup: matchup.value.enabled
      ? { allySlots: matchup.value.allySlots, enemySlots: matchup.value.enemySlots }
      : undefined
  })
  promptText.value = user
  systemText.value = system

  resultEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

  progress.value = 0.75
  startWaiting('等待模型响应…')

  const smooth = new SmoothStream((text) => {
    answer.value = text
  })

  const markStreaming = (): void => {
    if (status.value !== 'streaming') {
      status.value = 'streaming'
      stopWaiting()
      progressLabel.value = 'AI 正在分析…'
    }
  }

  const startedAt = performance.now()
  try {
    await streamChat({
      apiKey: activeApiKey().trim(),
      provider: config.provider,
      baseUrl: activeBaseUrl(),
      model: config.model,
      effort: config.effortLevel || undefined,
      sessionId: sessionId(),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      signal,
      onReasoning: (delta) => {
        reasoning.value += delta
        markStreaming()
      },
      onDelta: (delta) => {
        markStreaming()
        smooth.push(delta)
      }
    })
    stopWaiting()
    await smooth.finish()
    progress.value = 1
    progressLabel.value = '分析完成'
    status.value = 'done'
    elapsed.value = (performance.now() - startedAt) / 1000
    addHistory({
      matchId: m.match_id,
      heroId: odPlayer.hero_id,
      heroName: hero,
      playerName: resultMeta.value.playerName,
      depth,
      model: config.model,
      answer: answer.value
    })
  } catch (e) {
    stopWaiting()
    void smooth.finish()
    if (signal.aborted) {
      progress.value = 0
      progressLabel.value = '已停止分析'
      status.value = answer.value ? 'stopped' : 'idle'
      return
    }
    progress.value = 0
    progressLabel.value = ''
    status.value = 'error'
    errorMsg.value = e instanceof Error ? e.message : String(e)
  }
}

/** 顺序解析指定英雄（缺省为本场全部英雄），复用已下载的录像，结果按 heroId 缓存。 */
async function parseHeroesReplays(
  sourceMatch: OpenDotaMatch,
  run: number,
  signal: AbortSignal,
  only?: number[],
  report = false
): Promise<void> {
  const heroIds = only ?? [...new Set(sourceMatch.players.map((player) => player.hero_id))]
  let index = 0
  for (const heroId of heroIds) {
    index += 1
    if (run !== analysisRun || signal.aborted) return
    if (replays.value[heroId]) continue
    if (report) progressLabel.value = `解析对位英雄数据 ${index}/${heroIds.length}…`
    try {
      const parsed = await parseReplay(sourceMatch.match_id, heroId, undefined, signal)
      if (run !== analysisRun || signal.aborted) return
      replays.value = { ...replays.value, [heroId]: parsed.result }
    } catch {
      if (run !== analysisRun || signal.aborted) return
    }
  }
}

async function openHistory(item: HistoryItem): Promise<void> {
  activeView.value = 'assistant'
  replayData.value = null
  await search(String(item.matchId))
  const player = match.value?.players.find((p) => p.hero_id === item.heroId)
  if (player) focusSlot.value = player.player_slot
  activeHistoryItem.value = item
  status.value = 'done'
  answer.value = item.answer
  errorMsg.value = ''
  promptText.value = ''
  systemText.value = ''
  sources.value = ['OpenDota']
  elapsed.value = 0
  resultMeta.value = {
    matchId: item.matchId,
    heroName: heroName(item.heroId) || item.heroName,
    playerName: item.playerName,
    depth: item.depth,
    model: item.model
  }
}

/** 历史记录里的高级分析：重新载入该场的录像解析并直接打开时间轴。 */
async function openTimelineHistory(item: HistoryItem): Promise<void> {
  if (item.depth !== 'advanced') return
  await openHistory(item)
  const currentMatch = match.value
  const player = currentMatch?.players.find((entry) => entry.hero_id === item.heroId)
  if (!currentMatch || !player) return
  focusSlot.value = player.player_slot

  const usableReplay = (candidate: ReplayParse | null | undefined): candidate is ReplayParse =>
    Boolean(
      candidate &&
        candidate.matchId === item.matchId &&
        !(
          candidate.focus.unit === 'npc_dota_hero_lone_druid' &&
          !candidate.focus.bearItems?.length
        )
    )

  let replay: ReplayParse | undefined = usableReplay(replays.value[item.heroId])
    ? replays.value[item.heroId]
    : undefined
  if (!replay && usableReplay(replayData.value)) replay = replayData.value
  if (!replay) {
    status.value = 'loading'
    progress.value = 0.2
    progressLabel.value = '读取历史回放解析…'
    try {
      const parsed = await parseReplay(item.matchId, item.heroId)
      replay = parsed.result
      replays.value = { ...replays.value, [item.heroId]: replay }
    } catch (e) {
      status.value = 'error'
      progress.value = 0
      progressLabel.value = ''
      errorMsg.value = '历史时间轴需要本地录像解析：' + (e instanceof Error ? e.message : String(e))
      return
    }
  }

  if (!replay) return
  replayData.value = replay
  if (!hasDock.value) {
    status.value = 'error'
    progress.value = 0
    progressLabel.value = ''
    errorMsg.value = '这条历史记录没有可用的时间轴数据（回放缺少购买或技能信息）'
    return
  }
  status.value = 'done'
  errorMsg.value = ''
  progress.value = 0
  progressLabel.value = ''
  openDock()
}

function openDock(): void {
  if (focusSlot.value != null) dockFocusSlot.value = focusSlot.value
  dockOpen.value = true
}

function setDockFocus(slot: number): void {
  dockFocusSlot.value = slot
  const player = roster.value.find((row) => row.slot === slot)
  if (!player) return
  matchup.value = buildMatchup(roster.value, slot, suggestPreset(player))
}

function applyCustomDockMatchup(allySlots: number[], enemySlots: number[]): void {
  const focus = dockFocusSlot.value ?? focusSlot.value
  if (focus == null || !roster.value.length) return
  const allies = [focus, ...allySlots.filter((slot) => slot !== focus)].slice(0, 2)
  matchup.value = {
    enabled: true,
    preset: 'custom',
    allySlots: allies,
    enemySlots: [...new Set(enemySlots)].slice(0, 3),
    note: ''
  }
}

function changeDockMatchup(preset: MatchupPreset): void {
  if (preset === 'custom') return
  const slot = timelineFocusSlot.value
  if (slot == null || !roster.value.length) return
  matchup.value = buildMatchup(roster.value, slot, preset)
}

function openResultTimeline(): void {
  const item = activeHistoryItem.value
  if (item && item.depth === 'advanced') {
    void openTimelineHistory(item)
    return
  }
  if (hasDock.value) openDock()
}

function setView(key: string): void {
  activeView.value = key === 'history' ? 'history' : 'assistant'
}
</script>

<template>
  <div class="app">
    <div class="scene" aria-hidden="true">
      <div class="glow emerald" />
      <div class="glow lime" />
      <div class="rays" />
      <div class="stars" />
      <div class="horizon" />
      <svg class="ridge far" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 640 L130 540 L250 590 L380 470 L520 560 L640 500 L760 570 L900 460 L1040 560 L1180 500 L1320 580 L1460 500 L1600 560 L1600 900 L0 900 Z"
        />
      </svg>
      <svg class="ridge near" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 740 L160 660 L300 710 L440 620 L600 700 L740 640 L900 720 L1060 650 L1220 720 L1380 660 L1600 730 L1600 900 L0 900 Z"
        />
        <path
          class="rim"
          d="M0 740 L160 660 L300 710 L440 620 L600 700 L740 640 L900 720 L1060 650 L1220 720 L1380 660 L1600 730"
        />
      </svg>
      <svg class="gem-rune" viewBox="0 0 200 200">
        <path
          d="M100 8L190 100 100 192 10 100z"
          fill="var(--rune-fill)"
          stroke="var(--rune-stroke)"
          stroke-width="1.6"
        />
        <path d="M100 8L142 100 100 192z" fill="var(--rune-facet)" />
        <path d="M10 100L100 56 100 100z" fill="var(--rune-dark)" />
        <path d="M190 100L100 56 100 100z" fill="var(--rune-bright)" />
        <path
          d="M100 56L142 100 100 144 58 100z"
          fill="none"
          stroke="var(--rune-inner)"
          stroke-width="1.2"
        />
      </svg>
      <div class="vignette" />
    </div>

    <AppSidebar
      :active="activeView === 'settings' ? '' : activeView"
      @select="setView"
      @settings="activeView = 'settings'"
    />

    <main class="main">
      <div class="theme-fab">
        <ThemeToggle />
      </div>

      <div class="scroll">
        <header class="hero">
          <BrandMark class="hero-eye" />
          <div class="hero-text">
            <h1 class="brand-word hero-word"><span class="ink">True</span><span class="accent">Sight</span></h1>
            <p>用 AI 洞察每一场 Dota 2 比赛</p>
          </div>
        </header>

        <template v-if="activeView === 'assistant'">
          <MatchCard
            ref="matchCardRef"
            :roster="roster"
            v-model:match-id="matchIdInput"
            :heroes="heroes"
            :names="names"
            :loading="loadingMatch"
            :error="matchError"
            :lookup-note="lookupNote"
            :focus-slot="focusSlot"
            :busy="status === 'loading' || status === 'streaming'"
            :matchup="matchup"
            @search="search"
            @clear="clearMatch"
            @update:focus-slot="focusSlot = $event"
            @update:matchup="onMatchupChange"
            @start="start"
            @stop="stopAnalysis"
          />
          <div ref="resultEl" class="result-slot">
            <ResultCard
              :status="status"
              :answer="answer"
              :reasoning="reasoning"
              :error="errorMsg"
              :prompt="promptText"
              :system="systemText"
              :sources="sources"
              :match-id="resultMeta.matchId"
              :hero-name="resultMeta.heroName"
              :player-name="resultMeta.playerName"
              :depth="resultMeta.depth"
              :model="resultMeta.model"
              :elapsed="elapsed"
              :progress="progress"
              :progress-label="progressLabel"
              :names="names"
              :heroes="heroes"
              :hero-ids="matchHeroIds"
              :timeline-ready="hasDock || activeHistoryItem?.depth === 'advanced'"
              @open-timeline="openResultTimeline"
            />
          </div>
        </template>

        <HistoryView
          v-else-if="activeView === 'history'"
          :names="names"
          @open="openHistory"
          @open-timeline="openTimelineHistory"
        />

        <SettingsView v-else @back="activeView = 'assistant'" />
      </div>

      <button
        v-if="hasDock && !dockOpen"
        type="button"
        class="timeline-fab"
        title="打开时间轴与对位数据"
        @click="openDock"
      >
        <AppIcon name="clock" :size="16" />
        <span>时间轴</span>
      </button>

      <TimelineDock
        v-if="hasDock && timelineModel"
        v-model:open="dockOpen"
        :model="timelineModel"
        :heroes="heroes"
        :names="names"
        :matchup-preset="matchup.preset"
        @focus="setDockFocus"
        @change-matchup="changeDockMatchup"
        @custom-matchup="applyCustomDockMatchup"
      />
    </main>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  display: grid;
  grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  height: 100vh;
  overflow: hidden;
  background: var(--app-bg);
}


.scene {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: var(--art-opacity);
  z-index: 0;
}

:root[data-theme="standard"] .scene {
  display: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
}

.glow.emerald {
  width: 720px;
  height: 520px;
  left: 6%;
  top: -12%;
  background: var(--glow-a);
}

.glow.lime {
  width: 900px;
  height: 620px;
  right: -8%;
  top: -12%;
  background: var(--glow-b);
}

.rays {
  position: absolute;
  left: 50%;
  bottom: -32%;
  width: 1300px;
  height: 1300px;
  transform: translateX(-50%);
  background: repeating-conic-gradient(
    from 0deg at 50% 50%,
    var(--ray-color) 0deg 1.6deg,
    transparent 1.6deg 9deg
  );
  -webkit-mask-image: radial-gradient(circle, rgba(0, 0, 0, 0.85) 0%, transparent 58%);
  mask-image: radial-gradient(circle, rgba(0, 0, 0, 0.85) 0%, transparent 58%);
  opacity: 0.55;
}

.ridge {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 62vh;
}

.ridge.far path {
  fill: var(--ridge-far);
  opacity: 0.94;
}

.ridge.near path {
  fill: var(--ridge-near);
  opacity: 0.98;
}

.ridge.near .rim {
  fill: none;
  stroke: var(--ridge-rim);
  stroke-width: 1.4;
}


.stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.6px 1.6px at 12% 16%, rgba(255, 255, 255, 0.6), transparent 60%),
    radial-gradient(1.2px 1.2px at 28% 9%, rgba(255, 255, 255, 0.45), transparent 60%),
    radial-gradient(1.8px 1.8px at 43% 22%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(1.2px 1.2px at 58% 12%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1.6px 1.6px at 71% 20%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(1.3px 1.3px at 84% 10%, rgba(255, 255, 255, 0.45), transparent 60%),
    radial-gradient(1.5px 1.5px at 92% 26%, rgba(255, 255, 255, 0.4), transparent 60%),
    radial-gradient(1.1px 1.1px at 36% 34%, rgba(255, 255, 255, 0.3), transparent 60%),
    radial-gradient(1.3px 1.3px at 64% 30%, rgba(255, 255, 255, 0.35), transparent 60%);
  opacity: var(--stars-opacity);
}

.horizon {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 52vh;
  background: var(--horizon-bg);
}


.gem-rune {
  position: absolute;
  right: 5%;
  top: 9%;
  width: 330px;
  height: 330px;
  filter: var(--rune-filter);
}


.vignette {
  position: absolute;
  inset: 0;
  background: var(--vignette-bg);
}


.main {
  position: relative;
  z-index: 1;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 24px 12px;
}

.theme-fab {
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 12;
}

.timeline-fab {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--accent-line);
  background: var(--nav-grad);
  color: var(--nav-text);
  box-shadow: var(--nav-shadow);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.16s, transform 0.16s;
}

.timeline-fab:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 110px 2px 6px;
}

.hero-eye {
  --mark-size: 92px;
}


.hero-word {
  font-size: 46px;
}

.hero-text p {
  margin-top: 8px;
  font-size: 16px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-text p::before {
  content: '';
  width: 46px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong));
}

.hero-text p::after {
  content: '';
  width: 160px;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
}

.result-slot {
  flex: 1 1 0;
  min-height: 220px;
  display: flex;
}

.result-slot :deep(.result) {
  width: 100%;
  min-height: 0;
}

@media (max-width: 1024px) {
  .app {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .scroll {
    padding: 16px 18px 12px;
  }

  .hero {
    gap: 14px;
    padding: 0 92px 2px 4px;
  }

  .hero-eye {
    --mark-size: 64px;
  }

  .hero-word {
    font-size: 32px;
  }

  .hero-text p {
    font-size: 14px;
  }
}
</style>
