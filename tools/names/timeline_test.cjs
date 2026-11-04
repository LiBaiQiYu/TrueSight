// 用 TypeScript 编译器把 timeline.ts 转成 ESM，做纯逻辑回归（不依赖浏览器）。
const fs = require('fs')
const path = require('path')
const ts = require(path.resolve('ui/node_modules/typescript'))

const source = fs.readFileSync('ui/src/lib/timeline.ts', 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText
const outPath = path.resolve('.cache/timeline.mjs')
fs.mkdirSync('.cache', { recursive: true })
fs.writeFileSync(outPath, code)

import(('file://' + outPath).replace(/\\/g, '/')).then((lib) => {
  const fails = []
  const check = (cond, msg) => {
    if (!cond) fails.push(msg)
  }

  check(lib.levelFromXp(0) === 1, 'xp0 -> lvl1，实际 ' + lib.levelFromXp(0))
  check(lib.levelFromXp(240) === 2, 'xp240 -> lvl2')
  check(lib.levelFromXp(5899) === 9, 'xp5899 -> lvl9')
  check(lib.levelFromXp(5900) === 10, 'xp5900 -> lvl10')
  check(lib.levelFromXp(63900) === 30, 'xp63900 -> lvl30')

  const point = (minute, extra = {}) => ({
    minute,
    netWorth: minute * 100,
    lastHits: minute * 2,
    denies: 0,
    xp: minute * 300,
    level: Math.min(30, minute),
    kills: 0,
    deaths: 0,
    heroDamage: 0,
    ...extra
  })

  const makePlayer = (slot, isRadiant, position, upgrades = []) => ({
    slot,
    heroId: slot,
    playerName: 'p' + slot,
    isRadiant,
    position,
    laneRole: null,
    isFocus: slot === 1,
    isMatchup: true,
    points: Array.from({ length: 31 }, (_, minute) => point(minute)),
    purchases: [{ sec: 600, key: 'item_blink', cost: 2250, source: 'opendota' }],
    purchaseSource: 'opendota',
    upgrades,
    talents: [],
    attributePicks: 0,
    finalItems: [],
    finalKda: { kills: 1, deaths: 1, assists: 1 }
  })

  const ability = (order) => ({ order, key: 'a' + order, kind: 'ability', tier: null, label: 'a' })
  const talent = (order, tier) => ({ order, key: 't' + tier, kind: 'talent', tier, label: 't' })
  const upgrades = [ability(1), ability(2), ability(3), ability(4), ability(5), talent(6, 1), ability(7)]
  const p = makePlayer(1, true, 1, upgrades)
  check(lib.acquiredUpgrades(p, 9).length === 5, '9 级时 5 个加点，实际 ' + lib.acquiredUpgrades(p, 9).length)
  check(lib.acquiredUpgrades(p, 10).length === 7, '10 级时全部 7 个加点（含 1 层天赋）')
  const many = Array.from({ length: 12 }, (_, i) => ability(i + 1))
  const p2 = makePlayer(2, true, 2, many)
  check(lib.acquiredUpgrades(p2, 8).length === 8, '8 级时最多 8 个加点，实际 ' + lib.acquiredUpgrades(p2, 8).length)
  check(lib.acquiredUpgrades(p, 5).length === 5, '5 级时 5 个加点')

  const players = [
    makePlayer(1, true, 1), makePlayer(2, true, 2), makePlayer(3, true, 3),
    makePlayer(4, true, 4), makePlayer(5, true, 5),
    makePlayer(6, false, 1), makePlayer(7, false, 2), makePlayer(8, false, 3),
    makePlayer(9, false, 4), makePlayer(10, false, 5)
  ]
  const pairs = lib.buildPositionPairs(players, true)
  check(pairs.length === 5, '同位置对 5 组，实际 ' + pairs.length)
  check(pairs[0].ally.slot === 1 && pairs[0].enemy.slot === 6, '1 号位配对错误')
  const pairs2 = lib.buildPositionPairs(players, false)
  check(pairs2[0].ally.slot === 6, '夜魇视角时我方应为 slot6')

  const noPos = players.map((x) => ({ ...x, position: null }))
  check(lib.buildPositionPairs(noPos, true).length === 0, '没有位置数据时不应产出配对')

  const series = { ...makePlayer(1, true, 1), points: [point(0, { netWorth: 0 }), point(1, { netWorth: 100 }), point(2, { netWorth: 200 })] }
  check(lib.interpolationAt(series, 90, 'netWorth') === 150, '插值 90 秒应为 150')
  check(lib.formatClock(3671) === '61:11', '时间格式化错误：' + lib.formatClock(3671))

  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS: timeline 逻辑回归全部通过')
  process.exit(fails.length ? 1 : 0)
})
