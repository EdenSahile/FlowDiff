import type { Universe } from './mockBooks'
import { MOCK_BOOKS } from './mockBooks'
import type { Order, OrderStatus, TypeCommande } from './mockOrders'
import { formatPrice, roundCurrency } from '@/lib/format'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */

export interface DashboardOrder {
  id: string
  /** Identifiant logique de commande : plusieurs lignes peuvent la ventiler par éditeur. */
  orderId: string
  /** Numéro métier affiché au libraire, quand la commande en possède un. */
  orderNumber?: string
  date: string          // YYYY-MM-DD
  orderStatus?: OrderStatus
  invoiceNumber?: string
  invoiceDate?: string  // YYYY-MM-DD
  montantTTC: number
  nbExemplaires: number
  publisher: string
  universe: Universe
  cancelled: boolean
  deliveryDays: number
  references: string[]
  items: DashboardOrderItem[]
}

export interface DashboardOrderItem {
  isbn: string
  title: string
  author?: string
  publisher: string
  typeCommande?: TypeCommande
  quantity: number
  /** Prix public HT avant remise, lorsqu'il est connu. */
  unitPriceHT?: number
  /** Prix public TTC avant la remise appliquée à cette ligne. */
  unitPriceTTC: number
  /** Taux de remise appliqué au prix public, entre 0 et 1. */
  discountRate?: number
  /** Total net TTC de la ligne, après remise. */
  montantTTC: number
}

export interface DashboardOrderDetail {
  orderId: string
  date: string
  montantTTC: number
  nbExemplaires: number
  publishers: string[]
  universes: Universe[]
  cancelled: boolean
  deliveryDays: number
  references: string[]
  items: DashboardOrderItem[]
}

export interface PeriodKPI {
  nbCommandes: number
  nbActive: number
  nbCancelled: number
  montantTotal: number
  nbExemplaires: number
  panierMoyen: number
  delaiMoyen: number
  tauxAnnulation: number   // 0–1
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

const UNIVERSE_COLORS: Record<Universe, string> = {
  'BD/Mangas':       '#3B82F6',
  'Littérature':     '#22C55E',
  'Jeunesse':        '#EAB308',
  'Adulte-pratique': '#9CA3AF',
}

/** Taux de démonstration alignés sur les remises par thématique du compte. */
export const DASHBOARD_REMISE_RATES: Record<Universe, number> = {
  'BD/Mangas':       0.30,
  'Jeunesse':        0.30,
  'Littérature':     0.35,
  'Adulte-pratique': 0.35,
}

/* ─────────────────────────────────────────
   Historique de démonstration

   Les commandes sont volontairement peu nombreuses et de montants modestes :
   une commande passée pendant une démonstration fait ainsi évoluer visiblement
   chaque indicateur. Les dates sont relatives au jour d'ouverture, ce qui garde
   des données dans les périodes 7/30 jours, 3/6/12 mois et N-1.
───────────────────────────────────────── */

type DemoOrderSeed = Omit<DashboardOrder, 'id' | 'orderId' | 'date' | 'references' | 'items'> & {
  daysAgo: number
  discountRate?: number
}

const DEMO_ORDER_SEEDS: DemoOrderSeed[] = [
  // 7 derniers jours : comparaison immédiatement lisible.
  { daysAgo: 0,   montantTTC: 42.00, nbExemplaires: 3, publisher: 'Gallimard',          universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 3,   montantTTC: 31.50, nbExemplaires: 2, publisher: 'Dargaud',            universe: 'BD/Mangas',       cancelled: false, deliveryDays: 1 },
  { daysAgo: 6,   montantTTC: 18.90, nbExemplaires: 1, publisher: 'Bayard',             universe: 'Jeunesse',        cancelled: true,  deliveryDays: 0 },
  // 30 derniers jours.
  { daysAgo: 10,  montantTTC: 64.80, nbExemplaires: 5, publisher: 'Glénat',             universe: 'BD/Mangas',       cancelled: false, deliveryDays: 3 },
  { daysAgo: 17,  montantTTC: 27.30, nbExemplaires: 2, publisher: 'Larousse',           universe: 'Adulte-pratique', cancelled: false, deliveryDays: 2 },
  { daysAgo: 25,  montantTTC: 51.60, nbExemplaires: 4, publisher: 'Le Seuil',           universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 29,  montantTTC: 22.05, nbExemplaires: 1, publisher: 'Pika Édition',       universe: 'BD/Mangas',       cancelled: false, deliveryDays: 4, discountRate: 0.30 },
  // Période précédente et trois derniers mois.
  { daysAgo: 35,  montantTTC: 38.40, nbExemplaires: 3, publisher: 'Actes Sud',          universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 44,  montantTTC: 46.20, nbExemplaires: 4, publisher: 'Gallimard Jeunesse', universe: 'Jeunesse',        cancelled: false, deliveryDays: 3 },
  { daysAgo: 59,  montantTTC: 24.60, nbExemplaires: 2, publisher: 'La Martinière',      universe: 'Adulte-pratique', cancelled: true,  deliveryDays: 0 },
  { daysAgo: 66,  montantTTC: 57.75, nbExemplaires: 4, publisher: 'Kana',               universe: 'BD/Mangas',       cancelled: false, deliveryDays: 2 },
  { daysAgo: 78,  montantTTC: 33.60, nbExemplaires: 3, publisher: 'P.O.L',              universe: 'Littérature',     cancelled: false, deliveryDays: 1 },
  { daysAgo: 89,  montantTTC: 28.35, nbExemplaires: 2, publisher: 'Bayard',             universe: 'Jeunesse',        cancelled: false, deliveryDays: 3 },
  // Six puis douze mois.
  { daysAgo: 102, montantTTC: 61.20, nbExemplaires: 5, publisher: 'Glénat',             universe: 'BD/Mangas',       cancelled: false, deliveryDays: 2 },
  { daysAgo: 123, montantTTC: 44.10, nbExemplaires: 3, publisher: 'Actes Sud',          universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 150, montantTTC: 29.40, nbExemplaires: 2, publisher: 'Larousse',           universe: 'Adulte-pratique', cancelled: false, deliveryDays: 4 },
  { daysAgo: 176, montantTTC: 36.75, nbExemplaires: 3, publisher: 'Dargaud',            universe: 'BD/Mangas',       cancelled: false, deliveryDays: 2 },
  { daysAgo: 210, montantTTC: 52.50, nbExemplaires: 4, publisher: 'Gallimard',          universe: 'Littérature',     cancelled: false, deliveryDays: 3 },
  { daysAgo: 250, montantTTC: 31.20, nbExemplaires: 2, publisher: 'Gallimard Jeunesse', universe: 'Jeunesse',        cancelled: false, deliveryDays: 2 },
  { daysAgo: 300, montantTTC: 47.25, nbExemplaires: 4, publisher: 'La Martinière',      universe: 'Adulte-pratique', cancelled: false, deliveryDays: 3 },
  { daysAgo: 355, montantTTC: 39.90, nbExemplaires: 3, publisher: 'Le Seuil',           universe: 'Littérature',     cancelled: true,  deliveryDays: 0 },
  // Même profondeur historique pour le comparatif N-1.
  { daysAgo: 366, montantTTC: 35.70, nbExemplaires: 3, publisher: 'Gallimard',          universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 369, montantTTC: 28.35, nbExemplaires: 2, publisher: 'Dargaud',            universe: 'BD/Mangas',       cancelled: false, deliveryDays: 2 },
  { daysAgo: 372, montantTTC: 16.80, nbExemplaires: 1, publisher: 'Bayard',             universe: 'Jeunesse',        cancelled: true,  deliveryDays: 0 },
  { daysAgo: 380, montantTTC: 49.35, nbExemplaires: 4, publisher: 'Glénat',             universe: 'BD/Mangas',       cancelled: false, deliveryDays: 3 },
  { daysAgo: 395, montantTTC: 23.10, nbExemplaires: 2, publisher: 'Larousse',           universe: 'Adulte-pratique', cancelled: false, deliveryDays: 2 },
  { daysAgo: 420, montantTTC: 43.05, nbExemplaires: 3, publisher: 'Le Seuil',           universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 455, montantTTC: 34.65, nbExemplaires: 3, publisher: 'Actes Sud',          universe: 'Littérature',     cancelled: false, deliveryDays: 2 },
  { daysAgo: 500, montantTTC: 41.00, nbExemplaires: 3, publisher: 'Gallimard Jeunesse', universe: 'Jeunesse',        cancelled: false, deliveryDays: 3 },
  { daysAgo: 550, montantTTC: 21.00, nbExemplaires: 2, publisher: 'La Martinière',      universe: 'Adulte-pratique', cancelled: true,  deliveryDays: 0 },
  { daysAgo: 600, montantTTC: 49.35, nbExemplaires: 4, publisher: 'Kana',               universe: 'BD/Mangas',       cancelled: false, deliveryDays: 2 },
  { daysAgo: 650, montantTTC: 29.40, nbExemplaires: 2, publisher: 'P.O.L',              universe: 'Littérature',     cancelled: false, deliveryDays: 1 },
  { daysAgo: 700, montantTTC: 24.15, nbExemplaires: 2, publisher: 'Bayard',             universe: 'Jeunesse',        cancelled: false, deliveryDays: 3 },
]

function isoDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function ean13CheckDigit(base: string): string {
  const sum = [...base].reduce((total, digit, index) =>
    total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)
  return String((10 - (sum % 10)) % 10)
}

function demoISBN13(index: number, itemIndex: number): string {
  const base = `978${String(260000000 + index * 10 + itemIndex).padStart(9, '0')}`
  return `${base}${ean13CheckDigit(base)}`
}

function demoOrderType(daysAgo: number): TypeCommande {
  return daysAgo <= 30 ? 'Nouveauté' : 'Fonds'
}

const DEMO_TITLES: Record<Universe, string[]> = {
  'Littérature': ['Les heures silencieuses', 'Une saison sur le quai', 'La carte des absences'],
  'BD/Mangas': ['Les Chroniques du passage', 'Le Club des étoiles', 'Les Jardins d’acier'],
  'Jeunesse': ['Le Secret de la cabane bleue', 'La Brigade des lucioles', 'Le Voyage de Nino'],
  'Adulte-pratique': ['Cuisiner simplement chaque jour', 'Le Guide des petits espaces', 'Respirer au quotidien'],
}

function buildDemoItems(seed: DemoOrderSeed, index: number): DashboardOrderItem[] {
  const quantities = seed.nbExemplaires > 1
    ? [1, seed.nbExemplaires - 1]
    : [1]
  const titles = DEMO_TITLES[seed.universe]
  const totalCents = Math.round(seed.montantTTC * 100)
  const secondQuantity = quantities[1]
  const secondUnitCents = secondQuantity
    ? Math.round((totalCents * 0.45) / secondQuantity)
    : 0
  const amountsInCents = secondQuantity
    ? [totalCents - secondUnitCents * secondQuantity, secondUnitCents * secondQuantity]
    : [totalCents]

  return quantities.map((quantity, itemIndex) => {
    const montantTTC = amountsInCents[itemIndex] / 100
    const discountRate = seed.discountRate ?? DASHBOARD_REMISE_RATES[seed.universe]
    return {
      isbn: demoISBN13(index, itemIndex),
      title: titles[(index + itemIndex) % titles.length],
      author: '',
      publisher: seed.publisher,
      typeCommande: demoOrderType(seed.daysAgo),
      quantity,
      unitPriceTTC: discountRate > 0
        ? roundCurrency(montantTTC / quantity / (1 - discountRate))
        : montantTTC / quantity,
      unitPriceHT: discountRate > 0
        ? roundCurrency(montantTTC / quantity / (1 - discountRate) / 1.055)
        : roundCurrency(montantTTC / quantity / 1.055),
      discountRate: discountRate || undefined,
      montantTTC,
    }
  })
}

function generateOrders(): DashboardOrder[] {
  const today = new Date()
  return DEMO_ORDER_SEEDS.map((seed, index) => {
    const id = `demo-order-${index + 1}`
    const items = buildDemoItems(seed, index)
    return {
      id,
      orderId: id,
      orderNumber: `CMD-DÉMO-${String(index + 1).padStart(3, '0')}`,
      date: isoDate(addDays(today, -seed.daysAgo)),
      montantTTC: seed.montantTTC,
      nbExemplaires: seed.nbExemplaires,
      publisher: seed.publisher,
      universe: seed.universe,
      cancelled: seed.cancelled,
      deliveryDays: seed.deliveryDays,
      references: items.map(item => item.isbn),
      items,
    }
  })
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

export function summarizeDashboardOrders(orders: DashboardOrder[]): DashboardOrderDetail[] {
  const groups = new Map<string, DashboardOrder[]>()
  for (const order of orders) {
    const key = order.orderId || order.id
    groups.set(key, [...(groups.get(key) ?? []), order])
  }

  return [...groups.entries()]
    .map(([orderId, rows]) => ({
      orderId,
      date: rows[0].date,
      montantTTC: roundCurrency(rows.reduce((sum, row) => sum + row.montantTTC, 0)),
      nbExemplaires: rows.reduce((sum, row) => sum + row.nbExemplaires, 0),
      publishers: [...new Set(rows.map(row => row.publisher))],
      universes: [...new Set(rows.map(row => row.universe))],
      cancelled: rows[0].cancelled,
      deliveryDays: rows[0].deliveryDays,
      references: [...new Set(rows.flatMap(row => row.references))],
      items: rows.flatMap(row => row.items),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function computeKPIs(orders: DashboardOrder[]): PeriodKPI {
  const logicalOrders = summarizeDashboardOrders(orders)
  const active    = logicalOrders.filter(order => !order.cancelled)
  const cancelled = logicalOrders.filter(order =>  order.cancelled)

  const nbCommandes   = logicalOrders.length
  const montantTotal  = active.reduce((s, o) => s + o.montantTTC, 0)
  const nbExemplaires = active.reduce((s, o) => s + o.nbExemplaires, 0)
  const panierMoyen   = active.length > 0 ? montantTotal / active.length : 0
  const delaiMoyen    = active.length > 0
    ? active.reduce((s, order) => s + order.deliveryDays, 0) / active.length
    : 0
  const tauxAnnulation = nbCommandes > 0 ? cancelled.length / nbCommandes : 0
  const allRefs       = new Set(active.flatMap(order => order.references))
  const nbReferences  = allRefs.size

  return {
    nbCommandes,
    nbActive:      active.length,
    nbCancelled:   cancelled.length,
    montantTotal:  roundCurrency(montantTotal),
    nbExemplaires,
    panierMoyen:   roundCurrency(panierMoyen),
    delaiMoyen:    Math.round(delaiMoyen * 10)   / 10,
    tauxAnnulation: Math.round(tauxAnnulation * 1000) / 1000,
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
  const map = new Map<string, Set<string>>()

  let day = new Date(startDate)
  while (day <= endDate) {
    map.set(isoDate(day), new Set())
    day = addDays(day, 1)
  }

  for (const o of active) {
    if (map.has(o.date)) {
      map.get(o.date)?.add(o.orderId || o.id)
    }
  }

  return [...map.entries()].map(([date, orderIds]) => ({ date, count: orderIds.size }))
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

export function orderToDashboardOrders(
  order: Order,
  remiseRates: Record<string, number> = DASHBOARD_REMISE_RATES,
): DashboardOrder[] {
  const groups = new Map<string, Order['items']>()
  for (const item of order.items) {
    const key = `${item.publisher}||${item.universe}`
    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  const entries = [...groups.entries()]

  return entries.map(([key, items], i) => {
    const [publisher, universe] = key.split('||')
    const dashboardItems = items.map(item => {
      const unitPriceTTC = itemPriceTTC(item)
      const discountRate = remiseRates[item.universe] ?? DASHBOARD_REMISE_RATES[universe as Universe]
      const itemMontantTTC = roundCurrency(unitPriceTTC * item.quantity * (1 - discountRate))
      return {
        isbn: item.isbn,
        title: item.title,
        author: item.author,
        publisher: item.publisher,
        typeCommande: item.typeCommande,
        quantity: item.quantity,
        unitPriceHT: item.unitPriceHT,
        unitPriceTTC,
        discountRate,
        montantTTC: itemMontantTTC,
      }
    })
    const montantTTC = roundCurrency(dashboardItems.reduce((sum, item) => sum + item.montantTTC, 0))
    return {
      id:            `${order.id}-grp${i}`,
      orderId:       order.id,
      orderNumber:   order.numero,
      date:          order.date,
      orderStatus:   order.status,
      invoiceNumber: order.numFacture,
      invoiceDate:   order.dateFacturation,
      montantTTC,
      nbExemplaires: items.reduce((s, it) => s + it.quantity, 0),
      publisher,
      universe:      universe as Universe,
      cancelled:     false,
      deliveryDays:  2,
      references:    items.map(it => it.isbn),
      items:         dashboardItems,
    }
  })
}

/* ─────────────────────────────────────────
   Utilitaire de formatage monétaire
───────────────────────────────────────── */

export function fmtEur(v: number): string {
  if (v >= 1000) {
    return `${(Math.round((v / 100 + Number.EPSILON)) / 10).toFixed(1).replace('.', ',')} k€`
  }
  return `${formatPrice(v)} €`
}
