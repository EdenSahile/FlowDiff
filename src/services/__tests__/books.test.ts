import { describe, it, expect } from 'vitest'
import { searchBooksLocal, getAllBooksAsync, getBooksByTypeAsync, getBookByIdAsync } from '../books'
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

describe('getAllBooksAsync', () => {
  it('retourne le catalogue mock complet', async () => {
    const allBooks = await getAllBooksAsync()

    expect(allBooks).toEqual(MOCK_BOOKS)
  })
})

describe('getBooksByTypeAsync', () => {
  it('ne retourne que les titres du type demandé', async () => {
    const fondsBooks = await getBooksByTypeAsync('fonds')

    expect(fondsBooks.length).toBeGreaterThan(0)
    expect(fondsBooks.every(book => book.type === 'fonds')).toBe(true)
  })

  it('restreint aussi à l\'univers quand il est fourni', async () => {
    const jeunesseFondsBooks = await getBooksByTypeAsync('fonds', 'Jeunesse')

    expect(jeunesseFondsBooks.length).toBeGreaterThan(0)
    expect(jeunesseFondsBooks.every(book => book.type === 'fonds' && book.universe === 'Jeunesse')).toBe(true)
  })

  it('filtrer sur un univers réduit le nombre de titres du type', async () => {
    const fondsBooks = await getBooksByTypeAsync('fonds')
    const jeunesseFondsBooks = await getBooksByTypeAsync('fonds', 'Jeunesse')

    expect(jeunesseFondsBooks.length).toBeLessThan(fondsBooks.length)
  })
})

describe('getBookByIdAsync', () => {
  it('retrouve un livre du catalogue par son id', async () => {
    const expectedBook = MOCK_BOOKS[0]

    const foundBook = await getBookByIdAsync(expectedBook.id)

    expect(foundBook).toEqual(expectedBook)
  })

  it('retourne null pour un id inconnu', async () => {
    const missingBook = await getBookByIdAsync('id-absent-du-catalogue')

    expect(missingBook).toBeNull()
  })
})
