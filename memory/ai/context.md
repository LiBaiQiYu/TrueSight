# 项目上下文

## 是什么

TrueSight（`dota-chat`）是一个 Dota 2 对局分析工具：

- 前端：Vue 3.5 + TypeScript + Vite 8，Chart.js 4；
- 本地后端：Python 3 标准库 HTTP 服务（`server.py`），负责 OpenDota/STRATZ 代理、AI 流式代理、Clarity 录像解析任务；
- 录像解析：Java + Clarity（`java/MatchJsonMain.java`，编译到 `classes/`）；
- AI：OpenAI 兼容接口，支持 OpenCode Go、MiniMax、DeepSeek、OpenAI/Claude/Codex API、小米 MiMo 与自定义模型；
- 静态名称库：`data/names/*.json` → 前端 `ui/public/names/*.json`。
- 名称兜底：`ui/src/lib/labels.ts` 把回放内部类名（`npc_dota_*`、名称表缺失的技能/物品）统一转成中文或可读名，战斗节点与 AI 提示词共用。
- 官网：Apple 产品页风格静态站；浅色标准主题（浅色页面、蓝色强调）与深色 TrueSight 主题（深色页面、绿色强调），截图按主题自动切换。
- 文档：`README.md` 默认英文，`README.zh-CN.md` 为简体中文，两版顶部互相切换。

## 关键目录

| 路径 | 作用 |
| --- | --- |
| `ui/src/` | 前端源码（App、Timeline、ResultCard、Settings 等） |
| `ui/scripts/build-names.mjs` | 压缩名称库，生成前端静态 JSON |
| `ui/public/assets/` | 本地英雄头像/图标、技能图标、装备图标（提交仓库） |
| `tools/assets/fetch_images.py` | 从官方 CDN 批量抓取并校验图片资源 |
| `server.py` | 本地 HTTP 服务、API 代理、解析任务 |
| `java/MatchJsonMain.java` | 回放解析器（schema 10） |
| `data/names/` | 名称源数据（英雄/技能/天赋/装备） |
| `memory/dota-images.md` | 图片资源快照、版权与版本更新流程 |
| `memory/dota-*.md` | 游戏数据记忆 |
| `memory/ai/` | 本目录，AI 开发记忆 |
| `tools/names/` | 名称数据抓取、构建、审计脚本 |
| `tools/memory/` | 记忆快照与 Git hook 安装脚本 |
| `tools/setup.ps1` | Python / Java / Clarity 一键准备 |
| `website/` | 桌面客户端官网（Cloudflare Worker + R2 `truesight-downloads`） |
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
# 打包 NSIS 安装版
npm run dist:installer

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

## 官网发布

- 官网为静态站，部署命令：`npx wrangler deploy`；下载文件由 R2 `truesight-downloads` 的 `DOWNLOADS` 绑定提供，本地预览 `/downloads/*` 会 404。
- 本机 wrangler OAuth 过期时先执行 `npx wrangler login`（会打开浏览器确认）。
- 本机 GitHub 直连可能解析到异常 IP；推送失败时使用系统代理（本机常见 `127.0.0.1:7890` 或 `7897`，以实际监听端口为准；仅当前设备，Clash/Mihomo）。
- 部署后抽查线上 HTML/CSS 是否包含本次改动，避免浏览器缓存误判。

## Git / 多设备同步

- 仓库已初始化，默认分支 `main`；
- 每台设备执行一次 `powershell -ExecutionPolicy Bypass -File tools/memory/install.ps1` 启用 hook；
- 每次提交前 `pre-commit` 自动写入并暂存 `memory/ai/state.md`；
- `pre-push` 检查 HEAD 是否包含该快照，防止 `--no-verify` 绕过；
- 远端地址由使用者自行添加（`git remote add origin ...`）。

## 当前版本要点

- 本地 Clarity 更新至 `53e60b1`（`clarity-5.0.1.jar`，跟随 master；`lib/clarity.commit` 记录 commit）；
- 回放解析 schema 10：战斗事件（伤害类型/助攻/技能/物品）、1 秒 HP/MP/金钱/经验采样、5 秒时间轴、守卫插眼、德鲁伊小熊背包；
- 时间轴：出装路线、真假眼拆分、FIFO 消耗、卷轴合成、此刻背包、双天赋树；
- 名称/图标：中文名称库 + `ui/public/assets` 本地图片（1407 个 / 43.7 MB，缺失时回退官方 CDN）；
- 战斗节点：以分析对象击杀/助攻/阵亡为锚点，展示技能、普攻、伤害类型、资源变化与承伤来源；
- 官网：Apple 风格深浅双主题，截图随站点主题切换；README 英文默认 + 中文切换；
- 品牌：TrueSight 水晶 logo/favicon，主题支持 TrueSight/标准、深/浅色。

## 已知限制

- 守卫在战争迷雾中可能延迟出现，真假眼类型按插眼顺序校准；
- 全球技能白名单是手动维护的；
- 基础模式没有回放坐标，无法做团战距离判断；
- 部分新天赋 OpenDota/datafeed 尚未收录，需要 `MANUAL_TALENTS` 补充；
- 离线设备需要自行准备 `lib/`、`classes/` 或重新构建解析器。
