import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

/* ── Mocks ── */

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useAuthContext } from '@/contexts/AuthContext'
import { OrdersProvider } from '@/contexts/OrdersContext'

const mockAuth = vi.mocked(useAuthContext)

const ORDERS_KEY_LIB001 = 'bookflow_orders_LIB001'

function authEnCours() {
  return {
    user: null,
    isLoading: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }
}

function authResolue(codeClient: string) {
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

function commandeStockee() {
  return {
    id: 'ord-deja-passee',
    numero: 'CMD0000077',
    date: '2026-10-29',
    status: 'en préparation',
    codeClient: 'LIB001',
    adresseLivraison: '1 rue test',
    deliveryMode: 'standard',
    transmissionMode: 'FLOWDIFF',
    items: [{
      bookId: 'b1', title: 'Livre Test', author: 'Auteur Test', publisher: 'Editeur Test',
      isbn: '9780000000001', quantity: 1, unitPriceHT: 10, universe: 'BD/Mangas',
    }],
    subtotalHT: 10, remiseAmount: 3, netHT: 7, tva: 0.39, totalTTC: 7.39,
  }
}

function Wrapper({ children }: { children: ReactNode }) {
  return <OrdersProvider>{children}</OrdersProvider>
}

describe('OrdersProvider, chargement sur le bon compte', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /* `AuthContext` ne repond qu'apres le premier rendu : le compte vaut d'abord
     `guest`. Si l'etat de `guest` survit jusqu'a l'effet de persistance, celui-ci
     ecrit un tableau vide sur la cle du vrai compte avant de la reecrire au rendu
     suivant. Les commandes disparaissent alors du stockage le temps d'un rendu,
     et une fermeture d'onglet dans cet intervalle les perd definitivement. */
  it("n'ecrit jamais un tableau vide sur le compte pendant la resolution de l'auth", () => {
    localStorage.setItem(ORDERS_KEY_LIB001, JSON.stringify([commandeStockee()]))
    const ecrituresSurLeCompte: string[] = []
    const vraiSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, cle, valeur) {
      if (cle === ORDERS_KEY_LIB001) ecrituresSurLeCompte.push(String(valeur))
      vraiSetItem.call(this, cle, valeur)
    })
    mockAuth.mockReturnValue(authEnCours())

    const { rerender } = render(<Wrapper><div /></Wrapper>)
    mockAuth.mockReturnValue(authResolue('LIB001'))
    rerender(<Wrapper><div /></Wrapper>)

    expect(ecrituresSurLeCompte).not.toContain('[]')
  })

  it('relit les commandes du compte une fois le code client connu', () => {
    localStorage.setItem(ORDERS_KEY_LIB001, JSON.stringify([commandeStockee()]))
    mockAuth.mockReturnValue(authEnCours())

    const { rerender } = render(<Wrapper><div /></Wrapper>)
    mockAuth.mockReturnValue(authResolue('LIB001'))
    rerender(<Wrapper><div /></Wrapper>)

    const commandesApresResolution = JSON.parse(localStorage.getItem(ORDERS_KEY_LIB001) ?? '[]')
    expect(commandesApresResolution).toHaveLength(1)
    expect(commandesApresResolution[0].numero).toBe('CMD0000077')
  })
})
