// 背包/出装还原回归：
// - 高级分析（回放）用 6+3 格快照 + 真实卖出清单；
// - 基础模式（OpenDota）只保留出装路线，不再声称“此刻背包”。
const fs = require('fs')
const path = require('path')
const ts = require(path.resolve('ui/node_modules/typescript'))

const source = fs.readFileSync('ui/src/lib/timeline.ts', 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText
fs.mkdirSync('.cache', { recursive: true })
const out = path.resolve('.cache/timeline-inv.mjs')
fs.writeFileSync(out, code)

const items = JSON.parse(fs.readFileSync('data/names/items.json', 'utf8'))
const itemsByKey = new Map(items.map((item) => [item.key, item]))
const itemsById = new Map(
  items.filter((item) => item.id != null).map((item) => [item.id, item])
)
const itemCost = new Map()
for (const item of items) {
  if (item.cost != null) {
    itemCost.set(item.key, item.cost)
    itemCost.set(item.key_od, item.cost)
  }
}
const heroes = JSON.parse(fs.readFileSync('data/names/heroes.json', 'utf8'))
const names = {
  heroById: new Map(heroes.map((hero) => [hero.id, hero])),
  heroByKey: new Map(),
  abilityByKey: new Map(),
  abilityById: new Map(),
  talentById: new Map(),
  talentByHero: new Map(),
  talentByHeroId: new Map(),
  talentByHeroKey: new Map(),
  itemByKey: itemsByKey,
  itemById: itemsById,
  itemCost
}

const match = JSON.parse(fs.readFileSync('replays/9043325109.json', 'utf8'))
const replay = JSON.parse(fs.readFileSync('replays/9043325109-npc_dota_hero_luna.json', 'utf8'))
const focus = match.players.find((player) => player.hero_id === 48)
const roster = match.players.map((player) => ({
  slot: player.player_slot,
  heroId: player.hero_id,
  playerName: player.personaname || 'p',
  isRadiant: player.isRadiant,
  kills: player.kills,
  deaths: player.deaths,
  assists: player.assists,
  laneRole: null,
  position: null,
  role: '',
  hasOpenDota: true,
  hasStratz: false
}))

import(('file://' + out).replace(/\\/g, '/')).then((lib) => {
  const fails = []
  const check = (cond, msg) => { if (!cond) fails.push(msg) }

  const build = (replayData) => lib.buildTimelineModel({
    match,
    roster,
    focusSlot: focus.player_slot,
    allySlots: [],
    enemySlots: [],
    replay: replayData,
    names
  })

  const exact = build(replay).focus
  check(exact.purchaseSource === 'replay', '回放数据应成为购买来源')
  check(exact.inventoryExact === true, '有 6+1+3 格快照时 inventoryExact 应为 true')
  check(exact.finalItems.includes('item_swift_blink'), '终局应包含迅疾闪光')
  check(exact.finalItems.includes('item_rapier'), '终局应包含圣剑')
  check(exact.pregameCount === 6, '回放快照应保留 6 件赛前装')

  const inv20 = lib.inventoryAt(exact, 20 * 60).map((entry) => entry.key)
  const count20 = (key) => inv20.filter((item) => item === key).length
  check(count20('item_wraith_band') === 2, `20 分钟应有两枚怨灵系带，实际 ${inv20.join(',')}`)
  for (const key of ['item_power_treads', 'item_mask_of_madness', 'item_manta', 'item_blink']) {
    check(inv20.includes(key), `20 分钟背包应包含 ${key}，实际 ${inv20.join(',')}`)
  }
  check(!inv20.includes('item_boots_of_elves'), '动力鞋的精灵布带不应是散件')
  check(inv20.includes('item_poor_mans_shield'), '20 分钟打野装备应为穷鬼盾')
  check(exact.chartStepSec === 5, '回放走势应为 5 秒采样')
  const fine = exact.finePoints || []
  check(fine.length > 700, '回放走势点数应覆盖全场')
  check(fine[120]?.netWorth === 5065 && fine[120]?.lastHits === 78 && fine[120]?.level === 8,
    '10:00 回放走势应与录像一致，实际 ' + JSON.stringify(fine[120]))
  check(fine[360]?.netWorth === 19165 && fine[360]?.lastHits === 388,
    '30:00 回放走势应与录像一致，实际 ' + JSON.stringify(fine[360]))
  check(fine[fine.length - 1]?.assists === 17, '终局助攻应为 17')

  const sold = exact.purchases.filter((purchase) => purchase.soldAt != null)
  check(sold.some((purchase) => purchase.key === 'item_wraith_band' && purchase.soldAt === 1430),
    '23:50 应真实卖出一枚怨灵系带，实际 ' + JSON.stringify(sold))
  check(sold.some((purchase) => purchase.key === 'item_power_treads' && purchase.soldAt === 2699),
    '44:59 应真实卖出动力鞋，实际 ' + JSON.stringify(sold))
  check(!sold.some((purchase) => purchase.key === 'item_manta'), '幻影斧终局在背包，不应被卖')
  check(!sold.some((purchase) => purchase.key === 'item_mask_of_madness'), '疯狂面具被拆解，不应被卖')

  const at = (sec) => lib.inventoryAt(exact, sec).map((entry) => entry.key)
  check(at(1429).includes('item_magic_stick'), '23:50 前魔棒应在背包')
  check(!at(1430).includes('item_magic_stick'), '23:50 后魔棒应卖出')
  check(!at(2699).includes('item_power_treads'), '44:59 后动力鞋应卖出')
  check(at(2699).includes('item_manta'), '44:59 幻影斧应仍在背包')
  check(at(3600).includes('item_rapier'), '54:00 后圣剑应在背包（拾取）')

  const basic = build(null).focus
  check(basic.purchaseSource === 'opendota', '基础模式应使用 OpenDota')
  check(basic.inventoryExact === false, '基础模式不应声称精确背包')
  check(!basic.finePoints?.length && basic.chartStepSec === 60, '基础模式没有回放 5 秒走势')
  check(basic.purchases.some((purchase) => purchase.key === 'item_power_treads'),
    '基础模式仍应有出装路线（动力鞋购买记录）')

  const boots = exact.purchases.find((purchase) => purchase.key === 'item_boots')
  check(Boolean(boots && boots.mergedInto === 'item_power_treads'), '回放里鞋子应合成进动力鞋')
  const circlet = exact.purchases.find((purchase) => purchase.key === 'item_circlet')
  check(Boolean(circlet && circlet.mergedInto === 'item_wraith_band'), '回放里圆环应合成进怨灵系带')

  console.log('20 分钟背包：', inv20.join('，'))
  console.log('真实卖出：', sold.map((purchase) => `${purchase.key}@${purchase.soldAt}`).join('，'))
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS: 回放背包/卖出与基础模式分流通过')
  process.exit(fails.length ? 1 : 0)
})
