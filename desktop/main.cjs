const { app, BrowserWindow, Menu, dialog, shell } = require('electron')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const http = require('node:http')
const net = require('node:net')
const path = require('node:path')

app.setName('TrueSight')
app.setAppUserModelId('top.cwa1e.truesight')

const isDev = !app.isPackaged
const projectRoot = path.resolve(__dirname, '..')
const backendDir = isDev ? projectRoot : path.join(process.resourcesPath, 'backend')
const smokeTest = process.argv.includes('--smoke-test')

let backend = null
let backendLog = null
let mainWindow = null
let quitting = false
let backendExited = false
let serverPort = null

function dataDir() {
  const dir = path.join(app.getPath('userData'), 'data')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function logPath() {
  return path.join(dataDir(), 'logs', 'backend.log')
}

function writeLog(line) {
  try {
    const file = logPath()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.appendFileSync(file, `${new Date().toISOString()} ${line}\n`, 'utf8')
  } catch {
    /* diagnostics must never block startup */
  }
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(() => resolve(port))
    })
  })
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/', timeout: 1500 },
      (res) => {
        res.resume()
        resolve(res.statusCode === 200)
      }
    )
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.on('error', () => resolve(false))
  })
}

function pythonCommand() {
  const bundled = path.join(backendDir, 'runtime', 'python', 'python.exe')
  if (fs.existsSync(bundled)) return bundled
  return process.platform === 'win32' ? 'python' : 'python3'
}

async function startBackend() {
  const serverPy = path.join(backendDir, 'server.py')
  if (!fs.existsSync(serverPy)) {
    throw new Error(`找不到本地服务：${serverPy}`)
  }
  const indexHtml = path.join(backendDir, 'ui', 'dist', 'index.html')
  if (!fs.existsSync(indexHtml)) {
    throw new Error(`前端尚未构建：${indexHtml}\n请先在 ui/ 执行 npm run build。`)
  }

  const python = pythonCommand()
  const port = await findFreePort()
  const data = dataDir()
  const temp = path.join(data, 'tmp')
  fs.mkdirSync(temp, { recursive: true })

  backendLog = logPath()
  fs.mkdirSync(path.dirname(backendLog), { recursive: true })

  writeLog(`start backend: ${python} ${serverPy} ${port}`)
  backend = spawn(python, [serverPy, String(port)], {
    cwd: backendDir,
    env: {
      ...process.env,
      TRUESIGHT_DATA_DIR: data,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      TEMP: temp,
      TMP: temp,
      TMPDIR: temp
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  serverPort = port
  backend.stdout.on('data', (chunk) => writeLog(`[stdout] ${chunk.toString('utf8').trimEnd()}`))
  backend.stderr.on('data', (chunk) => writeLog(`[stderr] ${chunk.toString('utf8').trimEnd()}`))
  backend.on('error', (error) => {
    backendExited = true
    writeLog(`backend spawn error: ${error.message}`)
  })
  backend.on('exit', (code, signal) => {
    backendExited = true
    writeLog(`backend exited: code=${code} signal=${signal}`)
    if (!quitting && !smokeTest) {
      dialog.showErrorBox(
        'TrueSight 本地服务已退出',
        `本地分析服务意外停止。\n\n日志：${logPath()}`
      )
      app.quit()
    }
  })

  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (backendExited) throw new Error(`本地服务启动失败。\n\n日志：${logPath()}`)
    if (await probe(port)) {
      writeLog(`backend ready: http://127.0.0.1:${port}`)
      return port
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
  throw new Error(`本地服务启动超时。\n\n日志：${logPath()}`)
}

function stopBackend() {
  if (!backend || backendExited) return
  const pid = backend.pid
  if (!pid) return
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore'
      })
    } else {
      backend.kill('SIGTERM')
    }
  } catch (error) {
    writeLog(`stop backend failed: ${error.message}`)
  }
}

function appIcon() {
  const file = path.join(backendDir, 'ui', 'dist', 'icon-512.png')
  return fs.existsSync(file) ? file : undefined
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    backgroundColor: '#0d2118',
    icon: appIcon(),
    autoHideMenuBar: true,
    title: 'TrueSight',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  })

  Menu.setApplicationMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`http://127.0.0.1:${port}`)) event.preventDefault()
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!isDev) return
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('did-fail-load', (_event, code, description) => {
    dialog.showErrorBox('TrueSight 页面加载失败', `${description}（${code}）`)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.loadURL(`http://127.0.0.1:${port}/`).catch((error) => {
    dialog.showErrorBox('TrueSight 页面加载失败', error.message)
  })
}

async function bootstrap() {
  try {
    const port = await startBackend()
    if (smokeTest) {
      console.log(`TRUESIGHT_SMOKE_OK http://127.0.0.1:${port}`)
      setTimeout(() => app.quit(), 300)
      return
    }
    createWindow(port)
  } catch (error) {
    writeLog(`startup failed: ${error.stack || error.message}`)
    if (!smokeTest) {
      dialog.showErrorBox('TrueSight 启动失败', `${error.message}\n\n日志：${logPath()}`)
    } else {
      console.error(error.stack || error.message)
    }
    app.quit()
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })

  app.whenReady().then(bootstrap)

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('before-quit', () => {
    quitting = true
    stopBackend()
  })

  app.on('will-quit', () => {
    stopBackend()
  })
}
