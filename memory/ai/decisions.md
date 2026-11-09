# 设计决策

记录会影响长期实现的决策；新决定追加在顶部。

## 2026-11-09 多模型提供商

- 提供商：OpenCode Go、MiniMax、DeepSeek、OpenAI/Codex API、小米 MiMo、自定义；
- 自定义 provider 支持三种协议：OpenAI Chat Completions、OpenAI Responses、Anthropic Messages；
- 自定义模型名由设置页手动填写，不请求 `/models`；模型目录可手动填入或通过接口获取；
- 自定义推理档位使用标签编辑：预设 low/medium/high/xhigh/max/ultra 可选，也可输入任意档位（逗号/回车生成标签，× 移除）；留空不发送；OpenAI 兼容动态模型若在 `capabilities.reasoning.effort`、`reasoning.effort` 或 `thinkingLevelMap` 中返回档位，也会自动展示；
- Claude Code / Codex 的订阅登录与 API Key 不是同一件事；当前只接 API Key 类服务，不把订阅 OAuth 混入模型设置；
- DeepSeek / MiMo 不发送 `reasoning_effort`。

## 2026-11-09 Electron 渲染策略

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
