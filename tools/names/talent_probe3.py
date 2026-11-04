"""探针 3：用 ability.special_values[].bonuses[].name == 天赋键 的方式解析天赋数值。"""
import json
import os
import re
from collections import Counter

RAW = '.cache/names/raw'
heroes = json.load(open(os.path.join(RAW, 'dota2_heroes_zh.json'), encoding='utf-8'))['result']['data']['heroes']

lines = []
def log(*a): lines.append(' '.join(str(x) for x in a))

resolved = 0
unresolved = []
sign_samples = []
op_counter = Counter()

for h in heroes:
    hd = json.load(open(os.path.join(RAW, 'dota2_herodata_%d.json' % h['id']), encoding='utf-8'))['result']['data']['heroes'][0]
    # 收集：天赋键 -> {special_value 名: 值}
    bonus_index = {}
    for ab in hd.get('abilities', []):
        for sv in ab.get('special_values', []) or []:
            for b in sv.get('bonuses', []) or []:
                bonus_index.setdefault(b['name'], {})[sv['name']] = b.get('value')
    for t in hd.get('talents', []):
        ph = re.findall(r'\{s:([^}]+)\}', t.get('name_loc') or '')
        if not ph:
            resolved += 1
            continue
        # 1) 天赋自身 special_values（属性类）
        own = {sv['name']: (sv.get('values_float') or [None])[0] for sv in t.get('special_values', []) or []}
        vals = bonus_index.get(t['name'], {})
        ok = True
        detail = []
        for p in ph:
            key = p[len('bonus_'):] if p.startswith('bonus_') else p
            if key in vals and vals[key] is not None:
                detail.append((p, vals[key]))
            elif p in own and own[p] is not None:
                detail.append((p, own[p]))
            elif key in own and own[key] is not None:
                detail.append((p, own[key]))
            else:
                ok = False
        if ok:
            resolved += 1
            if len(sign_samples) < 12 and any(v < 0 for _, v in detail):
                sign_samples.append((t['name'], t['name_loc'], detail))
            for _, v in detail:
                if isinstance(v, float) and not float(v).is_integer():
                    op_counter['float'] += 1
        else:
            unresolved.append((h['name'], t['name'], t.get('name_loc'), detail, vals))

log('可解析数值的天赋:', resolved, '/ 1016')
log('未解析:', len(unresolved))
for row in unresolved[:20]:
    log('  ', row)
log('')
log('负值样例（检查模板符号是否会重复）:')
for row in sign_samples:
    log('  ', row)

# 斧王示例：狂战士之吼范围 85
hd = json.load(open(os.path.join(RAW, 'dota2_herodata_2.json'), encoding='utf-8'))['result']['data']['heroes'][0]
for ab in hd['abilities']:
    for sv in ab.get('special_values', []) or []:
        for b in sv.get('bonuses', []) or []:
            if b['name'] in ('special_bonus_unique_axe_2', 'special_bonus_unique_axe_7', 'special_bonus_unique_axe_4'):
                log('bonus:', ab['name'], sv['name'], sv.get('values_float'), b)

open('tools/names/talent_probe3.txt', 'w', encoding='utf-8').write('\n'.join(lines))
print('ok')
