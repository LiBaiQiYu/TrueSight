# 名称对照校验报告

生成时间：2026-11-03T18:21:28+08:00

## 口径

- **公共键是数值 ID**：OpenDota、STRATZ、官方 datafeed 用的是同一套英雄/装备/技能编号；
  内部名（`npc_dota_hero_*` / `item_*` / 技能名）在 OpenDota 与 datafeed 之间也完全一致。
- **中文、英文官方名以 dota2.com datafeed 为准**（`language=schinese` / `english`）；
  OpenDota 的 `localized_name` / `dname` 作为别名与回退，不一致处在下方列出。
- EN 与 CN 都取“官方当前版本”，不沿用旧译名；回放/日志里的内部名可直接查表。
- 装备键有两种写法：回放日志是 `item_blink`，OpenDota `purchase_log` 是 `blink`；
  `items.json` 的 `key` 与 `key_od` 同时保留，查表时两种都能对上。

## OpenDota 与 STRATZ 的名称口径

| 数据 | OpenDota | STRATZ（本项目实际用到的） | 本表采用 |
|---|---|---|---|
| 英雄 | `localized_name` 英文名 + `name`=`npc_dota_hero_*` + 数值 `id` | 比赛接口只返回 `heroId`（数值），不返回名称 | 数值 id + 内部名，中文查本表 |
| 装备 | `dname` 英文名 + 键（不带 `item_` 前缀）+ 数值 `id` | 本项目未取 STRATZ 装备字段 | OpenDota `item_*` 键 + 数值 id |
| 技能 | `dname` 英文名 + 内部名 + `ability_ids` | 本项目未取 STRATZ 技能字段 | 内部名 + 数值 id |
| 天赋 | `hero_abilities.talents[]` 只有内部名 + 层级 | 本项目未取 STRATZ 天赋字段 | 名称取 datafeed，层级取 OpenDota |

结论：两边的“名称”只是英文/内部键的不同投影，真正的公共键是 **数值 ID** 与 **内部名**；
中文只能从官方本地化取，所以本表用 ID/内部名索引、官方中文作值。`stratz.ts` 里
`findStratzPlayer(match, heroId, isRadiant)` 直接把 STRATZ 的 `heroId` 对到同一张英雄表，
也印证了这套编号。STRATZ 常量接口需要 token，本次未拉取它的 `displayName`；需要逐字对照可提供 token 再补一轮。

## 覆盖

| 项目 | 数量 | 英文 | 中文 |
|---|---:|---|---|
| 英雄 | 127 | 127/127 | 127/127 |
| 技能 | 734 | 734/734 | 734/734 |
| 天赋 | 1016 | 1016/1016 | 1016/1016（数值解析 1011） |
| 装备 | 545 | 538/545 | 官方 507 + 推导 30 + 缺失 8 |

## 天赋树口径

- 每个英雄 8 条天赋，4 层 × 2；10/15/20/25 解锁第一轮，27/28/29/30 再解锁一轮补选另一条。
- 天赋、技能、属性附加共用同一个技能点。
- 属性附加（Attribute Bonus，`special_bonus_attributes`，ID 730）：+2 全属性/级，最多 7 级，祈求者除外。
- 数值取技能 `special_values[].bonuses[]` 里指向该天赋的值，替换 `{s:...}` 占位符；
  1011 条解析出数值，5 条保留占位符。
- 层级以 OpenDota `talents[].level` 为准（1003 条）；常量滞后、天赋被改名的 13 条按被替换的旧天赋推断层级并标记 `inferred`。通用天赋（如 +200 生命）会被多个英雄共用，所以内部名不是全局唯一，(英雄, 内部名) 才唯一。

## 与 OpenDota 的英文名差异（已按官方修正）

英雄：2 处
- 76 `npc_dota_hero_obsidian_destroyer`：OpenDota=Outworld Devourer → 官方=Outworld Destroyer
- 131 `npc_dota_hero_ringmaster`：OpenDota=Ring Master → 官方=Ringmaster

技能：0 处

装备：0 处

## 天赋数值未解析

以下 5 条天赋在技能数据里找不到对应 bonus，保留官方占位符：

- `special_bonus_unique_tinker_5`（npc_dota_hero_tinker）：-{s:bonus_AbilityChannelTime}秒 基恩载具持续施法
- `special_bonus_unique_beastmaster_5`（npc_dota_hero_beastmaster）：兽王及其召唤物+{s:bonus_ms} 移速
- `special_bonus_unique_beastmaster_6`（npc_dota_hero_beastmaster）：兽王及其召唤物+{s:bonus_hp} 生命
- `special_bonus_unique_invoker_forged_spirit_armor_reduction`（npc_dota_hero_invoker）：+{s:bonus_armor_removed}% 熔炉精灵护甲减少
- `special_bonus_unique_naga_siren_reel_in_speed`（npc_dota_hero_naga_siren）：+{s:bonus_pull_strength} 捕捞速度

## 装备中文名缺口

- 官方直接给出：507 件
- 按官方“图纸（父装备）”格式推导：30 件
- 官网无中文名（多为已废弃配方/未使用条目）：8 件

| 内部名 | 英文 | 说明 |
|---|---|---|
| `item_diffusal_blade_2` | Diffusal Blade | 官网条目已停用 |
| `item_greater_mango` | （无） | 官网条目已停用 |
| `item_horizon` | （无） | 官网条目已停用 |
| `item_mechanical_arm` | （无） | 官网条目已停用 |
| `item_bottomless_chalice` | （无） | 官网条目已停用 |
| `item_super_blink` | （无） | 官网条目已停用 |
| `item_miniboss_minion_summoner` | （无） | 官网条目已停用 |
| `item_caster_rapier` | （无） | 官网条目已停用 |

## 重名（等级变体 / 配方与成品同名）

同一中文名对应多个键：配方与成品同名是官方命名方式，等级变体已在表里标“N 级变体”。

- 图纸（死灵书） → `item_recipe_necronomicon`、`item_recipe_necronomicon_2`、`item_recipe_necronomicon_3`
- 图纸（达贡之神力） → `item_recipe_dagon`、`item_recipe_dagon_2`、`item_recipe_dagon_3`、`item_recipe_dagon_4`、`item_recipe_dagon_5`
- 图纸（远行鞋） → `item_recipe_travel_boots`、`item_recipe_travel_boots_2`
- 死灵书 → `item_necronomicon`、`item_necronomicon_2`、`item_necronomicon_3`
- 达贡之神力 → `item_dagon`、`item_dagon_2`、`item_dagon_3`、`item_dagon_4`、`item_dagon_5`
- 远行鞋 → `item_travel_boots`、`item_travel_boots_2`
- 阿哈利姆福佑 → `item_recipe_ultimate_scepter_2`、`item_ultimate_scepter_2`

## 需要注意的点

- 76 号英雄：OpenDota 仍写 `Outworld Devourer`，官方现名 `Outworld Destroyer`（黑鸟/OD）。
- 131 号英雄：OpenDota 写 `Ring Master`，官方现名 `Ringmaster`（百戏大王）。
- 技能显示名会随版本改：`lion_impale` 现为 Earth Spike（裂地尖刺），`mirana_starfall`
  现为 Starstorm（群星风暴）；内部名不变，引用以本表显示名为准。
- 部分装备官方中文名与旧记忆表不同：`item_ward_observer` 官方“侦察守卫”，`item_blight_stone`
  官方“枯萎之珠”，`item_orb_of_corrosion` 官方“腐蚀之珠”；本表已按官方更新。
- `item_recipe_mage_slayer` 官方中文写成“图纸（巫师之刃）”，与 `item_mage_slayer`=法师克星
  冲突，已按官方配方格式修正为“图纸（法师克星）”。
- 官方中文未翻译：1 件（`item_black_grimoire`），中文列保留官方原文，已标注。
- `item_black_grimoire` 的 OpenDota `dname` 含字面量 `\n`，已清洗。
- 技能名只覆盖英雄技能（含先天技能）。回放日志里的中立物品/地图技能（如 `ability_lamp_use`、
  `twin_gate_portal_warp`）不在本表，遇到时单独说明。

## 复现

```
runtime\python\python.exe -X utf8 tools\names\fetch_raw.py   # 中文源 + OpenDota
runtime\python\python.exe -X utf8 tools\names\fetch_en.py   # 英文源（反向校验）
runtime\python\python.exe -X utf8 tools\names\build.py      # 生成数据与记忆表
```
