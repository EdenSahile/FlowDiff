import { describe, expect, it } from 'vitest'
import {
  computeChartData,
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

  it('conserve une seule commande logique lorsqu’une commande réelle est ventilée', () => {
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
