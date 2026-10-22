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
import { WishlistProvider, useWishlist } from '@/contexts/WishlistContext'
import type { Book } from '@/data/mockBooks'

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

function Wrapper({ children }: { children: ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>
}

const fakeBook = (id: string) => ({ id, title: `Livre ${id}` }) as unknown as Book

/* ── FLOW-RM-099 : listes multiples nommées ── */
describe('FLOW-RM-099 : listes multiples nommées', () => {
  beforeEach(() => {
    localStorage.clear()
    mockAuth.mockReturnValue(authUser('LIB001'))
  })

  it('crée plusieurs listes distinctes avec chacune son nom', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

    act(() => { result.current.createList('BD favorites') })
    act(() => { result.current.createList('À commander') })

    expect(result.current.lists).toHaveLength(2)
    expect(result.current.lists.map(l => l.name)).toEqual(['BD favorites', 'À commander'])
  })

})

/* ── FLOW-RM-100 : pas de doublons dans une même liste ── */
describe('FLOW-RM-100 : pas de doublons dans une même liste', () => {
  beforeEach(() => {
    localStorage.clear()
    mockAuth.mockReturnValue(authUser('LIB001'))
  })

  it('ajouter un livre déjà présent ne crée pas de doublon', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })
    const book = fakeBook('book-1')

    let listId = ''
    act(() => { listId = result.current.createList('Ma liste').id })
    act(() => { result.current.addToList(listId, book) })
    act(() => { result.current.addToList(listId, book) })

    const list = result.current.lists.find(l => l.id === listId)!
    expect(list.items).toHaveLength(1)
  })

  it('le même livre peut exister dans 2 listes différentes', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })
    const book = fakeBook('book-shared')

    let listAId = ''
    let listBId = ''
    act(() => { listAId = result.current.createList('Liste A').id })
    act(() => { listBId = result.current.createList('Liste B').id })
    act(() => { result.current.addToList(listAId, book) })
    act(() => { result.current.addToList(listBId, book) })

    expect(result.current.getListsContaining('book-shared')).toHaveLength(2)
  })
})

/* ── FLOW-RM-101 : validation Zod au chargement, fallback sur état vide ── */
describe('FLOW-RM-101 : fallback sur état vide si données corrompues', () => {
  beforeEach(() => {
    localStorage.clear()
    mockAuth.mockReturnValue(authUser('LIB001'))
  })

  it('JSON invalide en localStorage → liste vide, pas de crash', () => {
    localStorage.setItem('bookflow_wishlists_LIB001', '{pas du json valide')

    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

    expect(result.current.lists).toEqual([])
  })

  it('données qui ne passent pas le schéma Zod → liste vide', () => {
    localStorage.setItem('bookflow_wishlists_LIB001', JSON.stringify([
      { id: 'wl-1' },
    ]))

    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

    expect(result.current.lists).toEqual([])
  })

  it('tableau de type inattendu → liste vide', () => {
    localStorage.setItem('bookflow_wishlists_LIB001', JSON.stringify('pas un tableau'))

    const { result } = renderHook(() => useWishlist(), { wrapper: Wrapper })

    expect(result.current.lists).toEqual([])
  })
})
