# Dota 2 英雄对照表（ID / 内部名 / 英文 / 中文）

数据源：中文=dota2.com datafeed（`language=schinese` 的 `name_loc`）；英文=dota2.com datafeed
（`language=english`）；内部名与 ID=OpenDota dotaconstants `heroes.json`。
STRATZ 在本项目里只用 `heroId`（数值），与这里的 ID 是同一套编号。

由 `tools/names/build.py` 生成；校验报告见 `tools/names/report.md`；技能见 `memory/dota-abilities.md`。

> 易混淆名称（已核验）：
>
> - 噬魂鬼 = Lifestealer（`npc_dota_hero_life_stealer`），昵称：小狗 / LS
> - 恐怖利刃 = Terrorblade（`npc_dota_hero_terrorblade`），昵称：TB / 魂守
> - 斯拉克 = Slark（`npc_dota_hero_slark`），昵称：小鱼人 / 小鱼
> - 米拉娜 = Mirana，昵称 pom；撼地者 = Earthshaker，昵称小牛；
>   影魔 = Shadow Fiend（Nevermore），昵称 SF；黑鸟 = Outworld Destroyer，昵称 OD
> - 莱恩 = Lion（`npc_dota_hero_lion`）；Lion **不叫“雄狮”**，统一用“莱恩”
> - 76 号 OpenDota 旧名 Outworld Devourer，官方现名 Outworld Destroyer；
>   131 号 OpenDota 写 Ring Master，官方现名 Ringmaster

| ID | 内部名 | 英文官方名 | 中文官方名 | 主属性 | 复杂度 | 技能数 |
|---:|---|---|---|---|---|---:|
| 1 | `npc_dota_hero_antimage` | Anti-Mage | 敌法师 | 敏捷 | 简单 | 5 |
| 2 | `npc_dota_hero_axe` | Axe | 斧王 | 力量 | 简单 | 5 |
| 3 | `npc_dota_hero_bane` | Bane | 祸乱之源 | 全才 | 中等 | 5 |
| 4 | `npc_dota_hero_bloodseeker` | Bloodseeker | 血魔 | 敏捷 | 简单 | 5 |
| 5 | `npc_dota_hero_crystal_maiden` | Crystal Maiden | 水晶室女 | 智力 | 简单 | 6 |
| 6 | `npc_dota_hero_drow_ranger` | Drow Ranger | 卓尔游侠 | 敏捷 | 简单 | 6 |
| 7 | `npc_dota_hero_earthshaker` | Earthshaker | 撼地者 | 力量 | 中等 | 5 |
| 8 | `npc_dota_hero_juggernaut` | Juggernaut | 主宰 | 敏捷 | 简单 | 6 |
| 9 | `npc_dota_hero_mirana` | Mirana | 米拉娜 | 敏捷 | 中等 | 5 |
| 10 | `npc_dota_hero_morphling` | Morphling | 变体精灵 | 敏捷 | 困难 | 6 |
| 11 | `npc_dota_hero_nevermore` | Shadow Fiend | 影魔 | 敏捷 | 中等 | 5 |
| 12 | `npc_dota_hero_phantom_lancer` | Phantom Lancer | 幻影长矛手 | 敏捷 | 中等 | 5 |
| 13 | `npc_dota_hero_puck` | Puck | 帕克 | 智力 | 中等 | 5 |
| 14 | `npc_dota_hero_pudge` | Pudge | 帕吉 | 力量 | 中等 | 5 |
| 15 | `npc_dota_hero_razor` | Razor | 雷泽 | 敏捷 | 简单 | 5 |
| 16 | `npc_dota_hero_sand_king` | Sand King | 沙王 | 全才 | 中等 | 5 |
| 17 | `npc_dota_hero_storm_spirit` | Storm Spirit | 风暴之灵 | 智力 | 中等 | 5 |
| 18 | `npc_dota_hero_sven` | Sven | 斯温 | 力量 | 简单 | 5 |
| 19 | `npc_dota_hero_tiny` | Tiny | 小小 | 力量 | 中等 | 7 |
| 20 | `npc_dota_hero_vengefulspirit` | Vengeful Spirit | 复仇之魂 | 敏捷 | 简单 | 5 |
| 21 | `npc_dota_hero_windrunner` | Windranger | 风行者 | 全才 | 中等 | 6 |
| 22 | `npc_dota_hero_zuus` | Zeus | 宙斯 | 智力 | 简单 | 7 |
| 23 | `npc_dota_hero_kunkka` | Kunkka | 昆卡 | 力量 | 中等 | 6 |
| 25 | `npc_dota_hero_lina` | Lina | 莉娜 | 智力 | 简单 | 6 |
| 26 | `npc_dota_hero_lion` | Lion | 莱恩 | 智力 | 简单 | 5 |
| 27 | `npc_dota_hero_shadow_shaman` | Shadow Shaman | 暗影萨满 | 智力 | 简单 | 6 |
| 28 | `npc_dota_hero_slardar` | Slardar | 斯拉达 | 力量 | 简单 | 5 |
| 29 | `npc_dota_hero_tidehunter` | Tidehunter | 潮汐猎人 | 力量 | 简单 | 6 |
| 30 | `npc_dota_hero_witch_doctor` | Witch Doctor | 巫医 | 智力 | 简单 | 6 |
| 31 | `npc_dota_hero_lich` | Lich | 巫妖 | 智力 | 简单 | 6 |
| 32 | `npc_dota_hero_riki` | Riki | 力丸 | 敏捷 | 简单 | 5 |
| 33 | `npc_dota_hero_enigma` | Enigma | 谜团 | 全才 | 中等 | 5 |
| 34 | `npc_dota_hero_tinker` | Tinker | 修补匠 | 智力 | 中等 | 6 |
| 35 | `npc_dota_hero_sniper` | Sniper | 狙击手 | 敏捷 | 简单 | 6 |
| 36 | `npc_dota_hero_necrolyte` | Necrophos | 瘟疫法师 | 智力 | 简单 | 6 |
| 37 | `npc_dota_hero_warlock` | Warlock | 术士 | 智力 | 简单 | 5 |
| 38 | `npc_dota_hero_beastmaster` | Beastmaster | 兽王 | 全才 | 中等 | 6 |
| 39 | `npc_dota_hero_queenofpain` | Queen of Pain | 痛苦女王 | 智力 | 中等 | 5 |
| 40 | `npc_dota_hero_venomancer` | Venomancer | 剧毒术士 | 全才 | 简单 | 5 |
| 41 | `npc_dota_hero_faceless_void` | Faceless Void | 虚空假面 | 敏捷 | 中等 | 6 |
| 42 | `npc_dota_hero_skeleton_king` | Wraith King | 冥魂大帝 | 力量 | 简单 | 5 |
| 43 | `npc_dota_hero_death_prophet` | Death Prophet | 死亡先知 | 全才 | 简单 | 5 |
| 44 | `npc_dota_hero_phantom_assassin` | Phantom Assassin | 幻影刺客 | 敏捷 | 简单 | 6 |
| 45 | `npc_dota_hero_pugna` | Pugna | 帕格纳 | 智力 | 中等 | 5 |
| 46 | `npc_dota_hero_templar_assassin` | Templar Assassin | 圣堂刺客 | 敏捷 | 中等 | 6 |
| 47 | `npc_dota_hero_viper` | Viper | 冥界亚龙 | 敏捷 | 简单 | 6 |
| 48 | `npc_dota_hero_luna` | Luna | 露娜 | 敏捷 | 简单 | 5 |
| 49 | `npc_dota_hero_dragon_knight` | Dragon Knight | 龙骑士 | 力量 | 简单 | 6 |
| 50 | `npc_dota_hero_dazzle` | Dazzle | 戴泽 | 全才 | 简单 | 5 |
| 51 | `npc_dota_hero_rattletrap` | Clockwerk | 发条技师 | 力量 | 中等 | 7 |
| 52 | `npc_dota_hero_leshrac` | Leshrac | 拉席克 | 智力 | 简单 | 6 |
| 53 | `npc_dota_hero_furion` | Nature's Prophet | 自然先知 | 全才 | 中等 | 6 |
| 54 | `npc_dota_hero_life_stealer` | Lifestealer | 噬魂鬼 | 力量 | 中等 | 5 |
| 55 | `npc_dota_hero_dark_seer` | Dark Seer | 黑暗贤者 | 智力 | 简单 | 6 |
| 56 | `npc_dota_hero_clinkz` | Clinkz | 克林克兹 | 敏捷 | 中等 | 7 |
| 57 | `npc_dota_hero_omniknight` | Omniknight | 全能骑士 | 力量 | 简单 | 5 |
| 58 | `npc_dota_hero_enchantress` | Enchantress | 魅惑魔女 | 智力 | 中等 | 7 |
| 59 | `npc_dota_hero_huskar` | Huskar | 哈斯卡 | 力量 | 简单 | 5 |
| 60 | `npc_dota_hero_night_stalker` | Night Stalker | 暗夜魔王 | 力量 | 简单 | 5 |
| 61 | `npc_dota_hero_broodmother` | Broodmother | 育母蜘蛛 | 敏捷 | 中等 | 6 |
| 62 | `npc_dota_hero_bounty_hunter` | Bounty Hunter | 赏金猎人 | 敏捷 | 简单 | 6 |
| 63 | `npc_dota_hero_weaver` | Weaver | 编织者 | 敏捷 | 中等 | 5 |
| 64 | `npc_dota_hero_jakiro` | Jakiro | 杰奇洛 | 智力 | 简单 | 6 |
| 65 | `npc_dota_hero_batrider` | Batrider | 蝙蝠骑士 | 全才 | 中等 | 5 |
| 66 | `npc_dota_hero_chen` | Chen | 陈 | 智力 | 困难 | 5 |
| 67 | `npc_dota_hero_spectre` | Spectre | 幽鬼 | 敏捷 | 中等 | 5 |
| 68 | `npc_dota_hero_ancient_apparition` | Ancient Apparition | 远古冰魄 | 智力 | 中等 | 5 |
| 69 | `npc_dota_hero_doom_bringer` | Doom | 末日使者 | 力量 | 中等 | 5 |
| 70 | `npc_dota_hero_ursa` | Ursa | 熊战士 | 敏捷 | 简单 | 5 |
| 71 | `npc_dota_hero_spirit_breaker` | Spirit Breaker | 裂魂人 | 力量 | 简单 | 6 |
| 72 | `npc_dota_hero_gyrocopter` | Gyrocopter | 矮人直升机 | 敏捷 | 简单 | 6 |
| 73 | `npc_dota_hero_alchemist` | Alchemist | 炼金术士 | 力量 | 简单 | 6 |
| 74 | `npc_dota_hero_invoker` | Invoker | 祈求者 | 智力 | 困难 | 14 |
| 75 | `npc_dota_hero_silencer` | Silencer | 沉默术士 | 智力 | 中等 | 5 |
| 76 | `npc_dota_hero_obsidian_destroyer` | Outworld Destroyer | 殁境神蚀者 | 智力 | 中等 | 5 |
| 77 | `npc_dota_hero_lycan` | Lycan | 狼人 | 力量 | 中等 | 6 |
| 78 | `npc_dota_hero_brewmaster` | Brewmaster | 酒仙 | 全才 | 困难 | 5 |
| 79 | `npc_dota_hero_shadow_demon` | Shadow Demon | 暗影恶魔 | 智力 | 中等 | 6 |
| 80 | `npc_dota_hero_lone_druid` | Lone Druid | 独行德鲁伊 | 敏捷 | 困难 | 5 |
| 81 | `npc_dota_hero_chaos_knight` | Chaos Knight | 混沌骑士 | 力量 | 简单 | 5 |
| 82 | `npc_dota_hero_meepo` | Meepo | 米波 | 敏捷 | 困难 | 8 |
| 83 | `npc_dota_hero_treant` | Treant Protector | 树精卫士 | 力量 | 中等 | 6 |
| 84 | `npc_dota_hero_ogre_magi` | Ogre Magi | 食人魔魔法师 | 力量 | 简单 | 7 |
| 85 | `npc_dota_hero_undying` | Undying | 不朽尸王 | 力量 | 简单 | 5 |
| 86 | `npc_dota_hero_rubick` | Rubick | 拉比克 | 智力 | 困难 | 5 |
| 87 | `npc_dota_hero_disruptor` | Disruptor | 干扰者 | 智力 | 中等 | 6 |
| 88 | `npc_dota_hero_nyx_assassin` | Nyx Assassin | 司夜刺客 | 全才 | 中等 | 6 |
| 89 | `npc_dota_hero_naga_siren` | Naga Siren | 娜迦海妖 | 敏捷 | 中等 | 5 |
| 90 | `npc_dota_hero_keeper_of_the_light` | Keeper of the Light | 光之守卫 | 智力 | 中等 | 7 |
| 91 | `npc_dota_hero_wisp` | Io | 艾欧 | 全才 | 困难 | 7 |
| 92 | `npc_dota_hero_visage` | Visage | 维萨吉 | 全才 | 困难 | 5 |
| 93 | `npc_dota_hero_slark` | Slark | 斯拉克 | 敏捷 | 中等 | 6 |
| 94 | `npc_dota_hero_medusa` | Medusa | 美杜莎 | 敏捷 | 简单 | 6 |
| 95 | `npc_dota_hero_troll_warlord` | Troll Warlord | 巨魔战将 | 敏捷 | 中等 | 6 |
| 96 | `npc_dota_hero_centaur` | Centaur Warrunner | 半人马战行者 | 力量 | 简单 | 6 |
| 97 | `npc_dota_hero_magnataur` | Magnus | 马格纳斯 | 全才 | 中等 | 6 |
| 98 | `npc_dota_hero_shredder` | Timbersaw | 伐木机 | 力量 | 中等 | 6 |
| 99 | `npc_dota_hero_bristleback` | Bristleback | 钢背兽 | 力量 | 简单 | 6 |
| 100 | `npc_dota_hero_tusk` | Tusk | 巨牙海民 | 力量 | 简单 | 7 |
| 101 | `npc_dota_hero_skywrath_mage` | Skywrath Mage | 天怒法师 | 智力 | 简单 | 5 |
| 102 | `npc_dota_hero_abaddon` | Abaddon | 亚巴顿 | 全才 | 简单 | 5 |
| 103 | `npc_dota_hero_elder_titan` | Elder Titan | 上古巨神 | 力量 | 中等 | 5 |
| 104 | `npc_dota_hero_legion_commander` | Legion Commander | 军团指挥官 | 力量 | 简单 | 5 |
| 105 | `npc_dota_hero_techies` | Techies | 工程师 | 全才 | 中等 | 6 |
| 106 | `npc_dota_hero_ember_spirit` | Ember Spirit | 灰烬之灵 | 敏捷 | 中等 | 6 |
| 107 | `npc_dota_hero_earth_spirit` | Earth Spirit | 大地之灵 | 力量 | 困难 | 6 |
| 108 | `npc_dota_hero_abyssal_underlord` | Underlord | 孽主 | 力量 | 中等 | 5 |
| 109 | `npc_dota_hero_terrorblade` | Terrorblade | 恐怖利刃 | 敏捷 | 中等 | 7 |
| 110 | `npc_dota_hero_phoenix` | Phoenix | 凤凰 | 力量 | 中等 | 5 |
| 111 | `npc_dota_hero_oracle` | Oracle | 神谕者 | 智力 | 困难 | 6 |
| 112 | `npc_dota_hero_winter_wyvern` | Winter Wyvern | 寒冬飞龙 | 智力 | 中等 | 5 |
| 113 | `npc_dota_hero_arc_warden` | Arc Warden | 天穹守望者 | 全才 | 困难 | 5 |
| 114 | `npc_dota_hero_monkey_king` | Monkey King | 齐天大圣 | 敏捷 | 中等 | 6 |
| 119 | `npc_dota_hero_dark_willow` | Dark Willow | 邪影芳灵 | 智力 | 中等 | 6 |
| 120 | `npc_dota_hero_pangolier` | Pangolier | 石鳞剑士 | 全才 | 中等 | 6 |
| 121 | `npc_dota_hero_grimstroke` | Grimstroke | 天涯墨客 | 智力 | 中等 | 6 |
| 123 | `npc_dota_hero_hoodwink` | Hoodwink | 森海飞霞 | 敏捷 | 中等 | 7 |
| 126 | `npc_dota_hero_void_spirit` | Void Spirit | 虚无之灵 | 全才 | 中等 | 5 |
| 128 | `npc_dota_hero_snapfire` | Snapfire | 电炎绝手 | 全才 | 简单 | 7 |
| 129 | `npc_dota_hero_mars` | Mars | 玛尔斯 | 力量 | 简单 | 5 |
| 131 | `npc_dota_hero_ringmaster` | Ringmaster | 百戏大王 | 智力 | 中等 | 10 |
| 135 | `npc_dota_hero_dawnbreaker` | Dawnbreaker | 破晓辰星 | 力量 | 简单 | 5 |
| 136 | `npc_dota_hero_marci` | Marci | 玛西 | 全才 | 中等 | 5 |
| 137 | `npc_dota_hero_primal_beast` | Primal Beast | 獸 | 力量 | 简单 | 6 |
| 138 | `npc_dota_hero_muerta` | Muerta | 琼英碧灵 | 智力 | 简单 | 6 |
| 145 | `npc_dota_hero_kez` | Kez | 凯 | 敏捷 | 困难 | 9 |
| 155 | `npc_dota_hero_largo` | Largo | 朗戈 | 力量 | 中等 | 8 |

共 127 个英雄。
