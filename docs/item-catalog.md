# 装备名称与图标数据

## 结论

可以拿到**全部装备的「名称 + 图标」数据**，包括基础散件、合成件、图纸、消耗品和中立装备。

- **名称/分类/配件关系**：来自由 Dota2 官方 datafeed（中文名）+ OpenDota constants（`id`、`img`、`components`、`created`、`cost`）合并生成的 `data/names/items.json`。
- **图标**：OpenDota 的 `img` 字段和 STRATZ 的装备常量都指向 Steam 官方 CDN，图片本身不在 API 返回里；按 key 拼接 CDN 地址即可，全部 545 件已实测可访问。
- **STRATZ**：GraphQL 的 `constants.items` 同样提供装备常量与图片地址，但需要 Token；OpenDota 无需鉴权，本项目已用它作为数据源，因此没有额外依赖 STRATZ。

## 覆盖情况

当前 `data/names/items.json` 共 **545** 件：

| 分类 | 数量 | 说明 |
| --- | ---: | --- |
| 基础 | 215 | 散件、属性装 |
| 图纸 | 129 | 合成卷轴 |
| 合成 | 121 | 成装 |
| 消耗品 | 31 | 药、眼、TP 等 |
| 中立 t1–t5 | 49 | 中立装备 |

图标去重后 **417 个文件**（所有图纸共用一张 `recipe.png`），全部返回 HTTP 200。

## 前端数据

`npm run build` / `npm run dev` 会通过 `ui/scripts/build-names.mjs` 生成
`ui/public/names/items.json`，每件装备形如：

```json
{
  "id": 1,
  "key": "item_blink",
  "key_od": "blink",
  "cn": "闪烁匕首",
  "en": "Blink Dagger",
  "cost": 2250,
  "category": "基础",
  "components": [],
  "icon": "/apps/dota2/images/dota_react/items/blink.png"
}
```

图纸的 `icon` 统一为 `/apps/dota2/images/dota_react/items/recipe.png`；其余装备为
`/apps/dota2/images/dota_react/items/<key 去掉 item_ 前缀>.png`。

使用：

```ts
const CDN = 'https://cdn.cloudflare.steamstatic.com'
const item = names.itemByKey.get('item_blink')
const iconUrl = item?.icon ? CDN + item.icon : `${CDN}/apps/dota2/images/dota_react/items/blink.png`
```

时间轴出装路线已经优先使用该字段（[TimelineItems.vue](../ui/src/components/TimelineItems.vue)），图纸等也能拿到统一占位图。

## 可选：把图标下载到本地

如果希望离线可用，运行：

```bat
runtime\python\python.exe -X utf8 tools\names\download_item_icons.py
```

默认输出到 `ui/public/items/icons/`，并生成 `ui/public/items/manifest.json`（key → 文件名映射）。
实测 545 件装备 → 417 个文件、约 12.8 MB；支持 `--out`、`--force`、`--workers`、`--limit`。

## 重新生成

```bat
cd ui
npm run names
```

如需更新 OpenDota 常量本身，先运行 `runtime\python\python.exe -X utf8 tools\names\build.py`
（会刷新 `data/names/*.json`），再执行 `npm run names`。

## 注意

- 所有图纸共用官方 `recipe.png`，官方没有为每张图纸提供独立图标。
- 545 件里包含少量 Dota2 datafeed 中存在、OpenDota 常量没有的条目；图标仍可按 key 命中 CDN。
- CDN 需要网络；本地缓存方案见上文。
