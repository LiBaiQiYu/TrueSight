#!/usr/bin/env python3
"""已废弃：请使用 tools/assets/fetch_images.py。

新版脚本统一抓取英雄头像/小图标、技能图标和装备图标到 ui/public/assets/，
前端默认读取本地文件。本脚本仅保留作历史参考，输出目录 ui/public/items/icons 已不再被前端使用。

用法（项目根目录）：
    runtime\\python\\python.exe -X utf8 tools\\names\\download_item_icons.py
    runtime\\python\\python.exe -X utf8 tools\\names\\download_item_icons.py --out ui/public/items/icons --force
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE = os.path.join(BASE_DIR, 'ui', 'public', 'names', 'items.json')
FALLBACK_SOURCE = os.path.join(BASE_DIR, 'data', 'names', 'items.json')
CDN = 'https://cdn.cloudflare.steamstatic.com'
RECIPE_PATH = '/apps/dota2/images/dota_react/items/recipe.png'
UA = 'Mozilla/5.0 (TrueSight item icon cache)'


def icon_path(item):
    key = item.get('key') or ''
    if item.get('category') == '图纸' or key.startswith('item_recipe_'):
        return RECIPE_PATH
    return '/apps/dota2/images/dota_react/items/%s.png' % key.split('item_', 1)[-1]


def load_items():
    for path in (SOURCE, FALLBACK_SOURCE):
        if os.path.isfile(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
    raise SystemExit('找不到 items.json：请先运行 npm run names（ui 目录）')


def fetch(url, target, force=False):
    if not force and os.path.isfile(target) and os.path.getsize(target) > 0:
        return 'skip'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
            if not data:
                raise IOError('empty response')
            with open(target, 'wb') as f:
                f.write(data)
            return 'ok'
        except Exception as exc:  # noqa: BLE001
            if attempt == 2:
                return 'fail: %s' % exc
            time.sleep(0.6 * (attempt + 1))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', default=os.path.join(BASE_DIR, 'ui', 'public', 'items', 'icons'))
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--workers', type=int, default=16)
    parser.add_argument('--limit', type=int, default=0, help='仅下载前 N 件，便于快速验证')
    args = parser.parse_args()

    items = load_items()
    if args.limit:
        items = items[: args.limit]
    os.makedirs(args.out, exist_ok=True)

    names = {}
    tasks = {}
    for item in items:
        key = item.get('key')
        if not key:
            continue
        filename = 'recipe.png' if icon_path(item) == RECIPE_PATH else '%s.png' % key
        names[key] = filename
        tasks[filename] = CDN + icon_path(item)

    results = {}
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(fetch, url, os.path.join(args.out, filename), args.force): filename
            for filename, url in tasks.items()
        }
        for future in as_completed(futures):
            filename = futures[future]
            results[filename] = future.result()

    ok = sum(1 for v in results.values() if v in ('ok', 'skip'))
    failed = {k: v for k, v in results.items() if v not in ('ok', 'skip')}
    manifest = {
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'source': 'Steam official CDN via OpenDota item constants',
        'count': len(names),
        'files': len(tasks),
        'items': names
    }
    with open(os.path.join(os.path.dirname(args.out), 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    total = sum(os.path.getsize(os.path.join(args.out, name)) for name in tasks if os.path.isfile(os.path.join(args.out, name)))
    print('装备 %d 件，图标文件 %d 个：成功 %d，失败 %d，合计 %.1f KB' % (len(names), len(tasks), ok, len(failed), total / 1024))
    for name, error in list(failed.items())[:10]:
        print('  失败:', name, error)
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main())
