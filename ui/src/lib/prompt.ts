import type { HeroInfo } from './heroes'
import type { Depth } from './config'
import type { ReplayParse } from './replay'
import type { RosterPlayer } from './roster'
import type { NamesIndex } from './names'
import { positionLabel } from './roster'
import {
  durationText,
  modeName,
  timeText,
  type OpenDotaMatch,
  type OpenDotaPlayer
} from './opendota'
import {
  findStratzPlayer,
  sampleGold,
  type StratzMatch,
  type StratzPlayer
} from './stratz'
import type { ReplaySeriesPlayer } from './replay'

export interface DataSources {
  opendota: boolean
  stratz: boolean
  clarity?: boolean
}

export interface PromptInput {
  depth: Depth
  sources: DataSources
  match: OpenDotaMatch | null
  stratz: StratzMatch | null
  heroId: number
  heroName: string
  playerName: string
  isRadiant: boolean
  heroes: Map<number, HeroInfo> | null
  names?: NamesIndex | null
  roster?: RosterPlayer[]
  matchup?: { allySlots: number[]; enemySlots: number[] }
  replay?: ReplayParse | null
  replays?: Record<number, ReplayParse> | null
}

function heroLabel(
  heroes: Map<number, HeroInfo> | null,
  id: number,
  names?: NamesIndex | null
): string {
  return names?.heroById.get(id)?.cn || heroes?.get(id)?.localized || `hero#${id}`
}

function itemLabel(names: NamesIndex | null | undefined, raw: string): string {
  const key = raw.startsWith('item_') ? raw : `item_${raw}`
  return names?.itemByKey.get(key)?.cn || raw.replace(/^item_/, '').replace(/_/g, ' ')
}

/** 把录像里的英文/内部名（如 Luna、npc_dota_hero_luna、Mana Break）映射成中文名。 */
function unitLabel(names: NamesIndex | null | undefined, raw: string | null | undefined): string {
  const value = (raw || '').trim()
  if (!value) return ''
  const direct = names?.heroByKey.get(value)?.cn
  if (direct) return direct
  if (value.startsWith('npc_dota_hero_')) {
    return names?.heroByKey.get(value)?.cn || prettyUnit(value)
  }
  if (names) {
    const lower = value.toLowerCase()
    const compact = lower.replace(/[^a-z0-9]/g, '')
    for (const hero of names.heroById.values()) {
      const key = hero.key.replace(/^npc_dota_hero_/, '')
      if (
        hero.en.toLowerCase() === lower ||
        key.replace(/_/g, ' ') === lower ||
        key.replace(/_/g, '') === compact ||
        hero.en.toLowerCase().replace(/[^a-z0-9]/g, '') === compact
      ) {
        return hero.cn
      }
    }
    const ability = names.abilityByKey.get(value)
    if (ability) return ability.cn
    for (const row of names.abilityByKey.values()) {
      if (row.en.toLowerCase() === lower) return row.cn
    }
  }
  return prettyUnit(value)
}

function abilityLabel(names: NamesIndex | null | undefined, raw: string): string {
  const key = (raw || '').trim()
  if (!key) return ''
  const direct = names?.abilityByKey.get(key)
  if (direct) return direct.cn
  const lower = key.toLowerCase()
  if (names) {
    for (const row of names.abilityByKey.values()) {
      if (row.en.toLowerCase() === lower) return row.cn
    }
  }
  return prettyUnit(key)
}

function openDotaLine(
  p: OpenDotaPlayer,
  heroes: Map<number, HeroInfo> | null,
  mark = '',
  names?: NamesIndex | null
): string {
  const bits = [heroLabel(heroes, p.hero_id, names), `KDA ${p.kills}-${p.deaths}-${p.assists}`]
  if (p.lane_role === 1) bits.push('分路 优势路')
  else if (p.lane_role === 2) bits.push('分路 中路')
  else if (p.lane_role === 3) bits.push('分路 劣势路')
  if (p.gold_per_min) bits.push(`GPM ${p.gold_per_min}`)
  if (p.xp_per_min) bits.push(`XPM ${p.xp_per_min}`)
  if (p.last_hits != null) bits.push(`正补 ${p.last_hits}${p.denies != null ? ` / 反补 ${p.denies}` : ''}`)
  if (p.net_worth) bits.push(`经济 ${p.net_worth}`)
  if (p.hero_damage) bits.push(`英雄伤害 ${p.hero_damage}`)
  if (p.tower_damage) bits.push(`建筑伤害 ${p.tower_damage}`)
  if (p.hero_healing) bits.push(`治疗 ${p.hero_healing}`)
  return `${mark}[${p.isRadiant ? '天辉' : '夜魇'}] ${bits.join('，')}`
}

function stratzLine(
  p: StratzPlayer,
  heroes: Map<number, HeroInfo> | null,
  mark = '',
  names?: NamesIndex | null
): string {
  const bits = [
    heroLabel(heroes, p.heroId ?? 0, names),
    `KDA ${p.kills ?? 0}-${p.deaths ?? 0}-${p.assists ?? 0}`
  ]
  if (p.position) bits.push(`位置 ${p.position}`)
  if (p.level) bits.push(`等级 ${p.level}`)
  if (p.goldPerMinute) bits.push(`GPM ${p.goldPerMinute}`)
  if (p.experiencePerMinute) bits.push(`XPM ${p.experiencePerMinute}`)
  if (p.networth) bits.push(`经济 ${p.networth}`)
  if (p.heroDamage) bits.push(`英雄伤害 ${p.heroDamage}`)
  if (p.towerDamage) bits.push(`建筑伤害 ${p.towerDamage}`)
  return `${mark}[${p.isRadiant ? '天辉' : '夜魇'}] ${bits.join('，')}`
}

export function buildSystemPrompt(depth: Depth, matchup = false, hasReplay = false): string {
  const core =
    '你是 Dota 2 职业级复盘分析师。基于用户给出的真实比赛数据做中文分析，' +
    '结论必须落回数据，数据缺失就明确说缺失，禁止编造。时间一律用对局时间（分钟:秒）。' +
    '所有英雄、装备、消耗品、技能、天赋一律使用 Dota 2 中文官方译名（如“露娜”“闪烁匕首”“月蚀”），不要输出英文名。'
  const matchupNote = matchup
    ? '\n本次启用了「对位分析」：必须先展开这组对位的对线细节（补刀、经验、换血、击杀、游走与支援），再谈个人整体表现。'
    : ''
  if (depth === 'rough') {
    return (
      core +
      matchupNote +
      '\n本次是「粗略分析」：用 6-10 条要点讲清 1) 这场比赛胜负手；2) 该选手核心数据表现；' +
      '3) 两个最值得改的点。不要展开逐分钟时间线。' +
      '\n若同时给出 OpenDota 与 STRATZ，两边的经济/位置数据以 STRATZ 为准，技能与出装明细以 OpenDota 为准；' +
      '先在心里核对口径差异，不要在输出里长篇讨论数据源。'
    )
  }
  return (
    core +
    matchupNote +
    '\n本次是「高级分析」：需要 1) 核心结论；2) 对线期与中期节奏拆解（引用具体时间点）；' +
    '3) 出装与技能选择评估；4) 团战站位与决策问题；5) 分操作/策略两层的改进建议。' +
    '\n若提供双源数据，先做一段简短的双源汇总（说明两边的差异与采信取舍），再展开分析。' +
    'STRATZ 缺失的条目（如出装明细）要明确标注为数据缺失，不要用 OpenDota 的口径硬填。' +
    (hasReplay
      ? '\n已附上本地录像（Clarity）的战斗日志：击杀时间线、装备购买、技能释放与伤害数据是事实基准。' +
        '分析必须引用录像中的具体时间点与事件；OpenDota/STRATZ 与录像冲突时，以录像为准并说明差异。'
      : '')
  )
}

function prettyUnit(unit: string): string {
  return unit.replace(/^npc_dota_hero_/, '').replace(/_/g, ' ')
}

function sampleTimeline(points: ReplayParse['timeline']): ReplayParse['timeline'] {
  if (points.length <= 40) return points
  const step = Math.ceil(points.length / 40)
  return points.filter((_, i) => i % step === 0 || i === points.length - 1)
}

function replayLines(r: ReplayParse, names?: NamesIndex | null): string[] {
  const lines: string[] = ['【本地录像解析（Clarity，游戏时间；事件来自战斗日志）】']
  const winner = r.winner === 2 ? '天辉胜' : r.winner === 3 ? '夜魇胜' : '胜负未知'
  lines.push(
    `录像判定 ${winner}｜击杀比分 ${r.final.radiant} : ${r.final.dire}｜时长 ${durationText(r.playbackSec)}` +
      (r.clockCalibrated ? '' : '｜时钟未校准，时间可能有偏移')
  )

  if (r.scoreboard.length) {
    const board = [...r.scoreboard].sort((a, b) => b.k - a.k)
    lines.push(
      '全场 K/D/A（官方结算，含召唤物）：' +
        board.map((p) => `${unitLabel(names, p.hero)} ${p.k}/${p.d}/${p.a ?? 0}`).join('；')
    )
  }
  if (r.damageDealt.length) {
    const top = [...r.damageDealt].sort((a, b) => b.v - a.v).slice(0, 5)
    lines.push('英雄伤害前五（官方，含召唤物）：' + top.map((d) => `${unitLabel(names, d.hero)} ${d.v}`).join('；'))
  }
  if (r.damageTaken.length) {
    const top = [...r.damageTaken].sort((a, b) => b.v - a.v).slice(0, 5)
    lines.push('承受伤害前五（英雄本体）：' + top.map((d) => `${unitLabel(names, d.hero)} ${d.v}`).join('；'))
  }
  if (r.timeline.length) {
    const sample = sampleTimeline(r.timeline)
    lines.push(
      '击杀时间线（天辉-夜魇）：' +
        sample.map((p) => `${p.t} ${p.radiant}-${p.dire}`).join('；') +
        (sample.length < r.timeline.length ? `（共 ${r.timeline.length} 条，已抽样）` : '')
    )
  }

  const f = r.focus
  lines.push(`录像焦点单位：${unitLabel(names, f.unit)}`)
  const compact = (value: string): string =>
    value
      .toLowerCase()
      .replace(/^npc_dota_hero_/, '')
      .replace(/^cdota_unit_hero_/, '')
      .replace(/[^a-z0-9]/g, '')
  const focusOfficial = r.scoreboard.find((row) => compact(row.hero) === compact(f.unit))
  if (focusOfficial) {
    lines.push(
      `录像官方 KDA：${focusOfficial.k}-${focusOfficial.d}-${focusOfficial.a ?? 0}` +
        (focusOfficial.k > f.kills.length ? `（下方事件为本体击杀 ${f.kills.length} 次，召唤物击杀已计入官方 KDA）` : '')
    )
  }
  const eventText = (e: ReplayParse['focus']['kills'][number]): string => {
    const a = unitLabel(names, e.a)
    const b = e.b ? `（${abilityLabel(names, e.b)}）` : ''
    return `[${e.t}] ${a}${b}`
  }
  if (f.kills.length) {
    const partial = focusOfficial != null && focusOfficial.k > f.kills.length
    lines.push(`${partial ? '录像本体击杀（不含召唤物）' : '录像击杀'}：` + f.kills.slice(0, 30).map(eventText).join('；'))
  }
  if (f.deaths.length) {
    lines.push('录像死亡：' + f.deaths.slice(0, 30).map(eventText).join('；'))
  }
  if (f.purchases.length) {
    const buys = f.purchases.slice(0, 40).map((p) => `[${p.t}] ${itemLabel(names, p.a)}`)
    lines.push('录像装备购买：' + buys.join('；'))
  }
  if (f.casts.length) {
    const casts = [...f.casts].sort((a, b) => b.n - a.n).slice(0, 12)
    lines.push('录像技能释放次数：' + casts.map((c) => `${abilityLabel(names, c.ability)}×${c.n}`).join('；'))
  }
  if (f.notes.length) {
    lines.push('录像其他事件：' + f.notes.slice(0, 20).map(eventText).join('；'))
  }
  lines.push('以上录像事件为事实基准：引用时间点、出装与技能时必须与录像一致；与其他数据源冲突时以录像为准。')
  lines.push('')
  return lines
}

function clockSec(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^(\d+):(\d{2})$/.exec(value.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function replaySlotOf(playerSlot: number): number {
  return playerSlot >= 128 ? playerSlot - 128 + 5 : playerSlot
}

function seriesRowOf(replay: ReplayParse | null | undefined, playerSlot: number): ReplaySeriesPlayer | undefined {
  return replay?.series?.players.find((row) => row.slot === replaySlotOf(playerSlot))
}

function replayPurchases(replay: ReplayParse, names: NamesIndex | null | undefined): string {
  const rows = replay.focus.purchases
    .map((event) => ({ sec: clockSec(event.t), key: event.a }))
    .filter((row): row is { sec: number; key: string } => row.sec != null && row.sec <= 600)
    .sort((a, b) => a.sec - b.sec)
  if (!rows.length) return '无'
  const wardCounts: Record<string, { n: number; first: number }> = {}
  const wardBySec = new Map<number, Set<string>>()
  const normal: string[] = []
  for (const row of rows) {
    const key = row.key.toLowerCase()
    if (key.includes('ward')) {
      const set = wardBySec.get(row.sec) ?? new Set<string>()
      set.add(row.key)
      wardBySec.set(row.sec, set)
    } else if (normal.length < 40) {
      const tag = /tango|flask|clarity|mango|faerie|cheese|salve/.test(key) ? '·补给' : ''
      normal.push(
        `${Math.floor(row.sec / 60)}:${String(row.sec % 60).padStart(2, '0')} ${itemLabel(names, row.key)}${tag}`
      )
    }
  }
  for (const [sec, keys] of wardBySec) {
    const hasDispenser = [...keys].some((key) => key.toLowerCase().includes('dispenser'))
    if (hasDispenser) {
      // 组合守卫拆成 1 真眼 + 1 假眼；同一秒的散件记录不再重复计数
      for (const key of ['item_ward_observer', 'item_ward_sentry']) {
        const entry = wardCounts[key] ?? { n: 0, first: sec }
        entry.n += 1
        entry.first = Math.min(entry.first, sec)
        wardCounts[key] = entry
      }
      continue
    }
    for (const key of keys) {
      const entry = wardCounts[key] ?? { n: 0, first: sec }
      entry.n += 1
      entry.first = Math.min(entry.first, sec)
      wardCounts[key] = entry
    }
  }
  const parts: string[] = []
  if (normal.length) parts.push(normal.join('；'))
  const wards = Object.entries(wardCounts)
    .map(
      ([key, value]) =>
        `${itemLabel(names, key)}×${value.n}（首次 ${Math.floor(value.first / 60)}:${String(value.first % 60).padStart(2, '0')}）`
    )
    .join('、')
  if (wards) parts.push(`视野：${wards}`)
  return parts.join('；') || '无'
}

function replayHpMp(replay: ReplayParse | null | undefined, playerSlot: number): string {
  const row = seriesRowOf(replay, playerSlot)
  if (!row) return '回放无该英雄采样'
  const step = replay?.series?.step || 5
  if (!row.hp?.length && !row.mp?.length) return 'HP/MP 数据缺失（回放缓存需重新解析）'
  const parts: string[] = []
  for (let min = 0; min <= 10; min += 1) {
    const index = Math.round((min * 60) / step)
    const hp = row.hp?.[index]
    const mp = row.mp?.[index]
    if (hp == null && mp == null) continue
    parts.push(`${min}分 ${hp ?? '?'}/${mp ?? '?'}`)
  }
  return parts.length ? parts.join(' → ') + '（HP%/MP%）' : '回放无该英雄采样'
}

function replayLaneBlock(
  player: OpenDotaPlayer,
  slotPlayer: RosterPlayer | undefined,
  replay: ReplayParse | null,
  names: NamesIndex | null | undefined,
  heroes: Map<number, HeroInfo> | null
): string[] {
  const hero = heroLabel(heroes, player.hero_id, names)
  const pos = positionLabel(slotPlayer?.position)
  const lines: string[] = [
    `[${player.isRadiant ? '天辉' : '夜魇'}] ${hero}（${player.personaname || player.name || '?'}${pos ? `，${pos}` : ''}）`
  ]
  if (!replay) {
    lines.push('  - 回放数据未就绪（该英雄录像解析缺失）')
    return lines
  }
  const row = seriesRowOf(replay, player.player_slot)
  const step = replay.series?.step || 5
  const index = Math.round(600 / step)
  if (row) {
    const stat = (values: Array<number | null> | undefined): string =>
      values?.[index] == null ? '?' : String(values[index])
    lines.push(
      `  - 10:00 经济 ${stat(row.netWorth)}｜正补 ${stat(row.lastHits)}/反补 ${stat(row.denies)}｜等级 ${stat(row.level)}｜KDA ${stat(row.kills)}-${stat(row.deaths)}-${stat(row.assists)}｜英雄伤害 ${stat(row.heroDamage)}`
    )
  }
  lines.push(`  - HP/MP：${replayHpMp(replay, player.player_slot)}`)

  const castSource = replay.focus.casts10?.length ? replay.focus.casts10 : replay.focus.casts
  const casts = castSource
    .filter((cast) => {
      if (!names) return true
      const ability = names.abilityByKey.get(cast.ability)
      return Boolean(ability && ability.hero_id === player.hero_id)
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, 10)
  lines.push(
    `  - ${replay.focus.casts10?.length ? '前10分钟' : '全场'}技能释放次数：` +
      (casts.length ? casts.map((cast) => `${abilityLabel(names, cast.ability)}×${cast.n}`).join('；') : '无记录')
  )
  lines.push(`  - 前10分钟购买：${replayPurchases(replay, names)}`)

  const nonHero = /^(npc[ _]dota|creep|tower|goodguys|badguys|neutral|roshan|tormentor)/i
  const firstTen = (events: ReplayParse['focus']['kills']): string =>
    events
      .filter((event) => (clockSec(event.t) ?? 9999) <= 600 && !nonHero.test(event.a))
      .slice(0, 12)
      .map((event) => {
        const other = unitLabel(names, event.a)
        const skill = event.b ? `（${abilityLabel(names, event.b)}）` : ''
        return `${event.t} ${other}${skill}`
      })
      .join('；')
  const kills = firstTen(replay.focus.kills)
  const deaths = firstTen(replay.focus.deaths)
  if (kills) lines.push(`  - 前10分钟本体击杀（不含召唤物）：${kills}`)
  if (deaths) lines.push(`  - 前10分钟死亡：${deaths}`)

  const snapshots = replay.focus.items ?? []
  const atTen = [...snapshots]
    .map((snapshot) => ({ snapshot, sec: clockSec(snapshot.t) ?? 0 }))
    .filter((entry) => entry.sec <= 600)
    .sort((a, b) => a.sec - b.sec)
    .pop()
  if (atTen) {
    const keys = [
      ...atTen.snapshot.main,
      atTen.snapshot.neutral,
      ...atTen.snapshot.backpack
    ].filter((key): key is string => Boolean(key))
    if (keys.length) {
      const counts = new Map<string, number>()
      for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1)
      const text = [...counts.entries()]
        .map(([key, count]) => `${itemLabel(names, key)}${count > 1 ? `×${count}` : ''}`)
        .join('、')
      lines.push(`  - 10分钟装备：${text}`)
    }
  }
  return lines
}

function laneMatchupLines(input: PromptInput): string[] {
  const matchup = input.matchup
  const match = input.match
  if (!matchup || !match) return []
  if (!input.replay && !Object.keys(input.replays ?? {}).length) return []
  const slots = [...new Set([...matchup.allySlots, ...matchup.enemySlots])]
  if (!slots.length) return []
  const lines: string[] = ['【对位前 10 分钟数据（优先使用录像 5 秒采样）】']
  for (const slot of slots) {
    const player = match.players.find((row) => row.player_slot === slot)
    if (!player) continue
    const rosterPlayer = input.roster?.find((row) => row.slot === slot)
    const replay = input.replays?.[player.hero_id] ?? (player.hero_id === input.heroId ? input.replay ?? null : null)
    lines.push(...replayLaneBlock(player, rosterPlayer, replay ?? null, input.names, input.heroes))
  }
  lines.push(
    '对位分析要求：' +
      '1) 重点拆解前10分钟对线换血（多人对位时结合队友配合）：结合 HP/MP 采样判断谁在赚、蓝量是否够用、哪些技能该放/不该放；' +
      '2) 说明双方补给（吃树/大药/清晰/芒果）与真假眼购买的时间、数量是否合理；消耗品按“先买先消耗”的队列（FIFO）归属，组合守卫按 1 真眼 + 1 假眼拆分；' +
      '3) 比较两边辅助的游走/拉野/控线倾向。注意：录像数据不包含眼位坐标和拉野次数，缺失就明确说缺失，不要编造；' +
      '4) 给出可执行的改进：如何在尽量少耗蓝的前提下多换血、何时用蓝换血/用血换蓝更划算、下一次对线应该怎么处理。'
  )
  lines.push('')
  return lines
}

export function buildUserPrompt(input: PromptInput): string {
  const { depth, sources, match, stratz, heroId, heroName, playerName, isRadiant, heroes, names } = input
  const lines: string[] = []

  const matchId = match?.match_id ?? stratz?.id ?? '未知'
  const duration = match ? durationText(match.duration) : stratz?.durationSeconds ? durationText(stratz.durationSeconds) : '未知'
  const winnerText = match
    ? match.radiant_win ? '天辉胜' : '夜魇胜'
    : stratz?.didRadiantWin != null
      ? stratz.didRadiantWin ? '天辉胜' : '夜魇胜'
      : '未知'
  const mode = match ? modeName(match.game_mode) : stratz?.gameMode != null ? modeName(stratz.gameMode) : '未知'

  lines.push(`比赛 ${matchId}｜${mode}｜时长 ${duration}｜${winnerText}`)
  if (match?.radiant_score != null && match?.dire_score != null) {
    lines.push(`人头 ${match.radiant_score} : ${match.dire_score}（OpenDota）`)
  }
  lines.push('')

  if (sources.opendota && match) {
    lines.push('【双方阵容与数据（OpenDota）】')
    for (const p of match.players) {
      const mark = p.hero_id === heroId ? '→ ' : ''
      lines.push(openDotaLine(p, heroes, mark, names))
    }
    lines.push('')
  }

  if (sources.stratz && stratz) {
    lines.push('【双方阵容与数据（STRATZ）】')
    for (const p of stratz.players ?? []) {
      const mark = p.heroId === heroId ? '→ ' : ''
      lines.push(stratzLine(p, heroes, mark, names))
    }
    lines.push('')
  }

  lines.push(`【分析对象】${heroName}（${playerName}，${isRadiant ? '天辉' : '夜魇'}）`)
  lines.push('')

  if (input.matchup && (input.matchup.allySlots.length || input.matchup.enemySlots.length)) {
    const label = (slot: number): string => {
      const p = match?.players.find((x) => x.player_slot === slot)
      const rp = input.roster?.find((x) => x.slot === slot)
      const pos = positionLabel(rp?.position)
      if (!p) return `slot#${slot}`
      return `${heroLabel(heroes, p.hero_id, names)}（${p.personaname || p.name || '?'}${pos ? ` · ${pos}` : ''}）`
    }
    lines.push('【对位分析范围】')
    if (input.matchup.allySlots.length) {
      lines.push('我方：' + input.matchup.allySlots.map(label).join(' + '))
    }
    if (input.matchup.enemySlots.length) {
      lines.push('对方：' + input.matchup.enemySlots.map(label).join(' + '))
    }
    lines.push(
      '请把重点放在这组对位：对线期的补刀/经验/换血/击杀与游走支援，以及中后期团战里的相互克制、站位与切入。'
    )
    lines.push('')
    lines.push(...laneMatchupLines(input))
  }

  const odPlayer = match?.players.find((p) => p.hero_id === heroId)
  const stPlayer = stratz ? findStratzPlayer(stratz, heroId, isRadiant) : undefined

  if (sources.opendota && odPlayer) {
    const buys = odPlayer.purchase_log ?? []
    if (buys.length) {
      lines.push('【出装时间线（OpenDota，对局时间）】')
      lines.push(
        buys
          .slice(0, 40)
          .map((b) => `[${timeText(b.time)}] ${itemLabel(names, b.key)}`)
          .join('；')
      )
      lines.push('')
    }

    const kills = odPlayer.kills_log ?? []
    if (kills.length) {
      lines.push('【击杀时间线（OpenDota）】')
      lines.push(kills.slice(0, 40).map((k) => `[${timeText(k.time)}] ${unitLabel(names, k.key)}`).join('；'))
      lines.push('')
    }

    if (odPlayer.gold_t?.length && odPlayer.lh_t?.length) {
      const points: string[] = []
      for (let m = 10; m < odPlayer.gold_t.length && m <= 60; m += 10) {
        const gold = odPlayer.gold_t[m]
        const lh = odPlayer.lh_t[m]
        if (gold == null) continue
        points.push(`${m}分 经济${gold}${lh != null ? ` / 正补${lh}` : ''}`)
      }
      if (points.length) {
        lines.push('【经济曲线（OpenDota）】')
        lines.push(points.join('，'))
        lines.push('')
      }
    }
  }

  if (sources.stratz && stPlayer) {
    lines.push('【STRATZ 明细】')
    const bits: string[] = []
    if (stPlayer.position) bits.push(`位置 ${stPlayer.position}`)
    if (stPlayer.role) bits.push(`角色 ${stPlayer.role}`)
    if (stPlayer.level) bits.push(`等级 ${stPlayer.level}`)
    if (stPlayer.networth) bits.push(`经济 ${stPlayer.networth}`)
    if (bits.length) lines.push(bits.join('，'))
    const deaths = stPlayer.playbackData?.deathEvents?.length
    if (deaths != null) lines.push(`阵亡事件 ${deaths} 次`)
    const gold = sampleGold(stPlayer.playbackData?.goldEvents)
    if (gold) lines.push(`经济采样：${gold}`)
    lines.push('')
  }

  if (input.replay) {
    lines.push(...replayLines(input.replay, names))
  }

  if (sources.opendota && sources.stratz) {
    lines.push('【双源汇总要求】')
    lines.push(
      '先简要列出两边不一致或互补的点（KDA、经济、位置），说明采信取舍，再开始复盘。'
    )
  } else if (sources.stratz && !sources.opendota) {
    lines.push('【数据缺失提示】当前仅使用 STRATZ：没有逐件出装与技能释放明细，相关结论需标注数据缺失。')
  } else if (sources.opendota && !sources.stratz) {
    lines.push('【数据缺失提示】当前仅使用 OpenDota：没有精确位置/角色与 STRATZ 经济采样。')
  }

  return lines.join('\n').trim()
}
