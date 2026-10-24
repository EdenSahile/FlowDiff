import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS, EBOOK_FORMATS, getCatalogueBooks, type EbookFormat } from '@/data/mockBooks'

/*
  Une offre ebook est une 2e référence commerciale du même titre : elle a son
  propre ISBN et son propre prix. Ces tests verrouillent la cohérence des
  données, pas l'affichage.
*/

const booksWithEbook = MOCK_BOOKS.filter(book => book.ebook !== undefined)

/*
  Les numéros inventés du projet, titres de démonstration comme offres ebook,
  vivent tous dans la plage 978-99900-0, qui n'est attribuée à aucun éditeur.
*/
const FICTIVE_ISBN_PREFIX = '97899900'

/* Clé de contrôle d'un ISBN-13 : somme pondérée 1-3 des 12 premiers chiffres. */
function computeIsbn13CheckDigit(first12: string): string {
  const sum = [...first12].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  )
  return String((10 - (sum % 10)) % 10)
}

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

  /*
    Le catalogue réel contient, en plus de MOCK_BOOKS, des titres à paraître
    de relève injectés par getCatalogueBooks. Les ignorer avait laissé passer
    une collision entre un ISBN d'ebook et l'un de ces titres.
  */
  it('aucun ISBN n\'est utilisé deux fois dans tout le catalogue servi', () => {
    const catalogue = getCatalogueBooks()
    const tousLesIsbns = [
      ...catalogue.map(book => book.isbn),
      ...catalogue.filter(book => book.ebook).map(book => book.ebook!.isbn),
    ]

    const doublons = tousLesIsbns.filter((isbn, i) => tousLesIsbns.indexOf(isbn) !== i)

    expect([...new Set(doublons)]).toEqual([])
  })

  /*
    Les ISBN papier du catalogue sont réels. Ceux des ebooks sont inventés
    pour la démonstration, et doivent le rester : une clé de contrôle fausse
    garantit qu'aucun livre réel ne porte ce numéro. Ce test interdit de les
    « corriger » en ISBN valides, qui pourraient désigner un vrai ouvrage.
  */
  it('les ISBN d\'ebook sont volontairement invalides, donc fictifs', () => {
    const isbnsAvecCleValide = booksWithEbook
      .map(book => book.ebook!.isbn)
      .filter(isbn => isbn[12] === computeIsbn13CheckDigit(isbn.slice(0, 12)))

    expect(isbnsAvecCleValide).toEqual([])
  })

  /*
    Les titres a paraitre de releve ne sont pas dans MOCK_BOOKS. Deux d'entre
    eux portaient le meme ISBN sans que rien ne le signale, le programme de
    releve ne s'affichant que si aucun titre date n'est a paraitre.
  */
  it('les titres de releve portent chacun un ISBN distinct', () => {
    const releve = getCatalogueBooks().filter(book => book.id.startsWith('rolling-'))
    const isbns = releve.map(book => book.isbn)

    expect(new Set(isbns).size).toBe(isbns.length)
  })

  it('les ISBN d\'ebook vivent dans la plage reservee aux numeros inventes', () => {
    const horsPlage = booksWithEbook
      .map(book => book.ebook!.isbn)
      .filter(isbn => !isbn.startsWith(FICTIVE_ISBN_PREFIX))

    expect(horsPlage).toEqual([])
  })

  it('les ISBN papier des titres reels portent une cle de controle valide', () => {
    const titresReels = MOCK_BOOKS.filter(book => !book.fictif)
    const clesInvalides = titresReels
      .map(book => book.isbn)
      .filter(isbn => isbn[12] !== computeIsbn13CheckDigit(isbn.slice(0, 12)))

    expect(clesInvalides).toEqual([])
  })

  it('les seuls ISBN papier a cle invalide sont ceux des titres marques fictifs', () => {
    const clesInvalides = MOCK_BOOKS
      .filter(book => book.isbn[12] !== computeIsbn13CheckDigit(book.isbn.slice(0, 12)))

    expect(clesInvalides.every(book => book.fictif === true)).toBe(true)
    expect(clesInvalides.every(book => book.isbn.startsWith(FICTIVE_ISBN_PREFIX))).toBe(true)
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
