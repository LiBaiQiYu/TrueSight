# Dota 2 英雄技能对照表（内部名 / 英文 / 中文）

数据源：中文=dota2.com datafeed（`herodata?language=schinese` 的 `abilities[].name_loc`）；
英文=同一接口 `language=english` 的 `abilities[].name_loc`；技能 ID 与归属=OpenDota
`ability_ids.json` / `hero_abilities.json` 核验。

类型：基础=普通技能（可升级），终极=大招，先天=每个英雄自带的先天技能。
天赋树见 `memory/dota-talents.md`（每个英雄 8 条，10/15/20/25 与 27/28/29/30 解锁）。
由 `tools/names/build.py` 生成；完整机器可读版本见 `data/names/abilities.json`。

## 敌法师 Anti-Mage（id 1）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `antimage_mana_break` | Mana Break | 法力损毁 | 基础 |
| `antimage_blink` | Blink | 闪烁 | 基础 |
| `antimage_counterspell` | Counterspell | 法术反制 | 基础 |
| `antimage_persectur` | Persecutor | 绝人之路 | 先天 |
| `antimage_mana_void` | Mana Void | 法力虚空 | 终极 |

## 斧王 Axe（id 2）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `axe_berserkers_call` | Berserker's Call | 狂战士之吼 | 基础 |
| `axe_battle_hunger` | Battle Hunger | 战斗饥渴 | 基础 |
| `axe_counter_helix` | Counter Helix | 反击螺旋 | 基础 |
| `axe_culling_blade` | Culling Blade | 淘汰之刃 | 终极 |
| `axe_one_man_army` | One Man Army | 一人之军 | 先天 |

## 祸乱之源 Bane（id 3）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `bane_enfeeble` | Enfeeble | 虚弱 | 基础 |
| `bane_brain_sap` | Brain Sap | 蚀脑 | 基础 |
| `bane_nightmare` | Nightmare | 噩梦 | 基础 |
| `bane_fiends_grip` | Fiend's Grip | 魔爪 | 终极 |
| `bane_ichor_of_nyctasha` | Ichor of Nyctasha | 妮塔莎脓血 | 先天 |

## 血魔 Bloodseeker（id 4）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `bloodseeker_bloodrage` | Bloodrage | 血怒 | 基础 |
| `bloodseeker_blood_bath` | Blood Rite | 血祭 | 基础 |
| `bloodseeker_thirst` | Thirst | 焦渴 | 基础 |
| `bloodseeker_sanguivore` | Sanguivore | 食血动物 | 先天 |
| `bloodseeker_rupture` | Rupture | 割裂 | 终极 |

## 水晶室女 Crystal Maiden（id 5）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `crystal_maiden_crystal_nova` | Crystal Nova | 冰霜新星 | 基础 |
| `crystal_maiden_frostbite` | Frostbite | 冰封禁制 | 基础 |
| `crystal_maiden_brilliance_aura` | Arcane Aura | 奥术光环 | 基础 |
| `crystal_maiden_crystal_clone` | Crystal Clone | 冰晶克隆 | 基础 |
| `crystal_maiden_glacial_guard` | Glacial Guard | 冰川护体 | 先天 |
| `crystal_maiden_freezing_field` | Freezing Field | 极寒领域 | 终极 |

## 卓尔游侠 Drow Ranger（id 6）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `drow_ranger_frost_arrows` | Frost Arrows | 霜冻之箭 | 基础 |
| `drow_ranger_wave_of_silence` | Gust | 狂风 | 基础 |
| `drow_ranger_multishot` | Multishot | 数箭齐发 | 基础 |
| `drow_ranger_glacier` | Glacier | 冰川 | 基础 |
| `drow_ranger_trueshot` | Precision Aura | 精准光环 | 先天 |
| `drow_ranger_marksmanship` | Marksmanship | 射手天赋 | 终极 |

## 撼地者 Earthshaker（id 7）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `earthshaker_fissure` | Fissure | 沟壑 | 基础 |
| `earthshaker_enchant_totem` | Enchant Totem | 强化图腾 | 基础 |
| `earthshaker_aftershock` | Aftershock | 余震 | 基础 |
| `earthshaker_echo_slam` | Echo Slam | 回音击 | 终极 |
| `earthshaker_slugger` | Slugger | 强击图腾 | 先天 |

## 主宰 Juggernaut（id 8）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `juggernaut_blade_fury` | Blade Fury | 剑刃风暴 | 基础 |
| `juggernaut_healing_ward` | Healing Ward | 治疗守卫 | 基础 |
| `juggernaut_blade_dance` | Blade Dance | 剑舞 | 基础 |
| `juggernaut_swift_slash` | Swiftslash | 迅风斩 | 基础 |
| `juggernaut_bladeform` | Bladeform | 剑心犹在 | 先天 |
| `juggernaut_omni_slash` | Omnislash | 无敌斩 | 终极 |

## 米拉娜 Mirana（id 9）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `mirana_starfall` | Starstorm | 群星风暴 | 基础 |
| `mirana_arrow` | Sacred Arrow | 月神之箭 | 基础 |
| `mirana_leap` | Leap | 跳跃 | 基础 |
| `mirana_celestial_quiver` | Celestial Quiver | 天界箭袋 | 先天 |
| `mirana_invis` | Moonlight Shadow | 月之暗面 | 终极 |

## 变体精灵 Morphling（id 10）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `morphling_waveform` | Waveform | 波浪形态 | 基础 |
| `morphling_adaptive_strike_agi` | Adaptive Strike | 变体打击 | 基础 |
| `morphling_morph_agi` | Attribute Shift (Agility Gain) | 属性变换（敏捷获取） | 基础 |
| `morphling_morph_str` | Attribute Shift (Strength Gain) | 属性变换（力量获取） | 基础 |
| `morphling_replicate` | Morph | 变形 | 终极 |
| `morphling_ebb_and_flow` | Ebb and Flow | 潮涨潮落 | 先天 |

## 影魔 Shadow Fiend（id 11）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `nevermore_shadowraze1` | Shadowraze | 毁灭阴影 | 基础 |
| `nevermore_frenzy` | Feast of Souls | 灵魂盛宴 | 基础 |
| `nevermore_dark_lord` | Presence of the Dark Lord | 魔王降临 | 基础 |
| `nevermore_requiem` | Requiem of Souls | 魂之挽歌 | 终极 |
| `nevermore_necromastery` | Necromastery | 支配死灵 | 先天 |

## 幻影长矛手 Phantom Lancer（id 12）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `phantom_lancer_spirit_lance` | Spirit Lance | 灵魂之矛 | 基础 |
| `phantom_lancer_doppelwalk` | Doppelganger | 神行百变 | 基础 |
| `phantom_lancer_phantom_edge` | Phantom Rush | 幻影冲锋 | 基础 |
| `phantom_lancer_illusory_armaments` | Illusory Armaments | 灵幻兵械 | 先天 |
| `phantom_lancer_juxtapose` | Juxtapose | 并列 | 终极 |

## 帕克 Puck（id 13）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `puck_illusory_orb` | Illusory Orb | 幻象法球 | 基础 |
| `puck_waning_rift` | Waning Rift | 新月之痕 | 基础 |
| `puck_phase_shift` | Phase Shift | 相位转移 | 基础 |
| `puck_puckish` | Puckish | 顽皮克敌 | 先天 |
| `puck_dream_coil` | Dream Coil | 梦境缠绕 | 终极 |

## 帕吉 Pudge（id 14）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `pudge_meat_hook` | Meat Hook | 肉钩 | 基础 |
| `pudge_rot` | Rot | 腐烂 | 基础 |
| `pudge_flesh_heap` | Meat Shield | 肉盾 | 基础 |
| `pudge_innate_graft_flesh` | Flesh Heap | 腐肉堆积 | 先天 |
| `pudge_dismember` | Dismember | 肢解 | 终极 |

## 雷泽 Razor（id 15）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `razor_plasma_field` | Plasma Field | 等离子场 | 基础 |
| `razor_static_link` | Static Link | 静电连接 | 基础 |
| `razor_storm_surge` | Storm Surge | 风暴涌动 | 基础 |
| `razor_unstable_current` | Unstable Current | 不稳定电流 | 先天 |
| `razor_eye_of_the_storm` | Eye of the Storm | 风暴之眼 | 终极 |

## 沙王 Sand King（id 16）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `sandking_burrowstrike` | Burrowstrike | 掘地穿刺 | 基础 |
| `sandking_sand_storm` | Sand Storm | 沙尘暴 | 基础 |
| `sandking_scorpion_strike` | Stinger | 尾刺 | 基础 |
| `sandking_caustic_finale` | Caustic Finale | 腐尸毒 | 先天 |
| `sandking_epicenter` | Epicenter | 地震 | 终极 |

## 风暴之灵 Storm Spirit（id 17）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `storm_spirit_static_remnant` | Static Remnant | 残影 | 基础 |
| `storm_spirit_electric_vortex` | Electric Vortex | 电子涡流 | 基础 |
| `storm_spirit_overload` | Overload | 超负荷 | 基础 |
| `storm_spirit_ball_lightning` | Ball Lightning | 球状闪电 | 终极 |
| `storm_spirit_galvanized` | Galvanized | 通电 | 先天 |

## 斯温 Sven（id 18）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `sven_storm_bolt` | Storm Hammer | 风暴之拳 | 基础 |
| `sven_great_cleave` | Great Cleave | 巨力挥舞 | 基础 |
| `sven_warcry` | Warcry | 战吼 | 基础 |
| `sven_gods_strength` | God's Strength | 神之力量 | 终极 |
| `sven_wrath_of_god` | Wrath of God | 神之愤怒 | 先天 |

## 小小 Tiny（id 19）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `tiny_avalanche` | Avalanche | 山崩 | 基础 |
| `tiny_toss` | Toss | 投掷 | 基础 |
| `tiny_tree_grab` | Tree Grab | 抓树 | 基础 |
| `tiny_tree_channel` | Tree Volley | 树木连掷 | 基础 |
| `tiny_insurmountable` | Insurmountable | 不可逾越 | 先天 |
| `tiny_grow` | Grow | 长大 | 终极 |
| `tiny_toss_tree` | Tree Throw | 扔树 | 基础 |

## 复仇之魂 Vengeful Spirit（id 20）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `vengefulspirit_magic_missile` | Magic Missile | 魔法箭 | 基础 |
| `vengefulspirit_wave_of_terror` | Wave of Terror | 恐怖波动 | 基础 |
| `vengefulspirit_command_aura` | Vengeance Aura | 复仇光环 | 基础 |
| `vengefulspirit_retribution` | Retribution | 恶有恶报 | 先天 |
| `vengefulspirit_nether_swap` | Nether Swap | 移形换位 | 终极 |

## 风行者 Windranger（id 21）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `windrunner_shackleshot` | Shackleshot | 束缚击 | 基础 |
| `windrunner_powershot` | Powershot | 强力击 | 基础 |
| `windrunner_windrun` | Windrun | 风行 | 基础 |
| `windrunner_gale_force` | Gale Force | 狂风之力 | 基础 |
| `windrunner_focusfire` | Focus Fire | 集中火力 | 终极 |
| `windrunner_tailwind` | Tailwind | 一路顺风 | 先天 |

## 宙斯 Zeus（id 22）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `zuus_arc_lightning` | Arc Lightning | 弧形闪电 | 基础 |
| `zuus_lightning_bolt` | Lightning Bolt | 雷击 | 基础 |
| `zuus_heavenly_jump` | Heavenly Jump | 神圣一跳 | 基础 |
| `zuus_cloud` | Nimbus | 雷云 | 基础 |
| `zuus_lightning_hands` | Lightning Hands | 霹雳之手 | 基础 |
| `zuus_thundergods_wrath` | Thundergod's Wrath | 雷神之怒 | 终极 |
| `zuus_static_field` | Static Field | 静电场 | 先天 |

## 昆卡 Kunkka（id 23）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `kunkka_torrent` | Torrent | 洪流 | 基础 |
| `kunkka_tidebringer` | Tidebringer | 潮汐使者 | 基础 |
| `kunkka_x_marks_the_spot` | X Marks the Spot | X标记 | 基础 |
| `kunkka_admirals_rum` | Admiral's Rum | 统帅朗姆酒 | 先天 |
| `kunkka_tidal_wave` | Tidal Wave | 潮汐波 | 基础 |
| `kunkka_ghostship` | Ghostship | 幽灵船 | 终极 |

## 莉娜 Lina（id 25）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `lina_dragon_slave` | Dragon Slave | 龙破斩 | 基础 |
| `lina_light_strike_array` | Light Strike Array | 光击阵 | 基础 |
| `lina_fiery_soul` | Fiery Soul | 炽魂 | 基础 |
| `lina_flame_cloak` | Flame Cloak | 腾焰斗篷 | 基础 |
| `lina_slow_burn` | Slow Burn | 慢热 | 先天 |
| `lina_laguna_blade` | Laguna Blade | 神灭斩 | 终极 |

## 莱恩 Lion（id 26）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `lion_impale` | Earth Spike | 裂地尖刺 | 基础 |
| `lion_voodoo` | Hex | 妖术 | 基础 |
| `lion_mana_drain` | Mana Drain | 法力吸取 | 基础 |
| `lion_to_hell_and_back` | To Hell and Back | 下地狱再上来 | 先天 |
| `lion_finger_of_death` | Finger of Death | 死亡之指 | 终极 |

## 暗影萨满 Shadow Shaman（id 27）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `shadow_shaman_ether_shock` | Ether Shock | 苍穹震击 | 基础 |
| `shadow_shaman_voodoo` | Hex | 妖术 | 基础 |
| `shadow_shaman_shackles` | Shackles | 枷锁 | 基础 |
| `shadow_shaman_fowl_play` | Fowl Play | 禽戏 | 先天 |
| `shadow_shaman_urnaconda` | Urnaconda | 巨蟒之瓮 | 基础 |
| `shadow_shaman_mass_serpent_ward` | Mass Serpent Ward | 群蛇守卫 | 终极 |

## 斯拉达 Slardar（id 28）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `slardar_sprint` | Guardian Sprint | 守卫冲刺 | 基础 |
| `slardar_slithereen_crush` | Slithereen Crush | 鱼人碎击 | 基础 |
| `slardar_bash` | Bash of the Deep | 深海重击 | 基础 |
| `slardar_seaborn_sentinel` | Seaborn Sentinel | 汪洋前哨 | 先天 |
| `slardar_amplify_damage` | Corrosive Haze | 侵蚀雾霭 | 终极 |

## 潮汐猎人 Tidehunter（id 29）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `tidehunter_gush` | Gush | 巨浪 | 基础 |
| `tidehunter_kraken_shell` | Kraken Shell | 海妖外壳 | 基础 |
| `tidehunter_anchor_smash` | Anchor Smash | 锚击 | 基础 |
| `tidehunter_dead_in_the_water` | Dead in the Water | 重如铁锚 | 基础 |
| `tidehunter_ravage` | Ravage | 毁灭 | 终极 |
| `tidehunter_leviathans_catch` | Leviathan's Catch | 利维坦的渔获 | 先天 |

## 巫医 Witch Doctor（id 30）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `witch_doctor_paralyzing_cask` | Paralyzing Cask | 麻痹药剂 | 基础 |
| `witch_doctor_voodoo_restoration` | Voodoo Restoration | 巫毒疗法 | 基础 |
| `witch_doctor_maledict` | Maledict | 巫蛊咒术 | 基础 |
| `witch_doctor_voodoo_switcheroo` | Voodoo Switcheroo | 巫毒变身术 | 基础 |
| `witch_doctor_gris_gris` | Gris-Gris | 驱邪护符 | 先天 |
| `witch_doctor_death_ward` | Death Ward | 死亡守卫 | 终极 |

## 巫妖 Lich（id 31）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `lich_frost_nova` | Frost Blast | 寒霜爆发 | 基础 |
| `lich_frost_shield` | Frost Shield | 冰霜魔盾 | 基础 |
| `lich_sinister_gaze` | Sinister Gaze | 阴邪凝视 | 基础 |
| `lich_ice_spire` | Ice Spire | 寒冰尖柱 | 基础 |
| `lich_death_charge` | Sacrifice | 献身 | 先天 |
| `lich_chain_frost` | Chain Frost | 连环霜冻 | 终极 |

## 力丸 Riki（id 32）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `riki_smoke_screen` | Smoke Screen | 烟幕 | 基础 |
| `riki_blink_strike` | Blink Strike | 闪烁突袭 | 基础 |
| `riki_tricks_of_the_trade` | Tricks of the Trade | 绝杀秘技 | 基础 |
| `riki_innate_backstab` | Backstab | 背刺 | 先天 |
| `riki_backstab` | Cloak and Dagger | 刀光谍影 | 终极 |

## 谜团 Enigma（id 33）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `enigma_malefice` | Malefice | 憎恶 | 基础 |
| `enigma_demonic_conversion` | Demonic Summoning | 恶魔召唤 | 基础 |
| `enigma_midnight_pulse` | Midnight Pulse | 午夜凋零 | 基础 |
| `enigma_event_horizon` | Event Horizon | 事件视界 | 先天 |
| `enigma_black_hole` | Black Hole | 黑洞 | 终极 |

## 修补匠 Tinker（id 34）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `tinker_laser` | Laser | 激光 | 基础 |
| `tinker_march_of_the_machines` | March of the Machines | 机械行军 | 基础 |
| `tinker_deploy_turrets` | Deploy Turrets | 部署炮塔 | 基础 |
| `tinker_warp_grenade` | Warp Flare | 折跃耀光 | 基础 |
| `tinker_rearm` | Rearm | 再装填 | 终极 |
| `tinker_eureka` | Eureka! | 尤里卡！ | 先天 |

## 狙击手 Sniper（id 35）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `sniper_shrapnel` | Shrapnel | 榴霰弹 | 基础 |
| `sniper_headshot` | Headshot | 爆头 | 基础 |
| `sniper_take_aim` | Take Aim | 瞄准 | 基础 |
| `sniper_concussive_grenade` | Concussive Grenade | 震荡手雷 | 基础 |
| `sniper_keen_scope` | Keen Scope | 基恩瞄准镜 | 先天 |
| `sniper_assassinate` | Assassinate | 暗杀 | 终极 |

## 瘟疫法师 Necrophos（id 36）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `necrolyte_death_pulse` | Death Pulse | 死亡脉冲 | 基础 |
| `necrolyte_ghost_shroud` | Ghost Shroud | 幽魂护罩 | 基础 |
| `necrolyte_heartstopper_aura` | Heartstopper Aura | 竭心光环 | 基础 |
| `necrolyte_death_seeker` | Death Seeker | 死亡搜寻 | 基础 |
| `necrolyte_sadist` | Sadist | 施虐之心 | 先天 |
| `necrolyte_reapers_scythe` | Reaper's Scythe | 死神镰刀 | 终极 |

## 术士 Warlock（id 37）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `warlock_fatal_bonds` | Fatal Bonds | 致命连接 | 基础 |
| `warlock_shadow_word` | Shadow Word | 暗言术 | 基础 |
| `warlock_upheaval` | Upheaval | 剧变 | 基础 |
| `warlock_eldritch_summoning` | Eldritch Summoning | 邪术召唤 | 先天 |
| `warlock_rain_of_chaos` | Chaotic Offering | 混乱之祭 | 终极 |

## 兽王 Beastmaster（id 38）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `beastmaster_wild_axes` | Wild Axes | 野性之斧 | 基础 |
| `beastmaster_summon_razorback` | Summon Razorback | 召唤刀背兽 | 基础 |
| `beastmaster_summon_raptor` | Summon Raptors | 召唤猛禽 | 基础 |
| `beastmaster_inner_beast` | Inner Beast | 野性之心 | 先天 |
| `beastmaster_drums_of_slom` | Drums of Slom | 斯洛姆战鼓 | 基础 |
| `beastmaster_primal_roar` | Primal Roar | 原始咆哮 | 终极 |

## 痛苦女王 Queen of Pain（id 39）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `queenofpain_shadow_strike` | Shadow Strike | 暗影突袭 | 基础 |
| `queenofpain_blink` | Blink | 闪烁 | 基础 |
| `queenofpain_scream_of_pain` | Scream Of Pain | 痛苦尖叫 | 基础 |
| `queenofpain_succubus` | Succubus | 魅魔 | 先天 |
| `queenofpain_sonic_wave` | Sonic Wave | 超声冲击波 | 终极 |

## 剧毒术士 Venomancer（id 40）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `venomancer_venomous_gale` | Venomous Gale | 瘴气 | 基础 |
| `venomancer_snakebite` | Snakebite | 毒蛇撕咬 | 基础 |
| `venomancer_plague_ward` | Plague Ward | 瘟疫守卫 | 基础 |
| `venomancer_poison_sting` | Poison Sting | 毒刺 | 先天 |
| `venomancer_noxious_plague` | Noxious Plague | 恶性瘟疫 | 终极 |

## 虚空假面 Faceless Void（id 41）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `faceless_void_time_walk` | Time Walk | 时间漫游 | 基础 |
| `faceless_void_time_dilation` | Time Dilation | 时间膨胀 | 基础 |
| `faceless_void_time_lock` | Time Lock | 时间锁定 | 基础 |
| `faceless_void_time_walk_reverse` | Reverse Time Walk | 反时间漫游 | 基础 |
| `faceless_void_distortion_field` | Distortion Field | 扭曲力场 | 先天 |
| `faceless_void_chronosphere` | Chronosphere | 时间结界 | 终极 |

## 冥魂大帝 Wraith King（id 42）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `skeleton_king_hellfire_blast` | Wraithfire Blast | 冥火爆击 | 基础 |
| `skeleton_king_bone_guard` | Bone Guard | 白骨护卫 | 基础 |
| `skeleton_king_mortal_strike` | Mortal Strike | 本命一击 | 基础 |
| `skeleton_king_vampiric_spirit` | Vampiric Spirit | 吸血灵魂 | 先天 |
| `skeleton_king_reincarnation` | Reincarnation | 绝冥再生 | 终极 |

## 死亡先知 Death Prophet（id 43）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `death_prophet_carrion_swarm` | Crypt Swarm | 地穴虫群 | 基础 |
| `death_prophet_silence` | Silence | 沉默魔法 | 基础 |
| `death_prophet_spirit_siphon` | Spirit Siphon | 吸魂巫术 | 基础 |
| `death_prophet_witchcraft` | Witchcraft | 巫术精研 | 先天 |
| `death_prophet_exorcism` | Exorcism | 驱使恶灵 | 终极 |

## 幻影刺客 Phantom Assassin（id 44）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `phantom_assassin_stifling_dagger` | Stifling Dagger | 窒碍短匕 | 基础 |
| `phantom_assassin_phantom_strike` | Phantom Strike | 幻影突袭 | 基础 |
| `phantom_assassin_blur` | Blur | 魅影无形 | 先天 |
| `phantom_assassin_fan_of_knives` | Fan of Knives | 刀阵旋风 | 基础 |
| `phantom_assassin_immaterial` | Immaterial | 飘忽不定 | 基础 |
| `phantom_assassin_coup_de_grace` | Coup de Grace | 恩赐解脱 | 终极 |

## 帕格纳 Pugna（id 45）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `pugna_nether_blast` | Nether Blast | 幽冥爆轰 | 基础 |
| `pugna_decrepify` | Decrepify | 衰老 | 基础 |
| `pugna_nether_ward` | Nether Ward | 幽冥守卫 | 基础 |
| `pugna_oblivion_savant` | Oblivion Savant | 湮灭专家 | 先天 |
| `pugna_life_drain` | Life Drain | 生命汲取 | 终极 |

## 圣堂刺客 Templar Assassin（id 46）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `templar_assassin_refraction` | Refraction | 折光 | 基础 |
| `templar_assassin_meld` | Meld | 隐匿 | 基础 |
| `templar_assassin_psi_blades` | Psi Blades | 灵能之刃 | 基础 |
| `templar_assassin_trap_teleport` | Psionic Projection | 灵能投射 | 基础 |
| `templar_assassin_psionic_trap` | Psionic Trap | 灵能陷阱 | 终极 |
| `templar_assassin_inner_peace` | Inner Peace | 心怀安宁 | 先天 |

## 冥界亚龙 Viper（id 47）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `viper_poison_attack` | Poison Attack | 毒性攻击 | 基础 |
| `viper_nethertoxin` | Nethertoxin | 幽冥剧毒 | 基础 |
| `viper_corrosive_skin` | Corrosive Skin | 腐蚀皮肤 | 基础 |
| `viper_nose_dive` | Nosedive | 极恶俯冲 | 基础 |
| `viper_predator` | Predator | 掠食 | 先天 |
| `viper_viper_strike` | Viper Strike | 蝮蛇突袭 | 终极 |

## 露娜 Luna（id 48）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `luna_lucent_beam` | Lucent Beam | 月光 | 基础 |
| `luna_lunar_orbit` | Lunar Orbit | 环月 | 基础 |
| `luna_moon_glaive` | Moon Glaives | 月刃 | 基础 |
| `luna_lunar_blessing` | Lunar Blessing | 月之祝福 | 先天 |
| `luna_eclipse` | Eclipse | 月蚀 | 终极 |

## 龙骑士 Dragon Knight（id 49）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `dragon_knight_breathe_fire` | Breathe Fire | 火焰气息 | 基础 |
| `dragon_knight_dragon_tail` | Dragon Tail | 神龙摆尾 | 基础 |
| `dragon_knight_wyrms_wrath` | Wyrm's Wrath | 飞龙之怒 | 基础 |
| `dragon_knight_fireball` | Fireball | 龙炎火球 | 基础 |
| `dragon_knight_dragon_blood` | Dragon Blood | 龙族血统 | 先天 |
| `dragon_knight_elder_dragon_form` | Elder Dragon Form | 古龙形态 | 终极 |

## 戴泽 Dazzle（id 50）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `dazzle_poison_touch` | Poison Touch | 剧毒之触 | 基础 |
| `dazzle_shallow_grave` | Shallow Grave | 薄葬 | 基础 |
| `dazzle_shadow_wave` | Shadow Wave | 暗影波 | 基础 |
| `dazzle_innate_weave` | Weave | 编织 | 先天 |
| `dazzle_nothl_projection` | Nothl Projection | 虚无投影 | 终极 |

## 发条技师 Clockwerk（id 51）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `rattletrap_battery_assault` | Battery Assault | 弹幕冲击 | 基础 |
| `rattletrap_power_cogs` | Power Cogs | 能量齿轮 | 基础 |
| `rattletrap_rocket_flare` | Rocket Flare | 照明火箭 | 基础 |
| `rattletrap_overclocking` | Overclocking | 超速运转 | 基础 |
| `rattletrap_jetpack` | Jetpack | 喷气背包 | 基础 |
| `rattletrap_hookshot` | Hookshot | 发射钩爪 | 终极 |
| `rattletrap_armor_power` | Armor Power | 装甲力量 | 先天 |

## 拉席克 Leshrac（id 52）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `leshrac_split_earth` | Split Earth | 撕裂大地 | 基础 |
| `leshrac_diabolic_edict` | Diabolic Edict | 恶魔敕令 | 基础 |
| `leshrac_lightning_storm` | Lightning Storm | 闪电风暴 | 基础 |
| `leshrac_greater_lightning_storm` | Nihilism | 虚无主义 | 基础 |
| `leshrac_defilement` | Defilement | 大肆污染 | 先天 |
| `leshrac_pulse_nova` | Pulse Nova | 脉冲新星 | 终极 |

## 自然先知 Nature's Prophet（id 53）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `furion_sprout` | Sprout | 发芽 | 基础 |
| `furion_teleportation` | Teleportation | 传送 | 基础 |
| `furion_force_of_nature` | Nature's Call | 自然的呼唤 | 基础 |
| `furion_curse_of_the_forest` | Curse of the Oldgrowth | 青森诅咒 | 基础 |
| `furion_spirit_of_the_forest` | Spirit of the Forest | 丛林之魂 | 先天 |
| `furion_wrath_of_nature` | Wrath of Nature | 自然之怒 | 终极 |

## 噬魂鬼 Lifestealer（id 54）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `life_stealer_rage` | Rage | 狂暴 | 基础 |
| `life_stealer_open_wounds` | Open Wounds | 撕裂伤口 | 基础 |
| `life_stealer_feast` | Feast | 盛宴 | 基础 |
| `life_stealer_ghoul_frenzy` | Ghoul Frenzy | 尸鬼狂怒 | 先天 |
| `life_stealer_infest` | Infest | 感染 | 终极 |

## 黑暗贤者 Dark Seer（id 55）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `dark_seer_vacuum` | Vacuum | 真空 | 基础 |
| `dark_seer_ion_shell` | Ion Shell | 离子外壳 | 基础 |
| `dark_seer_surge` | Surge | 奔腾 | 基础 |
| `dark_seer_normal_punch` | Normal Punch | 普通一拳 | 基础 |
| `dark_seer_aggrandize` | Quick Wit | 才思敏捷 | 先天 |
| `dark_seer_wall_of_replica` | Wall of Replica | 复制之墙 | 终极 |

## 克林克兹 Clinkz（id 56）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `clinkz_strafe` | Strafe | 扫射 | 基础 |
| `clinkz_searing_arrows` | Searing Arrows | 灼热之箭 | 基础 |
| `clinkz_death_pact` | Death Pact | 死亡契约 | 基础 |
| `clinkz_burning_barrage` | Burning Barrage | 炽烈火雨 | 基础 |
| `clinkz_burning_army` | Burning Army | 烈焰之军 | 基础 |
| `clinkz_wind_walk` | Skeleton Walk | 骨隐步 | 终极 |
| `clinkz_infernal_shred` | Infernal Shred | 地狱之裂 | 先天 |

## 全能骑士 Omniknight（id 57）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `omniknight_purification` | Purification | 洗礼 | 基础 |
| `omniknight_martyr` | Repel | 驱逐 | 基础 |
| `omniknight_hammer_of_purity` | Hammer of Purity | 纯洁之锤 | 基础 |
| `omniknight_degen_aura` | Degen Aura | 退化光环 | 先天 |
| `omniknight_guardian_angel` | Guardian Angel | 守护天使 | 终极 |

## 魅惑魔女 Enchantress（id 58）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `enchantress_impetus` | Impetus | 推进 | 基础 |
| `enchantress_enchant` | Enchant | 魅惑 | 基础 |
| `enchantress_natures_attendants` | Nature's Attendants | 自然之助 | 基础 |
| `enchantress_bunny_hop` | Sproink | 跃动 | 基础 |
| `enchantress_little_friends` | Little Friends | 密友 | 基础 |
| `enchantress_untouchable` | Untouchable | 不可侵犯 | 终极 |
| `enchantress_rabblerouser` | Rabble-Rouser | 煽动野怪 | 先天 |

## 哈斯卡 Huskar（id 59）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `huskar_inner_fire` | Inner Fire | 心炎 | 基础 |
| `huskar_burning_spear` | Burning Spear | 沸血之矛 | 基础 |
| `huskar_berserkers_blood` | Berserker's Blood | 狂战士之血 | 基础 |
| `huskar_blood_magic` | Blood Magic | 血魔法 | 先天 |
| `huskar_life_break` | Life Break | 牺牲 | 终极 |

## 暗夜魔王 Night Stalker（id 60）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `night_stalker_void` | Void | 虚空 | 基础 |
| `night_stalker_crippling_fear` | Crippling Fear | 伤残恐惧 | 基础 |
| `night_stalker_midnight_feast` | Midnight Feast | 午夜盛宴 | 基础 |
| `night_stalker_hunter_in_the_night` | Hunter in the Night | 暗夜猎影 | 先天 |
| `night_stalker_darkness` | Dark Ascension | 黑暗飞升 | 终极 |

## 育母蜘蛛 Broodmother（id 61）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `broodmother_insatiable_hunger` | Insatiable Hunger | 极度饥渴 | 基础 |
| `broodmother_spin_web` | Spin Web | 织网 | 基础 |
| `broodmother_incapacitating_bite` | Incapacitating Bite | 麻痹之咬 | 基础 |
| `broodmother_sticky_snare` | Spinner's Snare | 蛛纱陷阱 | 基础 |
| `broodmother_spiders_milk` | Spider's Milk | 蜘蛛奶 | 先天 |
| `broodmother_spawn_spiderlings` | Spawn Spiderlings | 孵化蜘蛛 | 终极 |

## 赏金猎人 Bounty Hunter（id 62）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `bounty_hunter_shuriken_toss` | Shuriken Toss | 投掷飞镖 | 基础 |
| `bounty_hunter_jinada` | Jinada | 忍术 | 基础 |
| `bounty_hunter_wind_walk` | Shadow Walk | 暗影步 | 基础 |
| `bounty_hunter_wind_walk_ally` | Friendly Shadow | 暗影情谊 | 基础 |
| `bounty_hunter_big_game_hunter` | Big Game Hunter | 职业猎人 | 先天 |
| `bounty_hunter_track` | Track | 追踪术 | 终极 |

## 编织者 Weaver（id 63）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `weaver_the_swarm` | The Swarm | 虫群 | 基础 |
| `weaver_shukuchi` | Shukuchi | 缩地 | 基础 |
| `weaver_geminate_attack` | Geminate Attack | 连击 | 基础 |
| `weaver_time_lapse` | Time Lapse | 时光倒流 | 终极 |
| `weaver_threads_of_fate` | Threads of Fate | 命运之线 | 先天 |

## 杰奇洛 Jakiro（id 64）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `jakiro_dual_breath` | Dual Breath | 冰火交加 | 基础 |
| `jakiro_ice_path` | Ice Path | 冰封路径 | 基础 |
| `jakiro_liquid_fire` | Liquid Fire | 液态火 | 基础 |
| `jakiro_liquid_ice` | Liquid Frost | 液态冰 | 基础 |
| `jakiro_double_trouble` | Double Trouble | 天生一对 | 先天 |
| `jakiro_macropyre` | Macropyre | 烈焰焚身 | 终极 |

## 蝙蝠骑士 Batrider（id 65）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `batrider_sticky_napalm` | Sticky Napalm | 粘性燃油 | 基础 |
| `batrider_flamebreak` | Flamebreak | 烈焰破击 | 基础 |
| `batrider_firefly` | Firefly | 火焰飞行 | 基础 |
| `batrider_smoldering_resin` | Smoldering Resin | 闷烧树脂 | 先天 |
| `batrider_flaming_lasso` | Flaming Lasso | 燃烧枷锁 | 终极 |

## 陈 Chen（id 66）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `chen_penitence` | Penitence | 赎罪 | 基础 |
| `chen_holy_persuasion` | Holy Persuasion | 神圣劝化 | 基础 |
| `chen_divine_favor` | Divine Favor | 神力恩泽 | 基础 |
| `chen_zealot` | Zealot | 狂热者 | 先天 |
| `chen_hand_of_god` | Hand of God | 上帝之手 | 终极 |

## 幽鬼 Spectre（id 67）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `spectre_spectral_dagger` | Spectral Dagger | 幽鬼之刃 | 基础 |
| `spectre_shadow_step` | Shadow Step | 如影随形 | 基础 |
| `spectre_dispersion` | Dispersion | 折射 | 基础 |
| `spectre_desolate` | Desolate | 荒芜 | 先天 |
| `spectre_haunt` | Haunt | 鬼影重重 | 终极 |

## 远古冰魄 Ancient Apparition（id 68）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `ancient_apparition_cold_feet` | Cold Feet | 寒霜之足 | 基础 |
| `ancient_apparition_ice_vortex` | Ice Vortex | 冰霜漩涡 | 基础 |
| `ancient_apparition_chilling_touch` | Chilling Touch | 极寒之触 | 基础 |
| `ancient_apparition_bone_chill` | Bone Chill | 刺骨严寒 | 先天 |
| `ancient_apparition_ice_blast` | Ice Blast | 冰晶爆轰 | 终极 |

## 末日使者 Doom（id 69）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `doom_bringer_devour` | Devour | 吞噬 | 基础 |
| `doom_bringer_scorched_earth` | Scorched Earth | 焦土 | 基础 |
| `doom_bringer_infernal_blade` | Infernal Blade | 阎刃 | 基础 |
| `doom_bringer_doom` | Doom | 末日 | 终极 |
| `doom_bringer_lvl_pain` | Lvl ? Pain | 等级？痛苦 | 先天 |

## 熊战士 Ursa（id 70）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `ursa_earthshock` | Earthshock | 震撼大地 | 基础 |
| `ursa_overpower` | Overpower | 超强力量 | 基础 |
| `ursa_fury_swipes` | Fury Swipes | 怒意狂击 | 基础 |
| `ursa_maul` | Maul | 暴烈之爪 | 先天 |
| `ursa_enrage` | Enrage | 激怒 | 终极 |

## 裂魂人 Spirit Breaker（id 71）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `spirit_breaker_charge_of_darkness` | Charge of Darkness | 暗影冲刺 | 基础 |
| `spirit_breaker_bulldoze` | Bulldoze | 威吓 | 基础 |
| `spirit_breaker_greater_bash` | Greater Bash | 巨力重击 | 基础 |
| `spirit_breaker_planar_pocket` | Planar Pocket | 位面空洞 | 基础 |
| `spirit_breaker_bull_rush` | Empowering Haste | 神行太保 | 先天 |
| `spirit_breaker_nether_strike` | Nether Strike | 幽冥一击 | 终极 |

## 矮人直升机 Gyrocopter（id 72）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `gyrocopter_rocket_barrage` | Rocket Barrage | 火箭弹幕 | 基础 |
| `gyrocopter_homing_missile` | Homing Missile | 追踪导弹 | 基础 |
| `gyrocopter_flak_cannon` | Flak Cannon | 高射火炮 | 基础 |
| `gyrocopter_afterburner` | Afterburner | 加力燃烧器 | 先天 |
| `gyrocopter_side_gunner_spawn_ability` | Side Gunner | 侧翼机枪 | 基础 |
| `gyrocopter_call_down` | Call Down | 召唤飞弹 | 终极 |

## 炼金术士 Alchemist（id 73）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `alchemist_acid_spray` | Acid Spray | 酸性喷雾 | 基础 |
| `alchemist_unstable_concoction` | Unstable Concoction | 不稳定化合物 | 基础 |
| `alchemist_corrosive_weaponry` | Corrosive Weaponry | 腐蚀兵械 | 基础 |
| `alchemist_berserk_potion` | Berserk Potion | 狂暴药剂 | 基础 |
| `alchemist_goblins_greed` | Greevil's Greed | 贪魔的贪婪 | 先天 |
| `alchemist_chemical_rage` | Chemical Rage | 化学狂暴 | 终极 |

## 祈求者 Invoker（id 74）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `invoker_quas` | Quas | 冰 | 基础 |
| `invoker_wex` | Wex | 雷 | 基础 |
| `invoker_exort` | Exort | 火 | 基础 |
| `invoker_invoke` | Invoke | 元素祈唤 | 先天·终极 |
| `invoker_cold_snap` | Cold Snap | 急速冷却 | 基础 |
| `invoker_ghost_walk` | Ghost Walk | 幽灵漫步 | 基础 |
| `invoker_tornado` | Tornado | 强袭飓风 | 基础 |
| `invoker_emp` | E.M.P. | 电磁脉冲 | 基础 |
| `invoker_alacrity` | Alacrity | 灵动迅捷 | 基础 |
| `invoker_chaos_meteor` | Chaos Meteor | 混沌陨石 | 基础 |
| `invoker_sun_strike` | Sun Strike | 阳炎冲击 | 基础 |
| `invoker_forge_spirit` | Forge Spirit | 熔炉精灵 | 基础 |
| `invoker_ice_wall` | Ice Wall | 寒冰之墙 | 基础 |
| `invoker_deafening_blast` | Deafening Blast | 超震声波 | 基础 |

## 沉默术士 Silencer（id 75）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `silencer_curse_of_the_silent` | Arcane Curse | 奥术诅咒 | 基础 |
| `silencer_glaives_of_wisdom` | Glaives of Wisdom | 智慧之刃 | 基础 |
| `silencer_last_word` | Last Word | 遗言 | 基础 |
| `silencer_brain_drain` | Suffer In Silence | 默默受苦 | 先天 |
| `silencer_global_silence` | Global Silence | 全领域静默 | 终极 |

## 殁境神蚀者 Outworld Destroyer（id 76）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `obsidian_destroyer_arcane_orb` | Arcane Orb | 奥术天球 | 基础 |
| `obsidian_destroyer_astral_imprisonment` | Astral Imprisonment | 星体禁锢 | 基础 |
| `obsidian_destroyer_objurgation` | Objurgation | 责难 | 基础 |
| `obsidian_destroyer_equilibrium` | Essence Flux | 精华变迁 | 先天 |
| `obsidian_destroyer_sanity_eclipse` | Sanity's Eclipse | 神智之蚀 | 终极 |

## 狼人 Lycan（id 77）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `lycan_summon_wolves` | Summon Wolves | 召狼 | 基础 |
| `lycan_howl` | Howl | 嗥叫 | 基础 |
| `lycan_feral_impulse` | Feral Impulse | 野性驱使 | 基础 |
| `lycan_wolf_bite` | Wolf Bite | 饿狼撕咬 | 基础 |
| `lycan_apex_predator` | Apex Predator | 顶级掠食者 | 先天 |
| `lycan_shapeshift` | Shapeshift | 变身 | 终极 |

## 酒仙 Brewmaster（id 78）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `brewmaster_thunder_clap` | Thunder Clap | 雷霆一击 | 基础 |
| `brewmaster_cinder_brew` | Cinder Brew | 余烬佳酿 | 基础 |
| `brewmaster_drunken_brawler` | Drunken Brawler | 醉拳 | 基础 |
| `brewmaster_liquid_courage` | Liquid Courage | 壮胆酒 | 先天 |
| `brewmaster_primal_split` | Primal Split | 元素分离 | 终极 |

## 暗影恶魔 Shadow Demon（id 79）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `shadow_demon_disruption` | Disruption | 崩裂禁锢 | 基础 |
| `shadow_demon_disseminate` | Disseminate | 散播 | 基础 |
| `shadow_demon_shadow_poison` | Shadow Poison | 暗影剧毒 | 基础 |
| `shadow_demon_demonic_cleanse` | Demonic Cleanse | 邪恶净愈 | 基础 |
| `shadow_demon_demonic_purge` | Demonic Purge | 邪恶净化 | 终极 |
| `shadow_demon_menace` | Menace | 威胁 | 先天 |

## 独行德鲁伊 Lone Druid（id 80）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `lone_druid_entangle` | Entangle | 缠绕之根 | 基础 |
| `lone_druid_spirit_link` | Spirit Link | 灵魂链接 | 基础 |
| `lone_druid_savage_roar` | Savage Roar | 野蛮咆哮 | 基础 |
| `lone_druid_spirit_bear` | Summon Spirit Bear | 熊灵伙伴 | 先天 |
| `lone_druid_true_form` | True Form | 真熊形态 | 终极 |

## 混沌骑士 Chaos Knight（id 81）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `chaos_knight_chaos_bolt` | Chaos Bolt | 混乱之箭 | 基础 |
| `chaos_knight_reality_rift` | Reality Rift | 实相裂隙 | 基础 |
| `chaos_knight_chaos_strike` | Chaos Strike | 混沌一击 | 基础 |
| `chaos_knight_fundamental_forging` | Fundamental Forging | 基本法则锻造 | 先天 |
| `chaos_knight_phantasm` | Phantasm | 混沌之军 | 终极 |

## 米波 Meepo（id 82）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `meepo_earthbind` | Earthbind | 地之束缚 | 基础 |
| `meepo_poof` | Poof | 忽悠 | 基础 |
| `meepo_ransack` | Ransack | 洗劫 | 基础 |
| `meepo_petrify` | Dig | 掘地 | 基础 |
| `meepo_megameepo` | MegaMeepo | 超大米波 | 基础 |
| `meepo_divided_we_stand` | Divided We Stand | 分则能成 | 终极 |
| `meepo_geomancy` | Geomancy | 地卜术 | 先天 |
| `meepo_megameepo_fling` | MegaMeepo Fling | 超大米波摔扔 | 基础 |

## 树精卫士 Treant Protector（id 83）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `treant_natures_grasp` | Nature's Grasp | 自然卷握 | 基础 |
| `treant_leech_seed` | Leech Seed | 寄生种子 | 基础 |
| `treant_living_armor` | Living Armor | 活体护甲 | 基础 |
| `treant_eyes_in_the_forest` | Eyes In The Forest | 丛林之眼 | 基础 |
| `treant_natures_guise` | Nature's Guise | 自然蔽护 | 先天 |
| `treant_overgrowth` | Overgrowth | 疯狂生长 | 终极 |

## 食人魔魔法师 Ogre Magi（id 84）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `ogre_magi_fireblast` | Fireblast | 火焰爆轰 | 基础 |
| `ogre_magi_ignite` | Ignite | 引燃 | 基础 |
| `ogre_magi_bloodlust` | Bloodlust | 嗜血术 | 基础 |
| `ogre_magi_unrefined_fireblast` | Unrefined Fireblast | 未精通的火焰爆轰 | 基础 |
| `ogre_magi_smash` | Fire Shield | 烈火护盾 | 基础 |
| `ogre_magi_dumb_luck` | Dumb Luck | 傻福 | 先天 |
| `ogre_magi_multicast` | Multicast | 多重施法 | 终极 |

## 不朽尸王 Undying（id 85）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `undying_decay` | Decay | 腐朽 | 基础 |
| `undying_soul_rip` | Soul Rip | 噬魂 | 基础 |
| `undying_tombstone` | Tombstone | 墓碑 | 基础 |
| `undying_ceaseless_dirge` | Ceaseless Dirge | 挽歌犹唱 | 先天 |
| `undying_flesh_golem` | Flesh Golem | 血肉傀儡 | 终极 |

## 拉比克 Rubick（id 86）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `rubick_telekinesis` | Telekinesis | 隔空取物 | 基础 |
| `rubick_fade_bolt` | Fade Bolt | 弱化能流 | 基础 |
| `rubick_arcane_supremacy` | Arcane Supremacy | 奥术至尊 | 基础 |
| `rubick_spell_steal` | Spell Steal | 技能窃取 | 终极 |
| `rubick_curiosity` | Curiosity | 奇心 | 先天 |

## 干扰者 Disruptor（id 87）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `disruptor_thunder_strike` | Thunder Strike | 风雷之击 | 基础 |
| `disruptor_glimpse` | Glimpse | 恶念瞥视 | 基础 |
| `disruptor_kinetic_field` | Kinetic Field | 动能力场 | 基础 |
| `disruptor_kinetic_fence` | Kinetic Fence | 动能栅栏 | 基础 |
| `disruptor_electromagnetic_repulsion` | Electromagnetic Repulsion | 电磁排斥 | 先天 |
| `disruptor_static_storm` | Static Storm | 静态风暴 | 终极 |

## 司夜刺客 Nyx Assassin（id 88）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `nyx_assassin_impale` | Impale | 穿刺 | 基础 |
| `nyx_assassin_jolt` | Mind Flare | 神智爆裂 | 基础 |
| `nyx_assassin_spiked_carapace` | Spiked Carapace | 尖刺外壳 | 基础 |
| `nyx_assassin_burrow` | Burrow | 钻地 | 基础 |
| `nyx_assassin_neuro_sting` | Mana Burn | 法力燃烧 | 先天 |
| `nyx_assassin_vendetta` | Vendetta | 复仇 | 终极 |

## 娜迦海妖 Naga Siren（id 89）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `naga_siren_mirror_image` | Mirror Image | 镜像 | 基础 |
| `naga_siren_ensnare` | Ensnare | 诱捕 | 基础 |
| `naga_siren_rip_tide` | Rip Tide | 激流 | 基础 |
| `naga_siren_eelskin` | Eelskin | 鳗鱼皮 | 先天 |
| `naga_siren_song_of_the_siren` | Song of the Siren | 海妖之歌 | 终极 |

## 光之守卫 Keeper of the Light（id 90）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `keeper_of_the_light_illuminate` | Illuminate | 冲击波 | 基础 |
| `keeper_of_the_light_blinding_light` | Blinding Light | 致盲之光 | 基础 |
| `keeper_of_the_light_chakra_magic` | Chakra Magic | 查克拉魔法 | 基础 |
| `keeper_of_the_light_radiant_bind` | Solar Bind | 炎阳之缚 | 基础 |
| `keeper_of_the_light_will_o_wisp` | Will-O-Wisp | 灵光 | 基础 |
| `keeper_of_the_light_spirit_form` | Spirit Form | 灵魂形态 | 终极 |
| `keeper_of_the_light_bright_speed` | Bright Speed | 光明速度 | 先天 |

## 艾欧 Io（id 91）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `wisp_tether` | Tether | 羁绊 | 基础 |
| `wisp_spirits` | Spirits | 幽魂 | 基础 |
| `wisp_overcharge` | Overcharge | 过载 | 基础 |
| `wisp_spirits_in` | Spirits In | 拉近幽魂 | 基础 |
| `wisp_spirits_out` | Spirits Out | 拉远幽魂 | 基础 |
| `wisp_relocate` | Relocate | 降临 | 终极 |
| `wisp_equilibrium` | Equilibrium | 衡势 | 先天 |

## 维萨吉 Visage（id 92）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `visage_grave_chill` | Grave Chill | 黄泉颤抖 | 基础 |
| `visage_soul_assumption` | Soul Assumption | 灵魂超度 | 基础 |
| `visage_gravekeepers_cloak` | Gravekeeper's Cloak | 陵卫斗篷 | 基础 |
| `visage_silent_as_the_grave` | Silent as the Grave | 静如古墓 | 先天 |
| `visage_summon_familiars` | Summon Familiars | 召唤佣兽 | 终极 |

## 斯拉克 Slark（id 93）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `slark_dark_pact` | Dark Pact | 黑暗契约 | 基础 |
| `slark_pounce` | Pounce | 突袭 | 基础 |
| `slark_saltwater_shiv` | Saltwater Shiv | 海浪短刀 | 基础 |
| `slark_depth_shroud` | Depth Shroud | 深海护罩 | 基础 |
| `slark_essence_shift` | Essence Shift | 能量转移 | 先天 |
| `slark_shadow_dance` | Shadow Dance | 暗影之舞 | 终极 |

## 美杜莎 Medusa（id 94）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `medusa_split_shot` | Split Shot | 分裂箭 | 基础 |
| `medusa_mystic_snake` | Mystic Snake | 秘术异蛇 | 基础 |
| `medusa_gorgon_grasp` | Gorgon's Grasp | 罗网箭阵 | 基础 |
| `medusa_cold_blooded` | Cold Blooded | 冷血动物 | 基础 |
| `medusa_mana_shield` | Mana Shield | 魔法盾 | 先天 |
| `medusa_stone_gaze` | Stone Gaze | 石化凝视 | 终极 |

## 巨魔战将 Troll Warlord（id 95）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `troll_warlord_switch_stance` | Battle Stance | 战斗姿态 | 先天 |
| `troll_warlord_whirling_axes_ranged` | Whirling Axes (Ranged) | 旋风飞斧（远程） | 基础 |
| `troll_warlord_whirling_axes_melee` | Whirling Axes (Melee) | 旋风飞斧（近战） | 基础 |
| `troll_warlord_fervor` | Fervor | 热血战魂 | 基础 |
| `troll_warlord_berserkers_rage` | Berserker's Rage | 狂战士之怒 | 基础 |
| `troll_warlord_battle_trance` | Battle Trance | 战斗专注 | 终极 |

## 半人马战行者 Centaur Warrunner（id 96）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `centaur_hoof_stomp` | Hoof Stomp | 马蹄践踏 | 基础 |
| `centaur_double_edge` | Double Edge | 双刃剑 | 基础 |
| `centaur_return` | Retaliate | 反伤 | 基础 |
| `centaur_work_horse` | Work Horse | 马到成功 | 基础 |
| `centaur_stampede` | Stampede | 奔袭冲撞 | 终极 |
| `centaur_horsepower` | Horsepower | 开足马力 | 先天 |

## 马格纳斯 Magnus（id 97）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `magnataur_shockwave` | Shockwave | 震荡波 | 基础 |
| `magnataur_empower` | Empower | 授予力量 | 基础 |
| `magnataur_skewer` | Skewer | 巨角冲撞 | 基础 |
| `magnataur_horn_toss` | Horn Toss | 长角抛物 | 基础 |
| `magnataur_solid_core` | Solid Core | 坚固核心 | 先天 |
| `magnataur_reverse_polarity` | Reverse Polarity | 两极反转 | 终极 |

## 伐木机 Timbersaw（id 98）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `shredder_whirling_death` | Whirling Death | 死亡旋风 | 基础 |
| `shredder_timber_chain` | Timber Chain | 伐木锯链 | 基础 |
| `shredder_reactive_armor` | Reactive Armor | 活性护甲 | 基础 |
| `shredder_flamethrower` | Flamethrower | 喷火装置 | 基础 |
| `shredder_chakram` | Chakram | 锯齿飞轮 | 终极 |
| `shredder_exposure_therapy` | Exposure Therapy | 暴露疗法 | 先天 |

## 钢背兽 Bristleback（id 99）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `bristleback_viscous_nasal_goo` | Viscous Nasal Goo | 粘稠鼻液 | 基础 |
| `bristleback_quill_spray` | Quill Spray | 刺针扫射 | 基础 |
| `bristleback_bristleback` | Bristleback | 钢毛后背 | 基础 |
| `bristleback_hairball` | Hairball | 毛团 | 基础 |
| `bristleback_warpath` | Warpath | 战意 | 终极 |
| `bristleback_prickly` | Prickly | 尖刺在背 | 先天 |

## 巨牙海民 Tusk（id 100）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `tusk_ice_shards` | Ice Shards | 寒冰碎片 | 基础 |
| `tusk_snowball` | Snowball | 雪球 | 基础 |
| `tusk_tag_team` | Tag Team | 摔角行家 | 基础 |
| `tusk_drinking_buddies` | Drinking Buddies | 酒友 | 基础 |
| `tusk_walrus_kick` | Walrus Kick | 海象飞踢 | 基础 |
| `tusk_walrus_punch` | Walrus PUNCH! | 海象神拳！ | 终极 |
| `tusk_bitter_chill` | Bitter Chill | 严寒 | 先天 |

## 天怒法师 Skywrath Mage（id 101）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `skywrath_mage_arcane_bolt` | Arcane Bolt | 奥法鹰隼 | 基础 |
| `skywrath_mage_concussive_shot` | Concussive Shot | 震荡光弹 | 基础 |
| `skywrath_mage_ancient_seal` | Ancient Seal | 上古封印 | 基础 |
| `skywrath_mage_shield_of_the_scion` | Shield of the Scion | 天裔之盾 | 先天 |
| `skywrath_mage_mystic_flare` | Mystic Flare | 神秘之耀 | 终极 |

## 亚巴顿 Abaddon（id 102）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `abaddon_death_coil` | Mist Coil | 迷雾缠绕 | 基础 |
| `abaddon_aphotic_shield` | Aphotic Shield | 无光之盾 | 基础 |
| `abaddon_frostmourne` | Curse of Avernus | 魔霭诅咒 | 基础 |
| `abaddon_withering_mist` | Withering Mist | 凋零迷雾 | 先天 |
| `abaddon_borrowed_time` | Borrowed Time | 回光返照 | 终极 |

## 上古巨神 Elder Titan（id 103）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `elder_titan_echo_stomp` | Echo Stomp | 回音重踏 | 基础 |
| `elder_titan_ancestral_spirit` | Astral Spirit | 灵体游魂 | 基础 |
| `elder_titan_natural_order` | Natural Order | 自然秩序 | 基础 |
| `elder_titan_momentum` | Momentum | 动量 | 先天 |
| `elder_titan_earth_splitter` | Earth Splitter | 裂地沟壑 | 终极 |

## 军团指挥官 Legion Commander（id 104）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `legion_commander_overwhelming_odds` | Overwhelming Odds | 压倒性优势 | 基础 |
| `legion_commander_press_the_attack` | Press The Attack | 强攻 | 基础 |
| `legion_commander_moment_of_courage` | Moment of Courage | 勇气之霎 | 基础 |
| `legion_commander_outfight_them` | Outfight Them! | 迎难而战！ | 先天 |
| `legion_commander_duel` | Duel | 决斗 | 终极 |

## 工程师 Techies（id 105）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `techies_sticky_bomb` | Sticky Bomb | 粘性炸弹 | 基础 |
| `techies_reactive_tazer` | Reactive Tazer | 活性电击 | 基础 |
| `techies_suicide` | Blast Off! | 爆破起飞！ | 基础 |
| `techies_mutually_assured_destruction` | M.A.D. | 同归于尽 | 先天 |
| `techies_minefield_sign` | Minefield Sign | 雷区标识 | 基础 |
| `techies_land_mines` | Proximity Mines | 感应地雷 | 终极 |

## 灰烬之灵 Ember Spirit（id 106）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `ember_spirit_searing_chains` | Searing Chains | 炎阳索 | 基础 |
| `ember_spirit_sleight_of_fist` | Sleight of Fist | 无影拳 | 基础 |
| `ember_spirit_flame_guard` | Flame Guard | 烈火罩 | 基础 |
| `ember_spirit_activate_fire_remnant` | Activate Fire Remnant | 激活残焰 | 基础 |
| `ember_spirit_immolation` | Immolation | 献祭心 | 先天 |
| `ember_spirit_fire_remnant` | Fire Remnant | 残焰 | 终极 |

## 大地之灵 Earth Spirit（id 107）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `earth_spirit_boulder_smash` | Boulder Smash | 巨石冲击 | 基础 |
| `earth_spirit_rolling_boulder` | Rolling Boulder | 巨石翻滚 | 基础 |
| `earth_spirit_geomagnetic_grip` | Geomagnetic Grip | 地磁之握 | 基础 |
| `earth_spirit_stone_caller` | Stone Remnant | 残岩 | 先天 |
| `earth_spirit_petrify` | Enchant Remnant | 残岩魔咒 | 基础 |
| `earth_spirit_magnetize` | Magnetize | 磁化 | 终极 |

## 孽主 Underlord（id 108）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `abyssal_underlord_firestorm` | Firestorm | 火焰风暴 | 基础 |
| `abyssal_underlord_pit_of_malice` | Pit of Malice | 怨念深渊 | 基础 |
| `abyssal_underlord_atrophy_aura` | Atrophy Aura | 衰退光环 | 基础 |
| `abyssal_underlord_raid_boss` | Invading Force | 侵略大军 | 先天 |
| `abyssal_underlord_dark_portal` | Fiend's Gate | 恶魔之扉 | 终极 |

## 恐怖利刃 Terrorblade（id 109）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `terrorblade_reflection` | Reflection | 倒影 | 基础 |
| `terrorblade_conjure_image` | Conjure Image | 惑幻 | 基础 |
| `terrorblade_metamorphosis` | Metamorphosis | 魔化 | 基础 |
| `terrorblade_demon_zeal` | Demon Zeal | 狂魔 | 基础 |
| `terrorblade_terror_wave` | Terror Wave | 怵潮 | 基础 |
| `terrorblade_sunder` | Sunder | 魂断 | 终极 |
| `terrorblade_dark_unity` | Dark Unity | 暗黑团结 | 先天 |

## 凤凰 Phoenix（id 110）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `phoenix_icarus_dive` | Icarus Dive | 凤凰冲击 | 基础 |
| `phoenix_fire_spirits` | Fire Spirits | 烈火精灵 | 基础 |
| `phoenix_sun_ray` | Sun Ray | 烈日炙烤 | 基础 |
| `phoenix_dying_light` | Dying Light | 消逝之光 | 先天 |
| `phoenix_supernova` | Supernova | 超新星 | 终极 |

## 神谕者 Oracle（id 111）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `oracle_fortunes_end` | Fortune's End | 气运之末 | 基础 |
| `oracle_fates_edict` | Fate's Edict | 命运敕令 | 基础 |
| `oracle_purifying_flames` | Purifying Flames | 涤罪之焰 | 基础 |
| `oracle_rain_of_destiny` | Rain of Destiny | 天命之雨 | 基础 |
| `oracle_false_promise` | False Promise | 虚妄之诺 | 终极 |
| `oracle_prognosticate` | Prognosticate | 预言 | 先天 |

## 寒冬飞龙 Winter Wyvern（id 112）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `winter_wyvern_arctic_burn` | Arctic Burn | 严寒烧灼 | 基础 |
| `winter_wyvern_splinter_blast` | Splinter Blast | 碎裂冲击 | 基础 |
| `winter_wyvern_cold_embrace` | Cold Embrace | 极寒之拥 | 基础 |
| `winter_wyvern_eldwurms_edda` | Eldwurm's Edda | 古龙诗集 | 先天 |
| `winter_wyvern_winters_curse` | Winter's Curse | 寒冬诅咒 | 终极 |

## 天穹守望者 Arc Warden（id 113）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `arc_warden_flux` | Flux | 乱流 | 基础 |
| `arc_warden_magnetic_field` | Magnetic Field | 磁场 | 基础 |
| `arc_warden_spark_wraith` | Spark Wraith | 闪光幽魂 | 基础 |
| `arc_warden_runic_infusion` | Runic Infusion | 神符灌注 | 先天 |
| `arc_warden_tempest_double` | Tempest Double | 风暴双雄 | 终极 |

## 齐天大圣 Monkey King（id 114）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `monkey_king_boundless_strike` | Boundless Strike | 擎天一击 | 基础 |
| `monkey_king_tree_dance` | Tree Dance | 丛林之舞 | 基础 |
| `monkey_king_jingu_mastery` | Jingu Mastery | 如意棒法 | 基础 |
| `monkey_king_mischief` | Mischief | 七十二变 | 先天 |
| `monkey_king_wukongs_command` | Wukong's Command | 猴子猴孙 | 终极 |
| `monkey_king_transfiguration` | Changing of the Guard | 出神入化 | 基础 |

## 邪影芳灵 Dark Willow（id 119）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `dark_willow_bramble_maze` | Bramble Maze | 荆棘迷宫 | 基础 |
| `dark_willow_shadow_realm` | Shadow Realm | 暗影之境 | 基础 |
| `dark_willow_cursed_crown` | Cursed Crown | 诅咒王冠 | 基础 |
| `dark_willow_bedlam` | Bedlam | 作祟 | 终极 |
| `dark_willow_pixie_dust` | Pixie Dust | 仙灵粉尘 | 先天 |
| `dark_willow_terrorize` | Terrorize | 恐吓 | 终极 |

## 石鳞剑士 Pangolier（id 120）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `pangolier_swashbuckle` | Swashbuckle | 虚张声势 | 基础 |
| `pangolier_shield_crash` | Shield Crash | 甲盾冲击 | 基础 |
| `pangolier_lucky_shot` | Lucky Shot | 幸运一击 | 基础 |
| `pangolier_rollup` | Roll Up | 卷土重来 | 基础 |
| `pangolier_gyroshell` | Rolling Thunder | 地雷滚滚 | 终极 |
| `pangolier_fortune_favors_the_bold` | Fortune Favors the Bold | 天佑勇者 | 先天 |

## 天涯墨客 Grimstroke（id 121）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `grimstroke_dark_artistry` | Stroke of Fate | 绝笔 | 基础 |
| `grimstroke_ink_creature` | Phantom's Embrace | 戾影 | 基础 |
| `grimstroke_spirit_walk` | Ink Swell | 墨涌 | 基础 |
| `grimstroke_dark_portrait` | Dark Portrait | 暗绘 | 基础 |
| `grimstroke_soul_chain` | Soulbind | 缚魂 | 终极 |
| `grimstroke_ink_trail` | Ink Trail | 墨痕 | 先天 |

## 森海飞霞 Hoodwink（id 123）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `hoodwink_acorn_shot` | Acorn Shot | 爆栗出击 | 基础 |
| `hoodwink_bushwhack` | Bushwhack | 野地奇袭 | 基础 |
| `hoodwink_scurry` | Scurry | 密林奔走 | 基础 |
| `hoodwink_decoy` | Decoy | 诱敌奇术 | 基础 |
| `hoodwink_hunters_boomerang` | Hunter's Boomerang | 猎手旋镖 | 基础 |
| `hoodwink_sharpshooter` | Sharpshooter | 一箭穿心 | 终极 |
| `hoodwink_mistwoods_wayfarer` | Mistwoods Wayfarer | 林渊旅人 | 先天 |

## 虚无之灵 Void Spirit（id 126）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `void_spirit_aether_remnant` | Aether Remnant | 残阴 | 基础 |
| `void_spirit_dissimilate` | Dissimilate | 异化 | 基础 |
| `void_spirit_resonant_pulse` | Resonant Pulse | 共鸣脉冲 | 基础 |
| `void_spirit_intrinsic_edge` | Intrinsic Edge | 内在优势 | 先天 |
| `void_spirit_astral_step` | Astral Step | 太虚之径 | 终极 |

## 电炎绝手 Snapfire（id 128）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `snapfire_scatterblast` | Scatterblast | 电光石火 | 基础 |
| `snapfire_firesnap_cookie` | Firesnap Cookie | 龙炎饼干 | 基础 |
| `snapfire_lil_shredder` | Lil' Shredder | 霹雳铁手 | 基础 |
| `snapfire_gobble_up` | Gobble Up | 血盆大口 | 基础 |
| `snapfire_spit_creep` | Spit Out | 喷吐 | 基础 |
| `snapfire_mortimer_kisses` | Mortimer Kisses | 蜥蜴绝吻 | 终极 |
| `snapfire_boomstick` | Boomstick | 猎枪 | 先天 |

## 玛尔斯 Mars（id 129）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `mars_spear` | Spear of Mars | 战神迅矛 | 基础 |
| `mars_gods_rebuke` | God's Rebuke | 神之谴戒 | 基础 |
| `mars_bulwark` | Bulwark | 护身甲盾 | 基础 |
| `mars_dauntless` | Dauntless | 无畏 | 先天 |
| `mars_arena_of_blood` | Arena Of Blood | 热血竞技场 | 终极 |

## 百戏大王 Ringmaster（id 131）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `ringmaster_tame_the_beasts` | Tame the Beasts | 驯兽术 | 基础 |
| `ringmaster_the_box` | Escape Act | 逃生技 | 基础 |
| `ringmaster_impalement` | Impalement Arts | 尖刀戏 | 基础 |
| `ringmaster_spotlight` | Spotlight | 聚光灯 | 基础 |
| `ringmaster_wheel` | Wheel of Wonder | 奇观轮 | 终极 |
| `ringmaster_dark_carnival_souvenirs` | Dark Carnival Barker | 暗黑狂欢主持 | 先天 |
| `ringmaster_funhouse_mirror` | Funhouse Mirror | 哈哈镜 | 基础 |
| `ringmaster_strongman_tonic` | Strongman Tonic | 强力水 | 基础 |
| `ringmaster_whoopee_cushion` | Whoopee Cushion | 整蛊垫 | 基础 |
| `ringmaster_summon_unicycle` | Unicycle | 独轮车 | 基础 |

## 破晓辰星 Dawnbreaker（id 135）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `dawnbreaker_fire_wreath` | Starbreaker | 星破天惊 | 基础 |
| `dawnbreaker_celestial_hammer` | Celestial Hammer | 上界重锤 | 基础 |
| `dawnbreaker_luminosity` | Luminosity | 熠熠生辉 | 基础 |
| `dawnbreaker_break_of_dawn` | Break of Dawn | 辰星破晓 | 先天 |
| `dawnbreaker_solar_guardian` | Solar Guardian | 天光现世 | 终极 |

## 玛西 Marci（id 136）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `marci_grapple` | Dispose | 过肩摔 | 基础 |
| `marci_companion_run` | Rebound | 回身踢 | 基础 |
| `marci_bodyguard` | Bodyguard | 护卫术 | 基础 |
| `marci_special_delivery` | Special Delivery | 特快专递 | 先天 |
| `marci_unleash` | Unleash | 怒拳破 | 终极 |

## 獸 Primal Beast（id 137）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `primal_beast_onslaught` | Onslaught | 突 | 基础 |
| `primal_beast_trample` | Trample | 踏 | 基础 |
| `primal_beast_uproar` | Uproar | 咤 | 基础 |
| `primal_beast_rock_throw` | Rock Throw | 砸 | 基础 |
| `primal_beast_pulverize` | Pulverize | 捶 | 终极 |
| `primal_beast_colossal` | Colossal | 庞 | 先天 |

## 琼英碧灵 Muerta（id 138）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `muerta_dead_shot` | Dead Shot | 弹无虚发 | 基础 |
| `muerta_the_calling` | The Calling | 唤魂 | 基础 |
| `muerta_gunslinger` | Gunslinger | 神枪在手 | 基础 |
| `muerta_spectral_slug` | Spectral Slug | 幽魂子弹 | 基础 |
| `muerta_pierce_the_veil` | Pierce the Veil | 越界 | 终极 |
| `muerta_supernatural` | Supernatural | 超自然 | 先天 |

## 凯 Kez（id 145）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `kez_echo_slash` | Echo Slash | 回音重斩 | 基础 |
| `kez_grappling_claw` | Grappling Claw | 制敌爪钩 | 基础 |
| `kez_kazurai_katana` | Kazurai Katana | 影武长刀 | 基础 |
| `kez_switch_weapons` | Switch Discipline | 流派变换 | 先天 |
| `kez_raptor_dance` | Raptor Dance | 猛禽之舞 | 终极 |
| `kez_falcon_rush` | Falcon Rush | 天隼冲击 | 基础 |
| `kez_talon_toss` | Talon Toss | 利爪飞掷 | 基础 |
| `kez_shodo_sai` | Shodo Sai | 翔影之钗 | 基础 |
| `kez_ravens_veil` | Raven's Veil | 渡鸦之纱 | 终极 |

## 朗戈 Largo（id 155）

| 内部名 | 英文 | 中文 | 类型 |
|---|---|---|---|
| `largo_catchy_lick` | Catchy Lick | 动人之舐 | 基础 |
| `largo_frogstomp` | Frogstomp | 蛙力千钧 | 基础 |
| `largo_croak_of_genius` | Croak of Genius | 灵呱一闪 | 基础 |
| `largo_encore` | Encore | 安可 | 先天 |
| `largo_amphibian_rhapsody` | Amphibian Rhapsody | 两栖狂想曲 | 终极 |
| `largo_song_fight_song` | Bullbelly Blitz | 巨腹闪电战 | 基础 |
| `largo_song_double_time` | Hotfeet Hustle | 疾步生风 | 基础 |
| `largo_song_good_vibrations` | Island Elixir | 大屿灵药 | 基础 |

共 734 个技能。
