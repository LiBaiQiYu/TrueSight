# 变更记录

按时间倒序；每次功能/修复完成后在顶部追加一条。自动快照见 `state.md`。

## 2026-11-09

- 修复推理级别滑块：轨道保持完整圆角，点位按 12px 内边距对齐，填充从轨道左端延伸到当前 thumb，首尾点落在填充/轨道内，与参考图一致。
- 自定义模型补齐 Provider ID、显示名称、API 地址、协议、API Key、模型 ID、模型目录；支持 OpenAI Chat Completions / OpenAI Responses / Anthropic Messages，并实现 Responses/Anthropic SSE 转换。
- 设置页新增 OpenAI/Codex API、小米 MiMo、自定义 OpenAI 兼容模型；自定义模型支持 Base URL 和模型名，Ollama/LM Studio 可空 Key。
- 新增 DeepSeek 官方 API 提供商：内置 `deepseek-chat` / `deepseek-reasoner`，独立 Key/Base URL，本地代理不发送 `reasoning_effort`。
- 桌面打包区分产物名：`TrueSight-Portable-*` 与 `TrueSight-Setup-*`，NSIS per-user 安装包已可产出。
- 桌面客户端性能修复：移除无条件软件渲染，默认启用 D3D11/GPU 合成；桌面模式关闭卡片与时间轴 backdrop blur，并关闭失焦节流；GPU 状态写入 backend.log。

## 2026-11-06

- 修复 Electron 客户端双击无反应：固定 Electron 44.0.0、修正打包后的 backend 目录识别，并新增 `tools/desktop/fix-integrity.ps1` 处理沙箱产物 Low integrity 问题；Portable 与 win-unpacked 均已验证可启动。
- 新增 Electron 桌面客户端（`desktop/`），与 Web 模式并行：共用 UI/server/Clarity，随机本地端口，数据写入 `%APPDATA%\TrueSight\data`；支持 dev、portable 打包和可选 NSIS。
- 官网 footer 增加开发者 `CarlosWhite_A1E`、个人网站 `cwa1e.top`，以及 OpenDota / STRATZ / Clarity powered 信息。
- 官网新增 TrueSight / 标准双主题，支持本地记忆与跨标签同步；默认 TrueSight，标准主题使用中性蓝灰配色。
- 官网已部署到 Cloudflare Worker：<https://truesight.carloswhitea1e.workers.dev/>；新增 `wrangler.jsonc`、`cloudflare/worker.js`、自定义 404，并改用 `npx wrangler deploy` 发布。
- 新增 `website/` 官方静态官网：清爽浅色视觉、功能/界面/下载/使用说明/FAQ、响应式布局与截图。
- 更新 Clarity 至 `53e60b1`（5.0.1 未变版本号）：重建 `clarity-5.0.1.jar`、复制依赖并重新编译 `MatchJsonMain`；实解析两场英雄数据验证 positions/series/players/timeline/damage 等字段与旧缓存一致，`bearItems` 归属修复生效。

## 2026-11-05

- 新增 `/api/parse/cache` 预检与前端自动加载：已有录像解析缓存时，选择英雄且处于高级分析会直接显示时间轴按钮，无需重新跑 AI。
- 新增 `HeroSelect` 自定义下拉组件：分析对象菜单按天辉/夜魇分组，显示头像、名称、位置、阵营和选中状态，替换原生 select。
- 自定义对位双方上限统一为 3 人：我方含分析对象最多 3 人，敌方最多 3 人，支持 3v3 / 2v3 / 3v2。
- 时间轴顶部改为完整对位阵容：显示我方队友与全部敌方，分析对象高亮描边；点击队友/对手可切换时间轴查看对象，顶部可切换 1v1 / 2v2 / 自定义对位。
- 修复德鲁伊小熊数据归属：解析器只对德鲁伊本人导出 `bearItems`，时间轴也只在分析德鲁伊时显示「本体 / 小熊」背包；分析祈求者等其他英雄不再出现「小熊 · 独行德鲁伊」。
- 修复停止分析后重新开始高级分析时 `POST /api/parse` 返回 `ERR_EMPTY_RESPONSE`：SSE 响应改为 `Connection: close` 并显式关闭连接，避免浏览器复用已关闭的流式连接。

## 2026-11-04

- 新增 `tools/setup.ps1`：检查 Python 3.10+/Java 21+、默认拉取并构建最新 Clarity、复制依赖、编译 `MatchJsonMain`；`start.bat` 在无内置 Python 时回退系统 `python` / `py -3`。
- 新增 `memory/ai/` 项目记忆库、自动 `state.md` 快照、`.githooks/pre-commit|pre-push` 与 `tools/memory/install.ps1`；初始化 Git 仓库并启用 `core.hooksPath=.githooks`。
- 团战分析：参团要求改为“伤害/治疗/增益/技能行为 + 战场半径”，支持全球伤害/治疗技能白名单；战场中心用伤害玩家位置中位数。
- 德鲁伊：新增完整小熊天赋树 8 条（4 层 × 2），天赋区支持本体/小熊切换；技能图标移除等级数字角标。
- 时间轴：组合守卫拆成真假眼独立记录；补齐卷轴 `mergedInto`，修复雷神之锤等卷轴漏并；消耗品 FIFO；精确守卫类型解析。
- 名称：补充 Lone Druid 新天赋 1687–1690 和通用天赋；结果正文图标/中文名映射与表格对齐修复。
- 分析：对位 2v2 前 10 分钟数据（HP/MP、技能次数、购买、视野、击杀）、停止分析、全英雄回放缓存。
- 品牌：TrueSight logo/favicon、主题适配、时间轴弹窗样式统一。

## 2026-11-03

- 初始化 TrueSight 品牌、AI 提供商（OpenCode/MiniMax）、名称库、时间轴与深度分析基础能力。
