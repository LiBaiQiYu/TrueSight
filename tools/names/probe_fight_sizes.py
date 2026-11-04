import json
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1'}


def get(url):
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())


def active_count(fight):
    count = 0
    for p in fight.get('players') or []:
        if not p:
            continue
        if (
            (p.get('damage') or 0) > 0
            or (p.get('healing') or 0) > 0
            or (p.get('deaths') or 0) > 0
            or p.get('ability_uses')
            or p.get('item_uses')
        ):
            count += 1
    return count


for mid in (9043325109, 9075218521):
    data = get('https://api.opendota.com/api/matches/%d' % mid)
    fights = data.get('teamfights') or []
    print('match', mid, 'fights', len(fights))
    for fight in fights:
        start = fight.get('start')
        if start is None or start < 0:
            continue
        count = active_count(fight)
        print(' ', start, '->', fight.get('end'), 'active', count, 'deaths', fight.get('deaths'))
