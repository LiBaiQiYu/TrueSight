import { heroFallbacks, localHeroPortrait } from './assets'

export interface HeroInfo {
  id: number
  name: string
  localized: string
  /** 本地英雄头像（ui/public/assets/heroes/<slug>.png） */
  img: string
  /** 图片加载失败时按顺序回退的地址（CDN 头像/图标） */
  fallbacks?: string
}

let cache: Map<number, HeroInfo> | null = null
let pending: Promise<Map<number, HeroInfo>> | null = null

export async function loadHeroes(): Promise<Map<number, HeroInfo>> {
  if (cache) return cache
  if (pending) return pending
  pending = (async () => {
    const res = await fetch('https://api.opendota.com/api/heroes')
    if (!res.ok) throw new Error('英雄列表获取失败: HTTP ' + res.status)
    const list = (await res.json()) as Array<{
      id: number
      name: string
      localized_name: string
      img?: string
    }>
    const map = new Map<number, HeroInfo>()
    for (const h of list) {
      map.set(h.id, {
        id: h.id,
        name: h.name,
        localized: h.localized_name,
        img: localHeroPortrait(h.name),
        fallbacks: heroFallbacks(h.name)
      })
    }
    cache = map
    pending = null
    return map
  })()
  return pending
}

export function heroOf(map: Map<number, HeroInfo> | null, id: number): HeroInfo | undefined {
  return map?.get(id)
}
