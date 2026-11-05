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

export async function fetchStratzMatch(matchId: number, token: string): Promise<StratzMatch> {
  if (!token.trim()) throw new Error('高级分析需要 STRATZ API Token')
  const res = await fetch('/api/stratz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), query: QUERY, variables: { id: matchId } })
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
