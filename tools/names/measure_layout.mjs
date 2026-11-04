// 读取页面关键容器宽度，确认浮窗应对齐的“卡片宽度”。
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9335
const URL = 'http://127.0.0.1:8078/?match=9043325109&hero=48&matchup=safe'
const profile = mkdtempSync(join(tmpdir(), 'edge-measure-'))
const child = spawn(
  EDGE,
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    `--user-data-dir=${profile}`, '--window-size=1600,1200', URL],
  { stdio: 'ignore' }
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let page = null
for (let i = 0; i < 40 && !page; i += 1) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    page = list.find((x) => x.type === 'page' && x.url.includes('8078'))
  } catch {
    /* retry */
  }
  if (!page) await sleep(500)
}
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
let seq = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
}
const send = (method, params = {}) => new Promise((res) => {
  const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value
await send('Runtime.enable')
await sleep(6000)
const data = await evaluate(`(() => {
  const scroll = document.querySelector('.scroll')
  const cs = getComputedStyle(scroll)
  const card = document.querySelector('.result-slot') || document.querySelector('.match-card')
  const rect = card ? card.getBoundingClientRect() : null
  return {
    innerWidth: window.innerWidth,
    scrollClient: scroll.clientWidth,
    padLeft: cs.paddingLeft,
    padRight: cs.paddingRight,
    cardWidth: rect ? rect.width : null,
    cardLeft: rect ? rect.left : null,
    cardRight: rect ? rect.right : null
  }
})()`)
console.log(JSON.stringify(data, null, 2))
ws.close()
child.kill()
