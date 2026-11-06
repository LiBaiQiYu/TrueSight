# 项目上下文

## 是什么

TrueSight（`dota-chat`）是一个 Dota 2 对局分析工具：

- 前端：Vue 3.5 + TypeScript + Vite 8，Chart.js 4；
- 本地后端：Python 3 标准库 HTTP 服务（`server.py`），负责 OpenDota/STRATZ 代理、AI 流式代理、Clarity 录像解析任务；
- 录像解析：Java + Clarity（`java/MatchJsonMain.java`，编译到 `classes/`）；
- AI：OpenAI 兼容接口，支持 OpenCode Go 与 MiniMax；
- 静态名称库：`data/names/*.json` → 前端 `ui/public/names/*.json`。

## 关键目录

| 路径 | 作用 |
| --- | --- |
| `ui/src/` | 前端源码（App、Timeline、ResultCard、Settings 等） |
| `ui/scripts/build-names.mjs` | 压缩名称库，生成前端静态 JSON |
| `server.py` | 本地 HTTP 服务、API 代理、解析任务 |
| `java/MatchJsonMain.java` | 回放解析器（schema 8） |
| `data/names/` | 名称源数据（英雄/技能/天赋/装备） |
| `memory/dota-*.md` | 游戏数据记忆 |
| `memory/ai/` | 本目录，AI 开发记忆 |
| `tools/names/` | 名称数据抓取、构建、审计脚本 |
| `tools/memory/` | 记忆快照与 Git hook 安装脚本 |
| `tools/setup.ps1` | Python / Java / Clarity 一键准备 |
| `website/` | 官方静态官网（Cloudflare Worker：`wrangler.jsonc`） |
| `desktop/` | Electron 桌面壳（Electron 44；Low integrity 修复脚本） |
| `.githooks/` | 提交/推送钩子 |

## 常用命令

```powershell
# 一键检查环境（默认拉取最新 Clarity 并重建；-NoUpdateClarity 保留当前版本）
powershell -ExecutionPolicy Bypass -File tools\setup.ps1

# 前端
cd ui
npm install
npm run dev
npm run build        # vue-tsc + vite build，产物 ui/dist
npm run names        # 重新生成 ui/public/names/*.json

# 后端
python server.py 8077

# 桌面客户端（Electron，与 Web 模式并行）
cd desktop
npm install
npm run dev

# 打包 Portable 客户端（需先构建 ui/dist）
npm run dist

# 名称源数据（需要网络）
python tools/names/fetch_raw.py
python tools/names/build.py

# Java 解析器（必须用 Java 21 目标）
javac --release 21 -encoding UTF-8 -cp "classes;lib/*" -d classes java\MatchJsonMain.java
```

## 运行约束

- 用户常驻服务在 `127.0.0.1:8077`，不要随意杀掉；需要新端口时用临时端口。
- `server.py` 的解析 schema 变更后必须重启服务，否则缓存判断仍旧。
- 构建后确认 `ui/dist` 比所有源文件新；多人/多会话可能同时改文件，改前重读。
- 浏览器验证用临时 Chrome profile + CDP，结束后清理进程和 profile。
- 不要把 `.cache/`、`replays/`、`runtime/`、`jre/`、`lib/`、`classes/`、`ui/node_modules/`、`ui/dist/` 提交进 Git。

## Git / 多设备同步

- 仓库已初始化，默认分支 `main`；
- 每台设备执行一次 `powershell -ExecutionPolicy Bypass -File tools/memory/install.ps1` 启用 hook；
- 每次提交前 `pre-commit` 自动写入并暂存 `memory/ai/state.md`；
- `pre-push` 检查 HEAD 是否包含该快照，防止 `--no-verify` 绕过；
- 远端地址由使用者自行添加（`git remote add origin ...`）。

## 当前版本要点

- 本地 Clarity 更新至 `53e60b1`（`clarity-5.0.1.jar`，跟随 master；`lib/clarity.commit` 记录 commit）；
- 回放解析 schema 8：HP/MP 5 秒采样、前 10 分钟技能次数、物品使用事件、守卫插眼类型/坐标、德鲁伊小熊背包；
- 时间轴：出装路线、真假眼拆分、FIFO 消耗、卷轴合成、此刻背包、双天赋树；
- 名称/图标：中文名称、Steam CDN 图标、Lone Druid 8 条小熊天赋（含通用天赋）；
- 团战：伤害/治疗/技能/物品行为 + 战场半径 + 全球技能白名单；
- 品牌：TrueSight 水晶 logo/favicon，主题支持 TrueSight/标准、深/浅色。

## 已知限制

- 守卫在战争迷雾中可能延迟出现，真假眼类型按插眼顺序校准；
- 全球技能白名单是手动维护的；
- 基础模式没有回放坐标，无法做团战距离判断；
- 部分新天赋 OpenDota/datafeed 尚未收录，需要 `MANUAL_TALENTS` 补充；
- 离线设备需要自行准备 `lib/`、`classes/` 或重新构建解析器。
