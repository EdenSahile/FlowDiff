import { describe, it, expect } from 'vitest'
import { searchBooksLocal } from '../books'
import type { Book } from '@/data/mockBooks'

const base: Book = {
  id: 't1', isbn: '9781234567890', title: 'La Nuit des rois',
  authors: ['William Shakespeare'], publisher: 'Folio',
  universe: 'Littérature', type: 'fonds',
  price: 10, priceTTC: 15, format: '155 x 235 mm',
  publicationDate: '2026-01-01', description: 'Test',
  statut: 'disponible', topVente: false, selection: false, fictif: false,
}

const books: Book[] = [
  base,
  { ...base, id: 't2', isbn: '9780000000001', title: 'Dune', authors: ['Frank Herbert'] },
]

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
})
