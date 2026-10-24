import { describe, it, expect } from 'vitest'
import { reorderItems, toggleItem, DEFAULT_CONFIG } from '../useDashboardConfig'
import type { ConfigItem } from '../useDashboardConfig'

const items: ConfigItem[] = [
  { id: 'a', visible: true },
  { id: 'b', visible: true },
  { id: 'c', visible: true },
]

describe('reorderItems', () => {
  it('moves item forward', () => {
    const result = reorderItems(items, 0, 2)
    expect(result.map(i => i.id)).toEqual(['b', 'c', 'a'])
  })

  it('moves item backward', () => {
    const result = reorderItems(items, 2, 0)
    expect(result.map(i => i.id)).toEqual(['c', 'a', 'b'])
  })

  it('returns same order when fromIdx === toIdx', () => {
    const result = reorderItems(items, 1, 1)
    expect(result.map(i => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the original array', () => {
    const original = [...items]
    reorderItems(items, 0, 2)
    expect(items).toEqual(original)
  })
})

describe('toggleItem', () => {
  it('hides a visible item', () => {
    const result = toggleItem(items, 'b')
    expect(result.find(i => i.id === 'b')?.visible).toBe(false)
  })

  it('shows a hidden item', () => {
    const hidden: ConfigItem[] = [
      { id: 'a', visible: true },
      { id: 'b', visible: false },
    ]
    const result = toggleItem(hidden, 'b')
    expect(result.find(i => i.id === 'b')?.visible).toBe(true)
  })

  it('cannot hide the last visible item', () => {
    const oneVisible: ConfigItem[] = [
      { id: 'a', visible: false },
      { id: 'b', visible: true },
    ]
    const result = toggleItem(oneVisible, 'b')
    expect(result.find(i => i.id === 'b')?.visible).toBe(true)
  })

  it('returns same reference if id not found', () => {
    const result = toggleItem(items, 'z')
    expect(result).toBe(items)
  })

  it('does not mutate the original array', () => {
    const original = items.map(i => ({ ...i }))
    toggleItem(items, 'a')
    expect(items).toEqual(original)
  })
})

describe('DEFAULT_CONFIG', () => {
  it('has 5 actionCards all visible', () => {
    expect(DEFAULT_CONFIG.actionCards).toHaveLength(5)
    expect(DEFAULT_CONFIG.actionCards.every(i => i.visible)).toBe(true)
  })

  it('has 7 kpiCards all visible', () => {
    expect(DEFAULT_CONFIG.kpiCards).toHaveLength(7)
    expect(DEFAULT_CONFIG.kpiCards.every(i => i.visible)).toBe(true)
  })

  it('has 3 mainPanels all visible', () => {
    expect(DEFAULT_CONFIG.mainPanels).toHaveLength(3)
    expect(DEFAULT_CONFIG.mainPanels.every(i => i.visible)).toBe(true)
  })

  // 'panel-raccourcis' a été retiré de bottomPanels (fusionné dans le bloc
  // "Greeting + raccourcis groupés" de HomePage) ; seuls panel-edi et
  // panel-nouveautes restent. Le `return null` sur 'panel-raccourcis' dans
  // HomePage.tsx est un garde-fou pour d'anciennes configs localStorage qui
  // référenceraient encore cet id, pas un panel actif : cf. dette technique
  // notée dans l'inventaire de tests (LABEL orphelin dans CustomizerDrawer).
  it('has 2 bottomPanels all visible', () => {
    expect(DEFAULT_CONFIG.bottomPanels).toHaveLength(2)
    expect(DEFAULT_CONFIG.bottomPanels.every(i => i.visible)).toBe(true)
  })
})
