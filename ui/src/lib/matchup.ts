import type { RosterPlayer } from './roster'
import { positionLabel } from './roster'

export type MatchupPreset = 'mid' | 'safe' | 'off' | 'custom'

export interface MatchupState {
  enabled: boolean
  preset: MatchupPreset
  allySlots: number[]
  enemySlots: number[]
  note: string
}

export const emptyMatchup: MatchupState = {
  enabled: false,
  preset: 'mid',
  allySlots: [],
  enemySlots: [],
  note: ''
}

export const presetLabels: Array<{ key: MatchupPreset; label: string }> = [
  { key: 'mid', label: '中单 1v1' },
  { key: 'safe', label: '优势路 2v2' },
  { key: 'off', label: '劣势路 2v2' },
  { key: 'custom', label: '自定义' }
]

const SAFE_GROUP = [1, 5]
const OFF_GROUP = [3, 4]

export function suggestPreset(p: RosterPlayer | null | undefined): MatchupPreset {
  if (!p) return 'mid'
  if (p.position === 2) return 'mid'
  if (p.position === 1 || p.position === 5) return 'safe'
  if (p.position === 3 || p.position === 4) return 'off'
  if (p.laneRole === 2) return 'mid'
  if (p.laneRole === 3) return 'off'
  if (p.laneRole === 1) return 'safe'
  return 'mid'
}

function hasPosition(list: RosterPlayer[]): boolean {
  return list.some((p) => p.position != null)
}

export function buildMatchup(
  roster: RosterPlayer[],
  focusSlot: number,
  preset: MatchupPreset
): MatchupState {
  const focus = roster.find((p) => p.slot === focusSlot)
  if (!focus) {
    return { ...emptyMatchup, enabled: true, preset }
  }
  const allies = roster.filter((p) => p.isRadiant === focus.isRadiant)
  const enemies = roster.filter((p) => p.isRadiant !== focus.isRadiant)
  const usePosition = hasPosition(roster)

  const allySlots = [focus.slot]
  let enemySlots: number[] = []
  const notes: string[] = []

  const pickByPosition = (list: RosterPlayer[], positions: number[]): RosterPlayer[] =>
    list.filter((p) => p.position != null && positions.includes(p.position))

  if (preset === 'mid') {
    const mids = usePosition
      ? pickByPosition(enemies, [2])
      : enemies.filter((p) => p.laneRole === 2)
    enemySlots = mids.slice(0, 1).map((p) => p.slot)
    if (focus.position != null && focus.position !== 2) {
      notes.push(`分析对象是${positionLabel(focus.position)}，不是中单`)
    }
  } else if (preset === 'safe' || preset === 'off') {
    const ownGroup = preset === 'safe' ? SAFE_GROUP : OFF_GROUP
    const enemyGroup = preset === 'safe' ? OFF_GROUP : SAFE_GROUP
    const ownLane = preset === 'safe' ? 1 : 3
    const enemyLane = preset === 'safe' ? 3 : 1

    const partner = usePosition
      ? pickByPosition(
          allies.filter((p) => p.slot !== focus.slot),
          ownGroup.filter((pos) => pos !== focus.position)
        ).slice(0, 1)
      : allies.filter((p) => p.slot !== focus.slot && p.laneRole === ownLane).slice(0, 1)
    if (partner.length) allySlots.push(partner[0].slot)

    const foes = usePosition
      ? pickByPosition(enemies, enemyGroup)
      : enemies.filter((p) => p.laneRole === enemyLane)
    enemySlots = foes.slice(0, 2).map((p) => p.slot)

    // 没有任何位置/分路数据时，预设也先填满 4 人，避免对位数据只剩分析对象
    if (!usePosition && !roster.some((p) => p.laneRole != null) && (!allySlots[1] || !enemySlots.length)) {
      const fallbackPartner = allies.find((p) => p.slot !== focus.slot)
      if (!allySlots[1] && fallbackPartner) allySlots.push(fallbackPartner.slot)
      if (!enemySlots.length) enemySlots = enemies.slice(0, 2).map((p) => p.slot)
      notes.push('缺少位置/分路数据，已按默认人选填充 2v2，请手动调整')
    }

    if (focus.position != null && !ownGroup.includes(focus.position)) {
      notes.push(`分析对象是${positionLabel(focus.position)}，不属于该分路组合`)
    }
  }

  if (preset === 'custom') {
    return {
      enabled: true,
      preset,
      allySlots: [focus.slot],
      enemySlots: [],
      note: '手动选择我方与对方的对位成员'
    }
  }

  const anyLane = roster.some((p) => p.laneRole != null)
  if (!usePosition && !anyLane) {
    notes.unshift('OpenDota 未解析分路且没有 STRATZ 位置数据，请手动选择对位')
  } else if (!usePosition) {
    notes.push('OpenDota 分路推断；配 STRATZ 可精确到 1–5 号位')
  }
  if (enemySlots.length === 0) {
    notes.push('没有识别到该分路的对手，请手动选择')
  }

  return {
    enabled: true,
    preset,
    allySlots: allySlots.slice(0, 2),
    enemySlots: enemySlots.slice(0, 2),
    note: notes.join('；')
  }
}
