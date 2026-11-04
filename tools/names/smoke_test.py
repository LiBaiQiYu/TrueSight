import json
import re
import urllib.request

BASE = 'http://127.0.0.1:8078'


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=10) as response:
        return response.status, response.read()


for path in ['/', '/api/names?file=talents', '/api/names?file=items',
             '/api/names?file=../server.py', '/api/names?file=nope']:
    try:
        status, body = get(path)
        print(path, status, len(body), body[:60])
    except Exception as exc:  # noqa: BLE001
        print(path, 'FAIL', getattr(exc, 'code', '-'), str(exc)[:80])

_, html_bytes = get('/')
html = html_bytes.decode('utf-8')
match = re.search(r'src="([^"]+\.js)"', html)
print('js:', match.group(1) if match else None)
if match:
    asset = match.group(1).replace('./', '/')
    _, js_bytes = get(asset)
    js = js_bytes.decode('utf-8', 'replace')
    for keyword in ['同位置结论', '属性附加', '技能与天赋', '点击图表跳转']:
        print(keyword, keyword in js)

status, body = get('/api/names?file=talents')
print('talents parsed:', status, len(json.loads(body)))
