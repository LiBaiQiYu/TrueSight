# 设计决策

## 2026-11-10 官网视觉

- 官网参考 Apple 产品页：大号编辑排版、全宽产品截图与克制留白；
- **标准（浅色）**：浅色页面 + 蓝色强调色，Hero 浅灰渐变；**TrueSight（深色）**：深色页面 + 绿色强调色，Hero 黑色；两套主题不再共用蓝色调；
- 官网界面截图必须使用客户端 **标准主题**，并同时准备浅色/深色两套：页面通过 `img[data-light][data-dark]` 跟随主题切换，浅色页面只显示浅色截图，深色页面只显示深色截图；
- 截图由真实客户端截取（1600×1000，弹窗裁切 1488×920）；更新界面后需重新截图两套并保持文件名；
- 站点保持纯静态，不引入外部字体或图片 CDN；下载仍走 Worker 的 R2 绑定。
- 便携版必须描述为「自解压单文件 exe、双击运行」，不得写成「解压即用」或 zip 压缩包；下载卡按钮与规格列表之间保持 30px 间距。
- README 默认英文，`README.zh-CN.md` 为中文版，两版结构与导航保持同步。

## 2026-11-10 图片资源本地化

- 英雄头像/小图标、技能图标、装备图标全部抓取到 `ui/public/assets/` 并提交仓库，前端默认只读本地文件，不再依赖第三方图片 CDN；
- 本地文件缺失时按 `data-fallback` 顺序回退官方 CDN；回退链结束后才隐藏或显示占位；
- 名称表变更后用 `tools/assets/fetch_images.py` 重新下载；该脚本也负责为没有官方图标的先天技能复制英雄小图标占位；
- 图标随 `ui/dist` 打包进桌面客户端，安装包体积因此增加约 44 MB，这是接受的产品成本。
- 图片版权归 Valve Corporation；「关于」页和官网 footer 必须保留版权说明，不得删除。
- 图片会随游戏版本变化/新增；`memory/dota-images.md` 记录当前快照与更新流程，Dota 更新后必须重新跑 `tools/assets/fetch_images.py` 并更新快照记录，必要时用 `--prune` 清理旧图。

## 2026-11-09 比赛查询备用源

- 仅在设置里填写 STRATZ API Token 时启用；
- 只在 OpenDota 失败（超时 / 5xx / 网络错误）时回退，OpenDota 正常时不额外请求；
- STRATZ 只提供比赛、阵容和基础统计；出装、技能加点、时间线等仍需 OpenDota 恢复或回放解析；
- 回退成功时在比赛选择区显示黄色降级提示，两个源都失败时合并显示原因。

## 2026-11-09 战斗节点

- 原「团战」Tab 改为分析对象中心的战斗节点；锚点为 focus 击杀/助攻/阵亡；
- schema 9 导出 all-hero combat events 与 1 秒 HP/MP/金钱/经验采样；
- 节点切分与展示是启发式，不使用官方未公开的团战定义；旧 schema 8 缓存自动失效；
- 德鲁伊熊灵在战斗节点独立成行/独立卡片，可单独查看或与德鲁伊同时显示；伤害/技能/物品同时计入德鲁伊总量，击杀助攻同步，熊灵阵亡单独显示且不计入德鲁伊死亡，参战英雄标记“含熊灵”；分析对象不是德鲁伊时同样把德鲁伊与小熊分开显示，承伤来源和时间线单独标“熊灵”。
- 回放 DEATH 事件的 assist 列表会包含击杀者，战斗节点统计与展示必须排除击杀者和死者；
- 节点默认 12 秒合并、前后 8 秒窗口；

记录会影响长期实现的决策；新决定追加在顶部。

## 2026-11-09 多模型提供商

- 提供商：OpenCode Go、MiniMax、DeepSeek、OpenAI/Codex API、小米 MiMo、自定义；
- 自定义 provider 支持三种协议：OpenAI Chat Completions、OpenAI Responses、Anthropic Messages；
- 自定义模型名由设置页手动填写，不请求 `/models`；模型目录可手动填入或通过接口获取；
- 自定义推理档位使用标签编辑：预设 low/medium/high/xhigh/max/ultra 可选，也可输入任意档位（逗号/回车生成标签，× 移除）；留空不发送；OpenAI 兼容动态模型若在 `capabilities.reasoning.effort`、`reasoning.effort` 或 `thinkingLevelMap` 中返回档位，也会自动展示；
- Claude Code / Codex 的订阅登录与 API Key 不是同一件事；当前只接 API Key 类服务，不把订阅 OAuth 混入模型设置；
- DeepSeek / MiMo 不发送 `reasoning_effort`。

## 2026-11-09 官网下载分发

- 官网主入口改为 Windows 桌面客户端；安装版/便携版链接为 `/downloads/*`；
- 安装包存放在 Cloudflare R2 `truesight-downloads`，Worker `DOWNLOADS` 绑定输出；
- 新增版本需同步 `website/index.html`、`cloudflare/worker.js` 白名单、R2 对象和部署；
- `website/index.html` 必须用 UTF-8 写入并用浏览器实际渲染校验：曾在改版时被写成乱码，`<title>` 的 `<` 被吞后整页会被浏览器当作文本，GitHub 上的同一提交也受影响。

## 2026-11-09 Electron 渲染策略

- Portable 首次启动复制 `resources/backend` 到 `%APPDATA%\TrueSight\portable-backend`，避免临时目录清理丢失 classes/lib/jre；
- 桌面客户端默认启用硬件加速，不再无条件调用 `app.disableHardwareAcceleration()`；
- 启动时加 `ignore-gpu-blocklist`、`enable-gpu-rasterization`、`use-angle=d3d11`、`force_high_performance_gpu`；
- 仅在驱动异常时用 `TRUESIGHT_DISABLE_GPU=1` 降级；
- Electron 注入 `desktop-shell` class，关闭 `.card` / `.timeline-overlay` / `.scrubber` 的 backdrop blur；
- `backgroundThrottling: false`，避免窗口失焦时时间轴动画降到 1 FPS；
- GPU 状态写入 `%APPDATA%\TrueSight\data\logs\backend.log`，正常应为 `gpu_compositing: enabled`。

## 2026-11-04 团战参团判定

- 位置：用造成伤害玩家的位置中位数作为战场中心；
- 参团：
  - 伤害 >0 且距离 ≤22 格，或使用全球伤害技能；
  - 治疗/增益/技能/物品行为且距离 ≤22 格，或使用全球治疗/增益技能；
- 全球技能白名单在 `ui/src/lib/teamfights.ts`；
- 基础模式没有坐标时退回行为判断。

## 2026-11-04 德鲁伊双天赋树

- 本体 8 条、小熊 8 条（4 层 × 2）；
- 小熊通用天赋以 `hero_id=80 + tree=bear` 的补充条目存在，避免 OpenDota 缺失；
- 天赋区域提供「本体 / 小熊」切换，两点独立、可延后补选；
- 源数据由 `tools/names/build.py` 的 `MANUAL_TALENTS` 持久化。

## 2026-11-04 装备组合与卷轴

- 组合守卫拆成真眼/假眼两条记录；
- 卷轴不再按成品 ±1.5 秒匹配，改为信任回放 removal 的 `mergedInto`，并用“成品前购买”兜底；
- 可堆叠消耗品按 FIFO（先买先消耗）归属，吃树一批 3 点。

## 2026-11-04 名称与图标

- 所有英雄/装备/技能优先中文官方名；
- 图标走 Steam CDN，图纸共用 `recipe.png`；
- 结果正文使用 `[图标]名称` 解析；技能图标只显示图片，不叠加等级数字；
- 缺失技能图标回退英雄头像，未知名称保留原文。

## 2026-11-03 AI 提供商

- 支持 OpenCode Go、MiniMax、DeepSeek 官方 API；
- DeepSeek 使用官方 `https://api.deepseek.com`，内置 `deepseek-chat` / `deepseek-reasoner` 两个模型；
- DeepSeek 不发送 `reasoning_effort`，`deepseek-reasoner` 的思考内容由 `reasoning_content` 透传；
- 每个 provider 独立 key/baseUrl；
- MiniMax 默认模型 `MiniMax-M3.1-Flash`；
- 通过本地 `server.py` 代理，避免浏览器 CORS/Key 暴露。

## 2026-11-03 品牌

- TrueSight 祖母绿晶体 logo + 白色/绿色字标；
- favicon/PWA 图标同源；
- 主题支持 TrueSight / 标准、深色 / 浅色。

## 2026-11-03 时间轴

- 高级分析使用回放 5 秒采样；
- 出装路线按真实格位/买卖/合成还原；
- 同一录像后台解析全部英雄，切换对象不重新分析；
- 停止分析使用 AbortController，保留已生成内容。
