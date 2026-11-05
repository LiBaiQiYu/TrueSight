export interface HeroInfo {
  id: number
  name: string
  localized: string
  img: string
}

const CDN = 'https://cdn.cloudflare.steamstatic.com'
let cache: Map<number, HeroInfo> | null = null
let pending: Promise<Map<number, HeroInfo>> | null = null

export function heroImage(img: string | undefined): string {
  if (!img) return ''
  if (img.startsWith('http')) return img
  return CDN + img
}

export function fallbackImage(slug: string): string {
  return `${CDN}/apps/dota2/images/dota_react/heroes/icons/${slug}.png`
}

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
      const slug = h.name.replace(/^npc_dota_hero_/, '')
      map.set(h.id, {
        id: h.id,
        name: h.name,
        localized: h.localized_name,
        img: h.img ? heroImage(h.img) : fallbackImage(slug)
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
