"""审计：比较 dota2 官方中文源与 OpenDota 常量源，找出名称缺口/冲突。"""
import json
import os
from collections import Counter

RAW = os.path.join('.cache', 'names', 'raw')
OUT = 'tools/names/audit.out.txt'
lines = []


def log(*a):
    lines.append(' '.join(str(x) for x in a))


def load(name):
    with open(os.path.join(RAW, name + '.json'), encoding='utf-8') as f:
        return json.load(f)


od_heroes = load('opendota_heroes')            # {id: {...}}
od_abilities = load('opendota_abilities')      # {name: {...}}
od_ability_ids = load('opendota_ability_ids')  # {id: name}
od_items = load('opendota_items')              # {name_without_item_: {...}}
od_hero_abilities = load('opendota_hero_abilities')
d2_heroes = load('dota2_heroes_zh')['result']['data']['heroes']
d2_items = load('dota2_items_zh')['result']['data']['itemabilities']

log('== 英雄 ==')
log('OpenDota 英雄数:', len(od_heroes), ' dota2 英雄数:', len(d2_heroes))
ids_od = {int(k) for k in od_heroes}
ids_d2 = {h['id'] for h in d2_heroes}
log('ID 仅 OpenDota 有:', sorted(ids_od - ids_d2))
log('ID 仅 dota2 有:', sorted(ids_d2 - ids_od))

en_conflict = []
for h in d2_heroes:
    od = od_heroes.get(str(h['id']))
    if not od:
        continue
    if od.get('name') != h['name']:
        log('内部名不一致:', h['id'], od.get('name'), h['name'])
    a, b = (od.get('localized_name') or '').strip(), (h.get('name_english_loc') or '').strip()
    if a != b:
        en_conflict.append((h['id'], h['name'], a, b))
log('英文显示名冲突数:', len(en_conflict))
for row in en_conflict[:20]:
    log('  冲突', row)

log('')
log('== 技能 ==')
# dota2 per-hero abilities
d2_abs = {}
for h in d2_heroes:
    key = 'dota2_herodata_%d' % h['id']
    if not os.path.exists(os.path.join(RAW, key + '.json')):
        log('缺 herodata:', h['id'], h['name'])
        continue
    hd = load(key)
    hero = hd['result']['data']['heroes'][0]
    for ab in hero.get('abilities', []):
        d2_abs.setdefault(ab['name'], {'ids': set(), 'cn': set(), 'type': set(), 'heroes': set()})
        d2_abs[ab['name']]['ids'].add(ab['id'])
        d2_abs[ab['name']]['cn'].add(ab.get('name_loc') or '')
        d2_abs[ab['name']]['type'].add(ab.get('type'))
        d2_abs[ab['name']]['heroes'].add(h['name'])

log('dota2 英雄技能条目（去重内部名）:', len(d2_abs))
log('type 分布:', Counter(t for v in d2_abs.values() for t in v['type']))
multi_hero = [k for k, v in d2_abs.items() if len(v['heroes']) > 1]
log('同一技能挂在多个英雄下（数量 %d）:' % len(multi_hero), multi_hero[:15])
no_cn = [k for k, v in d2_abs.items() if not any(x.strip() for x in v['cn'])]
log('缺中文名的技能数:', len(no_cn), no_cn[:20])
multi_cn = {k: v['cn'] for k, v in d2_abs.items() if len([x for x in v['cn'] if x]) > 1}
log('同一技能多个中文名:', multi_cn)

no_od = [k for k in d2_abs if k not in od_abilities]
log('OpenDota abilities 中没有的:', len(no_od), no_od[:20])
no_dname = [k for k in d2_abs if k in od_abilities and not (od_abilities[k].get('dname') or '').strip()]
log('OpenDota 技能缺英文显示名:', len(no_dname), no_dname[:30])

# 英雄归属对照：OpenDota hero_abilities vs dota2
ha_gap = []
for h in d2_heroes:
    oda = od_hero_abilities.get(h['name'], {}).get('abilities', [])
    d2a = [ab['name'] for ab in load('dota2_herodata_%d' % h['id'])['result']['data']['heroes'][0].get('abilities', [])]
    missing = [x for x in oda if x not in d2a and x != 'generic_hidden']
    extra = [x for x in d2a if x not in oda]
    if missing or extra:
        ha_gap.append((h['name'], missing, extra))
log('英雄技能归属差异条目数:', len(ha_gap))
for row in ha_gap[:25]:
    log('  ', row)

log('')
log('== 物品 ==')
log('dota2 物品数:', len(d2_items), ' OpenDota 物品数:', len(od_items))
d2_names = {it['name']: it for it in d2_items}
d2_keys = set(d2_names)
od_keys = {'item_' + k for k in od_items}
log('仅 dota2 有:', len(d2_keys - od_keys), sorted(d2_keys - od_keys)[:10])
log('仅 OpenDota 有:', len(od_keys - d2_keys), sorted(od_keys - d2_keys)[:20])
missing_cn = [it for it in d2_items if not (it.get('name_loc') or '').strip()]
log('dota2 物品缺中文名:', len(missing_cn), [it['name'] for it in missing_cn][:20])
item_en_conflict = []
for it in d2_items:
    od = od_items.get(it['name'][5:]) if it['name'].startswith('item_') else None
    if not od:
        continue
    a = (od.get('dname') or '').strip()
    b = (it.get('name_english_loc') or '').strip()
    if a != b:
        item_en_conflict.append((it['name'], a, b))
log('物品英文显示名冲突数:', len(item_en_conflict))
for row in item_en_conflict[:25]:
    log('  冲突', row)

log('')
log('== 旧记忆表对照 ==')
mem = {}
for line in open('memory/dota-items.md', encoding='utf-8'):
    if not line.startswith('| ') or line.startswith('| ID') or line.startswith('|---'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) >= 4 and cells[0].isdigit():
        mem[cells[1].strip('`')] = cells[3]
log('旧表物品行数:', len(mem))
diff_cn = [(k, v, d2_names[k]['name_loc']) for k, v in mem.items() if k in d2_names and v and v != d2_names[k]['name_loc']]
log('旧表与官网中文名不一致数:', len(diff_cn))
for row in diff_cn[:20]:
    log('  ', row)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('report ->', OUT, len(lines), 'lines')
