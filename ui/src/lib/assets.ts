/**
 * 图像资源统一入口。
 *
 * 英雄头像、技能图标、装备图标都存放在 `ui/public/assets/`（用
 * `tools/assets/fetch_images.py` 从 Steam 官方 CDN 抓取并提交到仓库），
 * 页面默认只请求本地文件，不再依赖第三方图片资源。
 *
 * 本地文件缺失时（例如版本更新出现新英雄/新装备），`data-fallback`
 * 里按顺序保存的 CDN 地址会由全局监听器接管继续重试。
 */

const BASE = import.meta.env.BASE_URL || './'
const CDN = 'https://cdn.cloudflare.steamstatic.com'

const LOCAL = {
  heroes: `${BASE}assets/heroes`,
  heroIcons: `${BASE}assets/heroes/icons`,
  abilities: `${BASE}assets/abilities`,
  items: `${BASE}assets/items`
}

const REMOTE = {
  heroPortrait: `${CDN}/apps/dota2/images/dota_react/heroes`,
  heroIcon: `${CDN}/apps/dota2/images/dota_react/heroes/icons`,
  abilities: `${CDN}/apps/dota2/images/dota_react/abilities`,
  items: `${CDN}/apps/dota2/images/dota_react/items`
}

export function heroSlug(key: string | null | undefined): string {
  return String(key || '').replace(/^npc_dota_hero_/, '')
}

export function itemKey(key: string | null | undefined): string {
  const value = String(key || '').trim()
  if (!value) return ''
  return value.startsWith('item_') ? value : `item_${value}`
}

export function localHeroPortrait(key: string): string {
  return `${LOCAL.heroes}/${heroSlug(key)}.png`
}

export function localHeroIcon(key: string): string {
  return `${LOCAL.heroIcons}/${heroSlug(key)}.png`
}

export function localAbilityIcon(key: string): string {
  return `${LOCAL.abilities}/${key}.png`
}

export function localItemIcon(key: string, icon?: string): string {
  const normalized = itemKey(key)
  if ((icon && icon.endsWith('/recipe.png')) || normalized.startsWith('item_recipe_')) {
    return `${LOCAL.items}/recipe.png`
  }
  return `${LOCAL.items}/${normalized}.png`
}

export function remoteHeroPortrait(key: string): string {
  return `${REMOTE.heroPortrait}/${heroSlug(key)}.png`
}

export function remoteHeroIcon(key: string): string {
  return `${REMOTE.heroIcon}/${heroSlug(key)}.png`
}

export function remoteAbilityIcon(key: string, img?: string): string {
  if (img && img.startsWith('http')) return img
  return `${CDN}${img || `/apps/dota2/images/dota_react/abilities/${key}.png`}`
}

export function remoteItemIcon(key: string, icon?: string): string {
  if (icon && icon.startsWith('http')) return icon
  const normalized = itemKey(key)
  if (normalized.startsWith('item_recipe_')) {
    return `${CDN}/apps/dota2/images/dota_react/items/recipe.png`
  }
  return `${CDN}${icon || `/apps/dota2/images/dota_react/items/${normalized.replace(/^item_/, '')}.png`}`
}

/** 英雄图像的回退顺序：本地头像 → CDN 头像 → 本地小图标 → CDN 小图标。 */
export function heroFallbacks(key: string): string {
  return [remoteHeroPortrait(key), localHeroIcon(key), remoteHeroIcon(key)].filter(Boolean).join('|')
}

/** 技能图标的回退顺序：本地 → CDN（`img` 覆盖值优先）。 */
export function abilityFallbacks(key: string, img?: string, heroKey?: string): string {
  const chain = [remoteAbilityIcon(key, img)]
  if (heroKey) chain.push(localHeroIcon(heroKey), remoteHeroIcon(heroKey))
  return chain.filter(Boolean).join('|')
}

/** 装备图标的回退顺序：本地 → CDN（`icon` 覆盖值优先）。 */
export function itemFallbacks(key: string, icon?: string): string {
  return remoteItemIcon(key, icon)
}

let installed = false

/**
 * 全局图片回退：捕获阶段拦截资源加载错误，按 `data-fallback`（`|` 分隔）
 * 依次改 src；链走完后不再拦截，交给组件自己的 @error 做最终兜底。
 */
export function installImageFallbacks(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener(
    'error',
    (event: Event) => {
      const img = event.target as HTMLImageElement | null
      if (!img || img.tagName !== 'IMG') return
      const chain = (img.dataset.fallback || '').split('|').filter(Boolean)
      if (!chain.length) return
      event.stopPropagation()
      event.preventDefault()
      const [next, ...rest] = chain
      img.dataset.fallback = rest.join('|')
      img.src = next
    },
    true
  )
}
