import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { buildNotifications, NotificationsProvider, useNotifications } from '../NotificationsContext'
import * as mockBooks from '@/data/mockBooks'
import type { Book } from '@/data/mockBooks'

// Mock CartContext : useCart renvoie totalItems configurable
let mockTotalItems = 0
vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({ totalItems: mockTotalItems }),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}))

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'test-1',
    isbn: '9780000000001',
    title: 'Livre test',
    authors: ['Auteur'],
    publisher: 'Éditeur',
    publicationDate: new Date().toISOString().slice(0, 10),
    price: 10,
    type: 'nouveaute',
    universe: 'Littérature',
    description: '',
    pages: 100,
    isOrderable: true,
    ...overrides,
  } as Book
}

// FLOW-RM-103 : 3 types de notifications (panier, nouveautes, topventes)
describe('FLOW-RM-103 : 3 types de notifications', () => {
  beforeEach(() => {
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([
      makeBook({ type: 'nouveaute', publicationDate: new Date().toISOString().slice(0, 10) }),
    ])
  })
  afterEach(() => vi.restoreAllMocks())

  it('buildNotifications avec panier non vide produit panier, nouveautes et topventes', () => {
    const notifs = buildNotifications(2)

    const ids = notifs.map(n => n.id)
    expect(ids).toContain('panier')
    expect(ids).toContain('nouveautes')
    expect(ids).toContain('topventes')
  })
})

// FLOW-RM-104 : notification panier si panier non vide
describe('FLOW-RM-104 : notification panier conditionnée au contenu du panier', () => {
  beforeEach(() => {
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([])
  })
  afterEach(() => vi.restoreAllMocks())

  it('pas de notification panier quand totalItems vaut 0', () => {
    const notifs = buildNotifications(0)

    expect(notifs.find(n => n.id === 'panier')).toBeUndefined()
  })

  it('notification panier présente quand totalItems > 0', () => {
    const notifs = buildNotifications(5)

    const panier = notifs.find(n => n.id === 'panier')
    expect(panier).toBeDefined()
    expect(panier!.subtitle).toContain('5 articles')
  })
})

// FLOW-RM-105 : notification nouveautés basée sur livres < 60 jours
describe('FLOW-RM-105 : notification nouveautés selon la date de publication', () => {
  afterEach(() => vi.restoreAllMocks())

  it('notification nouveautés présente si un livre nouveauté est publié il y a moins de 60 jours', () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([
      makeBook({ type: 'nouveaute', publicationDate: recentDate }),
    ])

    const notifs = buildNotifications(0)

    expect(notifs.find(n => n.id === 'nouveautes')).toBeDefined()
  })

  it('pas de notification nouveautés si tous les livres nouveauté ont plus de 60 jours', () => {
    const oldDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([
      makeBook({ type: 'nouveaute', publicationDate: oldDate }),
    ])

    const notifs = buildNotifications(0)

    expect(notifs.find(n => n.id === 'nouveautes')).toBeUndefined()
  })

  it('les livres de type fonds ne déclenchent pas la notification nouveautés', () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([
      makeBook({ type: 'fonds', publicationDate: recentDate }),
    ])

    const notifs = buildNotifications(0)

    expect(notifs.find(n => n.id === 'nouveautes')).toBeUndefined()
  })
})

// FLOW-RM-106 : état « lu » non persisté (mémoire uniquement)
describe('FLOW-RM-106 : état lu en mémoire uniquement', () => {
  beforeEach(() => {
    mockTotalItems = 0
    vi.spyOn(mockBooks, 'getCatalogueBooks').mockReturnValue([
      makeBook({ type: 'nouveaute', publicationDate: new Date().toISOString().slice(0, 10) }),
    ])
  })
  afterEach(() => vi.restoreAllMocks())

  function TestConsumer({ onValue }: { onValue: (v: { unreadCount: number; markAllAsRead: () => void }) => void }) {
    const ctx = useNotifications()
    onValue(ctx)
    return null
  }

  it('marquer comme lu puis remonter le provider remet les notifications à non lu', () => {
    let captured: { unreadCount: number; markAllAsRead: () => void } = null!

    const { unmount } = render(
      <NotificationsProvider>
        <TestConsumer onValue={v => { captured = v }} />
      </NotificationsProvider>
    )

    expect(captured.unreadCount).toBeGreaterThan(0)

    act(() => captured.markAllAsRead())
    expect(captured.unreadCount).toBe(0)

    unmount()

    render(
      <NotificationsProvider>
        <TestConsumer onValue={v => { captured = v }} />
      </NotificationsProvider>
    )

    expect(captured.unreadCount).toBeGreaterThan(0)
  })
})
