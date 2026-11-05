export interface ReplayPlayer {
  team: number
  slot: number
  name: string
  hero: string
}

export interface ReplayScore {
  hero: string
  k: number
  d: number
  a?: number
}

export interface ReplayDamage {
  hero: string
  v: number
}

export interface ReplayTimelinePoint {
  t: string
  radiant: number
  dire: number
}

export interface ReplayEvent {
  t: string
  a: string
  b: string
}

export interface ReplayCast {
  ability: string
  n: number
}

/** One exact inventory snapshot: 6 equipment + 1 neutral + 3 backpack slots. */
export interface ReplayInventorySnapshot {
  t: string
  main: string[]
  neutral: string
  backpack: string[]
}

/** 5-second series sampled from the replay (all 10 players). */
export interface ReplaySeriesPlayer {
  slot: number
  hero: string
  netWorth: Array<number | null>
  lastHits: Array<number | null>
  denies: Array<number | null>
  xp: Array<number | null>
  level: Array<number | null>
  kills: Array<number | null>
  deaths: Array<number | null>
  assists: Array<number | null>
  heroDamage: Array<number | null>
  /** 生命/魔法百分比（0–100），5 秒采样 */
  hp?: Array<number | null>
  mp?: Array<number | null>
}

export interface ReplaySeries {
  step: number
  players: ReplaySeriesPlayer[]
}

export interface ReplayFocus {
  unit: string
  kills: ReplayEvent[]
  deaths: ReplayEvent[]
  purchases: ReplayEvent[]
  sells?: ReplayEvent[]
  removed?: ReplayEvent[]
  uses?: ReplayEvent[]
  /** 本方实际插下的守卫：a 为 item_ward_observer / item_ward_sentry */
  wardPlacements?: ReplayEvent[]
  items?: ReplayInventorySnapshot[]
  /** 德鲁伊小熊的 6+1+3 格背包快照（其他英雄为空） */
  bearItems?: ReplayInventorySnapshot[]
  notes: ReplayEvent[]
  casts: ReplayCast[]
  /** 前 10 分钟的技能释放次数（旧缓存没有该字段） */
  casts10?: ReplayCast[]
}

/** [t, playerIndex, cellX, cellY, hp, maxHp, team] */
export type ReplayPositionSample = [number, number, number, number, number, number, number]

export interface ReplayPositions {
  step: number
  samples: ReplayPositionSample[]
}

export interface ReplayParse {
  schema?: number
  build?: number
  gameVersion?: number
  matchId: number
  winner: number
  mode: number
  playbackSec: number
  clockOffsetSec: number
  clockCalibrated: boolean
  players: ReplayPlayer[]
  scoreboard: ReplayScore[]
  damageDealt: ReplayDamage[]
  damageTaken: ReplayDamage[]
  timeline: ReplayTimelinePoint[]
  final: { radiant: number; dire: number }
  series?: ReplaySeries
  positions?: ReplayPositions
  focus: ReplayFocus
}

interface ParseJob {
  state: 'running' | 'done' | 'error'
  messages?: string[]
  result?: ReplayParse | null
  error?: string | null
  cached?: boolean
}

export interface ReplayResult {
  result: ReplayParse
  cached: boolean
}

const POLL_MS = 1000
const MAX_POLLS = 2400

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string }
    if (body?.error) return body.error
  } catch {
    /* ignore */
  }
  return `HTTP ${res.status}`
}

export async function parseReplay(
  matchId: number,
  heroId: number,
  onProgress?: (message: string) => void,
  signal?: AbortSignal
): Promise<ReplayResult> {
  const aborted = (): never => {
    throw new DOMException('已停止分析', 'AbortError')
  }
  if (signal?.aborted) aborted()
  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId: String(matchId), heroId }),
    signal
  })
  if (!res.ok) throw new Error(await readError(res))
  const { jobId } = (await res.json()) as { jobId?: string }
  if (!jobId) throw new Error('录像解析任务创建失败')

  let lastMessage = ''
  for (let i = 0; i < MAX_POLLS; i += 1) {
    if (signal?.aborted) aborted()
    await sleep(POLL_MS)
    if (signal?.aborted) aborted()
    const statusRes = await fetch(`/api/parse/status?job=${encodeURIComponent(jobId)}`, { signal })
    if (!statusRes.ok) throw new Error(await readError(statusRes))
    const job = (await statusRes.json()) as ParseJob

    const latest = job.messages?.[job.messages.length - 1]
    if (latest && latest !== lastMessage) {
      lastMessage = latest
      onProgress?.(latest)
    }

    if (job.state === 'error') throw new Error(job.error || '录像解析失败')
    if (job.state === 'done') {
      if (!job.result) throw new Error('录像解析完成但没有返回数据')
      return { result: job.result, cached: Boolean(job.cached) }
    }
  }
  throw new Error('录像解析超时，请稍后重试')
}
