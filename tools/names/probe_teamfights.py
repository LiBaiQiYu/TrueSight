import json
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1'}


def get(url):
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())


match_id = 9074689290
data = get('https://api.opendota.com/api/matches/%d' % match_id)
fights = data.get('teamfights') or []
print('teamfights:', len(fights))
for fight in fights[:3]:
    players = fight.get('players') or []
    active = [
        i for i, p in enumerate(players)
        if (p.get('damage') or 0) > 0 or (p.get('damage_taken') or 0) > 0
        or (p.get('deaths') or 0) > 0 or (p.get('kills') or 0) > 0
        or p.get('ability_uses') or p.get('item_uses')
    ]
    print('fight', fight.get('start'), '-', fight.get('end'), 'deaths', fight.get('deaths'), 'active', len(active))
    print('  keys:', sorted(players[0].keys()) if players else [])
    if players:
        p = players[active[0]] if active else players[0]
        print('  sample player:', {k: p[k] for k in p if k not in ('ability_uses', 'item_uses', 'damage_inflictor')})
        print('  ability_uses:', list((p.get('ability_uses') or {}).items())[:5])
