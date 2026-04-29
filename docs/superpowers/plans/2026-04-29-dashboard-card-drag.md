# Dashboard Card Drag & Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag handles to all dashboard cards so users can reorder them directly on the homepage without opening the CustomizerDrawer.

**Architecture:** HTML5 drag & drop, integrated into the existing `useDashboardConfig` hook. Single file change: `src/pages/home/HomePage.tsx`. Three new styled components (`CardDragHandle`, `ActionCardWrap`, `IconGrip`) + modified `KPICard`, `ActionCard`, `PanelCard`. Two `useState` + one `useRef` for drag state. No new dependencies, no new files.

**Tech Stack:** React 18, TypeScript, styled-components v6, HTML5 DnD API, `useDashboardConfig` (existing hook), `DashboardZone` type (existing)

---

### Task 1: Add `IconGrip` component and `CardDragHandle` styled component

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

`CardDragHandle` must be defined before `KPICard`, `ActionCardWrap`, and `PanelCard` — all of which reference it in their `&:hover` rules.

- [ ] **Step 1: Add `IconGrip` after `IconBarChart`**

Find the closing brace of `IconBarChart` (around line 165) and insert immediately after:

```tsx
function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="3" r="1.2" />
      <circle cx="10" cy="3" r="1.2" />
      <circle cx="4" cy="7" r="1.2" />
      <circle cx="10" cy="7" r="1.2" />
      <circle cx="4" cy="11" r="1.2" />
      <circle cx="10" cy="11" r="1.2" />
    </svg>
  )
}
```

- [ ] **Step 2: Add `CardDragHandle` before `/* ── Actions en attente ── */`**

Insert before the `/* ── Actions en attente ── */` comment block:

```ts
/* ── Drag handles ── */
const CardDragHandle = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 5px;
  cursor: grab;
  color: ${({ theme }) => theme.colors.gray[400]};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;

  &:active { cursor: grabbing; }
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): add CardDragHandle + IconGrip for card drag"
```

---

### Task 2: Modify `ActionCard` + add `ActionCardWrap`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

`ActionCard` is a `button` — nesting another button inside it is invalid HTML. Pattern: `ActionCardWrap` (div, holds DnD attrs + absolute `CardDragHandle`) wraps `ActionCard` (button, unchanged behavior).

- [ ] **Step 1: Replace `ActionCard` styled component**

Replace the existing `ActionCard` definition with:

```ts
const ActionCard = styled.button<{ $empty?: boolean; $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $empty, $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : $empty ? '#E5E7EB' : '#FEE2E2'};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: ${({ $empty }) => $empty ? 'default' : 'pointer'};
  text-align: left;
  width: 100%;
  opacity: ${({ $empty, $dragging }) => $dragging ? 0.4 : $empty ? 0.55 : 1};
  pointer-events: ${({ $empty }) => $empty ? 'none' : 'auto'};
  transition: opacity 0.1s, border-color 0.1s;
  &:hover { border-color: ${({ $empty, $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : $empty ? '#E5E7EB' : '#FECACA'}; }
`
```

- [ ] **Step 2: Add `ActionCardWrap` immediately after `ActionCard`**

Insert right after the closing backtick of `ActionCard`:

```ts
const ActionCardWrap = styled.div`
  position: relative;
  &:hover ${CardDragHandle} { opacity: 1; }
`
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): add ActionCardWrap + DnD props on ActionCard"
```

---

### Task 3: Add DnD props to `KPICard` and `PanelCard`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

Both components become draggable containers. `CardDragHandle` must already be defined (done in Task 1) for the `&:hover` rule to work.

- [ ] **Step 1: Replace `KPICard` styled component**

```ts
const KPICard = styled.div<{ $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : theme.colors.gray[200]};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  opacity: ${({ $dragging }) => $dragging ? 0.4 : 1};
  transition: opacity 0.1s, border-color 0.1s;

  &:hover ${CardDragHandle} { opacity: 1; }
`
```

- [ ] **Step 2: Replace `PanelCard` styled component**

```ts
const PanelCard = styled.div<{ $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : theme.colors.gray[200]};
  padding: 16px;
  position: relative;
  opacity: ${({ $dragging }) => $dragging ? 0.4 : 1};
  transition: opacity 0.1s, border-color 0.1s;

  &:hover ${CardDragHandle} { opacity: 1; }
`

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors (props not yet passed in JSX — optional props, so no TS error).

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): add DnD props to KPICard and PanelCard"
```

---

### Task 4: Add DnD state and handlers to `HomePage`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Add `DashboardZone` to the import**

Find:
```ts
import { useDashboardConfig } from '@/hooks/useDashboardConfig'
```

Replace with:
```ts
import { useDashboardConfig, type DashboardZone } from '@/hooks/useDashboardConfig'
```

- [ ] **Step 2: Add drag state after `const dashConfig = useDashboardConfig()`**

Find:
```ts
  const dashConfig = useDashboardConfig()
```

Add immediately after:
```ts
  const cardDragRef = useRef<{ zone: DashboardZone; id: string } | null>(null)
  const [cardDrag, setCardDrag] = useState<{ zone: DashboardZone; id: string } | null>(null)
  const [cardDrop, setCardDrop] = useState<{ zone: DashboardZone; id: string } | null>(null)
```

- [ ] **Step 3: Add event handlers inside `HomePage`, before the `return` statement**

Find:
```ts
  function scrollNovBy(delta: number) {
```

Add immediately before it:
```ts
  function handleDragStart(zone: DashboardZone, id: string) {
    cardDragRef.current = { zone, id }
    setCardDrag({ zone, id })
  }

  function handleDragOver(e: React.DragEvent, zone: DashboardZone, id: string) {
    e.preventDefault()
    if (cardDragRef.current?.zone === zone) setCardDrop({ zone, id })
  }

  function handleDrop(zone: DashboardZone, toId: string) {
    const drag = cardDragRef.current
    if (!drag || drag.zone !== zone) return
    if (drag.id !== toId) {
      const items = dashConfig.config[zone]
      const fromIdx = items.findIndex(i => i.id === drag.id)
      const toIdx   = items.findIndex(i => i.id === toId)
      if (fromIdx !== -1 && toIdx !== -1) dashConfig.reorder(zone, fromIdx, toIdx)
    }
    cardDragRef.current = null
    setCardDrag(null)
    setCardDrop(null)
  }

  function handleDragEnd() {
    cardDragRef.current = null
    setCardDrag(null)
    setCardDrop(null)
  }

```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): add DnD state and handlers to HomePage"
```

---

### Task 5: Wire DnD on `kpiCards`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Replace the `kpiCards` render block**

Find:
```tsx
          <KPIGrid>
            {dashConfig.config.kpiCards
              .filter(c => c.visible)
              .map(c => {
                const def = kpiCardDefs[c.id]
                if (!def) return null
                return (
                  <KPICard key={c.id}>
                    <KPITop>
                      <KPIIconWrap $bg={def.iconBg} $color={def.iconColor}>
                        {def.icon}
                      </KPIIconWrap>
                      <KPILabel>{def.label}</KPILabel>
                    </KPITop>
                    <KPIValue>{def.value}</KPIValue>
                    {def.trend}
                    {def.link}
                  </KPICard>
                )
              })
            }
          </KPIGrid>
```

Replace with:
```tsx
          <KPIGrid>
            {dashConfig.config.kpiCards
              .filter(c => c.visible)
              .map(c => {
                const def = kpiCardDefs[c.id]
                if (!def) return null
                return (
                  <KPICard
                    key={c.id}
                    $dragging={cardDrag?.id === c.id}
                    $dropTarget={cardDrop?.id === c.id}
                    draggable
                    onDragStart={() => handleDragStart('kpiCards', c.id)}
                    onDragOver={e => handleDragOver(e, 'kpiCards', c.id)}
                    onDrop={() => handleDrop('kpiCards', c.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardDragHandle title="Déplacer" aria-label="Déplacer cette carte">
                      <IconGrip />
                    </CardDragHandle>
                    <KPITop>
                      <KPIIconWrap $bg={def.iconBg} $color={def.iconColor}>
                        {def.icon}
                      </KPIIconWrap>
                      <KPILabel>{def.label}</KPILabel>
                    </KPITop>
                    <KPIValue>{def.value}</KPIValue>
                    {def.trend}
                    {def.link}
                  </KPICard>
                )
              })
            }
          </KPIGrid>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): wire drag & drop on kpiCards"
```

---

### Task 6: Wire DnD on `actionCards`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Replace the `actionCards` render block**

Find:
```tsx
          <ActionsGrid>
            {dashConfig.config.actionCards
              .filter(c => c.visible)
              .map(c => {
                const def = actionCardDefs[c.id]
                if (!def) return null
                return (
                  <ActionCard
                    key={c.id}
                    $empty={def.empty}
                    onClick={!def.empty && def.route ? () => navigate(def.route!) : undefined}
                  >
                    <ActionIconWrap $bg={def.iconBg} $color={def.iconColor}>
                      {def.icon}
                    </ActionIconWrap>
                    <ActionBody>
                      <ActionCount>{def.count}</ActionCount>
                      <ActionLabel>{def.label}</ActionLabel>
                      {def.deadline && <ActionDeadline>{def.deadline}</ActionDeadline>}
                    </ActionBody>
                    {!def.empty && def.route && <ActionArrow>→</ActionArrow>}
                  </ActionCard>
                )
              })
            }
          </ActionsGrid>
```

Replace with:
```tsx
          <ActionsGrid>
            {dashConfig.config.actionCards
              .filter(c => c.visible)
              .map(c => {
                const def = actionCardDefs[c.id]
                if (!def) return null
                return (
                  <ActionCardWrap
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart('actionCards', c.id)}
                    onDragOver={e => handleDragOver(e, 'actionCards', c.id)}
                    onDrop={() => handleDrop('actionCards', c.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardDragHandle title="Déplacer" aria-label="Déplacer cette carte">
                      <IconGrip />
                    </CardDragHandle>
                    <ActionCard
                      $empty={def.empty}
                      $dragging={cardDrag?.id === c.id}
                      $dropTarget={cardDrop?.id === c.id}
                      onClick={!def.empty && def.route ? () => navigate(def.route!) : undefined}
                    >
                      <ActionIconWrap $bg={def.iconBg} $color={def.iconColor}>
                        {def.icon}
                      </ActionIconWrap>
                      <ActionBody>
                        <ActionCount>{def.count}</ActionCount>
                        <ActionLabel>{def.label}</ActionLabel>
                        {def.deadline && <ActionDeadline>{def.deadline}</ActionDeadline>}
                      </ActionBody>
                      {!def.empty && def.route && <ActionArrow>→</ActionArrow>}
                    </ActionCard>
                  </ActionCardWrap>
                )
              })
            }
          </ActionsGrid>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): wire drag & drop on actionCards"
```

---

### Task 7: Wire DnD on `mainPanels` and `bottomPanels`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

Each `PanelCard` gets drag props + a `CardDragHandle` as its first child. The zone string differs: `'mainPanels'` or `'bottomPanels'`.

- [ ] **Step 1: Replace the `mainPanels` render block**

Find:
```tsx
        {/* Ligne 4-5-6 */}
        <ThreeColRow $count={dashConfig.config.mainPanels.filter(c => c.visible).length}>
          {dashConfig.config.mainPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-evolution') return (
                <PanelCard key={c.id}>
```

Replace the entire `mainPanels` map block with:

```tsx
        {/* Ligne 4-5-6 */}
        <ThreeColRow $count={dashConfig.config.mainPanels.filter(c => c.visible).length}>
          {dashConfig.config.mainPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-evolution') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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
              if (c.id === 'panel-donut') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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
                            {cmpSeg && (
                              <LegendPctCompare>vs {cmpSeg.percent}%</LegendPctCompare>
                            )}
                          </LegendItem>
                        )
                      })}
                    </DonutLegend>
                  </DonutInner>
                </PanelCard>
              )
              if (c.id === 'panel-editeurs') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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

- [ ] **Step 2: Replace the `bottomPanels` render block**

Find:
```tsx
        {/* Ligne 7-8-9 */}
        <ThreeColRow $count={dashConfig.config.bottomPanels.filter(c => c.visible).length}>
          {dashConfig.config.bottomPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-edi') return (
                <PanelCard key={c.id}>
```

Replace the entire `bottomPanels` map block with:

```tsx
        {/* Ligne 7-8-9 */}
        <ThreeColRow $count={dashConfig.config.bottomPanels.filter(c => c.visible).length}>
          {dashConfig.config.bottomPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-edi') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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
              if (c.id === 'panel-nouveautes') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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
              if (c.id === 'panel-raccourcis') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
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

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): wire drag & drop on mainPanels and bottomPanels"
```

---

### Task 8: Final verification

**Files:**
- Read: `src/pages/home/HomePage.tsx`

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run existing test suite**

```bash
npx vitest run
```

Expected: all tests pass (no regressions — nothing existing was removed).

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:5173`, log in, go to the home page. Verify:

1. **KPI cards** — hover a card → grip `⠿` appears top-right. Click-drag to another KPI card position → order changes. After drop, drawer also reflects new order. Reload → order persists.
2. **Action cards** — same: hover → grip appears. Drag to reorder.
3. **Main panels** (Évolution / Répartition / Top éditeurs) — drag panel-evolution to last position → panels reorder.
4. **Bottom panels** (EDI / Nouveautés / Raccourcis) — drag to reorder.
5. **Cross-zone guard** — drag a KPI card and release over a panel → nothing changes (correct).
6. **Abandon mid-drag** — start drag, press Esc or release over empty space → card returns to original position, no state corruption.
7. **Drawer sync** — reorder via drag on page, then open CustomizerDrawer → drawer shows same order.
8. **Drawer reorder** → page reflects new order.

- [ ] **Step 4: Commit verification note**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): complete card drag & drop on homepage — all zones"
```
