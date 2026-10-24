import { describe, it, expect } from 'vitest'
import type { Book, StockStatut, Universe } from '@/data/mockBooks'

function makeBook(id: string, universe: Universe, statut: StockStatut): Book {
  return {
    id, isbn: '0000000000000', title: id,
    authors: [], publisher: 'Test', universe,
    type: 'fonds', price: 10, priceTTC: 15,
    format: 'Poche', publicationDate: '2020-01-01',
    description: '', statut,
  }
}

function applyFilters(
  books: Book[],
  universe: Universe | null,
  statut: StockStatut | null,
): Book[] {
  let result = books
  if (universe) result = result.filter(b => b.universe === universe)
  if (statut)   result = result.filter(b => b.statut === statut)
  return result
}

const books: Book[] = [
  makeBook('a', 'Littérature',     'disponible'),
  makeBook('b', 'Littérature',     'epuise'),
  makeBook('c', 'BD/Mangas',       'disponible'),
  makeBook('d', 'Adulte-pratique', 'stock_limite'),
]

describe('FondsPage filter logic', () => {
  it('pas de filtre : retourne tout', () => {
    expect(applyFilters(books, null, null)).toHaveLength(4)
  })

  it('filtre univers uniquement', () => {
    const result = applyFilters(books, 'Littérature', null)
    expect(result).toHaveLength(2)
    expect(result.every(b => b.universe === 'Littérature')).toBe(true)
  })

  it('filtre statut uniquement', () => {
    const result = applyFilters(books, null, 'disponible')
    expect(result).toHaveLength(2)
    expect(result.every(b => b.statut === 'disponible')).toBe(true)
  })

  it('filtre cumulatif univers + statut', () => {
    const result = applyFilters(books, 'Littérature', 'disponible')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('retourne 0 résultats si combinaison vide', () => {
    const result = applyFilters(books, 'Jeunesse', 'epuise')
    expect(result).toHaveLength(0)
  })
})
