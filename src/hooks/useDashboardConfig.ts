import { useState, useCallback } from 'react'

export interface ConfigItem {
  id: string
  visible: boolean
}

export type DashboardZone = 'actionCards' | 'kpiCards' | 'mainPanels' | 'bottomPanels'

export type SectionId = 'actions' | 'kpi' | 'mainPanels' | 'bottomPanels'

export const DEFAULT_SECTION_ORDER: SectionId[] = ['actions', 'kpi', 'mainPanels', 'bottomPanels']

export interface DashboardConfig {
  actionCards:  ConfigItem[]
  kpiCards:     ConfigItem[]
  mainPanels:   ConfigItem[]
  bottomPanels: ConfigItem[]
  sectionOrder: SectionId[]
}

/* ── Pure helpers (exported for tests) ── */

export function reorderItems(items: ConfigItem[], fromIdx: number, toIdx: number): ConfigItem[] {
  const arr = [...items]
  const [moved] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, moved)
  return arr
}

export function toggleItem(items: ConfigItem[], id: string): ConfigItem[] {
  const item = items.find(i => i.id === id)
  if (!item) return items
  const visibleCount = items.filter(i => i.visible).length
  if (item.visible && visibleCount <= 1) return items
  return items.map(i => i.id === id ? { ...i, visible: !i.visible } : i)
}

/* ── Default config ── */

export const DEFAULT_CONFIG: DashboardConfig = {
  sectionOrder: DEFAULT_SECTION_ORDER,
  actionCards: [
    { id: 'action-offices',     visible: true },
    { id: 'action-panier',      visible: true },
    { id: 'action-commandes',   visible: true },
    { id: 'action-edi-error',   visible: true },
    { id: 'action-expeditions', visible: true },
  ],
  kpiCards: [
    { id: 'kpi-commandes',    visible: true },
    { id: 'kpi-montant',      visible: true },
    { id: 'kpi-exemplaires',  visible: true },
    { id: 'kpi-panier-moyen', visible: true },
    { id: 'kpi-delai',        visible: true },
    { id: 'kpi-rupture',      visible: true },
    { id: 'kpi-references',   visible: true },
  ],
  mainPanels: [
    { id: 'panel-evolution', visible: true },
    { id: 'panel-donut',     visible: true },
    { id: 'panel-editeurs',  visible: true },
  ],
  bottomPanels: [
    { id: 'panel-edi',        visible: true },
    { id: 'panel-nouveautes', visible: true },
    { id: 'panel-raccourcis', visible: true },
  ],
}

/* ── localStorage ── */

const LS_KEY = 'flowdiff_dashboard_config'

function loadConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      sectionOrder: parsed.sectionOrder ?? DEFAULT_SECTION_ORDER,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveConfig(config: DashboardConfig): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(config))
  } catch {
    // quota or incognito — ignore
  }
}

/* ── Hook ── */

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(loadConfig)

  const reorder = useCallback((zone: DashboardZone, fromIdx: number, toIdx: number) => {
    setConfig(prev => {
      const next = { ...prev, [zone]: reorderItems(prev[zone], fromIdx, toIdx) }
      saveConfig(next)
      return next
    })
  }, [])

  const toggle = useCallback((zone: DashboardZone, id: string) => {
    setConfig(prev => {
      const updated = toggleItem(prev[zone], id)
      if (updated === prev[zone]) return prev
      const next = { ...prev, [zone]: updated }
      saveConfig(next)
      return next
    })
  }, [])

  const reorderSection = useCallback((id: SectionId, direction: 'up' | 'down') => {
    setConfig(prev => {
      const order = [...prev.sectionOrder]
      const idx = order.indexOf(id)
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= order.length) return prev
      ;[order[idx], order[targetIdx]] = [order[targetIdx], order[idx]]
      const next = { ...prev, sectionOrder: order }
      saveConfig(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    try { localStorage.removeItem(LS_KEY) } catch {}
    setConfig(DEFAULT_CONFIG)
  }, [])

  return { config, reorder, reorderSection, toggle, reset }
}
