import { describe, it, expect } from 'vitest'
import { buildDashboardCSV } from '@/lib/exportCSV'
import type { PeriodKPI, DashboardOrder } from '@/data/mockDashboard'

const kpi: PeriodKPI = {
  nbCommandes:   2,
  nbActive:      1,
  nbCancelled:   1,
  montantTotal:  234.50,
  nbExemplaires: 12,
  panierMoyen:   234.50,
  delaiMoyen:    2.3,
  tauxAnnulation: 0.5,
  nbReferences:  3,
}

const orders: DashboardOrder[] = [
  {
    id: 'ord-0',
    orderId: 'ord-0',
    date: '2026-04-01',
    montantTTC: 234.50,
    nbExemplaires: 12,
    publisher: 'Gallimard',
    universe: 'Littérature',
    cancelled: false,
    deliveryDays: 2,
    references: ['978001', '978002', '978003'],
    items: [],
  },
  {
    id: 'ord-1',
    orderId: 'ord-1',
    date: '2026-04-15',
    montantTTC: 189.30,
    nbExemplaires: 8,
    publisher: 'Pika Édition',
    universe: 'BD/Mangas',
    cancelled: true,
    deliveryDays: 0,
    references: ['978004'],
    items: [],
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

  it('contains orders section header and column names', () => {
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
