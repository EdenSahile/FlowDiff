import { computeKPIs, DASHBOARD_REMISE_RATES, type PeriodKPI, type DashboardOrder, type ChartPoint, type DonutSegment, type TopPublisher } from '@/data/mockDashboard'
import type { Book } from '@/data/mockBooks'
import { formatPrice } from '@/lib/format'
import * as XLSX from 'xlsx'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function fmtNum2(n: number): string {
  return formatPrice(n)
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

type ExportCell = string | number

interface ComparisonExport {
  orders: DashboardOrder[]
  period: { start: Date; end: Date }
  label: string
}

function sortOrdersByDateDescending(orders: DashboardOrder[]): DashboardOrder[] {
  return [...orders].sort((a, b) => b.date.localeCompare(a.date))
}

function periodLabel(preset: string): string {
  const labels: Record<string, string> = {
    'last-7': '7 jours',
    'last-30': '30 jours',
    'this-month': 'Ce mois-ci',
    'last-month': 'Mois dernier',
    '3-months': '3 mois',
    '6-months': '6 mois',
    'last-12': '12 mois',
    'this-year': 'Cette année',
    custom: 'Personnalisée',
  }
  return labels[preset] ?? preset
}

const DASHBOARD_KPI_HEADERS = [
  'Période', 'Du', 'Au', 'Commandes passées', 'Montant total TTC (€)',
  'Exemplaires commandés', 'Panier moyen (€)', 'Délai moyen (j)',
  'Taux d’annulation (%)', 'Références distinctes commandées',
]

function appendKpiSection(
  rows: ExportCell[][],
  title: string,
  label: string,
  kpi: PeriodKPI,
  period: { start: Date; end: Date },
): void {
  rows.push([title])
  rows.push(DASHBOARD_KPI_HEADERS)
  rows.push([
    label,
    isoDate(period.start),
    isoDate(period.end),
    kpi.nbCommandes,
    fmtNum2(kpi.montantTotal),
    kpi.nbExemplaires,
    fmtNum2(kpi.panierMoyen),
    fmtNum1(kpi.delaiMoyen),
    fmtNum1(kpi.tauxAnnulation * 100),
    kpi.nbReferences,
  ])
}

function appendOrderDetailSection(
  rows: ExportCell[][],
  title: string,
  orders: DashboardOrder[],
): void {
  rows.push([])
  rows.push([title])
  rows.push(['Date', 'Éditeur', 'Univers', 'Montant TTC (€)', 'Nb exemplaires', 'Statut'])
  for (const o of sortOrdersByDateDescending(orders)) {
    rows.push([
      o.date,
      o.publisher,
      o.universe,
      fmtNum2(o.montantTTC),
      o.nbExemplaires,
      o.cancelled ? 'Annulée' : 'Livrée',
    ])
  }
}

function buildDashboardRows(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
  comparison?: ComparisonExport,
): ExportCell[][] {
  const rows: ExportCell[][] = []

  appendKpiSection(
    rows,
    comparison ? '=== KPIs — période analysée ===' : '=== Résumé KPIs ===',
    periodLabel(preset),
    kpi,
    period,
  )

  if (comparison) {
    rows.push([])
    appendKpiSection(
      rows,
      `=== KPIs — comparatif ${comparison.label} ===`,
      comparison.label,
      computeKPIs(comparison.orders),
      comparison.period,
    )
  }

  appendOrderDetailSection(
    rows,
    comparison ? '=== Détail des commandes — période analysée ===' : '=== Détail des commandes ===',
    orders,
  )

  if (comparison) {
    appendOrderDetailSection(rows, `=== Détail des commandes — ${comparison.label} ===`, comparison.orders)
  }

  return rows
}

export function buildDashboardCSV(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
): string {
  return '﻿' + buildDashboardRows(kpi, orders, period, preset)
    .map(row => row.map(value => cell(String(value))).join(';'))
    .join('\n')
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatDateFR(iso?: string): string {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

function monthName(iso: string): string {
  const month = Number(iso.slice(5, 7))
  return MONTHS_FR[month - 1] ?? ''
}

function parseISODate(iso?: string): Date | '' {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return ''
  return new Date(year, month - 1, day)
}

function statusLabel(order: DashboardOrder): string {
  if (order.cancelled) return 'Annulée'
  if (order.orderStatus === 'en préparation') return 'En préparation'
  if (order.orderStatus === 'expédié') return 'Expédiée'
  return 'Livrée'
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function ean13CheckDigit(base: string): string {
  const sum = [...base].reduce((total, digit, index) =>
    total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)
  return String((10 - (sum % 10)) % 10)
}

function normalizeISBN13(isbn: string): string {
  const digits = isbn.replace(/\D/g, '')
  if (digits.length === 13) return digits
  if (digits.length === 12) return `${digits}${ean13CheckDigit(digits)}`
  if (digits.length === 10) {
    const base = `978${digits.slice(0, 9)}`
    return `${base}${ean13CheckDigit(base)}`
  }
  return digits
}

const TITLE_EXPORT_HEADERS = [
  'N° commande', 'Statut', 'Date commande', 'Mois commande', 'Année commande', 'N° facture', 'Date facture',
  'ISBN', 'Titre', 'Auteur', 'Éditeur', 'Univers', 'Type de commande',
  'Quantité', 'Prix public unitaire TTC (€)', 'Remise (%)', 'Prix unitaire net HT (€)', 'Montant HT (€)',
] as const

export function buildTitleLinesRows(orders: DashboardOrder[]): ExportCell[][] {
  return sortOrdersByDateDescending(orders).flatMap(order => order.items.map(item => {
    const discountRate = item.discountRate ?? DASHBOARD_REMISE_RATES[order.universe]
    // Le prix TTC est la référence publique exportée. `unitPriceHT` provient
    // des commandes et peut déjà refléter un tarif remisé ; l'utiliser ici
    // appliquerait alors la remise une seconde fois.
    const publicPriceHT = item.unitPriceTTC / 1.055
    const unitNetHT = roundCurrency(publicPriceHT * (1 - discountRate))
    const amountHT = roundCurrency(unitNetHT * item.quantity)

    return [
      order.orderNumber ?? order.orderId,
      statusLabel(order),
      formatDateFR(order.date),
      monthName(order.date),
      Number(order.date.slice(0, 4)),
      order.invoiceNumber ?? '',
      formatDateFR(order.invoiceDate),
      normalizeISBN13(item.isbn),
      item.title,
      item.author ?? '',
      item.publisher,
      order.universe,
      item.typeCommande ?? '',
      item.quantity,
      roundCurrency(item.unitPriceTTC),
      roundCurrency(discountRate * 100),
      unitNetHT,
      amountHT,
    ]
  }))
}

function buildTitleLinesSheet(orders: DashboardOrder[]): XLSX.WorkSheet {
  const titleRows = buildTitleLinesRows(orders)
  const titleRowsForWorkbook = titleRows.map(row => {
    const spreadsheetRow: Array<ExportCell | Date> = [...row]
    spreadsheetRow[2] = parseISODate(orders.find(order => (order.orderNumber ?? order.orderId) === row[0])?.date)
    spreadsheetRow[6] = parseISODate(orders.find(order => (order.orderNumber ?? order.orderId) === row[0])?.invoiceDate)
    return spreadsheetRow
  })
  const groupHeaderRow = 1
  const columnHeaderRow = groupHeaderRow + 1
  const dataStartRow = columnHeaderRow + 1
  const linesSheet = XLSX.utils.aoa_to_sheet([
    [
      'Commande', '', '', '', '', '', '',
      'Livre', '', '', '', '', '',
      'Montants', '', '', '', '',
    ],
    [...TITLE_EXPORT_HEADERS],
    ...titleRowsForWorkbook,
  ])
  linesSheet['!merges'] = [
    XLSX.utils.decode_range(`A${groupHeaderRow}:G${groupHeaderRow}`),
    XLSX.utils.decode_range(`H${groupHeaderRow}:M${groupHeaderRow}`),
    XLSX.utils.decode_range(`N${groupHeaderRow}:R${groupHeaderRow}`),
  ]
  linesSheet['!autofilter'] = { ref: `A${columnHeaderRow}:R${Math.max(columnHeaderRow, titleRows.length + columnHeaderRow)}` }
  linesSheet['!cols'] = [
    { wch: 17 }, { wch: 17 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 19 }, { wch: 15 },
    { wch: 16 }, { wch: 38 }, { wch: 26 }, { wch: 22 }, { wch: 20 }, { wch: 19 },
    { wch: 11 }, { wch: 27 }, { wch: 12 }, { wch: 24 }, { wch: 16 },
  ]
  for (let row = dataStartRow; row <= titleRows.length + columnHeaderRow; row += 1) {
    linesSheet[`C${row}`].z = 'dd/mm/yyyy'
    linesSheet[`G${row}`].z = 'dd/mm/yyyy'
    linesSheet[`O${row}`].z = '#,##0.00 "€"'
    linesSheet[`P${row}`].z = '0.##'
    linesSheet[`Q${row}`].z = '#,##0.00 "€"'
    linesSheet[`R${row}`].z = '#,##0.00 "€"'
  }
  return linesSheet
}

export function buildDashboardWorkbook(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
  comparison?: ComparisonExport,
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  // Ce premier onglet reprend strictement le contenu de l'ancien export CSV.
  const dashboardSheet = XLSX.utils.aoa_to_sheet(buildDashboardRows(kpi, orders, period, preset, comparison))
  dashboardSheet['!cols'] = [
    { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 18 }, { wch: 23 },
    { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 30 },
  ]
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard')

  const linesOrders = comparison ? [...orders, ...comparison.orders] : orders
  const linesSheet = buildTitleLinesSheet(linesOrders)
  XLSX.utils.book_append_sheet(workbook, linesSheet, 'Lignes titres')

  return workbook
}

export function buildKPIOnlyCSV(
  kpi: PeriodKPI,
  period: { start: Date; end: Date },
  preset: string,
): string {
  const lines: string[] = []
  lines.push('=== Résumé KPIs ===')
  lines.push('Période;Du;Au;Commandes passées;Montant total TTC (€);Exemplaires commandés;Panier moyen (€);Délai moyen (j);Taux d’annulation (%);Références distinctes commandées')
  lines.push([
    cell(preset),
    isoDate(period.start),
    isoDate(period.end),
    kpi.nbCommandes,
    fmtNum2(kpi.montantTotal),
    kpi.nbExemplaires,
    fmtNum2(kpi.panierMoyen),
    fmtNum1(kpi.delaiMoyen),
    fmtNum1(kpi.tauxAnnulation * 100),
    kpi.nbReferences,
  ].join(';'))
  return '﻿' + lines.join('\n')
}

export function exportKPIOnlyCSV(
  kpi: PeriodKPI,
  period: { start: Date; end: Date },
  preset: string,
): void {
  const csv  = buildKPIOnlyCSV(kpi, period, preset)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-kpi-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportEvolutionCSV(
  chartPoints: ChartPoint[],
  period: { start: Date; end: Date },
): void {
  const lines: string[] = []
  lines.push(`Évolution des commandes : ${isoDate(period.start)} au ${isoDate(period.end)}`)
  lines.push('Date;Commandes cumulées')
  for (const pt of chartPoints) {
    lines.push([pt.date, pt.count].join(';'))
  }
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-evolution-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportRepartitionCSV(
  donutData: DonutSegment[],
  period: { start: Date; end: Date },
): void {
  const lines: string[] = []
  lines.push(`Répartition achats par univers : ${isoDate(period.start)} au ${isoDate(period.end)}`)
  lines.push('Univers;Part (%);Montant TTC (€)')
  for (const seg of donutData) {
    lines.push([cell(seg.label), seg.percent, fmtNum2(seg.montant)].join(';'))
  }
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-repartition-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportTopEditeursCSV(
  publishers: TopPublisher[],
  period: { start: Date; end: Date },
): void {
  const lines: string[] = []
  lines.push(`Top éditeurs : ${isoDate(period.start)} au ${isoDate(period.end)}`)
  lines.push('Rang;Éditeur;Part (%);Montant commandé (€)')
  publishers.forEach((p, i) => {
    lines.push([i + 1, cell(p.name), p.pct, fmtNum2(p.montant)].join(';'))
  })
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-top-editeurs-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportEDICSV(flux: {
  orders: number
  expeditions: number
  factures: number
  errors: number
}): void {
  const lines: string[] = []
  lines.push(`Suivi flux EDI : ${isoDate(new Date())}`)
  lines.push('Indicateur;Valeur')
  lines.push(['Commandes envoyées', flux.orders].join(';'))
  lines.push(['Expéditions en cours', flux.expeditions].join(';'))
  lines.push(['Factures reçues', flux.factures].join(';'))
  lines.push(['Erreurs à traiter', flux.errors].join(';'))
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-edi-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportActionsCSV(actions: { label: string; count: number; deadline?: string }[]): void {
  const lines: string[] = []
  lines.push(`Actions en attente : ${isoDate(new Date())}`)
  lines.push('Action;Quantité;Échéance')
  for (const a of actions) {
    lines.push([cell(a.label), a.count, a.deadline ?? ''].join(';'))
  }
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-actions-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportNouveautesCSV(books: Book[]): void {
  const lines: string[] = []
  lines.push(`Nouveautés du mois : ${isoDate(new Date())}`)
  lines.push('Titre;Auteur(s);ISBN;Éditeur;Univers;Prix TTC (€);Date de parution')
  for (const b of books) {
    lines.push([
      cell(b.title),
      cell(b.authors.join(', ')),
      b.isbn,
      cell(b.publisher),
      cell(b.universe),
      fmtNum2(b.priceTTC),
      b.publicationDate,
    ].join(';'))
  }
  const csv  = '﻿' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `bookflow-nouveautes-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
  a.download = `bookflow-dashboard-${isoDate(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportDashboardExcel(
  kpi: PeriodKPI,
  orders: DashboardOrder[],
  period: { start: Date; end: Date },
  preset: string,
  comparison?: ComparisonExport,
): void {
  const workbook = buildDashboardWorkbook(kpi, orders, period, preset, comparison)
  XLSX.writeFile(workbook, `bookflow-dashboard-${isoDate(new Date())}.xlsx`, {
    bookType: 'xlsx',
    compression: true,
  })
}
