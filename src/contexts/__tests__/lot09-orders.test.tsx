import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Book } from '@/data/mockBooks'
import type { CartItem } from '@/contexts/CartContext'
import {
  ORDER_STATUSES,
  MOCK_ORDERS,
  type TypeCommande,
  type Order,
} from '@/data/mockOrders'

/* ── Mocks ── */

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useAuthContext } from '@/contexts/AuthContext'
import { OrdersProvider, useOrders, useClientOrders } from '@/contexts/OrdersContext'

const mockAuth = vi.mocked(useAuthContext)

/* ── Constantes localStorage (miroir des valeurs dans OrdersContext) ── */

const ORDER_COUNTER_KEY = 'bookflow_order_counter'

/* ── Helpers ── */

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
      remisesParUnivers: {} as Record<string, number>,
      reliquatAccepte: false,
    },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }
}

function Wrapper({ children }: { children: ReactNode }) {
  return <OrdersProvider>{children}</OrdersProvider>
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-test-01',
    isbn: '9780000000001',
    title: 'Livre Test',
    authors: ['Auteur Test'],
    publisher: 'Editeur Test',
    universe: 'BD/Mangas',
    type: 'fonds',
    price: 10,
    priceTTC: 10.55,
    format: 'Broché',
    publicationDate: '2024-01-01',
    description: 'Description test',
    ...overrides,
  }
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    book: makeBook(),
    quantity: 1,
    ...overrides,
  }
}

function baseOrderParams() {
  return {
    codeClient: 'LIB001',
    adresseLivraison: '1 rue test',
    items: [makeCartItem()],
    subtotalHT: 10,
    remiseAmount: 3,
    netHT: 7,
    tva: 0.39,
    totalTTC: 7.39,
    deliveryMode: 'standard' as const,
    transmissionMode: 'FLOWDIFF' as const,
  }
}

/* ── Setup ── */

beforeEach(() => {
  localStorage.clear()
  mockAuth.mockReturnValue(authUser('LIB001'))
})

/* ══════════════════════════════════════════════════════════
   LOT-09 : Commandes et historique
   ══════════════════════════════════════════════════════════ */

describe('LOT-09 : Commandes et historique', () => {

  /* ── Numerotation des commandes ── */

  describe('Numerotation des commandes', () => {

    it('FLOW-RM-065 : produit un numero au format CMD + 7 chiffres', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let createdOrder!: Order
      act(() => {
        createdOrder = result.current.addOrder(baseOrderParams())
      })

      expect(createdOrder.numero).toMatch(/^CMD\d{7}$/)
    })

    it('FLOW-RM-065 : incremente le compteur a chaque appel', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let firstOrder!: Order
      let secondOrder!: Order
      act(() => {
        firstOrder = result.current.addOrder(baseOrderParams())
      })
      act(() => {
        secondOrder = result.current.addOrder(baseOrderParams())
      })

      const firstNum = parseInt(firstOrder.numero.replace('CMD', ''), 10)
      const secondNum = parseInt(secondOrder.numero.replace('CMD', ''), 10)
      expect(secondNum).toBe(firstNum + 1)
    })

    it('FLOW-RM-065 : persiste le compteur dans localStorage', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      act(() => {
        result.current.addOrder(baseOrderParams())
      })

      const storedCounter = localStorage.getItem(ORDER_COUNTER_KEY)
      expect(storedCounter).toBe('15')
    })

    it('FLOW-RM-066 : le compteur initial est 14, le 1er numero genere est CMD0000015', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let firstOrder!: Order
      act(() => {
        firstOrder = result.current.addOrder(baseOrderParams())
      })

      expect(firstOrder.numero).toBe('CMD0000015')
    })
  })

  /* ── Attributs a la creation de commande ── */

  describe('Attributs a la creation de commande', () => {

    it('FLOW-RM-067 : cree la commande avec le statut "en preparation"', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let createdOrder!: Order
      act(() => {
        createdOrder = result.current.addOrder(baseOrderParams())
      })

      expect(createdOrder.status).toBe('en préparation')
    })

    it('FLOW-RM-068 : ediStatus = PENDING quand transmissionMode === EDI', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let ediOrder!: Order
      act(() => {
        ediOrder = result.current.addOrder({
          ...baseOrderParams(),
          transmissionMode: 'EDI',
        })
      })

      expect(ediOrder.ediStatus).toBe('PENDING')
    })

    it('FLOW-RM-068 : ediStatus = undefined quand transmissionMode === FLOWDIFF', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let flowdiffOrder!: Order
      act(() => {
        flowdiffOrder = result.current.addOrder({
          ...baseOrderParams(),
          transmissionMode: 'FLOWDIFF',
        })
      })

      expect(flowdiffOrder.ediStatus).toBeUndefined()
    })

    it('FLOW-RM-072 : reporte deliveryMode standard sur la commande', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let standardOrder!: Order
      act(() => {
        standardOrder = result.current.addOrder({
          ...baseOrderParams(),
          deliveryMode: 'standard',
        })
      })

      expect(standardOrder.deliveryMode).toBe('standard')
    })

    it('FLOW-RM-072 : reporte deliveryMode specific avec date sur la commande', () => {
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper })

      let specificOrder!: Order
      act(() => {
        specificOrder = result.current.addOrder({
          ...baseOrderParams(),
          deliveryMode: 'specific',
          deliveryDate: '2026-10-01',
        })
      })

      expect(specificOrder.deliveryMode).toBe('specific')
      expect(specificOrder.deliveryDate).toBe('2026-10-01')
    })
  })

  /* ── Referentiels (statuts et types) ── */

  describe('Referentiels', () => {

    it('FLOW-RM-070 : ORDER_STATUSES contient exactement en preparation, expedie, livre', () => {
      expect(ORDER_STATUSES).toEqual(['en préparation', 'expédié', 'livré'])
    })

    it('FLOW-RM-071 : les 3 valeurs MONO, AP, SUITE sont assignables au type TypeCommande', () => {
      const mono: TypeCommande = 'MONO'
      const ap: TypeCommande = 'AP'
      const suite: TypeCommande = 'SUITE'

      expect([mono, ap, suite]).toEqual(['MONO', 'AP', 'SUITE'])
    })

    it('FLOW-RM-071 : les donnees mock ne contiennent que des typeCommande valides', () => {
      const validTypes = new Set(['MONO', 'AP', 'SUITE'])

      const allTypeCommandes = Object.values(MOCK_ORDERS)
        .flat()
        .flatMap(o => o.items.map(i => i.typeCommande))
        .filter((t): t is TypeCommande => t !== undefined)
      const invalidTypes = allTypeCommandes.filter(t => !validTypes.has(t))

      expect(invalidTypes).toEqual([])
      expect(allTypeCommandes.length).toBeGreaterThan(0)
    })
  })

  /* ── Isolation par codeClient ── */

  describe('Isolation par codeClient', () => {

    it('FLOW-RM-069 : retourne uniquement les commandes du codeClient demande', () => {
      const { result } = renderHook(() => useClientOrders('LIB001'), { wrapper: Wrapper })

      const nonMatchingOrders = result.current.filter(o => o.codeClient !== 'LIB001')

      expect(nonMatchingOrders).toEqual([])
      expect(result.current.length).toBe(2)
    })

    it('FLOW-RM-069 : retourne un tableau vide pour un codeClient sans commandes', () => {
      const { result } = renderHook(() => useClientOrders('LIB999'), { wrapper: Wrapper })

      expect(result.current).toEqual([])
    })
  })

  /* ── FLOW-RM-073 : migration storage ──
     Teste dans un fichier separe (lot09-migration.test.ts)
     car migrateStorage() s'execute au chargement du module,
     et il faut controler localStorage AVANT l'import.
     ── */
})
