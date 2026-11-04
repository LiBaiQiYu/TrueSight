"""构建中英对照数据集与记忆表。

输入：.cache/names/raw/（由 fetch_raw.py / fetch_en.py 下载）
输出：
  data/names/heroes.json     英雄（ID / 内部名 / 英文 / 中文 / 主属性 / 技能列表）
  data/names/abilities.json  英雄技能（ID / 内部名 / 英文 / 中文 / 类型 / 是否先天）
  data/names/items.json      装备（ID / 内部名 / 英文 / 中文 / 分类 / 价格）
  data/names/meta.json       数据来源、生成时间、校验统计
  memory/dota-heroes.md      英雄记忆表
  memory/dota-abilities.md   技能记忆表
  memory/dota-items.md       装备记忆表
  tools/names/report.md      校验报告

口径（见 report.md）：
  ID 是 OpenDota / STRATZ / 游戏数据三方的公共键；
  中文与英文官方名一律取 dota2.com datafeed（schinese / english）；
  OpenDota 的 localized_name / dname 只作别名与回退；
  图纸类装备官方缺名时，按官方“图纸（父装备）”格式推导，并标记 derived。
"""
import json
import os
import re
from datetime import datetime, timezone

RAW = os.path.join('.cache', 'names', 'raw')
DATA_DIR = os.path.join('data', 'names')
MEM_DIR = os.environ.get('NAMES_MEM_DIR', 'memory')
REPORT = os.path.join('tools', 'names', 'report.md')

ATTR = {0: '力量', 1: '敏捷', 2: '智力', 3: '全才'}
COMPLEXITY = {1: '简单', 2: '中等', 3: '困难'}
CN_TYPES = {0: '基础', 1: '终极'}

# 官方中文名有误、按官方“图纸（父装备）”格式修正的条目
RECIPE_OVERRIDES = {
    # 官方写“图纸（巫师之刃）”，但巫师之刃是 item_witch_blade；法师克星的官方名是“法师克星”
    'item_recipe_mage_slayer': ('图纸（法师克星）', '官方字符串写成“图纸（巫师之刃）”，与 item_mage_slayer=法师克星 冲突'),
}

issues = []


def load(name):
    with open(os.path.join(RAW, name + '.json'), encoding='utf-8') as f:
        return json.load(f)


def clean(value):
    """去掉换行/反斜杠转义与首尾空白。"""
    text = (value or '').replace('\\n', ' ').replace('\n', ' ')
    return re.sub(r'\s+', ' ', text).strip()


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- 输入
od_heroes = load('opendota_heroes')
od_abilities = load('opendota_abilities')
od_ability_ids = {}
for raw_key, raw_name in load('opendota_ability_ids').items():
    # OpenDota 有少量键是 "3060,1617" 这种合并写法，按逗号拆开
    for part in str(raw_key).split(','):
        part = part.strip()
        if part.isdigit():
            od_ability_ids[int(part)] = raw_name
od_items = load('opendota_items')
od_hero_abilities = load('opendota_hero_abilities')
d2_heroes = load('dota2_heroes_zh')['result']['data']['heroes']
d2_items_zh = {i['name']: i for i in load('dota2_items_zh')['result']['data']['itemabilities']}
d2_items_en = {i['name']: i for i in load('dota2_items_en')['result']['data']['itemabilities']}

# ---------------------------------------------------------------- 英雄 + 技能
heroes = []
abilities = []
seen_ability_ids = {}

for hero in sorted(d2_heroes, key=lambda h: h['id']):
    hid = hero['id']
    key = hero['name']
    od = od_heroes.get(str(hid)) or {}
    en = clean(hero.get('name_english_loc'))
    en_od = clean(od.get('localized_name'))
    cn = clean(hero.get('name_loc'))
    if not cn:
        issues.append(('hero', key, '缺中文名'))
    if not en:
        issues.append(('hero', key, '缺英文名'))

    hd_zh = load('dota2_herodata_%d' % hid)['result']['data']['heroes'][0]
    hd_en = load('dota2_herodata_en_%d' % hid)['result']['data']['heroes'][0]
    en_abilities = {a['name']: a for a in hd_en.get('abilities', [])}

    hero_abilities = []
    for ab in hd_zh.get('abilities', []):
        name = ab['name']
        aid = ab.get('id')
        cn_ab = clean(ab.get('name_loc'))
        en_ab = clean((en_abilities.get(name) or {}).get('name_loc'))
        en_od_ab = clean((od_abilities.get(name) or {}).get('dname'))
        if not en_ab:
            en_ab = en_od_ab
            if en_od_ab:
                issues.append(('ability', name, '英文名回退到 OpenDota'))
        if not cn_ab:
            issues.append(('ability', name, '缺中文名'))
        if not en_ab:
            issues.append(('ability', name, '缺英文名'))
        type_num = ab.get('type')
        innate = bool(ab.get('ability_is_innate'))
        label = '先天' if innate else CN_TYPES.get(type_num, '其他')
        if innate and type_num == 1:
            label = '先天·终极'
        # ability id ↔ 名称一致性
        mapped = od_ability_ids.get(aid)
        if mapped is None:
            issues.append(('ability', name, 'ability id %s 不在 OpenDota ability_ids' % aid))
        elif mapped != name:
            issues.append(('ability', name, 'ability id %s 在 OpenDota 指向 %s' % (aid, mapped)))
        if aid in seen_ability_ids and seen_ability_ids[aid] != name:
            issues.append(('ability', name, 'ability id %s 重复（%s / %s）' % (aid, seen_ability_ids[aid], name)))
        seen_ability_ids[aid] = name

        entry = {
            'id': aid,
            'key': name,
            'hero_id': hid,
            'hero_key': key,
            'en': en_ab,
            'en_od': en_od_ab,
            'cn': cn_ab,
            'type': label,
            'img': clean((od_abilities.get(name) or {}).get('img')),
            'max_level': ab.get('max_level'),
            'has_shard': bool(ab.get('ability_has_shard')),
            'has_scepter': bool(ab.get('ability_has_scepter')),
            'level': None,
        }
        hero_abilities.append(entry)
        abilities.append(entry)

    heroes.append({
        'id': hid,
        'key': key,
        'slug': key.replace('npc_dota_hero_', ''),
        'en': en,
        'en_od': en_od,
        'cn': cn,
        'primary_attr': ATTR.get(hero.get('primary_attr'), '?'),
        'complexity': hero.get('complexity'),
        'complexity_cn': COMPLEXITY.get(hero.get('complexity'), '?'),
        'stratz_hero_id': hid,
        'ability_count': len(hero_abilities),
        'abilities': [a['key'] for a in hero_abilities],
    })

# 同一英雄内中文重名检查
for hero in heroes:
    names = [a['cn'] for a in abilities if a['hero_id'] == hero['id'] and a['cn']]
    dup = {n for n in names if names.count(n) > 1}
    if dup:
        issues.append(('hero', hero['key'], '技能中文重名 %s' % ','.join(sorted(dup))))

# ---------------------------------------------------------------- 天赋树
talents = []
TALENT_UNLOCK = {1: [10, 27], 2: [15, 28], 3: [20, 29], 4: [25, 30]}


def fmt_num(value):
    number = float(value)
    return str(int(number)) if number.is_integer() else ('%g' % number)


def fill_template(template, values):
    """把 {s:bonus_x} / {s:value} 换成具体数值；模板里已有 +/- 时取绝对值。"""
    def replace(match):
        value = values.get(match.group(1))
        if value is None:
            return match.group(0)
        before = match.string[match.start() - 1] if match.start() > 0 else ''
        return fmt_num(abs(value) if before in '+-' else value)

    return re.sub(r'\{s:([^}]+)\}', replace, template or '')


for hero in heroes:
    hd_zh = load('dota2_herodata_%d' % hero['id'])['result']['data']['heroes'][0]
    hd_en = load('dota2_herodata_en_%d' % hero['id'])['result']['data']['heroes'][0]
    en_map = {t['name']: t for t in hd_en.get('talents') or []}
    od_talent_list = (od_hero_abilities.get(hero['key']) or {}).get('talents') or []
    od_levels = {t['name']: t.get('level') for t in od_talent_list}
    feed_names = [t['name'] for t in hd_zh.get('talents') or []]
    unmatched_feed = [n for n in feed_names if n not in od_levels]
    unmatched_od = [t['name'] for t in od_talent_list if t['name'] not in feed_names]
    inferred = {}
    if unmatched_feed and len(unmatched_feed) == len(unmatched_od):
        # OpenDota 常量滞后：新天赋替换了旧天赋，层级沿用被替换的那条
        for new_name, old_name in zip(unmatched_feed, unmatched_od):
            inferred[new_name] = (od_levels.get(old_name), old_name)
            issues.append(('talent', new_name, 'OpenDota 无此天赋，按被替换的 %s 推断层级 %s' % (
                old_name, od_levels.get(old_name))))
    # 天赋数值：技能 special_values 里 bonuses[].name 指向该天赋
    bonus_index = {}
    for ab in hd_zh.get('abilities') or []:
        for special in ab.get('special_values') or []:
            for bonus in special.get('bonuses') or []:
                if bonus.get('value') is not None:
                    bonus_index.setdefault(bonus['name'], {})[special['name']] = bonus['value']

    for index, talent in enumerate(hd_zh.get('talents') or []):
        key = talent['name']
        od_tier = od_levels.get(key)
        if od_tier is not None:
            tier, tier_source = od_tier, 'opendota'
        elif key in inferred and inferred[key][0] is not None:
            tier, tier_source = inferred[key][0], 'inferred'
        else:
            # 兜底：datafeed 顺序每两条一层
            tier, tier_source = index // 2 + 1, 'position'
        if od_tier is not None and index // 2 + 1 != od_tier:
            issues.append(('talent', key, 'datafeed 顺序（%d）与 OpenDota 层级（%s）不同，采用 OpenDota' % (
                index // 2 + 1, od_tier)))
        own_values = {s['name']: (s.get('values_float') or [None])[0]
                      for s in talent.get('special_values') or []}
        cn_template = clean(talent.get('name_loc'))
        en_template = clean((en_map.get(key) or {}).get('name_loc'))
        values = {}
        for placeholder in re.findall(r'\{s:([^}]+)\}', cn_template):
            name = placeholder[len('bonus_'):] if placeholder.startswith('bonus_') else placeholder
            value = None
            if placeholder.startswith('bonus_'):
                value = (bonus_index.get(key) or {}).get(name)
            if value is None:
                value = own_values.get(name)
            values[placeholder] = value
        resolved = all(v is not None for v in values.values())
        if not cn_template:
            issues.append(('talent', key, '缺中文名'))
        if not en_template:
            issues.append(('talent', key, '缺英文名'))
        if not resolved:
            issues.append(('talent', key, '数值未解析，保留占位符'))

        talents.append({
            'id': talent.get('id'),
            'key': key,
            'hero_id': hero['id'],
            'hero_key': hero['key'],
            'tier': tier,
            'tier_source': tier_source,
            'od_tier': od_tier,
            'replaced': inferred.get(key, (None, None))[1] if key in inferred else None,
            'unlock_levels': TALENT_UNLOCK.get(tier, []),
            'index': index,
            'en': fill_template(en_template, values) if resolved else en_template,
            'cn': fill_template(cn_template, values) if resolved else cn_template,
            'en_template': en_template,
            'cn_template': cn_template,
            'values': {k: v for k, v in values.items() if v is not None},
            'resolved': resolved,
        })

# 全属性加点：所有英雄（祈求者除外）都能点，和技能、天赋共用技能点
ATTRIBUTE_BONUS = {
    'id': 730,
    'key': 'special_bonus_attributes',
    'hero_id': None,
    'hero_key': None,
    'tier': None,
    'unlock_levels': None,
    'en': 'Attribute Bonus',
    'cn': '属性附加',
    'desc_en': '+2 to All Attributes',
    'desc_cn': '+2 全属性',
    'max_level': 7,
    'value_per_level': 2,
    'excluded_heroes': ['npc_dota_hero_invoker'],
    'resolved': True,
    'note': '英文维基写 6 级起可点，中文维基写任意等级无限制；两版不一致，以客户端为准',
}

# ---------------------------------------------------------------- 装备
item_keys = set('item_' + k for k in od_items) | set(d2_items_zh)
items = []


def parent_cn(key):
    parent = 'item_' + key[len('item_recipe_'):]
    return clean((d2_items_zh.get(parent) or {}).get('name_loc'))


for key in sorted(item_keys, key=lambda k: ((od_items.get(k[5:]) or {}).get('id') or (d2_items_zh.get(key) or {}).get('id') or 99999, k)):
    od = od_items.get(key[5:]) if key.startswith('item_') else None
    zh = d2_items_zh.get(key) or {}
    en_d2 = d2_items_en.get(key) or {}
    od_id = (od or {}).get('id')
    d2_id = zh.get('id')
    if od_id is not None and d2_id is not None and od_id != d2_id:
        issues.append(('item', key, 'ID 冲突 OpenDota=%s dota2=%s' % (od_id, d2_id)))
    iid = od_id if od_id is not None else d2_id

    en = clean(zh.get('name_english_loc')) or clean((od or {}).get('dname'))
    en_od = clean((od or {}).get('dname'))
    en_source = 'official' if en else 'none'
    if not en and key.startswith('item_recipe_'):
        parent_key = 'item_' + key[len('item_recipe_'):]
        parent_en = (clean((d2_items_en.get(parent_key) or {}).get('name_english_loc'))
                     or clean((od_items.get(parent_key[5:]) or {}).get('dname')))
        if parent_en:
            en = parent_en + ' Recipe'
            en_source = 'derived'
    if not en:
        issues.append(('item', key, '缺英文名'))

    cn = clean(zh.get('name_loc'))
    cn_source = 'official' if cn else 'none'
    if not cn and key.startswith('item_recipe_') and parent_cn(key):
        cn = '图纸（%s）' % parent_cn(key)
        cn_source = 'derived'
    if key in RECIPE_OVERRIDES:
        override, reason = RECIPE_OVERRIDES[key]
        if cn and cn != override:
            issues.append(('item', key, '中文名修正：%s -> %s（%s）' % (cn, override, reason)))
        cn = override
        cn_source = 'official-fixed'
    if not cn:
        issues.append(('item', key, '无官方中文名'))

    tier = (od or {}).get('tier')
    if tier is None and zh.get('neutral_item_tier') is not None and zh.get('neutral_item_tier') >= 0:
        tier = zh['neutral_item_tier']
    qual = (od or {}).get('qual')
    if key.startswith('item_recipe_'):
        category = '图纸'
    elif tier:
        category = '中立 t%s' % tier
    elif 'consumable' in (qual or ''):
        category = '消耗品'
    elif (od or {}).get('created') or (od or {}).get('components'):
        category = '合成'
    else:
        category = '基础'

    level = None
    entry = {
        'id': iid,
        'key': key,
        'key_od': key[len('item_'):] if key.startswith('item_') else key,
        'en': en,
        'en_od': en_od,
        'en_source': en_source,
        'cn': cn,
        'cn_source': cn_source,
        'category': category,
        'cost': (od or {}).get('cost'),
        'neutral_tier': tier,
        'level': level,
        'components': [c if c.startswith('item_') else 'item_' + c
                       for c in ((od or {}).get('components') or [])],
        'created': bool((od or {}).get('created')),
        'consumable': 'consumable' in (((od or {}).get('qual')) or ''),
        'in_opendota': bool(od),
        'in_dota2': bool(zh),
        'stratz_item_id': iid,
    }
    items.append(entry)

# 中文重名检查（允许等级变体，需标注）
by_cn = {}
for it in items:
    if it['cn']:
        by_cn.setdefault(it['cn'], []).append(it)
for cn, lst in by_cn.items():
    if len(lst) < 2:
        continue
    # 只有“同一个基础键 + 数字后缀”才算等级变体（达贡 2~5 级、死灵书 2~3 级）
    if len({re.sub(r'_\d$', '', i['key']) for i in lst}) == 1:
        for i in lst:
            m = re.search(r'_(\d)$', i['key'])
            if m:
                i['level'] = int(m.group(1))

# 官方未翻译（中文名仍是英文原文）
for it in items:
    if it['cn'] and it['cn'] == it['en'] and not re.search(r'[\u4e00-\u9fff]', it['cn']):
        issues.append(('item', it['key'], '官方中文未翻译：%s' % it['cn']))

duplicate_cn = {cn: [i['key'] for i in lst] for cn, lst in by_cn.items() if len(lst) > 1}
for cn, keys in sorted(duplicate_cn.items()):
    issues.append(('item', keys[0], '中文名“%s”对应 %d 个键：%s' % (cn, len(keys), ', '.join(keys))))

# ---------------------------------------------------------------- 统计
hero_dup_en = {h['en'] for h in heroes if [x['en'] for x in heroes].count(h['en']) > 1}
ability_cn_missing = [a for a in abilities if not a['cn']]
item_cn_official = sum(1 for i in items if i['cn_source'] in ('official', 'official-fixed'))
item_cn_derived = sum(1 for i in items if i['cn_source'] == 'derived')
item_cn_none = sum(1 for i in items if i['cn_source'] == 'none')
en_conflict_heroes = [h for h in heroes if h['en'] != h['en_od']]
en_conflict_abilities = [a for a in abilities if a['en'] != a['en_od'] and a['en_od']]
en_conflict_items = [i for i in items if i['en'] != i['en_od'] and i['en_od']]

meta = {
    'generated_at': datetime.now(timezone.utc).astimezone().isoformat(timespec='seconds'),
    'sources': {
        'dota2_datafeed_zh': 'https://www.dota2.com/datafeed/herolist|herodata|itemlist?language=schinese',
        'dota2_datafeed_en': 'https://www.dota2.com/datafeed/herodata|itemlist?language=english',
        'opendota_constants': 'https://api.opendota.com/api/constants/{heroes,items,abilities,ability_ids,hero_abilities}',
        'stratz': '本项目 STRATZ 查询只用 heroId（数值），与 OpenDota/游戏 ID 同一套编号',
        'talent_rules': 'dota2.fandom.com 英文/中文维基（天赋 8 条、解锁 10/15/20/25 与 27/28/29/30、属性附加）',
    },
    'counts': {
        'heroes': len(heroes),
        'abilities': len(abilities),
        'talents': len(talents),
        'items': len(items),
        'items_in_opendota': sum(1 for i in items if i['in_opendota']),
        'items_in_dota2': sum(1 for i in items if i['in_dota2']),
    },
    'coverage': {
        'hero_cn': sum(1 for h in heroes if h['cn']),
        'hero_en': sum(1 for h in heroes if h['en']),
        'ability_cn': len(abilities) - len(ability_cn_missing),
        'ability_en': sum(1 for a in abilities if a['en']),
        'talent_cn': sum(1 for t in talents if t['cn']),
        'talent_en': sum(1 for t in talents if t['en']),
        'talent_value_resolved': sum(1 for t in talents if t['resolved']),
        'item_cn_official': item_cn_official,
        'item_cn_derived': item_cn_derived,
        'item_cn_missing': item_cn_none,
        'item_en': sum(1 for i in items if i['en']),
    },
    'conflicts': {
        'hero_en_vs_opendota': len(en_conflict_heroes),
        'ability_en_vs_opendota': len(en_conflict_abilities),
        'item_en_vs_opendota': len(en_conflict_items),
        'duplicate_item_cn': len(duplicate_cn),
    },
    'mechanics': {
        'ability_points': '每级 1 点，技能 / 天赋 / 属性附加共用',
        'talent_tiers': {'1': [10, 27], '2': [15, 28], '3': [20, 29], '4': [25, 30]},
        'attribute_bonus': {'id': 730, 'max_level': 7, 'per_level': 2,
                            'excluded_heroes': ['npc_dota_hero_invoker']},
        'notes': '天赋 8 条 = 4 层 × 2；10/15/20/25 解锁第一轮，27/28/29/30 补选另一条',
    },
}

# OpenDota / 官方 datafeed 尚未收录的新天赋（新版本先于常量更新）。
MANUAL_TALENTS = [
    {
        'id': 5917, 'key': 'special_bonus_movement_speed_15',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 1, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [10, 27], 'index': 10, 'tree': 'bear',
        'en': '+15 Movement Speed', 'cn': '+15 移动速度', 'resolved': True,
    },
    {
        'id': 5937, 'key': 'special_bonus_magic_resistance_10',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 1, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [10, 27], 'index': 11, 'tree': 'bear',
        'en': '+10% Magic Resistance', 'cn': '+10% 魔法抗性', 'resolved': True,
    },
    {
        'id': 1690, 'key': 'special_bonus_unique_lone_druid_spirit_bear_return_cd',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 2, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [15, 28], 'index': 12, 'tree': 'bear',
        'en': 'Return has No Cooldown and -0.5s Channel Time',
        'cn': '回归无冷却时间，持续施法时间 -0.5 秒', 'resolved': True,
    },
    {
        'id': 5931, 'key': 'special_bonus_armor_4',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 2, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [15, 28], 'index': 13, 'tree': 'bear',
        'en': '+4 Armor', 'cn': '+4 护甲', 'resolved': True,
    },
    {
        'id': 5939, 'key': 'special_bonus_attack_damage_30',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 3, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [20, 29], 'index': 14, 'tree': 'bear',
        'en': '+30 Attack Damage', 'cn': '+30 攻击力', 'resolved': True,
    },
    {
        'id': 1687, 'key': 'special_bonus_unique_lone_druid_spirit_bear_damage_against_entangled',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 3, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [20, 29], 'index': 15, 'tree': 'bear',
        'en': '+15% Damage to Entangled Units', 'cn': '对被缠绕单位伤害 +15%',
        'resolved': True,
    },
    {
        'id': 1688, 'key': 'special_bonus_unique_lone_druid_spirit_bear_demolish',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 4, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [25, 30], 'index': 16, 'tree': 'bear',
        'en': '+20% Demolish Bonus Building Damage', 'cn': '熊灵粉碎对建筑伤害 +20%',
        'resolved': True,
    },
    {
        'id': 1689, 'key': 'special_bonus_unique_lone_druid_spirit_bear_return_channel',
        'hero_id': 80, 'hero_key': 'npc_dota_hero_lone_druid',
        'tier': 4, 'tier_source': 'manual', 'od_tier': None, 'replaced': None,
        'unlock_levels': [25, 30], 'index': 17, 'tree': 'bear',
        'en': '-Return Channel Time', 'cn': '回归持续施法时间减少', 'resolved': True,
    },
]

for manual in MANUAL_TALENTS:
    if any(t.get('id') == manual['id'] and t.get('hero_id') == manual['hero_id'] for t in talents):
        continue
    talents.append(manual)
    issues.append(('talent', manual['key'], 'OpenDota/datafeed 未收录，使用人工补充名称'))

# ---------------------------------------------------------------- 输出 JSON
write_json(os.path.join(DATA_DIR, 'heroes.json'), heroes)
write_json(os.path.join(DATA_DIR, 'abilities.json'), abilities)
write_json(os.path.join(DATA_DIR, 'talents.json'), talents + [ATTRIBUTE_BONUS])
write_json(os.path.join(DATA_DIR, 'items.json'), items)
write_json(os.path.join(DATA_DIR, 'meta.json'), meta)

# ---------------------------------------------------------------- memory 表
os.makedirs(MEM_DIR, exist_ok=True)


def md_escape(text):
    return text.replace('|', '\\|')


hero_lines = [
    '# Dota 2 英雄对照表（ID / 内部名 / 英文 / 中文）',
    '',
    '数据源：中文=dota2.com datafeed（`language=schinese` 的 `name_loc`）；英文=dota2.com datafeed',
    '（`language=english`）；内部名与 ID=OpenDota dotaconstants `heroes.json`。',
    'STRATZ 在本项目里只用 `heroId`（数值），与这里的 ID 是同一套编号。',
    '',
    '由 `tools/names/build.py` 生成；校验报告见 `tools/names/report.md`；技能见 `memory/dota-abilities.md`。',
    '',
    '> 易混淆名称（已核验）：',
    '>',
    '> - 噬魂鬼 = Lifestealer（`npc_dota_hero_life_stealer`），昵称：小狗 / LS',
    '> - 恐怖利刃 = Terrorblade（`npc_dota_hero_terrorblade`），昵称：TB / 魂守',
    '> - 斯拉克 = Slark（`npc_dota_hero_slark`），昵称：小鱼人 / 小鱼',
    '> - 米拉娜 = Mirana，昵称 pom；撼地者 = Earthshaker，昵称小牛；',
    '>   影魔 = Shadow Fiend（Nevermore），昵称 SF；黑鸟 = Outworld Destroyer，昵称 OD',
    '> - 莱恩 = Lion（`npc_dota_hero_lion`）；Lion **不叫“雄狮”**，统一用“莱恩”',
    '> - 76 号 OpenDota 旧名 Outworld Devourer，官方现名 Outworld Destroyer；',
    '>   131 号 OpenDota 写 Ring Master，官方现名 Ringmaster',
    '',
    '| ID | 内部名 | 英文官方名 | 中文官方名 | 主属性 | 复杂度 | 技能数 |',
    '|---:|---|---|---|---|---|---:|',
]
for h in heroes:
    hero_lines.append('| %d | `%s` | %s | %s | %s | %s | %d |' % (
        h['id'], h['key'], md_escape(h['en']), md_escape(h['cn']),
        h['primary_attr'], h['complexity_cn'], h['ability_count']))
hero_lines += ['', '共 %d 个英雄。' % len(heroes), '']
with open(os.path.join(MEM_DIR, 'dota-heroes.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(hero_lines))

ability_lines = [
    '# Dota 2 英雄技能对照表（内部名 / 英文 / 中文）',
    '',
    '数据源：中文=dota2.com datafeed（`herodata?language=schinese` 的 `abilities[].name_loc`）；',
    '英文=同一接口 `language=english` 的 `abilities[].name_loc`；技能 ID 与归属=OpenDota',
    '`ability_ids.json` / `hero_abilities.json` 核验。',
    '',
    '类型：基础=普通技能（可升级），终极=大招，先天=每个英雄自带的先天技能。',
    '天赋树见 `memory/dota-talents.md`（每个英雄 8 条，10/15/20/25 与 27/28/29/30 解锁）。',
    '由 `tools/names/build.py` 生成；完整机器可读版本见 `data/names/abilities.json`。',
    '',
]
for hero in heroes:
    h_abs = [a for a in abilities if a['hero_id'] == hero['id']]
    if not h_abs:
        continue
    ability_lines.append('## %s %s（id %d）' % (hero['cn'], hero['en'], hero['id']))
    ability_lines.append('')
    ability_lines.append('| 内部名 | 英文 | 中文 | 类型 |')
    ability_lines.append('|---|---|---|---|')
    for a in h_abs:
        ability_lines.append('| `%s` | %s | %s | %s |' % (
            a['key'], md_escape(a['en']), md_escape(a['cn']), a['type']))
    ability_lines.append('')
ability_lines.append('共 %d 个技能。' % len(abilities))
ability_lines.append('')
with open(os.path.join(MEM_DIR, 'dota-abilities.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(ability_lines))

talent_lines = [
    '# Dota 2 天赋树对照表（层级 / 解锁等级 / 英文 / 中文）',
    '',
    '数据源：中文=dota2.com datafeed（`herodata?language=schinese` 的 `talents[].name_loc`）；',
    '英文=同一接口 `language=english`；层级=OpenDota `hero_abilities.json` 的 `talents[].level`；',
    '数值=技能 `special_values[].bonuses[]` 里指向该天赋的 `value`（已替换 `{s:...}` 占位符）。',
    '',
    '规则：每个英雄 8 条天赋，分 4 层、每层 2 条。第 1 层在 10 级解锁、第 2 层 15 级、第 3 层 20 级、',
    '第 4 层 25 级，先选其中一条；27/28/29/30 级按同样顺序再解锁一次，可以补选另一条。',
    '天赋和技能、属性附加共用同一个技能点。',
    '',
    '`属性附加`（Attribute Bonus，`special_bonus_attributes`，ID 730）= +2 全属性/级，最多 7 级，',
    '祈求者没有这个选项；英文维基写 6 级起可点、中文维基写任意等级，两版不一致，以客户端为准。',
    '',
    '由 `tools/names/build.py` 生成；机器可读版见 `data/names/talents.json`。',
    '',
    '层级带 `*` 的表示 OpenDota 常量还没更新（天赋被改名/重做），层级按被替换的旧天赋推断。',
    '',
    '| 内部名 | 英文 | 中文 | 效果 | 等级上限 | 说明 |',
    '|---|---|---|---|---:|---|',
    '| `special_bonus_attributes` | Attribute Bonus | 属性附加 | +2 全属性 | 7 | 全英雄通用，祈求者除外 |',
    '',
]
for hero in heroes:
    h_talents = [t for t in talents if t['hero_id'] == hero['id']]
    if not h_talents:
        continue
    talent_lines.append('## %s %s（id %d）' % (hero['cn'], hero['en'], hero['id']))
    talent_lines.append('')
    talent_lines.append('| 层级 | 解锁等级 | 英文 | 中文 | 内部名 |')
    talent_lines.append('|---|---|---|---|---|')
    for t in sorted(h_talents, key=lambda x: (x['tier'], x['index'])):
        levels = '/'.join(str(x) for x in t['unlock_levels'])
        cn_text = t['cn'] if t['resolved'] else t['cn'] + '（数值未解析）'
        mark = '*' if t['tier_source'] == 'inferred' else ''
        talent_lines.append('| %d%s | %s | %s | %s | `%s` |' % (
            t['tier'], mark, levels, md_escape(t['en']), md_escape(cn_text), t['key']))
    talent_lines.append('')
talent_lines.append('共 %d 条天赋（%d 个英雄 × 8），另加通用的属性附加。' % (len(talents), len(heroes)))
talent_lines.append('')
with open(os.path.join(MEM_DIR, 'dota-talents.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(talent_lines))

item_lines = [
    '# Dota 2 装备对照表（ID / 内部名 / 英文 / 中文）',
    '',
    '数据源：中文=dota2.com datafeed `itemlist?language=schinese` 的 `name_loc`；英文=同一接口',
    '`language=english`；ID、价格、合成关系=OpenDota `items.json`。',
    '`内部名`带 `item_` 前缀，与回放战斗日志一致；OpenDota `purchase_log` 的键不带前缀',
    '（`blink` 就是 `item_blink`），`data/names/items.json` 的 `key_od` 字段保存这种写法。',
    '分类：图纸=合成卷轴，中立 tN=中立装备第 N 阶，消耗品，合成=有配件/配方，基础=散件。',
    '',
    '中文名来源：备注为空=官方直接给出；“中文推导”=官方缺名，按官方“图纸（父装备）”格式补。',
    '由 `tools/names/build.py` 生成；校验报告见 `tools/names/report.md`。',
    '',
    '| ID | 内部名 | 英文名 | 中文名 | 分类 | 价格 | 备注 |',
    '|---:|---|---|---|---|---:|---|',
]
for it in items:
    note = []
    if it['cn_source'] == 'derived':
        note.append('中文推导')
    elif it['cn_source'] == 'none':
        note.append('官网无中文名')
    elif it['cn_source'] == 'official-fixed':
        note.append('已修正官方笔误')
    if it['en_source'] == 'derived':
        note.append('英文推导')
    if it['cn'] and it['cn'] == it['en'] and not re.search(r'[\u4e00-\u9fff]', it['cn']):
        note.append('官方中文未翻译')
    if it['level']:
        note.append('%d 级变体' % it['level'])
    if not it['in_opendota']:
        note.append('OpenDota 未收录')
    if not it['in_dota2']:
        note.append('官网已移除')
    if it['cost'] is None:
        note.append('价格未知')
    item_lines.append('| %s | `%s` | %s | %s | %s | %s | %s |' % (
        it['id'] if it['id'] is not None else '—',
        it['key'], md_escape(it['en']), md_escape(it['cn']) if it['cn'] else '*（无）*',
        it['category'],
        '' if it['cost'] is None else it['cost'],
        '、'.join(note)))
item_lines += ['', '共 %d 件装备。' % len(items), '']
with open(os.path.join(MEM_DIR, 'dota-items.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(item_lines))

# ---------------------------------------------------------------- 报告
r = [
    '# 名称对照校验报告',
    '',
    '生成时间：%s' % meta['generated_at'],
    '',
    '## 口径',
    '',
    '- **公共键是数值 ID**：OpenDota、STRATZ、官方 datafeed 用的是同一套英雄/装备/技能编号；',
    '  内部名（`npc_dota_hero_*` / `item_*` / 技能名）在 OpenDota 与 datafeed 之间也完全一致。',
    '- **中文、英文官方名以 dota2.com datafeed 为准**（`language=schinese` / `english`）；',
    '  OpenDota 的 `localized_name` / `dname` 作为别名与回退，不一致处在下方列出。',
    '- EN 与 CN 都取“官方当前版本”，不沿用旧译名；回放/日志里的内部名可直接查表。',
    '- 装备键有两种写法：回放日志是 `item_blink`，OpenDota `purchase_log` 是 `blink`；',
    '  `items.json` 的 `key` 与 `key_od` 同时保留，查表时两种都能对上。',
    '',
    '## OpenDota 与 STRATZ 的名称口径',
    '',
    '| 数据 | OpenDota | STRATZ（本项目实际用到的） | 本表采用 |',
    '|---|---|---|---|',
    '| 英雄 | `localized_name` 英文名 + `name`=`npc_dota_hero_*` + 数值 `id` | 比赛接口只返回 `heroId`（数值），不返回名称 | 数值 id + 内部名，中文查本表 |',
    '| 装备 | `dname` 英文名 + 键（不带 `item_` 前缀）+ 数值 `id` | 本项目未取 STRATZ 装备字段 | OpenDota `item_*` 键 + 数值 id |',
    '| 技能 | `dname` 英文名 + 内部名 + `ability_ids` | 本项目未取 STRATZ 技能字段 | 内部名 + 数值 id |',
    '| 天赋 | `hero_abilities.talents[]` 只有内部名 + 层级 | 本项目未取 STRATZ 天赋字段 | 名称取 datafeed，层级取 OpenDota |',
    '',
    '结论：两边的“名称”只是英文/内部键的不同投影，真正的公共键是 **数值 ID** 与 **内部名**；',
    '中文只能从官方本地化取，所以本表用 ID/内部名索引、官方中文作值。`stratz.ts` 里',
    '`findStratzPlayer(match, heroId, isRadiant)` 直接把 STRATZ 的 `heroId` 对到同一张英雄表，',
    '也印证了这套编号。STRATZ 常量接口需要 token，本次未拉取它的 `displayName`；需要逐字对照可提供 token 再补一轮。',
    '',
    '## 覆盖',
    '',
    '| 项目 | 数量 | 英文 | 中文 |',
    '|---|---:|---|---|',
    '| 英雄 | %d | %d/%d | %d/%d |' % (len(heroes), sum(1 for h in heroes if h['en']), len(heroes), sum(1 for h in heroes if h['cn']), len(heroes)),
    '| 技能 | %d | %d/%d | %d/%d |' % (len(abilities), sum(1 for a in abilities if a['en']), len(abilities), len(abilities) - len(ability_cn_missing), len(abilities)),
    '| 天赋 | %d | %d/%d | %d/%d（数值解析 %d） |' % (len(talents), sum(1 for t in talents if t['en']), len(talents), sum(1 for t in talents if t['cn']), len(talents), sum(1 for t in talents if t['resolved'])),
    '| 装备 | %d | %d/%d | 官方 %d + 推导 %d + 缺失 %d |' % (len(items), sum(1 for i in items if i['en']), len(items), item_cn_official, item_cn_derived, item_cn_none),
    '',
    '## 天赋树口径',
    '',
    '- 每个英雄 8 条天赋，4 层 × 2；10/15/20/25 解锁第一轮，27/28/29/30 再解锁一轮补选另一条。',
    '- 天赋、技能、属性附加共用同一个技能点。',
    '- 属性附加（Attribute Bonus，`special_bonus_attributes`，ID 730）：+2 全属性/级，最多 7 级，祈求者除外。',
    '- 数值取技能 `special_values[].bonuses[]` 里指向该天赋的值，替换 `{s:...}` 占位符；',
    '  %d 条解析出数值，%d 条保留占位符。' % (
        sum(1 for t in talents if t['resolved']), sum(1 for t in talents if not t['resolved'])),
    ('- 层级以 OpenDota `talents[].level` 为准（%d 条）；常量滞后、天赋被改名的 %d 条按被替换的'
     '旧天赋推断层级并标记 `inferred`。通用天赋（如 +200 生命）会被多个英雄共用，所以内部名'
     '不是全局唯一，(英雄, 内部名) 才唯一。' % (
         sum(1 for t in talents if t['tier_source'] == 'opendota'),
         sum(1 for t in talents if t['tier_source'] == 'inferred'))),
    '',
    '## 与 OpenDota 的英文名差异（已按官方修正）',
    '',
    '英雄：%d 处' % len(en_conflict_heroes),
]
for h in en_conflict_heroes:
    r.append('- %d `%s`：OpenDota=%s → 官方=%s' % (h['id'], h['key'], h['en_od'], h['en']))
r.append('')
r.append('技能：%d 处' % len(en_conflict_abilities))
for a in en_conflict_abilities[:40]:
    r.append('- `%s`：OpenDota=%s → 官方=%s' % (a['key'], a['en_od'], a['en']))
if len(en_conflict_abilities) > 40:
    r.append('- …其余 %d 条见 data/names/abilities.json 的 `en_od` 字段' % (len(en_conflict_abilities) - 40))
r.append('')
r.append('装备：%d 处' % len(en_conflict_items))
for i in en_conflict_items[:40]:
    r.append('- `%s`：OpenDota=%s → 官方=%s' % (i['key'], i['en_od'], i['en']))
r.append('')
unresolved_talents = [t for t in talents if not t['resolved']]
r.append('## 天赋数值未解析')
r.append('')
r.append('以下 %d 条天赋在技能数据里找不到对应 bonus，保留官方占位符：' % len(unresolved_talents))
r.append('')
for t in unresolved_talents:
    r.append('- `%s`（%s）：%s' % (t['key'], t['hero_key'], t['cn']))
r.append('')
r.append('## 装备中文名缺口')
r.append('')
r.append('- 官方直接给出：%d 件' % item_cn_official)
r.append('- 按官方“图纸（父装备）”格式推导：%d 件' % item_cn_derived)
r.append('- 官网无中文名（多为已废弃配方/未使用条目）：%d 件' % item_cn_none)
missing = [i for i in items if i['cn_source'] == 'none']
if missing:
    r.append('')
    r.append('| 内部名 | 英文 | 说明 |')
    r.append('|---|---|---|')
    for i in missing:
        r.append('| `%s` | %s | %s |' % (i['key'], i['en'] or '（无）', 'OpenDota 未收录' if not i['in_opendota'] else '官网条目已停用'))
r.append('')
r.append('## 重名（等级变体 / 配方与成品同名）')
r.append('')
r.append('同一中文名对应多个键：配方与成品同名是官方命名方式，等级变体已在表里标“N 级变体”。')
r.append('')
for cn, keys in sorted(duplicate_cn.items()):
    r.append('- %s → %s' % (cn, '、'.join('`%s`' % k for k in keys)))
r.append('')
r.append('## 需要注意的点')
r.append('')
r.append('- 76 号英雄：OpenDota 仍写 `Outworld Devourer`，官方现名 `Outworld Destroyer`（黑鸟/OD）。')
r.append('- 131 号英雄：OpenDota 写 `Ring Master`，官方现名 `Ringmaster`（百戏大王）。')
r.append('- 技能显示名会随版本改：`lion_impale` 现为 Earth Spike（裂地尖刺），`mirana_starfall`')
r.append('  现为 Starstorm（群星风暴）；内部名不变，引用以本表显示名为准。')
r.append('- 部分装备官方中文名与旧记忆表不同：`item_ward_observer` 官方“侦察守卫”，`item_blight_stone`')
r.append('  官方“枯萎之珠”，`item_orb_of_corrosion` 官方“腐蚀之珠”；本表已按官方更新。')
r.append('- `item_recipe_mage_slayer` 官方中文写成“图纸（巫师之刃）”，与 `item_mage_slayer`=法师克星')
r.append('  冲突，已按官方配方格式修正为“图纸（法师克星）”。')
untranslated = [i for i in items if i['cn'] and i['cn'] == i['en'] and not re.search(r'[\u4e00-\u9fff]', i['cn'])]
r.append('- 官方中文未翻译：%d 件（%s），中文列保留官方原文，已标注。' % (
    len(untranslated), '、'.join('`%s`' % i['key'] for i in untranslated) or '无'))
r.append('- `item_black_grimoire` 的 OpenDota `dname` 含字面量 `\\n`，已清洗。')
r.append('- 技能名只覆盖英雄技能（含先天技能）。回放日志里的中立物品/地图技能（如 `ability_lamp_use`、')
r.append('  `twin_gate_portal_warp`）不在本表，遇到时单独说明。')
r.append('')
r.append('## 复现')
r.append('')
r.append('```')
r.append('runtime\\python\\python.exe -X utf8 tools\\names\\fetch_raw.py   # 中文源 + OpenDota')
r.append('runtime\\python\\python.exe -X utf8 tools\\names\\fetch_en.py   # 英文源（反向校验）')
r.append('runtime\\python\\python.exe -X utf8 tools\\names\\build.py      # 生成数据与记忆表')
r.append('```')
r.append('')
with open(REPORT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(r))

# ---------------------------------------------------------------- 分析口径笔记
NOTES = os.path.join(MEM_DIR, 'dota-analysis-notes.md')
NOTES_SRC = os.path.join('memory', 'dota-analysis-notes.md')
MARK = '## 名称口径（自动生成，勿手改本段）'


def update_notes():
    try:
        with open(NOTES_SRC, encoding='utf-8') as f:
            text = f.read()
    except OSError:
        text = ''
    if MARK in text:
        text = text.split(MARK)[0].rstrip()
    section = '\n'.join([
        MARK,
        '',
        '- 英雄、装备、技能的中英名以 dota2.com 官方 datafeed 为准（`schinese` 与 `english` 双向核对）；',
        '  OpenDota 的 `localized_name` / `dname` 只作别名与回退，差异见 `tools/names/report.md`。',
        '- 查名顺序：`memory/dota-heroes.md` → `memory/dota-items.md` → `memory/dota-abilities.md` →',
        '  `memory/dota-talents.md`；机器可读版 `data/names/*.json`，ID 与 STRATZ `heroId` / `itemId` 同源。',
        '- 天赋：每英雄 8 条（4 层 × 2），10/15/20/25 解锁第一轮，27/28/29/30 补选另一条；',
        '  天赋、技能、属性附加共用技能点。属性附加=`special_bonus_attributes`（+2 全属性/级，',
        '  最多 7 级，祈求者除外）。',
        '- 内部名会过时：`lion_impale` 现显示 Earth Spike（裂地尖刺），`mirana_starfall` 现显示',
        '  Starstorm（群星风暴）。引用时用显示名，内部名只作键。',
        '- 回放里的中立物品/地图技能（`ability_lamp_use`、`twin_gate_portal_warp` 等）不在技能表内。',
        '- 实际加点顺序：OpenDota 比赛数据的 `ability_upgrades_arr` 里有技能、天赋和属性附加的选取',
        '  顺序（需比赛已被解析）；本地回放导出器目前不输出加点事件，等级时间线也还缺。',
        '',
    ])
    with open(NOTES, 'w', encoding='utf-8') as f:
        f.write(text.rstrip() + '\n\n' + section)


update_notes()

# ---------------------------------------------------------------- 控制台摘要
print('heroes=%d abilities=%d talents=%d items=%d' % (len(heroes), len(abilities), len(talents), len(items)))
print('talent values resolved=%d unresolved=%d' % (
    sum(1 for t in talents if t['resolved']), sum(1 for t in talents if not t['resolved'])))
print('item cn: official=%d derived=%d missing=%d' % (item_cn_official, item_cn_derived, item_cn_none))
print('conflicts: hero_en=%d ability_en=%d item_en=%d' % (len(en_conflict_heroes), len(en_conflict_abilities), len(en_conflict_items)))
print('duplicate item cn groups=%d' % len(duplicate_cn))
print('ability cn missing=%d, ability en missing=%d' % (len(ability_cn_missing), sum(1 for a in abilities if not a['en'])))
print('issues=%d' % len(issues))
with open(os.path.join('tools', 'names', 'issues.txt'), 'w', encoding='utf-8') as f:
    for kind, key, msg in issues:
        f.write('%s\t%s\t%s\n' % (kind, key, msg))
print('issues -> tools/names/issues.txt')
