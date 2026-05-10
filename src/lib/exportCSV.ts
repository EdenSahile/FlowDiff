import type { PeriodKPI, DashboardOrder, ChartPoint, DonutSegment, TopPublisher } from '@/data/mockDashboard'
import type { Book } from '@/data/mockBooks'

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
  lines.push('Période;Du;Au;Commandes passées;Montant total TTC (€);Exemplaires commandés;Panier moyen (€);Délai moyen (j);Taux de rupture (%);Références distinctes commandées')
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

export function buildKPIOnlyCSV(
  kpi: PeriodKPI,
  period: { start: Date; end: Date },
  preset: string,
): string {
  const lines: string[] = []
  lines.push('=== Résumé KPIs ===')
  lines.push('Période;Du;Au;Commandes passées;Montant total TTC (€);Exemplaires commandés;Panier moyen (€);Délai moyen (j);Taux de rupture (%);Références distinctes commandées')
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
  lines.push(`Évolution des commandes — ${isoDate(period.start)} au ${isoDate(period.end)}`)
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
  lines.push(`Répartition achats par univers — ${isoDate(period.start)} au ${isoDate(period.end)}`)
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
  lines.push(`Top éditeurs — ${isoDate(period.start)} au ${isoDate(period.end)}`)
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
  lines.push(`Suivi flux EDI — ${isoDate(new Date())}`)
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
  lines.push(`Actions en attente — ${isoDate(new Date())}`)
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
  lines.push(`Nouveautés du mois — ${isoDate(new Date())}`)
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
