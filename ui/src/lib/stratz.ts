import type { OpenDotaMatch } from './opendota'

export interface StratzDeathEvent {
  time: number
}

export interface StratzGoldEvent {
  time: number
  amount: number
}

export interface StratzPlayback {
  deathEvents?: StratzDeathEvent[]
  goldEvents?: StratzGoldEvent[]
}

export interface StratzPlayer {
  steamAccountId?: number
  isRadiant?: boolean
  playerSlot?: number
  heroId?: number
  position?: string
  role?: string
  kills?: number
  deaths?: number
  assists?: number
  goldPerMinute?: number
  experiencePerMinute?: number
  networth?: number
  heroDamage?: number
  towerDamage?: number
  heroHealing?: number
  level?: number
  steamAccount?: { name?: string; avatar?: string }
  playbackData?: StratzPlayback
}

export interface StratzMatch {
  id: number
  startDateTime?: number
  durationSeconds?: number
  didRadiantWin?: boolean
  gameMode?: number
  lobbyType?: number
  players?: StratzPlayer[]
}

const QUERY = `query TrueSightMatch($id: Long!) {
  match(id: $id) {
    id
    startDateTime
    durationSeconds
    didRadiantWin
    gameMode
    lobbyType
    players {
      steamAccountId
      isRadiant
      playerSlot
      heroId
      position
      role
      kills
      deaths
      assists
      goldPerMinute
      experiencePerMinute
      networth
      heroDamage
      towerDamage
      heroHealing
      level
      steamAccount { name avatar }
      playbackData {
        deathEvents { time }
        goldEvents { time amount }
      }
    }
  }
}`

/** 比赛选择用的轻量查询：不拉 playbackData，减少 STRATZ 负载。 */
const FALLBACK_QUERY = `query TrueSightFallback($id: Long!) {
  match(id: $id) {
    id
    startDateTime
    durationSeconds
    didRadiantWin
    gameMode
    lobbyType
    players {
      isRadiant
      playerSlot
      heroId
      position
      role
      kills
      deaths
      assists
      goldPerMinute
      experiencePerMinute
      networth
      heroDamage
      towerDamage
      heroHealing
      level
      steamAccount { name avatar }
    }
  }
}`

async function requestStratz(matchId: number, token: string, query: string): Promise<StratzMatch> {
  if (!token.trim()) throw new Error('使用 STRATZ 备用源需要先在设置里填写 STRATZ API Token')
  const res = await fetch('/api/stratz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), query, variables: { id: matchId } })
  })
  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }
  if (!res.ok) {
    const msg =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error?: string }).error)
        : `STRATZ 请求失败: HTTP ${res.status}`
    throw new Error(msg)
  }
  const body = payload as {
    data?: { match?: StratzMatch | null }
    errors?: Array<{ message?: string }>
  } | null
  if (body?.errors?.length) {
    throw new Error('STRATZ 返回错误: ' + (body.errors[0]?.message ?? '未知错误'))
  }
  const match = body?.data?.match
  if (!match) throw new Error('STRATZ 没有这场比赛的数据')
  return match
}

export async function fetchStratzMatch(matchId: number, token: string): Promise<StratzMatch> {
  return requestStratz(matchId, token, QUERY)
}

function stratzSlot(player: StratzPlayer, index: number): number {
  const raw = player.playerSlot
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw >= 128) return Math.round(raw)
    if (raw >= 5) return Math.round(player.isRadiant ? raw - 5 : raw + 123)
    if (raw >= 0) return Math.round(player.isRadiant ? raw : raw + 128)
  }
  return player.isRadiant ? index % 5 : 128 + (index % 5)
}

/** 把 STRATZ 比赛转换成 OpenDota 结构，缺失字段保持 undefined。 */
export function stratzToOpenDotaMatch(match: StratzMatch): OpenDotaMatch {
  const players = (match.players ?? []).map((player, index) => ({
    player_slot: stratzSlot(player, index),
    isRadiant: Boolean(player.isRadiant),
    hero_id: player.heroId ?? 0,
    personaname: player.steamAccount?.name || `玩家 ${index + 1}`,
    kills: player.kills ?? 0,
    deaths: player.deaths ?? 0,
    assists: player.assists ?? 0,
    gold_per_min: player.goldPerMinute,
    xp_per_min: player.experiencePerMinute,
    net_worth: player.networth,
    hero_damage: player.heroDamage,
    tower_damage: player.towerDamage,
    hero_healing: player.heroHealing,
    level: player.level
  }))

  const rawStart = match.startDateTime
  let startTime: number | undefined
  if (typeof rawStart === 'number' && Number.isFinite(rawStart)) {
    startTime = rawStart > 1e12 ? Math.floor(rawStart / 1000) : Math.round(rawStart)
  }

  return {
    match_id: match.id,
    radiant_win: Boolean(match.didRadiantWin),
    duration: match.durationSeconds ?? 0,
    game_mode: match.gameMode ?? 0,
    lobby_type: match.lobbyType,
    start_time: startTime,
    players
  }
}

export async function fetchStratzMatchFallback(matchId: number, token: string): Promise<OpenDotaMatch> {
  const match = await requestStratz(matchId, token, FALLBACK_QUERY)
  return stratzToOpenDotaMatch(match)
}

export function findStratzPlayer(
  match: StratzMatch,
  heroId: number,
  isRadiant: boolean
): StratzPlayer | undefined {
  const list = match.players ?? []
  return (
    list.find((p) => p.heroId === heroId && p.isRadiant === isRadiant) ??
    list.find((p) => p.heroId === heroId)
  )
}

export function sampleGold(events: StratzGoldEvent[] | undefined, stepSeconds = 300): string {
  if (!events?.length) return ''
  const sorted = [...events].sort((a, b) => a.time - b.time)
  const out: string[] = []
  let next = stepSeconds
  let last = 0
  for (const e of sorted) {
    last = e.amount ?? last
    while (e.time >= next) {
      out.push(`${Math.floor(next / 60)}分:${last}`)
      next += stepSeconds
    }
  }
  out.push(`${Math.floor(sorted[sorted.length - 1].time / 60)}分:${last}`)
  return out.join('，')
}
