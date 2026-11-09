const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const net = require('node:net')
const { spawn } = require('node:child_process')
const { app, BrowserWindow, Menu, dialog, shell } = require('electron')

app.setName('TrueSight')
app.setAppUserModelId('top.cwa1e.truesight')

// 默认使用 GPU 合成；只有在显卡驱动异常时才通过环境变量降级。
if (process.env.TRUESIGHT_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration()
} else {
  app.commandLine.appendSwitch('ignore-gpu-blocklist')
  app.commandLine.appendSwitch('enable-gpu-rasterization')
  app.commandLine.appendSwitch('enable-zero-copy')
  app.commandLine.appendSwitch('use-angle', 'd3d11')
  app.commandLine.appendSwitch('force_high_performance_gpu')
}

const projectRoot = path.resolve(__dirname, '..')
const packagedBackendDir = path.join(process.resourcesPath, 'backend')
const isDev = !fs.existsSync(path.join(packagedBackendDir, 'server.py'))
const backendDir = isDev ? projectRoot : packagedBackendDir
const smokeTest = process.argv.indexOf('--smoke-test') !== -1

let backend = null
let mainWindow = null
let quitting = false
let backendExited = false
let serverPort = null
let backendLogFile = null

function appDataDir() {
  const dir = path.join(app.getPath('userData'), 'data')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function logFile() {
  return path.join(appDataDir(), 'logs', 'backend.log')
}

function writeLog(text) {
  try {
    const file = logFile()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.appendFileSync(file, new Date().toISOString() + ' ' + text + '\n', 'utf8')
  } catch (error) {
    // diagnostics must not prevent startup
  }
}

function findFreePort() {
  return new Promise(function (resolve, reject) {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', function () {
      const port = server.address().port
      server.close(function () {
        resolve(port)
      })
    })
  })
}

function probe(port) {
  return new Promise(function (resolve) {
    const req = http.get(
      { host: '127.0.0.1', port: port, path: '/', timeout: 1500 },
      function (res) {
        res.resume()
        resolve(res.statusCode === 200)
      }
    )
    req.on('timeout', function () {
      req.destroy()
      resolve(false)
    })
    req.on('error', function () {
      resolve(false)
    })
  })
}

function pythonCommand() {
  const bundled = path.join(backendDir, 'runtime', 'python', 'python.exe')
  if (fs.existsSync(bundled)) return bundled
  return process.platform === 'win32' ? 'python' : 'python3'
}

async function startBackend() {
  const serverPy = path.join(backendDir, 'server.py')
  const indexHtml = path.join(backendDir, 'ui', 'dist', 'index.html')
  if (!fs.existsSync(serverPy)) throw new Error('找不到本地服务：' + serverPy)
  if (!fs.existsSync(indexHtml)) {
    throw new Error('前端尚未构建：' + indexHtml + '\n请先在 ui/ 执行 npm run build。')
  }

  const port = await findFreePort()
  const data = appDataDir()
  const temp = path.join(data, 'tmp')
  fs.mkdirSync(temp, { recursive: true })
  backendLogFile = logFile()
  fs.mkdirSync(path.dirname(backendLogFile), { recursive: true })

  const python = pythonCommand()
  writeLog('start backend: ' + python + ' ' + serverPy + ' ' + port)
  backend = spawn(python, [serverPy, String(port)], {
    cwd: backendDir,
    env: Object.assign({}, process.env, {
      TRUESIGHT_DATA_DIR: data,
      PYTHONUTF8: '1',
      PYTHONIOENCODING: 'utf-8',
      TEMP: temp,
      TMP: temp,
      TMPDIR: temp
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  })

  serverPort = port
  backend.stdout.on('data', function (chunk) {
    writeLog('[stdout] ' + chunk.toString('utf8').trimEnd())
  })
  backend.stderr.on('data', function (chunk) {
    writeLog('[stderr] ' + chunk.toString('utf8').trimEnd())
  })
  backend.on('error', function (error) {
    backendExited = true
    writeLog('backend spawn error: ' + error.message)
  })
  backend.on('exit', function (code, signal) {
    backendExited = true
    writeLog('backend exited: code=' + code + ' signal=' + signal)
    if (!quitting && !smokeTest) {
      dialog.showErrorBox('TrueSight 本地服务已退出', '本地分析服务意外停止。\n\n日志：' + logFile())
      app.quit()
    }
  })

  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (backendExited) throw new Error('本地服务启动失败。\n\n日志：' + logFile())
    if (await probe(port)) {
      writeLog('backend ready: http://127.0.0.1:' + port)
      return port
    }
    await new Promise(function (resolve) {
      setTimeout(resolve, 350)
    })
  }
  throw new Error('本地服务启动超时。\n\n日志：' + logFile())
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
    writeLog('stop backend failed: ' + error.message)
  }
}

function windowIcon() {
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
    icon: windowIcon(),
    autoHideMenuBar: true,
    title: 'TrueSight',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      spellcheck: false
    }
  })

  Menu.setApplicationMenu(null)

  mainWindow.once('ready-to-show', function () {
    if (mainWindow) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(function (details) {
    if (/^https?:/i.test(details.url)) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', function (event, url) {
    if (url.indexOf('http://127.0.0.1:' + port) !== 0) event.preventDefault()
  })

  mainWindow.webContents.on('before-input-event', function (event, input) {
    if (isDev && input.key === 'F12') {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('did-fail-load', function (event, code, description) {
    dialog.showErrorBox('TrueSight 页面加载失败', description + '（' + code + '）')
  })

  mainWindow.webContents.on('did-finish-load', function () {
    writeLog('gpu feature status: ' + JSON.stringify(app.getGPUFeatureStatus()))
    mainWindow.webContents
      .executeJavaScript("document.documentElement.classList.add('desktop-shell')")
      .catch(function () {
        /* optional rendering hint */
      })
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.loadURL('http://127.0.0.1:' + port + '/').catch(function (error) {
    dialog.showErrorBox('TrueSight 页面加载失败', error.message)
  })
}

async function start() {
  try {
    const port = await startBackend()
    if (smokeTest) {
      console.log('TRUESIGHT_SMOKE_OK http://127.0.0.1:' + port)
      setTimeout(function () {
        app.quit()
      }, 300)
      return
    }
    createWindow(port)
  } catch (error) {
    writeLog('startup failed: ' + (error.stack || error.message))
    if (smokeTest) {
      console.error(error.stack || error.message)
    } else {
      dialog.showErrorBox('TrueSight 启动失败', error.message + '\n\n日志：' + logFile())
    }
    app.quit()
  }
}

const hasLock = app.requestSingleInstanceLock()
if (!hasLock) {
  app.quit()
} else {
  app.on('second-instance', function () {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })

  app.whenReady().then(start)

  app.on('window-all-closed', function () {
    app.quit()
  })

  app.on('before-quit', function () {
    quitting = true
    stopBackend()
  })

  app.on('will-quit', function () {
    stopBackend()
  })
}
