#!/usr/bin/env python3
"""把英雄头像、技能图标、装备图标下载到项目内（ui/public/assets）。

默认读取 ui/public/names/*.json（由 npm run names 生成），也可以用 --force 重新下载。
下载完成后前端不再依赖 Steam CDN 的图片；缺失文件才会回退到 CDN。

用法（项目根目录）：
    runtime\\python\\python.exe -X utf8 tools\\assets\\fetch_images.py
    runtime\\python\\python.exe -X utf8 tools\\assets\\fetch_images.py --force
    runtime\\python\\python.exe -X utf8 tools\\assets\\fetch_images.py --only heroes
"""
import argparse
import json
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NAMES_DIR = os.path.join(BASE_DIR, 'ui', 'public', 'names')
OUT_DIR = os.path.join(BASE_DIR, 'ui', 'public', 'assets')
CDN = 'https://cdn.cloudflare.steamstatic.com'
HERO_PORTRAIT = '/apps/dota2/images/dota_react/heroes'
HERO_ICON = '/apps/dota2/images/dota_react/heroes/icons'
ABILITY_ICON = '/apps/dota2/images/dota_react/abilities'
ITEM_ICON = '/apps/dota2/images/dota_react/items'
UA = 'Mozilla/5.0 (TrueSight asset cache)'
PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'

# 名称表里没有、但战斗日志会用到且官方 CDN 有独立图标的技能
EXTRA_ABILITY_PATHS = {
    'ability_capture': ABILITY_ICON + '/ability_capture.png',
    'ancient_apparition_ice_blast_release': ABILITY_ICON + '/ancient_apparition_ice_blast_release.png',
}


def load_names(name):
    path = os.path.join(NAMES_DIR, '%s.json' % name)
    if not os.path.isfile(path):
        raise SystemExit('找不到 %s，请先在 ui 目录运行 npm run names' % path)
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def hero_slug(key):
    return str(key or '').replace('npc_dota_hero_', '')


def build_tasks(only):
    tasks = {}
    if only in ('', 'heroes', 'portraits'):
        for row in load_names('heroes'):
            slug = hero_slug(row.get('key'))
            if not slug:
                continue
            if only in ('', 'portraits'):
                tasks['heroes/%s.png' % slug] = HERO_PORTRAIT + '/%s.png' % slug
            if only in ('', 'heroes'):
                tasks['heroes/icons/%s.png' % slug] = HERO_ICON + '/%s.png' % slug
    if only in ('', 'abilities'):
        for row in load_names('abilities'):
            key = row.get('key')
            if not key:
                continue
            path = row.get('img') or '%s/%s.png' % (ABILITY_ICON, key)
            tasks['abilities/%s.png' % key] = path
        for key, path in EXTRA_ABILITY_PATHS.items():
            tasks['abilities/%s.png' % key] = path
    if only in ('', 'items'):
        for row in load_names('items'):
            key = row.get('key')
            if not key:
                continue
            path = row.get('icon') or '%s/%s.png' % (ITEM_ICON, str(key).replace('item_', '', 1))
            # 所有图纸共用一张官方图标，只保存一份 recipe.png
            rel = 'items/recipe.png' if path.endswith('/recipe.png') else 'items/%s.png' % key
            tasks[rel] = path
    return {rel: CDN + path for rel, path in tasks.items()}


def valid_png(path):
    try:
        with open(path, 'rb') as f:
            head = f.read(8)
        return head == PNG_SIGNATURE and os.path.getsize(path) > 200
    except OSError:
        return False


def fetch(url, target, force):
    if not force and valid_png(target):
        return 'skip'
    os.makedirs(os.path.dirname(target), exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    last_error = ''
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
            if not data.startswith(PNG_SIGNATURE):
                raise IOError('不是 PNG（%d 字节）' % len(data))
            tmp = target + '.part'
            with open(tmp, 'wb') as f:
                f.write(data)
            os.replace(tmp, target)
            return 'ok'
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            if attempt < 2:
                time.sleep(0.5 * (attempt + 1))
    return 'fail: %s' % last_error


def load_ability_hero_map():
    """技能 key → 英雄 key，用于给缺少官方图标的先天技能生成头像占位图。"""
    abilities = load_names('abilities')
    heroes = load_names('heroes')
    hero_key_by_id = {row.get('id'): row.get('key') for row in heroes}
    return {row.get('key'): hero_key_by_id.get(row.get('hero_id')) for row in abilities}


def copy_hero_icon_for_ability(rel, hero_key):
    """部分先天技能在 CDN 上没有独立图标，用英雄小图标占位（与旧版前端回退一致）。"""
    slug = hero_slug(hero_key)
    if not slug:
        return ''
    source = os.path.join(OUT_DIR, 'heroes', 'icons', '%s.png' % slug)
    target = os.path.join(OUT_DIR, rel)
    if not valid_png(source):
        return ''
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(source, 'rb') as src, open(target, 'wb') as dst:
        dst.write(src.read())
    return 'copied'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--only', default='', choices=['', 'heroes', 'portraits', 'abilities', 'items'])
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--workers', type=int, default=24)
    parser.add_argument('--limit', type=int, default=0)
    args = parser.parse_args()

    tasks = build_tasks(args.only)
    items = sorted(tasks.items())
    if args.limit:
        items = items[: args.limit]

    results = {}
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(fetch, url, os.path.join(OUT_DIR, rel), args.force): rel
            for rel, url in items
        }
        for future in as_completed(futures):
            results[futures[future]] = future.result()

    failed = {rel: msg for rel, msg in results.items() if msg.startswith('fail')}
    copied = {}
    ability_heroes = load_ability_hero_map()
    for rel in list(failed):
        if not rel.startswith('abilities/'):
            continue
        key = rel[len('abilities/'):-len('.png')]
        hero_key = ability_heroes.get(key)
        status = copy_hero_icon_for_ability(rel, hero_key)
        if status:
            copied[rel] = hero_key
            results[rel] = status
    failed = {rel: msg for rel, msg in results.items() if msg.startswith('fail')}

    downloaded = sum(1 for msg in results.values() if msg == 'ok')
    skipped = sum(1 for msg in results.values() if msg == 'skip')
    total = sum(
        os.path.getsize(os.path.join(OUT_DIR, rel))
        for rel in results
        if os.path.isfile(os.path.join(OUT_DIR, rel))
    )

    manifest = {
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'source': CDN,
        'files': len(results),
        'downloaded': downloaded,
        'skipped': skipped,
        'hero_icon_placeholders': len(copied),
        'total_bytes': total,
        'failures': failed,
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print('资源 %d 个：新下载 %d，已存在 %d，头像占位 %d，失败 %d，合计 %.1f MB' % (
        len(results), downloaded, skipped, len(copied), len(failed), total / 1024 / 1024))
    for rel, msg in list(failed.items())[:20]:
        print('  失败:', rel, msg)
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main())
