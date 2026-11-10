# Dota 2 图片资源记忆

记录本地图片资源的来源、版权、更新方式与历史快照。**每次 Dota 大版本更新或名称表变动后都要回看本文档。**

## 版权

- Dota 2 以及游戏内的英雄头像、英雄小图标、技能图标、装备图标等美术资源，版权归 **Valve Corporation** 所有。
- 本项目仅把它用于本机的对局分析与展示，与 Valve 没有隶属、赞助或合作关系。
- 客户端「关于」页（`ui/src/components/AboutView.vue`）必须保留「版权说明」面板，写明图片版权归 Valve 所有；官网 footer 也有同样的说明。
- 不要把图片资源单独打包、二次分发或用于商业用途。

## 当前快照

| 项 | 值 |
| --- | --- |
| 抓取日期 | 2026-11-10 |
| 文件数 | 1407 个 PNG |
| 体积 | 约 43.7 MB |
| 英雄头像 | 127 张（256×144） |
| 英雄小图标 | 127 张（32×32） |
| 技能图标 | 736 张（128×128） |
| 装备图标 | 417 个文件（88×64；545 个装备 key，图纸共用 `recipe.png`） |
| 先天技能占位 | 49 张（复制对应英雄小图标） |

运行期元数据在 `ui/public/assets/manifest.json`（生成时间、数量、失败列表、清理数量），「关于」页会读取它显示快照日期和文件数。

## 目录与命名

```text
ui/public/assets/
├── manifest.json
├── heroes/<slug>.png            # 英雄头像
├── heroes/icons/<slug>.png      # 英雄小图标
├── abilities/<key>.png          # 技能图标
└── items/<item_key>.png         # 装备图标（图纸统一 recipe.png）
```

## 更新流程（Dota 版本更新后）

1. 刷新名称表：`python tools/names/fetch_raw.py` → `python tools/names/build.py`（或在 `ui` 下 `npm run names`）。
2. 抓取新图：`runtime\python\python.exe -X utf8 tools\assets\fetch_images.py`。
3. 如果确定有旧技能/装备被删除或改名，加 `--prune` 清理不再引用的旧图。
4. 检查输出：`失败 0`，文件数/体积与 `manifest.json` 一致。
5. 前端构建：`cd ui && npm run build`（vue-tsc + vite，会复制 `public/assets`）。
6. 桌面客户端需要重新打包（`desktop` 下 `npm run pack`，再出 portable/NSIS），因为图标随 `ui/dist` 分发。
7. 提交时一并更新本文档的「当前快照」和 `memory/ai/changelog.md`。

## 已知边界

- **名称表是唯一入口**：抓取脚本只处理 `ui/public/names/*.json` 里的英雄/技能/装备。新英雄、新技能必须先进入名称表，否则不会下载。
- **先天技能没有独立图标**：部分先天技能在官方 CDN 404（如 `axe_one_man_army`），脚本自动复制英雄小图标占位；新增这类技能会自动处理。
- **仍缺图标的 key**：`plus_high_five`、`ability_lamp_use`、`twin_gate_portal_warp` 目前官方 CDN 没有图标，界面会隐藏；若以后 CDN 提供，加进 `tools/assets/fetch_images.py` 的 `EXTRA_ABILITY_PATHS`。
- **图纸共用图标**：所有 `item_recipe_*` 都指向 `items/recipe.png`，不要再按 key 存重复文件。
- **缓存**：图片 URL 不带内容哈希，`server.py` 对 `assets/heroes|abilities|items/` 只给 1 天缓存；不要改回 `immutable`，否则换图后客户端会长期读旧图。
- **回退**：前端 `ui/src/lib/assets.ts` 默认读本地文件，缺失时按 `data-fallback` 回退官方 CDN，最后才隐藏；新增图片但未及时更新资源时不会裂图。

## 历史

- 2026-11-10：首次把 1407 张图片（43.7 MB）落到 `ui/public/assets/`，前端改为本地优先；新增 `tools/assets/fetch_images.py`；「关于」页和官网补充 Valve 版权说明。
