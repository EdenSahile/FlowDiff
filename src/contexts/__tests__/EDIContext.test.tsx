import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Order } from '@/data/mockOrders'

vi.mock('@/contexts/AuthContext', () => ({ useAuthContext: vi.fn() }))
vi.mock('@/contexts/OrdersContext', () => ({ useOrders: vi.fn() }))

import { useAuthContext } from '@/contexts/AuthContext'
import { useOrders } from '@/contexts/OrdersContext'
import { EDIProvider, useEDI } from '@/contexts/EDIContext'

const mockAuth = vi.mocked(useAuthContext)
const mockOrders = vi.mocked(useOrders)
let orders: Order[] = []

function Wrapper({ children }: { children: ReactNode }) {
  return <EDIProvider>{children}</EDIProvider>
}

function account(codeClient: string) {
  return { user: { codeClient, adresseLivraison: '1 rue de la Démo' } } as never
}

function ediOrder(id: string, codeClient: string): Order {
  return {
    id,
    numero: `CMD-${id}`,
    date: '2026-11-02',
    status: 'en préparation',
    codeClient,
    adresseLivraison: '1 rue de la Démo',
    deliveryMode: 'standard',
    transmissionMode: 'EDI',
    ediStatus: 'ACK',
    items: [{ bookId: 'book', title: 'Livre démo', author: 'Auteur', publisher: 'Éditeur', isbn: '9780000000001', quantity: 2, unitPriceHT: 10, universe: 'Littérature' }],
    subtotalHT: 20,
    remiseAmount: 7,
    netHT: 13,
    tva: 0.72,
    totalTTC: 13.72,
  }
}

beforeEach(() => {
  localStorage.clear()
  orders = []
  mockAuth.mockReturnValue(account('LIB001'))
  mockOrders.mockImplementation(() => ({ orders }) as never)
})

describe('EDIContext', () => {
  it('génère exactement les trois messages EDI d’une simulation, sans doublon au rerender', async () => {
    orders = [ediOrder('edi-one', 'LIB001')]
    const { result, rerender } = renderHook(() => useEDI(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.messages.filter(message => message.orderId === 'edi-one')).toHaveLength(3))
    rerender()
    rerender()

    expect(result.current.messages.filter(message => message.orderId === 'edi-one')).toHaveLength(3)
  })

  it('isole les messages générés entre comptes de démonstration', async () => {
    orders = [ediOrder('edi-lib001', 'LIB001')]
    const first = renderHook(() => useEDI(), { wrapper: Wrapper })
    await waitFor(() => expect(first.result.current.messages.some(message => message.orderId === 'edi-lib001')).toBe(true))
    first.unmount()

    mockAuth.mockReturnValue(account('LIB002'))
    orders = []
    const second = renderHook(() => useEDI(), { wrapper: Wrapper })

    expect(second.result.current.messages.some(message => message.orderId === 'edi-lib001')).toBe(false)
  })
})
