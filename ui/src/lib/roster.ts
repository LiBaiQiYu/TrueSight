import type { OpenDotaMatch } from './opendota'
import type { StratzMatch, StratzPlayer } from './stratz'

export interface RosterPlayer {
  slot: number
  heroId: number
  playerName: string
  isRadiant: boolean
  kills: number
  deaths: number
  assists: number
  laneRole: number | null
  position: number | null
  role: string
  hasOpenDota: boolean
  hasStratz: boolean
}

export function parsePosition(value: unknown): number | null {
  if (typeof value === 'number') {
    return value >= 1 && value <= 5 ? value : null
  }
  if (typeof value === 'string') {
    const numeric = value.match(/[1-5]/)
    if (numeric) return Number(numeric[0])
  }
  return null
}

function findStratz(match: StratzMatch | null, heroId: number, isRadiant: boolean): StratzPlayer | undefined {
  const list = match?.players ?? []
  return (
    list.find((p) => p.heroId === heroId && p.isRadiant === isRadiant) ??
    list.find((p) => p.heroId === heroId)
  )
}

export function buildRoster(match: OpenDotaMatch | null, stratz: StratzMatch | null): RosterPlayer[] {
  if (!match) return []
  return match.players.map((p) => {
    const sp = findStratz(stratz, p.hero_id, p.isRadiant)
    return {
      slot: p.player_slot,
      heroId: p.hero_id,
      playerName: p.personaname || p.name || sp?.steamAccount?.name || '未知玩家',
      isRadiant: p.isRadiant,
      kills: p.kills ?? sp?.kills ?? 0,
      deaths: p.deaths ?? sp?.deaths ?? 0,
      assists: p.assists ?? sp?.assists ?? 0,
      laneRole: p.lane_role ?? null,
      position: parsePosition(sp?.position),
      role: sp?.role ?? '',
      hasOpenDota: true,
      hasStratz: Boolean(sp)
    }
  })
}

export function positionLabel(position: number | null | undefined): string {
  switch (position) {
    case 1:
      return '1号位'
    case 2:
      return '中单'
    case 3:
      return '3号位'
    case 4:
      return '4号位'
    case 5:
      return '5号位'
    default:
      return ''
  }
}

export function laneLabel(laneRole: number | null | undefined): string {
  switch (laneRole) {
    case 1:
      return '优势路'
    case 2:
      return '中路'
    case 3:
      return '劣势路'
    default:
      return ''
  }
}

export function playerLaneText(p: RosterPlayer): string {
  const pos = positionLabel(p.position)
  if (pos) return pos
  return laneLabel(p.laneRole)
}
