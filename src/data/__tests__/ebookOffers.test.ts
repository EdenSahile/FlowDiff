import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS, EBOOK_FORMATS, type EbookFormat } from '@/data/mockBooks'

/*
  Une offre ebook est une 2e référence commerciale du même titre : elle a son
  propre ISBN et son propre prix. Ces tests verrouillent la cohérence des
  données, pas l'affichage.
*/

const booksWithEbook = MOCK_BOOKS.filter(book => book.ebook !== undefined)

describe('offres ebook du catalogue', () => {
  it('au moins un titre propose une version ebook', () => {
    expect(booksWithEbook.length).toBeGreaterThan(0)
  })

  it('chaque offre annonce un format connu', () => {
    const offresAuFormatInconnu = booksWithEbook.filter(
      book => !EBOOK_FORMATS.includes(book.ebook!.format),
    )

    expect(offresAuFormatInconnu).toEqual([])
  })

  it('les 3 formats sont représentés dans les données', () => {
    const formatsPresents = [...new Set(booksWithEbook.map(book => book.ebook!.format))]

    expect(formatsPresents.sort()).toEqual([...EBOOK_FORMATS].sort())
  })

  it('l\'ISBN de l\'ebook diffère de celui du papier', () => {
    const offresAvecMemeIsbn = booksWithEbook.filter(book => book.ebook!.isbn === book.isbn)

    expect(offresAvecMemeIsbn).toEqual([])
  })

  it('chaque ISBN d\'ebook compte 13 chiffres', () => {
    const isbnsMalFormes = booksWithEbook
      .map(book => book.ebook!.isbn)
      .filter(isbn => !/^\d{13}$/.test(isbn))

    expect(isbnsMalFormes).toEqual([])
  })

  it('aucun ISBN n\'est utilisé deux fois dans le catalogue, papier et ebook confondus', () => {
    const tousLesIsbns = [
      ...MOCK_BOOKS.map(book => book.isbn),
      ...booksWithEbook.map(book => book.ebook!.isbn),
    ]

    expect(new Set(tousLesIsbns).size).toBe(tousLesIsbns.length)
  })

  it('le prix de l\'ebook est strictement positif et inférieur au papier', () => {
    const prixIncoherents = booksWithEbook.filter(
      book => book.ebook!.priceTTC <= 0 || book.ebook!.priceTTC >= book.priceTTC,
    )

    expect(prixIncoherents).toEqual([])
  })

  it('aucun titre à paraître ne propose d\'ebook, faute de date de mise en vente', () => {
    const aParaitreAvecEbook = booksWithEbook.filter(book => book.type === 'a-paraitre')

    expect(aParaitreAvecEbook).toEqual([])
  })
})

describe('EBOOK_FORMATS', () => {
  it('liste exactement les 3 combinaisons de formats', () => {
    const expectedFormats: EbookFormat[] = ['PDF', 'EPUB', 'PDF+EPUB']

    expect([...EBOOK_FORMATS]).toEqual(expectedFormats)
  })
})
