import type { Universe } from './mockBooks'
import { MOCK_BOOKS } from './mockBooks'
import type { Order } from './mockOrders'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */

export interface DashboardOrder {
  id: string
  date: string          // YYYY-MM-DD
  montantTTC: number
  nbExemplaires: number
  publisher: string
  universe: Universe
  cancelled: boolean
  deliveryDays: number
  references: string[]
}

export interface PeriodKPI {
  nbCommandes: number
  nbActive: number
  nbCancelled: number
  montantTotal: number
  nbExemplaires: number
  panierMoyen: number
  delaiMoyen: number
  tauxRupture: number   // 0–1
  nbReferences: number
}

export interface TopPublisher {
  name: string
  montant: number
  pct: number
}

export interface ChartPoint {
  date: string          // YYYY-MM-DD
  count: number
}

export interface DonutSegment {
  label: string
  color: string
  percent: number
  montant: number
}

/* ─────────────────────────────────────────
   Données de référence
───────────────────────────────────────── */

const PUBLISHERS: { name: string; universe: Universe }[] = [
  { name: 'Gallimard',         universe: 'Littérature'     },
  { name: 'Actes Sud',         universe: 'Littérature'     },
  { name: 'Le Seuil',          universe: 'Littérature'     },
  { name: 'P.O.L',             universe: 'Littérature'     },
  { name: 'Pika Édition',      universe: 'BD/Mangas'       },
  { name: 'Glénat',            universe: 'BD/Mangas'       },
  { name: 'Dargaud',           universe: 'BD/Mangas'       },
  { name: 'Kana',              universe: 'BD/Mangas'       },
  { name: 'Gallimard Jeunesse',universe: 'Jeunesse'        },
  { name: 'Bayard',            universe: 'Jeunesse'        },
  { name: 'La Martinière',     universe: 'Adulte-pratique' },
  { name: 'Larousse',          universe: 'Adulte-pratique' },
]

const UNIVERSE_COLORS: Record<Universe, string> = {
  'BD/Mangas':       '#3B82F6',
  'Littérature':     '#22C55E',
  'Jeunesse':        '#EAB308',
  'Adulte-pratique': '#9CA3AF',
}

/* ─────────────────────────────────────────
   Générateur déterministe
   Produit ~320 commandes sur 2024-01-01 → aujourd'hui
───────────────────────────────────────── */

function lcg(seed: number): () => number {
  let s = seed
  return () => {
    s = (1664525 * s + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function generateOrders(): DashboardOrder[] {
  const rand = lcg(42)
  const orders: DashboardOrder[] = []
  const start = new Date('2024-01-01')
  const end   = new Date('2026-04-28')

  let day = new Date(start)
  let idx = 0

  while (day <= end) {
    // 0–3 commandes par jour (poids ~1.2/jour en moyenne)
    const dailyCount = rand() < 0.35 ? 0 : rand() < 0.55 ? 1 : rand() < 0.8 ? 2 : 3

    for (let i = 0; i < dailyCount; i++) {
      const pubIdx   = Math.floor(rand() * PUBLISHERS.length)
      const pub      = PUBLISHERS[pubIdx]
      const qty      = 5 + Math.floor(rand() * 30)           // 5–34 exemplaires
      const unitHT   = 8 + rand() * 22                       // 8–30 € HT/ex
      const montant  = Math.round(qty * unitHT * 1.055 * 100) / 100  // TTC (TVA 5,5%)
      const cancelled = rand() < 0.062                        // ~6 % annulées
      const delivDays = cancelled ? 0 : 1 + Math.floor(rand() * 5)

      // 3–6 références distinctes
      const nbRef = 3 + Math.floor(rand() * 4)
      const refs  = Array.from({ length: nbRef }, (_, r) =>
        `978${String(Math.floor(rand() * 1e10)).padStart(10, '0').slice(0, 10)}_${idx}_${r}`
      )

      orders.push({
        id: `ord-${idx++}`,
        date: isoDate(day),
        montantTTC: montant,
        nbExemplaires: qty,
        publisher: pub.name,
        universe: pub.universe,
        cancelled,
        deliveryDays: delivDays,
        references: refs,
      })
    }

    day = addDays(day, 1)
  }

  return orders
}

export const MOCK_DASHBOARD_ORDERS: DashboardOrder[] = generateOrders()

/* ─────────────────────────────────────────
   Helpers de filtrage et calcul
───────────────────────────────────────── */

export function filterDataByPeriod(
  data: DashboardOrder[],
  startDate: Date,
  endDate: Date,
): DashboardOrder[] {
  const s = startDate.getTime()
  const e = endDate.getTime()
  return data.filter(o => {
    const t = new Date(o.date).getTime()
    return t >= s && t <= e
  })
}

export function computeKPIs(orders: DashboardOrder[]): PeriodKPI {
  const active    = orders.filter(o => !o.cancelled)
  const cancelled = orders.filter(o =>  o.cancelled)

  const nbCommandes   = orders.length
  const montantTotal  = active.reduce((s, o) => s + o.montantTTC, 0)
  const nbExemplaires = active.reduce((s, o) => s + o.nbExemplaires, 0)
  const panierMoyen   = active.length > 0 ? montantTotal / active.length : 0
  const delaiMoyen    = active.length > 0
    ? active.reduce((s, o) => s + o.deliveryDays, 0) / active.length
    : 0
  const tauxRupture   = nbCommandes > 0 ? cancelled.length / nbCommandes : 0
  const allRefs       = new Set(active.flatMap(o => o.references))
  const nbReferences  = allRefs.size

  return {
    nbCommandes,
    nbActive:      active.length,
    nbCancelled:   cancelled.length,
    montantTotal:  Math.round(montantTotal * 100) / 100,
    nbExemplaires,
    panierMoyen:   Math.round(panierMoyen * 100) / 100,
    delaiMoyen:    Math.round(delaiMoyen * 10)   / 10,
    tauxRupture:   Math.round(tauxRupture * 1000) / 1000,
    nbReferences,
  }
}

export function computeTopPublishers(orders: DashboardOrder[]): TopPublisher[] {
  const active = orders.filter(o => !o.cancelled)
  const map = new Map<string, number>()
  for (const o of active) {
    map.set(o.publisher, (map.get(o.publisher) ?? 0) + o.montantTTC)
  }
  const total = active.reduce((s, o) => s + o.montantTTC, 0)
  const sorted = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return sorted.map(([name, montant]) => ({
    name,
    montant: Math.round(montant * 100) / 100,
    pct: total > 0 ? Math.round((montant / total) * 100) : 0,
  }))
}

export function computeChartData(
  orders: DashboardOrder[],
  startDate: Date,
  endDate: Date,
): ChartPoint[] {
  const active = orders.filter(o => !o.cancelled)
  const map = new Map<string, number>()

  let day = new Date(startDate)
  while (day <= endDate) {
    map.set(isoDate(day), 0)
    day = addDays(day, 1)
  }

  for (const o of active) {
    if (map.has(o.date)) {
      map.set(o.date, (map.get(o.date) ?? 0) + 1)
    }
  }

  return [...map.entries()].map(([date, count]) => ({ date, count }))
}

export function computeDonutData(orders: DashboardOrder[]): DonutSegment[] {
  const active = orders.filter(o => !o.cancelled)
  const total  = active.reduce((s, o) => s + o.montantTTC, 0)

  const universes: Universe[] = ['BD/Mangas', 'Littérature', 'Jeunesse', 'Adulte-pratique']

  if (total === 0) {
    return universes.map(univ => ({
      label: univ, color: UNIVERSE_COLORS[univ], percent: 0, montant: 0,
    }))
  }

  const rows = universes.map(univ => {
    const montant  = active.filter(o => o.universe === univ).reduce((s, o) => s + o.montantTTC, 0)
    const exactPct = (montant / total) * 100
    return { univ, montant, exactPct, floor: Math.floor(exactPct), remainder: exactPct % 1 }
  })

  // largest remainder: distribute leftover points to segments with biggest fractional part
  const leftover = 100 - rows.reduce((s, r) => s + r.floor, 0)
  const winners  = new Set(
    [...rows].sort((a, b) => b.remainder - a.remainder).slice(0, leftover).map(r => r.univ)
  )

  return rows.map(r => ({
    label:   r.univ,
    color:   UNIVERSE_COLORS[r.univ],
    percent: r.floor + (winners.has(r.univ) ? 1 : 0),
    montant: Math.round(r.montant * 100) / 100,
  }))
}

/* ─────────────────────────────────────────
   Conversion Order → DashboardOrder(s)
───────────────────────────────────────── */

function itemPriceTTC(item: Order['items'][number]): number {
  if (item.unitPriceTTC !== undefined) return item.unitPriceTTC
  return MOCK_BOOKS.find(b => b.id === item.bookId)?.priceTTC ?? item.unitPriceHT * 1.055
}

export function orderToDashboardOrders(order: Order): DashboardOrder[] {
  const groups = new Map<string, Order['items']>()
  for (const item of order.items) {
    const key = `${item.publisher}||${item.universe}`
    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  const orderGrossTTC = order.items.reduce((s, it) => s + itemPriceTTC(it) * it.quantity, 0)

  return [...groups.entries()].map(([key, items], i) => {
    const [publisher, universe] = key.split('||')
    const groupGrossTTC = items.reduce((s, it) => s + itemPriceTTC(it) * it.quantity, 0)
    const montantTTC = orderGrossTTC > 0
      ? Math.round((groupGrossTTC / orderGrossTTC) * order.totalTTC * 100) / 100
      : 0
    return {
      id:            `${order.id}-grp${i}`,
      date:          order.date,
      montantTTC,
      nbExemplaires: items.reduce((s, it) => s + it.quantity, 0),
      publisher,
      universe:      universe as Universe,
      cancelled:     false,
      deliveryDays:  2,
      references:    items.map(it => it.isbn),
    }
  })
}

/* ─────────────────────────────────────────
   Utilitaire de formatage monétaire
───────────────────────────────────────── */

export function fmtEur(v: number): string {
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1).replace('.', ',')} k€`
  }
  return `${v.toFixed(2).replace('.', ',')} €`
}
