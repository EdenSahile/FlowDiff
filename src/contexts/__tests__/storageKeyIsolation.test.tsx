import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

import { useAuthContext } from '@/contexts/AuthContext'
import { CartProvider, useCart } from '@/contexts/CartContext'
import { WishlistProvider, useWishlist } from '@/contexts/WishlistContext'
import { RdvProvider, useRdv } from '@/contexts/RdvContext'
import { OrdersProvider, useOrders } from '@/contexts/OrdersContext'

const mockAuth = vi.mocked(useAuthContext)

function authUser(codeClient: string) {
  return {
    user: {
      id: `u-${codeClient}`,
      codeClient,
      nomLibrairie: 'Librairie Test',
      email: 'test@test.fr',
      adresseLivraison: '1 rue test',
      remise: 30,
      telephone: '0102030405',
      remisesParUnivers: {},
      reliquatAccepte: false,
    },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }
}

function authGuest() {
  return {
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }
}

describe('FLOW-RM-020 : isolation par codeClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('CartContext (bookflow_cart_*)', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <CartProvider>{children}</CartProvider>
    }

    it('charge le panier depuis bookflow_cart_{codeClient}', () => {
      localStorage.setItem('bookflow_cart_LIB001', JSON.stringify({
        items: [{ book: { id: 'b1' }, quantity: 2 }], opGroups: [],
      }))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].book.id).toBe('b1')
    })

    it('utilise le suffixe guest quand aucun user n\'est connecté', () => {
      localStorage.setItem('bookflow_cart_guest', JSON.stringify({
        items: [{ book: { id: 'guest-book' }, quantity: 1 }], opGroups: [],
      }))

      mockAuth.mockReturnValue(authGuest())

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].book.id).toBe('guest-book')
    })

    it('isole les données entre deux codeClients', () => {
      localStorage.setItem('bookflow_cart_LIB001', JSON.stringify({
        items: [{ book: { id: 'book-001' }, quantity: 1 }], opGroups: [],
      }))
      localStorage.setItem('bookflow_cart_LIB002', JSON.stringify({
        items: [{ book: { id: 'book-002' }, quantity: 5 }], opGroups: [],
      }))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].book.id).toBe('book-001')
    })
  })

  describe('WishlistContext (bookflow_wishlists_*)', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <WishlistProvider>{children}</WishlistProvider>
    }

    it('charge les listes depuis bookflow_wishlists_{codeClient}', () => {
      localStorage.setItem('bookflow_wishlists_LIB001', JSON.stringify([
        { id: 'wl1', name: 'Ma liste', items: [], createdAt: '2026-01-01T00:00:00Z' },
      ]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

      expect(result.current.lists).toHaveLength(1)
      expect(result.current.lists[0].name).toBe('Ma liste')
    })

    it('utilise le suffixe guest quand aucun user n\'est connecté', () => {
      localStorage.setItem('bookflow_wishlists_guest', JSON.stringify([
        { id: 'wl-guest', name: 'Liste invité', items: [], createdAt: '2026-01-01T00:00:00Z' },
      ]))

      mockAuth.mockReturnValue(authGuest())

      const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

      expect(result.current.lists).toHaveLength(1)
      expect(result.current.lists[0].name).toBe('Liste invité')
    })

    it('isole les données entre deux codeClients', () => {
      localStorage.setItem('bookflow_wishlists_LIB001', JSON.stringify([
        { id: 'wl1', name: 'Liste LIB001', items: [], createdAt: '2026-01-01T00:00:00Z' },
      ]))
      localStorage.setItem('bookflow_wishlists_LIB002', JSON.stringify([
        { id: 'wl2', name: 'Liste LIB002', items: [], createdAt: '2026-01-01T00:00:00Z' },
      ]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

      expect(result.current.lists).toHaveLength(1)
      expect(result.current.lists[0].name).toBe('Liste LIB001')
    })

    it('conserve un titre ajouté à une liste après recréation du contexte', () => {
      mockAuth.mockReturnValue(authUser('LIB001'))
      const first = renderHook(() => useWishlist(), { wrapper: Wrapper })

      let listId = ''
      act(() => {
        listId = first.result.current.createList('Coups de cœur').id
      })
      act(() => {
        first.result.current.addToList(listId, { id: 'book-persisted' } as never)
      })
      first.unmount()

      const second = renderHook(() => useWishlist(), { wrapper: Wrapper })

      expect(second.result.current.getListsContaining('book-persisted')).toHaveLength(1)
      expect(second.result.current.lists[0]).toMatchObject({ name: 'Coups de cœur' })
    })
  })

  describe('RDVContext (bookflow_rdv_*)', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <RdvProvider>{children}</RdvProvider>
    }

    it('charge les RDV depuis bookflow_rdv_{codeClient}', () => {
      localStorage.setItem('bookflow_rdv_LIB001', JSON.stringify([
        { book: { id: 'b1' }, quantity: 3 },
      ]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useRdv(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
    })

    it('utilise le suffixe guest quand aucun user n\'est connecté', () => {
      localStorage.setItem('bookflow_rdv_guest', JSON.stringify([
        { book: { id: 'guest-rdv' }, quantity: 1 },
      ]))

      mockAuth.mockReturnValue(authGuest())

      const { result } = renderHook(() => useRdv(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].book.id).toBe('guest-rdv')
    })

    it('isole les données entre deux codeClients', () => {
      localStorage.setItem('bookflow_rdv_LIB001', JSON.stringify([
        { book: { id: 'rdv-001' }, quantity: 2 },
      ]))
      localStorage.setItem('bookflow_rdv_LIB002', JSON.stringify([
        { book: { id: 'rdv-002' }, quantity: 7 },
      ]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useRdv(), { wrapper: Wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].book.id).toBe('rdv-001')
    })
  })

  describe('OrdersContext (bookflow_orders_*)', () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return <OrdersProvider>{children}</OrdersProvider>
    }

    it('charge les commandes extra depuis bookflow_orders_{codeClient}', () => {
      const extraOrder = {
        id: 'extra-test-order',
        numero: 'CMD9999999',
        date: '2026-09-01',
        status: 'en préparation',
        items: [],
        subtotalHT: 10,
        remiseAmount: 0,
        netHT: 10,
        tva: 0.55,
        totalTTC: 10.55,
        adresseLivraison: '1 rue test',
        codeClient: 'LIB001',
        deliveryMode: 'standard',
      }
      localStorage.setItem('bookflow_orders_LIB001', JSON.stringify([extraOrder]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      const foundOrder = result.current.orders.find(o => o.id === 'extra-test-order')
      expect(foundOrder).toBeTruthy()
    })

    it('ne charge pas les commandes d\'un autre codeClient', () => {
      const otherOrder = {
        id: 'other-client-order',
        numero: 'CMD8888888',
        date: '2026-09-01',
        status: 'en préparation',
        items: [],
        subtotalHT: 10,
        remiseAmount: 0,
        netHT: 10,
        tva: 0.55,
        totalTTC: 10.55,
        adresseLivraison: 'Autre adresse',
        codeClient: 'LIB002',
        deliveryMode: 'standard',
      }
      localStorage.setItem('bookflow_orders_LIB002', JSON.stringify([otherOrder]))

      mockAuth.mockReturnValue(authUser('LIB001'))

      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      const foundOrder = result.current.orders.find(o => o.id === 'other-client-order')
      expect(foundOrder).toBeUndefined()
    })
  })
})
