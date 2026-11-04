"""校验生成的数据集：结构一致性 + 与已知译名抽查。"""
import json
import os
import re
import sys

DATA = 'data/names'
OUT = 'tools/names/verify.txt'
lines = []
fails = []


def log(*a):
    lines.append(' '.join(str(x) for x in a))


def check(cond, msg):
    if not cond:
        fails.append(msg)
        log('FAIL', msg)


heroes = json.load(open(os.path.join(DATA, 'heroes.json'), encoding='utf-8'))
abilities = json.load(open(os.path.join(DATA, 'abilities.json'), encoding='utf-8'))
talents_all = json.load(open(os.path.join(DATA, 'talents.json'), encoding='utf-8'))
items = json.load(open(os.path.join(DATA, 'items.json'), encoding='utf-8'))
meta = json.load(open(os.path.join(DATA, 'meta.json'), encoding='utf-8'))

talents = [t for t in talents_all if t['key'] != 'special_bonus_attributes']
attribute_bonus = [t for t in talents_all if t['key'] == 'special_bonus_attributes']

log('counts:', meta['counts'])
log('talents:', len(talents), 'attribute bonus records:', len(attribute_bonus))

# 唯一性
for name, rows, key in [('hero', heroes, 'key'), ('ability', abilities, 'key'),
                        ('item', items, 'key')]:
    keys = [r[key] for r in rows]
    check(len(keys) == len(set(keys)), '%s 内部名重复' % name)
    ids = [r['id'] for r in rows if r['id'] is not None]
    check(len(ids) == len(set(ids)), '%s ID 重复' % name)

# 英雄完整性
check(len(heroes) == 127, '英雄数量不是 127')
for h in heroes:
    check(bool(h['cn']), '英雄 %s 缺中文' % h['key'])
    check(bool(h['en']), '英雄 %s 缺英文' % h['key'])
    check(re.search(r'[\u4e00-\u9fff]', h['cn']) is not None, '英雄 %s 中文不含汉字：%s' % (h['key'], h['cn']))
    check(h['ability_count'] == len([a for a in abilities if a['hero_id'] == h['id']]), '英雄 %s 技能数不一致' % h['key'])

# 技能完整性
hero_ids = {h['id'] for h in heroes}
for a in abilities:
    check(a['hero_id'] in hero_ids, '技能 %s 英雄不存在' % a['key'])
    check(bool(a['cn']) and bool(a['en']), '技能 %s 名称缺失' % a['key'])
    check(re.search(r'[\u4e00-\u9fff]', a['cn']) is not None, '技能 %s 中文不含汉字：%s' % (a['key'], a['cn']))
    check(a['type'] in ('基础', '终极', '先天', '先天·终极'), '技能 %s 类型异常：%s' % (a['key'], a['type']))

# 中文里混入纯英文（未翻译）检查
for a in abilities:
    if re.fullmatch(r'[A-Za-z0-9 \'\-()]+', a['cn']):
        log('WARN 技能中文为纯英文：%s -> %s' % (a['key'], a['cn']))

# 天赋：通用天赋会被多个英雄共用，唯一性按 (hero_id, key) 算
combos = [(t['hero_id'], t['key']) for t in talents]
check(len(combos) == len(set(combos)), '天赋 (英雄, 内部名) 重复')
for t in talents:
    check(t['tier'] in (1, 2, 3, 4), '天赋 %s 层级异常' % t['key'])
    check(t['tier_source'] in ('opendota', 'inferred', 'position'), '天赋 %s 层级来源异常' % t['key'])
    if t['tier_source'] == 'opendota':
        check(t['od_tier'] == t['tier'], '天赋 %s OpenDota 层级不一致' % t['key'])
    elif t['tier_source'] == 'inferred':
        check(bool(t['replaced']), '天赋 %s 推断层级但没有被替换项' % t['key'])
log('层级来源统计：', {s: sum(1 for t in talents if t['tier_source'] == s) for s in ('opendota', 'inferred', 'position')})
log('通用天赋（被多个英雄共用）：', len({k for k, v in __import__('collections').Counter(t['key'] for t in talents).items() if v > 1}))

# 天赋完整性
UNLOCK = {1: [10, 27], 2: [15, 28], 3: [20, 29], 4: [25, 30]}
check(len(talents) == 1016, '天赋数量不是 1016')
check(len(attribute_bonus) == 1, '属性附加记录数量不对')
if attribute_bonus:
    check(attribute_bonus[0]['id'] == 730, '属性附加 ID 不是 730')
    check(attribute_bonus[0]['cn'] == '属性附加', '属性附加中文名不对')
    check(attribute_bonus[0]['max_level'] == 7, '属性附加等级上限不是 7')
    check(attribute_bonus[0]['value_per_level'] == 2, '属性附加每级不是 +2')
    check('npc_dota_hero_invoker' in attribute_bonus[0]['excluded_heroes'], '属性附加没排除祈求者')
for h in heroes:
    rows = [t for t in talents if t['hero_id'] == h['id']]
    check(len(rows) == 8, '英雄 %s 天赋数不是 8：%d' % (h['key'], len(rows)))
    for tier in (1, 2, 3, 4):
        check(len([t for t in rows if t['tier'] == tier]) == 2,
              '英雄 %s 第 %d 层天赋数不是 2' % (h['key'], tier))
for t in talents:
    check(t['unlock_levels'] == UNLOCK.get(t['tier']), '天赋 %s 解锁等级异常' % t['key'])
    check(bool(t['cn']) and bool(t['en']), '天赋 %s 名称缺失' % t['key'])
    check(re.search(r'[\u4e00-\u9fff]', t['cn']) is not None, '天赋 %s 中文不含汉字：%s' % (t['key'], t['cn']))
    if not t['resolved']:
        check('{s:' in t['cn'], '天赋 %s 标记未解析但中文里没有占位符' % t['key'])
log('天赋未解析：', [t['key'] for t in talents if not t['resolved']])

# 装备完整性
for it in items:
    check(it['id'] is not None, '装备 %s 缺 ID' % it['key'])
    if it['cn']:
        check(re.search(r'[\u4e00-\u9fff]', it['cn']) is not None or it['cn'] == it['en'],
              '装备 %s 中文异常：%s' % (it['key'], it['cn']))
    if it['cn_source'] in ('official', 'official-fixed'):
        check(bool(it['cn']), '装备 %s 标记官方中文但为空' % it['key'])

# 抽查（期望值来自官方译名，用于发现错位）
hero_expect = {1: '敌法师', 2: '斧王', 26: '莱恩', 74: '祈求者', 76: '殁境神蚀者', 54: '噬魂鬼', 109: '恐怖利刃', 93: '斯拉克'}
for hid, cn in hero_expect.items():
    got = next(h['cn'] for h in heroes if h['id'] == hid)
    check(got == cn, '英雄 %d 期望 %s，实际 %s' % (hid, cn, got))

ability_expect = {
    'antimage_mana_void': '法力虚空',
    'axe_culling_blade': '淘汰之刃',
    'pudge_meat_hook': '肉钩',
    'lina_laguna_blade': '神灭斩',
    'sven_storm_bolt': '风暴之拳',
    'zuus_thundergods_wrath': '雷神之怒',
    'crystal_maiden_freezing_field': '极寒领域',
    'lion_finger_of_death': '死亡之指',
    'earthshaker_echo_slam': '回音击',
    'juggernaut_omni_slash': '无敌斩',
    'faceless_void_chronosphere': '时间结界',
    'medusa_stone_gaze': '石化凝视',
    'spectre_haunt': '鬼影重重',
    'tidehunter_ravage': '毁灭',
    'tiny_avalanche': '山崩',
    'invoker_sun_strike': '阳炎冲击',
    'puck_dream_coil': '梦境缠绕',
    'mirana_starfall': '群星风暴',
    'windrunner_powershot': '强力击',
    'necrolyte_reapers_scythe': '死神镰刀',
    'phantom_assassin_coup_de_grace': '恩赐解脱',
    'templar_assassin_psi_blades': '灵能之刃',
    'nevermore_requiem': '魂之挽歌',
}
for key, cn in ability_expect.items():
    row = next((a for a in abilities if a['key'] == key), None)
    if row is None:
        log('WARN 抽查技能不存在：', key)
        continue
    check(row['cn'] == cn, '技能 %s 期望 %s，实际 %s' % (key, cn, row['cn']))

talent_expect = {
    'special_bonus_unique_axe_2': '+85 狂战士之吼范围',
    'special_bonus_unique_antimage_5': '+9%/18% 绝人之路最低/最高减速',
    'special_bonus_all_stats_4': '+4 全属性',
    'special_bonus_unique_pudge_4': '+10% 腐烂减速',
    'special_bonus_unique_razor_2': '-0.1秒 风暴之眼打击间隔',
    'special_bonus_unique_vengeful_spirit_4': '-3 恐怖波动降低护甲',
}
for key, cn in talent_expect.items():
    row = next((t for t in talents if t['key'] == key), None)
    if row is None:
        log('WARN 抽查天赋不存在：', key)
        continue
    check(row['cn'] == cn, '天赋 %s 期望 %s，实际 %s' % (key, cn, row['cn']))

item_expect = {
    'item_blink': '闪烁匕首',
    'item_black_king_bar': '黑皇杖',
    'item_ultimate_scepter': '阿哈利姆神杖',
    'item_guardian_greaves': '卫士胫甲',
    'item_arcane_boots': '奥术鞋',
    'item_power_treads': '动力鞋',
    'item_hand_of_midas': '迈达斯之手',
    'item_bfury': '狂战斧',
    'item_lesser_crit': '水晶剑',
    'item_greater_crit': '代达罗斯之殇',
    'item_sheepstick': '邪恶镰刀',
    'item_radiance': '辉耀',
    'item_recipe_bfury': '图纸（狂战斧）',
}
for key, cn in item_expect.items():
    row = next((i for i in items if i['key'] == key), None)
    if row is None:
        log('WARN 抽查装备不存在：', key)
        continue
    check(row['cn'] == cn, '装备 %s 期望 %s，实际 %s' % (key, cn, row['cn']))

# 统计
log('英雄技能数分布:', {h['id']: h['ability_count'] for h in sorted(heroes, key=lambda x: -x['ability_count'])[:5]})
log('技能类型分布:', {t: sum(1 for a in abilities if a['type'] == t) for t in ('基础', '终极', '先天', '先天·终极')})
log('装备分类分布:', {})
from collections import Counter
log(str(Counter(i['category'] for i in items)))
log('中文缺失装备:', [i['key'] for i in items if not i['cn']])
log('英文缺失装备:', [i['key'] for i in items if not i['en']])
log('')
log('RESULT:', 'PASS' if not fails else 'FAIL (%d)' % len(fails))

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')
print('verify ->', OUT, 'fails =', len(fails))
sys.exit(1 if fails else 0)
