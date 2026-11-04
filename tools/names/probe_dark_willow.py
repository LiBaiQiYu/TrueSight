import json
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1'}


def get(url):
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())


matches = get('https://api.opendota.com/api/heroes/119/matches')
print('dark willow matches:', len(matches))
for item in matches[:12]:
    mid = item['match_id']
    try:
        data = get('https://api.opendota.com/api/matches/%d' % mid)
    except Exception as exc:  # noqa: BLE001
        print(mid, 'fail', exc)
        continue
    players = [p for p in data.get('players', []) if p.get('hero_id') == 119]
    if not players:
        continue
    p = players[0]
    arr = p.get('ability_upgrades_arr') or []
    if not arr:
        continue
    names = []
    for ability_id in arr:
        names.append(ability_id)
    print('match', mid, 'duration', data.get('duration'), 'upgrades', arr[:30])
    if 6340 in arr or 8340 in arr:
        print('  -> has bedlam/terrorize')
        break
