import json
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1'}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


matches = get('https://api.opendota.com/api/heroes/80/matches')
print('lone druid matches:', len(matches))
for item in matches[:6]:
    mid = item['match_id']
    try:
        data = get('https://api.opendota.com/api/matches/%d' % mid)
    except Exception as exc:  # noqa: BLE001
        print(mid, 'fetch fail', exc)
        continue
    players = [p for p in data.get('players', []) if p.get('hero_id') == 80]
    if not players:
        continue
    p = players[0]
    if not p.get('ability_upgrades_arr'):
        print(mid, 'not parsed')
        continue
    print('\nmatch', mid, 'duration', data.get('duration'))
    item_keys = sorted(k for k in p.keys() if k.startswith('item_') or k.startswith('backpack'))
    print('item fields:', {k: p[k] for k in item_keys if p.get(k)})
    print('purchase_log sample:', p.get('purchase_log', [])[:12])
    print('total purchases:', len(p.get('purchase_log', [])))
    print('has bear keys:', [k for k in p.keys() if 'bear' in k.lower()])
    print('all keys sample:', [k for k in p.keys() if 'item' in k or 'neutral' in k])
    break
