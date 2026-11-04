# Dota 回放分析方法记忆（clarity 战斗日志口径）

## 时钟换算（强制执行）

战斗日志里所有时间戳都是**回放时钟**，包含选人/策略/准备阶段。
对外汇报一律换算成**对局时间**：`对局时间 = 回放时钟 − 开局偏移`。

- 开局偏移 = GAME_STATE `state=5`（GAME_IN_PROGRESS）出现的回放时刻，每场实测校准。
- 校验公式：`state=6（POST_GAME）时刻 − state=5 时刻 = 官方时长`。
- 已实测的偏移：9027308611 → 4:26；8966848241 → 4:26；9041169610 → 4:34；
  8963173951 → 3:49；8924183939 → 4:09；9033109910 → 2:55（Turbo）。
- **出装时间同样含偏移**，必须换算后再评价"快/慢"。

## 数据局限（复盘时如实声明）

- S2 战斗日志没有：英雄等级时间线、GPM/XPM、击杀坐标（DEATH 无 location）。
- `ENDGAME_STATS` / `HERO_LEVELUP` 条目为空，不要编造发育数据；发育效率只从出装时间推断。
- KDA 与官方（OpenDota/Dotabuff）允许 ±1 差异：幻象/召唤物归因、A杖击杀等口径不同。
- `endTime`（FileInfo）是墙钟时间戳，不是比赛时长；时长用 playback 或官方 duration。

## 命名规范

- 英雄/装备中文名以 `dota-heroes.md`、`dota-items.md` 为准，动笔前先查表。
- 易错：噬魂鬼=Lifestealer（小狗）；恐怖利刃=Terrorblade（TB）；小鱼人=Slark；
  莱恩=Lion（不叫"雄狮"）；黑鸟=Outworld Destroyer；米拉娜=pom；撼地者=小牛。

## 名称口径（自动生成，勿手改本段）

- 英雄、装备、技能的中英名以 dota2.com 官方 datafeed 为准（`schinese` 与 `english` 双向核对）；
  OpenDota 的 `localized_name` / `dname` 只作别名与回退，差异见 `tools/names/report.md`。
- 查名顺序：`memory/dota-heroes.md` → `memory/dota-items.md` → `memory/dota-abilities.md` →
  `memory/dota-talents.md`；机器可读版 `data/names/*.json`，ID 与 STRATZ `heroId` / `itemId` 同源。
- 天赋：每英雄 8 条（4 层 × 2），10/15/20/25 解锁第一轮，27/28/29/30 补选另一条；
  天赋、技能、属性附加共用技能点。属性附加=`special_bonus_attributes`（+2 全属性/级，
  最多 7 级，祈求者除外）。
- 内部名会过时：`lion_impale` 现显示 Earth Spike（裂地尖刺），`mirana_starfall` 现显示
  Starstorm（群星风暴）。引用时用显示名，内部名只作键。
- 回放里的中立物品/地图技能（`ability_lamp_use`、`twin_gate_portal_warp` 等）不在技能表内。
- 实际加点顺序：OpenDota 比赛数据的 `ability_upgrades_arr` 里有技能、天赋和属性附加的选取
  顺序（需比赛已被解析）；本地回放导出器目前不输出加点事件，等级时间线也还缺。
