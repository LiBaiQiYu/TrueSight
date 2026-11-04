<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { NamesIndex } from '../lib/names'
import { acquiredUpgrades, pointAtDetailed, type TimelinePlayer, type Upgrade } from '../lib/timeline'
import type { TipContent } from '../lib/tooltip'

const props = defineProps<{
  player: TimelinePlayer
  cursorSec: number
  names: NamesIndex | null
}>()

const level = computed(() => pointAtDetailed(props.player, props.cursorSec).level)
const acquired = computed(() => acquiredUpgrades(props.player, level.value))
const acquiredKeys = computed(() => new Set(acquired.value.map((upgrade) => upgrade.key)))
/** 已点的加点按“第几个点”高亮，避免同一技能的其他等级也被点亮 */
const acquiredOrders = computed(() => new Set(acquired.value.map((upgrade) => upgrade.order)))

const CDN = 'https://cdn.cloudflare.steamstatic.com'
function abilityIcon(key: string): string {
  return `${CDN}/apps/dota2/images/dota_react/abilities/${key}.png`
}

function hideBroken(event: Event): void {
  const target = event.target as HTMLImageElement | null
  if (target) target.style.visibility = 'hidden'
}

const counts = computed(() => {
  const map = new Map<string, number>()
  for (const upgrade of acquired.value) {
    if (upgrade.kind !== 'ability') continue
    map.set(upgrade.key, (map.get(upgrade.key) ?? 0) + 1)
  }
  return map
})

/**
 * 共用加点的技能：点其中任意一个，整组等级一起提升（数组第一个是展示用的主键）。
 * 邪影芳灵的大招「作祟 / 恐吓」就是同一个技能槽。
 */
const ABILITY_GROUPS: Record<string, string[]> = {
  dark_willow_bedlam: ['dark_willow_bedlam', 'dark_willow_terrorize']
}
const GROUP_MEMBERS = new Map<string, string[]>()
for (const members of Object.values(ABILITY_GROUPS)) {
  for (const key of members) GROUP_MEMBERS.set(key, members)
}

function membersOf(key: string): string[] {
  return GROUP_MEMBERS.get(key) ?? [key]
}

const abilityRows = computed(() => {
  const hero = props.names?.heroById.get(props.player.heroId)
  const upgraded = new Set(props.player.upgrades.filter((upgrade) => upgrade.kind === 'ability').map((upgrade) => upgrade.key))
  const rows = (hero?.abilities ?? [])
    .map((key) => props.names?.abilityByKey.get(key))
    .filter((ability): ability is NonNullable<typeof ability> => Boolean(ability))
    // 只显示这场真正加过点的原生技能：祈求者的组合技、拉比克窃取、水人变形等
    // 临时获得的技能不在 player.upgrades 里，因此不会占卡位。
    .filter((ability) => {
      // 共用加点的技能，只要其中一个成员被点过就显示整组
      const members = membersOf(ability.key)
      return members.some((key) => upgraded.has(key)) || ability.type.startsWith('先天')
    })
    .filter((ability) => {
      const members = membersOf(ability.key)
      return members[0] === ability.key
    })
    .map((ability) => {
      const members = membersOf(ability.key)
      const labels = members
        .map((key) => props.names?.abilityByKey.get(key)?.cn || props.names?.abilityByKey.get(key)?.en)
        .filter(Boolean)
      return {
        key: ability.key,
        label: labels.length > 1 ? labels.join(' / ') : ability.cn || ability.en,
        type: ability.type,
        max: Math.max(1, ability.max_level ?? 4),
        count: ability.type.startsWith('先天')
          ? 1
          : members.reduce((sum, key) => sum + (counts.value.get(key) ?? 0), 0),
        icon: abilityIcon(ability.key),
        ultimate: ability.type.includes('终极'),
        innate: ability.type.startsWith('先天'),
        fallback: (ability.cn || ability.en || ability.key).slice(0, 1)
      }
    })
  if (rows.length) return rows
  return [...upgraded].map((key) => {
    const ability = props.names?.abilityByKey.get(key)
    return {
      key,
      label: ability?.cn || ability?.en || key,
      type: ability?.type ?? '基础',
      max: Math.max(1, ability?.max_level ?? 4),
      count: (ability?.type ?? '').startsWith('先天') ? 1 : counts.value.get(key) ?? 0,
      icon: abilityIcon(key),
      ultimate: (ability?.type ?? '').includes('终极'),
      innate: (ability?.type ?? '').startsWith('先天'),
      fallback: (ability?.cn || ability?.en || key).slice(0, 1)
    }
  })
})

/** 第 N 个技能点对应的技能等级；天赋/属性用 T{tier}/+ 显示 */
const upgradeLevels = computed(() => {
  const map = new Map<number, string>()
  const perAbility = new Map<string, number>()
  for (const upgrade of props.player.upgrades) {
    if (upgrade.kind === 'ability') {
      const next = (perAbility.get(upgrade.key) ?? 0) + 1
      perAbility.set(upgrade.key, next)
      map.set(upgrade.order, String(next))
    } else if (upgrade.kind === 'talent') {
      map.set(upgrade.order, `T${upgrade.tier ?? ''}`)
    } else if (upgrade.kind === 'attribute') {
      map.set(upgrade.order, '+')
    } else {
      map.set(upgrade.order, '?')
    }
  }
  return map
})

function upgradeUltimate(upgrade: { key: string; kind: string }): boolean {
  if (upgrade.kind !== 'ability') return false
  return Boolean(props.names?.abilityByKey.get(upgrade.key)?.type.includes('终极'))
}

function upgradeIcon(upgrade: { key: string; kind: string }): string {
  return upgrade.kind === 'ability' ? abilityIcon(upgrade.key) : ''
}

function upgradeGlyph(upgrade: { kind: string; label: string }): string {
  if (upgrade.kind === 'talent') return '✦'
  if (upgrade.kind === 'attribute') return '+'
  return upgrade.label.slice(0, 1) || '?'
}

const attributeNow = computed(() => acquired.value.filter((upgrade) => upgrade.kind === 'attribute').length)
const attributeFinal = computed(() => props.player.upgrades.filter((upgrade) => upgrade.kind === 'attribute').length)

/** 德鲁伊：本体 / 小熊两套独立天赋树，默认看本体。 */
const isLoneDruid = computed(() => props.player.heroId === 80)
const hasBearTree = computed(
  () => isLoneDruid.value && props.player.talents.some((talent) => talent.tree === 'bear')
)
const talentTree = ref<'hero' | 'bear'>('hero')
watch(
  () => props.player.heroId,
  () => {
    talentTree.value = 'hero'
  }
)

const talentGroups = computed(() => {
  const groups = new Map<
    number,
    Array<{
      key: string
      cn: string
      picked: boolean
      now: boolean
      available: boolean
      unlock: number[]
      tree: 'hero' | 'bear'
    }>
  >()
  for (const talent of props.player.talents) {
    if (hasBearTree.value && talent.tree !== talentTree.value) continue
    const tier = talent.tier || 1
    const list = groups.get(tier) ?? []
    const pickedInTier = props.player.talents.some(
      (row) => row.tree === talent.tree && row.tier === tier && row.picked
    )
    list.push({
      key: talent.key,
      cn: talent.cn,
      picked: talent.picked,
      now: acquiredKeys.value.has(talent.key),
      available:
        !talent.picked &&
        level.value != null &&
        talent.unlockLevels.length > 0 &&
        level.value >= talent.unlockLevels[0] &&
        (level.value >= (talent.unlockLevels[1] ?? Number.POSITIVE_INFINITY) || !pickedInTier),
      unlock: talent.unlockLevels,
      tree: talent.tree
    })
    groups.set(tier, list)
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0])
})

const heroName = computed(() => {
  const hero = props.names?.heroById.get(props.player.heroId)
  return hero?.cn ?? '未知英雄'
})

function abilityTip(ability: {
  label: string
  type: string
  count: number
  max: number
  icon: string
  ultimate: boolean
  innate: boolean
}): TipContent {
  const lines = [`${ability.type} · ${ability.count}/${ability.max}`]
  if (ability.innate) lines.push('先天技能')
  return {
    title: ability.label,
    lines,
    icon: ability.icon,
    accent: ability.ultimate ? 'ultimate' : 'ability'
  }
}

function upgradeTip(upgrade: Upgrade): TipContent {
  const lines = [`第 ${upgrade.order} 个加点`]
  const level = upgradeLevels.value.get(upgrade.order)
  if (upgrade.kind === 'ability') lines.push(`技能等级 ${level ?? '—'}`)
  if (upgrade.kind === 'talent') lines.push(`天赋 ${upgrade.tier ?? '?'} 层`)
  if (upgrade.kind === 'attribute') lines.push('属性附加')
  if (!acquiredOrders.value.has(upgrade.order)) lines.push('当前时刻未点')
  return {
    title: upgrade.label,
    lines,
    icon: upgradeIcon(upgrade) || undefined,
    accent: upgradeUltimate(upgrade)
      ? 'ultimate'
      : upgrade.kind === 'talent'
        ? 'talent'
        : 'ability'
  }
}

function talentTip(
  talent: { cn: string; picked: boolean; now: boolean; available: boolean; unlock: number[]; tree: 'hero' | 'bear' },
  tier: number
): TipContent {
  const lines = [talent.tree === 'bear' ? '小熊天赋树' : '本体天赋树', `${tier} 层天赋`]
  if (talent.unlock.length) lines.push(`解锁等级 ${talent.unlock.join(' / ')}`)
  if (talent.available) lines.push('当前等级可点，可延后补选')
  lines.push(talent.picked ? '本局已选' : talent.now ? '当前已点' : '本局未选')
  return {
    title: talent.cn,
    lines,
    accent: talent.picked ? 'talent' : undefined
  }
}

function short(text: string, max = 12): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}
</script>

<template>
  <div class="build">
    <div class="head">
      <b>{{ heroName }}</b>
      <span class="level">Lv{{ level ?? '—' }}</span>
      <span class="est">顺序来自 OpenDota · 时间按回放等级估算</span>
    </div>

    <div class="abilities">
      <div
        v-for="ability in abilityRows"
        :key="ability.key"
        class="ability"
        :class="{ ultimate: ability.ultimate, innate: ability.innate }"
        v-tip="abilityTip(ability)"
      >
        <span class="ability-icon">
          <span class="icon-fallback">{{ ability.fallback }}</span>
          <img :src="ability.icon" alt="" loading="lazy" @error="hideBroken" />
        </span>
        <span class="ability-meta">
          <span class="nm">
            {{ short(ability.label, 10) }}
            <em v-if="ability.innate">先天</em>
          </span>
          <span class="pips">
            <i v-for="n in ability.max" :key="n" :class="{ on: n <= ability.count }" />
          </span>
          <span class="lv">{{ ability.count }}/{{ ability.max }}</span>
        </span>
      </div>
    </div>

    <div class="seq">
      <span
        v-for="upgrade in player.upgrades"
        :key="`${upgrade.order}-${upgrade.key}`"
        class="chip"
        :class="[
          upgrade.kind,
          { acquired: acquiredOrders.has(upgrade.order), ultimate: upgradeUltimate(upgrade) }
        ]"
        v-tip="upgradeTip(upgrade)"
      >
        <span v-if="upgradeIcon(upgrade)" class="chip-icon">
          <span class="icon-fallback">{{ upgradeGlyph(upgrade) }}</span>
          <img :src="upgradeIcon(upgrade)" alt="" loading="lazy" @error="hideBroken" />
        </span>
        <span v-else class="chip-glyph">{{ upgradeGlyph(upgrade) }}</span>
      </span>
    </div>

    <div class="talent-title">
      <span>天赋</span>
      <div v-if="hasBearTree" class="tree-tabs">
        <button
          type="button"
          :class="{ on: talentTree === 'hero' }"
          @click="talentTree = 'hero'"
        >
          本体
        </button>
        <button
          type="button"
          :class="{ on: talentTree === 'bear' }"
          @click="talentTree = 'bear'"
        >
          小熊
        </button>
      </div>
      <span class="attr">属性附加 {{ attributeNow }}/{{ attributeFinal }}</span>
    </div>
    <p v-if="hasBearTree" class="talent-note">
      10/15/20/25 级：本体与小熊各有 1 个独立天赋点，可延后补选
    </p>
    <div class="talents">
      <div
        v-for="[tier, list] in talentGroups"
        :key="`${talentTree}-${tier}`"
        class="tier"
        :class="{ bear: talentTree === 'bear' }"
      >
        <span class="tier-label">{{ tier }} 层</span>
        <button
          v-for="talent in list"
          :key="talent.key"
          type="button"
          class="node"
          :class="{
            picked: talent.picked,
            now: talent.now,
            available: talent.available,
            locked: level != null && talent.unlock.length > 0 && level < talent.unlock[0]
          }"
          v-tip="talentTip(talent, tier)"
        >
          {{ talent.cn }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.build {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}

.head b {
  font-size: 13px;
  color: var(--text);
}

.level {
  color: var(--accent-text);
  font-weight: 600;
}

.est {
  margin-left: auto;
  font-size: 9.5px;
  color: var(--text-mute);
}

.abilities {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
}

.ability {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 4px 6px;
  border-radius: 8px;
  background: var(--hover);
  border: 1px solid transparent;
  transition: border-color 0.16s, background 0.16s;
}

.ability:hover {
  border-color: var(--line);
}

.ability.ultimate {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.07);
}

.ability-icon {
  position: relative;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--dock-soft-strong);
  border: 1px solid var(--line);
}

.ability-icon img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
}

.icon-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 650;
  color: var(--text-mute);
}

.icon-lvl {
  position: absolute;
  right: -3px;
  bottom: -3px;
  min-width: 13px;
  height: 13px;
  padding: 0 2px;
  border-radius: 7px;
  background: var(--dock-rail);
  border: 1px solid var(--line-strong);
  color: var(--text);
  font-style: normal;
  font-size: 9px;
  line-height: 11px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.ability.ultimate .icon-lvl {
  border-color: rgba(245, 158, 11, 0.7);
  color: #fbbf24;
}

.ability-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.nm {
  font-size: 10px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nm em {
  font-style: normal;
  font-size: 9px;
  color: var(--text-mute);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 0 3px;
  margin-left: 3px;
}

.pips {
  display: flex;
  gap: 2px;
}

.pips i {
  width: 5px;
  height: 5px;
  border-radius: 2px;
  background: var(--dock-soft-strong);
  border: 1px solid var(--line);
}

.pips i.on {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
}

.lv {
  font-size: 9px;
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
}

.seq {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.chip {
  position: relative;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: var(--dock-soft);
  border: 1px solid transparent;
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
  opacity: 0.4;
}

.chip.acquired {
  opacity: 1;
  color: var(--text);
  background: var(--accent-soft);
  border-color: var(--accent-line);
}

.chip.ultimate {
  border-color: rgba(245, 158, 11, 0.55);
}

.chip.ultimate.acquired {
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.22);
}

.chip-icon {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  overflow: hidden;
}

.chip-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chip-icon .icon-fallback {
  font-size: 10px;
}

.chip-glyph {
  font-size: 10px;
  line-height: 1;
  font-style: normal;
  color: var(--text-dim);
}

.chip-lvl {
  position: absolute;
  right: -3px;
  bottom: -3px;
  min-width: 11px;
  height: 11px;
  padding: 0 1px;
  border-radius: 6px;
  background: var(--dock-rail);
  border: 1px solid var(--line-strong);
  color: var(--text);
  font-style: normal;
  font-size: 8px;
  line-height: 9px;
  text-align: center;
}

.chip.talent.acquired {
  color: var(--talent-ink);
  background: var(--talent-bg);
  border-color: var(--talent-line);
}

.chip.attribute.acquired {
  color: var(--attr-ink);
  background: var(--attr-bg);
  border-color: var(--attr-line);
}

.talent-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--text-mute);
  margin-top: 1px;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}

.tree-tabs {
  display: flex;
  gap: 2px;
  margin-left: auto;
  margin-right: 6px;
  padding: 2px;
  border-radius: 6px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.tree-tabs button {
  font: inherit;
  font-size: 9px;
  line-height: 16px;
  padding: 0 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
}

.tree-tabs button.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.talent-note {
  margin: -3px 0 0;
  font-size: 9px;
  line-height: 1.4;
  color: var(--text-mute);
}

.talents {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  background: var(--dock-soft);
}

.tier {
  display: grid;
  grid-template-columns: 30px 1fr 1fr;
  gap: 4px;
  align-items: stretch;
}

.tier.bear {
  grid-template-columns: 30px 1fr;
}

.tier-label {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  color: var(--text-mute);
}

.tier-label::before {
  content: '◆';
  font-size: 7px;
  color: var(--accent);
  opacity: 0.7;
}

.node {
  font: inherit;
  font-size: 9px;
  line-height: 1.25;
  text-align: left;
  min-height: 26px;
  display: block;
  padding: 4px 6px;
  border-radius: 5px;
  border: 1px solid var(--line);
  background: var(--dock-soft-strong);
  color: var(--text-mute);
  cursor: default;
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  line-height: 1.3;
}

.node.picked {
  color: var(--text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.node.now {
  box-shadow: 0 0 0 1px var(--accent-hi) inset;
}

.node.available {
  color: var(--text-dim);
  border-color: var(--accent-line);
  box-shadow: inset 0 0 0 1px var(--accent-soft);
}

.node.locked {
  opacity: 0.45;
}
</style>
