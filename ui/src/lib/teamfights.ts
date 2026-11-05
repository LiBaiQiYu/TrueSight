import type { NamesIndex } from './names'
import type { OpenDotaMatch, OpenDotaPlayer, Teamfight } from './opendota'
import type { ReplayParse } from './replay'

type Side = 'radiant' | 'dire'

export interface FightTotals {
  kills: number
  deaths: number
  damage: number
  healing: number
  gold: number
  xp: number
}

export interface FightParticipant {
  index: number
  slot: number
  heroId: number
  playerName: string
  heroName: string
  side: Side
  damage: number
  healing: number
  kills: number
  deaths: number
  gold: number
  xp: number
  abilities: Array<{ key: string; label: string; count: number }>
  items: Array<{ key: string; label: string; count: number }>
}

export interface FightAbsentee {
  index: number
  slot: number
  heroId: number
  playerName: string
  heroName: string
  side: Side
  status: 'dead' | 'late' | 'near' | 'farming' | 'away'
  statusLabel: string
  distance: number | null
  direction: string | null
  arrivedAt: number | null
  gold: number
  xp: number
  lastHits: number
  purchases: Array<{ key: string; label: string; sec: number }>
  pros: string[]
  cons: string[]
}

export interface TeamfightInfo {
  index: number
  start: number
  end: number
  duration: number
  participantCount: number
  participants: FightParticipant[]
  absentees: FightAbsentee[]
  totals: Record<Side, FightTotals>
  winner: Side | 'even'
}

const MIN_PARTICIPANTS = 6
/** 判定“在团战现场”的半径（cell，约 64 单位/cell）。 */
const FIGHT_RADIUS_CELLS = 22

/** 可以从远处造成英雄伤害的全屏/全球技能。 */
const GLOBAL_DAMAGE_ABILITIES = new Set([
  'zuus_thundergods_wrath',
  'invoker_sun_strike',
  'furion_wrath_of_nature',
  'spectre_haunt',
  'ancient_apparition_ice_blast',
  'dawnbreaker_solar_guardian'
])

/** 可以从远处治疗/给团队增益的全球技能。 */
const GLOBAL_SUPPORT_ABILITIES = new Set([
  'chen_hand_of_god',
  'treant_living_armor',
  'dawnbreaker_solar_guardian',
  'silencer_global_silence',
  'io_relocate'
])

function clampMinute(values: number[] | undefined, minute: number): number {
  if (!values || !values.length) return 0
  return values[Math.min(Math.max(0, minute), values.length - 1)] ?? 0
}

function heroKills(player: Teamfight['players'][number] | undefined): number {
  let count = 0
  for (const [unit, times] of Object.entries(player?.killed ?? {})) {
    if (unit.startsWith('npc_dota_hero_')) count += times
  }
  return count
}

function directionLabel(dx: number, dy: number): string {
  if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return '战场内'
  const horizontal = dx >= 0 ? '东' : '西'
  const vertical = dy >= 0 ? '南' : '北'
  if (Math.abs(dx) > Math.abs(dy) * 2) return horizontal
  if (Math.abs(dy) > Math.abs(dx) * 2) return vertical
  return horizontal + vertical
}

export function buildTeamfights(
  match: OpenDotaMatch,
  replay: ReplayParse | null | undefined,
  names: NamesIndex | null
): TeamfightInfo[] {
  const samples = replay?.positions?.samples ?? []
  const byPlayer = new Map<number, Array<[number, number, number]>>()
  for (const row of samples) {
    const [t, index, x, y] = row
    const list = byPlayer.get(index) ?? []
    list.push([t, x, y])
    byPlayer.set(index, list)
  }
  for (const list of byPlayer.values()) list.sort((a, b) => a[0] - b[0])

  const positionAt = (index: number, sec: number): [number, number] | null => {
    const list = byPlayer.get(index)
    if (!list?.length) return null
    let hit: [number, number, number] | null = null
    for (const row of list) {
      if (row[0] <= sec + 2) hit = row
      else break
    }
    return hit ? [hit[1], hit[2]] : null
  }

  const heroName = (heroId: number): string =>
    names?.heroById.get(heroId)?.cn || names?.heroById.get(heroId)?.en || `英雄 ${heroId}`

  const abilityLabel = (key: string): string =>
    names?.abilityByKey.get(key)?.cn || names?.abilityByKey.get(key)?.en || key

  const itemLabel = (key: string): string => {
    const normalized = key.startsWith('item_') ? key : `item_${key}`
    return names?.itemByKey.get(normalized)?.cn || names?.itemByKey.get(normalized)?.en || key
  }

  const fights: TeamfightInfo[] = []

  for (const [fightIndex, fight] of (match.teamfights ?? []).entries()) {
    if (!fight || fight.start < 0 || !fight.players?.length) continue
    const duration = Math.max(0, (fight.end ?? fight.start) - fight.start)
    if (duration < 3) continue

    // 参团候选：造成伤害、治疗/给盾，或在团战窗口内使用过技能（增益/控制等）。
    const damageIndexes: number[] = []
    const candidateIndexes: number[] = []
    fight.players.forEach((player, index) => {
      if (!player) return
      if ((player.damage ?? 0) > 0) damageIndexes.push(index)
      const support =
        (player.healing ?? 0) > 0 ||
        Object.keys(player.ability_uses ?? {}).length > 0 ||
        Object.keys(player.item_uses ?? {}).length > 0
      if ((player.damage ?? 0) > 0 || support) candidateIndexes.push(index)
    })
    if (!candidateIndexes.length) continue

    // 用造成伤害的玩家在团战期间的位置中位数作为战场中心，避免全屏技能玩家把中心带偏。
    const positions: Array<[number, number]> = []
    for (const index of damageIndexes.length ? damageIndexes : candidateIndexes) {
      for (const row of byPlayer.get(index) ?? []) {
        if (row[0] >= fight.start - 2 && row[0] <= (fight.end ?? fight.start) + 2) {
          positions.push([row[1], row[2]])
        }
      }
    }
    const median = (values: number[]): number | null => {
      if (!values.length) return null
      const sorted = [...values].sort((a, b) => a - b)
      return sorted[Math.floor(sorted.length / 2)]
    }
    const centroid: [number, number] | null = positions.length
      ? [median(positions.map((pos) => pos[0]))!, median(positions.map((pos) => pos[1]))!]
      : null

    const nearFight = (index: number): boolean => {
      if (!centroid) return true
      for (const row of byPlayer.get(index) ?? []) {
        if (row[0] < fight.start - 2 || row[0] > (fight.end ?? fight.start) + 2) continue
        if (Math.hypot(row[1] - centroid[0], row[2] - centroid[1]) <= FIGHT_RADIUS_CELLS) return true
      }
      return false
    }
    const abilityKeys = (index: number): string[] =>
      Object.keys(fight.players[index]?.ability_uses ?? {}).map((key) => key.toLowerCase())

    const hasGlobal = (index: number, globals: Set<string>): boolean =>
      abilityKeys(index).some((key) =>
        [...globals].some((global) => key === global || key.startsWith(global))
      )

    const globalDamage = (index: number): boolean => hasGlobal(index, GLOBAL_DAMAGE_ABILITIES)
    const globalSupport = (index: number): boolean => hasGlobal(index, GLOBAL_SUPPORT_ABILITIES)

    // 参团条件：
    // - 造成 >0 英雄伤害，且在战场附近；全球伤害技能可远程参团；
    // - 或治疗/给队友增益：在战场附近，或使用全球治疗/增益技能。
    const active = candidateIndexes
      .filter((index) => {
        const player = fight.players[index]
        if (!player) return false
        const near = nearFight(index)
        if ((player.damage ?? 0) > 0 && (near || globalDamage(index))) return true
        const support =
          (player.healing ?? 0) > 0 ||
          abilityKeys(index).length > 0 ||
          Object.keys(player.item_uses ?? {}).length > 0
        if (!support) return false
        return near || globalSupport(index)
      })
    if (active.length < MIN_PARTICIPANTS) continue

    const participants: FightParticipant[] = active.map((index) => {
      const fightPlayer = fight.players[index] ?? {}
      const player = match.players[index] as OpenDotaPlayer | undefined
      const abilities = Object.entries(fightPlayer.ability_uses ?? {})
        .map(([key, count]) => ({ key, label: abilityLabel(key), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
      const items = Object.entries(fightPlayer.item_uses ?? {})
        .map(([key, count]) => ({ key, label: itemLabel(key), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
      return {
        index,
        slot: player?.player_slot ?? index,
        heroId: player?.hero_id ?? 0,
        playerName: player?.personaname ?? `玩家 ${index + 1}`,
        heroName: heroName(player?.hero_id ?? 0),
        side: index < 5 ? 'radiant' : 'dire',
        damage: fightPlayer.damage ?? 0,
        healing: fightPlayer.healing ?? 0,
        kills: heroKills(fightPlayer),
        deaths: fightPlayer.deaths ?? 0,
        gold: fightPlayer.gold_delta ?? 0,
        xp: fightPlayer.xp_delta ?? 0,
        abilities,
        items
      }
    })

    const totals: Record<Side, FightTotals> = {
      radiant: { kills: 0, deaths: 0, damage: 0, healing: 0, gold: 0, xp: 0 },
      dire: { kills: 0, deaths: 0, damage: 0, healing: 0, gold: 0, xp: 0 }
    }
    for (const row of participants) {
      const bucket = totals[row.side]
      bucket.kills += row.kills
      bucket.deaths += row.deaths
      bucket.damage += row.damage
      bucket.healing += row.healing
      bucket.gold += row.gold
      bucket.xp += row.xp
    }
    const scoreDiff = totals.radiant.kills - totals.dire.kills
    const goldDiff = totals.radiant.gold - totals.dire.gold
    const winner: Side | 'even' =
      scoreDiff > 0 || (scoreDiff === 0 && goldDiff > 400)
        ? 'radiant'
        : scoreDiff < 0 || (scoreDiff === 0 && goldDiff < -400)
          ? 'dire'
          : 'even'

    const absentees: FightAbsentee[] = []
    fight.players.forEach((fightPlayer, index) => {
      if (active.includes(index)) return
      const player = match.players[index] as OpenDotaPlayer | undefined
      if (!player) return
      const pos = positionAt(index, fight.start)
      const hpSample = samples.find((row) => row[1] === index && row[0] >= fight.start && row[0] <= fight.start + 5)
      const dead = hpSample != null && hpSample[5] > 0 ? hpSample[4] <= 0 : false

      let distance: number | null = null
      if (pos && centroid) {
        distance = Math.hypot(pos[0] - centroid[0], pos[1] - centroid[1])
      }

      const direction = pos && centroid ? directionLabel(pos[0] - centroid[0], pos[1] - centroid[1]) : null

      let arrivedAt: number | null = null
      if (centroid) {
        for (const row of byPlayer.get(index) ?? []) {
          if (row[0] < fight.start - 10 || row[0] > fight.end + 12) continue
          if (Math.hypot(row[1] - centroid[0], row[2] - centroid[1]) <= FIGHT_RADIUS_CELLS) {
            arrivedAt = row[0]
            break
          }
        }
      }

      const startMinute = Math.floor(fight.start / 60)
      const endMinute = Math.ceil((fight.end ?? fight.start) / 60)
      const lastHits = Math.max(
        0,
        clampMinute(player.lh_t, endMinute) - clampMinute(player.lh_t, startMinute)
      )
      const gold = Math.max(
        0,
        (fightPlayer.gold_delta ?? 0) ||
          clampMinute(player.networth_t, endMinute) - clampMinute(player.networth_t, startMinute)
      )
      const xp = Math.max(
        0,
        (fightPlayer.xp_delta ?? 0) || clampMinute(player.xp_t, endMinute) - clampMinute(player.xp_t, startMinute)
      )

      const purchases = (player.purchase_log ?? [])
        .filter((entry) => (entry.time ?? 0) >= fight.start - 30 && (entry.time ?? 0) <= (fight.end ?? fight.start) + 120)
        .map((entry) => {
          const key = entry.key.startsWith('item_') ? entry.key : `item_${entry.key}`
          return { key, label: itemLabel(entry.key), sec: entry.time ?? 0 }
        })

      let status: FightAbsentee['status'] = 'away'
      if (dead) status = 'dead'
      else if (arrivedAt != null && arrivedAt <= (fight.end ?? fight.start) - 2) status = 'late'
      else if (distance != null && distance <= FIGHT_RADIUS_CELLS) status = 'near'
      else if (lastHits >= 4 || gold >= 120) status = 'farming'

      const statusLabel: Record<FightAbsentee['status'], string> = {
        dead: '阵亡中',
        late: '迟到',
        near: '在附近',
        farming: '在发育',
        away: '远离战场'
      }

      const pros: string[] = []
      const cons: string[] = []
      const ownSide: Side = index < 5 ? 'radiant' : 'dire'
      const enemySide: Side = ownSide === 'radiant' ? 'dire' : 'radiant'
      const teamGold = totals[ownSide].gold - totals[enemySide].gold

      if (dead) {
        cons.push('团战期间处于阵亡状态，无法参团（属于团队损失，不是决策问题）')
      } else {
        if (status === 'late') {
          cons.push(`团战结束前约 ${Math.max(0, Math.round((fight.end ?? fight.start) - arrivedAt!))} 秒才靠近战场，属于迟到`)
        } else if (status === 'near') {
          cons.push('人就在战场附近，却没有造成伤害/控制，需要复盘团战决策与沟通')
        } else if (status === 'farming') {
          pros.push(`团战期间补刀 +${lastHits}、经济 +${Math.round(gold)}、经验 +${Math.round(xp)}，换到了发育`)
        } else {
          cons.push('远离战场且期间没有明显发育收益，可能是判断或沟通问题')
        }

        if (status !== 'late' && status !== 'near') {
          cons.push('少一个输出/控制位，团队只能以少打多')
        }

        if (winner === 'even') {
          pros.push('团战整体均势，缺席没有造成明显经济劣势')
        } else if (winner === ownSide) {
          pros.push('本队仍然赢下团战，缺席的代价较小')
        } else {
          cons.push(`本队输掉团战，团队经济 ${teamGold >= 0 ? '+' : ''}${Math.round(teamGold)}`)
        }

        const keyItem = purchases.find((entry) => entry.sec >= fight.start - 30)
        if (keyItem) {
          pros.push(`团战前后完成 ${keyItem.label}，若是关键装备则缺席有合理性`)
        }
      }

      absentees.push({
        index,
        slot: player.player_slot,
        heroId: player.hero_id,
        playerName: player.personaname ?? `玩家 ${index + 1}`,
        heroName: heroName(player.hero_id),
        side: index < 5 ? 'radiant' : 'dire',
        status,
        statusLabel: statusLabel[status],
        distance,
        direction,
        arrivedAt,
        gold: Math.round(gold),
        xp: Math.round(xp),
        lastHits,
        purchases,
        pros,
        cons
      })
    })

    fights.push({
      index: fightIndex,
      start: fight.start,
      end: fight.end ?? fight.start,
      duration,
      participantCount: active.length,
      participants,
      absentees,
      totals,
      winner
    })
  }

  return fights.sort((a, b) => a.start - b.start)
}
