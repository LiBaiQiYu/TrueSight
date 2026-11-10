import type { NamesIndex } from './names'
import { abilityName, isUnitKey, itemName, unitName } from './labels'
import type { OpenDotaMatch, OpenDotaPlayer } from './opendota'
import type {
  ReplayCombatEvent,
  ReplayCombatSample,
  ReplayParse,
  ReplayPlayer
} from './replay'

export type DamageType = 'physical' | 'magical' | 'pure' | 'other'
export type Side = 'radiant' | 'dire'
export type CombatNodeType = 'solo' | 'skirmish' | 'teamfight' | 'multi' | 'assist'
export type FocusRole = 'kill' | 'death' | 'assist' | 'multi' | 'participant'

export interface DamageBreakdown {
  physical: number
  magical: number
  pure: number
  other: number
  total: number
}

export interface CombatHero {
  slot: number
  heroId: number
  heroName: string
  playerName: string
  /** 统计里是否包含德鲁伊小熊（熊灵）的伤害/技能/物品 */
  includesBear: boolean
  /** 合成行：德鲁伊的小熊 */
  isBear?: boolean
  ownerSlot?: number | null
  side: Side
  kills: number
  assists: number
  deaths: number
  damage: DamageBreakdown
  taken: DamageBreakdown
  healing: number
  basicHits: number
  basicDamage: number
  abilities: Array<{ key: string; label: string; count: number }>
  items: Array<{ key: string; label: string; count: number }>
  hp: { start: number | null; min: number | null; end: number | null }
  mp: { start: number | null; min: number | null; end: number | null }
  gold: { start: number | null; end: number | null; delta: number | null }
  xp: { start: number | null; end: number | null; delta: number | null }
  level: { start: number | null; end: number | null }
}

export interface IncomingDamage {
  actorSlot: number
  actorHero: string
  actorName: string
  source: string
  sourceType: 'basic' | 'ability' | 'item' | 'other'
  damageType: DamageType
  hits: number
  damage: number
}

export interface CombatDeath {
  t: number
  targetSlot: number
  targetHero: string
  killerSlot: number | null
  killerHero: string
  assists: number[]
}

export interface CombatTimelineEvent {
  t: number
  kind: 'DAMAGE' | 'ABILITY' | 'ITEM' | 'HEAL' | 'DEATH'
  actorSlot: number | null
  actorHero: string
  targetSlot: number | null
  targetHero: string
  label: string
  value: number
  damageType?: DamageType
}

export interface CombatNode {
  index: number
  start: number
  end: number
  duration: number
  type: CombatNodeType
  focusRole: FocusRole
  result: Side | 'even'
  focusSlot: number
  participants: CombatHero[]
  focus: CombatHero | null
  deaths: CombatDeath[]
  incoming: IncomingDamage[]
  timeline: CombatTimelineEvent[]
}

const MERGE_WINDOW = 12
const WINDOW_BEFORE = 8
const WINDOW_AFTER = 8
const MAX_TIMELINE = 180

function emptyDamage(): DamageBreakdown {
  return { physical: 0, magical: 0, pure: 0, other: 0, total: 0 }
}

function damageType(value: number): DamageType {
  if (value === 1) return 'physical'
  if (value === 2) return 'magical'
  if (value === 4) return 'pure'
  return 'other'
}

function normalizedUnit(unit: string): string {
  return (unit || '').toLowerCase()
}

function sourceType(source: string, damageType: number, category: number): 'basic' | 'ability' | 'item' | 'other' {
  if (source.startsWith('item_')) return 'item'
  if (isUnitKey(source)) {
    return damageType === 1 && (category === 0 || category === 1) ? 'basic' : 'other'
  }
  if (source) return 'ability'
  return damageType === 1 && (category === 0 || category === 1) ? 'basic' : 'other'
}

function sourceLabel(
  source: string,
  names: NamesIndex | null,
  damageType: number,
  category: number,
  actorUnit = ''
): string {
  const lower = (source || '').toLowerCase()
  const isHeroUnit = lower.startsWith('npc_dota_hero_') || lower.startsWith('cdota_unit_hero_')
  if (!source || isHeroUnit) {
    if ((lower === 'npc_dota_hero_spirit_breaker' || actorUnit === 'npc_dota_hero_spirit_breaker') && damageType === 2) {
      return '强化攻击（Greater Bash）'
    }
    return damageType === 1 && (category === 0 || category === 1)
      ? '普通攻击'
      : '未归因伤害'
  }
  // 小兵 / 建筑 / 召唤物：直接给单位名，不再把内部类名当技能名显示
  if (isUnitKey(source)) {
    const label = unitName(source, names)
    return damageType === 1 && (category === 0 || category === 1) ? `${label} 普攻` : label
  }
  if (lower.startsWith('item_')) return itemName(source, names)
  return abilityName(source, names)
}

function emptyHero(
  slot: number,
  player: OpenDotaPlayer | undefined,
  replayPlayer: ReplayPlayer | undefined,
  names: NamesIndex | null
): CombatHero {
  const heroId = player?.hero_id ?? 0
  const named = names?.heroById.get(heroId)
  return {
    slot,
    heroId,
    heroName: named?.cn || named?.en || unitName(replayPlayer?.hero, names) || `英雄 ${heroId}`,
    includesBear: false,
    isBear: false,
    ownerSlot: null,
    playerName: player?.personaname || player?.name || replayPlayer?.name || `玩家 ${slot + 1}`,
    side: replayPlayer?.team === 3 || player?.isRadiant === false ? 'dire' : 'radiant',
    kills: 0,
    assists: 0,
    deaths: 0,
    damage: emptyDamage(),
    taken: emptyDamage(),
    healing: 0,
    basicHits: 0,
    basicDamage: 0,
    abilities: [],
    items: [],
    hp: { start: null, min: null, end: null },
    mp: { start: null, min: null, end: null },
    gold: { start: null, end: null, delta: null },
    xp: { start: null, end: null, delta: null },
    level: { start: null, end: null }
  }
}

function addAbility(row: CombatHero, key: string, label: string): void {
  const hit = row.abilities.find((entry) => entry.key === key)
  if (hit) hit.count += 1
  else row.abilities.push({ key, label, count: 1 })
}

function addItem(row: CombatHero, key: string, label: string): void {
  const hit = row.items.find((entry) => entry.key === key)
  if (hit) hit.count += 1
  else row.items.push({ key, label, count: 1 })
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}

interface Seed {
  event: ReplayCombatEvent
  t: number
  participants: Set<number>
  x: number
  y: number
}

export function buildCombatNodes(
  match: OpenDotaMatch,
  replay: ReplayParse | null | undefined,
  names: NamesIndex | null
): CombatNode[] {
  const combat = replay?.combat
  if (!replay || !combat?.events?.length) return []

  const players = replay.players ?? []
  const unitToSlot = new Map<string, number>()
  const slotToReplay = new Map<number, ReplayPlayer>()
  for (const player of players) {
    unitToSlot.set(normalizedUnit(player.hero), player.slot)
    slotToReplay.set(player.slot, player)
  }
  const loneDruidSlot = players.find(
    (player) => normalizedUnit(player.hero) === 'npc_dota_hero_lone_druid'
  )?.slot
  const isBearUnit = (unit: string): boolean => /^npc_dota_(?:hero_)?lone_druid_bear\d*$/.test(unit)
  const attackEvents = replay.attacks ?? []
  const bearAttackTimes = attackEvents.filter((entry) => entry.k === 'bear').map((entry) => entry.t)
  const ldHeroAttackTimes = attackEvents
    .filter((entry) => entry.k === 'hero' && entry.p === loneDruidSlot)
    .map((entry) => entry.t)
  const nearAttack = (times: number[], t: number): boolean =>
    times.some((at) => Math.abs(at - t) <= 0.5)

  /** 攻击方：熊灵归到德鲁伊身上（击杀/伤害/技能/物品与小熊同步）。 */
  const attackerSlotOf = (unit: string): number | undefined => {
    const direct = unitToSlot.get(unit)
    if (direct != null) return direct
    if (loneDruidSlot != null && isBearUnit(unit)) return loneDruidSlot
    return undefined
  }
  /** 受击方：熊灵不是英雄，不按德鲁伊的死亡/承伤统计。 */
  const victimSlotOf = (unit: string): number | undefined => unitToSlot.get(unit)
  const focusUnit = normalizedUnit(replay.focus?.unit ?? '')
  const focusSlot = unitToSlot.get(focusUnit)
  if (focusSlot == null) return []

  const events = combat.events
  const samples = combat.samples ?? []
  const deaths = events.filter((event) => event[1] === 'DEATH')
  const focusAnchors: Seed[] = deaths
    .map((event) => {
      const attackerSlot = attackerSlotOf(normalizedUnit(event[2]))
      const targetSlot = victimSlotOf(normalizedUnit(event[3]))
      // 回放死亡事件的 assist 列表会把击杀者也列进去，统计时排除击杀者与死者
      const assists = (Array.isArray(event[10]) ? event[10] : []).filter(
        (slot) => slot !== attackerSlot && slot !== targetSlot
      )
      const involved =
        attackerSlot === focusSlot ||
        targetSlot === focusSlot ||
        assists.includes(focusSlot)
      if (!involved) return null
      const participants = new Set<number>()
      if (attackerSlot != null) participants.add(attackerSlot)
      if (targetSlot != null) participants.add(targetSlot)
      for (const slot of assists) participants.add(slot)
      participants.add(focusSlot)
      return {
        event,
        t: event[0],
        participants,
        x: event[12],
        y: event[13]
      }
    })
    .filter((seed): seed is Seed => seed != null)

  if (!focusAnchors.length) return []

  const groups: Seed[][] = []
  for (const seed of focusAnchors) {
    const current = groups[groups.length - 1]
    if (!current) {
      groups.push([seed])
      continue
    }
    const previous = current[current.length - 1]
    const shared = [...seed.participants].some((slot) => previous.participants.has(slot))
    const distance =
      seed.x > 0 && seed.y > 0 && previous.x > 0 && previous.y > 0
        ? Math.hypot(seed.x - previous.x, seed.y - previous.y)
        : Number.POSITIVE_INFINITY
    if (seed.t - previous.t <= MERGE_WINDOW && (shared || distance <= 2500)) {
      current.push(seed)
    } else {
      groups.push([seed])
    }
  }

  const nodes: CombatNode[] = []
  for (const group of groups) {
    const start = Math.max(0, group[0].t - WINDOW_BEFORE)
    const end = group[group.length - 1].t + WINDOW_AFTER
    const focusRole: FocusRole =
      group.some((seed) => seed.event[2] && attackerSlotOf(normalizedUnit(seed.event[2])) === focusSlot)
        ? 'kill'
        : group.some((seed) => seed.event[3] && victimSlotOf(normalizedUnit(seed.event[3])) === focusSlot)
          ? 'death'
          : 'assist'

    const seedParticipants = new Set<number>()
    for (const seed of group) {
      for (const slot of seed.participants) seedParticipants.add(slot)
    }

    const windowEvents = events.filter((event) => event[0] >= start && event[0] <= end)
    // Include heroes connected to the seed by damage/heal/assist events. This
    // keeps unrelated lane kills out while still including support players who
    // casted first and never got the kill.
    let changed = true
    while (changed) {
      changed = false
      for (const event of windowEvents) {
        const actor = attackerSlotOf(normalizedUnit(event[2]))
        const target = victimSlotOf(normalizedUnit(event[3]))
        if (actor != null && seedParticipants.has(actor) && target != null && !seedParticipants.has(target)) {
          seedParticipants.add(target)
          changed = true
        }
        if (target != null && seedParticipants.has(target) && actor != null && !seedParticipants.has(actor)) {
          seedParticipants.add(actor)
          changed = true
        }
      }
    }

    const heroes = new Map<number, CombatHero>()
    for (const slot of seedParticipants) {
      const player = match.players[slot]
      heroes.set(slot, emptyHero(slot, player, slotToReplay.get(slot), names))
    }

    const bearSlot = loneDruidSlot != null ? 1000 + loneDruidSlot : null
    let bearRow: CombatHero | null = null
    if (bearSlot != null && loneDruidSlot != null && heroes.has(loneDruidSlot)) {
      const bearActive = windowEvents.some(
        (event) =>
          isBearUnit(normalizedUnit(event[2])) ||
          isBearUnit(normalizedUnit(event[3])) ||
          String(event[4] || '').toLowerCase().includes('lone_druid_entangle')
      )
      if (loneDruidSlot === focusSlot || bearActive) {
        const heroRow = heroes.get(loneDruidSlot) as CombatHero
        bearRow = emptyHero(bearSlot, match.players[loneDruidSlot], slotToReplay.get(loneDruidSlot), names)
        bearRow.heroId = heroRow.heroId
        bearRow.heroName = '熊灵'
        bearRow.playerName = '德鲁伊的小熊'
        bearRow.side = heroRow.side
        bearRow.isBear = true
        bearRow.ownerSlot = loneDruidSlot
        heroes.set(bearSlot, bearRow)
      }
    }

    const incomingMap = new Map<string, IncomingDamage>()
    const recentDamageSource = new Map<string, { source: string; t: number }>()
    const deathRows: CombatDeath[] = []
    const timeline: CombatTimelineEvent[] = []
    const radiantDeaths = { radiant: 0, dire: 0 }
    const samplesBySlot = new Map<number, ReplayCombatSample[]>()
    for (const sample of samples) {
      if (sample[0] < start - 1 || sample[0] > end + 1) continue
      const list = samplesBySlot.get(sample[1]) ?? []
      list.push(sample)
      samplesBySlot.set(sample[1], list)
    }

    const getHero = (slot: number | null): CombatHero | null => {
      if (slot == null) return null
      return heroes.get(slot) ?? null
    }

    for (const event of windowEvents) {
      const kind = event[1]
      const targetIsBear = event[3] ? isBearUnit(normalizedUnit(event[3])) : false
      const actorSlot = attackerSlotOf(normalizedUnit(event[2])) ?? null
      const targetSlot = victimSlotOf(normalizedUnit(event[3])) ?? null
      const actor = getHero(actorSlot)
      const target = getHero(targetSlot)
      const inflictorLower = String(event[4] || '').toLowerCase()
      const bearSource = inflictorLower.includes('lone_druid_entangle')
      let actorIsBear = event[2] ? isBearUnit(normalizedUnit(event[2])) : false
      if (actorSlot != null && loneDruidSlot != null && actorSlot === loneDruidSlot) {
        if (bearSource) {
          actorIsBear = true
        } else if (
          kind !== 'ABILITY' &&
          nearAttack(bearAttackTimes, event[0]) &&
          !nearAttack(ldHeroAttackTimes, event[0])
        ) {
          actorIsBear = true
        }
      }
      if (actorIsBear && actor) actor.includesBear = true
      const displayActor = actorIsBear ? bearRow : actor
      const displayActorSlot = actorIsBear ? bearSlot : actorSlot
      const actorUnit = event[2] ? normalizedUnit(event[2]) : ''
      const targetUnit = event[3] ? normalizedUnit(event[3]) : ''
      const inflictor = event[4] || ''
      const value = Math.max(0, event[5] || 0)
      const type = damageType(event[6])
      const category = event[14] ?? 0
      const damageSource = event[15] || ''
      const actorText = displayActor?.heroName ?? unitName(actorUnit, names)
      const targetText = targetIsBear ? '熊灵' : target?.heroName ?? unitName(targetUnit, names)
      const actorInNode = actorSlot != null && heroes.has(actorSlot)
      const targetInNode = targetSlot != null && heroes.has(targetSlot)
      if (kind !== 'DEATH' && !actorInNode && !targetInNode) continue

      if (kind === 'DEATH') {
        if (targetIsBear) {
          if (bearRow) bearRow.deaths += 1
          timeline.push({
            t: event[0],
            kind,
            actorSlot: displayActorSlot,
            actorHero: actorText,
            targetSlot: -1,
            targetHero: '熊灵',
            label: displayActor ? `${displayActor.heroName} 击杀熊灵` : '熊灵阵亡',
            value: 0
          })
          continue
        }
        if (targetSlot != null) {
          const victim = getHero(targetSlot)
          if (victim) {
            victim.deaths += 1
            radiantDeaths[victim.side] += 1
          }
        }
        const killer = actorSlot != null ? getHero(actorSlot) : null
        if (killer) killer.kills += 1
        const assists = (Array.isArray(event[10]) ? event[10] : []).filter(
          (slot) => slot !== actorSlot && slot !== targetSlot
        )
        for (const slot of assists) {
          const helper = getHero(slot)
          if (helper) helper.assists += 1
        }
        deathRows.push({
          t: event[0],
          targetSlot: targetSlot ?? -1,
          targetHero: targetText,
          killerSlot: actorSlot,
          killerHero: actorText,
          assists: [...assists]
        })
        timeline.push({
          t: event[0],
          kind,
          actorSlot: displayActorSlot,
          actorHero: actorText,
          targetSlot,
          targetHero: targetText,
          label: displayActor ? `${displayActor.heroName} 击杀 ${targetText}` : `${targetText} 阵亡`,
          value: 0
        })
        continue
      }

      if (kind === 'DAMAGE') {
        const contextKey = `${actorUnit}|${targetUnit}|${event[6]}`
        const previous = recentDamageSource.get(contextKey)
        let resolvedSource = inflictor
        // Some DoT ticks lose their inflictor. Reuse the source of the same
        // attacker → target damage type when it happened in the previous 2.5s.
        if (!resolvedSource && previous && event[6] !== 1 && event[0] - previous.t <= 2.5) {
          resolvedSource = previous.source
        }
        if (!resolvedSource && damageSource && !damageSource.startsWith('npc_dota_hero_')) {
          resolvedSource = damageSource
        }
        if (resolvedSource && (inflictor || !resolvedSource.startsWith('npc_dota_hero_'))) {
          recentDamageSource.set(contextKey, { source: resolvedSource, t: event[0] })
        }
        if (actor) {
          actor.damage[type] += value
          actor.damage.total += value
          if (sourceType(resolvedSource, event[6], category) === 'basic') {
            actor.basicHits += 1
            actor.basicDamage += value
          }
        }
        if (actorIsBear && bearRow) {
          bearRow.damage[type] += value
          bearRow.damage.total += value
          if (sourceType(resolvedSource, event[6], category) === 'basic') {
            bearRow.basicHits += 1
            bearRow.basicDamage += value
          }
        }
        if (target) {
          target.taken[type] += value
          target.taken.total += value
        }
        if (targetIsBear && bearRow) {
          bearRow.taken[type] += value
          bearRow.taken.total += value
        }
        if (targetSlot === focusSlot && displayActorSlot != null) {
          const label = sourceLabel(resolvedSource, names, event[6], category, actorUnit)
          const key = `${displayActorSlot}|${resolvedSource}|${type}`
          const hit = incomingMap.get(key) ?? {
            actorSlot: displayActorSlot,
            actorHero: actorText,
            actorName: displayActor?.playerName ?? '',
            source: label,
            sourceType: sourceType(resolvedSource, event[6], category),
            damageType: type,
            hits: 0,
            damage: 0
          }
          hit.hits += 1
          hit.damage += value
          incomingMap.set(key, hit)
        }
        timeline.push({
          t: event[0],
          kind,
          actorSlot: displayActorSlot,
          actorHero: actorText,
          targetSlot,
          targetHero: targetText,
          label: `${actorText} → ${targetText} · ${sourceLabel(resolvedSource, names, event[6], category, actorUnit)}`,
          value,
          damageType: type
        })
        continue
      }

      if (kind === 'ABILITY' || kind === 'ITEM') {
        if (kind === 'ITEM' && inflictor === 'item_madstone_bundle') continue
        if (kind === 'ABILITY' && ['invoker_quas', 'invoker_wex', 'invoker_exort', 'invoker_invoke'].includes(inflictor)) {
          continue
        }
        const sourceKey = inflictor || (kind === 'ABILITY' ? 'ability' : 'item')
        const sourceText = inflictor
          ? sourceLabel(inflictor, names, 0, 0)
          : kind === 'ABILITY'
            ? '技能'
            : '物品'
        if (actor) {
          if (kind === 'ABILITY') addAbility(actor, sourceKey, sourceText)
          else addItem(actor, sourceKey, sourceText)
        }
        if (actorIsBear && bearRow) {
          if (kind === 'ABILITY') addAbility(bearRow, sourceKey, sourceText)
          else addItem(bearRow, sourceKey, sourceText)
        }
        timeline.push({
          t: event[0],
          kind,
          actorSlot: displayActorSlot,
          actorHero: actorText,
          targetSlot,
          targetHero: targetText,
          label:
            kind === 'ABILITY'
              ? `${actorText} 释放 ${sourceText}`
              : `${actorText} 使用 ${sourceText}`,
          value
        })
        continue
      }

      if (kind === 'HEAL') {
        if (actor) actor.healing += value
        if (actorIsBear && bearRow) bearRow.healing += value
        timeline.push({
          t: event[0],
          kind,
          actorSlot: displayActorSlot,
          actorHero: actorText,
          targetSlot,
          targetHero: targetText,
          label: `${actorText} 治疗 ${targetText}`,
          value
        })
      }
    }

    if (bearRow) {
      const ld = heroes.get(loneDruidSlot as number)
      if (ld) {
        bearRow.kills = ld.kills
        bearRow.assists = ld.assists
      }
    }

    for (const [slot, hero] of heroes) {
      if (hero.isBear) continue
      const rows = (samplesBySlot.get(slot) ?? []).sort((a, b) => a[0] - b[0])
      if (!rows.length) continue
      const before = [...rows].reverse().find((row) => row[0] <= start) ?? rows[0]
      const after = rows.find((row) => row[0] >= end) ?? rows[rows.length - 1]
      const inside = rows.filter((row) => row[0] >= start && row[0] <= end)
      const hpValues = (inside.length ? inside : rows).map((row) => row[2]).filter((value) => value >= 0)
      const mpValues = (inside.length ? inside : rows).map((row) => row[3]).filter((value) => value >= 0)
      hero.hp = {
        start: before[2] >= 0 ? before[2] : null,
        min: hpValues.length ? Math.min(...hpValues) : null,
        end: after[2] >= 0 ? after[2] : null
      }
      hero.mp = {
        start: before[3] >= 0 ? before[3] : null,
        min: mpValues.length ? Math.min(...mpValues) : null,
        end: after[3] >= 0 ? after[3] : null
      }
      const goldStart = before[4] >= 0 ? before[4] : null
      const goldEnd = after[4] >= 0 ? after[4] : null
      const xpStart = before[5] >= 0 ? before[5] : null
      const xpEnd = after[5] >= 0 ? after[5] : null
      hero.gold = {
        start: goldStart,
        end: goldEnd,
        delta: goldStart != null && goldEnd != null ? goldEnd - goldStart : null
      }
      hero.xp = {
        start: xpStart,
        end: xpEnd,
        delta: xpStart != null && xpEnd != null ? xpEnd - xpStart : null
      }
      hero.level = {
        start: before[6] >= 0 ? before[6] : null,
        end: after[6] >= 0 ? after[6] : null
      }
    }

    const participants = [...heroes.values()]
    const heroCount = participants.filter((hero) => !hero.isBear).length
    const focus = heroes.get(focusSlot) ?? null
    const focusKills = focus
      ? group.filter((seed) => seed.event[2] && attackerSlotOf(normalizedUnit(seed.event[2])) === focusSlot).length
      : 0
    const nodeType: CombatNodeType =
      focusKills >= 2
        ? 'multi'
        : focusRole === 'assist'
          ? 'assist'
          : heroCount <= 2
            ? 'solo'
            : heroCount >= 6
              ? 'teamfight'
              : 'skirmish'
    const killsRadiant = radiantDeaths.dire
    const killsDire = radiantDeaths.radiant
    const result: Side | 'even' =
      killsRadiant > killsDire ? 'radiant' : killsDire > killsRadiant ? 'dire' : 'even'

    nodes.push({
      index: nodes.length,
      start,
      end,
      duration: Math.max(0, end - start),
      type: nodeType,
      focusRole,
      result,
      focusSlot,
      participants,
      focus,
      deaths: deathRows,
      incoming: [...incomingMap.values()].sort((a, b) => b.damage - a.damage),
      timeline: timeline.sort((a, b) => a.t - b.t).slice(0, MAX_TIMELINE)
    })
  }

  return nodes.sort((a, b) => a.start - b.start)
}
