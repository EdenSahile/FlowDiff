import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Book, Universe } from '@/data/mockBooks'

/* ── Mocks ── */

const mockShowToast = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { useAuthContext } from '@/contexts/AuthContext'
import { CartProvider, useCart, CART_LIMIT } from '@/contexts/CartContext'

const mockAuth = vi.mocked(useAuthContext)

/* ── Helpers ── */

const CART_KEY = 'bookflow_cart_LIB001'

function authUser(codeClient: string, remisesParUnivers?: Record<string, number>) {
  return {
    user: {
      id: `u-${codeClient}`,
      codeClient,
      nomLibrairie: 'Librairie Test',
      email: 'test@test.fr',
      adresseLivraison: '1 rue test',
      remise: 30,
      telephone: '0102030405',
      remisesParUnivers: remisesParUnivers as Record<string, number>,
      reliquatAccepte: false,
    },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }
}

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-default',
    isbn: '9780000000000',
    title: 'Livre Test',
    authors: ['Auteur Test'],
    publisher: 'Éditeur Test',
    universe: 'BD/Mangas' as Universe,
    type: 'fonds',
    price: 10 / 1.055,
    priceTTC: 10,
    format: 'Broché',
    publicationDate: '2024-01-01',
    description: '',
    ...overrides,
  } as Book
}

function prefillCart(items: Array<{ id: string; quantity: number }>) {
  localStorage.setItem(CART_KEY, JSON.stringify({
    items: items.map(({ id, quantity }) => ({
      book: makeBook({ id }),
      quantity,
    })),
    opGroups: [],
  }))
}

/* ── Setup ── */

beforeEach(() => {
  localStorage.clear()
  mockShowToast.mockClear()
  mockAuth.mockReturnValue(authUser('LIB001'))
})

/* ── FLOW-RM-038 : limite du panier à 30 articles ── */

describe('FLOW-RM-038 : limite du panier à 30 articles', () => {
  it('accepte un ajout qui porte le total à exactement 30 (panier 29 + qty 1)', () => {
    prefillCart([{ id: 'filler', quantity: 29 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 1)
    })

    expect(result.current.totalItems).toBe(30)
  })

  it('refuse un ajout quand le panier est déjà à 30', () => {
    prefillCart([{ id: 'filler', quantity: 30 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 1)
    })

    expect(result.current.totalItems).toBe(30)
  })

  it('refuse un ajout multi-quantité qui dépasse la limite (panier 29 + qty 3)', () => {
    prefillCart([{ id: 'filler', quantity: 29 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 3)
    })

    expect(result.current.totalItems).toBe(29)
  })

  it('accepte un ajout multi-quantité qui atteint exactement la limite (panier 27 + qty 3)', () => {
    prefillCart([{ id: 'filler', quantity: 27 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 3)
    })

    expect(result.current.totalItems).toBe(30)
  })

  it('refuse un ajout sur un livre existant si le total dépasserait la limite', () => {
    prefillCart([
      { id: 'existing-book', quantity: 3 },
      { id: 'other-books', quantity: 25 },
    ])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'existing-book' }), 3)
    })

    expect(result.current.totalItems).toBe(28)
  })
})

/* ── FLOW-RM-039 : ajout même livre = incrémentation quantité ── */

describe('FLOW-RM-039 : ajout même livre = incrémentation quantité', () => {
  it('fusionne les quantités quand on ajoute 2 fois le même livre', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 2)
    })
    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 3)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('crée 2 items distincts pour le même livre avec des ebookOption différents', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 1, {
        ebookOption: { hebergeur: 'Eden', format: 'EPUB', price: 5, isbnEbook: 'ebook-001' },
      })
    })
    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 1, {
        ebookOption: { hebergeur: 'Eden', format: 'PDF', price: 7, isbnEbook: 'ebook-002' },
      })
    })

    expect(result.current.items).toHaveLength(2)
  })

  it('crée 2 items distincts pour des livres différents', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 1)
    })
    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-b' }), 1)
    })

    expect(result.current.items).toHaveLength(2)
  })
})

/* ── FLOW-RM-040 : limite atteinte, toast d'erreur et panier inchangé ── */

describe('FLOW-RM-040 : limite atteinte, toast d\'erreur et panier inchangé', () => {
  it('affiche un toast d\'erreur quand la limite est atteinte', () => {
    prefillCart([{ id: 'filler', quantity: 30 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 1)
    })

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining(`${CART_LIMIT}`),
      'error',
    )
  })

  it('ne modifie pas le panier quand la limite est atteinte', () => {
    prefillCart([{ id: 'filler', quantity: 30 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'new-book' }), 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.totalItems).toBe(30)
  })
})

/* ── FLOW-RM-042 : taux effectifs libraire prioritaires sur REMISE_RATES ── */

describe('FLOW-RM-042 : taux effectifs libraire prioritaires', () => {
  it('utilise les taux par défaut (REMISE_RATES) quand le user n\'a pas de remisesParUnivers', () => {
    // remisesParUnivers undefined → le code utilise REMISE_RATES (BD/Mangas = 0.30)
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'bd1', universe: 'BD/Mangas' as Universe, priceTTC: 10 }))
    })

    expect(result.current.remiseAmount).toBeCloseTo(3)
  })

  it('utilise les taux du libraire quand remisesParUnivers est défini', () => {
    mockAuth.mockReturnValue(authUser('LIB001', { 'BD/Mangas': 25 }))

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'bd1', universe: 'BD/Mangas' as Universe, priceTTC: 10 }))
    })

    expect(result.current.remiseAmount).toBeCloseTo(2.5)
  })
})

/* ── FLOW-RM-047 : updateQty < 1 supprime l'article ── */

describe('FLOW-RM-047 : updateQty < 1 supprime l\'article', () => {
  it('supprime l\'article quand la quantité passe à 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 2)
    })

    act(() => {
      result.current.updateQty('livre-a', 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('supprime l\'article quand la quantité est négative', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 2)
    })

    act(() => {
      result.current.updateQty('livre-a', -1)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('met la quantité à 3 quand on passe 3', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.addToCart(makeBook({ id: 'livre-a' }), 1)
    })

    act(() => {
      result.current.updateQty('livre-a', 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
  })

  it('refuse updateQty quand le nouveau total dépasserait CART_LIMIT', () => {
    prefillCart([
      { id: 'livre-a', quantity: 2 },
      { id: 'autres', quantity: 27 },
    ])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.updateQty('livre-a', 5)
    })

    expect(result.current.items.find(i => i.book.id === 'livre-a')?.quantity).toBe(2)
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining(`${CART_LIMIT}`),
      'error',
    )
  })

  it('accepte updateQty quand le nouveau total atteint exactement CART_LIMIT', () => {
    prefillCart([
      { id: 'livre-a', quantity: 2 },
      { id: 'autres', quantity: 25 },
    ])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.updateQty('livre-a', 5)
    })

    expect(result.current.items.find(i => i.book.id === 'livre-a')?.quantity).toBe(5)
    expect(result.current.totalItems).toBe(30)
  })

  it('accepte updateQty qui diminue la quantité même au-dessus de la limite initiale', () => {
    prefillCart([{ id: 'livre-a', quantity: 5 }])

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => {
      result.current.updateQty('livre-a', 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
  })
})

/* ── FLOW-RM-049 : validation panier stocké via Zod ── */

describe('FLOW-RM-049 : validation panier stocké via Zod', () => {
  it('retourne un panier vide quand localStorage contient un JSON invalide (pas un objet)', () => {
    localStorage.setItem(CART_KEY, JSON.stringify('pas un objet'))

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    expect(result.current.items).toHaveLength(0)
  })

  it('retourne un panier vide quand un item a quantity=0', () => {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: [{ book: { id: 'b1' }, quantity: 0 }],
      opGroups: [],
    }))

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    expect(result.current.items).toHaveLength(0)
  })

  it('retourne un panier vide quand un item n\'a pas de book.id', () => {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: [{ book: {}, quantity: 1 }],
      opGroups: [],
    }))

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    expect(result.current.items).toHaveLength(0)
  })

  it('charge le panier correctement quand les données sont valides', () => {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: [{ book: { id: 'b1' }, quantity: 2 }],
      opGroups: [],
    }))

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('retourne un panier vide quand localStorage est vide', () => {
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    expect(result.current.items).toHaveLength(0)
  })
})
