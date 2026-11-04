import json
import os
import time
import urllib.request

BASE = 'http://127.0.0.1:%s' % os.environ.get('PORT', '8080')
MATCH = os.environ.get('MATCH', '9074689290')
HERO = int(os.environ.get('HERO', '80'))


def post(path, payload):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def get(path):
    return json.loads(urllib.request.urlopen(BASE + path, timeout=30).read())


job = post('/api/parse', {'matchId': MATCH, 'heroId': HERO})
print('job', job)
jid = job['jobId']
started = time.time()
last = ''
while time.time() - started < 900:
    time.sleep(3)
    status = get('/api/parse/status?job=' + jid)
    messages = status.get('messages') or []
    if messages and messages[-1] != last:
        last = messages[-1]
        print(round(time.time() - started), last, flush=True)
    if status.get('state') == 'error':
        print('ERROR', status.get('error'))
        break
    if status.get('state') == 'done':
        result = status.get('result') or {}
        focus = result.get('focus', {})
        print('done. purchases:', len(focus.get('purchases') or []))
        print('keys:', sorted(focus.keys()))
        print('item snapshots:', len(focus.get('items') or []))
        open('.cache/lone_druid_parse.json', 'w', encoding='utf-8').write(json.dumps(result, ensure_ascii=False))
        break
