import { describe, expect, it } from 'vitest'
import {
  computeChartData,
  computeDonutData,
  computeKPIs,
  filterDataByPeriod,
  MOCK_DASHBOARD_ORDERS,
  orderToDashboardOrders,
  summarizeDashboardOrders,
  type DashboardOrder,
} from '@/data/mockDashboard'
import type { Order } from '@/data/mockOrders'

function dashboardOrder(overrides: Partial<DashboardOrder>): DashboardOrder {
  return {
    id: 'line-1',
    orderId: 'order-1',
    date: '2026-10-21',
    montantTTC: 40,
    nbExemplaires: 2,
    publisher: 'Gallimard',
    universe: 'Littérature',
    cancelled: false,
    deliveryDays: 2,
    references: ['9780000000001'],
    items: [{ isbn: '9780000000001', title: 'Titre de test', publisher: 'Gallimard', quantity: 2, unitPriceTTC: 20, montantTTC: 40 }],
    ...overrides,
  }
}

describe('données de tableau de bord', () => {
  it('fournit des commandes de démonstration dans les périodes courtes et comparées', () => {
    const end = new Date()
    const sevenDaysAgo = new Date(end)
    sevenDaysAgo.setDate(end.getDate() - 6)
    const yearAgo = new Date(end)
    yearAgo.setFullYear(end.getFullYear() - 1)
    const yearAgoSevenDays = new Date(yearAgo)
    yearAgoSevenDays.setDate(yearAgo.getDate() - 6)

    expect(filterDataByPeriod(MOCK_DASHBOARD_ORDERS, sevenDaysAgo, end)).not.toHaveLength(0)
    expect(filterDataByPeriod(MOCK_DASHBOARD_ORDERS, yearAgoSevenDays, yearAgo)).not.toHaveLength(0)
  })

  it('inclut un exemple de titre remisé sans modifier le total net de démonstration', () => {
    const pikaOrder = MOCK_DASHBOARD_ORDERS.find(order => order.publisher === 'Pika Édition')

    expect(pikaOrder?.montantTTC).toBe(22.05)
    expect(pikaOrder?.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        unitPriceTTC: 31.50,
        discountRate: 0.30,
        montantTTC: 22.05,
      }),
    ]))
  })

  it('conserve les dates locales de début et de fin dans la courbe', () => {
    const points = computeChartData([
      dashboardOrder({ id: 'first-day', orderId: 'first-day', date: '2026-10-15' }),
      dashboardOrder({ id: 'last-day', orderId: 'last-day', date: '2026-10-21' }),
    ], new Date(2026, 9, 15), new Date(2026, 9, 21, 23, 59, 59, 999))

    expect(points[0]).toEqual({ date: '2026-10-15', count: 1 })
    expect(points.at(-1)).toEqual({ date: '2026-10-21', count: 1 })
    expect(points).toHaveLength(7)
  })

  it('compte une commande ventilée sur plusieurs éditeurs une seule fois dans les KPI et la courbe', () => {
    const orders = [
      dashboardOrder({ id: 'line-1', publisher: 'Gallimard', montantTTC: 40, nbExemplaires: 2 }),
      dashboardOrder({ id: 'line-2', publisher: 'Dargaud', universe: 'BD/Mangas', montantTTC: 20, nbExemplaires: 1, references: ['9780000000002'] }),
    ]

    expect(computeKPIs(orders)).toMatchObject({
      nbCommandes: 1,
      nbActive: 1,
      montantTotal: 60,
      nbExemplaires: 3,
      panierMoyen: 60,
      delaiMoyen: 2,
      tauxAnnulation: 0,
      nbReferences: 2,
    })
    expect(computeChartData(orders, new Date('2026-10-21'), new Date('2026-10-21'))).toEqual([
      { date: '2026-10-21', count: 1 },
    ])
    expect(summarizeDashboardOrders(orders)).toEqual([
      expect.objectContaining({
        orderId: 'order-1',
        montantTTC: 60,
        nbExemplaires: 3,
        publishers: ['Gallimard', 'Dargaud'],
        universes: ['Littérature', 'BD/Mangas'],
      }),
    ])
  })

  it("conserve une seule commande logique lorsqu’une commande réelle est ventilée", () => {
    const order: Order = {
      id: 'ord-user-1',
      numero: 'CMD0000015',
      date: '2026-10-21',
      status: 'en préparation',
      codeClient: 'LIB001',
      adresseLivraison: '12 rue du Parc, 75001 Paris',
      deliveryMode: 'standard',
      subtotalHT: 56.87,
      remiseAmount: 0,
      netHT: 56.87,
      tva: 3.13,
      totalTTC: 60,
      items: [
        { bookId: 'a', title: 'Titre A', author: 'A', publisher: 'Gallimard', isbn: '9780000000001', quantity: 2, unitPriceHT: 18.96, unitPriceTTC: 20, universe: 'Littérature' },
        { bookId: 'b', title: 'Titre B', author: 'B', publisher: 'Dargaud', isbn: '9780000000002', quantity: 1, unitPriceHT: 18.96, unitPriceTTC: 20, universe: 'BD/Mangas' },
      ],
    }

    const rows = orderToDashboardOrders(order)
    expect(rows).toHaveLength(2)
    expect(rows.every(row => row.orderId === order.id)).toBe(true)
    expect(rows.flatMap(row => row.items)).toEqual(expect.arrayContaining([
      expect.objectContaining({ isbn: '9780000000001', title: 'Titre A', publisher: 'Gallimard', quantity: 2, unitPriceTTC: 20, montantTTC: 40 }),
      expect.objectContaining({ isbn: '9780000000002', title: 'Titre B', publisher: 'Dargaud', quantity: 1, unitPriceTTC: 20, montantTTC: 20 }),
    ]))
    expect(computeKPIs(rows)).toMatchObject({ nbCommandes: 1, montantTotal: 60, nbExemplaires: 3 })
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-110 : computeKPIs exclut les commandes
   annulées des indicateurs actifs
─────────────────────────────────────────────────── */

describe('FLOW-RM-110 : computeKPIs exclut les commandes annulées', () => {
  it('exclut les annulées du montant total et des exemplaires', () => {
    const orders = [
      dashboardOrder({ id: 'a1', orderId: 'a1', montantTTC: 50, nbExemplaires: 3, cancelled: false }),
      dashboardOrder({ id: 'c1', orderId: 'c1', montantTTC: 30, nbExemplaires: 2, cancelled: true }),
    ]

    const kpis = computeKPIs(orders)

    expect(kpis.montantTotal).toBe(50)
    expect(kpis.nbExemplaires).toBe(3)
    expect(kpis.nbActive).toBe(1)
    expect(kpis.nbCancelled).toBe(1)
    expect(kpis.nbCommandes).toBe(2)
  })

  it('calcule le taux d\'annulation sur l\'ensemble des commandes', () => {
    const orders = [
      dashboardOrder({ id: 'a1', orderId: 'a1', cancelled: false }),
      dashboardOrder({ id: 'a2', orderId: 'a2', cancelled: false }),
      dashboardOrder({ id: 'c1', orderId: 'c1', cancelled: true }),
    ]

    const kpis = computeKPIs(orders)

    expect(kpis.tauxAnnulation).toBeCloseTo(1 / 3, 3)
  })

  it('calcule panier moyen et délai moyen sur les actives uniquement', () => {
    const orders = [
      dashboardOrder({ id: 'a1', orderId: 'a1', montantTTC: 60, cancelled: false, deliveryDays: 3 }),
      dashboardOrder({ id: 'a2', orderId: 'a2', montantTTC: 40, cancelled: false, deliveryDays: 1 }),
      dashboardOrder({ id: 'c1', orderId: 'c1', montantTTC: 100, cancelled: true, deliveryDays: 0 }),
    ]

    const kpis = computeKPIs(orders)

    expect(kpis.panierMoyen).toBe(50)
    expect(kpis.delaiMoyen).toBe(2)
  })

  it('compte les références des commandes actives uniquement', () => {
    const orders = [
      dashboardOrder({ id: 'a1', orderId: 'a1', cancelled: false, references: ['REF-A', 'REF-B'] }),
      dashboardOrder({ id: 'c1', orderId: 'c1', cancelled: true, references: ['REF-C'] }),
    ]

    const kpis = computeKPIs(orders)

    expect(kpis.nbReferences).toBe(2)
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-111 : computeDonutData avec la méthode
   des plus grands restes
─────────────────────────────────────────────────── */

describe('FLOW-RM-111 : computeDonutData (plus grands restes)', () => {
  it('les pourcentages entiers somment à exactement 100', () => {
    const orders = [
      dashboardOrder({ id: '1', orderId: '1', universe: 'BD/Mangas', montantTTC: 33 }),
      dashboardOrder({ id: '2', orderId: '2', universe: 'Littérature', montantTTC: 33 }),
      dashboardOrder({ id: '3', orderId: '3', universe: 'Jeunesse', montantTTC: 34 }),
    ]

    const donut = computeDonutData(orders)
    const totalPct = donut.reduce((s, seg) => s + seg.percent, 0)

    expect(totalPct).toBe(100)
    donut.forEach(seg => expect(Number.isInteger(seg.percent)).toBe(true))
  })

  it('attribue les points restants aux segments avec la plus grande partie fractionnaire', () => {
    const orders = [
      dashboardOrder({ id: '1', orderId: '1', universe: 'BD/Mangas', montantTTC: 100 }),
      dashboardOrder({ id: '2', orderId: '2', universe: 'Littérature', montantTTC: 100 }),
      dashboardOrder({ id: '3', orderId: '3', universe: 'Jeunesse', montantTTC: 100 }),
    ]

    const donut = computeDonutData(orders)
    const totalPct = donut.reduce((s, seg) => s + seg.percent, 0)

    expect(totalPct).toBe(100)
    const percentages = donut.filter(s => s.percent > 0).map(s => s.percent).sort()
    expect(percentages).toEqual([33, 33, 34])
  })

  it('renvoie 0 % pour chaque univers quand il n\'y a aucune commande active', () => {
    const orders = [
      dashboardOrder({ id: '1', orderId: '1', cancelled: true }),
    ]

    const donut = computeDonutData(orders)

    expect(donut).toHaveLength(4)
    donut.forEach(seg => {
      expect(seg.percent).toBe(0)
      expect(seg.montant).toBe(0)
    })
  })

  it('donne 100 % à un seul univers quand toutes les commandes y appartiennent', () => {
    const orders = [
      dashboardOrder({ id: '1', orderId: '1', universe: 'Littérature', montantTTC: 50 }),
      dashboardOrder({ id: '2', orderId: '2', universe: 'Littérature', montantTTC: 30 }),
    ]

    const donut = computeDonutData(orders)
    const litterature = donut.find(s => s.label === 'Littérature')

    expect(litterature?.percent).toBe(100)
    donut.filter(s => s.label !== 'Littérature').forEach(seg => {
      expect(seg.percent).toBe(0)
    })
  })

  it('affecte la bonne couleur à chaque univers', () => {
    const orders = [
      dashboardOrder({ id: '1', orderId: '1', universe: 'BD/Mangas', montantTTC: 25 }),
      dashboardOrder({ id: '2', orderId: '2', universe: 'Littérature', montantTTC: 25 }),
      dashboardOrder({ id: '3', orderId: '3', universe: 'Jeunesse', montantTTC: 25 }),
      dashboardOrder({ id: '4', orderId: '4', universe: 'Adulte-pratique', montantTTC: 25 }),
    ]

    const donut = computeDonutData(orders)

    expect(donut.find(s => s.label === 'BD/Mangas')?.color).toBe('#3B82F6')
    expect(donut.find(s => s.label === 'Littérature')?.color).toBe('#22C55E')
    expect(donut.find(s => s.label === 'Jeunesse')?.color).toBe('#EAB308')
    expect(donut.find(s => s.label === 'Adulte-pratique')?.color).toBe('#9CA3AF')
  })
})
