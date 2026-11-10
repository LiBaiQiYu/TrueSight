export interface OpenDotaPlayer {
  player_slot: number
  isRadiant: boolean
  hero_id: number
  personaname?: string
  name?: string
  kills: number
  deaths: number
  assists: number
  gold_per_min?: number
  xp_per_min?: number
  last_hits?: number
  denies?: number
  net_worth?: number
  hero_damage?: number
  tower_damage?: number
  hero_healing?: number
  level?: number
  lane?: number | null
  lane_role?: number | null
  is_roaming?: boolean | null
  purchase_log?: Array<{ time: number; key: string }>
  kills_log?: Array<{ time: number; key: string }>
  runes_log?: Array<{ time: number; key: string }>
  gold_t?: number[]
  xp_t?: number[]
  lh_t?: number[]
  networth_t?: number[]
  dn_t?: number[]
  hero_damage_t?: number[]
  deaths_log?: Array<{ time?: number; key?: string }>
  ability_upgrades_arr?: number[]
}

export interface TeamfightPlayer {
  damage?: number
  healing?: number
  deaths?: number
  buybacks?: number
  gold_delta?: number
  xp_delta?: number
  xp_start?: number
  xp_end?: number
  killed?: Record<string, number>
  ability_uses?: Record<string, number>
  item_uses?: Record<string, number>
  deaths_pos?: Record<string, Record<string, number>>
}

export interface Teamfight {
  start: number
  end: number
  last_death?: number
  deaths?: number
  players: TeamfightPlayer[]
}

export interface OpenDotaMatch {
  match_id: number
  radiant_win: boolean
  duration: number
  game_mode: number
  lobby_type?: number
  start_time?: number
  radiant_score?: number
  dire_score?: number
  cluster?: number
  replay_salt?: number
  players: OpenDotaPlayer[]
  teamfights?: Teamfight[]
}

const cache = new Map<number, OpenDotaMatch>()

/** OpenDota 偶发挂起时不要让加载动画一直转。 */
const MATCH_TIMEOUT_MS = 12000

async function fetchMatchResponse(id: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), MATCH_TIMEOUT_MS)
  try {
    return await fetch(`https://api.opendota.com/api/matches/${id}`, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchMatch(matchId: string): Promise<OpenDotaMatch> {
  const id = Number(matchId)
  if (!Number.isFinite(id) || id <= 0) throw new Error('比赛 ID 必须是数字')
  const hit = cache.get(id)
  if (hit) return hit

  let res: Response
  try {
    res = await fetchMatchResponse(id)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('OpenDota 请求超时（12 秒），请检查网络/代理或稍后重试')
    }
    throw new Error('无法连接 OpenDota，请检查网络/代理后重试')
  }

  if (res.status === 404) throw new Error('OpenDota 查不到这场比赛（ID 错误或尚未收录）')
  if (res.status === 429) throw new Error('OpenDota 请求过于频繁，请稍后重试')
  if (!res.ok) {
    throw new Error(`OpenDota 服务暂时不可用（HTTP ${res.status}），请稍后重试`)
  }

  let data: OpenDotaMatch | null = null
  try {
    data = (await res.json()) as OpenDotaMatch | null
  } catch {
    throw new Error('OpenDota 返回了无法解析的数据，请稍后重试')
  }
  if (!data || !data.match_id) throw new Error('OpenDota 返回空数据')
  cache.set(id, data)
  return data
}

export function isParsed(match: OpenDotaMatch): boolean {
  return match.players.some(
    (p) => (p.purchase_log?.length ?? 0) > 0 || (p.kills_log?.length ?? 0) > 0
  )
}

export function playerKey(p: OpenDotaPlayer): string {
  return `${p.player_slot}`
}

export function durationText(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function timeText(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function modeName(mode: number): string {
  const map: Record<number, string> = {
    1: '全英雄选择',
    2: '队长模式',
    3: '随机征召',
    4: '单一征召',
    5: '全随机',
    11: '中路对决',
    12: '技能征召',
    15: '全英雄选择',
    22: '天梯全英雄选择',
    23: '加速模式'
  }
  return map[mode] ?? `模式 ${mode}`
}
