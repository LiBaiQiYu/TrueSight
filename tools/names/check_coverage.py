"""用项目里的真实数据检查：回放/OpenDota 里出现的英雄、装备、技能名能否在表中查到。

两种装备键都要覆盖：回放日志 `item_blink`、OpenDota purchase_log `blink`。
"""
import json

items = json.load(open('data/names/items.json', encoding='utf-8'))
keys = {i['key'] for i in items} | {i['key_od'] for i in items}
abilities = {a['key'] for a in json.load(open('data/names/abilities.json', encoding='utf-8'))}
heroes = json.load(open('data/names/heroes.json', encoding='utf-8'))
hero_keys = {h['key'] for h in heroes}

report = []

raw = json.load(open('replays/9043325109.json', encoding='utf-8'))
purchases, kills = set(), set()
for p in raw['players']:
    purchases |= {b['key'] for b in (p.get('purchase_log') or [])}
    kills |= {k['key'] for k in (p.get('kills_log') or [])}
report.append('OpenDota 比赛 9043325109：')
report.append('  出装键 %d 个（不带 item_ 前缀），未收录：%s' % (len(purchases), sorted(purchases - keys) or '无'))
report.append('  击杀目标键 %d 个，未收录：%s' % (len(kills), sorted(kills - keys - hero_keys) or '无'))

path = 'replays/9043325109-npc_dota_hero_luna.json'
try:
    replay = json.loads(open(path, 'rb').read().decode('utf-8', 'replace'))
except ValueError as exc:
    report.append('回放 JSON 解析失败：%s' % exc)
    replay = None
if replay:
    focus = replay.get('focus', {})
    buys = {p['a'] for p in focus.get('purchases', [])}
    casts = {c['ability'] for c in focus.get('casts', [])}
    units = {p['hero'] for p in replay.get('players', [])}
    report.append('回放解析（露娜，npc_dota_hero_* 前缀）：')
    report.append('  出装键 %d 个，未收录：%s' % (len(buys), sorted(buys - keys) or '无'))
    report.append('  技能名 %d 个，未收录：%s' % (len(casts), sorted(casts - abilities) or '无'))
    report.append('  英雄键 %d 个，未收录：%s' % (len(units), sorted(units - hero_keys) or '无'))

report.append('英雄 ID 范围：%d..%d，共 %d 个' % (
    min(h['id'] for h in heroes), max(h['id'] for h in heroes), len(heroes)))

print('\n'.join(report))
