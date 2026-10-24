import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Book, Universe } from '@/data/mockBooks'
import {
  CartProvider,
  useCart,
  getItemKey,
  hasReliquatInItems,
  CART_LIMIT,
  type CartItem,
  type EbookCartOption,
  type OPCartGroup,
} from '@/contexts/CartContext'

/* ── Mocks ── */

const mockShowToast = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { useAuthContext } from '@/contexts/AuthContext'

const mockAuth = vi.mocked(useAuthContext)

/* ── Helpers ── */

const CART_KEY = 'bookflow_cart_LIB001'

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
  return <CartProvider>{children}</CartProvider>
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-default',
    isbn: '9780000000000',
    title: 'Livre Test',
    authors: ['Auteur Test'],
    publisher: 'Editeur Test',
    universe: 'BD/Mangas' as Universe,
    type: 'fonds',
    price: 10 / 1.055,
    priceTTC: 10,
    format: 'Broche',
    publicationDate: '2024-01-01',
    description: '',
    ...overrides,
  }
}

function makeEbookOption(overrides: Partial<EbookCartOption> = {}): EbookCartOption {
  return {
    format: 'EPUB',
    priceTTC: 5.99,
    isbn: 'ebook-default-isbn',
    ...overrides,
  }
}

function makeOPGroup(overrides: Partial<Omit<OPCartGroup, 'id'>> = {}): Omit<OPCartGroup, 'id'> {
  return {
    serieId: 'serie-01',
    serieName: 'One Piece',
    opTitle: 'OP Ete 2026',
    opDescription: 'Pack decouverte',
    books: [
      { book: makeBook({ id: 'op-book-1', priceTTC: 7 }), quantity: 2 },
      { book: makeBook({ id: 'op-book-2', priceTTC: 9 }), quantity: 1 },
    ],
    cadeau: {
      label: 'Marque-page collector',
      emoji: '',
      isbn: 'cadeau-isbn-001',
      quantity: 1,
    },
    plv: {
      isbn: 'plv-isbn-001',
      description: 'Presentoir carton',
      quantity: 1,
      pricePerUnit: 3.50,
    },
    ...overrides,
  }
}

/* ── Setup ── */

beforeEach(() => {
  localStorage.clear()
  mockShowToast.mockClear()
  mockAuth.mockReturnValue(authUser('LIB001'))
})

/* ══════════════════════════════════════════════════════════════════
   FLOW-RM-060 : snapshot du statut stock au moment de l'ajout
   ══════════════════════════════════════════════════════════════════ */

describe('FLOW-RM-060 : snapshot du statut stock au moment de l\'ajout', () => {
  it.each([
    ['disponible'],
    ['en_reimp'],
    ['stock_limite'],
  ] as const)('stocke book.statut=%s dans le CartItem a la creation', (statut) => {
    const book = makeBook({ id: `b-${statut}`, statut })

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => { result.current.addToCart(book) })

    expect(result.current.items[0].statut).toBe(statut)
  })

  it('stocke undefined quand le livre n\'a pas de statut', () => {
    const bookSansStatut = makeBook({ id: 'b-no-statut' })

    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

    act(() => { result.current.addToCart(bookSansStatut) })

    expect(result.current.items[0].statut).toBeUndefined()
  })
})

/* ══════════════════════════════════════════════════════════════════
   FLOW-RM-061 : flag enReliquat et detection hasReliquatInItems
   ══════════════════════════════════════════════════════════════════ */

describe('FLOW-RM-061 : flag enReliquat', () => {
  describe('assignation dans addToCart', () => {
    it('positionne enReliquat a true quand l\'option est passee', () => {
      const bookReimp = makeBook({ id: 'b-reimp', statut: 'en_reimp' })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addToCart(bookReimp, 1, { enReliquat: true }) })

      expect(result.current.items[0].enReliquat).toBe(true)
    })

    it('positionne enReliquat a false quand l\'option n\'est pas passee', () => {
      const bookDispo = makeBook({ id: 'b-dispo', statut: 'disponible' })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addToCart(bookDispo) })

      expect(result.current.items[0].enReliquat).toBe(false)
    })

    it('positionne enReliquat a false quand l\'option est explicitement false', () => {
      const bookDispo = makeBook({ id: 'b-dispo', statut: 'disponible' })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addToCart(bookDispo, 1, { enReliquat: false }) })

      expect(result.current.items[0].enReliquat).toBe(false)
    })
  })

  describe('hasReliquatInItems (fonction pure)', () => {
    it('retourne true quand au moins 1 item a enReliquat=true', () => {
      const itemsWithReliquat: Pick<CartItem, 'enReliquat'>[] = [
        { enReliquat: false },
        { enReliquat: true },
        { enReliquat: false },
      ]

      const hasReliquat = hasReliquatInItems(itemsWithReliquat)

      expect(hasReliquat).toBe(true)
    })

    it('retourne false quand aucun item n\'a enReliquat=true', () => {
      const itemsSansReliquat: Pick<CartItem, 'enReliquat'>[] = [
        { enReliquat: false },
        { enReliquat: false },
      ]

      const hasReliquat = hasReliquatInItems(itemsSansReliquat)

      expect(hasReliquat).toBe(false)
    })

    it('retourne false pour une liste vide', () => {
      const hasReliquat = hasReliquatInItems([])

      expect(hasReliquat).toBe(false)
    })

    it('retourne false quand enReliquat est undefined', () => {
      const itemsUndefined: Pick<CartItem, 'enReliquat'>[] = [
        { enReliquat: undefined },
      ]

      const hasReliquat = hasReliquatInItems(itemsUndefined)

      expect(hasReliquat).toBe(false)
    })
  })

  describe('hasReliquatItems dans le contexte', () => {
    it('expose hasReliquatItems=true quand un item du panier est en reliquat', () => {
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addToCart(makeBook({ id: 'b1' }), 1)
      })
      act(() => {
        result.current.addToCart(makeBook({ id: 'b2', statut: 'en_reimp' }), 1, { enReliquat: true })
      })

      expect(result.current.hasReliquatItems).toBe(true)
    })

    it('expose hasReliquatItems=false quand aucun item n\'est en reliquat', () => {
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addToCart(makeBook({ id: 'b1', statut: 'disponible' }), 1)
      })

      expect(result.current.hasReliquatItems).toBe(false)
    })
  })
})

/* ══════════════════════════════════════════════════════════════════
   FLOW-RM-063 : cle composite ebook et deduplication
   ══════════════════════════════════════════════════════════════════ */

describe('FLOW-RM-063 : cle composite ebook et deduplication', () => {
  describe('getItemKey (fonction pure)', () => {
    it('retourne bookId seul pour un item sans ebookOption', () => {
      const item: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
      }

      const key = getItemKey(item)

      expect(key).toBe('livre-123')
    })

    it('retourne bookId::isbn pour un item avec ebookOption', () => {
      const item: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
        ebookOption: makeEbookOption({ isbn: '978-ebook-456' }),
      }

      const key = getItemKey(item)

      expect(key).toBe('livre-123::978-ebook-456')
    })

    it('produit des cles differentes pour 2 ebooks du meme livre avec ISBN differents', () => {
      const itemEpub: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
        ebookOption: makeEbookOption({ isbn: 'isbn-epub' }),
      }
      const itemPdf: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
        ebookOption: makeEbookOption({ isbn: 'isbn-pdf' }),
      }

      const keyEpub = getItemKey(itemEpub)
      const keyPdf = getItemKey(itemPdf)

      expect(keyEpub).not.toBe(keyPdf)
    })

    it('produit des cles differentes entre physique et ebook du meme livre', () => {
      const itemPhysique: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
      }
      const itemEbook: CartItem = {
        book: makeBook({ id: 'livre-123' }),
        quantity: 1,
        ebookOption: makeEbookOption({ isbn: 'isbn-ebook' }),
      }

      const keyPhysique = getItemKey(itemPhysique)
      const keyEbook = getItemKey(itemEbook)

      expect(keyPhysique).not.toBe(keyEbook)
    })
  })

  describe('deduplication dans addToCart', () => {
    it('fusionne les quantites pour 2 ajouts ebook avec le meme ISBN ebook', () => {
      const ebook = makeEbookOption({ isbn: 'isbn-epub-001' })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 1, { ebookOption: ebook })
      })
      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 2, { ebookOption: ebook })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
    })

    it('cree 2 items pour le meme livre : 1 physique + 1 ebook', () => {
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 1)
      })
      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 1, {
          ebookOption: makeEbookOption({ isbn: 'isbn-epub-001' }),
        })
      })

      expect(result.current.items).toHaveLength(2)
    })

    it('cree 2 items pour 2 ebooks du meme livre avec ISBN differents', () => {
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 1, {
          ebookOption: makeEbookOption({ isbn: 'isbn-epub' }),
        })
      })
      act(() => {
        result.current.addToCart(makeBook({ id: 'livre-a' }), 1, {
          ebookOption: makeEbookOption({ isbn: 'isbn-pdf' }),
        })
      })

      expect(result.current.items).toHaveLength(2)
    })
  })
})

/* ══════════════════════════════════════════════════════════════════
   FLOW-RM-064 : ajout/suppression OP avec controle CART_LIMIT
   ══════════════════════════════════════════════════════════════════ */

describe('FLOW-RM-064 : operations promotionnelles', () => {
  describe('addOPToCart', () => {
    it('ajoute un groupe OP au panier avec un id genere', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups).toHaveLength(1)
      expect(result.current.opGroups[0].id).toMatch(/^op-serie-01-/)
    })

    it('conserve les livres du groupe OP', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups[0].books).toHaveLength(2)
      expect(result.current.opGroups[0].books[0].quantity).toBe(2)
      expect(result.current.opGroups[0].books[1].quantity).toBe(1)
    })

    it('conserve le cadeau (gratuit) dans le groupe OP', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups[0].cadeau.label).toBe('Marque-page collector')
      expect(result.current.opGroups[0].cadeau.isbn).toBe('cadeau-isbn-001')
    })

    it('conserve la PLV (payante) dans le groupe OP', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups[0].plv.pricePerUnit).toBe(3.50)
      expect(result.current.opGroups[0].plv.isbn).toBe('plv-isbn-001')
    })

    it('compte les livres OP dans totalItems', () => {
      const opGroup = makeOPGroup({
        books: [
          { book: makeBook({ id: 'op-1' }), quantity: 3 },
          { book: makeBook({ id: 'op-2' }), quantity: 2 },
        ],
      })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.totalItems).toBe(5)
    })
  })

  describe('removeOP', () => {
    it('retire le groupe OP du panier par son id', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })
      const opId = result.current.opGroups[0].id

      act(() => { result.current.removeOP(opId) })

      expect(result.current.opGroups).toHaveLength(0)
    })

    it('ne retire rien si l\'id n\'existe pas', () => {
      const opGroup = makeOPGroup()

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      act(() => { result.current.removeOP('id-inexistant') })

      expect(result.current.opGroups).toHaveLength(1)
    })
  })

  describe('CART_LIMIT sur les OPs', () => {
    it('refuse un ajout OP quand les livres OP depasseraient la limite', () => {
      localStorage.setItem(CART_KEY, JSON.stringify({
        items: [{ book: makeBook({ id: 'filler' }), quantity: 28 }],
        opGroups: [],
      }))
      const opGroup = makeOPGroup({
        books: [
          { book: makeBook({ id: 'op-1' }), quantity: 2 },
          { book: makeBook({ id: 'op-2' }), quantity: 2 },
        ],
      })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups).toHaveLength(0)
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${CART_LIMIT}`),
        'error',
      )
    })

    it('accepte un ajout OP quand le total atteint exactement la limite', () => {
      localStorage.setItem(CART_KEY, JSON.stringify({
        items: [{ book: makeBook({ id: 'filler' }), quantity: 27 }],
        opGroups: [],
      }))
      const opGroup = makeOPGroup({
        books: [
          { book: makeBook({ id: 'op-1' }), quantity: 2 },
          { book: makeBook({ id: 'op-2' }), quantity: 1 },
        ],
      })

      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => { result.current.addOPToCart(opGroup) })

      expect(result.current.opGroups).toHaveLength(1)
      expect(result.current.totalItems).toBe(30)
    })

    it('refuse un ajout OP quand le total existant inclut deja des livres OP', () => {
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper })

      act(() => {
        result.current.addOPToCart(makeOPGroup({
          serieId: 'serie-a',
          books: [{ book: makeBook({ id: 'op-a' }), quantity: 28 }],
        }))
      })

      act(() => {
        result.current.addOPToCart(makeOPGroup({
          serieId: 'serie-b',
          books: [{ book: makeBook({ id: 'op-b' }), quantity: 5 }],
        }))
      })

      expect(result.current.opGroups).toHaveLength(1)
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${CART_LIMIT}`),
        'error',
      )
    })
  })
})
