# Dota 2 天赋树对照表（层级 / 解锁等级 / 英文 / 中文）

数据源：中文=dota2.com datafeed（`herodata?language=schinese` 的 `talents[].name_loc`）；
英文=同一接口 `language=english`；层级=OpenDota `hero_abilities.json` 的 `talents[].level`；
数值=技能 `special_values[].bonuses[]` 里指向该天赋的 `value`（已替换 `{s:...}` 占位符）。

规则：每个英雄 8 条天赋，分 4 层、每层 2 条。第 1 层在 10 级解锁、第 2 层 15 级、第 3 层 20 级、
第 4 层 25 级，先选其中一条；27/28/29/30 级按同样顺序再解锁一次，可以补选另一条。
天赋和技能、属性附加共用同一个技能点。

`属性附加`（Attribute Bonus，`special_bonus_attributes`，ID 730）= +2 全属性/级，最多 7 级，
祈求者没有这个选项；英文维基写 6 级起可点、中文维基写任意等级，两版不一致，以客户端为准。

由 `tools/names/build.py` 生成；机器可读版见 `data/names/talents.json`。

层级带 `*` 的表示 OpenDota 常量还没更新（天赋被改名/重做），层级按被替换的旧天赋推断。

| 内部名 | 英文 | 中文 | 效果 | 等级上限 | 说明 |
|---|---|---|---|---:|---|
| `special_bonus_attributes` | Attribute Bonus | 属性附加 | +2 全属性 | 7 | 全英雄通用，祈求者除外 |

## 敌法师 Anti-Mage（id 1）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +3 Health Regen | +3 生命恢复 | `special_bonus_hp_regen_3` |
| 1 | 10/27 | +200 Mana Void Radius | +200 法力虚空范围 | `special_bonus_unique_antimage_manavoid_aoe` |
| 2 | 15/28 | +9%/18% Persecutor Min/Max Movement Slow | +9%/18% 绝人之路最低/最高减速 | `special_bonus_unique_antimage_5` |
| 2 | 15/28 | +0.2 Mana Void Damage Multiplier | +0.2 法力虚空伤害系数 | `special_bonus_unique_antimage_6` |
| 3 | 20/29 | +125 Blink Cast Range | +125 闪烁施法距离 | `special_bonus_unique_antimage_3` |
| 3 | 20/29 | +0.8s Mana Void Stun | +0.8秒 法力虚空眩晕 | `special_bonus_unique_antimage_8` |
| 4 | 25/30 | -1s Blink Cooldown | -1秒 闪烁冷却 | `special_bonus_unique_antimage` |
| 4 | 25/30 | -50s Mana Void Cooldown | -50秒 法力虚空冷却 | `special_bonus_unique_antimage_2` |

## 斧王 Axe（id 2）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +3s Culling Blade Kill Buff Bonus Duration | +3秒 淘汰之刃斩杀后效果 | `special_bonus_unique_axe_culling_blade_speed_duration` |
| 1 | 10/27 | +8% Movement Speed per active Battle Hunger | 每个战斗饥渴+8% 移速 | `special_bonus_unique_axe_8` |
| 2 | 15/28 | +8 Battle Hunger Damage Per Second | +8 战斗饥渴每秒伤害 | `special_bonus_unique_axe` |
| 2 | 15/28 | +10 Berserker's Call Armor | +10 狂战士之吼护甲 | `special_bonus_unique_axe_7` |
| 3 | 20/29 | +15 Strength | +15 力量 | `special_bonus_strength_15` |
| 3 | 20/29 | +40 Counter Helix Damage | +40 反击螺旋伤害 | `special_bonus_unique_axe_4` |
| 4 | 25/30 | +85 Berserker's Call AoE | +85 狂战士之吼范围 | `special_bonus_unique_axe_2` |
| 4 | 25/30 | +150 Culling Blade Damage | +150 淘汰之刃伤害 | `special_bonus_unique_axe_5` |

## 祸乱之源 Bane（id 3）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +125 Brain Sap Cast Range | +125 蚀脑施法距离 | `special_bonus_unique_bane_8` |
| 1 | 10/27 | +20% Enfeeble Cast Range Reduction | +20% 虚弱降低施法距离 | `special_bonus_unique_bane_11` |
| 2 | 15/28 | +13 Enfeeble Damage Per Second | +13 虚弱每秒伤害 | `special_bonus_unique_bane_10` |
| 2 | 15/28 | +5% Fiend's Grip Max Mana Drain | +5% 魔爪吸取最大魔法值 | `special_bonus_unique_bane_9` |
| 3 | 20/29 | -3s Nightmare Cooldown | -3秒 噩梦冷却 | `special_bonus_unique_bane_5` |
| 3 | 20/29 | +30 Movement Speed | +30 移动速度 | `special_bonus_movement_speed_30` |
| 4 | 25/30 | +275 Brain Sap Damage/Heal | +275 蚀脑伤害/治疗 | `special_bonus_unique_bane_2` |
| 4 | 25/30 | +3s Fiend's Grip Duration | +3秒 魔爪持续时间 | `special_bonus_unique_bane_3` |

## 血魔 Bloodseeker（id 4）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 1 | 10/27 | +30 Bloodrage Attack Speed | +30 血怒攻击速度 | `special_bonus_unique_bloodseeker_5` |
| 2 | 15/28 | -0.7% Bloodrage Max Health DPS | -0.7% 血怒每秒最大生命值伤害 | `special_bonus_unique_bloodseeker` |
| 2 | 15/28 | +100 Blood Rite Damage | +100 血祭伤害 | `special_bonus_unique_bloodseeker_2` |
| 3 | 20/29 | +400 Rupture Cast Range | +400 割裂施法距离 | `special_bonus_unique_bloodseeker_3` |
| 3 | 20/29 | +15 Agility | +15 敏捷 | `special_bonus_agility_15` |
| 4 | 25/30 | +3s Blood Rite Silence Duration | +3秒 血祭沉默 | `special_bonus_unique_bloodseeker_7` |
| 4 | 25/30 | +15% Max Thirst Move Speed | +15% 焦渴最大移速 | `special_bonus_unique_bloodseeker_4` |

## 水晶室女 Crystal Maiden（id 5）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 1 | 10/27 | +12 Intelligence | +12 智力 | `special_bonus_intelligence_12` |
| 2 | 15/28 | +100 Frostbite Cast Range | +100 冰封禁制施法距离 | `special_bonus_unique_crystal_maiden_frostbite_castrange` |
| 2 | 15/28 | -4.5s Crystal Nova Cooldown | -4.5秒 冰霜新星冷却 | `special_bonus_unique_crystal_maiden_5` |
| 3 | 20/29 | +20% Glacial Guard Mana Spent To Barrier | +20% 冰川护体魔法转为护盾 | `special_bonus_unique_crystal_maiden_glacial_guard_mana_multiplier` |
| 3 | 20/29 | +50 Freezing Field Damage | +50 极寒领域伤害 | `special_bonus_unique_crystal_maiden_3` |
| 4 | 25/30 | +1s Frostbite Duration | +1秒 冰封禁制持续时间 | `special_bonus_unique_crystal_maiden_1` |
| 4 | 25/30 | +300 Crystal Nova Damage | +300 冰霜新星伤害 | `special_bonus_unique_crystal_maiden_2` |

## 卓尔游侠 Drow Ranger（id 6）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -18% Frost Arrows Mana Cost | -18% 霜冻之箭魔法消耗 | `special_bonus_unique_drow_ranger_7` |
| 1 | 10/27 | +1 Multishot Arrow Per Wave | +1 数箭齐发每波箭矢 | `special_bonus_unique_drow_ranger_2` |
| 2 | 15/28 | +75 Attack Range | +75 攻击距离 | `special_bonus_attack_range_75` |
| 2 | 15/28 | -6s Multishot Cooldown | -6秒 数箭齐发冷却 | `special_bonus_unique_drow_ranger_6` |
| 3 | 20/29 | 50% Gust Self Movement Speed | 50% 狂风自身移速加成 | `special_bonus_unique_drow_ranger_gust_selfmovespeed` |
| 3 | 20/29 | +25% Multishot Damage | +25% 数箭齐发伤害 | `special_bonus_unique_drow_ranger_1` |
| 4 | 25/30 | +8% Marksmanship Chance | +8% 射手天赋几率 | `special_bonus_unique_drow_ranger_3` |
| 4 | 25/30 | +2 Multishot Waves | +2 数箭齐发波数 | `special_bonus_unique_drow_ranger_8` |

## 撼地者 Earthshaker（id 7）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25 Base Damage | +25 基础攻击力 | `special_bonus_attack_base_damage_25` |
| 1 | 10/27 | +75 Fissure Damage | +75 沟壑伤害 | `special_bonus_unique_earthshaker_4` |
| 2 | 15/28 | +200 Fissure Range | +200 沟壑距离 | `special_bonus_unique_earthshaker_3` |
| 2 | 15/28 | +50 Aftershock Damage | +50 余震伤害 | `special_bonus_unique_earthshaker_6` |
| 3 | 20/29 | +50 Echo Damage | +50 回音击回音伤害 | `special_bonus_unique_earthshaker_2` |
| 3 | 20/29 | +65% Enchant Totem Damage | +65% 强化图腾攻击力 | `special_bonus_unique_earthshaker_totem_damage` |
| 4 | 25/30 | -50% Echo Slam Cooldown | -50% 回音击冷却 | `special_bonus_unique_earthshaker_echo_cd` |
| 4 | 25/30 | -1.5s Enchant Totem Cooldown | -1.5秒 强化图腾冷却 | `special_bonus_unique_earthshaker` |

## 主宰 Juggernaut（id 8）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -12s Healing Ward Cooldown | -12秒 治疗守卫冷却 | `special_bonus_unique_juggernaut_5` |
| 1 | 10/27 | -1s Bladeform Stack Gain Interval | -1秒 剑心效果获得间隔 | `special_bonus_unique_juggernaut_3` |
| 2 | 15/28 | -15s Omnislash Cooldown | -15秒 无敌斩冷却 | `special_bonus_unique_juggernaut_omnislash_cooldown` |
| 2 | 15/28 | 45 Movement Speed During Blade Fury | 剑刃风暴期间+45 移动速度 | `special_bonus_unique_juggernaut_blade_fury_movespeed` |
| 3 | 20/29 | +15% Blade Dance Crit Damage | +15% 剑舞致命一击伤害 | `special_bonus_unique_juggernaut_4` |
| 3 | 20/29 | +120 Blade Fury Damage Per Second | +120 剑刃风暴每秒伤害 | `special_bonus_unique_juggernaut` |
| 4 | 25/30 | +1s Omnislash Duration | +1秒 无敌斩持续时间 | `special_bonus_unique_juggernaut_omnislash_duration` |
| 4 | 25/30 | +40% Blade Dance Lifesteal | +40% 剑舞吸血 | `special_bonus_unique_juggernaut_blade_dance_lifesteal` |

## 米拉娜 Mirana（id 9）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -2s Starstorm Cooldown | -2秒 群星风暴冷却 | `special_bonus_unique_mirana_3` |
| 1 | 10/27 | +150 Leap Distance | +150 跳跃距离 | `special_bonus_unique_mirana_6` |
| 2 | 15/28 | Moonlight Shadow gives +20% Evasion | 月之暗面提供+20% 闪避 | `special_bonus_unique_mirana_5` |
| 2 | 15/28 | +100 Leap Attack Speed | +100 跳跃攻击速度 | `special_bonus_unique_mirana_1` |
| 3 | 20/29 | +200 Starstorm Damage | +200 群星风暴伤害 | `special_bonus_unique_mirana_7` |
| 3 | 20/29 | +50 Celestial Quiver Damage | +50 天界箭袋伤害 | `special_bonus_unique_mirana_quiver_damage` |
| 4 | 25/30 | +2 Multishot Sacred Arrows | +2 月神之箭齐发 | `special_bonus_unique_mirana_2` |
| 4 | 25/30 | -30s Moonlight Shadow Cooldown | -30秒 月之暗面冷却 | `special_bonus_unique_mirana_4` |

## 变体精灵 Morphling（id 10）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15% Magic Resistance | +15% 魔法抗性 | `special_bonus_magic_resistance_15` |
| 1 | 10/27 | +12s Morph Duration | +12秒 变形持续时间 | `special_bonus_unique_morphling_8` |
| 2 | 15/28 | +250 Waveform Range | +250 波浪形态距离 | `special_bonus_unique_morphling_1` |
| 2 | 15/28 | +75 Attack Range | +75 攻击距离 | `special_bonus_attack_range_75` |
| 3 | 20/29 | -3s Adaptive Strike Cooldown | -3秒 变体打击冷却 | `special_bonus_unique_morphling_7` |
| 3 | 20/29 | +15 Agility | +15 敏捷 | `special_bonus_agility_15` |
| 4 | 25/30 | -40% Waveform Cooldown | -40% 波浪形态冷却 | `special_bonus_unique_morphling_waveform_cooldown` |
| 4 | 25/30 | +35 Strength | +35 力量 | `special_bonus_strength_35` |

## 影魔 Shadow Fiend（id 11）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +30 Shadowraze Stack Damage | +30 毁灭阴影连中伤害 | `special_bonus_unique_nevermore_7` |
| 1 | 10/27 | +30 Feast of Souls Attack Speed | +30 灵魂盛宴攻击速度 | `special_bonus_unique_nevermore_4` |
| 2 | 15/28 | +1.5 Presence Armor Reduction | +1.5 魔王降临降低护甲 | `special_bonus_unique_nevermore_3` |
| 2 | 15/28 | +2 Feast of Souls Souls Collected Per Hero | +2 灵魂盛宴每名英雄收集灵魂 | `special_bonus_unique_nevermore_frenzy_max_collection_count` |
| 3 | 20/29 | +5 Necromastery Max Souls | +5 支配死灵灵魂上限 | `special_bonus_unique_nevermore_1` |
| 3 | 20/29 | +0.2s Requiem Fear per line | +0.2秒 魂之挽歌每道恐惧 | `special_bonus_unique_nevermore_6` |
| 4 | 25/30 | Feast of Souls Grants +30% Cast Speed | 灵魂盛宴+30% 施法速度 | `special_bonus_unique_nevermore_frenzy_castspeed` |
| 4 | 25/30 | Shadowraze Applies Attack Damage | 毁灭阴影施加攻击伤害 | `special_bonus_unique_nevermore_raze_procsattacks` |

## 幻影长矛手 Phantom Lancer（id 12）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Spirit Lance Slow Duration | +1秒 灵魂之矛减速 | `special_bonus_unique_phantom_lancer_lance_slow_duration` |
| 1 | 10/27 | +3% Juxtapose Illusion Trigger Chance | +3% 并列幻象触发几率 | `special_bonus_unique_phantom_lancer_juxtapose_illusio_proc_chance` |
| 2 | 15/28 | 50% Illusion Spirit Lance Damage | 50% 幻象灵魂之矛伤害 | `special_bonus_unique_phantom_lancer_illusion_lances` |
| 2 | 15/28 | +125 Doppelganger Cast Range | +125 神行百变施法距离 | `special_bonus_unique_phantom_lancer_doppelwalk_cast_range` |
| 3 | 20/29 | +100 Spirit Lance Damage | +100 灵魂之矛伤害 | `special_bonus_unique_phantom_lancer_lance_damage` |
| 3 | 20/29 | -70% Juxtapose Illusion Damage Taken | -70% 并列幻象承受伤害 | `special_bonus_unique_phantom_lancer_juxtapose_damage_in` |
| 4 | 25/30 | -4s Doppelganger Cooldown | -4秒 神行百变冷却 | `special_bonus_unique_phantom_lancer_4` |
| 4 | 25/30 | +2s Illusory Armaments Duration | +2秒 灵幻兵械持续时间 | `special_bonus_unique_phantom_lancer_illusory_armaments_duration` |

## 帕克 Puck（id 13）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +35 Illusory Orb Damage | +35 幻象法球伤害 | `special_bonus_unique_puck_orb_damage` |
| 1 | 10/27 | +1.25s Waning Rift Silence Duration | +1.25秒 新月之痕沉默 | `special_bonus_unique_puck_7` |
| 2 | 15/28 | +60 Waning Rift Damage | +60 新月之痕伤害 | `special_bonus_unique_puck_6` |
| 2 | 15/28 | -30s Dream Coil Cooldown | -30秒 梦境缠绕冷却 | `special_bonus_unique_puck` |
| 3 | 20/29 | -2.5s Waning Rift Cooldown | -2.5秒 新月之痕冷却 | `special_bonus_unique_puck_2` |
| 3 | 20/29 | +200 Initial/Break Dream Coil Damage | +200 梦境缠绕初始/破碎伤害 | `special_bonus_unique_puck_coil_damage` |
| 4 | 25/30 | +2% Puckish Health and Mana Restoration | +2% 顽皮克敌生命/魔法回复 | `special_bonus_unique_puck_5` |
| 4 | 25/30 | +350 Waning Rift Radius/Max Distance | +350 新月之痕范围/最大距离 | `special_bonus_unique_puck_rift_radius` |

## 帕吉 Pudge（id 14）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5 Armor | +5 护甲 | `special_bonus_armor_5` |
| 1 | 10/27 | +10% Rot Slow | +10% 腐烂减速 | `special_bonus_unique_pudge_4` |
| 2 | 15/28 | +8% Spell Lifesteal | +8% 技能吸血 | `special_bonus_spell_lifesteal_8` |
| 2 | 15/28 | +150 Meat Hook Damage | +150 肉钩伤害 | `special_bonus_unique_pudge_7` |
| 3 | 20/29 | +0.75s Dismember Duration | +0.75秒 肢解持续时间 | `special_bonus_unique_pudge_6` |
| 3 | 20/29 | -4s Meat Hook Cooldown | -4秒 肉钩冷却 | `special_bonus_unique_pudge_5` |
| 4 | 25/30 | 1.5x Dismember Damage/Heal | 1.5倍 肢解伤害/治疗 | `special_bonus_unique_pudge_3` |
| 4 | 25/30 | 1.5x Flesh Heap and Meat Shield bonuses | 1.5倍 腐肉堆积和肉盾加成 | `special_bonus_unique_pudge_1` |

## 雷泽 Razor（id 15）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.75s Plasma Field Slow Duration | +0.75秒 等离子场减速 | `special_bonus_unique_razor_4` |
| 1 | 10/27 | +4 Armor | +4 护甲 | `special_bonus_armor_4` |
| 2 | 15/28 | +6 Static Link Damage Steal | +6 静电连接攻击力吸取 | `special_bonus_unique_razor` |
| 2 | 15/28 | +12 Strength | +12 力量 | `special_bonus_strength_12` |
| 3 | 20/29 | +35% Storm Surge Slow and Damage | +35% 风暴涌动减速和伤害 | `special_bonus_unique_razor_storm_surge_damage_and_slow` |
| 3 | 20/29 | -0.1s Eye of the Storm Strike Interval | -0.1秒 风暴之眼打击间隔 | `special_bonus_unique_razor_2` |
| 4 | 25/30 | Creates A Second Plasma Field Delayed By 0.8s | 0.8秒后产生第二个等离子场 | `special_bonus_unique_razor_plasmafield_second_ring` |
| 4 | 25/30 | Static Link Steals Attack Speed | 静电连接吸取攻击速度 | `special_bonus_unique_razor_static_link_aspd` |

## 沙王 Sand King（id 16）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +12% Stinger Slow | +12% 尾刺减速 | `special_bonus_unique_sand_king_3` |
| 1 | 10/27 | +100 Caustic Finale Radius | +100 腐尸毒范围 | `special_bonus_unique_sand_king_caustic_finale_radius` |
| 2 | 15/28 | +25 Sand Storm Damage Per Second | +25 沙尘暴每秒伤害 | `special_bonus_unique_sand_king_2` |
| 2 | 15/28 | +200 Burrowstrike Cast Range | +200 掘地穿刺施法距离 | `special_bonus_unique_sand_king_8` |
| 3 | 20/29 | -3s Burrowstrike Cooldown | -3秒 掘地穿刺冷却 | `special_bonus_unique_sand_king_7` |
| 3 | 20/29 | +6 Epicenter Pulses | +6 地震波数 | `special_bonus_unique_sand_king` |
| 4 | 25/30 | +125 Stinger Damage | +125 尾刺伤害 | `special_bonus_unique_sand_king_scorpion_strike_damage` |
| 4 | 25/30 | 35% Sand Storm Slow and Blind | 35% 沙尘暴减速和致盲 | `special_bonus_unique_sand_king_4` |

## 风暴之灵 Storm Spirit（id 17）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25/25% Overload Attack/Movement Speed Slow | +25/25% 超负荷降低攻速/移速 | `special_bonus_unique_storm_spirit_overload_aspd` |
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 2 | 15/28 | +250 Health | +250 生命 | `special_bonus_hp_250` |
| 2 | 15/28 | +60 Static Remnant Damage | +60 残影伤害 | `special_bonus_unique_storm_spirit_5` |
| 3 | 20/29 | +0.2s Electric Vortex Duration | +0.2秒 电子涡流持续时间 | `special_bonus_unique_storm_spirit` |
| 3 | 20/29 | -1.25s Static Remnant Cooldown | -1.25秒 残影冷却 | `special_bonus_unique_storm_spirit_8` |
| 4 | 25/30 | 2x Overload Attack Bounce | 超负荷攻击弹射2次 | `special_bonus_unique_storm_spirit_7` |
| 4 | 25/30 | 450 Distance Auto Remnant in Ball Lightning | 球状闪电每450距离释放残影 | `special_bonus_unique_storm_spirit_4` |

## 斯温 Sven（id 18）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5s Warcry Duration | +5秒 战吼持续时间 | `special_bonus_unique_sven_5` |
| 1 | 10/27 | +20% God's Strength Slow Resistance | +20% 神之力量减速抗性 | `special_bonus_unique_sven_gods_strength_slow_resist` |
| 2 | 15/28 | -12s God's Strength Cooldown | -12秒 神之力量冷却 | `special_bonus_unique_sven_3` |
| 2 | 15/28 | +25% Great Cleave Damage | +25% 巨力挥舞伤害 | `special_bonus_unique_sven_8` |
| 3 | 20/29 | -25% Storm Hammer Cooldown and Mana Cost | -25% 风暴之拳冷却和魔耗 | `special_bonus_unique_sven_stormhammer_cooldown` |
| 3 | 20/29 | +8 Warcry Armor | +8 战吼护甲 | `special_bonus_unique_sven_7` |
| 4 | 25/30 | +50% God's Strength Damage | +50% 神之力量攻击力 | `special_bonus_unique_sven_2` |
| 4 | 25/30 | +1s Storm Hammer Stun Duration | +1秒 风暴之拳眩晕 | `special_bonus_unique_sven_4` |

## 小小 Tiny（id 19）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +150 Avalanche Cast Range | +150 山崩施法距离 | `special_bonus_unique_tiny_4` |
| 1* | 10/27 | +10 Strength | +10 力量 | `special_bonus_strength_10` |
| 2 | 15/28 | +2 Tree Grab Attacks | +2 抓树攻击次数 | `special_bonus_unique_tiny_6` |
| 2 | 15/28 | +90 Avalanche Damage | +90 山崩伤害 | `special_bonus_unique_tiny` |
| 3 | 20/29 | +60 Tree Grab Base Damage | +60 抓树基础攻击力 | `special_bonus_unique_tiny_7` |
| 3 | 20/29 | Toss Requires No Target | 投掷不需要目标 | `special_bonus_unique_tiny_5` |
| 4 | 25/30 | -8s Avalanche Cooldown | -8秒 山崩冷却 | `special_bonus_unique_tiny_3` |
| 4 | 25/30 | 2 Toss Charges | 2 投掷能量点数 | `special_bonus_unique_tiny_2` |

## 复仇之魂 Vengeful Spirit（id 20）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +150 Nether Swap Enemy Damage | +150 移形换位对敌伤害 | `special_bonus_unique_vengeful_spirit_swap_damage` |
| 1 | 10/27 | +100 Magic Missile Cast Range | +100 魔法箭施法距离 | `special_bonus_unique_vengeful_spirit_missile_castrange` |
| 2 | 15/28 | -3 Wave of Terror Armor | -3 恐怖波动降低护甲 | `special_bonus_unique_vengeful_spirit_4` |
| 2 | 15/28 | +0.3s Magic Missile Stun Duration | +0.3秒 魔法箭眩晕 | `special_bonus_unique_vengeful_spirit_1` |
| 3 | 20/29 | Wave Of Terror Steals 25% Of Reduced Damage And Armor | 恐怖波动窃取25%降低的攻击力和护甲 | `special_bonus_unique_vengeful_spirit_wave_of_terror_steal` |
| 3 | 20/29 | -2s Magic Missile Cooldown | -2秒 魔法箭冷却 | `special_bonus_unique_vengeful_spirit_5` |
| 4 | 25/30 | +16% Vengeance Aura Base Damage Bonus | +16% 复仇光环攻击力加成 | `special_bonus_unique_vengeful_spirit_2` |
| 4 | 25/30 | -18s Nether Swap Cooldown | -18秒 移形换位冷却 | `special_bonus_unique_vengeful_spirit_9` |

## 风行者 Windranger（id 21）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Powershot Slow Duration | +1秒 强力击减速 | `special_bonus_unique_windranger_powershot_slow` |
| 1 | 10/27 | +0.75s Windrun Duration | +0.75秒 风行持续时间 | `special_bonus_unique_windranger_4` |
| 2 | 15/28 | +40 Tailwind Max Movespeed | +40 一路顺风最高移速 | `special_bonus_unique_windranger_5` |
| 2 | 15/28 | -15% Powershot Reduction | -15% 强力击减少效果 | `special_bonus_unique_windranger_3` |
| 3 | 20/29 | +0.75s Shackleshot Duration | +0.75秒 束缚击眩晕 | `special_bonus_unique_windranger_6` |
| 3 | 20/29 | -10% Focus Fire Damage Reduction | -10% 集中火力降低攻击力 | `special_bonus_unique_windranger_8` |
| 4 | 25/30 | Powershot Executes Enemy Heroes Under 16% Max HP | 强力击斩杀16%血量下敌方英雄 | `special_bonus_unique_windranger_7` |
| 4 | 25/30 | Focus Fire Kills Advance Cooldown by 16s | 集中火力击杀后减16秒冷却 | `special_bonus_unique_windranger_2` |

## 宙斯 Zeus（id 22）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1 Heavenly Jump Target | +1 神圣一跳目标 | `special_bonus_unique_zeus` |
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 2 | 15/28 | +75 Thundergod's Wrath Damage | +75 雷神之怒伤害 | `special_bonus_unique_zeus_4` |
| 2 | 15/28 | -20% Arc Lightning Mana Cost / Cooldown | -20% 弧形闪电魔耗/冷却 | `special_bonus_unique_zeus_6` |
| 3 | 20/29 | +60 Arc Lightning Damage | +60 弧形闪电伤害 | `special_bonus_unique_zeus_2` |
| 3 | 20/29 | +0.5s Lightning Bolt Ministun | +0.5秒 雷击眩晕 | `special_bonus_unique_zeus_3` |
| 4 | 25/30 | 325 AoE Lightning Bolt | 325 范围型雷击 | `special_bonus_unique_zeus_5` |
| 4 | 25/30 | 3 Heavenly Jump Charges | 3 神圣一跳能量点数 | `special_bonus_unique_zeus_jump_charges` |

## 昆卡 Kunkka（id 23）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Admiral's Rum Buff Duration | +1秒 统帅朗姆酒持续时间 | `special_bonus_unique_kunkka_rum_duration` |
| 1 | 10/27 | Tidebringer applies 60% slow for 1s | 潮汐使者施加1秒60%减速 | `special_bonus_unique_kunkka_tidebringer_slow` |
| 2 | 15/28 | +25% Torrent Damage/Knock Up Duration | +25% 洪流伤害/升空时间 | `special_bonus_unique_kunkka_7` |
| 2 | 15/28 | +75 Tidebringer Damage | +75 潮汐使者攻击力 | `special_bonus_unique_kunkka_2` |
| 3 | 20/29 | -4s Torrent Cooldown | -4秒 洪流冷却 | `special_bonus_unique_kunkka_torrent_cooldown` |
| 3 | 20/29 | +80% Tidebringer Cleave Damage | +80% 潮汐使者分裂伤害 | `special_bonus_unique_kunkka_4` |
| 4 | 25/30 | +100 Spell Area of Effect | +100 技能作用范围 | `special_bonus_spell_aoe_100` |
| 4 | 25/30 | Tidebringer Ignores 25% Armor | 潮汐使者无视25%护甲 | `special_bonus_unique_kunkka_tidebringer_armor_pierce` |

## 莉娜 Lina（id 25）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25 Damage | +25 攻击力 | `special_bonus_attack_damage_25` |
| 1 | 10/27 | -3s Dragon Slave Cooldown | -3秒 龙破斩冷却 | `special_bonus_unique_lina_1` |
| 2 | 15/28 | 5% Fiery Soul Magic Resist Per Stack | 5% 炽魂每次叠加魔抗 | `special_bonus_unique_lina_4` |
| 2 | 15/28 | +110 Light Strike Array Damage | +110 光击阵伤害 | `special_bonus_unique_lina_3` |
| 3 | 20/29 | -20s Laguna Blade Cooldown | -20秒 神灭斩冷却 | `special_bonus_unique_lina_6` |
| 3 | 20/29 | +10/1% Fiery Soul Per Stack | +10/1% 炽魂每次叠加 | `special_bonus_unique_lina_2` |
| 4 | 25/30 | +1s Slow Burn Duration | +1秒 慢热持续时间 | `special_bonus_unique_lina_7` |
| 4 | 25/30 | 150% Attack Crit On Targets Affected By Slow Burn | 对慢热作用下目标+150% 暴击 | `special_bonus_unique_lina_crit_debuff` |

## 莱恩 Lion（id 26）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +10% Mana Drain Slow | +10% 法力吸取减速 | `special_bonus_unique_lion_6` |
| 1 | 10/27 | +20 Movement Speed | +20 移动速度 | `special_bonus_movement_speed_20` |
| 2 | 15/28 | -2s Hex Cooldown | -2秒 妖术冷却 | `special_bonus_unique_lion_5` |
| 2 | 15/28 | +15% To Hell And Back Debuff/Spell Amp | +15% 下地狱再上来负面状态/技能增强 | `special_bonus_unique_lion_11` |
| 3 | 20/29 | +20 Finger of Death Damage Per Kill | +20 死亡之指每次击杀伤害 | `special_bonus_unique_lion_8` |
| 3 | 20/29 | Earth Spike affects a 30 degree cone | 裂地尖刺为30º锥形范围 | `special_bonus_unique_lion_10` |
| 4 | 25/30 | +250 AoE Hex | +250 范围型妖术 | `special_bonus_unique_lion_4` |
| 4 | 25/30 | +600 Earth Spike cast range/travel distance | +600 裂地尖刺施法/行进距离 | `special_bonus_unique_lion_2` |

## 暗影萨满 Shadow Shaman（id 27）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +170 Shackles Total Damage | +170 枷锁总伤害 | `special_bonus_unique_shadow_shaman_6` |
| 1 | 10/27 | +1.75 Mana Regen | +1.75 魔法恢复 | `special_bonus_mp_regen_175` |
| 2 | 15/28 | +160 Serpent Wards Attack Range | +160 群蛇守卫攻击距离 | `special_bonus_unique_shadow_shaman_8` |
| 2 | 15/28 | Hex Breaks | 妖术施加破坏 | `special_bonus_unique_shadow_shaman_7` |
| 3 | 20/29 | +1.5s Shackles Duration | +1.5秒 枷锁持续时间 | `special_bonus_unique_shadow_shaman_2` |
| 3 | 20/29 | +50% Serpent Wards Max HP | +50% 群蛇守卫最大生命 | `special_bonus_unique_shadow_shaman_1` |
| 4 | 25/30 | +250 Ether Shock Damage | +250 苍穹震击伤害 | `special_bonus_unique_shadow_shaman_3` |
| 4 | 25/30 | +1 Ward Attack Targets | +1 守卫攻击目标 | `special_bonus_unique_shadow_shaman_4` |

## 斯拉达 Slardar（id 28）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +2s Guardian Sprint Duration | +2秒 守卫冲刺持续时间 | `special_bonus_unique_slardar_7` |
| 1 | 10/27 | +30 Bash of the Deep Damage | +30 深海重击伤害 | `special_bonus_unique_slardar_2` |
| 2 | 15/28 | +250 Health | +250 生命 | `special_bonus_hp_250` |
| 2 | 15/28 | -3 Corrosive Haze Armor | -3 侵蚀雾霭护甲 | `special_bonus_unique_slardar_5` |
| 3 | 20/29 | +125 Slithereen Crush Damage | +125 鱼人碎击伤害 | `special_bonus_unique_slardar` |
| 3 | 20/29 | +16% Seaborn Sentinel Bonus Attack Damage | +16% 汪洋前哨攻击力 | `special_bonus_unique_slardar_6` |
| 4 | 25/30 | -3s Slithereen Crush Cooldown | -3秒 鱼人碎击冷却 | `special_bonus_unique_slardar_4` |
| 4 | 25/30 | Corrosive Haze Undispellable | 侵蚀雾霭不可驱散 | `special_bonus_unique_slardar_3` |

## 潮汐猎人 Tidehunter（id 29）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +10% Anchor Smash Damage Reduction | +10% 锚击降低攻击力 | `special_bonus_unique_tidehunter_3` |
| 1 | 10/27 | +20% Gush Slow | +20% 巨浪减速 | `special_bonus_unique_tidehunter_5` |
| 2 | 15/28 | +90 Gush Damage | +90 巨浪伤害 | `special_bonus_unique_tidehunter_2` |
| 2 | 15/28 | -15s Ravage Cooldown | -15秒 毁灭冷却 | `special_bonus_unique_tidehunter_ravage_cooldown` |
| 3 | 20/29 | Kraken Shell Cleanse triggers Anchor Smash | 海妖外壳净化触发锚击 | `special_bonus_unique_tidehunter_smash_on_blubber` |
| 3 | 20/29 | -4 Gush Armor | -4 巨浪降低护甲 | `special_bonus_unique_tidehunter` |
| 4 | 25/30 | +1s Ravage Stun Duration | +1秒 毁灭眩晕 | `special_bonus_unique_tidehunter_7` |
| 4 | 25/30 | Anchor Smash affects buildings | 锚击可作用建筑 | `special_bonus_unique_tidehunter_10` |

## 巫医 Witch Doctor（id 30）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -25% Voodoo Restoration Mana Per Second | -25% 巫毒疗法每秒消耗魔法 | `special_bonus_unique_witch_doctor_4` |
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 2 | 15/28 | -3s Paralyzing Cask Cooldown | -3秒 麻痹药剂冷却 | `special_bonus_unique_witch_doctor_6` |
| 2 | 15/28 | +4s Maledict Duration | +4秒 巫蛊咒术持续时间 | `special_bonus_unique_witch_doctor_7` |
| 3 | 20/29 | Maledict bursts deal 75% damage in a 800 AoE | 巫蛊咒术爆发在800范围内造成75%伤害 | `special_bonus_unique_witch_doctor_maledict_spread` |
| 3 | 20/29 | +1% Target Max Health Voodoo Restoration Heal | 巫毒疗法+1% 目标最大生命值治疗 | `special_bonus_unique_witch_doctor_2` |
| 4 | 25/30 | +6 Paralyzing Cask Bounces | +6 麻痹药剂弹跳 | `special_bonus_unique_witch_doctor_3` |
| 4 | 25/30 | +40 Death Ward Damage | +40 死亡守卫攻击力 | `special_bonus_unique_witch_doctor_5` |

## 巫妖 Lich（id 31）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +10% Frost Shield Damage Reduction | +10% 冰霜魔盾承伤降低 | `special_bonus_unique_lich_8` |
| 1 | 10/27 | +125 Frost Blast Radius and Area Damage | +125 寒霜爆发范围/范围伤害 | `special_bonus_unique_lich_6` |
| 2 | 15/28 | +0.3s Sinister Gaze Duration | +0.3秒 阴邪凝视持续时间 | `special_bonus_unique_lich_2` |
| 2 | 15/28 | -3.5s Frost Blast Cooldown | -3.5秒 寒霜爆发冷却 | `special_bonus_unique_lich_3` |
| 3 | 20/29 | 2 Frost Shield Charges | 2 冰霜魔盾能量点数 | `special_bonus_unique_lich_4` |
| 3 | 20/29 | Chain Frost on Death | 死亡时放出连环霜冻 | `special_bonus_unique_lich_7` |
| 4 | 25/30 | Frost Shield Provides +50 HP Regen | 冰霜魔盾提供+50 生命恢复 | `special_bonus_unique_lich_1` |
| 4 | 25/30 | Chain Frost Unlimited Bounces | 连环霜冻无限弹跳 | `special_bonus_unique_lich_5` |

## 力丸 Riki（id 32）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +50 Smoke Screen Radius | +50 烟幕范围 | `special_bonus_unique_riki_7` |
| 1 | 10/27 | +10% Cloak and Dagger Movement Speed | +10% 刀光谍影移动速度 | `special_bonus_unique_riki_8` |
| 2 | 15/28 | 15% of Riki's Base damage added to Tricks of the Trade | 绝杀秘技+15% 力丸攻击伤害 | `special_bonus_unique_riki_tricks_dmg` |
| 2 | 15/28 | -3s Smoke Screen Cooldown | -3秒 烟幕冷却 | `special_bonus_unique_riki_3` |
| 3 | 20/29 | +0.3 Backstab Multiplier | +0.3 背刺敏捷系数 | `special_bonus_unique_riki_1` |
| 3 | 20/29 | -1s Blink Strike Cooldown | -1秒 闪烁突袭冷却 | `special_bonus_unique_riki_5` |
| 4 | 25/30 | -4s Tricks of the Trade Cooldown | -4秒 绝杀秘技冷却 | `special_bonus_unique_riki_6` |
| 4 | 25/30 | +500 Blink Strike Cast Range | +500 闪烁突袭施法距离 | `special_bonus_unique_riki_9` |

## 谜团 Enigma（id 33）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +10 Eidolon Attack Speed | +10 虚灵攻击速度 | `special_bonus_unique_enigma_4` |
| 1 | 10/27 | +50 Black Hole Damage Per Second | +50 黑洞每秒伤害 | `special_bonus_unique_enigma_6` |
| 2 | 15/28 | +250 Health | +250 生命 | `special_bonus_hp_250` |
| 2 | 15/28 | +100 Event Horizon Radius | +100 事件视界作用范围 | `special_bonus_unique_enigma_5` |
| 3 | 20/29 | +200 Midnight Pulse Radius | +200 午夜凋零范围 | `special_bonus_unique_enigma_9` |
| 3 | 20/29 | +30 Eidolon Damage | +30 虚灵攻击力 | `special_bonus_unique_enigma_3` |
| 4 | 25/30 | +4 Malefice Instances | +4 憎恶触发次数 | `special_bonus_unique_enigma_2` |
| 4 | 25/30 | +4 Demonic Summoning Eidolons | +4 恶魔召唤虚灵数量 | `special_bonus_unique_enigma` |

## 修补匠 Tinker（id 34）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s March of the Machines Duration | +1秒 机械行军持续时间 | `special_bonus_unique_tinker_march_duration` |
| 1 | 10/27 | +10% Manacost/Manaloss Reduction | +10% 魔法消耗/损失降低 | `special_bonus_mana_reduction_10` |
| 2 | 15/28 | +100 Deploy Turrets Tinker Knockback | +100 部署炮塔击退修补匠 | `special_bonus_unique_tinker_deploy_turrets_knockback` |
| 2 | 15/28 | +50 Laser Damage | +50 激光伤害 | `special_bonus_unique_tinker` |
| 3 | 20/29 | +60 Deploy Turrets Missile Damage | +60 部署炮塔导弹伤害 | `special_bonus_unique_tinker_deploy_turrets_missile_damage` |
| 3 | 20/29 | -{s:bonus_AbilityChannelTime}s Keen Conveyance Channel Time | -{s:bonus_AbilityChannelTime}秒 基恩载具持续施法（数值未解析） | `special_bonus_unique_tinker_5` |
| 4 | 25/30 | 250 AoE Laser | 250 范围型激光 | `special_bonus_unique_tinker_4` |
| 4 | 25/30 | -0.25s Time to Rearm | -0.25秒 再装填所需时间 | `special_bonus_unique_tinker_rearm_channel_time` |

## 狙击手 Sniper（id 35）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +50 Take Aim Passive Attack Range | +50 瞄准被动攻击距离 | `special_bonus_unique_sniper_5` |
| 1 | 10/27 | +30 Headshot Damage | +30 爆头伤害 | `special_bonus_unique_sniper_headshot_damage` |
| 2 | 15/28 | +45 Attack Speed During Take Aim | +45 瞄准期间攻击速度 | `special_bonus_unique_sniper_6` |
| 2 | 15/28 | +150 Assassinate Damage | +150 暗杀伤害 | `special_bonus_unique_sniper_1` |
| 3 | 20/29 | +2s Take Aim Duration | +2秒 瞄准持续时间 | `special_bonus_unique_sniper_4` |
| 3 | 20/29 | +30% Shrapnel Damage | +30% 榴霰弹伤害 | `special_bonus_unique_sniper_shrapnel_damage` |
| 4 | 25/30 | -30s Shrapnel Charge Restore Time | -30秒 榴霰弹充能 | `special_bonus_unique_sniper_2` |
| 4 | 25/30 | +50 Max Headshot Knockback Distance | +50 最高爆头击退距离 | `special_bonus_unique_sniper_3` |

## 瘟疫法师 Necrophos（id 36）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -2.5s Ghost Shroud Cooldown | -2.5秒 幽魂护罩冷却 | `special_bonus_unique_necrophos_6` |
| 1 | 10/27 | +2s Sadist Stack Duration | +2秒 施虐之心叠加时间 | `special_bonus_unique_necrophos_heartstopper_regen_duration` |
| 2 | 15/28 | +15% Ghost Shroud Movement Slow | +15% 幽魂护罩减速 | `special_bonus_unique_necrophos_3` |
| 2 | 15/28 | +60 Death Pulse Heal | +60 死亡脉冲治疗 | `special_bonus_unique_necrophos_4` |
| 3 | 20/29 | +75 Spell Area of Effect | +75 技能作用范围 | `special_bonus_spell_aoe_75` |
| 3 | 20/29 | +20% Heartstopper Regen Reduction | +20% 竭心光环降低生命恢复 | `special_bonus_unique_necrophos_5` |
| 4 | 25/30 | +0.3 Reaper's Scythe Damage Per Missing HP | +0.3 死神镰刀伤害系数 | `special_bonus_unique_necrophos_reaper_scythe_damage_per_health` |
| 4 | 25/30 | -2.5s Death Pulse Cooldown | -2.5秒 死亡脉冲冷却 | `special_bonus_unique_necrophos` |

## 术士 Warlock（id 37）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +4% Fatal Bonds Damage | +4% 致命连接伤害 | `special_bonus_unique_warlock_5` |
| 1 | 10/27 | +50 Upheaval Radius | +50 剧变作用范围 | `special_bonus_unique_warlock_upheaval_aoe` |
| 2 | 15/28 | +8 Upheaval Attack Speed per second on Allies | 剧变每秒向友军提供+8 攻速 | `special_bonus_unique_warlock_10` |
| 2 | 15/28 | +150 Shadow Word AoE | +150 暗言术范围 | `special_bonus_unique_warlock_7` |
| 3 | 20/29 | 25% Damage Resistance for Chaotic Offering Golems | 25% 地狱火伤害减免 | `special_bonus_unique_warlock_1` |
| 3 | 20/29 | +45 Upheaval Damage | +45 剧变伤害 | `special_bonus_unique_warlock_3` |
| 4 | 25/30 | Summons a Golem on death | 死亡时召唤地狱火 | `special_bonus_unique_warlock_4` |
| 4 | 25/30 | +5 Fatal Bonds Targets | +5 致命连接目标 | `special_bonus_unique_warlock_fatal_bonds_count` |

## 兽王 Beastmaster（id 38）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1* | 10/27 | +4 Armor | +4 护甲 | `special_bonus_armor_4` |
| 1 | 10/27 | +1.5% Wild Axes Damage Amp Per Stack | +1.5% 野性之斧每次伤害加深 | `special_bonus_unique_beastmaster_9` |
| 2 | 15/28 | +{s:bonus_ms} Movespeed to Beastmaster and his summons | 兽王及其召唤物+{s:bonus_ms} 移速（数值未解析） | `special_bonus_unique_beastmaster_5` |
| 2 | 15/28 | +200 Primal Roar Cast Range | +200 原始咆哮施法距离 | `special_bonus_unique_beastmaster_4` |
| 3 | 20/29 | +25 Damage to Beastmaster and his summons | 兽王及其召唤物+25 攻击力 | `special_bonus_unique_beastmaster_2` |
| 3 | 20/29 | +{s:bonus_hp} Health to Beastmaster and his summons | 兽王及其召唤物+{s:bonus_hp} 生命（数值未解析） | `special_bonus_unique_beastmaster_6` |
| 4 | 25/30 | No Wild Axes Cooldown | 野性之斧无冷却 | `special_bonus_unique_beastmaster_wild_axe_cooldown` |
| 4 | 25/30 | -20s Primal Roar Cooldown | -20秒 原始咆哮冷却 | `special_bonus_unique_beastmaster_7` |

## 痛苦女王 Queen of Pain（id 39）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +35 Attack Speed against Shadow Striked units | 攻击暗影突袭下单位+35 攻速 | `special_bonus_unique_queen_of_pain_1` |
| 1 | 10/27 | +7 Strength | +7 力量 | `special_bonus_strength_7` |
| 2 | 15/28 | -1s Shadow Strike Damage Interval | -1秒 暗影突袭伤害间隔 | `special_bonus_unique_queen_of_pain_4` |
| 2 | 15/28 | +30 Damage | +30 攻击力 | `special_bonus_attack_damage_30` |
| 3 | 20/29 | +115 Scream of Pain Damage | +115 痛苦尖叫伤害 | `special_bonus_unique_queen_of_pain_2` |
| 3 | 20/29 | -45s Sonic Wave Cooldown | -45秒 超声冲击波冷却 | `special_bonus_unique_queen_of_pain_3` |
| 4 | 25/30 | -2s Blink Cooldown | -2秒 闪烁冷却 | `special_bonus_unique_queen_of_pain_6` |
| 4 | 25/30 | +250 Sonic Wave Damage | +250 超声冲击波伤害 | `special_bonus_unique_queen_of_pain_7` |

## 剧毒术士 Venomancer（id 40）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -5s Venomous Gale CD | -5秒 瘴气冷却 | `special_bonus_unique_venomancer_3` |
| 1 | 10/27 | 15% Poison Sting Health Regen Reduction | 毒刺降低15% 生命恢复 | `special_bonus_unique_venomancer_poisonsting_regen_reduction` |
| 2 | 15/28 | +75 Noxious Plague Spread Radius | +75 恶性瘟疫传播范围 | `special_bonus_unique_venomancer_plague_spread` |
| 2 | 15/28 | +10% Poison Sting Slow | +10% 毒刺减速 | `special_bonus_unique_venomancer_2` |
| 3 | 20/29 | +100 Snakebite Initial Damage | +100 毒蛇撕咬初始伤害 | `special_bonus_unique_venomancer_4` |
| 3 | 20/29 | -2s Plague Ward Cooldown | -2秒 瘟疫守卫冷却 | `special_bonus_unique_venomancer_8` |
| 4 | 25/30 | Snakebite Undispellable | 毒蛇撕咬不可驱散 | `special_bonus_unique_venomancer_5` |
| 4 | 25/30 | 2.5x Plague Ward HP/Damage | 2.5倍 瘟疫守卫生命/攻击力 | `special_bonus_unique_venomancer` |

## 虚空假面 Faceless Void（id 41）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +6 Time Dilation DPS Per Cooldown | +6 时间膨胀每个冷却技能提供每秒伤害 | `special_bonus_unique_faceless_void_6` |
| 1 | 10/27 | +0.5s Time Walk Backtrack Duration | +0.5秒 时间漫游回溯时间 | `special_bonus_unique_faceless_void_7` |
| 2 | 15/28 | +35 Time Lock Damage | +35 时间锁定伤害 | `special_bonus_unique_faceless_void_3` |
| 2 | 15/28 | +125 Time Walk Range | +125 时间漫游距离 | `special_bonus_unique_faceless_void_8` |
| 3 | 20/29 | +80 Attack Speed during Chronosphere | +80 时间结界内攻击速度 | `special_bonus_unique_faceless_void` |
| 3 | 20/29 | -1s Time Walk Cooldown | -1秒 时间漫游冷却 | `special_bonus_unique_faceless_void_5` |
| 4 | 25/30 | +20% Backtrack Chance | +20% 回到过去几率 | `special_bonus_unique_faceless_void_4` |
| 4 | 25/30 | +140 Chronosphere AoE | +140 时间结界范围 | `special_bonus_unique_faceless_void_2` |

## 冥魂大帝 Wraith King（id 42）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +8% Vampiric Spirit Lifesteal | +8% 吸血灵魂吸血 | `special_bonus_unique_wraith_king_2` |
| 1 | 10/27 | +2s Wraithfire Blast Slow Duration | +2秒 冥火爆击减速 | `special_bonus_unique_wraith_king_facet_1` |
| 2 | 15/28 | +0.75s Wraithfire Blast Stun Duration | +0.75秒 冥火爆击眩晕 | `special_bonus_unique_wraith_king_11` |
| 2* | 15/28 | +300 Health | +300 生命 | `special_bonus_hp_300` |
| 3 | 20/29 | +50 Attack Speed | +50 攻击速度 | `special_bonus_attack_speed_50` |
| 3 | 20/29 | +5 Bone Guard Skeletons Spawned | +5 白骨护卫骷髅兵数量 | `special_bonus_unique_wraith_king_facet_3` |
| 4 | 25/30 | -2s Mortal Strike Cooldown | -2秒 本命一击冷却 | `special_bonus_unique_wraith_king_10` |
| 4 | 25/30 | Reincarnation Casts Wraithfire Blast | 绝冥再生施放冥火爆击 | `special_bonus_unique_wraith_king_4` |

## 死亡先知 Death Prophet（id 43）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +75 Silence AoE | +75 沉默魔法范围 | `special_bonus_unique_death_prophet_silence_aoe` |
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 2 | 15/28 | +50 Attack Speed | +50 攻击速度 | `special_bonus_attack_speed_50` |
| 2 | 15/28 | -2.5s Crypt Swarm Cooldown | -2.5秒 地穴虫群冷却 | `special_bonus_unique_death_prophet_2` |
| 3 | 20/29 | +6 Exorcism Spirits | +6 驱使恶灵数量 | `special_bonus_unique_death_prophet` |
| 3 | 20/29 | +30 Spirit Siphon Damage/Heal | +30 吸魂巫术伤害/治疗 | `special_bonus_unique_death_prophet_3` |
| 4 | 25/30 | -22s Spirit Siphon Replenish Time | -22秒 吸魂巫术充能 | `special_bonus_unique_death_prophet_5` |
| 4 | 25/30 | Deaths During Exorcism Extend Duration By +8s | 驱使恶灵期间死亡延长+8秒持续时间 | `special_bonus_unique_death_prophet_exorcism_duration_on_kill` |

## 幻影刺客 Phantom Assassin（id 44）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.8s Phantom Strike Duration | +0.8秒 幻影突袭持续时间 | `special_bonus_unique_phantom_assassin_4` |
| 1 | 10/27 | -2s Stifling Dagger Cooldown | -2秒 窒碍短匕冷却 | `special_bonus_unique_phantom_assassin_7` |
| 2 | 15/28 | +20% Immaterial Evasion | +20% 飘忽不定闪避 | `special_bonus_unique_phantom_assassin_3` |
| 2 | 15/28 | +15% Stifling Dagger Damage | +15% 窒碍短匕伤害 | `special_bonus_unique_phantom_assassin_5` |
| 3 | 20/29 | +200 Phantom Strike Cast Range | +200 幻影突袭施法距离 | `special_bonus_unique_phantom_assassin_6` |
| 3 | 20/29 | +60 Phantom Strike Attack Speed | +60 幻影突袭攻击速度 | `special_bonus_unique_phantom_assassin_strike_aspd` |
| 4 | 25/30 | +10% Coup de Grace chance | +10% 恩赐解脱几率 | `special_bonus_unique_phantom_assassin_2` |
| 4 | 25/30 | Triple Strike Stifling Dagger | +2 窒碍短匕掷出 | `special_bonus_unique_phantom_assassin` |

## 帕格纳 Pugna（id 45）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -1s Nether Blast Cooldown | -1秒 幽冥爆轰冷却 | `special_bonus_unique_pugna_4` |
| 1 | 10/27 | +2 Nether Ward Health | +2 幽冥守卫生命 | `special_bonus_unique_pugna_6` |
| 2 | 15/28 | +30% Decrepify Movement Speed To Allies | +30% 衰老对友军移动速度 | `special_bonus_unique_pugna_decrepify_ally_movespeed` |
| 2 | 15/28 | +250 Health | +250 生命 | `special_bonus_hp_250` |
| 3 | 20/29 | +15% Life Drain Heal | +15% 生命汲取回复 | `special_bonus_unique_pugna_1` |
| 3 | 20/29 | +1.5s Decrepify Duration | +1.5秒 衰老持续时间 | `special_bonus_unique_pugna_5` |
| 4 | 25/30 | +200 Nether Blast Damage | +200 幽冥爆轰伤害 | `special_bonus_unique_pugna_2` |
| 4 | 25/30 | +1.9 Nether Ward Damage Per Mana | +1.9 幽冥守卫伤害系数 | `special_bonus_unique_pugna_3` |

## 圣堂刺客 Templar Assassin（id 46）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5s Meld Debuff Duration | +1.5秒 隐匿负面效果 | `special_bonus_unique_templar_assassin_meld_duration` |
| 1 | 10/27 | +15% Psionic Trap Slow | +15% 灵能陷阱减速 | `special_bonus_unique_templar_assassin_3` |
| 2 | 15/28 | +225 Meld Attack Range | +225 隐匿攻击距离 | `special_bonus_unique_templar_assassin_meld_attack_range_bonus` |
| 2 | 15/28 | +3 Psionic Traps | +3 灵能陷阱 | `special_bonus_unique_templar_assassin_6` |
| 3 | 20/29 | Refraction Dispels | 折光带驱散 | `special_bonus_unique_templar_assassin_4` |
| 3 | 20/29 | +4 Meld Armor Reduction | +4 隐匿降低护甲 | `special_bonus_unique_templar_assassin_8` |
| 4 | 25/30 | 0.8s Meld Hit Bash | 0.8秒 隐匿造成击晕 | `special_bonus_unique_templar_assassin_7` |
| 4 | 25/30 | +4 Refraction Instances | +4 折光次数 | `special_bonus_unique_templar_assassin` |

## 冥界亚龙 Viper（id 47）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Viper Strike Duration | +1秒 蝮蛇突袭持续时间 | `special_bonus_unique_viper_4` |
| 1 | 10/27 | +15 Corrosive Skin Damage Per Second | +15 腐蚀皮肤每秒伤害 | `special_bonus_unique_viper_1` |
| 2 | 15/28 | +20/40 Nethertoxin Min/Max Damage | +20/40 幽冥剧毒最低/最高伤害 | `special_bonus_unique_viper_3` |
| 2 | 15/28 | +15% Poison Attack Slow / Damage | +15% 毒性攻击减速/伤害 | `special_bonus_unique_viper_7` |
| 3 | 20/29 | +70 Viper Strike DPS | +70 蝮蛇突袭每秒伤害 | `special_bonus_unique_viper_2` |
| 3 | 20/29 | +0.35 Predator Damage Per Missing Health | 每缺失1%生命造成掠食伤害+0.35 | `special_bonus_unique_viper_predator_damage` |
| 4 | 25/30 | Nethertoxin Radius increases by 25 every 0.5s | 幽冥剧毒每0.5秒提升25范围 | `special_bonus_unique_viper_nethertoxin_radius` |
| 4 | 25/30 | -50% Viper Strike Mana Cost / Cooldown | -50% 蝮蛇突袭魔耗/冷却 | `special_bonus_unique_viper_8` |

## 露娜 Luna（id 48）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -5% Moon Glaives Damage Reduction | -5% 月刃伤害衰减 | `special_bonus_unique_luna_7` |
| 1 | 10/27 | +0.5s Lucent Beam Ministun | +0.5秒 月光眩晕 | `special_bonus_unique_luna_4` |
| 2 | 15/28 | +1 Lunar Orbit Glaive | +1 环月战刃 | `special_bonus_unique_luna_lunar_orbit_glaive_count` |
| 2 | 15/28 | +80 Lucent Beam Damage | +80 月光伤害 | `special_bonus_unique_luna_1` |
| 3 | 20/29 | -40s Eclipse Cooldown | -40秒 月蚀冷却 | `special_bonus_unique_luna_6` |
| 3 | 20/29 | 1.5x Lunar Orbit Damage / Speed | 1.5倍 月盾伤害/速度 | `special_bonus_unique_luna_lunar_orbit_speed_damage` |
| 4 | 25/30 | +25/50 Lunar Blessing Allied/Self Damage | +25/50 月之祝福友军/自身攻击力 | `special_bonus_unique_luna_3` |
| 4 | 25/30 | Lucent Beam Hits An Additional Target | 月光额外打击一个目标 | `special_bonus_unique_luna_5` |

## 龙骑士 Dragon Knight（id 49）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15 Damage | +15 攻击力 | `special_bonus_attack_damage_15` |
| 1 | 10/27 | -2s Breathe Fire Cooldown | -2秒 火焰气息冷却 | `special_bonus_unique_dragon_knight_3` |
| 2 | 15/28 | +0.4s Dragon Tail Stun | +0.4秒 神龙摆尾眩晕 | `special_bonus_unique_dragon_knight_2` |
| 2 | 15/28 | +300 Health | +300 生命 | `special_bonus_hp_300` |
| 3 | 20/29 | +150 Elder Dragon Form Attack Range | +150 古龙形态攻击距离 | `special_bonus_unique_dragon_knight_7` |
| 3 | 20/29 | +220 Breathe Fire Damage | +220 火焰气息伤害 | `special_bonus_unique_dragon_knight_9` |
| 4 | 25/30 | +12 Dragon Blood HP Regen/Armor | +12 神龙之血生命恢复/护甲 | `special_bonus_unique_dragon_knight` |
| 4 | 25/30 | +50% Wyrm's Wrath Bonuses | +50% 飞龙之怒加成 | `special_bonus_unique_dragon_knight_wyrms_wrath_damage` |

## 戴泽 Dazzle（id 50）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +200 Poison Touch Attack Range | +200 剧毒之触攻击距离 | `special_bonus_unique_dazzle_poison_touch_attack_range_bonus` |
| 1 | 10/27 | +1.75 Mana Regen | +1.75 魔法恢复 | `special_bonus_mp_regen_175` |
| 2 | 15/28 | +45 Shadow Wave Heal / Damage | +45 暗影波治疗/伤害 | `special_bonus_unique_dazzle_2` |
| 2 | 15/28 | +5s Nothl Projection Duration | +5秒 虚无投影持续时间 | `special_bonus_unique_dazzle_nothl_projection_duration` |
| 3 | 20/29 | -3s Shallow Grave Cooldown | -3秒 薄葬冷却 | `special_bonus_unique_dazzle_shallow_grave_cooldown` |
| 3 | 20/29 | +75 Poison Touch DPS | +75 剧毒之触每秒伤害 | `special_bonus_unique_dazzle_3` |
| 4 | 25/30 | +40% Poison Touch Slow | +40% 剧毒之触减速 | `special_bonus_unique_dazzle_1` |
| 4 | 25/30 | +1 Weave Armor Reduction/Increase | +1 编织降低/提升护甲 | `special_bonus_unique_dazzle_4` |

## 发条技师 Clockwerk（id 51）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 1 | 10/27 | +75 Hookshot Damage | +75 发射钩爪伤害 | `special_bonus_unique_clockwerk_hookshot_damage` |
| 2 | 15/28 | -8s Hookshot Cooldown | -8秒 发射钩爪冷却 | `special_bonus_unique_clockwerk_5` |
| 2 | 15/28 | +25 Battery Assault Damage | +25 弹幕冲击伤害 | `special_bonus_unique_clockwerk_3` |
| 3 | 20/29 | Rocket Flare True Sight | 照明火箭具有真实视域 | `special_bonus_unique_clockwerk_4` |
| 3 | 20/29 | +80 Power Cogs Mana Burn | +80 能量齿轮魔法损失 | `special_bonus_unique_clockwerk_2` |
| 4 | 25/30 | 3 Rocket Flare Charges | 3 照明火箭能量点数 | `special_bonus_unique_clockwerk_rocket_flare_charges` |
| 4 | 25/30 | -0.25s Battery Assault Interval | -0.25秒 弹幕冲击间隔 | `special_bonus_unique_clockwerk` |

## 拉席克 Leshrac（id 52）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 1 | 10/27 | +4 Armor | +4 护甲 | `special_bonus_armor_4` |
| 2 | 15/28 | +80 Lightning Storm Damage | +80 闪电风暴伤害 | `special_bonus_unique_leshrac_6` |
| 2 | 15/28 | +10% Damage Reduction during Pulse Nova | +10% 脉冲新星期间承伤降低 | `special_bonus_unique_leshrac_4` |
| 3 | 20/29 | Diabolic Edict Hits An Additional Target | 恶魔敕令额外击中一个目标 | `special_bonus_unique_leshrac_7` |
| 3 | 20/29 | +30 Pulse Nova Damage | +30 脉冲新星伤害 | `special_bonus_unique_leshrac_3` |
| 4 | 25/30 | +20 Diabolic Edict Explosions | +20 恶魔敕令爆炸次数 | `special_bonus_unique_leshrac_1` |
| 4 | 25/30 | Pulse Nova triggers Lightning Storm | 脉冲新星触发闪电风暴 | `special_bonus_unique_leshrac_pulse_nova_lightning` |

## 自然先知 Nature's Prophet（id 53）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -10s Nature's Call Cooldown | -10秒 自然的呼唤冷却 | `special_bonus_unique_furion_6` |
| 1 | 10/27 | +25 Wrath of Nature Base Damage | +25 自然之怒基础伤害 | `special_bonus_unique_furion_5` |
| 2 | 15/28 | +50 Treant Movement Speed | +50 自然的呼唤树人移速 | `special_bonus_unique_furion_2` |
| 2 | 15/28 | +100 Teleportation Barrier | +100 传送护盾 | `special_bonus_unique_furion_teleportation_barrier` |
| 3 | 20/29 | -20s Wrath of Nature Cooldown | -20秒 自然之怒冷却 | `special_bonus_unique_furion_7` |
| 3 | 20/29 | +240 Sprout Damage | +240 发芽伤害 | `special_bonus_unique_furion_4` |
| 4 | 25/30 | Removed Teleportation Cooldown | 传送无冷却 | `special_bonus_unique_furion_3` |
| 4 | 25/30 | 3x Treant HP/Damage | 3倍 树人生命/攻击力 | `special_bonus_unique_furion` |

## 噬魂鬼 Lifestealer（id 54）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +4 All Attributes | +4 全属性 | `special_bonus_all_stats_4` |
| 1* | 10/27 | +15 Movement Speed | +15 移动速度 | `special_bonus_movement_speed_15` |
| 2 | 15/28 | +175 Infest Damage | +175 感染伤害 | `special_bonus_unique_lifestealer_infest_damage` |
| 2 | 15/28 | 50 Attack Speed on Open Wounds Target | 对撕裂伤口目标+50攻速 | `special_bonus_unique_lifestealer_4` |
| 3 | 20/29 | +12% Infest Target Movespeed/Health | +12% 感染目标移速/生命 | `special_bonus_unique_lifestealer_infest_target_bonus` |
| 3 | 20/29 | +25% Open Wounds Lifesteal | +25% 撕裂伤口吸取生命 | `special_bonus_unique_lifestealer_6` |
| 4 | 25/30 | +1% Feast Heal and Damage | +1% 盛宴治疗/伤害 | `special_bonus_unique_lifestealer_3` |
| 4 | 25/30 | +1s Rage Duration | +1秒 狂暴持续时间 | `special_bonus_unique_lifestealer` |

## 黑暗贤者 Dark Seer（id 55）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15% Wall of Replica Illusion Damage | +15% 复制之墙幻象攻击力 | `special_bonus_unique_dark_seer_7` |
| 1 | 10/27 | +65 Ion Shell Radius | +65 离子外壳范围 | `special_bonus_unique_dark_seer_5` |
| 2 | 15/28 | +75 Vacuum AoE | +75 真空范围 | `special_bonus_unique_dark_seer_2` |
| 2 | 15/28 | -1.5s Surge Cooldown | -1.5秒 奔腾冷却 | `special_bonus_unique_dark_seer_6` |
| 3 | 20/29 | -40s Wall of Replica Cooldown | -40秒 复制之墙冷却 | `special_bonus_unique_dark_seer_13` |
| 3 | 20/29 | +50 Ion Shell Damage | +50 离子外壳伤害 | `special_bonus_unique_dark_seer` |
| 4 | 25/30 | 2 Ion Shell Charges | 2 离子外壳能量点数 | `special_bonus_unique_dark_seer_14` |
| 4 | 25/30 | 350 AoE Surge | 350 范围型奔腾 | `special_bonus_unique_dark_seer_3` |

## 克林克兹 Clinkz（id 56）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Strafe Duration | +1秒 扫射持续时间 | `special_bonus_unique_clinkz_1` |
| 1 | 10/27 | -4s Skeleton Walk Cooldown | -4秒 骨隐步冷却 | `special_bonus_unique_clinkz_10` |
| 2 | 15/28 | +50 Attack Range | +50 攻击距离 | `special_bonus_attack_range_50` |
| 2 | 15/28 | -10s Death Pact Charge Restore Time | -10秒 死亡契约充能 | `special_bonus_unique_clinkz_9` |
| 3 | 20/29 | +40 Strafe Attack Speed | +40 扫射攻击速度 | `special_bonus_unique_clinkz_7` |
| 3 | 20/29 | +400 Death Pact Bonus Health | +400 死亡契约额外生命 | `special_bonus_unique_clinkz_8` |
| 4 | 25/30 | -9s Strafe Cooldown | -9秒 扫射冷却 | `special_bonus_unique_clinkz_4` |
| 4 | 25/30 | Searing Arrows Multishot | 灼热之箭齐射 | `special_bonus_unique_clinkz_3` |

## 全能骑士 Omniknight（id 57）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +200 Repel Cast Range | +200 驱逐施法距离 | `special_bonus_unique_omniknight_2` |
| 1 | 10/27 | +30 Base Damage | +30 基础攻击力 | `special_bonus_attack_base_damage_30` |
| 2 | 15/28 | -0.5s Hammer of Purity Cooldown | -0.5秒 纯洁之锤冷却 | `special_bonus_unique_omniknight_3` |
| 2 | 15/28 | -20s Guardian Angel Cooldown | -20秒 守护天使冷却 | `special_bonus_unique_omniknight_7` |
| 3 | 20/29 | +150 Degen Aura Radius | +150 退化光环作用范围 | `special_bonus_unique_omniknight_degen_aura_radius` |
| 3 | 20/29 | -3s Purification Cooldown | -3秒 洗礼冷却 | `special_bonus_unique_omniknight_6` |
| 4 | 25/30 | +160 Purification Damage/Heal | +160 洗礼伤害/治疗 | `special_bonus_unique_omniknight_1` |
| 4 | 25/30 | +75% Hammer of Purity Bonus Base Damage | +75% 纯洁之锤基础攻击力伤害 | `special_bonus_unique_omniknight_4` |

## 魅惑魔女 Enchantress（id 58）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5 Armor for Enchantress and her units | 魅惑魔女及其单位+5 护甲 | `special_bonus_unique_enchantress_enchant_armor` |
| 1 | 10/27 | +30 Movespeed during Nature's Attendants | 自然之助期间+30移动速度 | `special_bonus_unique_enchantress_6` |
| 2 | 15/28 | +30 Attack Speed for Enchantress and her units | 魅惑魔女及其单位+30 攻速 | `special_bonus_unique_enchantress_enchant_attackspeed` |
| 2 | 15/28 | +8 Nature's Attendants Heal | +8 自然之助治疗 | `special_bonus_unique_enchantress_5` |
| 3 | 20/29 | +9 Nature's Attendants Wisps | +9 自然之助小精灵 | `special_bonus_unique_enchantress_2` |
| 3 | 20/29 | +150 Health / +25 Damage for Enchantress and her units | 魅惑魔女及其单位+150 生命/+25 攻击力 | `special_bonus_unique_enchantress_enchant_health_damage` |
| 4 | 25/30 | +6.5% Impetus Damage | +6.5% 推进伤害 | `special_bonus_unique_enchantress_4` |
| 4 | 25/30 | +80 Untouchable Attack Slow | +80 不可侵犯降低攻速 | `special_bonus_unique_enchantress_3` |

## 哈斯卡 Huskar（id 59）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.75s Inner Fire Duration | +0.75秒 心炎持续时间 | `special_bonus_unique_huskar_3` |
| 1 | 10/27 | +2s Life Break Slow Duration | +2秒 牺牲减速 | `special_bonus_unique_huskar_4` |
| 2 | 15/28 | +5 Burning Spear Burn Damage | +5 沸血之矛烧灼伤害 | `special_bonus_unique_huskar_2` |
| 2 | 15/28 | +12% Lifesteal | +12% 吸血 | `special_bonus_lifesteal_12` |
| 3 | 20/29 | +30% Berserker's Blood Regen | +30% 狂战士之血恢复 | `special_bonus_unique_huskar_6` |
| 3 | 20/29 | -5s Life Break Cooldown | -5秒 牺牲冷却 | `special_bonus_unique_huskar_7` |
| 4 | 25/30 | +6s Burning Spear Duration | +6秒 沸血之矛持续时间 | `special_bonus_unique_huskar_5` |
| 4 | 25/30 | +22% Life Break Damage | +22% 牺牲伤害 | `special_bonus_unique_huskar` |

## 暗夜魔王 Night Stalker（id 60）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -1s Void Cooldown | -1秒 虚空冷却 | `special_bonus_unique_night_stalker_4` |
| 1 | 10/27 | +10 Crippling Fear DPS | +10 伤残恐惧每秒伤害 | `special_bonus_unique_night_stalker_crippling_fear_damage` |
| 2 | 15/28 | +25 Dark Ascension Damage | +25 黑暗飞升攻击力 | `special_bonus_unique_night_stalker_3` |
| 2 | 15/28 | 20% Hunter in the Night Status Resistance | 暗夜猎影20% 状态抗性 | `special_bonus_unique_night_stalker_hunter_status_resist` |
| 3 | 20/29 | +75 Crippling Fear Radius | +75 伤残恐惧作用范围 | `special_bonus_unique_night_stalker_crippling_fear_radius` |
| 3 | 20/29 | +15 Strength | +15 力量 | `special_bonus_strength_15` |
| 4 | 25/30 | +100 Midnight Feast Lifesteal | +100 午夜盛宴吸血 | `special_bonus_unique_night_stalker_2` |
| 4 | 25/30 | -35s Dark Ascension Cooldown | -35秒 黑暗飞升冷却 | `special_bonus_unique_night_stalker` |

## 育母蜘蛛 Broodmother（id 61）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +80 Spawn Spiderlings Damage | +80 孵化蜘蛛伤害 | `special_bonus_unique_broodmother_3` |
| 1 | 10/27 | +20% Insatiable Hunger Lifesteal | +20% 极度饥渴吸血 | `special_bonus_unique_broodmother_6` |
| 2 | 15/28 | +5 Incapacitating Bite Attack Bonus | +5 麻痹之咬额外攻击伤害 | `special_bonus_unique_broodmother_2` |
| 2 | 15/28 | +175 Spiderlings Health | +175 小蜘蛛生命 | `special_bonus_unique_broodmother_7` |
| 3 | 20/29 | -6s Spin Web Charge Restore Time | -6秒 织网充能 | `special_bonus_unique_broodmother_5` |
| 3 | 20/29 | +20% Incapacitating Bite Slow/Miss Chance | +20% 麻痹之咬减速/落空 | `special_bonus_unique_broodmother_4` |
| 4 | 25/30 | -0.15s BAT during Insatiable Hunger | 极度饥渴期间-0.15秒基础攻击间隔 | `special_bonus_unique_broodmother_1` |
| 4 | 25/30 | +7% Spin Web Move Speed and Ignore Speed Limit | +7% 织网移动速度并突破移速上限 | `special_bonus_unique_broodmother_web_speed` |

## 赏金猎人 Bounty Hunter（id 62）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.35s Shuriken Toss Slow | +0.35秒 投掷飞镖减速 | `special_bonus_unique_bounty_hunter_5` |
| 1 | 10/27 | +30 Damage | +30 攻击力 | `special_bonus_attack_damage_30` |
| 2 | 15/28 | -30% Damage Taken in Shadow Walk | -30% 暗影步期间承受伤害 | `special_bonus_unique_bounty_hunter_9` |
| 2 | 15/28 | +50 Track Gold | +50 追踪术金钱 | `special_bonus_unique_bounty_hunter_3` |
| 3 | 20/29 | +50 Jinada Gold Steal | +50 忍术窃取金钱 | `special_bonus_unique_bounty_hunter` |
| 3 | 20/29 | Track Grants Shared Vision | 追踪术提供共享视野 | `special_bonus_unique_bounty_hunter_8` |
| 4 | 25/30 | +190 Shuriken Toss Damage | +190 投掷飞镖伤害 | `special_bonus_unique_bounty_hunter_2` |
| 4 | 25/30 | No Cooldown on Jinada | 忍术无冷却 | `special_bonus_unique_bounty_hunter_jinada_no_cooldown` |

## 编织者 Weaver（id 63）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +50 Shukuchi Movement Speed | +50 缩地移动速度 | `special_bonus_unique_weaver_shukuchi_movespeed` |
| 1 | 10/27 | +7 Strength | +7 力量 | `special_bonus_strength_7` |
| 2 | 15/28 | +90 Shukuchi Damage | +90 缩地伤害 | `special_bonus_unique_weaver_1` |
| 2 | 15/28 | +2 Swarm Attacks to Kill | +2 虫群可被攻击次数 | `special_bonus_unique_weaver_4` |
| 3 | 20/29 | +60 Bonus Damage On Geminate | +60 连击额外伤害 | `special_bonus_unique_weaver_2` |
| 3 | 20/29 | +0.5 Swarm Armor Reduction Per Attack | +0.5 虫群削弱护甲 | `special_bonus_unique_weaver_3` |
| 4 | 25/30 | -3s Shukuchi Cooldown | -3秒 缩地冷却 | `special_bonus_unique_weaver_6` |
| 4 | 25/30 | +1 Geminate Attack | +1 连击 | `special_bonus_unique_weaver_5` |

## 杰奇洛 Jakiro（id 64）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +30 Liquid Fire Attack Speed Slow | +30 液态火降低攻击速度 | `special_bonus_unique_jakiro_4` |
| 1 | 10/27 | +100 Ice Path Damage | +100 冰封路径伤害 | `special_bonus_unique_jakiro_6` |
| 2 | 15/28 | +175 Attack Range | +175 攻击距离 | `special_bonus_attack_range_175` |
| 2 | 15/28 | -3.5s Dual Breath Cooldown | -3.5秒 冰火交加冷却 | `special_bonus_unique_jakiro_dualbreath_cooldown` |
| 3 | 20/29 | +0.4s Ice Path Stun Duration | +0.4秒 冰封路径眩晕 | `special_bonus_unique_jakiro` |
| 3 | 20/29 | +25 Macropyre Damage | +25 烈焰焚身伤害 | `special_bonus_unique_jakiro_7` |
| 4 | 25/30 | +100% Dual Breath Damage and Range | +100% 冰火交加伤害/距离 | `special_bonus_unique_jakiro_2` |
| 4 | 25/30 | +3.5% Liquid Frost and Fire Max Health Damage | +3.5%液态冰/火最大生命值伤害 | `special_bonus_unique_jakiro_3` |

## 蝙蝠骑士 Batrider（id 65）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5% Firefly Max Movement Speed Bonus | +5% 火焰飞行最高移速加成 | `special_bonus_unique_batrider_3` |
| 1 | 10/27 | +1s Smoldering Resin Duration | +1秒 闷烧树脂持续时间 | `special_bonus_unique_batrider_smoldering_resin_ticks` |
| 2 | 15/28 | +30 Firefly Damage Per Second | +30 火焰飞行每秒伤害 | `special_bonus_unique_batrider_4` |
| 2 | 15/28 | +0.75% Sticky Napalm Movement Slow | +0.75% 粘性燃油减速 | `special_bonus_unique_batrider_7` |
| 3 | 20/29 | Attacks apply 1 Stack of Sticky Napalm | 攻击施加1层粘性燃油 | `special_bonus_unique_batrider_6` |
| 3 | 20/29 | -6s Flamebreak Cooldown | -6秒 烈焰破击冷却 | `special_bonus_unique_batrider_5` |
| 4 | 25/30 | +0.75s Flaming Lasso Duration | +0.75秒 燃烧枷锁持续时间 | `special_bonus_unique_batrider_1` |
| 4 | 25/30 | Flamebreak applies 4 Sticky Napalm Stacks | 烈焰破击施加4层粘性燃油 | `special_bonus_unique_batrider_2` |

## 陈 Chen（id 66）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +75 Penitence Damage | +75 赎罪伤害 | `special_bonus_unique_chen_11` |
| 1 | 10/27 | +25% Zealot Health/Damage | +25% 狂热者生命值/攻击力 | `special_bonus_unique_chen_zealot` |
| 2 | 15/28 | +12% Holy Persuasion Damage | +12% 神圣劝化伤害 | `special_bonus_unique_chen_5` |
| 2 | 15/28 | +15% Penitence Slow | +15% 赎罪减速 | `special_bonus_unique_chen_8` |
| 3 | 20/29 | +15% Divine Favor Heal Amplification | +15% 神力恩泽治疗增强 | `special_bonus_unique_chen_divine_favor_healing` |
| 3 | 20/29 | +1300 Holy Persuasion Minimum Health | +1300 神圣劝化最低生命 | `special_bonus_unique_chen_4` |
| 4 | 25/30 | Hand of God applies a Strong Dispel | 上帝之手施加强驱散 | `special_bonus_unique_chen_12` |
| 4 | 25/30 | Hand of God Fully Heals Chen and His Creeps | 上帝之手治愈陈和他的单位 | `special_bonus_unique_chen_2` |

## 幽鬼 Spectre（id 67）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -3s Spectral Dagger Cooldown | -3秒 幽鬼之刃冷却 | `special_bonus_unique_spectre` |
| 1 | 10/27 | +12 Desolate Damage | +12 荒芜伤害 | `special_bonus_unique_spectre_2` |
| 2 | 15/28 | +1s Shadow Step Duration | +1秒 如影随形持续时间 | `special_bonus_unique_spectre_shadow_step_duration` |
| 2 | 15/28 | +80 Spectral Dagger Damage | +80 幽鬼之刃伤害 | `special_bonus_unique_spectre_6` |
| 3* | 20/29 | +300 Health | +300 生命 | `special_bonus_hp_300` |
| 3 | 20/29 | +15% Spectral Dagger Slow/Bonus | +15% 幽鬼之刃减速/加速 | `special_bonus_unique_spectre_3` |
| 4 | 25/30 | +12% All Spectre Illusion Damage | +12% 所有幽鬼幻象攻击力 | `special_bonus_unique_spectre_4` |
| 4 | 25/30 | +4% Dispersion | +4% 折射 | `special_bonus_unique_spectre_5` |

## 远古冰魄 Ancient Apparition（id 68）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +300 Chilling Touch Attack Range | +300 极寒之触攻击距离 | `special_bonus_unique_ancient_apparition_7` |
| 1 | 10/27 | +30 Cold Feet Damage Per Second | +30 寒霜之足每秒伤害 | `special_bonus_unique_ancient_apparition_cold_feet_dps` |
| 2 | 15/28 | -2s Ice Vortex Cooldown | -2秒 冰霜漩涡冷却 | `special_bonus_unique_ancient_apparition_3` |
| 2 | 15/28 | +250 Cold Feet Break Distance | +250 寒霜之足失效距离 | `special_bonus_unique_ancient_apparition_cold_feet_distance` |
| 3 | 20/29 | +4s Ice Blast Frostbitten Duration | +4秒 冰晶爆轰寒霜诅咒 | `special_bonus_unique_ancient_apparition_ice_vortex_duration` |
| 3 | 20/29 | +100 Chilling Touch Damage | +100 极寒之触伤害 | `special_bonus_unique_ancient_apparition_2` |
| 4 | 25/30 | 450 AoE Cold Feet | 450 范围型寒霜之足 | `special_bonus_unique_ancient_apparition_1` |
| 4 | 25/30 | +4% Ice Blast Kill Threshold | +4% 冰晶爆轰斩杀血量上限 | `special_bonus_unique_ancient_apparition_5` |

## 末日使者 Doom（id 69）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1* | 10/27 | +10% Magic Resistance | +10% 魔法抗性 | `special_bonus_magic_resistance_10` |
| 1 | 10/27 | +0.2s Infernal Blade Stun Duration | +0.2秒 阎刃眩晕 | `special_bonus_unique_doom_4` |
| 2 | 15/28 | +7% Scorched Earth Movement Speed | +7% 焦土移动速度 | `special_bonus_unique_doom_6` |
| 2 | 15/28 | +66 Damage | +66 攻击力 | `special_bonus_attack_damage_66` |
| 3 | 20/29 | +1.5% Infernal Blade Max HP As Damage | +1.5% 阎刃最大生命值伤害 | `special_bonus_unique_doom_1` |
| 3 | 20/29 | -10s Doom Cooldown | -10秒 末日冷却 | `special_bonus_unique_doom_9` |
| 4 | 25/30 | Doom applies Mute | 末日施加锁闭 | `special_bonus_unique_doom_10` |
| 4 | 25/30 | Permanent Scorched Earth | 永久焦土 | `special_bonus_unique_doom_11` |

## 熊战士 Ursa（id 70）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +9s Fury Swipes Reset Time | +9秒 怒意狂击重置时间 | `special_bonus_unique_ursa_4` |
| 1 | 10/27 | +1.75 Mana Regen | +1.75 魔法恢复 | `special_bonus_mp_regen_175` |
| 2 | 15/28 | +0.5% Maul Health As Damage | +0.5% 暴烈之爪生命值转为攻击力 | `special_bonus_unique_ursa_maul_health` |
| 2 | 15/28 | +25% Enrage Status Resistance | +25% 激怒状态抗性 | `special_bonus_unique_ursa_8` |
| 3 | 20/29 | +300 Earthshock Radius | +300 震撼大地范围 | `special_bonus_unique_ursa_2` |
| 3 | 20/29 | +6 Fury Swipes Damage | +6 怒意狂击伤害 | `special_bonus_unique_ursa` |
| 4 | 25/30 | Earthshock has 2 Charges | 2 震撼大地能量点数 | `special_bonus_unique_ursa_3` |
| 4 | 25/30 | +3 Overpower Attacks | +3 超强力量攻击次数 | `special_bonus_unique_ursa_7` |

## 裂魂人 Spirit Breaker（id 71）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +500 Night Vision | +500 夜间视野 | `special_bonus_night_vision_500` |
| 1 | 10/27 | +4 Armor | +4 护甲 | `special_bonus_armor_4` |
| 2 | 15/28 | -3s Bulldoze Cooldown | -3秒 威吓冷却 | `special_bonus_unique_spirit_breaker_2` |
| 2 | 15/28 | +60 Charge of Darkness Bonus Speed | +60 暗影冲刺移速加成 | `special_bonus_unique_spirit_breaker_increased_charge_speed` |
| 3 | 20/29 | +8%/+2% Empowering Haste Movespeed Bonus | +8%/+2% 神行太保移速加成 | `special_bonus_unique_bull_rush_movement_increase` |
| 3 | 20/29 | Bulldoze 375 All Damage Barrier | 威吓提供375 全伤害护盾 | `special_bonus_unique_spirit_breaker_shield` |
| 4 | 25/30 | +20% Greater Bash Damage | +20% 巨力重击伤害 | `special_bonus_unique_spirit_breaker_3` |
| 4 | 25/30 | -4s Charge of Darkness Cooldown | -4秒 暗影冲刺冷却 | `special_bonus_unique_spirit_breaker_4` |

## 矮人直升机 Gyrocopter（id 72）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25% Homing Missile Damage | +25% 追踪导弹伤害 | `special_bonus_unique_gyrocopter_homing_missile_damage` |
| 1 | 10/27 | +150 Health | +150 生命 | `special_bonus_hp_150` |
| 2 | 15/28 | +0.3s Homing Missile Stun Duration | +0.3秒 追踪导弹眩晕 | `special_bonus_unique_gyrocopter_6` |
| 2 | 15/28 | +25 Flak Cannon Damage | +25 高射火炮攻击力 | `special_bonus_unique_gyrocopter_flak_cannon_bonus_damage` |
| 3 | 20/29 | +3 Flak Cannon Attacks | +3 高射火炮攻击次数 | `special_bonus_unique_gyrocopter_2` |
| 3 | 20/29 | +14 Rocket Barrage Damage | +14 火箭弹幕伤害 | `special_bonus_unique_gyrocopter_3` |
| 4 | 25/30 | -6s Flak Cannon Cooldown | -6秒 高射火炮冷却 | `special_bonus_unique_gyrocopter_1` |
| 4 | 25/30 | -40s Call Down Cooldown | -40秒 召唤飞弹冷却 | `special_bonus_unique_gyrocopter_5` |

## 炼金术士 Alchemist（id 73）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +150 Unstable Concoction Radius | +150 不稳定化合物范围 | `special_bonus_unique_alchemist` |
| 1 | 10/27 | +1 Acid Spray Armor Reduction | +1 酸性喷雾护甲降低 | `special_bonus_unique_alchemist_5` |
| 2 | 15/28 | +1% Corrosive Weaponry Slow / Damage Reduction Per Stack | +1% 腐蚀兵械每层叠加减速/降低攻击力 | `special_bonus_unique_alchemist_weaponry_power` |
| 2 | 15/28 | Greevil's Greed provides +3 Damage per stack | 每层贪魔的贪婪+3 攻击力 | `special_bonus_unique_alchemist_7` |
| 3 | 20/29 | -0.1s Chemical Rage Base Attack Time | -0.1秒 化学狂暴基础攻击间隔 | `special_bonus_unique_alchemist_8` |
| 3 | 20/29 | +400 Unstable Concoction Max Damage | +400 不稳定化合物最高伤害 | `special_bonus_unique_alchemist_2` |
| 4 | 25/30 | +50 Chemical Rage Movement Speed | +50 化学狂暴移动速度 | `special_bonus_unique_alchemist_6` |
| 4 | 25/30 | +50 Chemical Rage Regeneration | +50 化学狂暴恢复 | `special_bonus_unique_alchemist_4` |

## 祈求者 Invoker（id 74）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +50 Ice Wall DPS | +50 寒冰之墙每秒伤害 | `special_bonus_unique_invoker_ice_wall_dps` |
| 1 | 10/27 | -5s Tornado Cooldown | -5秒 强袭飓风冷却 | `special_bonus_unique_invoker_3` |
| 2 | 15/28 | +25 Alacrity Damage/Speed | +25 灵动迅捷攻击力/攻速 | `special_bonus_unique_invoker_5` |
| 2 | 15/28 | -6s Cold Snap Cooldown | -6秒 急速冷却冷却 | `special_bonus_unique_invoker_9` |
| 3 | 20/29 | +2 Chaos Meteors | +2 混沌陨石 | `special_bonus_unique_invoker_additional_chaos_meteors` |
| 3* | 20/29 | +{s:bonus_armor_removed}% Forged Spirit Armor Reduction | +{s:bonus_armor_removed}% 熔炉精灵护甲减少（数值未解析） | `special_bonus_unique_invoker_forged_spirit_armor_reduction` |
| 4 | 25/30 | Radial Deafening Blast | 环形超震声波 | `special_bonus_unique_invoker_2` |
| 4 | 25/30 | 2x Quas/Wex/Exort Active Bonuses | 2倍 冰/雷/火活跃效果 | `special_bonus_unique_invoker_13` |

## 沉默术士 Silencer（id 75）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25 Attack Speed | +25 攻击速度 | `special_bonus_attack_speed_25` |
| 1 | 10/27 | +7% Suffer In Silence Silenced Target Damage | +7% 默默受苦被沉默目标伤害 | `special_bonus_unique_silencer_brain_drain_damage` |
| 2 | 15/28 | -15s Global Silence Cooldown | -15秒 全领域静默冷却 | `special_bonus_unique_silencer_7` |
| 2 | 15/28 | +2s/+1s Arcane Curse Base/Penalty Duration | +2/+1秒 奥术诅咒基础/惩罚时间 | `special_bonus_unique_silencer_arcane_curse_duration` |
| 3 | 20/29 | +40s Glaives of Wisdom Int Steal Duration | +40秒 智慧之刃智力窃取 | `special_bonus_unique_silencer_5` |
| 3 | 20/29 | 250 AoE Last Word | 250 范围型遗言 | `special_bonus_unique_silencer_4` |
| 4 | 25/30 | +30% Glaives of Wisdom Damage | +30% 智慧之刃伤害 | `special_bonus_unique_silencer_3` |
| 4 | 25/30 | +2s Global Silence Duration | +2秒 全领域静默持续时间 | `special_bonus_unique_silencer_global_duration` |

## 殁境神蚀者 Outworld Destroyer（id 76）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +100 Astral Imprisonment Cast Range | +100 星体禁锢施法距离 | `special_bonus_unique_outworld_devourer_astral_castrange` |
| 1 | 10/27 | +200 Mana | +200 魔法 | `special_bonus_mp_200` |
| 2 | 15/28 | +5% Essence Flux Mana Restored | +5% 精华变迁魔法值回复 | `special_bonus_unique_outworld_devourer_flux_restore` |
| 2 | 15/28 | +0.8% of Current Mana as Movement Speed | +0.8% 当前魔法作为移速 | `special_bonus_unique_outworld_devourer_3` |
| 3 | 20/29 | -10s Objurgation Cooldown | -10秒 责难冷却 | `special_bonus_unique_outworld_devourer_barrier` |
| 3 | 20/29 | +12% Astral Imprisonment Mana Capacity Steal | +12% 星体禁锢魔法值窃取 | `special_bonus_unique_outworld_devourer_4` |
| 4 | 25/30 | +1.5% Arcane Orb Damage | +1.5% 奥术天球伤害 | `special_bonus_unique_outworld_devourer` |
| 4 | 25/30 | -60s Sanity's Eclipse Cooldown | -60秒 神智之蚀冷却 | `special_bonus_unique_outworld_devourer_5` |

## 狼人 Lycan（id 77）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +3 Howl Armor Reduction | +3 嗥叫护甲降低 | `special_bonus_unique_lycan_howl_armor` |
| 1 | 10/27 | +14 Wolves Damage | +14 精灵狼攻击力 | `special_bonus_unique_lycan_3` |
| 2 | 15/28 | +375 Summon Wolves Health | +375 召狼生命 | `special_bonus_unique_lycan_7` |
| 2 | 15/28 | -15s Shapeshift Cooldown | -15秒 变身冷却 | `special_bonus_unique_lycan_8` |
| 3 | 20/29 | +7s Shapeshift Duration | +7秒 变身持续时间 | `special_bonus_unique_lycan_1` |
| 3 | 20/29 | +25% Feral Impulse Damage | +25% 野性驱使攻击力 | `special_bonus_unique_lycan_4` |
| 4 | 25/30 | Howl Reduces Total Attack Damage | 嗥叫降低总攻击力 | `special_bonus_unique_lycan_5` |
| 4 | 25/30 | -25% Summon Wolves BAT | -25% 召狼基础攻击间隔 | `special_bonus_unique_lycan_2` |

## 酒仙 Brewmaster（id 78）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +13 Brewlings Base Damage | +13 元素战士基础攻击力 | `special_bonus_unique_brewmaster_2` |
| 1 | 10/27 | +2/1s Drunken Brawler Brew Up / Extend Duration | +2/1秒 醉拳浸酒/延长持续时间 | `special_bonus_unique_brewmaster_brewed_up_duration` |
| 2 | 15/28 | +40% Cinder Brew Damage/Duration | +40% 余烬佳酿伤害/持续时间 | `special_bonus_unique_brewmaster_5` |
| 2 | 15/28 | +600 Brewlings Health | +600 元素战士生命 | `special_bonus_unique_brewmaster` |
| 3 | 20/29 | -12s Primal Split Cooldown | -12秒 元素分离冷却 | `special_bonus_unique_brewmaster_primal_split_cooldown` |
| 3 | 20/29 | +110 Attack Speed | +110 攻击速度 | `special_bonus_attack_speed_110` |
| 4 | 25/30 | 1.5x Drunken Brawler Stance Bonuses | 1.5倍 醉拳拳法加成 | `special_bonus_unique_brewmaster_drunken_brawler_stance_bonus` |
| 4 | 25/30 | Cinder Brew applies Fear when ignited | 余烬佳酿点燃时施加恐惧 | `special_bonus_unique_brewmaster_4` |

## 暗影恶魔 Shadow Demon（id 79）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15% Shadow Poison Damage | +15% 暗影剧毒伤害 | `special_bonus_unique_shadow_demon_4` |
| 1 | 10/27 | +8 Strength | +8 力量 | `special_bonus_strength_8` |
| 2* | 15/28 | +20 Movement Speed | +20 移动速度 | `special_bonus_movement_speed_20` |
| 2 | 15/28 | -1s Shadow Poison Cooldown | -1秒 暗影剧毒冷却 | `special_bonus_unique_shadow_demon_3` |
| 3 | 20/29 | +15% Disseminate Shared Damage | +15% 散播共享伤害 | `special_bonus_unique_shadow_demon_disseminate_damage` |
| 3 | 20/29 | -20s Demonic Purge Cooldown | -20秒 邪恶净化冷却 | `special_bonus_unique_shadow_demon_9` |
| 4 | 25/30 | Demonic Purge Applies Shadow Poison | 邪恶净化施加暗影剧毒 | `special_bonus_unique_shadow_demon_purge_poison` |
| 4 | 25/30 | 2 Charges of Disruption | 2 崩裂禁锢能量点数 | `special_bonus_unique_shadow_demon_7` |

## 独行德鲁伊 Lone Druid（id 80）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5s True Form Duration | +5秒 真熊形态持续时间 | `special_bonus_unique_lone_druid_2` |
| 1 | 10/27 | +20 Entangle Root Damage Per Second | +20 缠绕之根每秒缠绕伤害 | `special_bonus_unique_lone_druid_1` |
| 2 | 15/28 | -4s Savage Roar Cooldown | -4秒 野蛮咆哮冷却 | `special_bonus_unique_lone_druid_4` |
| 2 | 15/28 | +12 Agility | +12 敏捷 | `special_bonus_agility_12` |
| 3 | 20/29 | +125 Savage Roar Radius | +125 野蛮咆哮作用范围 | `special_bonus_unique_lone_druid_savage_roar_aoe` |
| 3 | 20/29 | +55 Attack Speed | +55 攻击速度 | `special_bonus_attack_speed_55` |
| 4 | 25/30 | True Form provides 70% Slow Resistance | 真熊形态提供70% 减速抗性 | `special_bonus_unique_lone_druid_8` |
| 4 | 25/30 | +0.6s Entangle Root Duration | +0.6秒 缠绕之根缠绕时间 | `special_bonus_unique_lone_druid_entangle_duration` |

## 混沌骑士 Chaos Knight（id 81）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +30% Chaos Strike Lifesteal | +30% 混沌一击吸血 | `special_bonus_unique_chaos_knight_6` |
| 1 | 10/27 | +225 Reality Rift Pull Distance | +225 实相裂隙牵引距离 | `special_bonus_unique_chaos_knight_2` |
| 2 | 15/28 | -3s Chaos Bolt Cooldown | -3秒 混乱之箭冷却 | `special_bonus_unique_chaos_knight_8` |
| 2 | 15/28 | +10 Strength | +10 力量 | `special_bonus_strength_10` |
| 3 | 20/29 | +0.6 Min/Max Chaos Bolt Duration | +0.6秒 混乱之箭最短/最长眩晕 | `special_bonus_unique_chaos_knight_3` |
| 3 | 20/29 | Reality Rift Pierces Spell Immunity | 实相裂隙无视减益免疫 | `special_bonus_unique_chaos_knight` |
| 4 | 25/30 | +10% Chaos Strike Chance | +10% 混沌一击几率 | `special_bonus_unique_chaos_knight_5` |
| 4 | 25/30 | -125% Phantasm Illusion Incoming Damage | -125% 混沌之军幻象承受伤害 | `special_bonus_unique_chaos_knight_7` |

## 米波 Meepo（id 82）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +7 Strength | +7 力量 | `special_bonus_strength_7` |
| 1 | 10/27 | +40 Poof Damage | +40 忽悠伤害 | `special_bonus_unique_meepo_2` |
| 2 | 15/28 | -1.5s Earthbind Cooldown | -1.5秒 地之束缚冷却 | `special_bonus_unique_meepo_3` |
| 2 | 15/28 | +15% Evasion | +15% 闪避 | `special_bonus_evasion_15` |
| 3 | 20/29 | Earthbind grants True Strike on Targets | 攻击地之束缚目标具有克敌机先 | `special_bonus_unique_meepo_4` |
| 3 | 20/29 | +6 Ransack Health Steal | +6 洗劫窃取生命 | `special_bonus_unique_meepo_6` |
| 4 | 25/30 | +400 Health | +400 生命 | `special_bonus_hp_400` |
| 4 | 25/30 | -0.75s Poof Cast Duration | -0.75秒 忽悠施法 | `special_bonus_unique_meepo_poof_cast_point` |

## 树精卫士 Treant Protector（id 83）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +3s Living Armor Duration | +3秒 活体护甲持续时间 | `special_bonus_unique_treant_8` |
| 1 | 10/27 | +50 Base Damage | +50 基础攻击力 | `special_bonus_attack_base_damage_50` |
| 2 | 15/28 | +10% Leech Seed Damage to Healing | +10% 寄生种子伤害转为治疗 | `special_bonus_unique_treant_3` |
| 2 | 15/28 | +25 Nature's Grasp Damage | +25 自然卷握伤害 | `special_bonus_unique_treant_9` |
| 3 | 20/29 | +20 Living Armor Damage Block | +20 活体护甲伤害格挡 | `special_bonus_unique_treant_13` |
| 3 | 20/29 | +80 Leech Seed Bonus Damage | +80 寄生种子额外伤害 | `special_bonus_unique_treant_2` |
| 4 | 25/30 | -3s Leech Seed Cooldown | -3秒 寄生种子冷却 | `special_bonus_unique_treant_14` |
| 4 | 25/30 | 450 AoE Living Armor | 450 范围型活体护甲 | `special_bonus_unique_treant_7` |

## 食人魔魔法师 Ogre Magi（id 84）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +10 Ignite Burn Damage | +10 引燃燃烧伤害 | `special_bonus_unique_ogre_magi_4` |
| 1 | 10/27 | +2/0.01 Dumb Luck Mana/Mana Regen Per Strength | +2/0.01 傻福力量提供魔法/魔法恢复 | `special_bonus_unique_ogre_magi_dumb_luck_mana` |
| 2 | 15/28 | +80 Damage | +80 攻击力 | `special_bonus_attack_damage_80` |
| 2 | 15/28 | +20/35 Bloodlust / Self Attack Speed | +20/35 嗜血术/自身攻速 | `special_bonus_unique_ogre_magi` |
| 3 | 20/29 | +30 Strength | +30 力量 | `special_bonus_strength_30` |
| 3 | 20/29 | +175 Fireblast Damage | +175 火焰爆轰伤害 | `special_bonus_unique_ogre_magi_2` |
| 4 | 25/30 | 17% Fireblast chance on attack | 攻击有17%几率触发火焰爆轰 | `special_bonus_unique_ogre_magi_3` |
| 4 | 25/30 | +10% Multicast Chance | +10% 多重施法几率 | `special_bonus_unique_ogre_magi_multicast_chance` |

## 不朽尸王 Undying（id 85）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +30 Decay Damage | +30 腐朽伤害 | `special_bonus_unique_undying_8` |
| 1 | 10/27 | -15s Tombstone Cooldown | -15秒 墓碑冷却 | `special_bonus_unique_undying_7` |
| 2 | 15/28 | +12 Soul Rip Damage/Heal | +12 噬魂伤害/治疗 | `special_bonus_unique_undying_6` |
| 2 | 15/28 | +20 Zombie Damage | +20 僵尸攻击力 | `special_bonus_unique_undying` |
| 3 | 20/29 | -2s Decay Cooldown | -2秒 腐朽冷却 | `special_bonus_unique_undying_2` |
| 3 | 20/29 | +4 Tombstone Attacks to Destroy | +4 墓碑可攻击次数 | `special_bonus_unique_undying_5` |
| 4 | 25/30 | +50% Flesh Golem Strength Bonus | +50% 血肉傀儡额外力量 | `special_bonus_unique_undying_4` |
| 4 | 25/30 | Tombstone On Death | 死亡时召唤墓碑 | `special_bonus_unique_undying_3` |

## 拉比克 Rubick（id 86）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -2s Telekinesis Cooldown | -2秒 隔空取物冷却 | `special_bonus_unique_rubick_4` |
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 2 | 15/28 | -40% Stolen Spells Mana Cost | 窃取的技能-40% 魔法消耗 | `special_bonus_unique_rubick_6` |
| 2 | 15/28 | -4s Fade Bolt Cooldown | -4秒 弱化能流冷却 | `special_bonus_unique_rubick_3` |
| 3 | 20/29 | +12% Fade Bolt Damage Reduction | +12% 弱化能流攻击力降低 | `special_bonus_unique_rubick_fade_bolt_spell_reduction` |
| 3 | 20/29 | Telekinesis Landing Deals 300 Damage | 隔空取物着陆造成300 伤害 | `special_bonus_unique_rubick_8` |
| 4 | 25/30 | 1.5x Curiosity Bonuses | 1.5倍 奇心加成 | `special_bonus_unique_rubick_curiosity_factor` |
| 4 | 25/30 | +40% Spell Amp For Stolen Spells | 窃取的技能+40% 技能增强 | `special_bonus_unique_rubick_5` |

## 干扰者 Disruptor（id 87）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +20 Movement Speed | +20 移动速度 | `special_bonus_movement_speed_20` |
| 1 | 10/27 | +15 Thunder Strike Damage per Strike | 每次打击+15 风雷之击伤害 | `special_bonus_unique_disruptor_consecutive_strike_damage` |
| 2 | 15/28 | +15%/300 Glimpse Distance To Damage/Max | +15%/300 瞥视距离转为伤害/最高伤害 | `special_bonus_unique_disruptor_9` |
| 2 | 15/28 | +60 Static Storm Max DPS | +60 静态风暴最高每秒伤害 | `special_bonus_unique_disruptor` |
| 3 | 20/29 | +1s Kinetic Field Duration | +1秒 动能力场持续时间 | `special_bonus_unique_disruptor_5` |
| 3 | 20/29 | +75 Static Storm Radius | +75 静态风暴范围 | `special_bonus_unique_disruptor_8` |
| 4 | 25/30 | 2 Glimpse Charges | 2 恶念瞥视能量点数 | `special_bonus_unique_disruptor_4` |
| 4 | 25/30 | +6 Thunder Strike Strikes | +6 风雷之击打击次数 | `special_bonus_unique_disruptor_thunder_strike_strikes` |

## 司夜刺客 Nyx Assassin（id 88）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25% Spiked Carapace Damage Reflect | +25% 尖刺外壳伤害反弹 | `special_bonus_unique_nyx_4` |
| 1 | 10/27 | +0.2s Impale Stun Duration | +0.2秒 穿刺眩晕 | `special_bonus_unique_nyx_3` |
| 2 | 15/28 | +50 Vendetta Damage | +50 复仇伤害 | `special_bonus_unique_nyx_vendetta_damage` |
| 2 | 15/28 | -3s Mind Flare Cooldown | -3秒 神智爆裂冷却 | `special_bonus_unique_nyx_jolt_cooldown` |
| 3 | 20/29 | +0.6s Spiked Carapace Stun Duration | +0.6秒 尖刺外壳眩晕 | `special_bonus_unique_nyx_6` |
| 3 | 20/29 | +140 Impale Damage | +140 穿刺伤害 | `special_bonus_unique_nyx_2` |
| 4 | 25/30 | 600 Mind Flare Radius | 600 范围型神智爆裂 | `special_bonus_unique_nyx` |
| 4 | 25/30 | +80 Agility | +80 敏捷 | `special_bonus_agility_80` |

## 娜迦海妖 Naga Siren（id 89）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +{s:bonus_pull_strength} Reel In Pull Speed | +{s:bonus_pull_strength} 捕捞速度（数值未解析） | `special_bonus_unique_naga_siren_reel_in_speed` |
| 1 | 10/27 | +30% Rip Tide Damage | +30% 激流伤害 | `special_bonus_unique_naga_siren_2` |
| 2 | 15/28 | +10% Mirror Image Damage | +10% 镜像攻击力 | `special_bonus_unique_naga_siren_4` |
| 2 | 15/28 | -75% Mirror Image Illusion Damage Taken | -75% 镜像承受伤害 | `special_bonus_unique_naga_siren_3` |
| 3 | 20/29 | -25s Song of the Siren Cooldown | -25秒 海妖之歌冷却 | `special_bonus_unique_naga_siren_5` |
| 3 | 20/29 | +1 Mirror Image Illusion | +1 镜像幻象 | `special_bonus_unique_naga_siren` |
| 4 | 25/30 | -10s Mirror Image Cooldown | -10秒 镜像冷却 | `special_bonus_unique_naga_siren_6` |
| 4 | 25/30 | +25 Agility | +25 敏捷 | `special_bonus_agility_25` |

## 光之守卫 Keeper of the Light（id 90）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +40% Blinding Light Miss | +40% 致盲之光落空 | `special_bonus_unique_keeper_of_the_light_8` |
| 1 | 10/27 | -2s Illuminate Cooldown | -2秒 冲击波冷却 | `special_bonus_unique_keeper_of_the_light_illuminate_cooldown` |
| 2 | 15/28 | +25% Spirit Form Bright Speed Bonus | +25% 灵魂形态光明速度加成 | `special_bonus_unique_keeper_of_the_light_11` |
| 2 | 15/28 | +90 Blinding Light Damage | +90 致盲之光伤害 | `special_bonus_unique_keeper_of_the_light_5` |
| 3 | 20/29 | +15s Spirit Form Duration | +15秒 灵魂形态持续时间 | `special_bonus_unique_keeper_of_the_light_2` |
| 3 | 20/29 | +10% Solar Bind Magic Resistance Reduction | +10% 炎阳之缚降低魔抗 | `special_bonus_unique_keeper_of_the_light_3` |
| 4 | 25/30 | Chakra Magic Strong Dispels | 查克拉魔法施加强驱散 | `special_bonus_unique_keeper_of_the_light_14` |
| 4 | 25/30 | +200 Illuminate Damage | +200 冲击波伤害 | `special_bonus_unique_keeper_of_the_light` |

## 艾欧 Io（id 91）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5s Overcharge Duration | +1.5秒 过载持续时间 | `special_bonus_unique_wisp_overcharge_duration` |
| 1 | 10/27 | +8 Strength | +8 力量 | `special_bonus_strength_8` |
| 2 | 15/28 | +5% Tether Movement Speed | +5% 羁绊移动速度 | `special_bonus_unique_wisp_3` |
| 2 | 15/28 | +40% Spirits Damage | +40% 幽魂伤害 | `special_bonus_unique_wisp` |
| 3 | 20/29 | +0.2% Overcharge Max HP Regen Bonus | +0.2% 过载最大生命值恢复 | `special_bonus_unique_wisp_10` |
| 3 | 20/29 | -30s Relocate Cooldown | -30秒 降临冷却 | `special_bonus_unique_wisp_6` |
| 4 | 25/30 | -2s Relocate Cast Delay | -2秒 降临施法延迟 | `special_bonus_unique_wisp_relocate_delay` |
| 4 | 25/30 | Attack Tethered Ally's Target (50% damage) | 攻击羁绊友军的目标（50%伤害） | `special_bonus_unique_wisp_4` |

## 维萨吉 Visage（id 92）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -1s Soul Assumption Cooldown | -1秒 灵魂超度冷却 | `special_bonus_unique_visage_soul_assumption_cooldown` |
| 1 | 10/27 | +6 Visage and Familiars Base Damage | +6 维萨吉和佣兽基础攻击力 | `special_bonus_unique_visage_7` |
| 2 | 15/28 | +2s Grave Chill Duration | +2秒 黄泉颤抖持续时间 | `special_bonus_unique_visage_grave_chill_duration` |
| 2 | 15/28 | Soul Assumption Hits 3 Targets | 灵魂超度攻击3个目标 | `special_bonus_unique_visage_3` |
| 3 | 20/29 | +30 Soul Assumption Damage Per Charge | +30 灵魂超度每点灵魂伤害 | `special_bonus_unique_visage_4` |
| 3 | 20/29 | +1 Armor Corruption to Visage and Familiars | +1 维萨吉和佣兽削弱护甲 | `special_bonus_unique_visage_1` |
| 4 | 25/30 | -2s Gravekeeper's Cloak Recovery Time | -2秒 陵卫斗篷恢复时间 | `special_bonus_unique_visage_cloak_recovery_time` |
| 4 | 25/30 | +1 Familiar | +1 佣兽 | `special_bonus_unique_visage_6` |

## 斯拉克 Slark（id 93）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -0.75s Dark Pact Cooldown | -0.75秒 黑暗契约冷却 | `special_bonus_unique_slark_6` |
| 1 | 10/27 | +0.5s Pounce Leash | +0.5秒 突袭束缚 | `special_bonus_unique_slark` |
| 2 | 15/28 | +70 Dark Pact Damage | +70 黑暗契约伤害 | `special_bonus_unique_slark_2` |
| 2 | 15/28 | +30 Shadow Dance Regen | +30 暗影之舞生命恢复 | `special_bonus_unique_slark_8` |
| 3 | 20/29 | +100 Shadow Dance Attack Speed | +100 暗影之舞攻击速度 | `special_bonus_unique_slark_7` |
| 3 | 20/29 | +1 Agility gain/stolen per Essence Shift Stack | +1 能量转移敏捷获取/失去 | `special_bonus_unique_slark_5` |
| 4 | 25/30 | +20s Essence Shift Duration | +20秒 能量转移持续时间 | `special_bonus_unique_slark_4` |
| 4 | 25/30 | +1.5s Shadow Dance Duration | +1.5秒 暗影之舞持续时间 | `special_bonus_unique_slark_3` |

## 美杜莎 Medusa（id 94）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +20% Gorgon's Grasp Radius | +20% 罗网箭阵范围 | `special_bonus_unique_medusa_gorgons_grasp_radius` |
| 1 | 10/27 | +12% Stone Gaze Bonus Physical Damage | +12% 石化凝视额外物理伤害 | `special_bonus_unique_medusa_8` |
| 2 | 15/28 | +1 Gorgon's Grasp Volley | +1 罗网箭阵 | `special_bonus_unique_medusa_gorgons_grasp_volleys` |
| 2 | 15/28 | -4s Mystic Snake Cooldown | -4秒 秘术异蛇冷却 | `special_bonus_unique_medusa_5` |
| 3 | 20/29 | +40% Mystic Snake Damage / Mana Gain | +40% 秘术异蛇伤害/魔法获取 | `special_bonus_unique_medusa_snake_damage` |
| 3 | 20/29 | +12% Split Shot Outgoing Damage | +12% 分裂箭伤害输出 | `special_bonus_unique_medusa_2` |
| 4 | 25/30 | +2.5s Stone Gaze Duration | +2.5秒 石化凝视持续时间 | `special_bonus_unique_medusa` |
| 4 | 25/30 | +40 Intelligence | +40 智力 | `special_bonus_intelligence_40` |

## 巨魔战将 Troll Warlord（id 95）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +2.5s Whirling Axes Debuff Duration | +2.5秒 旋风飞斧负面效果 | `special_bonus_unique_troll_warlord_whirling_axes_debuff_duration` |
| 1 | 10/27 | +20 Berserker's Rage Movement Speed | +20 狂战士之怒移速 | `special_bonus_unique_troll_warlord_2` |
| 2 | 15/28 | +4 Fervor Attack Speed | +4 热血战魂每层攻速 | `special_bonus_unique_troll_warlord_5` |
| 2 | 15/28 | +1s Battle Trance Duration | +1秒 战斗专注持续时间 | `special_bonus_unique_troll_warlord` |
| 3 | 20/29 | Allies Receive Battle Trance Attack Speed | 友军获得战斗专注攻击速度 | `special_bonus_unique_troll_warlord_battle_trance_movespeed` |
| 3 | 20/29 | +160 Whirling Axes Damage | +160 旋风飞斧伤害 | `special_bonus_unique_troll_warlord_3` |
| 4 | 25/30 | Whirling Axes Pierce Magic Immunity | 旋风飞斧无视减益免疫 | `special_bonus_unique_troll_warlord_6` |
| 4 | 25/30 | Battle Trance Strong Dispels | 战斗专注带强驱散 | `special_bonus_unique_troll_warlord_4` |

## 半人马战行者 Centaur Warrunner（id 96）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +4 Health Regen | +4 生命恢复 | `special_bonus_hp_regen_4` |
| 1 | 10/27 | +15 Movement Speed | +15 移动速度 | `special_bonus_movement_speed_15` |
| 2 | 15/28 | +10 Strength | +10 力量 | `special_bonus_strength_10` |
| 2 | 15/28 | +30% Double Edge Strength Damage | +30% 双刃剑力量伤害 | `special_bonus_unique_centaur_4` |
| 3 | 20/29 | +45 Retaliate Damage | +45 反伤伤害 | `special_bonus_unique_centaur_3` |
| 3 | 20/29 | -25s Stampede Cooldown | -25秒 奔袭冲撞冷却 | `special_bonus_unique_centaur_5` |
| 4 | 25/30 | Gains Retaliate Aura | 反伤变成光环 | `special_bonus_unique_centaur_1` |
| 4 | 25/30 | +1s Hoof Stomp Duration | +1秒 马蹄践踏眩晕 | `special_bonus_unique_centaur_2` |

## 马格纳斯 Magnus（id 97）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 1 | 10/27 | +1.25s Skewer Slow Duration | +1.25秒 巨角冲撞减速 | `special_bonus_unique_magnus_6` |
| 2 | 15/28 | +14 All Attributes per hero hit with Reverse Polarity | 两极反转每击中一名英雄+14 全属性 | `special_bonus_unique_magnus_reverse_polarity_stats` |
| 2 | 15/28 | -5s Skewer Cooldown | -5秒 巨角冲撞冷却 | `special_bonus_unique_magnus_7` |
| 3 | 20/29 | +125 Shockwave Damage | +125 震荡波伤害 | `special_bonus_unique_magnus` |
| 3 | 20/29 | +15% Skewer Damage Per Distance Travelled | +15% 巨角冲撞行进距离伤害 | `special_bonus_unique_magnus_skewer_damage_distance` |
| 4 | 25/30 | Shockwave Returns to Magnus | 震荡波回归马格纳斯 | `special_bonus_unique_magnus_2` |
| 4 | 25/30 | +0.8s Reverse Polarity Stun Duration | +0.8秒 两极反转眩晕 | `special_bonus_unique_magnus_5` |

## 伐木机 Timbersaw（id 98）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.25 Reactive Armor Regeneration Per Stack | +0.25 活性护甲生命恢复 | `special_bonus_unique_timbersaw_reactive_armor_regen_per_stack` |
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 2 | 15/28 | +2% Whirling Death Stat Loss | +2% 死亡旋风属性损失 | `special_bonus_unique_timbersaw_5` |
| 2 | 15/28 | +6 Max / +1 Hero Attack Reactive Armor Stacks | +6/+1 活性护甲最大/英雄攻击叠加 | `special_bonus_unique_timbersaw_2` |
| 3 | 20/29 | Exposure Therapy Heals for 12 HP Per Tree Destroyed | 暴露疗法每摧毁一棵树木回复12点生命 | `special_bonus_unique_timbersaw_exposure_therapy_health` |
| 3 | 20/29 | +6% Chakram Slow | +6% 锯齿飞轮减速 | `special_bonus_unique_timbersaw_4` |
| 4 | 25/30 | +75 Whirling Death Tree Bonus Damage | +75 死亡旋风树倒额外伤害 | `special_bonus_unique_timbersaw` |
| 4 | 25/30 | +75% Timber Chain Range/Projectile Speed | +75% 伐木锯链距离/发射速度 | `special_bonus_unique_timbersaw_3` |

## 钢背兽 Bristleback（id 99）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25 Attack Speed | +25 攻击速度 | `special_bonus_attack_speed_25` |
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 2 | 15/28 | +250 Goo Cast Range | +250 粘稠鼻液施法距离 | `special_bonus_unique_bristleback_5` |
| 2 | 15/28 | +8%/4% Bristleback Back/Side Damage Reduction | +8/4% 钢毛后背背面/侧面减伤 | `special_bonus_unique_bristleback_6` |
| 3 | 20/29 | +25 Health Regen | +25 生命恢复 | `special_bonus_hp_regen_25` |
| 3 | 20/29 | +20 Quill Stack Damage | +20 刺针叠加伤害 | `special_bonus_unique_bristleback_2` |
| 4 | 25/30 | -30 Bristleback Damage Threshold | -30 钢毛后背伤害临界值 | `special_bonus_unique_bristleback` |
| 4 | 25/30 | +18 Warpath Damage Per Stack | +18 战意叠加攻击力 | `special_bonus_unique_bristleback_3` |

## 巨牙海民 Tusk（id 100）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +2s Tag Team Duration | +2秒 摔角行家持续时间 | `special_bonus_unique_tusk_3` |
| 1 | 10/27 | +0.75s Walrus Punch Stun Duration | +0.75秒 海象神拳！眩晕 | `special_bonus_unique_tusk_7` |
| 2 | 15/28 | +325 Health | +325 生命 | `special_bonus_hp_325` |
| 2 | 15/28 | +120 Snowball Damage | +120 雪球伤害 | `special_bonus_unique_tusk_2` |
| 3 | 20/29 | -6s Snowball Cooldown | -6秒 雪球冷却 | `special_bonus_unique_tusk_6` |
| 3 | 20/29 | +75% Walrus Punch Crit | +75% 海象神拳！暴击 | `special_bonus_unique_tusk` |
| 4 | 25/30 | Ice Shards slow by 50% and deal 110 DPS | 寒冰碎片减速50%并造成110每秒伤害 | `special_bonus_unique_tusk_shard_dps` |
| 4 | 25/30 | 12% Chance Walrus Punch | 普攻有12%几率触发海象神拳！ | `special_bonus_unique_tusk_4` |

## 天怒法师 Skywrath Mage（id 101）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 1 | 10/27 | +125 Arcane Bolt Cast Range | +125 奥法鹰隼施法距离 | `special_bonus_unique_skywrath_6` |
| 2 | 15/28 | -6s Ancient Seal Cooldown | -6秒 上古封印冷却 | `special_bonus_unique_skywrath` |
| 2 | 15/28 | +20% Concussive Shot Slow | +20% 震荡光弹减速 | `special_bonus_unique_skywrath_concussive_shot_slow` |
| 3 | 20/29 | Global Concussive Shot | 全屏震荡光弹 | `special_bonus_unique_skywrath_4` |
| 3 | 20/29 | +10% Ancient Seal Increased Magic Damage | +10% 上古封印加深魔法伤害 | `special_bonus_unique_skywrath_3` |
| 4 | 25/30 | +1.5x Arcane Bolt Int Multiplier | +1.5 奥法鹰隼智力系数 | `special_bonus_unique_skywrath_2` |
| 4 | 25/30 | +400 Mystic Flare Damage | +400 神秘之耀伤害 | `special_bonus_unique_skywrath_5` |

## 亚巴顿 Abaddon（id 102）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +30 Curse of Avernus DPS | +30 魔霭诅咒每秒伤害 | `special_bonus_unique_abaddon_5` |
| 1 | 10/27 | Aphotic Shield provides +8 HP Regen | 无光之盾提供+8 生命恢复 | `special_bonus_unique_abaddon_7` |
| 2 | 15/28 | -10s Borrowed Time Cooldown | -10秒 回光返照冷却 | `special_bonus_unique_abaddon_borrowed_time_cd` |
| 2 | 15/28 | +35 Mist Coil Damage / Heal | +35 迷雾缠绕伤害/治疗 | `special_bonus_unique_abaddon_2` |
| 3 | 20/29 | +80 Aphotic Shield Barrier Amount | +80 无光之盾护盾数值 | `special_bonus_unique_abaddon` |
| 3 | 20/29 | 100 Borrowed Time Immolation DPS | 100 回光返照献祭每秒伤害 | `special_bonus_unique_abaddon_immolation` |
| 4 | 25/30 | +65 Curse of Avernus Attack Speed Bonus | +65 魔霭诅咒攻速加成 | `special_bonus_unique_abaddon_3` |
| 4 | 25/30 | 350 AoE Mist Coil | 350 范围型迷雾缠绕 | `special_bonus_unique_abaddon_4` |

## 上古巨神 Elder Titan（id 103）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +2.5% Astral Spirit Bonus Move Speed Per Hero | +2.5% 灵体游魂触碰英雄移速 | `special_bonus_unique_elder_titan_bonus_spirit_speed` |
| 1 | 10/27 | +150 Echo Stomp Wake Damage | +150 回音重踏唤醒伤害 | `special_bonus_unique_elder_titan_4` |
| 2 | 15/28 | +75 Echo Stomp Damage | +75 回音重踏伤害 | `special_bonus_unique_elder_titan_2` |
| 2 | 15/28 | 20% of Bonus Movement Speed as Attack Speed | 20%移速加成转为攻速 | `special_bonus_unique_elder_titan_momentum_attack_speed` |
| 3 | 20/29 | +30 Astral Spirit Bonus Damage per Hero | +30 灵体游魂触碰英雄攻击力 | `special_bonus_unique_elder_titan` |
| 3 | 20/29 | +150 Natural Order Radius | +150 自然秩序范围 | `special_bonus_unique_elder_titan_5` |
| 4 | 25/30 | -60s Earth Splitter Cooldown | -60秒 裂地沟壑冷却 | `special_bonus_unique_elder_titan_3` |
| 4 | 25/30 | +100% Cleave | +100% 分裂 | `special_bonus_cleave_100` |

## 军团指挥官 Legion Commander（id 104）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -2s Overwhelming Odds Cooldown | -2秒 压倒性优势冷却 | `special_bonus_unique_legion_commander_9` |
| 1 | 10/27 | +1 Outfight Them! Armor | +1 迎难而上！护甲 | `special_bonus_unique_legion_commander_outfight_them_armor` |
| 2 | 15/28 | +40 Press The Attack HP Regen | +40 强攻生命恢复 | `special_bonus_unique_legion_commander_6` |
| 2 | 15/28 | +35 Overwhelming Odds Damage per Hero | +35 压倒性优势英雄提供伤害 | `special_bonus_unique_legion_commander_4` |
| 3 | 20/29 | +0.75s Duel Duration | +0.75秒 决斗持续时间 | `special_bonus_unique_legion_commander_duel_duration` |
| 3 | 20/29 | -1 Moment of Courage Attacks To Trigger | -1 勇气之霎触发需攻击次数 | `special_bonus_unique_legion_commander_3` |
| 4 | 25/30 | +100% Moment of Courage Lifesteal | +100% 勇气之霎吸血 | `special_bonus_unique_legion_commander_7` |
| 4 | 25/30 | Duel Advances Cooldown by 30s On Victory | 决斗胜利时减少30秒冷却 | `special_bonus_unique_legion_commander_duel_refresh_on_victory` |

## 工程师 Techies（id 105）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1* | 10/27 | +15% Magic Resistance | +15% 魔法抗性 | `special_bonus_magic_resistance_15` |
| 1 | 10/27 | -2s Proximity Mines Cooldown | -2秒 感应地雷充能 | `special_bonus_unique_techies_3` |
| 2 | 15/28 | +175 Blast Off! Damage | +175 爆破起飞！伤害 | `special_bonus_unique_techies` |
| 2 | 15/28 | +25% Reactive Tazer Buff and Disarm Duration | +25% 活性电击加成/缴械时间 | `special_bonus_unique_techies_tazer_duration` |
| 3 | 20/29 | +160 Sticky Bomb Damage | +160 粘性炸弹伤害 | `special_bonus_unique_techies_2` |
| 3 | 20/29 | -15s Blast Off! Cooldown | -15秒 爆破起飞！冷却 | `special_bonus_unique_techies_5` |
| 4 | 25/30 | +253 Damage | +253 攻击力 | `special_bonus_attack_damage_253` |
| 4 | 25/30 | -0.8s Proximity Mines Activation Delay | -0.8秒 感应地雷启动延迟 | `special_bonus_unique_techies_4` |

## 灰烬之灵 Ember Spirit（id 106）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +12 Damage | +12 攻击力 | `special_bonus_attack_damage_12` |
| 1 | 10/27 | +165 Flame Guard Barrier Amount | +165 烈火罩护盾数值 | `special_bonus_unique_ember_spirit_1` |
| 2 | 15/28 | +100% Flame Guard Damage Per Second | +100% 烈火罩每秒伤害 | `special_bonus_unique_ember_spirit_3` |
| 2 | 15/28 | +0.8s Searing Chains Duration | +0.8秒 炎阳索持续时间 | `special_bonus_unique_ember_spirit_2` |
| 3 | 20/29 | +50 Sleight of Fist Hero Damage | +50 无影拳对英雄伤害 | `special_bonus_unique_ember_spirit_6` |
| 3 | 20/29 | +50 Searing Chains Damage | +50 炎阳索伤害 | `special_bonus_unique_ember_spirit_chains_dps` |
| 4 | 25/30 | 2 Sleight of Fist Charges | 2 无影拳能量点数 | `special_bonus_unique_ember_spirit_4` |
| 4 | 25/30 | -12s Remnant Charge Restore Time | -12秒 残焰充能 | `special_bonus_unique_ember_spirit_5` |

## 大地之灵 Earth Spirit（id 107）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | -2s Boulder Smash Cooldown | -2秒 巨石冲击冷却 | `special_bonus_unique_earth_spirit_7` |
| 1 | 10/27 | +150 Rolling Boulder Distance | +150 巨石翻滚距离 | `special_bonus_unique_earth_spirit_4` |
| 2 | 15/28 | +0.3s Rolling Boulder Stun Duration | +0.3秒 巨石翻滚眩晕 | `special_bonus_unique_earth_spirit_rolling_boulder_stun` |
| 2 | 15/28 | +80 Boulder Smash Damage | +80 巨石冲击伤害 | `special_bonus_unique_earth_spirit_6` |
| 3 | 20/29 | +35 Magnetize Damage Per Second | +35 磁化每秒伤害 | `special_bonus_unique_earth_spirit_8` |
| 3 | 20/29 | +250% Rolling Boulder Damage from Strength | +250% 巨石翻滚力量值伤害 | `special_bonus_unique_earth_spirit` |
| 4 | 25/30 | +200 Geomagnetic Grip Remnant Damage | +200 地磁之握残岩伤害 | `special_bonus_unique_earth_spirit_5` |
| 4 | 25/30 | Earth Spirit Magnetizes himself | 大地之灵磁化自身 | `special_bonus_unique_earth_spirit_2` |

## 孽主 Underlord（id 108）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +5% Invading Force Movement Bonus/Damage Reduction | +5% 侵略大军移速加成/承伤降低 | `special_bonus_unique_underlord_7` |
| 1 | 10/27 | +15s Atrophy Aura Duration | +15秒 衰退光环持续时间 | `special_bonus_unique_underlord_8` |
| 2 | 15/28 | Pit of Malice Slows by 20% | 怨念深渊造成20%减速 | `special_bonus_unique_underlord_6` |
| 2 | 15/28 | -5s Firestorm Cooldown | -5秒 火焰风暴冷却 | `special_bonus_unique_underlord_5` |
| 3 | 20/29 | +0.6% Firestorm Burn Damage | +0.6% 火焰风暴烧灼伤害 | `special_bonus_unique_underlord_4` |
| 3 | 20/29 | +10% Atrophy Aura Attack Damage Reduction/Gain | +10% 衰退光环降低/获得攻击力 | `special_bonus_unique_underlord_3` |
| 4 | 25/30 | +0.4s Pit of Malice Root | +0.4秒 怨念深渊缠绕 | `special_bonus_unique_underlord` |
| 4 | 25/30 | 160 DPS in 700 Radius Around Fiend's Gate | 恶魔之扉对700范围内造成每秒160伤害 | `special_bonus_unique_underlord_9` |

## 恐怖利刃 Terrorblade（id 109）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Reflection Duration | +1秒 倒影持续时间 | `special_bonus_unique_terrorblade_2` |
| 1 | 10/27 | -2s Conjure Image Cooldown | -2秒 惑幻冷却 | `special_bonus_unique_terrorblade_4` |
| 2 | 15/28 | -10s Metamorphosis Cooldown | -10秒 魔化冷却 | `special_bonus_unique_terrorblade_metamorphosis_cooldown` |
| 2 | 15/28 | -25% Sunder Minimum HP Swap | -25% 魂断后最低生命值 | `special_bonus_unique_terrorblade_sunder_hp_threshold` |
| 3 | 20/29 | +10 All Attributes | +10 全属性 | `special_bonus_all_stats_10` |
| 3 | 20/29 | +8s Conjure Image Duration | +8秒 惑幻持续时间 | `special_bonus_unique_terrorblade_5` |
| 4 | 25/30 | -30s Sunder Cooldown | -30秒 魂断冷却 | `special_bonus_unique_terrorblade` |
| 4 | 25/30 | +30s Metamorphosis Duration | +30秒 魔化持续时间 | `special_bonus_unique_terrorblade_3` |

## 凤凰 Phoenix（id 110）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25% Icarus Dive Slow | +25% 凤凰冲击减速 | `special_bonus_unique_phoenix_6` |
| 1 | 10/27 | +1% Dying Light Missing Health as Damage | +1% 消逝之光缺失生命值伤害 | `special_bonus_unique_phoenix_dying_light_damage` |
| 2 | 15/28 | +20 Fire Spirits Damage Per Second | +20 烈火精灵每秒伤害 | `special_bonus_unique_phoenix_3` |
| 2 | 15/28 | +25 Health Regen | +25 生命恢复 | `special_bonus_hp_regen_25` |
| 3 | 20/29 | +1.25% Max Health Sun Ray Damage | +1.25% 烈日炙烤最大生命值伤害 | `special_bonus_unique_phoenix_5` |
| 3 | 20/29 | +0.6s Supernova Stun Duration | +0.6秒 超新星眩晕 | `special_bonus_unique_phoenix_2` |
| 4 | 25/30 | +2 Supernova Hit Count | +2 超新星可被攻击次数 | `special_bonus_unique_phoenix_1` |
| 4 | 25/30 | +1000 Icarus Dive Cast Range | +1000 凤凰冲击施法距离 | `special_bonus_unique_phoenix_4` |

## 神谕者 Oracle（id 111）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +0.5s Fortune's End Duration | +0.5秒 气运之末持续时间 | `special_bonus_unique_oracle_2` |
| 1 | 10/27 | +8 Armor False Promise | +8 虚妄之诺护甲 | `special_bonus_unique_oracle_9` |
| 2 | 15/28 | +100 Fortune's End Radius | +100 气运之末作用范围 | `special_bonus_unique_oracle_3` |
| 2 | 15/28 | +25% Purifying Flames Enemy Damage | +25% 涤罪之焰对敌人伤害 | `special_bonus_unique_oracle_8` |
| 3 | 20/29 | -20s False Promise Cooldown | -20秒 虚妄之诺冷却 | `special_bonus_unique_oracle_6` |
| 3 | 20/29 | -1s Purifying Flames Cooldown | -1秒 涤罪之焰冷却 | `special_bonus_unique_oracle_5` |
| 4 | 25/30 | Fortune's End constantly Dispels | 气运之末持续驱散 | `special_bonus_unique_oracle_7` |
| 4 | 25/30 | +1.5s False Promise Duration | +1.5秒 虚妄之诺持续时间 | `special_bonus_unique_oracle` |

## 寒冬飞龙 Winter Wyvern（id 112）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15 Cold Embrace Base Heal Per Second | +15 极寒之拥基础每秒治疗 | `special_bonus_unique_winter_wyvern_5` |
| 1* | 10/27 | +30 Damage | +30 攻击力 | `special_bonus_attack_damage_30` |
| 2 | 15/28 | +3s Arctic Burn Debuff Duration | +3秒 严寒烧灼负面效果 | `special_bonus_unique_winter_wyvern_6` |
| 2 | 15/28 | +175 Splinter Blast Shatter Radius | +175 碎裂冲击碎裂范围 | `special_bonus_unique_winter_wyvern_2` |
| 3 | 20/29 | +10% Arctic Burn Slow | +10% 严寒烧灼减速 | `special_bonus_unique_winter_wyvern_1` |
| 3 | 20/29 | +100 Splinter Blast Damage | +100 碎裂冲击伤害 | `special_bonus_unique_winter_wyvern_7` |
| 4 | 25/30 | +60 Winter's Curse Attack Speed | +60 寒冬诅咒攻击速度 | `special_bonus_unique_winter_wyvern_3` |
| 4 | 25/30 | Splinter Blast 1s Stun | 碎裂冲击造成1秒眩晕 | `special_bonus_unique_winter_wyvern_4` |

## 天穹守望者 Arc Warden（id 113）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +200 Flux Cast Range | +200 乱流施法距离 | `special_bonus_unique_arc_warden_5` |
| 1 | 10/27 | +200 Health | +200 生命 | `special_bonus_hp_200` |
| 2 | 15/28 | +20% Flux Slow | +20% 乱流减速 | `special_bonus_unique_arc_warden_4` |
| 2 | 15/28 | +25 Magnetic Field Attack Speed | +25 磁场攻击速度 | `special_bonus_unique_arc_warden_3` |
| 3 | 20/29 | -4s Magnetic Field Cooldown | -4秒 磁场冷却 | `special_bonus_unique_arc_warden_9` |
| 3 | 20/29 | +240 Spark Wraith Damage | +240 闪光幽魂伤害 | `special_bonus_unique_arc_warden` |
| 4 | 25/30 | +30s Spark Wraith Duration | +30秒 闪光幽魂持续时间 | `special_bonus_unique_arc_warden_7` |
| 4 | 25/30 | +1 Runic Infusion All Attributes Bonus | +1 神符灌注全属性 | `special_bonus_unique_arc_warden_8` |

## 齐天大圣 Monkey King（id 114）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +300 Tree Dance Cast Range | +300 丛林之舞施法距离 | `special_bonus_unique_monkey_king_7` |
| 1 | 10/27 | +0.2s Boundless Strike Stun Duration | +0.2秒 擎天一击眩晕 | `special_bonus_unique_monkey_king_9` |
| 2 | 15/28 | 0 Cooldown Primal Spring | 乾坤之跃无冷却 | `special_bonus_unique_monkey_king_8` |
| 2 | 15/28 | +110 Jingu Mastery Damage | +110 如意棒法攻击力 | `special_bonus_unique_monkey_king_2` |
| 3 | 20/29 | Jingu Mastery Undispellable | 如意棒法不可驱散 | `special_bonus_unique_monkey_king_3` |
| 3 | 20/29 | +60% Boundless Strike Critical Damage | +60% 擎天一击暴击伤害 | `special_bonus_unique_monkey_king_10` |
| 4 | 25/30 | -1 Jingu Mastery Required Hits | -1 如意棒法需攻击次数 | `special_bonus_unique_monkey_king_11` |
| 4 | 25/30 | Additional Wukong's Command Ring | 猴子猴孙额外圆阵 | `special_bonus_unique_monkey_king_6` |

## 邪影芳灵 Dark Willow（id 119）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1s Bedlam Duration | +1秒 作祟持续时间 | `special_bonus_unique_dark_willow_6` |
| 1 | 10/27 | +12 Intelligence | +12 智力 | `special_bonus_intelligence_12` |
| 2 | 15/28 | +30 Bedlam Damage | +30 作祟伤害 | `special_bonus_unique_dark_willow_4` |
| 2 | 15/28 | -20s Terrorize Cooldown | -20秒 恐吓冷却 | `special_bonus_unique_dark_willow_7` |
| 3 | 20/29 | +1.5s Shadow Realm Duration | +1.5秒 暗影之境持续时间 | `special_bonus_unique_dark_willow_1` |
| 3 | 20/29 | -7s Bramble Maze CD | -7秒 荆棘迷宫冷却 | `special_bonus_unique_dark_willow_3` |
| 4 | 25/30 | +2 Bedlam Attack Targets | +2 作祟攻击目标 | `special_bonus_unique_dark_willow_bedlam_targets` |
| 4 | 25/30 | 500 Terrorize Impact Damage | 500 恐吓击中伤害 | `special_bonus_unique_dark_willow_2` |

## 石鳞剑士 Pangolier（id 120）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +2 Lucky Shot Armor Reduction | +2 幸运一击降低护甲 | `special_bonus_unique_pangolier_luckyshot_armor` |
| 1 | 10/27 | +200 Swashbuckle Slash Range | +200 虚张声势刺击距离 | `special_bonus_unique_pangolier` |
| 2 | 15/28 | -2s Swashbuckle Cooldown | -2秒 虚张声势冷却 | `special_bonus_unique_pangolier_4` |
| 2 | 15/28 | +125 Shield Crash Barrier | +125 甲盾冲击护盾 | `special_bonus_unique_pangolier_shield_crash_herostacks` |
| 3 | 20/29 | +2s Rolling Thunder Duration | +2秒 地雷滚滚持续时间 | `special_bonus_unique_pangolier_6` |
| 3 | 20/29 | -1.5s Shield Crash Cooldown | -1.5秒 甲盾冲击冷却 | `special_bonus_unique_pangolier_shield_crash_cooldown` |
| 4 | 25/30 | +20% Attack Damage as Swashbuckle Damage | 虚张声势+20% 攻击伤害 | `special_bonus_unique_pangolier_3` |
| 4 | 25/30 | -15s Rolling Thunder Cooldown | -15秒 地雷滚滚冷却 | `special_bonus_unique_pangolier_5` |

## 天涯墨客 Grimstroke（id 121）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +65 Phantom's Embrace DPS | +65 戾影每秒伤害 | `special_bonus_unique_grimstroke_8` |
| 1 | 10/27 | -4s Ink Swell Cooldown | -4秒 墨涌冷却 | `special_bonus_unique_grimstroke_7` |
| 2 | 15/28 | +25% Soulbind Spell Damage | 缚魂下技能伤害+25% | `special_bonus_unique_grimstroke_soul_chain_reflect_damage` |
| 2 | 15/28 | +15% Ink Swell Movement Speed | +15% 墨涌移动速度 | `special_bonus_unique_grimstroke_6` |
| 3 | 20/29 | +80% Stroke of Fate Damage | +80% 绝笔伤害 | `special_bonus_unique_grimstroke_2` |
| 3 | 20/29 | +2 Attacks to Destroy Phantom | +2 戾影可攻击次数 | `special_bonus_unique_grimstroke_4` |
| 4 | 25/30 | +150 Ink Swell Radius | +150 墨涌范围 | `special_bonus_unique_grimstroke_1` |
| 4 | 25/30 | +70% Stroke of Fate Speed and Travel Range | +70% 绝笔速度和距离 | `special_bonus_unique_grimstroke_3` |

## 森海飞霞 Hoodwink（id 123）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +50 Bushwhack Damage | +50 野地奇袭伤害 | `special_bonus_unique_hoodwink_bushwhack_damage` |
| 1 | 10/27 | +175 Health | +175 生命 | `special_bonus_hp_175` |
| 2 | 15/28 | +1 Scurry Ability Charge | +1 密林奔走能量点数 | `special_bonus_unique_hoodwink_scurry_charges` |
| 2 | 15/28 | +10 Agility | +10 敏捷 | `special_bonus_agility_10` |
| 3 | 20/29 | Sharpshooter Provides Vision While Charging | 一箭穿心蓄力期间提供视野 | `special_bonus_unique_hoodwink_sharpshooter_vision` |
| 3 | 20/29 | +2 Acorn Shot Bounces | +2 爆栗出击弹射 | `special_bonus_unique_hoodwink_acorn_shot_bounces` |
| 4 | 25/30 | +400 Sharpshooter Max Damage | +400 一箭穿心最大伤害 | `special_bonus_unique_hoodwink_sharpshooter_damage` |
| 4 | 25/30 | 2 Acorn Shot Charges | 2 爆栗出击能量点数 | `special_bonus_unique_hoodwink_acorn_shot_charges` |

## 虚无之灵 Void Spirit（id 126）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 1 | 10/27 | +40 Resonant Pulse Damage | +40 共鸣脉冲伤害 | `special_bonus_unique_void_spirit_4` |
| 2 | 15/28 | +20% Resonant Pulse Barrier | +20% 共鸣脉冲护盾 | `special_bonus_unique_void_spirit_resonant_pulse_barrier` |
| 2 | 15/28 | +65 Aether Remnant Damage | +65 残阴伤害 | `special_bonus_unique_void_spirit_2` |
| 3 | 20/29 | Outer Dissimilate Ring | 异化增加部分外圈 | `special_bonus_unique_void_spirit_dissimilate_outerring` |
| 3 | 20/29 | -3s Astral Step Charge Restore Time | -3秒 太虚之径充能 | `special_bonus_unique_void_spirit_1` |
| 4 | 25/30 | 140% Astral Step Crit | 140% 太虚之径暴击 | `special_bonus_unique_void_spirit_8` |
| 4 | 25/30 | Dissimilate Roots for 2s | 异化造成2秒缠绕 | `special_bonus_unique_void_spirit_3` |

## 电炎绝手 Snapfire（id 128）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +70 Scatterblast Damage | +70 电光石火伤害 | `special_bonus_unique_snapfire_7` |
| 1 | 10/27 | +30 Mortimer Kisses Burn DPS | +30 蜥蜴绝吻烧灼每秒伤害 | `special_bonus_unique_snapfire_5` |
| 2 | 15/28 | +2 Lil' Shredder attacks | +2 霹雳铁手攻击次数 | `special_bonus_unique_snapfire_2` |
| 2* | 15/28 | +125 Cast Range | +125 施法距离 | `special_bonus_cast_range_125` |
| 3 | 20/29 | +2 Lil' Shredder Targets | +2 霹雳铁手目标 | `special_bonus_unique_snapfire_8` |
| 3 | 20/29 | 2 Firesnap Cookie Charges | 2 龙炎饼干能量点数 | `special_bonus_unique_snapfire_firesnap_cookie_additional_charge` |
| 4 | 25/30 | +60% Lil' Shredder Attack Damage | +60% 霹雳铁手攻击伤害 | `special_bonus_unique_snapfire_6` |
| 4 | 25/30 | +6 Mortimer Kisses Launched | +6 蜥蜴绝吻喷吐 | `special_bonus_unique_snapfire_1` |

## 玛尔斯 Mars（id 129）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +100 God's Rebuke Distance | +100 神之谴戒距离 | `special_bonus_unique_mars_rebuke_radius` |
| 1 | 10/27 | +1.5 Mana Regen | +1.5 魔法恢复 | `special_bonus_mp_regen_150` |
| 2 | 15/28 | -2.5s God's Rebuke Cooldown | -2.5秒 神之谴戒冷却 | `special_bonus_unique_mars_rebuke_cooldown` |
| 2 | 15/28 | +100 Spear Of Mars Damage | +100 战神迅矛伤害 | `special_bonus_unique_mars_spear_bonus_damage` |
| 3 | 20/29 | +70 Arena Of Blood Spear Damage | +70 热血竞技场战矛伤害 | `special_bonus_unique_mars_arena_of_blood_damage` |
| 3 | 20/29 | +0.5s Spear of Mars Stun | +0.5秒 战神迅矛眩晕 | `special_bonus_unique_mars_spear_stun_duration` |
| 4 | 25/30 | God's Rebuke +65% Crit | +65% 神之谴戒致命一击 | `special_bonus_unique_mars_gods_rebuke_extra_crit` |
| 4 | 25/30 | Arena Of Blood Grants Team +180 HP Regen | 热血竞技场+180 生命恢复 | `special_bonus_unique_mars_arena_of_blood_hp_regen` |

## 百戏大王 Ringmaster（id 131）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1 Impalement Arts Charge | +1 尖刀戏能量点数 | `special_bonus_unique_ringmaster_dagger_charge` |
| 1 | 10/27 | +75 Tame the Beasts Radius | +75 驯兽术作用范围 | `special_bonus_unique_ringmaster_whip_radius` |
| 2 | 15/28 | Impalement Arts Penetrates One Target | 尖刀戏会穿过一个目标 | `special_bonus_unique_ringmaster_dagger_penetrates` |
| 2 | 15/28 | Debuff Immunity While Channeling Tame the Beasts | 驯兽术持续施法时减益免疫 | `special_bonus_unique_ringmaster_whip_debuff_immunity` |
| 3 | 20/29 | +1s Impalement Arts Bleed and Slow Duration | +1秒 尖刀戏流血和减速时间 | `special_bonus_unique_ringmaster_dagger_bleed_and_slow_duration` |
| 3 | 20/29 | +75/+300 Tame the Beasts Min/Max Damage | +75/+300 驯兽术最低/最高伤害 | `special_bonus_unique_ringmaster_whip_damage` |
| 4 | 25/30 | +150 Wheel of Wonder Radius and Range | +150 奇观轮范围和距离 | `special_bonus_unique_ringmaster_wheel_radius` |
| 4 | 25/30 | Escape Act Grants Strong Dispel and Flying | 逃生技提供强驱散和飞行状态 | `special_bonus_unique_ringmaster_the_box_strong_dispel_and_flying` |

## 破晓辰星 Dawnbreaker（id 135）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +25% Luminosity Critical Strike Damage | +25% 熠熠生辉暴击伤害 | `special_bonus_unique_dawnbreaker_luminosity_crit` |
| 1 | 10/27 | Celestial Hammer Trail Grants Movement Speed to Allies | 上界重锤路径向友军提供移速加成 | `special_bonus_unique_dawnbreaker_celestial_hammer_targets_allies` |
| 2 | 15/28 | +40% Celestial Hammer Trail/Hammer Damage | +40% 上界重锤路径/战锤伤害 | `special_bonus_unique_dawnbreaker_celestial_hammer_damage` |
| 2 | 15/28 | -20s Solar Guardian Cooldown | -20秒 天光现世冷却 | `special_bonus_unique_dawnbreaker_solar_guardian_cooldown` |
| 3 | 20/29 | +150 Solar Guardian Radius | +150 天光现世范围 | `special_bonus_unique_dawnbreaker_solar_guardian_radius` |
| 3 | 20/29 | -1 Luminosity Attacks Required | -1 熠熠生辉所需攻击次数 | `special_bonus_unique_dawnbreaker_luminosity_attack_count` |
| 4 | 25/30 | -4s Starbreaker Cooldown | -4秒 星破天惊冷却 | `special_bonus_unique_dawnbreaker_fire_wreath_cooldown` |
| 4 | 25/30 | +80% Celestial Hammer Cast Range/Speed | +80% 上界重锤距离/速度 | `special_bonus_unique_dawnbreaker_celestial_hammer_cast_range` |

## 玛西 Marci（id 136）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +1.5s Dispose Slow Duration | +1.5秒 过肩摔减速 | `special_bonus_unique_marci_dispose_slow` |
| 1 | 10/27 | +50 Rebound Landing Radius | +50 回身踢落地范围 | `special_bonus_unique_marci_rebound_radius` |
| 2 | 15/28 | +115 Dispose Damage | +115 过肩摔伤害 | `special_bonus_unique_marci_grapple_damage` |
| 2 | 15/28 | +12% Bodyguard Damage | +12% 护卫术攻击力 | `special_bonus_unique_marci_guardian_damage` |
| 3 | 20/29 | +0.75s Rebound Stun Duration | +0.75秒 回身踢眩晕 | `special_bonus_unique_marci_grapple_stun_duration` |
| 3 | 20/29 | +15% Unleash Movement Speed | +15% 怒拳破移动速度 | `special_bonus_unique_marci_unleash_speed` |
| 4 | 25/30 | Unleash Duration Extended By 6s On Kill | 怒拳破击杀后延长6秒 | `special_bonus_unique_marci_unleash_extend_duration` |
| 4 | 25/30 | Bodyguard Strong Dispels | 护卫术强驱散 | `special_bonus_unique_marci_guardian_strong_dispel` |

## 獸 Primal Beast（id 137）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1* | 10/27 | +25 Damage | +25 攻击力 | `special_bonus_attack_damage_25` |
| 1 | 10/27 | +25% Magic Resistance During Trample | 踏期间+25% 魔法抗性 | `special_bonus_unique_primal_beast_trample_magic_resist` |
| 2 | 15/28 | -5s Trample Cooldown | -5秒 踏冷却 | `special_bonus_unique_primal_beast_trample_cooldown` |
| 2 | 15/28 | +6 Uproar Armor Per Stack | +6 咤每层叠加护甲 | `special_bonus_unique_primal_beast_uproar_armor` |
| 3 | 20/29 | +20% Trample Attack Multiplier | +20% 踏攻击力系数 | `special_bonus_unique_primal_beast_trample_attack_damage` |
| 3 | 20/29 | Basic Self-Dispel on Uproar Cast | 施放咤时弱驱散自身 | `special_bonus_unique_primal_beast_roar_dispells` |
| 4 | 25/30 | Colossal 2x Bonuses During Trample | 踏期间庞为2倍加成 | `special_bonus_unique_primal_beast_colossal_trample` |
| 4 | 25/30 | +67% Pulverize Duration | +67% 捶持续时间 | `special_bonus_unique_primal_beast_pulverize_duration` |

## 琼英碧灵 Muerta（id 138）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +300 Dead Shot Cast Range | +300 弹无虚发施法距离 | `special_bonus_unique_muerta_dead_shot_range` |
| 1 | 10/27 | +20 Attack Speed | +20 攻击速度 | `special_bonus_attack_speed_20` |
| 2 | 15/28 | +3% Max HP Regen while inside The Calling | 唤魂内+3% 最大生命值恢复 | `special_bonus_unique_muerta_calling_hp_regen` |
| 2 | 15/28 | +15 Intelligence | +15 智力 | `special_bonus_intelligence_15` |
| 3 | 20/29 | +2s Pierce the Veil Duration | +2秒 越界持续时间 | `special_bonus_unique_muerta_pierce_the_veil_duration` |
| 3 | 20/29 | The Calling summons 2 additional revenants | 唤魂额外召唤2个亡魂 | `special_bonus_unique_muerta_the_calling_num_revenants` |
| 4 | 25/30 | +20% Gunslinger chance | +20% 神枪在手几率 | `special_bonus_unique_muerta_gunslinger_double_shot_chance` |
| 4 | 25/30 | 2 Dead Shot Charges | 2 弹无虚发能量点数 | `special_bonus_unique_muerta_dead_shot_charges` |

## 凯 Kez（id 145）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1* | 10/27 | +6% Switch Discipline Swap Bonuses | +6% 流派变换加成 | `special_bonus_unique_kez_switch_weapons_swap_bonus` |
| 1 | 10/27 | +50 Raptor Dance Radius | +50 猛禽之舞范围 | `special_bonus_unique_kez_raptor_dance_radius` |
| 2 | 15/28 | +2s Falcon Rush Duration | +2秒 天隼冲击持续时间 | `special_bonus_unique_kez_falcon_rush_duration` |
| 2 | 15/28 | +1 Raptor Dance Strike | +1 猛禽之舞斩击 | `special_bonus_unique_kez_raptor_dance_strikes` |
| 3 | 20/29 | +3.5% Kazurai Katana Damage Per Second | +3.5% 影武长刀每秒伤害 | `special_bonus_unique_kez_kazura_katana_bleed_damage` |
| 3 | 20/29 | 40 Bonus Attack Speed During Falcon Rush | 40 天隼冲击期间额外攻速 | `special_bonus_unique_kez_falcon_rush_attack_speed` |
| 4 | 25/30 | +80% Shodo Sai Critical Strike | +80% 翔影之钗致命一击 | `special_bonus_unique_kez_mark_damage` |
| 4 | 25/30 | +1 Echo Slash Attack | +1 回音重斩攻击 | `special_bonus_unique_kez_echo_slash_strike_count` |

## 朗戈 Largo（id 155）

| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |
|---|---|---|---|---|
| 1 | 10/27 | +15 Frogstomp Damage | +15 蛙力千钧伤害 | `special_bonus_unique_largo_1` |
| 1 | 10/27 | 2.5x Catchy Lick Health Regen | 2.5倍 动人之舐生命恢复 | `special_bonus_unique_largo_2` |
| 2 | 15/28 | 1% Croak of Genius Max Health DPS | 1% 灵呱一闪每秒最大生命值伤害 | `special_bonus_unique_largo_3` |
| 2 | 15/28 | +100 Catchy Lick Cast Range / +50 Pull Distance | +100 动人之舐施法距离 / +50 拉回距离 | `special_bonus_unique_largo_4` |
| 3 | 20/29 | 50% Groovin' Armor Aura | 50% 律动护甲光环 | `special_bonus_unique_largo_6` |
| 3 | 20/29 | 2x Frogstomp Stomps/Interval | 2倍 蛙力千钧践踏次数/频率 | `special_bonus_unique_largo_5` |
| 4 | 25/30 | 2 Catchy Lick Charges | 2 动人之舐能量点数 | `special_bonus_unique_largo_8` |
| 4 | 25/30 | +30% Amphibian Rhapsody Song Effects | +30% 两栖狂想曲乐曲效果 | `special_bonus_unique_largo_7` |

共 1016 条天赋（127 个英雄 × 8），另加通用的属性附加。
