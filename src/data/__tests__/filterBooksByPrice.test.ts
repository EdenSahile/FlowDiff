import { describe, it, expect } from 'vitest'
import { filterBooksByPrice } from '../mockBooks'
import type { Book, PriceRange } from '../mockBooks'

function makeBook(id: string, priceTTC: number): Book {
  return {
    id,
    isbn: `978${id}`,
    title: `Book ${id}`,
    authors: ['Author'],
    publisher: 'Publisher',
    universe: 'Litterature' as Book['universe'],
    type: 'fonds',
    price: priceTTC / 1.055,
    priceTTC,
    format: '130 x 200 mm',
    publicationDate: '2026-01-01',
    description: 'Test',
  }
}

describe('filterBooksByPrice', () => {
  const bookAt5 = makeBook('b5', 5)
  const bookAt10 = makeBook('b10', 10)
  const bookAt15 = makeBook('b15', 15)
  const bookAt25 = makeBook('b25', 25)
  const bookAt55 = makeBook('b55', 55)
  const allBooks = [bookAt5, bookAt10, bookAt15, bookAt25, bookAt55]

  it('inclut un livre dont le prix TTC est egal a la borne inferieure (>=)', () => {
    const range: PriceRange = { label: '5 a 10 EUR', min: 5, max: 10 }

    const matchedBooks = filterBooksByPrice(allBooks, [range])

    expect(matchedBooks).toContainEqual(bookAt5)
  })

  it('exclut un livre dont le prix TTC est egal a la borne superieure (<)', () => {
    const range: PriceRange = { label: '5 a 10 EUR', min: 5, max: 10 }

    const matchedBooks = filterBooksByPrice(allBooks, [range])

    expect(matchedBooks).not.toContainEqual(bookAt10)
  })

  it('inclut un livre dont le prix est entre les bornes', () => {
    const range: PriceRange = { label: '10 a 20 EUR', min: 10, max: 20 }

    const matchedBooks = filterBooksByPrice(allBooks, [range])

    expect(matchedBooks).toContainEqual(bookAt15)
  })

  it('retourne tous les livres si aucune tranche n\'est selectionnee', () => {
    const matchedBooks = filterBooksByPrice(allBooks, [])

    expect(matchedBooks).toEqual(allBooks)
  })

  it('retourne l\'union des livres de plusieurs tranches', () => {
    const ranges: PriceRange[] = [
      { label: '5 a 10 EUR', min: 5, max: 10 },
      { label: '20 a 50 EUR', min: 20, max: 50 },
    ]

    const matchedBooks = filterBooksByPrice(allBooks, ranges)

    expect(matchedBooks).toEqual([bookAt5, bookAt25])
  })

  it('gere la tranche avec max = Infinity', () => {
    const range: PriceRange = { label: '50 EUR et plus', min: 50, max: Infinity }

    const matchedBooks = filterBooksByPrice(allBooks, [range])

    expect(matchedBooks).toEqual([bookAt55])
  })
})
