"""补充下载英文 datafeed，用于中文源的反向校验。"""
import json
import os
import time
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1 (+name-sync)'}
RAW = os.path.join('.cache', 'names', 'raw')
DATA = 'https://www.dota2.com/datafeed'


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode('utf-8'))


def save(name, obj):
    with open(os.path.join(RAW, name + '.json'), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def exists(name):
    p = os.path.join(RAW, name + '.json')
    return os.path.exists(p) and os.path.getsize(p) > 0


def main():
    if not exists('dota2_items_en'):
        save('dota2_items_en', fetch(DATA + '/itemlist?language=english'))
        print('saved items_en', flush=True)
    with open(os.path.join(RAW, 'dota2_heroes_zh.json'), encoding='utf-8') as f:
        heroes = json.load(f)['result']['data']['heroes']
    for i, hero in enumerate(heroes, 1):
        key = 'dota2_herodata_en_%d' % hero['id']
        if exists(key):
            continue
        try:
            save(key, fetch('%s/herodata?language=english&hero_id=%d' % (DATA, hero['id'])))
        except Exception as exc:  # noqa: BLE001
            print('FAIL', hero['id'], exc, flush=True)
            continue
        print('en %d/%d %s' % (i, len(heroes), hero['name']), flush=True)
        time.sleep(0.15)


if __name__ == '__main__':
    main()
