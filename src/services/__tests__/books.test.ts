import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooksLocal } from '../books'
import type { Book } from '@/data/mockBooks'
import { MOCK_BOOKS } from '@/data/mockBooks'

const base: Book = {
  id: 't1', isbn: '9781234567890', title: 'La Nuit des rois',
  authors: ['William Shakespeare'], publisher: 'Folio',
  universe: 'Littérature', type: 'fonds',
  price: 10, priceTTC: 15, format: '155 x 235 mm',
  publicationDate: '2026-01-01', description: 'Test',
  statut: 'disponible', topVente: false, selection: false, fictif: false,
}

const bookDune: Book = {
  ...base, id: 't2', isbn: '9780000000001', title: 'Dune', authors: ['Frank Herbert'],
}
const bookWithCollection: Book = {
  ...base, id: 't3', isbn: '9780000000002', title: 'Germinal',
  publisher: 'Flammarion', collection: 'Classiques Garnier',
}
const bookWithGenre: Book = {
  ...base, id: 't4', isbn: '9780000000003', title: 'Millenium',
  publisher: 'Actes Sud', genre: 'Polar & Thriller',
}

const books: Book[] = [base, bookDune]
const extendedBooks: Book[] = [base, bookDune, bookWithCollection, bookWithGenre]

describe('searchBooksLocal', () => {
  it('filtre par titre (insensible à la casse)', () => {
    expect(searchBooksLocal(books, 'dune')).toHaveLength(1)
    expect(searchBooksLocal(books, 'dune')[0].id).toBe('t2')
  })

  it('filtre par auteur', () => {
    expect(searchBooksLocal(books, 'shakespeare')).toHaveLength(1)
  })

  it('retourne tous les livres si la requête est vide', () => {
    expect(searchBooksLocal(books, '')).toHaveLength(2)
  })

  it('retourne tableau vide si aucun résultat', () => {
    expect(searchBooksLocal(books, 'xyzabc')).toHaveLength(0)
  })

  it('filtre par ISBN avec nettoyage des espaces et tirets', () => {
    const matchedByHyphens = searchBooksLocal(books, '978-1234-567890')

    expect(matchedByHyphens).toHaveLength(1)
    expect(matchedByHyphens[0].id).toBe('t1')

    const matchedBySpaces = searchBooksLocal(books, '978 1234 567890')

    expect(matchedBySpaces).toHaveLength(1)
    expect(matchedBySpaces[0].id).toBe('t1')
  })

  it('filtre par editeur (insensible a la casse)', () => {
    const matchedBooks = searchBooksLocal(extendedBooks, 'flammarion')

    expect(matchedBooks).toHaveLength(1)
    expect(matchedBooks[0].id).toBe('t3')
  })

  it('filtre par collection (insensible a la casse)', () => {
    const matchedBooks = searchBooksLocal(extendedBooks, 'CLASSIQUES')

    expect(matchedBooks).toHaveLength(1)
    expect(matchedBooks[0].id).toBe('t3')
  })

  it('filtre par genre (insensible a la casse)', () => {
    const matchedBooks = searchBooksLocal(extendedBooks, 'THRILLER')

    expect(matchedBooks).toHaveLength(1)
    expect(matchedBooks[0].id).toBe('t4')
  })

  it('trim la requete avant de filtrer', () => {
    const matchedBooks = searchBooksLocal(extendedBooks, '  dune  ')

    expect(matchedBooks).toHaveLength(1)
    expect(matchedBooks[0].id).toBe('t2')
  })
})

const supabaseRow = {
  id: 'sup-1',
  isbn: '9999999999999',
  title: 'Livre Supabase',
  authors: ['Auteur Supa'],
  publisher: 'SupaEditions',
  universe: 'Litterature',
  type: 'fonds',
  price: 12,
  priceTTC: 12.66,
  format: '130 x 200 mm',
  publicationDate: '2026-06-01',
  description: 'Depuis Supabase',
}

describe('getAllBooksAsync (fallback Supabase)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('utilise les donnees Supabase quand elles sont disponibles', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [supabaseRow], error: null })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    vi.doMock('@/lib/supabase', () => ({
      supabase: { from: mockFrom },
    }))

    const { getAllBooksAsync } = await import('../books')
    const booksFromSupabase = await getAllBooksAsync()

    expect(booksFromSupabase).toHaveLength(1)
    expect(booksFromSupabase[0].id).toBe('sup-1')
    expect(booksFromSupabase[0].title).toBe('Livre Supabase')
  })

  it('fallback vers MOCK_BOOKS quand Supabase retourne une erreur', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB connection failed' },
    })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    vi.doMock('@/lib/supabase', () => ({
      supabase: { from: mockFrom },
    }))

    const { getAllBooksAsync } = await import('../books')
    const fallbackBooks = await getAllBooksAsync()

    expect(fallbackBooks).toHaveLength(MOCK_BOOKS.length)
    expect(fallbackBooks[0].id).toBe(MOCK_BOOKS[0].id)
  })

  it('fallback vers MOCK_BOOKS quand Supabase retourne un tableau vide', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    vi.doMock('@/lib/supabase', () => ({
      supabase: { from: mockFrom },
    }))

    const { getAllBooksAsync } = await import('../books')
    const fallbackBooks = await getAllBooksAsync()

    expect(fallbackBooks).toHaveLength(MOCK_BOOKS.length)
    expect(fallbackBooks[0].id).toBe(MOCK_BOOKS[0].id)
  })

  it('utilise le cache module-level au 2e appel sans refetch', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [supabaseRow], error: null })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    vi.doMock('@/lib/supabase', () => ({
      supabase: { from: mockFrom },
    }))

    const { getAllBooksAsync } = await import('../books')

    await getAllBooksAsync()
    const booksSecondCall = await getAllBooksAsync()

    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(booksSecondCall[0].id).toBe('sup-1')
  })
})
