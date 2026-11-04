"""下载名称源数据并缓存到 .cache/names/raw/（可重复运行，已存在则跳过）。

来源：
  dota2 官方 datafeed（schinese）：英雄列表、每个英雄的详细数据（含技能中英文名）、物品列表
  OpenDota dotaconstants：英雄、物品、技能、技能 ID、英雄技能归属
"""
import json
import os
import sys
import time
import urllib.request

UA = {'User-Agent': 'TrueSight/0.1 (+name-sync)'}
RAW = os.path.join('.cache', 'names', 'raw')
DATA = 'https://www.dota2.com/datafeed'
API = 'https://api.opendota.com/api/constants'


def fetch(url, timeout=90):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))


def save(name, obj):
    path = os.path.join(RAW, name + '.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    return os.path.getsize(path)


def cached(name):
    path = os.path.join(RAW, name + '.json')
    if os.path.exists(path) and os.path.getsize(path) > 0:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return None


def main():
    os.makedirs(RAW, exist_ok=True)

    for name, url in [
        ('opendota_heroes', API + '/heroes'),
        ('opendota_items', API + '/items'),
        ('opendota_abilities', API + '/abilities'),
        ('opendota_ability_ids', API + '/ability_ids'),
        ('opendota_item_ids', API + '/item_ids'),
        ('opendota_hero_abilities', API + '/hero_abilities'),
        ('dota2_heroes_zh', DATA + '/herolist?language=schinese'),
        ('dota2_items_zh', DATA + '/itemlist?language=schinese'),
    ]:
        if cached(name) is not None:
            print('skip', name, flush=True)
            continue
        size = save(name, fetch(url))
        print('saved', name, size, flush=True)
        time.sleep(0.3)

    heroes = cached('dota2_heroes_zh')['result']['data']['heroes']
    total = len(heroes)
    for i, hero in enumerate(heroes, 1):
        key = 'dota2_herodata_%d' % hero['id']
        if cached(key) is not None:
            continue
        try:
            payload = fetch('%s/herodata?language=schinese&hero_id=%d' % (DATA, hero['id']))
        except Exception as exc:  # noqa: BLE001
            print('FAIL herodata', hero['id'], hero['name'], exc, flush=True)
            continue
        save(key, payload)
        print('herodata %d/%d %s' % (i, total, hero['name']), flush=True)
        time.sleep(0.15)


if __name__ == '__main__':
    sys.exit(main())
