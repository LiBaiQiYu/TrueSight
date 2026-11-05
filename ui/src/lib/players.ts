import type { HeroInfo } from './heroes'

export interface SelectPlayer {
  slot: number
  heroId: number
  heroName: string
  playerName: string
  isRadiant: boolean
  hero?: HeroInfo
}
