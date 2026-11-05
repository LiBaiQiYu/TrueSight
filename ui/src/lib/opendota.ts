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

export async function fetchMatch(matchId: string): Promise<OpenDotaMatch> {
  const id = Number(matchId)
  if (!Number.isFinite(id) || id <= 0) throw new Error('比赛 ID 必须是数字')
  const hit = cache.get(id)
  if (hit) return hit
  const res = await fetch(`https://api.opendota.com/api/matches/${id}`)
  if (res.status === 404) throw new Error('OpenDota 查不到这场比赛（ID 错误或尚未收录）')
  if (!res.ok) throw new Error('OpenDota 请求失败: HTTP ' + res.status)
  const data = (await res.json()) as OpenDotaMatch | null
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
