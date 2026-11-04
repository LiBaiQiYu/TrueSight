#!/usr/bin/env node
/**
 * 把 data/names 的完整名称表压缩成前端静态资源 ui/public/names/*.json。
 *
 * 为什么不再走 /api/names：
 * - 名称表是纯静态数据，前端直接静态加载可以避免依赖后端进程版本
 *   （旧版 server.py 没有该路由时会静默拿到 index.html，导致全部名称回退成 ID/英文）；
 * - 只保留时间轴/加点实际用到的字段，体积约为原表的 1/3，解析更快；
 * - 由 npm 的 predev / prebuild 自动生成，data/names 仍是唯一数据源。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(here, '..')
const projectRoot = path.resolve(uiRoot, '..')
const sourceDir = path.join(projectRoot, 'data', 'names')
const targetDir = path.join(uiRoot, 'public', 'names')

const FIELDS = {
  heroes: ['id', 'key', 'cn', 'en', 'abilities'],
  abilities: ['id', 'key', 'hero_id', 'cn', 'en', 'type', 'max_level', 'img'],
  items: ['id', 'key', 'key_od', 'cn', 'en', 'cost', 'category', 'components', 'created', 'consumable'],
  talents: ['id', 'key', 'hero_id', 'tier', 'cn', 'unlock_levels', 'resolved', 'tree']
}

const ITEM_ICON_BASE = '/apps/dota2/images/dota_react/items'
const ABILITY_ICON_BASE = '/apps/dota2/images/dota_react/abilities'
/** 官方 CDN 上所有图纸共用一张图标；其余装备按内部 key 命名。 */
const RECIPE_ICON = `${ITEM_ICON_BASE}/recipe.png`

function itemIcon(row) {
  if (row.category === '图纸' || String(row.key || '').startsWith('item_recipe_')) return RECIPE_ICON
  return `${ITEM_ICON_BASE}/${String(row.key || '').replace(/^item_/, '')}.png`
}

function pick(row, fields) {
  const out = {}
  for (const field of fields) {
    const value = row[field]
    // 省略 null / 空串 / false，只保留有信息量的字段（Boolean 读取方对缺省值等价）
    if (value !== undefined && value !== null && value !== '' && value !== false) out[field] = value
  }
  return out
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`[names] 缺少 ${sourceDir}，保留现有 public/names（如无可运行 tools/names/build.py）`)
    return
  }
  fs.mkdirSync(targetDir, { recursive: true })
  let sourceBytes = 0
  let outputBytes = 0

  for (const [name, fields] of Object.entries(FIELDS)) {
    const source = path.join(sourceDir, `${name}.json`)
    if (!fs.existsSync(source)) {
      console.warn(`[names] 缺少 ${source}，跳过`)
      continue
    }
    const rows = JSON.parse(fs.readFileSync(source, 'utf8'))
    let compact = rows.map((row) => pick(row, fields))
    if (name === 'items') {
      compact = compact.map((row) => ({ ...row, icon: itemIcon(row) }))
    }
    if (name === 'abilities') {
      // 与按 key 推导出的路径相同的 img 不落盘，只保留真正的覆盖值
      compact = compact.map((row) => {
        if (row.img === `${ABILITY_ICON_BASE}/${row.key}.png`) delete row.img
        return row
      })
    }
    const json = JSON.stringify(compact)
    const target = path.join(targetDir, `${name}.json`)
    fs.writeFileSync(target, json, 'utf8')
    sourceBytes += fs.statSync(source).size
    outputBytes += Buffer.byteLength(json)
    console.log(`[names] ${name}: ${rows.length} 条, ${kb(fs.statSync(source).size)} → ${kb(Buffer.byteLength(json))}`)
  }
  console.log(`[names] 合计 ${kb(sourceBytes)} → ${kb(outputBytes)}，输出到 ui/public/names`)
}

main()
