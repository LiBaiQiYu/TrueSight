"""演示：把 OpenDota 的加点顺序（含天赋、属性附加）翻成中文名，并检查覆盖率。

只读本地缓存的对局，不联网。ID → 名称优先用本地表（比 OpenDota 常量的版本更新）。
"""
import json

MATCH = 'replays/9043325109.json'
DATA = 'data/names'

abilities = {a['key']: a for a in json.load(open(DATA + '/abilities.json', encoding='utf-8'))}
talents_all = json.load(open(DATA + '/talents.json', encoding='utf-8'))
talents = {(t['hero_id'], t['key']): t for t in talents_all if t['key'] != 'special_bonus_attributes'}
talents_by_key = {t['key']: t for t in talents_all if t['key'] != 'special_bonus_attributes'}
attribute_bonus = next(t for t in talents_all if t['key'] == 'special_bonus_attributes')
heroes = {h['id']: h for h in json.load(open(DATA + '/heroes.json', encoding='utf-8'))}
od_ids = json.load(open('.cache/names/raw/opendota_ability_ids.json', encoding='utf-8'))

# 本地 ID 索引：技能 + 天赋（通用天赋的 ID 相同、内部名也相同，不会歧义）
id_index = {}
for a in abilities.values():
    id_index.setdefault(a['id'], a['key'])
for t in talents_all:
    if t.get('id') is not None:
        id_index.setdefault(t['id'], t['key'])


def resolve(ability_id, hero_id):
    key = id_index.get(ability_id) or od_ids.get(str(ability_id))
    if key is None:
        return None, None
    if key == 'special_bonus_attributes':
        return 'attr', attribute_bonus
    if key.startswith('special_bonus'):
        talent = talents.get((hero_id, key)) or talents_by_key.get(key)
        return ('talent', talent) if talent else (None, None)
    ability = abilities.get(key)
    return ('ability', ability) if ability else (None, None)


match = json.load(open(MATCH, encoding='utf-8'))
lines = ['加点序列（OpenDota ability_upgrades_arr → 本地名称表）', '']
unknown = []

for player in match['players']:
    hero = heroes.get(player['hero_id'])
    if not hero:
        continue
    picks = []
    for index, ability_id in enumerate(player.get('ability_upgrades_arr') or [], 1):
        kind, row = resolve(ability_id, hero['id'])
        if kind == 'attr':
            picks.append('%d.属性附加' % index)
        elif kind == 'talent':
            picks.append('%d.%s（%d层）' % (index, row['cn'], row['tier']))
        elif kind == 'ability':
            picks.append('%d.%s' % (index, row['cn']))
        else:
            unknown.append((hero['cn'], ability_id))
            picks.append('%d.?%d' % (index, ability_id))
    lines.append('%s %s（Lv%s，%d 次加点）' % (hero['cn'], hero['en'], player.get('level'), len(picks)))
    lines.append('  ' + ' → '.join(picks))
    lines.append('')

lines.append('未知条目：%d %s' % (len(unknown), unknown or ''))
lines.append('')
lines.append('属性附加：%s / %s，+%d 全属性/级，最多 %d 级，排除 %s' % (
    attribute_bonus['cn'], attribute_bonus['en'], attribute_bonus['value_per_level'],
    attribute_bonus['max_level'], '、'.join(attribute_bonus['excluded_heroes'])))

open('tools/names/skillbuild_demo.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('\n'.join(lines))
