// 弹窗模式交互回归：按钮打开、尺寸、滑条、节点、主题、Esc/按钮关闭、控制台错误。
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = Number(process.env.DOCK_PORT || 9345)
const URL =
  process.env.DOCK_URL ||
  'http://127.0.0.1:8078/?match=9043325109&hero=48&matchup=safe'
const WANT_LIGHT = URL.includes('mode=light')
const HOST = URL.replace(/^https?:\/\//, '').split('/')[0]
const profile = mkdtempSync(join(tmpdir(), 'edge-cdp-'))

const child = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    '--window-size=1600,800',
    URL
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getTarget() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((item) => item.type === 'page' && item.url.includes(HOST))
      if (page) return page
    } catch {
      /* retry */
    }
    await sleep(500)
  }
  throw new Error('未找到调试目标')
}

const page = await getTarget()
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let seq = 0
const pending = new Map()
const logs = []
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
    return
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    logs.push('console.error: ' + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    logs.push('exception: ' + (msg.params.exceptionDetails?.text ?? 'unknown'))
  }
}

function send(method, params = {}) {
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.result?.exceptionDetails) {
    throw new Error(result.result.exceptionDetails.text)
  }
  return result.result?.result?.value
}

await send('Runtime.enable')
await send('Log.enable')
await sleep(7000)

const fails = []
const check = (cond, msg, extra = '') => {
  if (!cond) fails.push(msg + (extra ? '：' + extra : ''))
}

async function waitFor(selector, timeout = 20000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) return true
    await sleep(400)
  }
  return false
}

let hasFab = await evaluate("!!document.querySelector('.timeline-fab')")
const expectFab = process.env.DOCK_EXPECT_FAB !== '0'
if (expectFab && !hasFab) {
  await waitFor('.timeline-fab', 20000)
  hasFab = await evaluate("!!document.querySelector('.timeline-fab')")
}
if (!expectFab) {
  check(!hasFab, '未选分析对象时不应显示时间轴入口')
  check(!(await evaluate("!!document.querySelector('.timeline-modal')")), '未选分析对象时不应有弹窗')
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS: 未选分析对象时入口隐藏')
  ws.close()
  child.kill()
  process.exit(fails.length ? 1 : 0)
}
check(hasFab, '没有时间轴入口按钮')
check(!(await evaluate("!!document.querySelector('.timeline-modal')")), '弹窗默认不应打开')

await evaluate("document.querySelector('.timeline-fab').click()")
await sleep(700)
const opened = await evaluate("!!document.querySelector('.timeline-modal')")
check(opened, '点击按钮没有打开弹窗')

const modalSize = await evaluate(`(() => {
  const el = document.querySelector('.timeline-modal')
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height, inner: window.innerWidth, innerH: window.innerHeight }
})()`)
check(modalSize.width >= modalSize.inner * 0.9, '弹窗宽度不够大', JSON.stringify(modalSize))
check(modalSize.height >= modalSize.innerH * 0.8, '弹窗高度不够大', JSON.stringify(modalSize))

const themeColors = await evaluate(`(() => {
  const modal = document.querySelector('.timeline-modal')
  const tile = modal.querySelector('.tile b')
  return {
    bg: getComputedStyle(modal).backgroundColor,
    text: tile ? getComputedStyle(tile).color : '',
    lightClass: modal.classList.contains('light')
  }
})()`)
if (WANT_LIGHT) {
  check(themeColors.lightClass, '浅色模式没有 light 类')
  check(/^rgba?\(255, 255, 255/.test(themeColors.bg), '浅色弹窗底色异常', themeColors.bg)
} else {
  check(!themeColors.lightClass, '深色模式不应有 light 类')
  check(!/^rgba?\(255, 255, 255/.test(themeColors.bg), '深色弹窗底色异常', themeColors.bg)
}

const cursorBefore = await evaluate("document.querySelector('.timeline-modal .clock').textContent.trim()")
await evaluate(`(() => {
  const input = document.querySelector('.timeline-modal input[type=range]')
  input.value = String(1200)
  input.dispatchEvent(new Event('input', { bubbles: true }))
})()`)
await sleep(400)
const cursorAfter = await evaluate("document.querySelector('.timeline-modal .clock').textContent.trim()")
check(cursorAfter === '20:00', '滑条 1200 秒应显示 20:00', `${cursorBefore} -> ${cursorAfter}`)

const stats = await evaluate(`(() => ({
  marks: document.querySelectorAll('.timeline-modal .mark').length,
  talents: document.querySelectorAll('.timeline-modal .node').length,
  tabs: document.querySelectorAll('.timeline-modal .tabs button').length,
  layoutCols: getComputedStyle(document.querySelector('.timeline-modal .layout')).flexDirection,
  canvas: (() => {
    const c = document.querySelector('.timeline-modal canvas')
    if (!c) return null
    const r = c.getBoundingClientRect()
    return { width: Math.round(r.width), height: Math.round(r.height) }
  })(),
  itemRows: document.querySelectorAll('.timeline-modal .items .row').length
}))()`)
check(stats.marks > 5, '出装轨没有节点', String(stats.marks))
check(stats.talents >= 8, '天赋节点不足', String(stats.talents))
check(stats.tabs > 4, '缺少切换按钮', String(stats.tabs))
check(stats.layoutCols === 'row', '宽弹窗没有启用两列布局', stats.layoutCols)
check(Boolean(stats.canvas && stats.canvas.width > 300 && stats.canvas.height > 80), '走势图 canvas 未渲染', JSON.stringify(stats.canvas))
check(stats.itemRows === 1, '出装轨应只显示分析对象一行', String(stats.itemRows))

const zOrder = await evaluate(`(() => {
  const input = document.querySelector('.timeline-modal .range input')
  const mark = document.querySelector('.timeline-modal .mark')
  return {
    input: getComputedStyle(input).zIndex,
    mark: mark ? getComputedStyle(mark).zIndex : '0'
  }
})()`)
check(Number(zOrder.input) > Number(zOrder.mark || 0), '滑条圆点没有高于刻度线', JSON.stringify(zOrder))

const seqChips = await evaluate(`(() => [...document.querySelectorAll('.timeline-modal .seq .chip')]
  .map((el) => ({ n: Number(el.textContent), on: el.classList.contains('acquired') })))()`)
const onCount = seqChips.filter((item) => item.on).length
check(onCount > 0, '没有任何加点被高亮')
check(
  seqChips.slice(0, onCount).every((item) => item.on) && seqChips.slice(onCount).every((item) => !item.on),
  '加点高亮不是连续前缀（同一技能的其他等级被误高亮）',
  JSON.stringify(seqChips.slice(0, onCount + 3))
)

const beforeChartClick = await evaluate("document.querySelector('.timeline-modal .clock').textContent.trim()")
await evaluate(`(() => {
  const canvas = document.querySelector('.timeline-modal canvas')
  const rect = canvas.getBoundingClientRect()
  canvas.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    clientX: rect.left + rect.width * 0.5,
    clientY: rect.top + rect.height * 0.5
  }))
})()`)
await sleep(400)
const afterChartClick = await evaluate("document.querySelector('.timeline-modal .clock').textContent.trim()")
check(beforeChartClick !== afterChartClick, '点击走势图没有跳转时间', `${beforeChartClick} -> ${afterChartClick}`)

const beforeScroll = await evaluate(`(() => {
  const body = document.querySelector('.timeline-modal .modal-body')
  const scrubber = document.querySelector('.timeline-modal .scrubber')
  const style = getComputedStyle(scrubber)
  return {
    bg: style.backgroundColor,
    shadow: style.boxShadow,
    backdrop: style.backdropFilter || style.webkitBackdropFilter || '',
    clockColor: getComputedStyle(document.querySelector('.timeline-modal .clock')).color,
    scrolled: body.classList.contains('scrolled')
  }
})()`)
if (WANT_LIGHT) {
  check(beforeScroll.bg.includes('255, 255, 255') && beforeScroll.bg.includes('0.8'), '浅色吸顶条底色不是白色 80%', beforeScroll.bg)
  check(beforeScroll.clockColor.includes('13, 42, 29'), '浅色吸顶条时间文字不是深色', beforeScroll.clockColor)
} else {
  check(beforeScroll.bg.includes('16, 33, 25'), '深色吸顶条不是深色玻璃', beforeScroll.bg)
  check(beforeScroll.clockColor.includes('233, 248, 239'), '深色吸顶条时间文字不是浅色', beforeScroll.clockColor)
}
check(beforeScroll.backdrop.includes('blur'), '吸顶条没有 backdrop blur', beforeScroll.backdrop)
check(beforeScroll.shadow === 'none', '未滚动时不应有阴影', beforeScroll.shadow)
check(!beforeScroll.scrolled, '未滚动时不应有 scrolled 类')

await evaluate("document.querySelector('.timeline-modal .modal-body').scrollTop = 200")
await sleep(400)
const sticky = await evaluate(`(() => {
  const body = document.querySelector('.timeline-modal .modal-body')
  const scrubber = document.querySelector('.timeline-modal .scrubber')
  const style = getComputedStyle(scrubber)
  return {
    bodyTop: body.getBoundingClientRect().top,
    scrubberTop: scrubber.getBoundingClientRect().top,
    scrollTop: body.scrollTop,
    clock: document.querySelector('.timeline-modal .clock')?.textContent?.trim() ?? '',
    scrolled: body.classList.contains('scrolled'),
    shadow: style.boxShadow
  }
})()`)
check(sticky.scrollTop > 100, '弹窗内容没有可滚动区域', JSON.stringify(sticky))
check(sticky.scrubberTop - sticky.bodyTop < 8, '滚动后时间轴没有吸顶', JSON.stringify(sticky))
check(Boolean(sticky.clock), '吸顶后时间轴不可见')
check(sticky.scrolled, '滚动后没有 scrolled 类')
check(sticky.shadow !== 'none', '滚动后没有悬浮阴影', sticky.shadow)
await evaluate("document.querySelector('.timeline-modal .modal-body').scrollTop = 0")

await evaluate("document.querySelector('.timeline-modal .close').click()")
await sleep(400)
check(!(await evaluate("!!document.querySelector('.timeline-modal')")), '关闭按钮没有关闭弹窗')

await evaluate("document.querySelector('.timeline-fab').click()")
await sleep(500)
await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
await sleep(400)
check(!(await evaluate("!!document.querySelector('.timeline-modal')")), 'Esc 没有关闭弹窗')

console.log('modal:', JSON.stringify(modalSize))
console.log('theme:', WANT_LIGHT ? 'light' : 'dark', themeColors.bg, 'text:', themeColors.text)
console.log('cursor:', cursorBefore, '->', cursorAfter)
console.log('nodes:', JSON.stringify(stats))
console.log(logs.length ? 'CONSOLE:\n' + logs.join('\n') : 'console 无错误')
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS: 弹窗交互回归全部通过')

ws.close()
child.kill()
process.exit(fails.length ? 1 : 0)
