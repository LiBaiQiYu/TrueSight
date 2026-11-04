"""探针 2：天赋的层级顺序、数值来源、OpenDota dname 是否带具体数值。"""
import json
import os
import re

RAW = '.cache/names/raw'
od_ab = json.load(open(os.path.join(RAW, 'opendota_abilities.json'), encoding='utf-8'))
od_ha = json.load(open(os.path.join(RAW, 'opendota_hero_abilities.json'), encoding='utf-8'))
heroes = json.load(open(os.path.join(RAW, 'dota2_heroes_zh.json'), encoding='utf-8'))['result']['data']['heroes']

lines = []
def log(*a): lines.append(' '.join(str(x) for x in a))

# 1) 层级顺序：datafeed 顺序 vs OpenDota 的 level
mismatch = []
for h in heroes[:10]:
    hd = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % h['id']), encoding='utf-8'))['result']['data']['heroes'][0]
    order = [t['name'] for t in hd.get('talents', [])]
    od = od_ha[h['name']]['talents']
    levels = [t['level'] for t in od]
    log(h['name'], 'datafeed顺序:', order[:8])
    log('   OpenDota levels:', levels)

# 2) dname 是否带数值
log('')
log('天赋 dname 抽查：')
for k in ['special_bonus_unique_axe', 'special_bonus_unique_axe_2', 'special_bonus_unique_antimage_5',
          'special_bonus_strength_15', 'special_bonus_all_stats_4', 'special_bonus_unique_antimage',
          'special_bonus_hp_100', 'special_bonus_mp_100', 'special_bonus_unique_axe_8']:
    log(' ', k, '->', repr(od_ab.get(k, {}).get('dname')))

# 3) 占位符与 dname 数字数量是否匹配
stats = {'both': 0, 'cn_only': 0, 'en_only': 0, 'none': 0, 'count_mismatch': 0, 'no_dname': 0}
mismatch_rows = []
for h in heroes:
    hd = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % h['id']), encoding='utf-8'))['result']['data']['heroes'][0]
    en = json.load(open(os.path.join(RAW, 'dota2_herodata_en_%d.json' % h['id']), encoding='utf-8'))['result']['data']['heroes'][0]
    en_map = {t['name']: t for t in en.get('talents', [])}
    for t in hd.get('talents', []):
        cn = t.get('name_loc') or ''
        en_name = (en_map.get(t['name']) or {}).get('name_loc') or ''
        cn_ph = re.findall(r'\{[^}]+\}', cn)
        en_ph = re.findall(r'\{[^}]+\}', en_name)
        dname = (od_ab.get(t['name']) or {}).get('dname')
        if not cn_ph and not en_ph:
            stats['none'] += 1
        elif cn_ph and en_ph:
            stats['both'] += 1
        elif cn_ph:
            stats['cn_only'] += 1
        else:
            stats['en_only'] += 1
        if not dname:
            stats['no_dname'] += 1
            continue
        nums = re.findall(r'-?\d+(?:\.\d+)?', dname)
        if len(cn_ph) and len(nums) != len(cn_ph):
            stats['count_mismatch'] += 1
            if len(mismatch_rows) < 12:
                mismatch_rows.append((t['name'], cn, dname, cn_ph, nums))

log('')
log('占位符统计:', stats)
log('占位符数量与 dname 数字数量不匹配样例:')
for row in mismatch_rows:
    log('  ', row)

# 4) 全属性/属性天赋清单
log('')
log('属性类天赋（力量/敏捷/智力/全属性）:')
attr_cnt = 0
for h in heroes:
    hd = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % h['id']), encoding='utf-8'))['result']['data']['heroes'][0]
    for t in hd.get('talents', []):
        n = t['name']
        if re.search(r'(strength|agility|intelligence|all_stats|attributes)_?\d*$', n) or 'all_stats' in n:
            attr_cnt += 1
            log(' ', h['name'], n, '|', t.get('name_loc'), '|', (od_ab.get(n) or {}).get('dname'))
log('属性类天赋数量:', attr_cnt)

open('tools/names/talent_probe2.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('ok')
