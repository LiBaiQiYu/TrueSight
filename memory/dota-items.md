# Dota 2 装备对照表（ID / 内部名 / 英文 / 中文）

数据源：中文=dota2.com datafeed `itemlist?language=schinese` 的 `name_loc`；英文=同一接口
`language=english`；ID、价格、合成关系=OpenDota `items.json`。
`内部名`带 `item_` 前缀，与回放战斗日志一致；OpenDota `purchase_log` 的键不带前缀
（`blink` 就是 `item_blink`），`data/names/items.json` 的 `key_od` 字段保存这种写法。
分类：图纸=合成卷轴，中立 tN=中立装备第 N 阶，消耗品，合成=有配件/配方，基础=散件。

中文名来源：备注为空=官方直接给出；“中文推导”=官方缺名，按官方“图纸（父装备）”格式补。
由 `tools/names/build.py` 生成；校验报告见 `tools/names/report.md`。

| ID | 内部名 | 英文名 | 中文名 | 分类 | 价格 | 备注 |
|---:|---|---|---|---|---:|---|
| 1 | `item_blink` | Blink Dagger | 闪烁匕首 | 基础 | 2250 |  |
| 2 | `item_blades_of_attack` | Blades of Attack | 攻击之爪 | 基础 | 450 |  |
| 3 | `item_broadsword` | Broadsword | 阔剑 | 基础 | 1000 |  |
| 4 | `item_chainmail` | Chainmail | 锁子甲 | 基础 | 500 |  |
| 5 | `item_claymore` | Claymore | 大剑 | 基础 | 1350 |  |
| 6 | `item_helm_of_iron_will` | Helm of Iron Will | 铁意头盔 | 基础 | 975 |  |
| 7 | `item_javelin` | Javelin | 标枪 | 基础 | 900 |  |
| 8 | `item_mithril_hammer` | Mithril Hammer | 秘银锤 | 基础 | 1600 |  |
| 9 | `item_platemail` | Platemail | 板甲 | 基础 | 1400 |  |
| 10 | `item_quarterstaff` | Quarterstaff | 短棍 | 基础 | 875 |  |
| 11 | `item_quelling_blade` | Quelling Blade | 压制之刃 | 基础 | 100 |  |
| 12 | `item_ring_of_protection` | Ring of Protection | 守护指环 | 基础 | 175 |  |
| 13 | `item_gauntlets` | Gauntlets of Strength | 力量手套 | 基础 | 140 |  |
| 14 | `item_slippers` | Slippers of Agility | 敏捷便鞋 | 基础 | 140 |  |
| 15 | `item_mantle` | Mantle of Intelligence | 智力斗篷 | 基础 | 140 |  |
| 16 | `item_branches` | Iron Branch | 铁树枝干 | 消耗品 | 55 |  |
| 17 | `item_belt_of_strength` | Belt of Strength | 力量腰带 | 基础 | 450 |  |
| 18 | `item_boots_of_elves` | Band of Elvenskin | 精灵布带 | 基础 | 450 |  |
| 19 | `item_robe` | Robe of the Magi | 法师长袍 | 基础 | 450 |  |
| 20 | `item_circlet` | Circlet | 圆环 | 基础 | 155 |  |
| 21 | `item_ogre_axe` | Ogre Axe | 食人魔之斧 | 基础 | 1000 |  |
| 22 | `item_blade_of_alacrity` | Blade of Alacrity | 欢欣之刃 | 基础 | 1000 |  |
| 23 | `item_staff_of_wizardry` | Staff of Wizardry | 魔力法杖 | 基础 | 1000 |  |
| 24 | `item_ultimate_orb` | Ultimate Orb | 极限法球 | 基础 | 2800 |  |
| 25 | `item_gloves` | Gloves of Haste | 加速手套 | 基础 | 450 |  |
| 26 | `item_lifesteal` | Morbid Mask | 吸血面具 | 基础 | 900 |  |
| 27 | `item_ring_of_regen` | Ring of Regen | 回复戒指 | 基础 | 175 |  |
| 28 | `item_sobi_mask` | Sage's Mask | 贤者面罩 | 基础 | 175 |  |
| 29 | `item_boots` | Boots of Speed | 速度之靴 | 基础 | 500 |  |
| 30 | `item_gem` | Gem of True Sight | 真视宝石 | 基础 | 900 |  |
| 31 | `item_cloak` | Cloak | 抗魔斗篷 | 基础 | 900 |  |
| 32 | `item_talisman_of_evasion` | Talisman of Evasion | 闪避护符 | 基础 | 1300 |  |
| 33 | `item_cheese` | Cheese | 奶酪 | 消耗品 | 1000 |  |
| 34 | `item_magic_stick` | Magic Stick | 魔棒 | 基础 | 200 |  |
| 35 | `item_recipe_magic_wand` | Magic Wand Recipe | 图纸（魔杖） | 图纸 | 150 |  |
| 36 | `item_magic_wand` | Magic Wand | 魔杖 | 合成 | 460 |  |
| 37 | `item_ghost` | Ghost Scepter | 幽魂权杖 | 基础 | 1500 |  |
| 38 | `item_clarity` | Clarity | 净化药水 | 消耗品 | 60 |  |
| 39 | `item_flask` | Healing Salve | 治疗药膏 | 消耗品 | 100 |  |
| 40 | `item_dust` | Dust of Appearance | 显影之尘 | 消耗品 | 80 |  |
| 41 | `item_bottle` | Bottle | 魔瓶 | 基础 | 675 |  |
| 42 | `item_ward_observer` | Observer Ward | 侦察守卫 | 消耗品 | 0 |  |
| 43 | `item_ward_sentry` | Sentry Ward | 岗哨守卫 | 消耗品 | 50 |  |
| 44 | `item_tango` | Tango | 树之祭祀 | 消耗品 | 90 |  |
| 45 | `item_courier` | Animal Courier | 动物信使 | 消耗品 | 50 |  |
| 46 | `item_tpscroll` | Town Portal Scroll | 回城卷轴 | 消耗品 | 100 |  |
| 47 | `item_recipe_travel_boots` | Boots of Travel Recipe | 图纸（远行鞋） | 图纸 | 2000 |  |
| 48 | `item_travel_boots` | Boots of Travel | 远行鞋 | 合成 | 2500 |  |
| 50 | `item_phase_boots` | Phase Boots | 相位鞋 | 合成 | 1450 |  |
| 51 | `item_demon_edge` | Demon Edge | 恶魔刀锋 | 基础 | 2200 |  |
| 52 | `item_eagle` | Eaglesong | 鹰歌弓 | 基础 | 2800 |  |
| 53 | `item_reaver` | Reaver | 掠夺者之斧 | 基础 | 2800 |  |
| 54 | `item_relic` | Sacred Relic | 圣者遗物 | 基础 | 3400 |  |
| 55 | `item_hyperstone` | Hyperstone | 振奋宝石 | 基础 | 2000 |  |
| 56 | `item_ring_of_health` | Ring of Health | 治疗指环 | 基础 | 700 |  |
| 57 | `item_void_stone` | Void Stone | 虚无宝石 | 基础 | 700 |  |
| 58 | `item_mystic_staff` | Mystic Staff | 神秘法杖 | 基础 | 2800 |  |
| 59 | `item_energy_booster` | Energy Booster | 能量之球 | 基础 | 800 |  |
| 60 | `item_point_booster` | Point Booster | 精气之球 | 基础 | 1200 |  |
| 61 | `item_vitality_booster` | Vitality Booster | 活力之球 | 基础 | 1000 |  |
| 63 | `item_power_treads` | Power Treads | 动力鞋 | 合成 | 1400 |  |
| 64 | `item_recipe_hand_of_midas` | Hand of Midas Recipe | 图纸（迈达斯之手） | 图纸 | 1750 |  |
| 65 | `item_hand_of_midas` | Hand of Midas | 迈达斯之手 | 合成 | 2200 |  |
| 67 | `item_oblivion_staff` | Oblivion Staff | 空明杖 | 合成 | 1625 |  |
| 69 | `item_pers` | Perseverance | 坚韧球 | 合成 | 1400 |  |
| 71 | `item_poor_mans_shield` | Poor Man's Shield | 穷鬼盾 | 中立 t2 | 0 |  |
| 72 | `item_recipe_bracer` | Bracer Recipe | 图纸（护腕） | 图纸 | 210 |  |
| 73 | `item_bracer` | Bracer | 护腕 | 合成 | 505 |  |
| 74 | `item_recipe_wraith_band` | Wraith Band Recipe | 图纸（怨灵系带） | 图纸 | 210 |  |
| 75 | `item_wraith_band` | Wraith Band | 怨灵系带 | 合成 | 505 |  |
| 76 | `item_recipe_null_talisman` | Null Talisman Recipe | 图纸（空灵挂件） | 图纸 | 210 |  |
| 77 | `item_null_talisman` | Null Talisman | 空灵挂件 | 合成 | 505 |  |
| 78 | `item_recipe_mekansm` | Mekansm Recipe | 图纸（梅肯斯姆） | 图纸 | 850 |  |
| 79 | `item_mekansm` | Mekansm | 梅肯斯姆 | 合成 | 1775 |  |
| 81 | `item_vladmir` | Vladmir's Offering | 弗拉迪米尔的祭品 | 合成 | 2200 |  |
| 85 | `item_recipe_buckler` | Buckler Recipe | 图纸（玄冥盾牌） | 图纸 | 250 |  |
| 86 | `item_buckler` | Buckler | 玄冥盾牌 | 合成 | 425 |  |
| 87 | `item_recipe_ring_of_basilius` | Ring of Basilius Recipe | 图纸（王者之戒） | 图纸 | 250 |  |
| 88 | `item_ring_of_basilius` | Ring of Basilius | 王者之戒 | 合成 | 425 |  |
| 89 | `item_recipe_pipe` | Pipe of Insight Recipe | 图纸（洞察烟斗） | 图纸 | 675 |  |
| 90 | `item_pipe` | Pipe of Insight | 洞察烟斗 | 合成 | 3725 |  |
| 91 | `item_recipe_urn_of_shadows` | Urn of Shadows Recipe | 图纸（影之灵龛） | 图纸 | 320 |  |
| 92 | `item_urn_of_shadows` | Urn of Shadows | 影之灵龛 | 合成 | 825 |  |
| 93 | `item_recipe_headdress` | Headdress Recipe | 图纸（恢复头巾） | 图纸 | 250 |  |
| 94 | `item_headdress` | Headdress | 恢复头巾 | 合成 | 425 |  |
| 95 | `item_recipe_sheepstick` | Scythe of Vyse Recipe | 图纸（邪恶镰刀） | 图纸 | 700 |  |
| 96 | `item_sheepstick` | Scythe of Vyse | 邪恶镰刀 | 合成 | 5200 |  |
| 97 | `item_recipe_orchid` | Orchid Malevolence Recipe | 图纸（紫怨） | 图纸 | 300 |  |
| 98 | `item_orchid` | Orchid Malevolence | 紫怨 | 合成 | 3275 |  |
| 99 | `item_recipe_cyclone` | Eul's Scepter Recipe | 图纸（Eul的神圣法杖） | 图纸 | 675 |  |
| 100 | `item_cyclone` | Eul's Scepter of Divinity | Eul的神圣法杖 | 合成 | 2600 |  |
| 101 | `item_recipe_force_staff` | Force Staff Recipe | 图纸（原力法杖） | 图纸 | 950 |  |
| 102 | `item_force_staff` | Force Staff | 原力法杖 | 合成 | 2200 |  |
| 103 | `item_recipe_dagon` | Dagon Recipe | 图纸（达贡之神力） | 图纸 | 1150 |  |
| 104 | `item_dagon` | Dagon | 达贡之神力 | 合成 | 3050 |  |
| 105 | `item_recipe_necronomicon` | Necronomicon Recipe | 图纸（死灵书） | 图纸 | 1250 |  |
| 106 | `item_necronomicon` | Necronomicon | 死灵书 | 合成 | 2050 |  |
| 108 | `item_ultimate_scepter` | Aghanim's Scepter | 阿哈利姆神杖 | 合成 | 4200 |  |
| 109 | `item_recipe_refresher` | Refresher Orb Recipe | 图纸（刷新球） | 图纸 | 1600 |  |
| 110 | `item_refresher` | Refresher Orb | 刷新球 | 合成 | 5000 |  |
| 111 | `item_recipe_assault` | Assault Cuirass Recipe | 图纸（强袭胸甲） | 图纸 | 1300 |  |
| 112 | `item_assault` | Assault Cuirass | 强袭胸甲 | 合成 | 5125 |  |
| 113 | `item_recipe_heart` | Heart of Tarrasque Recipe | 图纸（恐鳌之心） | 图纸 | 600 |  |
| 114 | `item_heart` | Heart of Tarrasque | 恐鳌之心 | 合成 | 5100 |  |
| 115 | `item_recipe_black_king_bar` | Black King Bar Recipe | 图纸（黑皇杖） | 图纸 | 1450 |  |
| 116 | `item_black_king_bar` | Black King Bar | 黑皇杖 | 合成 | 4050 |  |
| 117 | `item_aegis` | Aegis of the Immortal | 不朽之守护 | 基础 | 0 |  |
| 118 | `item_recipe_shivas_guard` | Shiva's Guard Recipe | 图纸（希瓦的守护） | 图纸 | 1350 |  |
| 119 | `item_shivas_guard` | Shiva's Guard | 希瓦的守护 | 合成 | 4500 |  |
| 121 | `item_bloodstone` | Bloodstone | 血精石 | 合成 | 4700 |  |
| 122 | `item_recipe_sphere` | Linken's Sphere Recipe | 图纸（林肯法球） | 图纸 | 600 |  |
| 123 | `item_sphere` | Linken's Sphere | 林肯法球 | 合成 | 4800 |  |
| 125 | `item_vanguard` | Vanguard | 先锋盾 | 合成 | 1700 |  |
| 126 | `item_recipe_blade_mail` | Blade Mail Recipe | 图纸（刃甲） | 图纸 | 450 |  |
| 127 | `item_blade_mail` | Blade Mail | 刃甲 | 合成 | 2400 |  |
| 129 | `item_soul_booster` | Soul Booster | 振魂石 | 合成 | 3000 |  |
| 131 | `item_hood_of_defiance` | Hood of Defiance | 挑战头巾 | 基础 | 0 |  |
| 133 | `item_rapier` | Divine Rapier | 圣剑 | 合成 | 5600 |  |
| 134 | `item_recipe_monkey_king_bar` | Monkey King Bar Recipe | 图纸（金箍棒） | 图纸 | 900 |  |
| 135 | `item_monkey_king_bar` | Monkey King Bar | 金箍棒 | 合成 | 5000 |  |
| 137 | `item_radiance` | Radiance | 辉耀 | 合成 | 4700 |  |
| 139 | `item_butterfly` | Butterfly | 蝴蝶 | 合成 | 5450 |  |
| 140 | `item_recipe_greater_crit` | Daedalus Recipe | 图纸（代达罗斯之殇） | 图纸 | 900 |  |
| 141 | `item_greater_crit` | Daedalus | 代达罗斯之殇 | 合成 | 5100 |  |
| 142 | `item_recipe_basher` | Skull Basher Recipe | 图纸（碎颅锤） | 图纸 | 825 |  |
| 143 | `item_basher` | Skull Basher | 碎颅锤 | 合成 | 2875 |  |
| 144 | `item_recipe_bfury` | Battle Fury Recipe | 图纸（狂战斧） | 图纸 | 400 |  |
| 145 | `item_bfury` | Battle Fury | 狂战斧 | 合成 | 3900 |  |
| 146 | `item_recipe_manta` | Manta Style Recipe | 图纸（幻影斧） | 图纸 | 1550 |  |
| 147 | `item_manta` | Manta Style | 幻影斧 | 合成 | 4650 |  |
| 148 | `item_recipe_lesser_crit` | Crystalys Recipe | 图纸（水晶剑） | 图纸 | 200 |  |
| 149 | `item_lesser_crit` | Crystalys | 水晶剑 | 合成 | 2000 |  |
| 150 | `item_recipe_armlet` | Armlet of Mordiggian Recipe | 图纸（莫尔迪基安的臂章） | 图纸 | 625 |  |
| 151 | `item_armlet` | Armlet of Mordiggian | 莫尔迪基安的臂章 | 合成 | 2500 |  |
| 152 | `item_invis_sword` | Shadow Blade | 影刃 | 合成 | 3250 |  |
| 154 | `item_sange_and_yasha` | Sange and Yasha | 散夜对剑 | 合成 | 4200 |  |
| 156 | `item_satanic` | Satanic | 撒旦之邪力 | 合成 | 5050 |  |
| 157 | `item_recipe_mjollnir` | Mjollnir Recipe | 图纸（雷神之锤） | 图纸 | 550 |  |
| 158 | `item_mjollnir` | Mjollnir | 雷神之锤 | 合成 | 5500 |  |
| 160 | `item_skadi` | Eye of Skadi | 斯嘉蒂之眼 | 合成 | 5900 |  |
| 161 | `item_recipe_sange` | Sange Recipe | 图纸（散华） | 图纸 | 650 |  |
| 162 | `item_sange` | Sange | 散华 | 合成 | 2100 |  |
| 163 | `item_recipe_helm_of_the_dominator` | Helm of the Dominator Recipe | 图纸（支配头盔） | 图纸 | 1125 |  |
| 164 | `item_helm_of_the_dominator` | Helm of the Dominator | 支配头盔 | 合成 | 2550 |  |
| 166 | `item_maelstrom` | Maelstrom | 漩涡 | 合成 | 2950 |  |
| 168 | `item_desolator` | Desolator | 黯灭 | 合成 | 3500 |  |
| 169 | `item_recipe_yasha` | Yasha Recipe | 图纸（夜叉） | 图纸 | 650 |  |
| 170 | `item_yasha` | Yasha | 夜叉 | 合成 | 2100 |  |
| 172 | `item_mask_of_madness` | Mask of Madness | 疯狂面具 | 合成 | 1900 |  |
| 173 | `item_recipe_diffusal_blade` | Diffusal Blade Recipe | 图纸（净魂之刃） | 图纸 | 1050 |  |
| 174 | `item_diffusal_blade` | Diffusal Blade | 净魂之刃 | 合成 | 2500 |  |
| 175 | `item_recipe_ethereal_blade` | Ethereal Blade Recipe | 图纸（虚灵之刃） | 图纸 | 900 |  |
| 176 | `item_ethereal_blade` | Ethereal Blade | 虚灵之刃 | 合成 | 5200 |  |
| 177 | `item_recipe_soul_ring` | Soul Ring Recipe | 图纸（灵魂之戒） | 图纸 | 350 |  |
| 178 | `item_soul_ring` | Soul Ring | 灵魂之戒 | 合成 | 805 |  |
| 179 | `item_recipe_arcane_boots` | Arcane Boots Recipe | 图纸（奥术鞋） | 图纸 | 325 |  |
| 180 | `item_arcane_boots` | Arcane Boots | 奥术鞋 | 合成 | 1500 |  |
| 181 | `item_orb_of_venom` | Orb of Venom | 淬毒之珠 | 基础 | 350 |  |
| 182 | `item_stout_shield` | Stout Shield | 圆盾 | 基础 | 100 |  |
| 184 | `item_recipe_ancient_janggo` | Drum of Endurance Recipe | 图纸（韧鼓） | 图纸 | 525 |  |
| 185 | `item_ancient_janggo` | Drum of Endurance | 韧鼓 | 合成 | 1625 |  |
| 187 | `item_medallion_of_courage` | Medallion of Courage | 勇气勋章 | 中立 t2 | 0 |  |
| 188 | `item_smoke_of_deceit` | Smoke of Deceit | 诡计之雾 | 消耗品 | 50 |  |
| 189 | `item_recipe_veil_of_discord` | Veil of Discord Recipe | 图纸（纷争面纱） | 图纸 | 350 |  |
| 190 | `item_veil_of_discord` | Veil of Discord | 纷争面纱 | 合成 | 1700 |  |
| 193 | `item_necronomicon_2` | Necronomicon | 死灵书 | 合成 | 3300 | 2 级变体 |
| 194 | `item_necronomicon_3` | Necronomicon | 死灵书 | 合成 | 4550 | 3 级变体 |
| 196 | `item_diffusal_blade_2` | Diffusal Blade | *（无）* | 合成 | 3850 | 官网无中文名、官网已移除 |
| 201 | `item_dagon_2` | Dagon | 达贡之神力 | 合成 | 4200 | 2 级变体 |
| 202 | `item_dagon_3` | Dagon | 达贡之神力 | 合成 | 5350 | 3 级变体 |
| 203 | `item_dagon_4` | Dagon | 达贡之神力 | 合成 | 6500 | 4 级变体 |
| 204 | `item_dagon_5` | Dagon | 达贡之神力 | 合成 | 7650 | 5 级变体 |
| 205 | `item_recipe_rod_of_atos` | Rod of Atos Recipe | 图纸（阿托斯之棍） | 图纸 | 250 |  |
| 206 | `item_rod_of_atos` | Rod of Atos | 阿托斯之棍 | 合成 | 2250 |  |
| 207 | `item_recipe_abyssal_blade` | Abyssal Blade Recipe | 图纸（深渊之刃） | 图纸 | 1275 |  |
| 208 | `item_abyssal_blade` | Abyssal Blade | 深渊之刃 | 合成 | 6250 |  |
| 209 | `item_recipe_heavens_halberd` | Heaven's Halberd Recipe | 图纸（天堂之戟） | 图纸 | 450 |  |
| 210 | `item_heavens_halberd` | Heaven's Halberd | 天堂之戟 | 合成 | 3400 |  |
| 212 | `item_ring_of_aquila` | Ring of Aquila | 天鹰之戒 | 基础 |  | 价格未知 |
| 214 | `item_tranquil_boots` | Tranquil Boots | 静谧之鞋 | 合成 | 900 |  |
| 215 | `item_shadow_amulet` | Shadow Amulet | 暗影护符 | 基础 | 900 |  |
| 216 | `item_enchanted_mango` | Enchanted Mango | 魔法芒果 | 消耗品 | 65 |  |
| 218 | `item_ward_dispenser` | Observer and Sentry Wards | 侦察·岗哨守卫 | 消耗品 | 50 |  |
| 220 | `item_travel_boots_2` | Boots of Travel 2 | 远行鞋 | 合成 | 4500 | 2 级变体 |
| 221 | `item_recipe_lotus_orb` | Lotus Orb Recipe | 图纸（清莲宝珠） | 图纸 | 250 |  |
| 222 | `item_recipe_meteor_hammer` | Meteor Hammer Recipe | 图纸（陨星锤） | 图纸 | 300 |  |
| 223 | `item_meteor_hammer` | Meteor Hammer | 陨星锤 | 合成 | 2850 |  |
| 225 | `item_nullifier` | Nullifier | 否决坠饰 | 合成 | 4350 |  |
| 226 | `item_lotus_orb` | Lotus Orb | 清莲宝珠 | 合成 | 3850 |  |
| 227 | `item_recipe_solar_crest` | Solar Crest Recipe | 图纸（炎阳纹章） | 图纸 | 500 |  |
| 228 | `item_recipe_octarine_core` | Octarine Core Recipe | 图纸（玲珑心） | 图纸 | 200 |  |
| 229 | `item_solar_crest` | Solar Crest | 炎阳纹章 | 合成 | 2575 |  |
| 230 | `item_recipe_guardian_greaves` | Guardian Greaves Recipe | 图纸（卫士胫甲） | 图纸 | 1175 |  |
| 231 | `item_guardian_greaves` | Guardian Greaves | 卫士胫甲 | 合成 | 4450 |  |
| 232 | `item_aether_lens` | Aether Lens | 以太透镜 | 合成 | 2275 |  |
| 233 | `item_recipe_aether_lens` | Aether Lens Recipe | 图纸（以太透镜） | 图纸 | 775 |  |
| 234 | `item_recipe_dragon_lance` | Dragon Lance Recipe | 图纸（魔龙枪） | 图纸 | 450 |  |
| 235 | `item_octarine_core` | Octarine Core | 玲珑心 | 合成 | 4900 |  |
| 236 | `item_dragon_lance` | Dragon Lance | 魔龙枪 | 合成 | 1900 |  |
| 237 | `item_faerie_fire` | Faerie Fire | 仙灵之火 | 消耗品 | 65 |  |
| 238 | `item_recipe_iron_talon` | Iron Talon Recipe | 图纸（寒铁钢爪） | 图纸 | 125 |  |
| 239 | `item_iron_talon` | Iron Talon | 寒铁钢爪 | 合成 | 0 |  |
| 240 | `item_blight_stone` | Orb of Blight | 枯萎之珠 | 基础 | 300 |  |
| 241 | `item_tango_single` | Tango (Shared) | 树之祭祀（共享） | 消耗品 | 30 |  |
| 242 | `item_crimson_guard` | Crimson Guard | 赤红甲 | 合成 | 3725 |  |
| 243 | `item_recipe_crimson_guard` | Crimson Guard Recipe | 图纸（赤红甲） | 图纸 | 1050 |  |
| 244 | `item_wind_lace` | Wind Lace | 风灵之纹 | 基础 | 225 |  |
| 245 | `item_recipe_bloodthorn` | Bloodthorn Recipe | 图纸（血棘） | 图纸 | 600 |  |
| 247 | `item_moon_shard` | Moon Shard | 银月之晶 | 消耗品 | 4000 |  |
| 248 | `item_recipe_silver_edge` | Silver Edge Recipe | 图纸（白银之锋） | 图纸 | 250 |  |
| 249 | `item_silver_edge` | Silver Edge | 白银之锋 | 合成 | 5700 |  |
| 250 | `item_bloodthorn` | Bloodthorn | 血棘 | 合成 | 6400 |  |
| 252 | `item_echo_sabre` | Echo Sabre | 回音战刃 | 合成 | 2700 |  |
| 253 | `item_recipe_glimmer_cape` | Glimmer Cape Recipe | 图纸（微光披风） | 图纸 | 800 |  |
| 254 | `item_glimmer_cape` | Glimmer Cape | 微光披风 | 合成 | 2150 |  |
| 255 | `item_recipe_aeon_disk` | Aeon Disk Recipe | 图纸（永恒之盘） | 图纸 | 1200 |  |
| 256 | `item_aeon_disk` | Aeon Disk | 永恒之盘 | 合成 | 3000 |  |
| 257 | `item_tome_of_knowledge` | Tome of Knowledge | 知识之书 | 消耗品 | 75 |  |
| 258 | `item_recipe_kaya` | Kaya Recipe | 图纸（慧光） | 图纸 | 650 |  |
| 259 | `item_kaya` | Kaya | 慧光 | 合成 | 2100 |  |
| 260 | `item_refresher_shard` | Refresher Shard | 刷新球碎片 | 消耗品 | 1000 |  |
| 261 | `item_crown` | Crown | 王冠 | 基础 | 450 |  |
| 262 | `item_recipe_hurricane_pike` | Hurricane Pike Recipe | 图纸（飓风长戟） | 图纸 | 350 |  |
| 263 | `item_hurricane_pike` | Hurricane Pike | 飓风长戟 | 合成 | 4450 |  |
| 265 | `item_infused_raindrop` | Infused Raindrops | 凝魂之露 | 基础 | 225 |  |
| 266 | `item_recipe_spirit_vessel` | Spirit Vessel Recipe | 图纸（魂之灵瓮） | 图纸 | 900 |  |
| 267 | `item_spirit_vessel` | Spirit Vessel | 魂之灵瓮 | 合成 | 2725 |  |
| 268 | `item_recipe_holy_locket` | Holy Locket Recipe | 图纸（圣洁吊坠） | 图纸 | 1340 |  |
| 269 | `item_holy_locket` | Holy Locket | 圣洁吊坠 | 合成 | 2250 |  |
| 270 | `item_recipe_ultimate_scepter_2` | Aghanim's Blessing Recipe | 阿哈利姆福佑 | 图纸 | 1600 |  |
| 271 | `item_ultimate_scepter_2` | Aghanim's Blessing | 阿哈利姆福佑 | 合成 | 5800 |  |
| 273 | `item_kaya_and_sange` | Kaya and Sange | 散慧对剑 | 合成 | 4200 |  |
| 275 | `item_recipe_trident` | Trident Recipe | 图纸（三元重戟） | 图纸 | 1 |  |
| 277 | `item_yasha_and_kaya` | Yasha and Kaya | 慧夜对剑 | 合成 | 4200 |  |
| 279 | `item_ring_of_tarrasque` | Ring of Tarrasque | 恐鳌之戒 | 基础 | 1700 |  |
| 286 | `item_flying_courier` | Flying Courier | 飞行信使 | 消耗品 | 100 |  |
| 287 | `item_keen_optic` | Keen Optic | 基恩镜片 | 基础 | 0 |  |
| 288 | `item_grove_bow` | Grove Bow | 林野长弓 | 基础 | 0 |  |
| 289 | `item_quickening_charm` | Quickening Charm | 加速护符 | 基础 | 0 |  |
| 290 | `item_philosophers_stone` | Philosopher's Stone | 贤者石 | 基础 | 0 |  |
| 291 | `item_force_boots` | Force Boots | 原力鞋 | 基础 | 0 |  |
| 292 | `item_desolator_2` | Stygian Desolator | 寂灭 | 中立 t5 | 0 |  |
| 293 | `item_phoenix_ash` | Phoenix Ash | 凤凰余烬 | 基础 | 0 |  |
| 294 | `item_seer_stone` | Seer Stone | 先哲之石 | 基础 | 0 |  |
| 295 | `item_greater_mango` |  | *（无）* | 基础 | 0 | 官网无中文名 |
| 297 | `item_vampire_fangs` | Vampire Fangs | 吸血鬼獠牙 | 基础 | 0 |  |
| 298 | `item_craggy_coat` | Craggy Coat | 崎岖外衣 | 基础 | 0 |  |
| 299 | `item_greater_faerie_fire` | Greater Faerie Fire | 高级仙灵之火 | 消耗品 | 0 |  |
| 300 | `item_timeless_relic` | Timeless Relic | 永恒遗物 | 基础 | 0 |  |
| 301 | `item_mirror_shield` | Mirror Shield | 神镜盾 | 基础 | 0 |  |
| 302 | `item_elixer` | Elixir | 万灵药水 | 基础 | 0 |  |
| 304 | `item_ironwood_tree` | Ironwood Tree | 铁树之木 | 基础 | 0 |  |
| 305 | `item_royal_jelly` | Royal Jelly | 蜂王浆 | 消耗品 | 0 |  |
| 306 | `item_pupils_gift` | Pupil's Gift | 学徒之礼 | 基础 | 0 |  |
| 307 | `item_tome_of_aghanim` | Tome of Aghanim | 阿哈利姆之书 | 基础 | 0 |  |
| 308 | `item_repair_kit` | Repair Kit | 维修器具 | 消耗品 | 0 |  |
| 309 | `item_mind_breaker` | Mind Breaker | 智灭 | 基础 | 0 |  |
| 310 | `item_third_eye` | Third Eye | 第三只眼 | 基础 | 0 |  |
| 311 | `item_spell_prism` | Spell Prism | 法术棱镜 | 基础 | 0 |  |
| 312 | `item_horizon` |  | *（无）* | 基础 | 0 | 官网无中文名 |
| 313 | `item_fusion_rune` | Fusion Rune | 聚合神符 | 基础 | 0 |  |
| 325 | `item_princes_knife` | Prince's Knife | 亲王短刀 | 基础 | 0 |  |
| 326 | `item_spider_legs` | Spider Legs | 网虫腿 | 中立 t5 | 0 |  |
| 327 | `item_helm_of_the_undying` | Helm of the Undying | 不朽尸王的头盔 | 基础 | 0 |  |
| 328 | `item_mango_tree` | Mango Tree | 芒果树 | 消耗品 |  | 价格未知 |
| 330 | `item_witless_shako` | Witless Shako | 无知小帽 | 基础 | 0 |  |
| 331 | `item_vambrace` | Vambrace | 臂甲 | 基础 | 0 |  |
| 334 | `item_imp_claw` | Imp Claw | 魔童之爪 | 基础 | 0 |  |
| 335 | `item_flicker` | Flicker | 闪灵 | 基础 | 0 |  |
| 336 | `item_spy_gadget` | Telescope | 望远镜 | 基础 | 0 |  |
| 349 | `item_arcane_ring` | Arcane Ring | 奥术指环 | 基础 | 0 |  |
| 354 | `item_ocean_heart` | Ocean Heart | 海洋之心 | 基础 | 0 |  |
| 355 | `item_broom_handle` | Broom Handle | 扫帚柄 | 基础 | 0 |  |
| 356 | `item_trusty_shovel` | Trusty Shovel | 可靠铁铲 | 基础 | 0 |  |
| 357 | `item_nether_shawl` | Nether Shawl | 幽冥披巾 | 基础 | 0 |  |
| 358 | `item_dragon_scale` | Dragon Scale | 炎龙之鳞 | 基础 | 0 |  |
| 359 | `item_essence_ring` | Essence Ring | 精华指环 | 中立 t2 | 0 |  |
| 360 | `item_clumsy_net` | Clumsy Net | 笨拙渔网 | 基础 | 0 |  |
| 361 | `item_enchanted_quiver` | Enchanted Quiver | 魔力箭袋 | 基础 | 0 |  |
| 362 | `item_ninja_gear` | Ninja Gear | 忍者用具 | 基础 | 0 |  |
| 363 | `item_illusionsts_cape` | Illusionist's Cape | 幻术师披风 | 基础 | 0 |  |
| 364 | `item_havoc_hammer` | Havoc Hammer | 浩劫巨锤 | 基础 | 0 |  |
| 365 | `item_panic_button` | Magic Lamp | 神妙明灯 | 基础 | 0 |  |
| 366 | `item_apex` | Apex | 极 | 基础 | 0 |  |
| 367 | `item_ballista` | Ballista | 弩炮 | 基础 | 0 |  |
| 368 | `item_woodland_striders` | Woodland Striders | 林地神行靴 | 基础 | 0 |  |
| 369 | `item_trident` | Trident | 三元重戟 | 合成 | 6301 |  |
| 370 | `item_demonicon` | Book of the Dead | 冥灵书 | 中立 t5 | 0 |  |
| 371 | `item_fallen_sky` | Fallen Sky | 天崩 | 中立 t5 | 0 |  |
| 372 | `item_pirate_hat` | Pirate Hat | 海盗帽 | 基础 | 0 |  |
| 374 | `item_ex_machina` | Ex Machina | 机械之心 | 基础 | 0 |  |
| 375 | `item_faded_broach` | Faded Broach | 暗淡胸针 | 基础 | 0 |  |
| 376 | `item_paladin_sword` | Paladin Sword | 骑士剑 | 基础 | 0 |  |
| 377 | `item_minotaur_horn` | Minotaur Horn | 恶牛角 | 中立 t5 | 0 |  |
| 378 | `item_orb_of_destruction` | Orb of Destruction | 毁灭灵球 | 基础 | 0 |  |
| 379 | `item_the_leveller` | The Leveller | 平世剑 | 基础 | 0 |  |
| 381 | `item_titan_sliver` | Titan Sliver | 巨神残铁 | 基础 | 0 |  |
| 473 | `item_voodoo_mask` | Voodoo Mask | 巫毒面具 | 基础 | 650 |  |
| 485 | `item_blitz_knuckles` | Blitz Knuckles | 闪电指套 | 基础 | 1000 |  |
| 533 | `item_recipe_witch_blade` | Witch Blade Recipe | 图纸（巫师之刃） | 图纸 | 300 |  |
| 534 | `item_witch_blade` | Witch Blade | 巫师之刃 | 合成 | 2775 |  |
| 565 | `item_chipped_vest` | Chipped Vest | 碎裂背心 | 中立 t1 | 0 |  |
| 569 | `item_orb_of_corrosion` | Orb of Corrosion | 腐蚀之珠 | 合成 | 1050 |  |
| 571 | `item_trickster_cloak` | Trickster Cloak | 欺诈师斗篷 | 基础 | 0 |  |
| 573 | `item_elven_tunic` | Elven Tunic | 精灵外衣 | 基础 | 0 |  |
| 574 | `item_cloak_of_flames` | Cloak of Flames | 火焰斗篷 | 中立 t3 | 0 |  |
| 577 | `item_possessed_mask` | Possessed Mask | 附魂面具 | 中立 t1 | 0 |  |
| 585 | `item_stormcrafter` | Stormcrafter | 风暴宝器 | 中立 t3 | 0 |  |
| 589 | `item_mysterious_hat` | Fairy's Trinket | 仙灵饰品 | 基础 | 0 |  |
| 593 | `item_fluffy_hat` | Fluffy Hat | 毛毛帽 | 基础 | 250 |  |
| 596 | `item_falcon_blade` | Falcon Blade | 猎鹰战刃 | 合成 | 1125 |  |
| 598 | `item_mage_slayer` | Mage Slayer | 法师克星 | 合成 | 3100 |  |
| 599 | `item_recipe_falcon_blade` | Falcon Blade Recipe | 图纸（猎鹰战刃） | 图纸 | 250 |  |
| 600 | `item_overwhelming_blink` | Overwhelming Blink | 盛势闪光 | 合成 | 6800 |  |
| 603 | `item_swift_blink` | Swift Blink | 迅疾闪光 | 合成 | 6800 |  |
| 604 | `item_arcane_blink` | Arcane Blink | 秘奥闪光 | 合成 | 6800 |  |
| 606 | `item_recipe_arcane_blink` | Arcane Blink Recipe | 图纸（秘奥闪光） | 图纸 | 1750 |  |
| 607 | `item_recipe_swift_blink` | Swift Blink Recipe | 图纸（迅疾闪光） | 图纸 | 1750 |  |
| 608 | `item_recipe_overwhelming_blink` | Overwhelming Blink Recipe | 图纸（盛势闪光） | 图纸 | 1750 |  |
| 609 | `item_aghanims_shard` | Aghanim's Shard | 阿哈利姆魔晶 | 基础 | 1400 |  |
| 610 | `item_wind_waker` | Wind Waker | 风之杖 | 合成 | 6800 |  |
| 612 | `item_recipe_wind_waker` | Wind Waker Recipe | 图纸（风之杖） | 图纸 | 1400 |  |
| 633 | `item_recipe_helm_of_the_overlord` | Helm of the Overlord Recipe | 图纸（统御头盔） | 图纸 | 300 |  |
| 635 | `item_helm_of_the_overlord` | Helm of the Overlord | 统御头盔 | 合成 | 5650 |  |
| 638 | `item_penta_edged_sword` | Penta-Edged Sword | 五锋长剑 | 基础 | 0 |  |
| 675 | `item_psychic_headband` | Psychic Headband | 通灵头带 | 中立 t3 | 0 |  |
| 676 | `item_ceremonial_robe` | Ceremonial Robe | 祭礼长袍 | 基础 | 0 |  |
| 677 | `item_book_of_shadows` | Book of Shadows | 暗影邪典 | 基础 | 0 |  |
| 678 | `item_giants_ring` | Giant's Ring | 巨人之戒 | 基础 | 0 |  |
| 680 | `item_bullwhip` | Bullwhip | 凌厉长鞭 | 基础 | 0 |  |
| 686 | `item_quicksilver_amulet` | Quicksilver Amulet | 银闪护符 | 基础 | 0 |  |
| 691 | `item_recipe_eternal_shroud` | Eternal Shroud Recipe | 图纸（永世法衣） | 图纸 | 900 |  |
| 692 | `item_eternal_shroud` | Eternal Shroud | 永世法衣 | 合成 | 3900 |  |
| 725 | `item_aghanims_shard_roshan` | Aghanim's Shard - Consumable | 阿哈利姆魔晶 - 消耗品 | 基础 | 1400 |  |
| 727 | `item_ultimate_scepter_roshan` | Aghanim's Blessing - Roshan | 阿哈利姆福佑 - 肉山 | 基础 | 5800 |  |
| 825 | `item_ascetic_cap` | Ascetic's Cap | 简朴短帽 | 基础 | 0 |  |
| 828 | `item_misericorde` | Brigand's Blade | 飞贼之刃 | 基础 | 0 |  |
| 829 | `item_force_field` | Arcanist's Armor | 秘术师铠甲 | 基础 | 0 |  |
| 834 | `item_black_powder_bag` | Blast Rig | 雷火弹 | 基础 | 0 |  |
| 835 | `item_paintball` | Fae Grenade | 仙灵榴弹 | 基础 | 0 |  |
| 837 | `item_heavy_blade` | Witchbane | 行巫之祸 | 中立 t5 | 0 |  |
| 838 | `item_unstable_wand` | Pig Pole | 豚杆 | 基础 | 0 |  |
| 840 | `item_pogo_stick` | Tumbler's Toy | 杂技玩具 | 中立 t2 | 0 |  |
| 849 | `item_mechanical_arm` |  | *（无）* | 基础 | 0 | 官网无中文名 |
| 907 | `item_recipe_wraith_pact` | Wraith Pact Recipe | 图纸（怨灵之契） | 图纸 | 400 | 中文推导、英文推导 |
| 908 | `item_wraith_pact` | Wraith Pact | 怨灵之契 | 合成 | 3800 |  |
| 910 | `item_recipe_revenants_brooch` | Revenant's Brooch Recipe | 图纸（英灵胸针） | 图纸 | 650 |  |
| 911 | `item_revenants_brooch` | Revenant's Brooch | 英灵胸针 | 合成 | 3300 |  |
| 931 | `item_boots_of_bearing` | Boots of Bearing | 宽容之靴 | 合成 | 4225 |  |
| 939 | `item_harpoon` | Harpoon | 鱼叉 | 合成 | 4700 |  |
| 945 | `item_seeds_of_serenity` | Seeds of Serenity | 宁静种籽 | 中立 t2 | 0 |  |
| 946 | `item_lance_of_pursuit` | Lance of Pursuit | 追击之矛 | 基础 | 0 |  |
| 947 | `item_occult_bracelet` | Occult Bracelet | 玄奥手镯 | 中立 t1 | 0 |  |
| 949 | `item_ogre_seal_totem` | Ogre Seal Totem | 食人魔海豹图腾 | 基础 | 0 |  |
| 950 | `item_defiant_shell` | Defiant Shell | 不羁甲壳 | 中立 t2 | 0 |  |
| 990 | `item_eye_of_the_vizier` | Eye of the Vizier | 维齐尔之眼 | 基础 | 0 |  |
| 1000 | `item_bottomless_chalice` |  | *（无）* | 基础 | 0 | 官网无中文名 |
| 1021 | `item_river_painter` | River Vial: Chrome | 河水药瓶：液铬 | 基础 | 0 |  |
| 1022 | `item_river_painter2` | River Vial: Dry | 河水药瓶：干涸 | 基础 | 0 |  |
| 1023 | `item_river_painter3` | River Vial: Slime | 河水药瓶：烂泥 | 基础 | 0 |  |
| 1024 | `item_river_painter4` | River Vial: Oil | 河水药瓶：油污 | 基础 | 0 |  |
| 1025 | `item_river_painter5` | River Vial: Electrified | 河水药瓶：导电 | 基础 | 0 |  |
| 1026 | `item_river_painter6` | River Vial: Potion | 河水药瓶：魔水 | 基础 | 0 |  |
| 1027 | `item_river_painter7` | River Vial: Blood | 河水药瓶：血红 | 基础 | 0 |  |
| 1028 | `item_mutation_tombstone` | Tombstone | 墓碑 | 消耗品 | 0 |  |
| 1029 | `item_super_blink` |  | *（无）* | 基础 |  | 官网无中文名、价格未知 |
| 1030 | `item_pocket_tower` | Pocket Tower | 袖珍高塔 | 基础 |  | 价格未知 |
| 1032 | `item_pocket_roshan` | Pocket Roshan | 袖珍肉山 | 基础 | 1000 |  |
| 1076 | `item_specialists_array` | Specialist's Array | 行家阵列 | 合成 | 2550 |  |
| 1077 | `item_dagger_of_ristul` | Dagger of Ristul | 瑞斯图尔尖匕 | 中立 t1 | 0 |  |
| 1090 | `item_muertas_gun` | Mercy & Grace | 仁慈与恩泽 | 基础 | 0 |  |
| 1096 | `item_recipe_disperser` | Disperser Recipe | 图纸（散魂剑） | 图纸 | 800 |  |
| 1097 | `item_disperser` | Disperser | 散魂剑 | 合成 | 6100 |  |
| 1101 | `item_recipe_harpoon` | Harpoon Recipe | 图纸（鱼叉） | 图纸 | 1000 |  |
| 1106 | `item_recipe_phylactery` | Phylactery Recipe | 图纸（灵匣） | 图纸 | 200 |  |
| 1107 | `item_phylactery` | Phylactery | 灵匣 | 合成 | 2600 |  |
| 1122 | `item_diadem` | Diadem | 宝冕 | 基础 | 1000 |  |
| 1123 | `item_blood_grenade` | Blood Grenade | 血腥榴弹 | 消耗品 | 50 |  |
| 1124 | `item_spark_of_courage` | Spark of Courage | 勇气之光 | 基础 | 0 |  |
| 1125 | `item_cornucopia` | Cornucopia | 丰饶之环 | 基础 | 1200 |  |
| 1127 | `item_recipe_pavise` | Pavise Recipe | 图纸（长盾） | 图纸 | 675 |  |
| 1128 | `item_pavise` | Pavise | 长盾 | 合成 | 1350 |  |
| 1154 | `item_royale_with_cheese` | Block of Cheese | 奶酪块 | 消耗品 | 2 |  |
| 1156 | `item_ancient_guardian` | Ancient Guardian | 遗迹守护者 | 基础 | 0 |  |
| 1157 | `item_safety_bubble` | Safety Bubble | 安全泡泡 | 基础 | 0 |  |
| 1158 | `item_whisper_of_the_dread` | Whisper of the Dread | 邪道私语 | 基础 | 0 |  |
| 1159 | `item_nemesis_curse` | Nemesis Curse | 天诛之咒 | 基础 | 0 |  |
| 1160 | `item_avianas_feather` | Aviana's Feather | 艾维娜之羽 | 基础 | 0 |  |
| 1161 | `item_unwavering_condition` | Unwavering Condition | 坚毅之件 | 基础 | 0 |  |
| 1167 | `item_light_collector` | Light Collector | 集光器 | 基础 | 0 |  |
| 1168 | `item_rattlecage` | Rattlecage | 回响之笼 | 中立 t4 | 0 |  |
| 1440 | `item_black_grimoire` | Black Grimoire (Warlock) | Black Grimoire (Warlock) | 基础 | 0 | 官方中文未翻译 |
| 1441 | `item_grisgris` | Gris-Gris | 驱邪护符 | 基础 | 0 |  |
| 1466 | `item_gungir` | Gleipnir | 缚灵索 | 合成 | 4650 |  |
| 1565 | `item_recipe_gungir` | Gleipnir Recipe | 图纸（缚灵索） | 图纸 | 400 |  |
| 1575 | `item_orb_of_frost` | Orb of Frost | 冰霜之珠 | 基础 | 300 |  |
| 1576 | `item_enhancement_vast` | Vast | 高远 | 基础 | 0 |  |
| 1577 | `item_enhancement_quickened` | Quickened | 迅速 | 基础 | 0 |  |
| 1581 | `item_enhancement_audacious` | Audacious | 冒险 | 基础 | 0 |  |
| 1583 | `item_enhancement_mystical` | Mystical | 神秘 | 基础 | 0 |  |
| 1584 | `item_enhancement_alert` | Alert | 警觉 | 基础 | 0 |  |
| 1585 | `item_enhancement_brawny` | Brawny | 壮实 | 基础 | 0 |  |
| 1586 | `item_enhancement_tough` | Tough | 坚强 | 基础 | 0 |  |
| 1587 | `item_enhancement_feverish` | Feverish | 狂热 | 基础 | 0 |  |
| 1588 | `item_enhancement_fleetfooted` | Fleetfooted | 捷足 | 基础 | 0 |  |
| 1589 | `item_enhancement_crude` | Crude | 粗暴 | 基础 | 0 |  |
| 1590 | `item_enhancement_boundless` | Boundless | 无边 | 基础 | 0 |  |
| 1591 | `item_enhancement_wise` | Wise | 睿智 | 基础 | 0 |  |
| 1592 | `item_enhancement_timeless` | Timeless | 永恒 | 基础 | 0 |  |
| 1593 | `item_enhancement_greedy` | Greedy | 贪婪 | 基础 | 0 |  |
| 1594 | `item_enhancement_vampiric` | Vampiric | 吸血鬼 | 基础 | 0 |  |
| 1595 | `item_enhancement_keen_eyed` | Keen-eyed | 犀利 | 基础 | 0 |  |
| 1596 | `item_enhancement_evolved` | Evolved | 进化 | 基础 | 0 |  |
| 1597 | `item_enhancement_titanic` | Titanic | 巨神 | 基础 | 0 |  |
| 1598 | `item_unrelenting_eye` | Unrelenting Eye | 不屈之眼 | 中立 t3 | 0 |  |
| 1599 | `item_mana_draught` | Mana Draught | 魔力药水 | 中立 t2 | 0 |  |
| 1600 | `item_rippers_lash` | Ripper's Lash | 撕裂之鞭 | 基础 | 0 |  |
| 1601 | `item_crippling_crossbow` | Crippling Crossbow | 致残之弩 | 中立 t2 | 0 |  |
| 1602 | `item_gale_guard` | Gale Guard | 烈风护体 | 基础 | 0 |  |
| 1603 | `item_gunpowder_gauntlets` | Gunpowder Gauntlet | 火药手套 | 中立 t3 | 0 |  |
| 1604 | `item_searing_signet` | Searing Signet | 炽热纹章 | 中立 t2 | 0 |  |
| 1605 | `item_serrated_shiv` | Serrated Shiv | 锯齿短刀 | 中立 t3 | 0 |  |
| 1606 | `item_polliwog_charm` | Pollywog Charm | 蝌蚪护符 | 中立 t1 | 0 |  |
| 1607 | `item_magnifying_monocle` | Magnifying Monocle | 放大单片镜 | 基础 | 0 |  |
| 1608 | `item_pyrrhic_cloak` | Pyrrhic Cloak | 皮洛士斗篷 | 基础 | 0 |  |
| 1609 | `item_madstone_bundle` | Madstone Bundle | 狂石包 | 消耗品 | 0 |  |
| 1610 | `item_miniboss_minion_summoner` |  | *（无）* | 基础 |  | 官网无中文名、价格未知 |
| 1637 | `item_kobold_cup` | Kobold Cup | 狗头人酒杯 | 中立 t1 | 0 |  |
| 1638 | `item_dormant_curio` | Dormant Curio | 休眠珍品 | 中立 t1 | 0 |  |
| 1639 | `item_sisters_shroud` | Sister's Shroud | 魅影之衣 | 基础 | 0 |  |
| 1640 | `item_jidi_pollen_bag` | Jidi Pollen Bag | 基迪花粉袋 | 中立 t3 | 0 |  |
| 1641 | `item_outworld_staff` | Outworld Staff | 殁境法杖 | 基础 | 0 |  |
| 1642 | `item_dezun_bloodrite` | Dezun Bloodrite | 德尊血式 | 中立 t5 | 0 |  |
| 1643 | `item_giant_maul` | Giant's Maul | 巨人之槌 | 中立 t4 | 0 |  |
| 1644 | `item_divine_regalia` | Divine Regalia | 天赐华冠 | 中立 t5 | 0 |  |
| 1645 | `item_divine_regalia_broken` | Disgraced Regalia | 失节华冠 | 基础 | 0 |  |
| 1647 | `item_enhancement_fierce` | Fierce | 凶猛 | 基础 | 0 |  |
| 1648 | `item_enhancement_dominant` | Dominant | 专横 | 基础 | 0 |  |
| 1649 | `item_enhancement_restorative` | Restorative | 滋补 | 基础 | 0 |  |
| 1650 | `item_enhancement_thick` | Thick | 厚重 | 基础 | 0 |  |
| 1651 | `item_enhancement_curious` | Unleashed | 觉醒 | 基础 | 0 |  |
| 1652 | `item_furion_gold_bag` | Bag of Gold | 金袋 | 基础 | 0 |  |
| 1715 | `item_recipe_specialists_array` | Specialist's Array Recipe | 图纸（行家阵列） | 图纸 | 550 | 中文推导、英文推导 |
| 1716 | `item_weighted_dice` | Weighted Dice | 加重骰子 | 中立 t1 | 0 |  |
| 1717 | `item_ash_legion_shield` | Ash Legion Shield | 余烬军团战盾 | 中立 t1 | 0 |  |
| 1718 | `item_riftshadow_prism` | Riftshadow Prism | 影墟棱晶 | 中立 t5 | 0 |  |
| 1719 | `item_metamorphic_mandible` | Metamorphic Mandible | 变态上颚 | 中立 t4 | 0 |  |
| 1720 | `item_idol_of_screeauk` | Idol of Scree'auk | 丝奎奥克神像 | 中立 t4 | 0 |  |
| 1721 | `item_flayers_bota` | Flayer's Bota | 剥皮血囊 | 中立 t4 | 0 |  |
| 1801 | `item_caster_rapier` |  | *（无）* | 基础 | 5600 | 官网无中文名 |
| 1802 | `item_tiara_of_selemene` | Tiara of Selemene | 赛莉蒙妮之冠 | 基础 | 1700 |  |
| 1803 | `item_doubloon` | Doubloon | 双面币 | 基础 | 0 |  |
| 1804 | `item_roshans_banner` | Roshan's Banner | 肉山的战旗 | 消耗品 | 0 |  |
| 1805 | `item_recipe_devastator` | Parasma Recipe | 图纸（圣斧） | 图纸 | 400 |  |
| 1806 | `item_devastator` | Parasma | 圣斧 | 合成 | 5975 |  |
| 1808 | `item_angels_demise` | Khanda | 绝刃 | 合成 | 5600 |  |
| 1847 | `item_splintmail` | Splintmail | 片甲 | 基础 | 950 |  |
| 1848 | `item_shawl` | Shawl | 披巾 | 基础 | 450 |  |
| 1849 | `item_wizard_hat` | Wizard Hat | 巫师帽 | 基础 | 250 |  |
| 1850 | `item_eldwurms_edda` | Eldwurm's Edda | 古龙诗集 | 基础 | 0 |  |
| 1851 | `item_recipe_essence_distiller` | Essence Distiller Recipe | 图纸（精之灵器） | 图纸 | 200 |  |
| 1852 | `item_essence_distiller` | Essence Distiller | 精之灵器 | 合成 | 1775 |  |
| 1853 | `item_recipe_consecrated_wraps` | Consecrated Wraps Recipe | 图纸（圣化护服） | 图纸 | 700 |  |
| 1854 | `item_consecrated_wraps` | Consecrated Wraps | 圣化护服 | 合成 | 2600 |  |
| 1855 | `item_recipe_crellas_crozier` | Crella's Crozier Recipe | 图纸（克莱拉牧杖） | 图纸 | 300 |  |
| 1856 | `item_crellas_crozier` | Crella's Crozier | 克莱拉牧杖 | 合成 | 4800 |  |
| 1857 | `item_recipe_hydras_breath` | Hydra's Breath Recipe | 图纸（怪蛇之息） | 图纸 | 1100 | 中文推导、英文推导 |
| 1858 | `item_hydras_breath` | Hydra's Breath | 怪蛇之息 | 合成 | 5900 |  |
| 1859 | `item_spellslinger` | Spellslinger | 咏咒之坠 | 中立 t3 | 0 |  |
| 1860 | `item_prophets_pendulum` | Prophet's Pendulum | 先知灵摆 | 中立 t4 | 0 |  |
| 1861 | `item_stonefeather_satchel` | Stonefeather Satchel | 石羽小包 | 中立 t1 | 0 |  |
| 1862 | `item_enchanters_bauble` | Enchanter's Bauble | 附魔师之椟 | 中立 t4 | 0 |  |
| 1863 | `item_harmonizer` | Harmonizer | 协和 | 中立 t5 | 0 |  |
| 1864 | `item_conjurers_catalyst` | Conjurer's Catalyst | 咒术师触媒 | 中立 t4 | 0 |  |
| 1865 | `item_enhancement_vital` | Vital | 活力 | 基础 | 0 |  |
| 1866 | `item_enhancement_hulking` | Hulking | 笨重 | 基础 | 0 |  |
| 1867 | `item_enhancement_manic` | Manic | 癫狂 | 基础 | 0 |  |
| 1868 | `item_foragers_kit` | Forager's Kit | 采菌套具 | 中立 t1 | 0 |  |
| 1869 | `item_foragers_health` | Vital Toadstool | 活力伞菌 | 基础 | 0 |  |
| 1870 | `item_foragers_stats` | Ironwood Nut | 铁树坚果 | 基础 | 0 |  |
| 1871 | `item_foragers_mana` | Tomo'kan Ringcap | 托莫干伞盖 | 基础 | 0 |  |
| 1872 | `item_chasm_stone` | Chasm Stone | 裂隙之石 | 基础 | 800 |  |
| 1873 | `item_partisans_brand` | Partisan's Brand | 天游烙印 | 中立 t3 | 0 |  |
| 1874 | `item_enhancement_nimble` | Nimble | 轻快 | 基础 | 0 |  |
| 1875 | `item_tidehunter_fish` | Leviathan's Fish | 利维坦的鱼 | 基础 | 0 |  |
| 2091 | `item_tier1_token` | Tier 1 Token | 第1级代币 | 基础 |  | 价格未知 |
| 2092 | `item_tier2_token` | Tier 2 Token | 第2级代币 | 基础 |  | 价格未知 |
| 2093 | `item_tier3_token` | Tier 3 Token | 第3级代币 | 基础 |  | 价格未知 |
| 2094 | `item_tier4_token` | Tier 4 Token | 第4级代币 | 基础 |  | 价格未知 |
| 2095 | `item_tier5_token` | Tier 5 Token | 第5级代币 | 基础 |  | 价格未知 |
| 2096 | `item_vindicators_axe` | Vindicator's Axe | 正义之斧 | 基础 | 0 |  |
| 2097 | `item_duelist_gloves` | Duelist Gloves | 决斗家手套 | 中立 t1 | 0 |  |
| 2190 | `item_dandelion_amulet` | Dandelion Amulet | 蒲公英护符 | 中立 t4 | 0 |  |
| 2192 | `item_martyrs_plate` | Martyr's Plate | 烈士鳞甲 | 基础 | 0 |  |
| 2193 | `item_gossamer_cape` | Gossamer Cape | 蛛丝斗篷 | 基础 | 0 |  |
| 4204 | `item_famango` | Healing Lotus | 疗伤莲花 | 消耗品 | 0 |  |
| 4205 | `item_great_famango` | Great Healing Lotus | 大疗伤莲花 | 消耗品 | 0 |  |
| 4206 | `item_greater_famango` | Greater Healing Lotus | 巨大疗伤莲花 | 消耗品 | 0 |  |
| 4300 | `item_ofrenda` | Beloved Memory | 挚爱回忆 | 基础 | 0 |  |
| 4301 | `item_ofrenda_shovel` | Scrying Shovel | 占卜之铲 | 基础 | 0 |  |
| 4302 | `item_ofrenda_pledge` | Forebearer's Fortune | 先祖的财富 | 基础 | 0 |  |
| 1807 | `item_recipe_angels_demise` | Khanda Recipe | 图纸（绝刃） | 图纸 |  | OpenDota 未收录、价格未知 |
| 120 | `item_recipe_bloodstone` | Bloodstone Recipe | 图纸（血精石） | 图纸 |  | OpenDota 未收录、价格未知 |
| 930 | `item_recipe_boots_of_bearing` | Boots of Bearing Recipe | 图纸（宽容之靴） | 图纸 |  | OpenDota 未收录、价格未知 |
| 138 | `item_recipe_butterfly` | Butterfly Recipe | 图纸（蝴蝶） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 197 | `item_recipe_dagon_2` | Dagon Recipe | 图纸（达贡之神力） | 图纸 |  | 中文推导、英文推导、2 级变体、OpenDota 未收录、价格未知 |
| 198 | `item_recipe_dagon_3` | Dagon Recipe | 图纸（达贡之神力） | 图纸 |  | 中文推导、英文推导、3 级变体、OpenDota 未收录、价格未知 |
| 199 | `item_recipe_dagon_4` | Dagon Recipe | 图纸（达贡之神力） | 图纸 |  | 中文推导、英文推导、4 级变体、OpenDota 未收录、价格未知 |
| 200 | `item_recipe_dagon_5` | Dagon Recipe | 图纸（达贡之神力） | 图纸 |  | 中文推导、英文推导、5 级变体、OpenDota 未收录、价格未知 |
| 167 | `item_recipe_desolator` | Desolator Recipe | 图纸（黯灭） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 251 | `item_recipe_echo_sabre` | Echo Sabre Recipe | 图纸（回音战刃） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 317 | `item_recipe_fallen_sky` | Recipe: Fallen Sky | 图纸（天崩） | 图纸 |  | OpenDota 未收录、价格未知 |
| 4207 | `item_recipe_great_famango` | Great Healing Lotus Recipe | 图纸（大疗伤莲花） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 4208 | `item_recipe_greater_famango` | Greater Healing Lotus Recipe | 图纸（巨大疗伤莲花） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 130 | `item_recipe_hood_of_defiance` | Hood of Defiance Recipe | 图纸（挑战头巾） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 183 | `item_recipe_invis_sword` | Shadow Blade Recipe | 图纸（影刃） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 272 | `item_recipe_kaya_and_sange` | Kaya and Sange Recipe | 图纸（散慧对剑） | 图纸 |  | OpenDota 未收录、价格未知 |
| 165 | `item_recipe_maelstrom` | Maelstrom Recipe | 图纸（漩涡） | 图纸 |  | OpenDota 未收录、价格未知 |
| 597 | `item_recipe_mage_slayer` | Mage Slayer Recipe | 图纸（法师克星） | 图纸 |  | 已修正官方笔误、OpenDota 未收录、价格未知 |
| 171 | `item_recipe_mask_of_madness` | Mask of Madness Recipe | 图纸（疯狂面具） | 图纸 |  | OpenDota 未收录、价格未知 |
| 186 | `item_recipe_medallion_of_courage` | Medallion of Courage Recipe | 图纸（勇气勋章） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 246 | `item_recipe_moon_shard` | Moon Shard Recipe | 图纸（银月之晶） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 191 | `item_recipe_necronomicon_2` | Necronomicon Recipe | 图纸（死灵书） | 图纸 |  | 中文推导、英文推导、2 级变体、OpenDota 未收录、价格未知 |
| 192 | `item_recipe_necronomicon_3` | Necronomicon Recipe | 图纸（死灵书） | 图纸 |  | 中文推导、英文推导、3 级变体、OpenDota 未收录、价格未知 |
| 224 | `item_recipe_nullifier` | Nullifier Recipe | 图纸（否决坠饰） | 图纸 |  | OpenDota 未收录、价格未知 |
| 66 | `item_recipe_oblivion_staff` | Oblivion Staff Recipe | 图纸（空明杖） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 640 | `item_recipe_orb_of_corrosion` | Orb of Corrosion Recipe | 图纸（腐蚀之珠） | 图纸 |  | OpenDota 未收录、价格未知 |
| 68 | `item_recipe_pers` | Perseverance Recipe | 图纸（坚韧球） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 49 | `item_recipe_phase_boots` | Phase Boots Recipe | 图纸（相位鞋） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 70 | `item_recipe_poor_mans_shield` | Poor Man's Shield Recipe | 图纸（穷鬼盾） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 62 | `item_recipe_power_treads` | Power Treads Recipe | 图纸（动力鞋） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 136 | `item_recipe_radiance` | Radiance Recipe | 图纸（辉耀） | 图纸 |  | OpenDota 未收录、价格未知 |
| 132 | `item_recipe_rapier` | Divine Rapier Recipe | 图纸（圣剑） | 图纸 |  | OpenDota 未收录、价格未知 |
| 211 | `item_recipe_ring_of_aquila` | Ring of Aquila Recipe | 图纸（天鹰之戒） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 153 | `item_recipe_sange_and_yasha` | Sange and Yasha Recipe | 图纸（散夜对剑） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 155 | `item_recipe_satanic` | Satanic Recipe | 图纸（撒旦之邪力） | 图纸 |  | OpenDota 未收录、价格未知 |
| 159 | `item_recipe_skadi` | Eye of Skadi Recipe | 图纸（斯嘉蒂之眼） | 图纸 |  | OpenDota 未收录、价格未知 |
| 128 | `item_recipe_soul_booster` | Soul Booster Recipe | 图纸（振魂石） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 213 | `item_recipe_tranquil_boots` | Tranquil Boots Recipe | 图纸（静谧之鞋） | 图纸 |  | OpenDota 未收录、价格未知 |
| 219 | `item_recipe_travel_boots_2` | Boots of Travel 2 Recipe | 图纸（远行鞋） | 图纸 |  | 中文推导、英文推导、2 级变体、OpenDota 未收录、价格未知 |
| 107 | `item_recipe_ultimate_scepter` | Aghanim's Scepter Recipe | 图纸（阿哈利姆神杖） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 124 | `item_recipe_vanguard` | Vanguard Recipe | 图纸（先锋盾） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 80 | `item_recipe_vladmir` | Vladmir's Offering Recipe | 图纸（弗拉迪米尔的祭品） | 图纸 |  | OpenDota 未收录、价格未知 |
| 217 | `item_recipe_ward_dispenser` | Observer and Sentry Wards Recipe | 图纸（侦察·岗哨守卫） | 图纸 |  | 中文推导、英文推导、OpenDota 未收录、价格未知 |
| 274 | `item_recipe_yasha_and_kaya` | Yasha and Kaya Recipe | 图纸（慧夜对剑） | 图纸 |  | OpenDota 未收录、价格未知 |

共 545 件装备。
