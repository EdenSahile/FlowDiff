import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { buildDashboardCSV, buildDashboardWorkbook, buildKPIOnlyCSV, buildTitleLinesRows } from '@/lib/exportCSV'
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

  it('trie le détail des commandes par date décroissante', () => {
    const detailRows = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci').split('\n').slice(6)

    expect(detailRows.map(row => row.split(';')[0])).toEqual(['2026-04-15', '2026-04-01'])
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

  /* FLOW-RM-126 : les 2 autres cas d'échappement, non couverts jusqu'ici */
  it('double les guillemets d\'une valeur et l\'entoure de guillemets', () => {
    const ordersWithQuotedPublisher: DashboardOrder[] = [{ ...orders[0], publisher: 'Éditions "Phare"' }]

    const csvWithQuotedPublisher = buildDashboardCSV(kpi, ordersWithQuotedPublisher, period, 'Ce mois-ci')

    expect(csvWithQuotedPublisher).toContain('"Éditions ""Phare"""')
  })

  it('entoure de guillemets un libellé de période contenant le séparateur', () => {
    const csvWithSemicolonPreset = buildDashboardCSV(kpi, orders, period, 'Du 1er; au 29')

    expect(csvWithSemicolonPreset).toContain('"Du 1er; au 29"')
  })
})

/* FLOW-RM-126 : buildKPIOnlyCSV, 2e fonction pure du module, sans aucun test jusqu'ici */
describe('buildKPIOnlyCSV', () => {
  it('commence par le BOM UTF-8', () => {
    const kpiOnlyCSV = buildKPIOnlyCSV(kpi, period, 'Ce mois-ci')

    expect(kpiOnlyCSV.startsWith('﻿')).toBe(true)
  })

  it('contient la section KPI et sa ligne de données', () => {
    const kpiOnlyCSV = buildKPIOnlyCSV(kpi, period, 'Ce mois-ci')

    expect(kpiOnlyCSV).toContain('=== Résumé KPIs ===')
    expect(kpiOnlyCSV).toContain('Ce mois-ci;2026-04-01;2026-04-29;2;234,50;12;234,50;2,3;50,0;3')
  })

  it('n\'exporte pas le détail des commandes', () => {
    const kpiOnlyCSV = buildKPIOnlyCSV(kpi, period, 'Ce mois-ci')

    expect(kpiOnlyCSV).not.toContain('=== Détail des commandes ===')
  })

  it('tient en 3 lignes : titre de section, en-têtes, données', () => {
    const kpiOnlyCSV = buildKPIOnlyCSV(kpi, period, 'Ce mois-ci')

    expect(kpiOnlyCSV.split('\n')).toHaveLength(3)
  })

  it('produit la même ligne KPI que l\'export complet', () => {
    const kpiLineOfFullExport = buildDashboardCSV(kpi, orders, period, 'Ce mois-ci').split('\n')[2]

    const kpiLineOfKpiOnlyExport = buildKPIOnlyCSV(kpi, period, 'Ce mois-ci').split('\n')[2]

    expect(kpiLineOfKpiOnlyExport).toBe(kpiLineOfFullExport)
  })

  it('entoure de guillemets un libellé de période contenant le séparateur', () => {
    const kpiOnlyCSV = buildKPIOnlyCSV(kpi, period, 'Du 1er; au 29')

    expect(kpiOnlyCSV).toContain('"Du 1er; au 29"')
  })
})

describe('export Excel du tableau de bord', () => {
  const orderWithTitle: DashboardOrder = {
    ...orders[0],
    orderNumber: 'CMD0000013',
    orderStatus: 'livré',
    invoiceNumber: 'FAC-2026-0342',
    invoiceDate: '2026-04-03',
    items: [{
      isbn: '978-2070360024',
      title: "L'Étranger",
      author: 'Albert Camus',
      publisher: 'Gallimard',
      typeCommande: 'Fonds',
      quantity: 6,
      unitPriceHT: 4.90,
      unitPriceTTC: 5.17,
      discountRate: 0.35,
      montantTTC: 20.18,
    }],
  }

  it('présente les données N-1 dans le Dashboard et dans Lignes titres', () => {
    const workbook = buildDashboardWorkbook(kpi, [orderWithTitle], period, 'Ce mois-ci', {
      orders: [{ ...orderWithTitle, orderNumber: 'CMD0000012', date: '2025-04-01' }],
      period: { start: new Date('2025-04-01'), end: new Date('2025-04-29') },
      label: 'N-1',
    })
    expect(workbook.SheetNames).toEqual(['Dashboard', 'Lignes titres'])

    const dashboard = workbook.Sheets.Dashboard
    expect(dashboard.A1.v).toBe('=== KPIs — période analysée ===')
    expect(dashboard.A5.v).toBe('=== KPIs — comparatif N-1 ===')
    expect(dashboard.A7.v).toBe('N-1')
    expect(dashboard.B7.v).toBe('2025-04-01')
    expect(dashboard.A9.v).toBe('=== Détail des commandes — période analysée ===')
    expect(dashboard.A11.v).toBe('2026-04-01')
    expect(dashboard.A13.v).toBe('=== Détail des commandes — N-1 ===')
    expect(dashboard.A15.v).toBe('2025-04-01')
    expect(workbook.Sheets['Lignes titres'].A3.v).toBe('CMD0000013')
    expect(workbook.Sheets['Lignes titres'].A4.v).toBe('CMD0000012')

    const exported = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const reopened = XLSX.read(exported, { type: 'array' })
    expect(reopened.SheetNames).toEqual(['Dashboard', 'Lignes titres'])
    expect(reopened.Sheets['Lignes titres']['!merges']).toHaveLength(3)
    expect(reopened.Sheets['Lignes titres'].A4.v).toBe('CMD0000012')
  })

  it('n’ajoute aucune ligne N-1 sans comparatif actif', () => {
    const workbook = buildDashboardWorkbook(kpi, [orderWithTitle], period, 'Ce mois-ci')

    expect(workbook.SheetNames).toEqual(['Dashboard', 'Lignes titres'])
    expect(workbook.Sheets['Lignes titres'].A4).toBeUndefined()
  })

  it('groupe les lignes par commande, livre et montants avec des valeurs calculées', () => {
    const rows = buildTitleLinesRows([orderWithTitle])
    expect(rows).toEqual([[
      'CMD0000013', 'Livrée', '01/04/2026', 'Avril', 2026, 'FAC-2026-0342', '03/04/2026',
      '9782070360024', "L'Étranger", 'Albert Camus', 'Gallimard', 'Littérature', 'Fonds',
      6, 5.17, 35, 3.19, 19.14,
    ]])
  })

  it('trie les lignes titres par date de commande décroissante', () => {
    const rows = buildTitleLinesRows([
      { ...orderWithTitle, date: '2026-04-01' },
      { ...orderWithTitle, orderNumber: 'CMD0000014', date: '2026-04-20' },
    ])

    expect(rows.map(row => row[2])).toEqual(['20/04/2026', '01/04/2026'])
  })

  it('calcule le net HT depuis le prix public TTC, sans remettre le tarif de commande', () => {
    const rows = buildTitleLinesRows([{
      ...orderWithTitle,
      items: [{
        ...orderWithTitle.items[0],
        quantity: 2,
        unitPriceHT: 14.60,
        unitPriceTTC: 21.90,
        discountRate: 0.35,
      }],
    }])

    expect(rows[0].slice(13)).toEqual([2, 21.90, 35, 13.49, 26.98])
  })
})
