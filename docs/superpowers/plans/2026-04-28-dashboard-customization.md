# Dashboard Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Personnaliser" drawer to the FlowDiff dashboard allowing librarians to reorder and show/hide all 18 widgets across 4 zones, with layout persisted in localStorage under `flowdiff_dashboard_config`.

**Architecture:** `useDashboardConfig` hook exposes pure helpers + state for config persistence. `CustomizerDrawer` renders the 380px right-side drawer with HTML5 drag&drop (desktop) and ↑↓ arrows (mobile). `HomePage.tsx` is updated to iterate each zone's `config[zone]` array instead of hardcoded card order.

**Tech Stack:** React 18, TypeScript strict, styled-components v6, Vitest + @testing-library/react (globals: true, jsdom)

---

## File Map

| File | Action |
|------|--------|
| `src/hooks/useDashboardConfig.ts` | Create — config state, localStorage, pure helpers |
| `src/hooks/__tests__/useDashboardConfig.test.ts` | Create — pure function tests |
| `src/components/dashboard/CustomizerDrawer.tsx` | Create — drawer UI, drag&drop, toggles |
| `src/pages/home/HomePage.tsx` | Modify — integrate hook + drawer, iterate config zones |

---

### Task 1: `useDashboardConfig` hook + tests

**Files:**
- Create: `src/hooks/useDashboardConfig.ts`
- Create: `src/hooks/__tests__/useDashboardConfig.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/__tests__/useDashboardConfig.test.ts`:

```typescript
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

  it('has 3 bottomPanels all visible', () => {
    expect(DEFAULT_CONFIG.bottomPanels).toHaveLength(3)
    expect(DEFAULT_CONFIG.bottomPanels.every(i => i.visible)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/hooks/__tests__/useDashboardConfig.test.ts
```

Expected: FAIL — "Cannot find module '../useDashboardConfig'"

- [ ] **Step 3: Create `src/hooks/useDashboardConfig.ts`**

```typescript
import { useState, useCallback } from 'react'

export interface ConfigItem {
  id: string
  visible: boolean
}

export type DashboardZone = 'actionCards' | 'kpiCards' | 'mainPanels' | 'bottomPanels'

export interface DashboardConfig {
  actionCards:  ConfigItem[]
  kpiCards:     ConfigItem[]
  mainPanels:   ConfigItem[]
  bottomPanels: ConfigItem[]
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
    return JSON.parse(raw) as DashboardConfig
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

  const reset = useCallback(() => {
    try { localStorage.removeItem(LS_KEY) } catch {}
    setConfig(DEFAULT_CONFIG)
  }, [])

  return { config, reorder, toggle, reset }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/hooks/__tests__/useDashboardConfig.test.ts
```

Expected: 14 tests PASS

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (no errors)

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useDashboardConfig.ts src/hooks/__tests__/useDashboardConfig.test.ts
git commit -m "feat(dashboard): add useDashboardConfig hook with reorder/toggle/reset"
```

---

### Task 2: `CustomizerDrawer` component

**Files:**
- Create: `src/components/dashboard/CustomizerDrawer.tsx`

- [ ] **Step 1: Create `src/components/dashboard/CustomizerDrawer.tsx`**

```tsx
import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import type { DashboardConfig, DashboardZone, ConfigItem } from '../../hooks/useDashboardConfig'

/* ── Label + section maps ── */

const LABEL: Record<string, string> = {
  'action-offices':     'Office à valider',
  'action-panier':      'Panier',
  'action-commandes':   'Commandes à vérifier',
  'action-edi-error':   'Erreur EDI à corriger',
  'action-expeditions': 'Expéditions en retard',
  'kpi-commandes':      'Commandes passées',
  'kpi-montant':        'Montant total commandé',
  'kpi-exemplaires':    'Exemplaires commandés',
  'kpi-panier-moyen':   'Panier moyen',
  'kpi-delai':          'Délai moyen de livraison',
  'kpi-rupture':        'Taux de rupture',
  'kpi-references':     'Références distinctes',
  'panel-evolution':    'Évolution des commandes',
  'panel-donut':        'Répartition des achats',
  'panel-editeurs':     'Top éditeurs',
  'panel-edi':          'Suivi des flux EDI',
  'panel-nouveautes':   'Nouveautés du mois',
  'panel-raccourcis':   'Raccourcis',
}

const SECTIONS: { zone: DashboardZone; title: string }[] = [
  { zone: 'actionCards',  title: 'Actions en attente' },
  { zone: 'kpiCards',     title: 'Indicateurs KPI'    },
  { zone: 'mainPanels',   title: 'Analyses'           },
  { zone: 'bottomPanels', title: 'Widgets'            },
]

/* ── Styled components ── */

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 200;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 300ms ease;
`

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 100vw;
  height: 100dvh;
  background: white;
  border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
  z-index: 201;
  display: flex;
  flex-direction: column;
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 300ms ease;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
`

const DrawerTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 18px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.gray[600]};
  &:hover { color: ${({ theme }) => theme.colors.gray[800]}; }
`

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 8px;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 14px 20px 4px;
`

const ItemRow = styled.div<{ $dragging: boolean; $dropTarget: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: white;
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  border-top: 2px solid ${({ $dropTarget }) => ($dropTarget ? '#2563EB' : 'transparent')};
  transition: border-color 0.1s, opacity 0.1s;
  cursor: default;
`

const DragHandle = styled.div`
  cursor: grab;
  color: ${({ theme }) => theme.colors.gray[300]};
  font-size: 15px;
  flex-shrink: 0;
  user-select: none;
  line-height: 1;

  @media (max-width: 768px) {
    display: none;
  }
`

const MobileArrows = styled.div`
  display: none;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: flex;
  }
`

const ArrowBtn = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  padding: 1px 5px;
  font-size: 9px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  &:disabled { opacity: 0.3; cursor: default; }
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const ItemLabel = styled.span<{ $hidden: boolean }>`
  flex: 1;
  font-size: 13px;
  color: ${({ $hidden, theme }) => ($hidden ? theme.colors.gray[400] : theme.colors.gray[800])};
  text-decoration: ${({ $hidden }) => ($hidden ? 'line-through' : 'none')};
`

const ToggleBtn = styled.button<{ $visible: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  color: ${({ $visible, theme }) => ($visible ? theme.colors.gray[600] : theme.colors.gray[300])};
  display: flex;
  align-items: center;
  &:disabled { cursor: not-allowed; opacity: 0.35; }
  &:hover:not(:disabled) { color: ${({ theme }) => theme.colors.gray[800]}; }
`

const DrawerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
`

const ResetBtn = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 8px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

const CloseFooterBtn = styled.button`
  background: ${({ theme }) => theme.colors.navy};
  border: none;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

/* ── SVG icons ── */

function IconEyeOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

/* ── Component ── */

interface Props {
  open: boolean
  onClose: () => void
  config: DashboardConfig
  onReorder: (zone: DashboardZone, fromIdx: number, toIdx: number) => void
  onToggle: (zone: DashboardZone, id: string) => void
  onReset: () => void
}

export function CustomizerDrawer({ open, onClose, config, onReorder, onToggle, onReset }: Props) {
  const dragRef = useRef<{ zone: DashboardZone; idx: number } | null>(null)
  const [dragging, setDragging] = useState<{ zone: DashboardZone; idx: number } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ zone: DashboardZone; idx: number } | null>(null)

  function handleDragStart(zone: DashboardZone, idx: number) {
    dragRef.current = { zone, idx }
    setDragging({ zone, idx })
  }

  function handleDragOver(e: React.DragEvent, zone: DashboardZone, idx: number) {
    e.preventDefault()
    if (dragRef.current?.zone === zone) setDropTarget({ zone, idx })
  }

  function handleDrop(zone: DashboardZone, toIdx: number) {
    if (!dragRef.current || dragRef.current.zone !== zone) return
    if (dragRef.current.idx !== toIdx) onReorder(zone, dragRef.current.idx, toIdx)
    dragRef.current = null
    setDragging(null)
    setDropTarget(null)
  }

  function handleDragEnd() {
    dragRef.current = null
    setDragging(null)
    setDropTarget(null)
  }

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Personnaliser le tableau de bord"
      >
        <DrawerHeader>
          <DrawerTitle>Personnaliser le tableau de bord</DrawerTitle>
          <CloseBtn onClick={onClose} aria-label="Fermer">✕</CloseBtn>
        </DrawerHeader>

        <DrawerBody>
          {SECTIONS.map(({ zone, title }) => {
            const items: ConfigItem[] = config[zone]
            const visibleCount = items.filter(i => i.visible).length
            return (
              <div key={zone}>
                <SectionLabel>{title}</SectionLabel>
                {items.map((item, idx) => {
                  const isDragging = dragging?.zone === zone && dragging.idx === idx
                  const isDropTarget = dropTarget?.zone === zone && dropTarget.idx === idx
                  const isLastVisible = item.visible && visibleCount === 1
                  return (
                    <ItemRow
                      key={item.id}
                      $dragging={isDragging}
                      $dropTarget={isDropTarget}
                      draggable
                      onDragStart={() => handleDragStart(zone, idx)}
                      onDragOver={e => handleDragOver(e, zone, idx)}
                      onDrop={() => handleDrop(zone, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <DragHandle title="Glisser pour réordonner">⠿</DragHandle>
                      <MobileArrows>
                        <ArrowBtn
                          disabled={idx === 0}
                          onClick={() => onReorder(zone, idx, idx - 1)}
                          aria-label="Monter"
                        >▲</ArrowBtn>
                        <ArrowBtn
                          disabled={idx === items.length - 1}
                          onClick={() => onReorder(zone, idx, idx + 1)}
                          aria-label="Descendre"
                        >▼</ArrowBtn>
                      </MobileArrows>
                      <ItemLabel $hidden={!item.visible}>
                        {LABEL[item.id] ?? item.id}
                      </ItemLabel>
                      <ToggleBtn
                        $visible={item.visible}
                        disabled={isLastVisible}
                        onClick={() => onToggle(zone, item.id)}
                        title={item.visible ? 'Masquer' : 'Afficher'}
                        aria-label={item.visible ? 'Masquer' : 'Afficher'}
                      >
                        {item.visible ? <IconEyeOpen /> : <IconEyeOff />}
                      </ToggleBtn>
                    </ItemRow>
                  )
                })}
              </div>
            )
          })}
        </DrawerBody>

        <DrawerFooter>
          <ResetBtn onClick={onReset}>Réinitialiser par défaut</ResetBtn>
          <CloseFooterBtn onClick={onClose}>Fermer</CloseFooterBtn>
        </DrawerFooter>
      </Panel>
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/CustomizerDrawer.tsx
git commit -m "feat(dashboard): add CustomizerDrawer with drag&drop and visibility toggles"
```

---

### Task 3: HomePage — import hook, open drawer, "Personnaliser" button

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

This task wires up the hook and the drawer without yet changing the card rendering. It also adds the "Personnaliser" button.

- [ ] **Step 1: Add imports at the top of `HomePage.tsx`**

After the existing imports (around line 13), add:

```typescript
import { useDashboardConfig } from '@/hooks/useDashboardConfig'
import { CustomizerDrawer } from '@/components/dashboard/CustomizerDrawer'
```

- [ ] **Step 2: Add `customizer` state inside `HomePage` function**

After the existing `useState` declarations (around line 1231, after `canNovRight`), add:

```typescript
const [customizerOpen, setCustomizerOpen] = useState(false)
const dashConfig = useDashboardConfig()
```

- [ ] **Step 3: Add the "Personnaliser" button styled component**

After the existing `DashboardControls` styled component (around line 410), add:

```typescript
const CustomizeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`
```

- [ ] **Step 4: Add the button in the `BilanHeader` JSX**

Find the `DashboardControls` block in the JSX (around line 1432):

```tsx
<DashboardControls>
  <PeriodSelector ... />
  <ComparaisonToggle ... />
</DashboardControls>
```

Replace with:

```tsx
<DashboardControls>
  <PeriodSelector
    preset={periodFilter.preset}
    setPreset={periodFilter.setPreset}
    period={periodFilter.period}
    customStart={periodFilter.customStart}
    setCustomStart={periodFilter.setCustomStart}
    customEnd={periodFilter.customEnd}
    setCustomEnd={periodFilter.setCustomEnd}
  />
  <ComparaisonToggle
    compareMode={periodFilter.compareMode}
    setCompareMode={periodFilter.setCompareMode}
    comparePeriod={periodFilter.comparePeriod}
    customCompareStart={periodFilter.customCompareStart}
    setCustomCompareStart={periodFilter.setCustomCompareStart}
    customCompareEnd={periodFilter.customCompareEnd}
    setCustomCompareEnd={periodFilter.setCustomCompareEnd}
  />
  <CustomizeBtn onClick={() => setCustomizerOpen(true)}>
    ⊞ Personnaliser
  </CustomizeBtn>
</DashboardControls>
```

- [ ] **Step 5: Add `CustomizerDrawer` at the bottom of the `HomePage` JSX**

Find the closing `</Page>` tag (last line of the JSX return, around line 1811). Add the drawer just before it:

```tsx
        <CustomizerDrawer
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          config={dashConfig.config}
          onReorder={dashConfig.reorder}
          onToggle={dashConfig.toggle}
          onReset={dashConfig.reset}
        />

      </Content>
    </Page>
  )
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): wire CustomizerDrawer + Personnaliser button in HomePage"
```

---

### Task 4: HomePage — `actionCards` zone

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

Replace the 5 hardcoded `<ActionCard>` elements with a config-driven map.

- [ ] **Step 1: Replace the `ActionsGrid` content**

Find the `<ActionsGrid>` block (around line 1373–1426 in the current file). Replace its entire content with:

```tsx
<ActionsGrid>
  {dashConfig.config.actionCards
    .filter(item => item.visible)
    .map(item => {
      if (item.id === 'action-offices') return (
        <ActionCard key="action-offices" onClick={() => navigate('/offices')}>
          <ActionIconWrap $bg="#F0FDF4" $color="#16A34A"><IconPackage /></ActionIconWrap>
          <ActionBody>
            <ActionCount>1</ActionCount>
            <ActionLabel>office à valider</ActionLabel>
            <ActionDeadline>Limite : 13 mai 2026</ActionDeadline>
          </ActionBody>
          <ActionArrow>→</ActionArrow>
        </ActionCard>
      )
      if (item.id === 'action-panier') return (
        <ActionCard
          key="action-panier"
          $empty={cartCount === 0}
          onClick={cartCount > 0 ? () => navigate('/panier') : undefined}
        >
          <ActionIconWrap
            $bg={cartCount === 0 ? '#F3F4F6' : '#FFF7ED'}
            $color={cartCount === 0 ? '#9CA3AF' : '#EA580C'}
          >
            <IconOrders />
          </ActionIconWrap>
          <ActionBody>
            <ActionCount>{cartCount}</ActionCount>
            <ActionLabel>
              {cartCount === 0 ? 'Panier vide' : cartCount <= 1 ? 'Ouvrage dans le panier' : 'Ouvrages dans le panier'}
            </ActionLabel>
          </ActionBody>
          {cartCount > 0 && <ActionArrow>→</ActionArrow>}
        </ActionCard>
      )
      if (item.id === 'action-commandes') return (
        <ActionCard key="action-commandes" onClick={() => navigate('/edi?filter=ORDRSP')}>
          <ActionIconWrap $bg="#FFFBEB" $color="#D97706"><IconReceipt /></ActionIconWrap>
          <ActionBody>
            <ActionCount>2</ActionCount>
            <ActionLabel>commandes à vérifier</ActionLabel>
          </ActionBody>
          <ActionArrow>→</ActionArrow>
        </ActionCard>
      )
      if (item.id === 'action-edi-error') return (
        <ActionCard key="action-edi-error" onClick={() => navigate('/edi')}>
          <ActionIconWrap $bg="#FEF2F2" $color="#DC2626"><IconAlertClock /></ActionIconWrap>
          <ActionBody>
            <ActionCount>1</ActionCount>
            <ActionLabel>erreur EDI à corriger</ActionLabel>
          </ActionBody>
          <ActionArrow>→</ActionArrow>
        </ActionCard>
      )
      if (item.id === 'action-expeditions') return (
        <ActionCard key="action-expeditions" onClick={() => navigate('/edi?filter=DESADV')}>
          <ActionIconWrap $bg="#EFF6FF" $color="#2563EB"><IconTruck /></ActionIconWrap>
          <ActionBody>
            <ActionCount>3</ActionCount>
            <ActionLabel>expéditions en retard</ActionLabel>
          </ActionBody>
          <ActionArrow>→</ActionArrow>
        </ActionCard>
      )
      return null
    })
  }
</ActionsGrid>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): actionCards zone driven by useDashboardConfig"
```

---

### Task 5: HomePage — `kpiCards` zone

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Replace the `KPIGrid` content**

Find the `<KPIGrid>` block (around line 1453–1561). Replace its entire content with:

```tsx
<KPIGrid>
  {dashConfig.config.kpiCards
    .filter(item => item.visible)
    .map(item => {
      if (item.id === 'kpi-commandes') return (
        <KPICard key="kpi-commandes">
          <KPITop>
            <KPIIconWrap $bg="#DCFCE7" $color="#16a34a"><IconCart /></KPIIconWrap>
            <KPILabel>Commandes passées</KPILabel>
          </KPITop>
          <KPIValue>{kpi.nbCommandes}</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.nbCommandes} compare={compareKpi.nbCommandes} mode={periodFilter.compareMode} />
          )}
          <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>
        </KPICard>
      )
      if (item.id === 'kpi-montant') return (
        <KPICard key="kpi-montant">
          <KPITop>
            <KPIIconWrap $bg="#DCFCE7" $color="#16a34a"><IconEuro /></KPIIconWrap>
            <KPILabel>Montant total commandé</KPILabel>
          </KPITop>
          <KPIValue>{fmtEur(kpi.montantTotal)}</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.montantTotal} compare={compareKpi.montantTotal} mode={periodFilter.compareMode} />
          )}
          <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>
        </KPICard>
      )
      if (item.id === 'kpi-exemplaires') return (
        <KPICard key="kpi-exemplaires">
          <KPITop>
            <KPIIconWrap $bg="#DCFCE7" $color="#16a34a"><IconBox /></KPIIconWrap>
            <KPILabel>Exemplaires commandés</KPILabel>
          </KPITop>
          <KPIValue>{kpi.nbExemplaires.toLocaleString('fr-FR')}</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.nbExemplaires} compare={compareKpi.nbExemplaires} mode={periodFilter.compareMode} />
          )}
          <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>
        </KPICard>
      )
      if (item.id === 'kpi-panier-moyen') return (
        <KPICard key="kpi-panier-moyen">
          <KPITop>
            <KPIIconWrap $bg="#EDE9FE" $color="#7C3AED"><IconBarChart /></KPIIconWrap>
            <KPILabel>Panier moyen</KPILabel>
          </KPITop>
          <KPIValue>{fmtEur(kpi.panierMoyen)}</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.panierMoyen} compare={compareKpi.panierMoyen} mode={periodFilter.compareMode} />
          )}
          <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>
        </KPICard>
      )
      if (item.id === 'kpi-delai') return (
        <KPICard key="kpi-delai">
          <KPITop>
            <KPIIconWrap $bg="#FFF7ED" $color="#EA580C"><IconAlertClock /></KPIIconWrap>
            <KPILabel>Délai moyen de livraison</KPILabel>
          </KPITop>
          <KPIValue>{kpi.delaiMoyen.toFixed(1).replace('.', ',')} j</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.delaiMoyen} compare={compareKpi.delaiMoyen} mode={periodFilter.compareMode} invert />
          )}
        </KPICard>
      )
      if (item.id === 'kpi-rupture') return (
        <KPICard key="kpi-rupture">
          <KPITop>
            <KPIIconWrap $bg="#FEE2E2" $color="#DC2626"><IconXCircle /></KPIIconWrap>
            <KPILabel>Taux de rupture</KPILabel>
          </KPITop>
          <KPIValue>{(kpi.tauxRupture * 100).toFixed(1).replace('.', ',')} %</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.tauxRupture} compare={compareKpi.tauxRupture} mode={periodFilter.compareMode} invert />
          )}
        </KPICard>
      )
      if (item.id === 'kpi-references') return (
        <KPICard key="kpi-references">
          <KPITop>
            <KPIIconWrap $bg="#EFF6FF" $color="#2563EB"><IconBooks /></KPIIconWrap>
            <KPILabel>Références distinctes</KPILabel>
          </KPITop>
          <KPIValue>{kpi.nbReferences.toLocaleString('fr-FR')}</KPIValue>
          {compareKpi && (
            <KpiTrendLine current={kpi.nbReferences} compare={compareKpi.nbReferences} mode={periodFilter.compareMode} />
          )}
        </KPICard>
      )
      return null
    })
  }
</KPIGrid>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): kpiCards zone driven by useDashboardConfig"
```

---

### Task 6: HomePage — `mainPanels` + `bottomPanels` zones + ThreeColRow fix

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Update `ThreeColRow` styled component to accept `$count`**

Find the `ThreeColRow` styled component (around line 492) and replace it:

```typescript
const ThreeColRow = styled.div<{ $count?: number }>`
  display: grid;
  grid-template-columns: ${({ $count = 3 }) =>
    $count === 1 ? '1fr' : $count === 2 ? '3fr 2fr' : '45fr 30fr 25fr'};
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
```

- [ ] **Step 2: Replace the first `ThreeColRow` content (mainPanels)**

Find the comment `{/* Ligne 4-5-6 */}` and the `<ThreeColRow>` that follows it (around line 1564). Replace the entire block including the closing `</ThreeColRow>` with:

```tsx
{/* Ligne 4-5-6 */}
<ThreeColRow $count={dashConfig.config.mainPanels.filter(i => i.visible).length}>
  {dashConfig.config.mainPanels
    .filter(item => item.visible)
    .map(item => {
      if (item.id === 'panel-evolution') return (
        <PanelCard key="panel-evolution">
          <PanelHeader>
            <PanelTitle>
              Évolution des commandes
              <IconCalendar />
            </PanelTitle>
          </PanelHeader>
          {compareChartData && (
            <ChartLegend>
              <ChartLegendItem>
                <ChartLegendLine $color="#16a34a" />
                Période sélectionnée
              </ChartLegendItem>
              <ChartLegendItem>
                <ChartLegendLine $color="#C9A84C" $dashed />
                {compareModeShort(periodFilter.compareMode)}
              </ChartLegendItem>
            </ChartLegend>
          )}
          <ChartInner>
            <ChartSvgWrap>
              <ChartEvolution main={mainChartData} compare={compareChartData} />
            </ChartSvgWrap>
            <ChartStatsList>
              <ChartStatRow>
                <ChartStatLabel>Commandes envoyées</ChartStatLabel>
                <ChartStatValueRow>
                  <ChartStatIcon $bg="#DCFCE7" $color="#16a34a"><IconSend /></ChartStatIcon>
                  <ChartStatNum>{nbEnvoyees}</ChartStatNum>
                  {cmpEnvoyees !== null && (
                    <ChartStatDelta $up={nbEnvoyees >= cmpEnvoyees}>
                      {nbEnvoyees >= cmpEnvoyees ? '▲' : '▼'}
                      {cmpEnvoyees > 0
                        ? ` ${Math.abs(Math.round(((nbEnvoyees - cmpEnvoyees) / cmpEnvoyees) * 100))}%`
                        : ''}
                    </ChartStatDelta>
                  )}
                </ChartStatValueRow>
              </ChartStatRow>
              <ChartStatRow>
                <ChartStatLabel>Commandes annulées</ChartStatLabel>
                <ChartStatValueRow>
                  <ChartStatIcon $bg="#FEE2E2" $color="#DC2626"><IconXCircle /></ChartStatIcon>
                  <ChartStatNum>{nbAnnulees}</ChartStatNum>
                  {cmpAnnulees !== null && (
                    <ChartStatDelta $up={nbAnnulees <= cmpAnnulees}>
                      {nbAnnulees <= cmpAnnulees ? '▼' : '▲'}
                      {cmpAnnulees > 0
                        ? ` ${Math.abs(Math.round(((nbAnnulees - cmpAnnulees) / cmpAnnulees) * 100))}%`
                        : ''}
                    </ChartStatDelta>
                  )}
                </ChartStatValueRow>
              </ChartStatRow>
              <ChartStatRow>
                <ChartStatLabel>Taux d'annulation</ChartStatLabel>
                <ChartStatValueRow>
                  <ChartStatIcon $bg="#FEE2E2" $color="#DC2626"><IconXCircle /></ChartStatIcon>
                  <ChartStatNum>{(kpi.tauxRupture * 100).toFixed(1).replace('.', ',')} %</ChartStatNum>
                  {compareKpi && (
                    <ChartStatDelta $up={kpi.tauxRupture <= compareKpi.tauxRupture}>
                      {kpi.tauxRupture <= compareKpi.tauxRupture ? '▼' : '▲'}
                      {' '}{Math.abs(Math.round((kpi.tauxRupture - compareKpi.tauxRupture) * 1000) / 10).toFixed(1)} pts
                    </ChartStatDelta>
                  )}
                </ChartStatValueRow>
              </ChartStatRow>
            </ChartStatsList>
          </ChartInner>
        </PanelCard>
      )
      if (item.id === 'panel-donut') return (
        <PanelCard key="panel-donut">
          <PanelHeader>
            <PanelTitle>Répartition de vos achats</PanelTitle>
          </PanelHeader>
          <DonutInner>
            <ChartDonut main={donutData} compare={compareDonutData} />
            <DonutLegend>
              {donutData.map((seg, i) => {
                const cmpSeg = compareDonutData?.[i]
                return (
                  <LegendItem key={seg.label}>
                    <LegendDot $color={seg.color} />
                    <LegendLabel>{seg.label}</LegendLabel>
                    <LegendPct>{seg.percent}%</LegendPct>
                    {cmpSeg && <LegendPctCompare>vs {cmpSeg.percent}%</LegendPctCompare>}
                  </LegendItem>
                )
              })}
            </DonutLegend>
          </DonutInner>
        </PanelCard>
      )
      if (item.id === 'panel-editeurs') return (
        <PanelCard key="panel-editeurs">
          <PanelHeader>
            <PanelTitle>Top éditeurs</PanelTitle>
            <PanelSeeAll onClick={() => navigate('/fonds')}>Voir tout →</PanelSeeAll>
          </PanelHeader>
          <TopEdList>
            {topPublishers.map(({ name, pct, montant }, i) => (
              <TopEdRow key={name}>
                <TopEdRank>{i + 1}</TopEdRank>
                <TopEdName>{name}</TopEdName>
                <TopEdPct>{pct}%</TopEdPct>
                <TopEdAmount>{fmtEur(montant)}</TopEdAmount>
              </TopEdRow>
            ))}
          </TopEdList>
          <TopEdFooter>
            <TopEdFooterLabel>Part du montant</TopEdFooterLabel>
            <TopEdFooterLabel>Montant commandé</TopEdFooterLabel>
          </TopEdFooter>
        </PanelCard>
      )
      return null
    })
  }
</ThreeColRow>
```

- [ ] **Step 3: Replace the second `ThreeColRow` content (bottomPanels)**

Find the comment `{/* Ligne 7-8-9 */}` and the `<ThreeColRow>` that follows it (around line 1688). Replace the entire block including the closing `</ThreeColRow>` with:

```tsx
{/* Ligne 7-8-9 */}
<ThreeColRow $count={dashConfig.config.bottomPanels.filter(i => i.visible).length}>
  {dashConfig.config.bottomPanels
    .filter(item => item.visible)
    .map(item => {
      if (item.id === 'panel-edi') return (
        <PanelCard key="panel-edi">
          <PanelHeader>
            <PanelTitle>Suivi des flux EDI</PanelTitle>
          </PanelHeader>
          <EdiStatsGrid>
            <EdiStatItem>
              <EdiStatIcon $bg="#DCFCE7" $color="#16a34a"><IconSend /></EdiStatIcon>
              <div>
                <EdiStatNum>12</EdiStatNum>
                <EdiStatLabel>Commandes envoyées</EdiStatLabel>
              </div>
            </EdiStatItem>
            <EdiStatItem>
              <EdiStatIcon $bg="#EFF6FF" $color="#2563EB"><IconTruck /></EdiStatIcon>
              <div>
                <EdiStatNum>5</EdiStatNum>
                <EdiStatLabel>Expéditions en cours</EdiStatLabel>
              </div>
            </EdiStatItem>
            <EdiStatItem>
              <EdiStatIcon $bg="#FFF7ED" $color="#EA580C"><IconReceipt /></EdiStatIcon>
              <div>
                <EdiStatNum>3</EdiStatNum>
                <EdiStatLabel>Factures reçues</EdiStatLabel>
              </div>
            </EdiStatItem>
            <EdiStatItem>
              <EdiStatIcon $bg="#FEF2F2" $color="#DC2626"><IconXCircle /></EdiStatIcon>
              <div>
                <EdiStatNum>1</EdiStatNum>
                <EdiStatLabel>Erreur EDI</EdiStatLabel>
              </div>
            </EdiStatItem>
          </EdiStatsGrid>
          <EdiMetricsRow>
            <div>
              <EdiMetricLabel>Délai moyen de livraison</EdiMetricLabel>
              <EdiMetricValue>3,2 jours</EdiMetricValue>
            </div>
            <div>
              <EdiMetricLabel>Taux de réception</EdiMetricLabel>
              <EdiMetricValue>92%</EdiMetricValue>
            </div>
          </EdiMetricsRow>
          <EdiLink onClick={() => navigate('/edi')}>Accéder au suivi EDI →</EdiLink>
        </PanelCard>
      )
      if (item.id === 'panel-nouveautes') return (
        <PanelCard key="panel-nouveautes">
          <PanelHeader>
            <PanelTitle>Nouveautés du mois</PanelTitle>
            <PanelSeeAll onClick={() => navigate('/nouveautes')}>Voir tout →</PanelSeeAll>
          </PanelHeader>
          <NovelPanelWrap>
            <NovelArrow $side="right" $visible={canNovRight}
              onClick={() => scrollNovBy(120)} aria-label="Suivant">
              <IconChevron dir="right" />
            </NovelArrow>
            <NovelScroll ref={novelRef}>
              {nouveautes.map(book => {
                const badge = UNIVERSE_BADGE_COLOR[book.universe] ?? { bg: '#6B7280', text: '#fff' }
                return (
                  <MiniCard key={book.id} onClick={() => navigate(`/livre/${book.id}`)}>
                    <MiniCoverWrap>
                      <BookCover
                        isbn={book.isbn}
                        alt={book.title}
                        width={110}
                        height={150}
                        universe={book.universe}
                        authors={book.authors}
                        publisher={book.publisher}
                      />
                    </MiniCoverWrap>
                    <UniverseBadge $bg={badge.bg} $text={badge.text}>
                      {book.universe}
                    </UniverseBadge>
                    <MiniTitle>{book.title}</MiniTitle>
                    <MiniAuthor>{book.authors[0]}</MiniAuthor>
                  </MiniCard>
                )
              })}
            </NovelScroll>
          </NovelPanelWrap>
        </PanelCard>
      )
      if (item.id === 'panel-raccourcis') return (
        <PanelCard key="panel-raccourcis">
          <PanelHeader>
            <PanelTitle>Raccourcis</PanelTitle>
          </PanelHeader>
          <ShortcutList>
            {([
              { icon: <IconPackage />, label: 'Passer une commande',    to: '/fonds'      },
              { icon: <IconCart />,    label: 'Accéder au panier',       to: '/panier'     },
              { icon: <IconClipboard />, label: 'Gérer mes listes',      to: '/compte'     },
              { icon: <IconOrders />, label: 'Consulter mon historique', to: '/historique' },
            ] as { icon: React.ReactNode; label: string; to: string }[]).map(({ icon, label, to }) => (
              <ShortcutRow key={to} to={to}>
                <ShortcutIconWrap>{icon}</ShortcutIconWrap>
                <ShortcutRowLabel>{label}</ShortcutRowLabel>
                <ShortcutChevron>›</ShortcutChevron>
              </ShortcutRow>
            ))}
          </ShortcutList>
        </PanelCard>
      )
      return null
    })
  }
</ThreeColRow>
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run 2>&1 | tail -10
```

Expected: all tests pass (including the 14 new useDashboardConfig tests)

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): all 4 zones driven by useDashboardConfig — customization complete"
```

---

### Task 7: Final verification

- [ ] **Step 1: Build**

```bash
npx vite build 2>&1 | tail -10
```

Expected: build succeeds, no TypeScript errors

- [ ] **Step 2: Start dev server and verify in browser**

```bash
npx vite --port 5173
```

Open `http://localhost:5173`, log in, then verify:
1. "⊞ Personnaliser" button appears in the "Tableau de bord" header
2. Clicking it opens the drawer from the right with 4 sections
3. Toggle an item off → it disappears from the dashboard immediately
4. Drag a KPI card in the drawer → order updates on the dashboard
5. Close and reopen the browser → order and visibility persist
6. Click "Réinitialiser par défaut" → all items reappear in original order

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: final dashboard customization — verified build and manual tests pass"
```
