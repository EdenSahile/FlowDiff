import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS } from '@/data/mockBooks'
import type { BookType, Universe, StockStatut } from '@/data/mockBooks'

/* ══════════════════════════════════════════════════════
   FLOW-RM-022 : 3 types de titres
══════════════════════════════════════════════════════ */

describe('MOCK_BOOKS — types de titres (FLOW-RM-022)', () => {
  const validTypes: BookType[] = ['nouveaute', 'a-paraitre', 'fonds']

  it('chaque livre a un type appartenant à BookType', () => {
    const invalidBooks = MOCK_BOOKS.filter(b => !validTypes.includes(b.type))

    expect(invalidBooks).toEqual([])
  })

  it('les 3 types sont représentés dans les données', () => {
    const typesPresents = [...new Set(MOCK_BOOKS.map(b => b.type))]

    expect(typesPresents.sort()).toEqual([...validTypes].sort())
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-023 : 4 univers
══════════════════════════════════════════════════════ */

describe('MOCK_BOOKS — univers (FLOW-RM-023)', () => {
  const validUniverses: Universe[] = ['BD/Mangas', 'Jeunesse', 'Littérature', 'Adulte-pratique']

  it('chaque livre a un univers appartenant à Universe', () => {
    const invalidBooks = MOCK_BOOKS.filter(b => !validUniverses.includes(b.universe))

    expect(invalidBooks).toEqual([])
  })

  it('les 4 univers sont représentés dans les données', () => {
    const universesPresents = [...new Set(MOCK_BOOKS.map(b => b.universe))]

    expect(universesPresents.sort()).toEqual([...validUniverses].sort())
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-024 : 6 statuts de stock
══════════════════════════════════════════════════════ */

describe('MOCK_BOOKS — statuts de stock (FLOW-RM-024)', () => {
  const validStatuts: StockStatut[] = ['disponible', 'stock_limite', 'sur_commande', 'en_reimp', 'epuise', 'rupture']

  it('chaque statut présent appartient à StockStatut', () => {
    const booksWithStatut = MOCK_BOOKS.filter(b => b.statut !== undefined)
    const invalidBooks = booksWithStatut.filter(b => !validStatuts.includes(b.statut!))

    expect(invalidBooks).toEqual([])
  })

  it('les 6 statuts sont représentés dans les données', () => {
    const statutsPresents = [...new Set(MOCK_BOOKS.filter(b => b.statut).map(b => b.statut!))]

    expect(statutsPresents.sort()).toEqual([...validStatuts].sort())
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-025 : sur_commande/en_reimp interdits pour nouveautés
══════════════════════════════════════════════════════ */

describe('MOCK_BOOKS — statuts interdits pour nouveautés (FLOW-RM-025)', () => {
  it('aucune nouveauté n\'a le statut sur_commande', () => {
    const nouveautesSurCommande = MOCK_BOOKS.filter(
      b => b.type === 'nouveaute' && b.statut === 'sur_commande'
    )

    expect(nouveautesSurCommande).toEqual([])
  })

  it('aucune nouveauté n\'a le statut en_reimp', () => {
    const nouveautesEnReimp = MOCK_BOOKS.filter(
      b => b.type === 'nouveaute' && b.statut === 'en_reimp'
    )

    expect(nouveautesEnReimp).toEqual([])
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-026 : à paraître n'ont pas de statut de stock
══════════════════════════════════════════════════════ */

describe('MOCK_BOOKS — à paraître sans statut (FLOW-RM-026)', () => {
  it('aucun titre à paraître n\'a de propriété statut', () => {
    const aParaitreWithStatut = MOCK_BOOKS.filter(
      b => b.type === 'a-paraitre' && b.statut !== undefined
    )

    expect(aParaitreWithStatut).toEqual([])
  })
})
