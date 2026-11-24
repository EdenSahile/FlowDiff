# Export CSV Tableau de bord — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton "Exporter CSV" dans le Tableau de bord de la HomePage qui génère un fichier CSV à deux sections (résumé KPIs + détail commandes) pour la période sélectionnée.

**Architecture:** Fonction pure `buildDashboardCSV` (testable) + wrapper `exportDashboardCSV` (déclenche le téléchargement) dans `src/lib/exportCSV.ts`. Bouton dans `BilanHeader` de `HomePage.tsx` qui appelle `exportDashboardCSV`.

**Tech Stack:** TypeScript strict, Vitest, Blob API (natif navigateur, zéro dépendance)

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `src/lib/exportCSV.ts` | Créer |
| `src/lib/__tests__/exportCSV.test.ts` | Créer |
| `src/pages/home/HomePage.tsx` | Modifier |

---

## Task 1 : `src/lib/exportCSV.ts` — générateur CSV (TDD)

**Files:**
- Create: `src/lib/exportCSV.ts`
- Create: `src/lib/__tests__/exportCSV.test.ts`

---

- [ ] **Étape 1 — Écrire les tests (fichier vide, ils doivent échouer)**

Créer `src/lib/__tests__/exportCSV.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { buildDashboardCSV } from '@/lib/exportCSV'
import type { PeriodKPI, DashboardOrder } from '@/data/mockDashboard'

const kpi: PeriodKPI = {
  nbCommandes:  2,
  nbActive:     1,
  nbCancelled:  1,
  montantTotal: 234.50,
  nbExemplaires: 12,
  panierMoyen:  234.50,
  delaiMoyen:   2.3,
  tauxRupture:  0.5,
  nbReferences: 3,
}

const orders: DashboardOrder[] = [
  {
    id: 'ord-0',
    date: '2026-04-01',
    montantTTC: 234.50,
    nbExemplaires: 12,
    publisher: 'Gallimard',
    universe: 'Littérature',
    cancelled: false,
    deliveryDays: 2,
    references: ['978001', '978002', '978003'],
  },
  {
    id: 'ord-1',
    date: '2026-04-15',
    montantTTC: 189.30,
    nbExemplaires: 8,
    publisher: 'Pika Édition',
    universe: 'BD/Mangas',
    cancelled: true,
    deliveryDays: 0,
    references: ['978004'],
  },
]

const period = { start: new Date('2026-04-01'), end: new Date('2026-04-29') }

describe('buildDashboardCSV', () => {
  it('starts with UTF-8 BOM for Excel compatibility', () => {
    const csv = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci')
    expect(csv.startsWith('﻿')).toBe(true)
  })

  it('contains KPI section header and correct data row', () => {
    const csv = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci')
    expect(csv).toContain('=== Résumé KPIs ===')
    expect(csv).toContain('Ce mois-ci;2026-04-01;2026-04-29;2;234,50;12;234,50;2,3;50,0;3')
  })

  it('contains orders section header', () => {
    const csv = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci')
    expect(csv).toContain('=== Détail des commandes ===')
    expect(csv).toContain('Date;Éditeur;Univers;Montant TTC (€);Nb exemplaires;Statut')
  })

  it('formats active order as Livrée', () => {
    const csv = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci')
    expect(csv).toContain('2026-04-01;Gallimard;Littérature;234,50;12;Livrée')
  })

  it('formats cancelled order as Annulée', () => {
    const csv = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci')
    expect(csv).toContain('2026-04-15;Pika Édition;BD/Mangas;189,30;8;Annulée')
  })

  it('exports only headers when no orders', () => {
    const csv = buildDashboardCSV(kpi, [], period, 'Ce mois-ci')
    const lines = csv.split('\n')
    const detailIdx = lines.findIndex(l => l.includes('=== Détail des commandes ==='))
    expect(lines[detailIdx + 1]).toContain('Date;Éditeur')
    expect(lines[detailIdx + 2]).toBeUndefined()
  })

  it('escapes semicolons in cell values with double quotes', () => {
    const ordersWithSemicolon: DashboardOrder[] = [{
      ...orders[0],
      publisher: 'Ed; Spéciale',
    }]
    const csv = buildDashboardCSV(kpi, ordersWithSemicolon, period, 'Ce mois-ci')
    expect(csv).toContain('"Ed; Spéciale"')
  })
})
```

- [ ] **Étape 2 — Vérifier que les tests échouent**

```bash
npx vitest run src/lib/__tests__/exportCSV.test.ts
```

Résultat attendu : erreur `Cannot find module '@/lib/exportCSV'`

- [ ] **Étape 3 — Implémenter `src/lib/exportCSV.ts`**

Créer `src/lib/exportCSV.ts` :

```ts
import type { PeriodKPI, DashboardOrder } from '@/data/mockDashboard'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function fmtNum2(n: number): string {
  return n.toFixed(2).replace('.', ',')
}

function fmtNum1(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

function cell(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildDashboardCSV(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
): string {
  const lines: string[] = []

  lines.push('=== Résumé KPIs ===')
  lines.push('Période;Du;Au;Commandes passées;Montant total TTC (€);Exemplaires commandés;Panier moyen (€);Délai moyen (j);Taux de rupture (%);Références distinctes')
  lines.push([
    cell(preset),
    isoDate(period.start),
    isoDate(period.end),
    kpi.nbCommandes,
    fmtNum2(kpi.montantTotal),
    kpi.nbExemplaires,
    fmtNum2(kpi.panierMoyen),
    fmtNum1(kpi.delaiMoyen),
    fmtNum1(kpi.tauxRupture * 100),
    kpi.nbReferences,
  ].join(';'))

  lines.push('')

  lines.push('=== Détail des commandes ===')
  lines.push('Date;Éditeur;Univers;Montant TTC (€);Nb exemplaires;Statut')
  for (const o of orders) {
    lines.push([
      o.date,
      cell(o.publisher),
      cell(o.universe),
      fmtNum2(o.montantTTC),
      o.nbExemplaires,
      o.cancelled ? 'Annulée' : 'Livrée',
    ].join(';'))
  }

  return '﻿' + lines.join('\n')
}

export function exportDashboardCSV(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
): void {
  const csv  = buildDashboardCSV(kpi, orders, period, preset)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `flowdiff-dashboard-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

- [ ] **Étape 4 — Vérifier que les tests passent**

```bash
npx vitest run src/lib/__tests__/exportCSV.test.ts
```

Résultat attendu : `7 tests passed`

- [ ] **Étape 5 — Vérifier TS**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune sortie (TS clean)

- [ ] **Étape 6 — Commit**

```bash
git add src/lib/exportCSV.ts src/lib/__tests__/exportCSV.test.ts
git commit -m "feat(dashboard): export CSV — générateur buildDashboardCSV + tests"
```

---

## Task 2 : Bouton "Exporter CSV" dans `HomePage.tsx`

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

---

- [ ] **Étape 1 — Ajouter l'import en haut du fichier**

Dans `src/pages/home/HomePage.tsx`, ajouter à la liste des imports existants (après l'import de `mockDashboard`) :

```ts
import { exportDashboardCSV } from '@/lib/exportCSV'
```

- [ ] **Étape 2 — Ajouter l'icône `IconDownload`**

Dans `src/pages/home/HomePage.tsx`, après la fonction `IconBarChart` (ligne ~164), ajouter :

```tsx
function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
```

- [ ] **Étape 3 — Ajouter le bouton dans `DashboardControls`**

Dans `src/pages/home/HomePage.tsx`, localiser le bloc `DashboardControls` dans le rendu de la section `kpi` (contient `PeriodSelector`, `ComparaisonToggle`, `CustomizeBtn`).

Ajouter le bouton **avant** `CustomizeBtn` :

```tsx
<CustomizeBtn type="button" onClick={() =>
  exportDashboardCSV(kpi, periodFilter.orders, periodFilter.period, periodFilter.preset)
}>
  <IconDownload /> Exporter CSV
</CustomizeBtn>
```

Le bloc `DashboardControls` complet doit ressembler à :

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
  <CustomizeBtn type="button" onClick={() =>
    exportDashboardCSV(kpi, periodFilter.orders, periodFilter.period, periodFilter.preset)
  }>
    <IconDownload /> Exporter CSV
  </CustomizeBtn>
  <CustomizeBtn type="button" onClick={() => setCustomizerOpen(true)}>
    <IconLayout /> Personnaliser
  </CustomizeBtn>
</DashboardControls>
```

- [ ] **Étape 4 — Vérifier TS**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune sortie (TS clean)

- [ ] **Étape 5 — Vérifier tous les tests**

```bash
npx vitest run
```

Résultat attendu : `146+ tests passed` (les 7 nouveaux + les 146 existants)

- [ ] **Étape 6 — Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "feat(dashboard): bouton Exporter CSV dans le tableau de bord"
```
