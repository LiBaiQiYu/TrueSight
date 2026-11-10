# 变更记录

按时间倒序；每次功能/修复完成后在顶部追加一条。自动快照见 `state.md`。

## 2026-11-10

- 修复官网深浅模式：浅色主题改为浅色页面 + 蓝色强调色，深色主题改为深色页面 + 绿色强调色；界面截图按主题自动切换，浅色用浅色截图、深色用深色截图（主界面/时间轴/战斗节点/设置均补齐两套）。
- 官网重做为 Apple 产品页风格：黑色 Hero、大字号编辑排版、全宽界面截图与深浅双主题；界面截图全部改用客户端标准主题（浅色主图 + 深色战斗节点），旧官网截图已清理。
- 版权与资源记忆：「关于」页新增版权说明（图片归 Valve Corporation），显示图标快照日期/数量；新增 `memory/dota-images.md` 记录快照、更新流程与已知缺失图标；`fetch_images.py` 支持 `--prune` 清理版本更新后不再引用的旧图；官网 footer 同步版权说明。
- 图片资源本地化：英雄头像/小图标、技能图标、装备图标共 1407 个文件（约 43.7 MB）抓取到 `ui/public/assets/`，前端默认只读本地文件；新增 `tools/assets/fetch_images.py` 负责下载/校验/先天技能占位；本地缺失时按 `data-fallback` 回退官方 CDN。

## 2026-11-09

- 新增「关于」页面：版本号、更新日志弹窗、开源鸣谢、AI/STRATZ Key 本地保存与安全说明；设置页新增清除解析缓存/临时文件（保留录像、Key、设置和历史）。
- 战斗节点支持非德鲁伊分析对象：德鲁伊与小熊在参战表分开展示，承伤来源和时间线区分“熊灵”，德鲁伊行保留含熊灵总量；焦点为其他英雄时同样生效。
- 战斗节点熊灵独立展示：新增“熊灵”分析对象卡片（可与德鲁伊同时显示或单独切换）、参战表独立行、承伤来源单独列出熊灵、时间线区分熊灵；伤害/击杀总量仍计入德鲁伊，K/A 同步，熊灵阵亡不记为德鲁伊死亡。
- 战斗节点支持德鲁伊熊灵：熊灵造成的伤害/技能/物品归入德鲁伊，击杀同步；熊灵阵亡不计入德鲁伊死亡，参战英雄显示“含熊灵”。
- 战斗节点面板可读性提升：放大文字 1–1.5px，并在分析对象、参战英雄、承伤来源中加入英雄头像，在技能/道具标签中加入 Steam CDN 图标。
- 修复战斗节点助攻重复：回放 DEATH 事件的 assist 列表包含击杀者，统计时排除击杀者与死者；9027308611 3:52 节点灰烬之灵由 1 杀 1 助攻修正为 1 杀 0 助攻。
- 比赛查询新增 STRATZ 备用源：设置里填写 STRATZ Token 时，OpenDota 超时/5xx/网络失败会自动改用 STRATZ 查比赛，并在选择区提示数据降级；已验证 10 人阵容渲染与双源失败提示。
- 比赛查询增加 12 秒超时与明确错误提示：OpenDota 无响应/500 时不再无限转圈，区分 404/429/5xx/超时/网络错误。
- 战斗日志内部名兜底：新增 `ui/src/lib/labels.ts`，把 `npc_dota_*` 单位（英雄/小兵/防御塔/召唤物/野怪）、`plus_high_five`、`ability_lamp_use`、`ice_blast_release` 等名称表缺失项转成中文或可读名；战斗节点时间线、承伤来源、技能标签与 AI 提示词不再出现 `npc_xxx` 原始变量名。
- 修复官网打不开：`website/index.html` 中文编码损坏，且 `<title>` 的 `<` 被吞导致浏览器把整页当文本；重写页面并部署（版本 `e7dc592b`），已验证桌面/移动端渲染与下载链接。
- 战斗节点数据修正：过滤中立道具「狂石包」与 Invoker 的宝珠/Invoke 组件；普通攻击只认物理且无技能来源的伤害；无 inflictor 的 DoT 继承 2.5 秒内同目标来源（血腥榴弹），时间线显示 `MM:SS.mmm`。
- 时间轴「团战」Tab 升级为「战斗节点」：以分析对象击杀/助攻/阵亡为锚点，支持单杀、小规模、团战、多杀与助攻节点；schema 10 导出战斗事件、助攻、伤害类型和 1 秒 HP/MP/金钱/经验采样；新面板展示参战英雄、技能/普攻、承伤来源与时间线。
- 官网改为桌面客户端导向：Hero 下载客户端、安装版/便携版下载卡、版本/大小/系统信息、四步安装使用、FAQ 与 AI 提供商展示；下载文件通过 Worker `DOWNLOADS` 绑定从 R2 `truesight-downloads` 提供。
- 修复 Portable 高级分析找不到 Clarity：首次启动把 `resources/backend` 复制到 `%APPDATA%\TrueSight\portable-backend`，避免系统清理临时目录后 classes/lib/jre 丢失；使用稳定 backend 启动 Python/Java。
- 自定义推理档位改为标签编辑器：预设低/中/高/xhigh/max/ultra 可选，支持逗号/回车生成标签、× 移除和任意补充档位。
- 自定义模型目录自动识别思考档位：解析 `capabilities.reasoning.effort`、`reasoning.effort`、`thinkingLevelMap`，有元数据时自动填充 ultra 等档位，无元数据时保留手动填写。
- 自定义模型新增推理档位输入，支持 `ultra` 等非标准档位；留空不发送 `reasoning_effort`，OpenAI Responses 写入 `reasoning.effort`。
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
