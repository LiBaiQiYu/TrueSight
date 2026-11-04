"""探针：检查天赋树数据是否齐全（中英文名、层级、取值占位符）。"""
import json
import os
import re
from collections import Counter

RAW = '.cache/names/raw'
heroes = json.load(open(os.path.join(RAW, 'dota2_heroes_zh.json'), encoding='utf-8'))['result']['data']['heroes']

lines = []


def log(*a):
    lines.append(' '.join(str(x) for x in a))


counts = Counter()
missing_cn = []
placeholder = []
types = Counter()
samples = []
all_stats = []

TALENT_LEVELS = {1: 10, 2: 15, 3: 20, 4: 25}

for h in heroes:
    hid = h['id']
    zh = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % hid), encoding='utf-8'))['result']['data']['heroes'][0]
    en = json.load(open(os.path.join(RAW, 'dota2_herodata_en_%d.json' % hid), encoding='utf-8'))['result']['data']['heroes'][0]
    tz = zh.get('talents') or []
    te = {t['name']: t for t in (en.get('talents') or [])}
    counts[len(tz)] += 1
    for t in tz:
        types[t.get('type')] += 1
        if not (t.get('name_loc') or '').strip():
            missing_cn.append(t['name'])
        if re.search(r'\{[^}]+\}', t.get('name_loc') or ''):
            placeholder.append((h['name'], t['name'], t['name_loc'], (te.get(t['name']) or {}).get('name_loc')))
        if 'all_stats' in t['name'] or 'attributes' in t['name'] or '全属性' in (t.get('name_loc') or ''):
            all_stats.append((h['name'], t['name'], t.get('name_loc'), (te.get(t['name']) or {}).get('name_loc')))

log('每英雄天赋数量分布:', dict(counts))
log('天赋 type 分布:', dict(types))
log('缺中文名数量:', len(missing_cn), missing_cn[:10])
log('含占位符数量:', len(placeholder))
for row in placeholder[:8]:
    log('  占位符', row)
log('全属性相关天赋:', len(all_stats))
for row in all_stats[:20]:
    log('  ', row)

# 看一个英雄的完整天赋结构
hid = 2
zh = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % hid), encoding='utf-8'))['result']['data']['heroes'][0]
en = json.load(open(os.path.join(RAW, 'dota2_herodata_en_%d.json' % hid), encoding='utf-8'))['result']['data']['heroes'][0]
en_map = {t['name']: t for t in en.get('talents', [])}
log('')
log('斧王天赋明细:')
for t in zh.get('talents', []):
    e = en_map.get(t['name'], {})
    log(' ', t['name'], '| zh:', t.get('name_loc'), '| en:', e.get('name_loc'),
        '| special_values:', json.dumps(t.get('special_values'), ensure_ascii=False)[:180])

# OpenDota 侧天赋
od_ha = json.load(open(os.path.join(RAW, 'opendota_hero_abilities.json'), encoding='utf-8'))
log('')
log('OpenDota hero_abilities 天赋示例:', json.dumps(od_ha['npc_dota_hero_axe']['talents'][:3], ensure_ascii=False))
od_ab = json.load(open(os.path.join(RAW, 'opendota_abilities.json'), encoding='utf-8'))
sample_talents = {k: od_ab[k].get('dname') for k in od_ab if k.startswith('special_bonus')}
log('OpenDota 天赋 dname 示例:', json.dumps(dict(list(sample_talents.items())[:3]), ensure_ascii=False))
log('OpenDota 天赋条目数:', len(sample_talents), '其中有英文名:', sum(1 for v in sample_talents.values() if v))

open('tools/names/talent_probe.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', len(lines))
