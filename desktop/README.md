# TrueSight Desktop

TrueSight 的 Electron 桌面壳。它与现有 Web 模式并行存在，共用同一套：

- `ui/` 前端；
- `server.py` 本地服务；
- `java/MatchJsonMain.java` + Clarity；
- `lib/`、`classes/`、`jre/`、`runtime/python/`。

不会替换或破坏现有 `start.bat` / `server.py` 工作流。

## 两种模式

### Web 模式（原有）

```powershell
cd ui
npm run build
cd ..
.\start.bat
```

浏览器访问 `http://127.0.0.1:8077`。

### Desktop 模式

先准备运行环境并构建前端：

```powershell
powershell -ExecutionPolicy Bypass -File tools\setup.ps1
cd ui
npm install
npm run build
cd ..
```

安装 Electron 依赖并启动：

```powershell
cd desktop
npm install
npm run dev
```

`npm run dev` 会：

1. 选择空闲的 `127.0.0.1` 端口；
2. 启动 `server.py`；
3. 等待本地服务健康检查通过；
4. 在 Electron 窗口中加载 `ui/dist`。

## 目录

```text
desktop/
├─ main.cjs          Electron 主进程 / sidecar 生命周期
├─ preload.cjs       最小桌面信息桥
├─ package.json      Electron、打包配置
├─ build/icon.ico    Windows 图标
├─ README.md
└─ release/          electron-builder 输出（不提交）
```

## 运行数据

桌面模式不会写安装目录，数据保存在：

```text
%APPDATA%\TrueSight\data\
├─ replays/
├─ .cache/
├─ heroes.json
├─ logs/backend.log
└─ server.log
```

这是通过 `TRUESIGHT_DATA_DIR` 传给 `server.py` 的；Web 模式不设置该变量，仍使用项目根目录，行为不变。

Portable 版本会额外把 `resources/backend` 复制到：

```text
%APPDATA%\TrueSight\portable-backend\
```

因为 Portable 是**自解压单文件 exe**（不是 zip 压缩包），每次启动会解压到系统临时目录；Windows 清理临时文件时可能删掉 `classes`、`lib`、`jre`，导致高级分析找不到 Clarity。复制后 Python、Java、Clarity 和 JRE 都从稳定目录运行。

## 生产打包

```powershell
cd desktop
npm run dist
```

输出位于 `desktop/release/`，默认生成：

- `TrueSight-Portable-0.1.0-x64.exe`：Portable 便携版，自解压单文件，双击运行。

如需 NSIS 安装包：

```powershell
npm run dist:installer
```

安装包输出：

```text
TrueSight-Setup-0.1.0-x64.exe
```

安装器为 per-user 安装，会创建开始菜单和桌面快捷方式。

打包会包含：

```text
server.py
ui/dist
data/names
lib/*
classes/*
jre/
runtime/python/
```

不会包含：

- `replays/`、`.cache/`；
- `node_modules/`；
- API Key / Token；
- 现有 `server.log`。

### 代码签名

当前未配置 Windows 代码签名证书。正式分发前建议配置，避免 SmartScreen 和杀毒软件误报。

## 常见问题：双击后没有反应

如果 `release\win-unpacked\TrueSight.exe` 双击无窗口，按顺序检查：

1. 任务管理器结束残留的 `TrueSight.exe` / `electron.exe`；
2. 如果构建环境是 DSH 或其他沙箱，文件可能带有 **Low mandatory integrity**，Electron 会无法启动：

   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\desktop\fix-integrity.ps1
   ```

   或：

   ```powershell
   cd desktop
   npm run fix:integrity
   ```

3. 查看日志：

   ```text
   %APPDATA%\TrueSight\data\logs\backend.log
   ```

4. 确认 `desktop/release/win-unpacked/resources/backend` 下存在：
   - `server.py`
   - `jre/bin/java.exe`
   - `classes/skadistats/clarity/bench/MatchJsonMain.class`
   - `lib/*.jar`
   - `ui/dist/index.html`

### Portable 高级分析报找不到 Clarity

Portable 会解压到临时目录，系统清理临时文件后可能只剩 Python 运行时。新版本首次启动会自动复制 backend 到稳定目录：

```text
%APPDATA%\TrueSight\portable-backend
```

如果仍报错：

1. 完全退出旧 Portable 和残留 `TrueSight.exe`；
2. 用新版 Portable 或 Setup 重新启动；
3. 确认 `%APPDATA%\TrueSight\portable-backend\classes` 存在；
4. 查看 `%APPDATA%\TrueSight\data\logs\backend.log` 中是否有 `portable backend ready`。

当前固定使用 **Electron 44.0.0**。Electron 45 在该机器上启动异常，因此未采用。

## 性能

桌面模式默认启用 GPU 合成（ANGLE D3D11），并在窗口加载后检查 GPU 状态。

启动日志：

```text
%APPDATA%\TrueSight\data\logs\backend.log
```

正常应包含：

```text
gpu_compositing: enabled
rasterization: enabled_force
```

- 桌面模式会注入 `desktop-shell`，关闭卡片、时间轴遮罩和 scrubber 的 `backdrop-filter`，减少大面积模糊合成；
- `backgroundThrottling: false`，避免窗口失焦时时间轴动画被降到 1 FPS；
- 如果窗口卡顿且日志显示 `disabled_software`，优先更新显卡驱动，或避免通过 ToDesk / RDP 虚拟显示器运行；
- 仅当显卡驱动异常导致崩溃时，才用以下方式降级软件渲染：

  ```powershell
  $env:TRUESIGHT_DISABLE_GPU = '1'
  .\release\win-unpacked\TrueSight.exe
  ```

## 调试

- 开发模式按 `F12` 打开 DevTools；
- 启动/退出日志：`%APPDATA%\TrueSight\data\logs\backend.log`；
- 本地服务日志：`%APPDATA%\TrueSight\data\server.log`；
- 无界面 smoke test：

  ```powershell
  cd desktop
  npx electron . --smoke-test
  ```

  成功时输出：

  ```text
  TRUESIGHT_SMOKE_OK http://127.0.0.1:<port>
  ```

## 说明

- 桌面模式与分析服务只绑定 `127.0.0.1`，不对外网开放；
- 每次启动使用随机端口，避免与 Web 模式的 8077 冲突；
- 关闭窗口时通过进程树终止 Python 和 Java 子进程；
- UI 与 Web 模式完全共用，不需要两套前端代码。
