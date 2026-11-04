// 截取弹窗打开状态，用于预览与目检。
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = Number(process.env.DOCK_PORT || 9345)
const URL = process.env.DOCK_URL || 'http://127.0.0.1:8078/?match=9043325109&hero=48&matchup=safe'
const OUT = process.env.DOCK_OUT || '.cache'
const HOST = URL.replace(/^https?:\/\//, '').split('/')[0]
const profile = mkdtempSync(join(tmpdir(), 'edge-shot-'))

const child = spawn(
  EDGE,
  [
    '--headless=new',
    ...(process.env.DOCK_GPU === '1' ? [] : ['--disable-gpu']),
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    `--window-size=${process.env.DOCK_VIEW || '1600,1200'}`,
    URL
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function target() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((x) => x.type === 'page' && x.url.includes(HOST))
      if (page) return page
    } catch {
      /* retry */
    }
    await sleep(500)
  }
  throw new Error('no target')
}

const page = await target()
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.onopen = res
  ws.onerror = rej
})

let seq = 0
const pending = new Map()
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
}

function send(method, params = {}) {
  const id = ++seq
  return new Promise((res) => {
    pending.set(id, res)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true })
  return r.result?.result?.value
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(join(OUT, name), Buffer.from(r.result.data, 'base64'))
  console.log('saved', join(OUT, name))
}

await send('Page.enable')
await send('Runtime.enable')
await sleep(7000)

for (let i = 0; i < 50; i += 1) {
  const ready = await evaluate("!!document.querySelector('.timeline-fab')")
  if (ready) break
  await sleep(400)
}
const hasFab = await evaluate("!!document.querySelector('.timeline-fab')")
if (!hasFab) {
  console.log('fab not found, skip shot')
  ws.close()
  child.kill()
  process.exit(1)
}
await evaluate("document.querySelector('.timeline-fab').click()")
await sleep(900)
await evaluate(`(() => {
  const input = document.querySelector('.timeline-modal input[type=range]')
  if (!input) return
  input.value = String(${Number(process.env.DOCK_CURSOR || 1200)})
  input.dispatchEvent(new Event('input', { bubbles: true }))
})()`)
await sleep(400)
const scroll = Number(process.env.DOCK_SCROLL || 0)
if (scroll > 0) {
  await evaluate(`document.querySelector('.timeline-modal .modal-body').scrollTop = ${scroll}`)
  await sleep(300)
}
if (process.env.DOCK_NO_CONTAINER === '1') {
  await evaluate("document.querySelector('.timeline-modal .modal-body').style.containerType = 'normal'")
  await sleep(300)
}
console.log(
  'backdrop-filter:',
  await evaluate("getComputedStyle(document.querySelector('.timeline-modal .scrubber')).backdropFilter")
)
await shot('dock-modal-open.png')

ws.close()
child.kill()
