import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS, EBOOK_FORMATS, getCatalogueBooks, type EbookFormat, type EbookOffer } from '@/data/mockBooks'

/*
  Une offre ebook est une référence commerciale distincte du même titre : elle
  a son propre ISBN et son propre prix. Un titre vendu en PDF et en EPUB porte
  donc 2 offres, règle posée par ISBN International. Ces tests verrouillent la
  cohérence des données, pas l'affichage.
*/

const booksWithEbook = MOCK_BOOKS.filter(book => book.ebooks !== undefined)
const allOffers: EbookOffer[] = MOCK_BOOKS.flatMap(book => book.ebooks ?? [])

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

  it('un titre qui declare des offres en declare au moins une', () => {
    const listesVides = booksWithEbook.filter(book => book.ebooks!.length === 0)

    expect(listesVides).toEqual([])
  })

  it('chaque offre annonce un format connu', () => {
    const offresAuFormatInconnu = allOffers.filter(
      offer => !EBOOK_FORMATS.includes(offer.format),
    )

    expect(offresAuFormatInconnu).toEqual([])
  })

  it('les 2 formats sont représentés dans les données', () => {
    const formatsPresents = [...new Set(allOffers.map(offer => offer.format))]

    expect(formatsPresents.sort()).toEqual([...EBOOK_FORMATS].sort())
  })

  /*
    Un titre vendu en PDF et en EPUB porte 2 references distinctes, pas une
    offre unique qui reunirait les 2 fichiers sous un seul numero. C'est la
    regle d'ISBN International, suivie par les editeurs francais : une fiche
    de L'Harmattan porte un EAN13 papier, un EAN ePub et un EAN PDF.
  */
  it('un même titre ne déclare jamais 2 fois le même format', () => {
    const titresAvecDoublon = booksWithEbook.filter(book => {
      const formats = book.ebooks!.map(offer => offer.format)
      return new Set(formats).size !== formats.length
    })

    expect(titresAvecDoublon).toEqual([])
  })

  it('un titre disponible dans les 2 formats porte 2 ISBN distincts', () => {
    const titresMultiFormats = booksWithEbook.filter(book => book.ebooks!.length > 1)

    expect(titresMultiFormats.length).toBeGreaterThan(0)
    titresMultiFormats.forEach(book => {
      const isbns = book.ebooks!.map(offer => offer.isbn)
      expect(new Set(isbns).size).toBe(isbns.length)
    })
  })

  it('l\'ISBN d\'une offre diffère de celui du papier', () => {
    const offresAvecMemeIsbn = booksWithEbook.filter(
      book => book.ebooks!.some(offer => offer.isbn === book.isbn),
    )

    expect(offresAvecMemeIsbn).toEqual([])
  })

  it('chaque ISBN d\'ebook compte 13 chiffres', () => {
    const isbnsMalFormes = allOffers
      .map(offer => offer.isbn)
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
      ...catalogue.flatMap(book => (book.ebooks ?? []).map(offer => offer.isbn)),
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
    const isbnsAvecCleValide = allOffers
      .map(offer => offer.isbn)
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
    const horsPlage = allOffers
      .map(offer => offer.isbn)
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

  it('le prix de chaque offre est strictement positif et inférieur au papier', () => {
    const prixIncoherents = booksWithEbook.filter(
      book => book.ebooks!.some(offer => offer.priceTTC <= 0 || offer.priceTTC >= book.priceTTC),
    )

    expect(prixIncoherents).toEqual([])
  })

  it('aucun titre à paraître ne propose d\'ebook, faute de date de mise en vente', () => {
    const aParaitreAvecEbook = booksWithEbook.filter(book => book.type === 'a-paraitre')

    expect(aParaitreAvecEbook).toEqual([])
  })
})

/*
  Une oeuvre peut avoir plusieurs editions papier, reliees par workId. Chacune
  est un titre du catalogue a part entiere : le poche n'est pas une variante
  de la fiche du grand format, c'est une ligne du FEL avec son ISBN, sa
  collection, sa parution et son prix.
*/
describe('éditions d\'une même œuvre', () => {
  const editionsParOeuvre = MOCK_BOOKS.reduce<Record<string, typeof MOCK_BOOKS>>((acc, book) => {
    if (book.workId) (acc[book.workId] ??= []).push(book)
    return acc
  }, {})
  const oeuvres = Object.values(editionsParOeuvre)

  it('au moins une œuvre existe en plusieurs éditions', () => {
    expect(oeuvres.filter(editions => editions.length > 1).length).toBeGreaterThan(0)
  })

  it('un workId ne relie jamais une seule édition', () => {
    const oeuvresSolitaires = oeuvres.filter(editions => editions.length < 2)

    expect(oeuvresSolitaires).toEqual([])
  })

  it('les éditions d\'une œuvre portent le même titre et le même auteur', () => {
    oeuvres.forEach(editions => {
      const titres = new Set(editions.map(book => book.title))
      const auteurs = new Set(editions.map(book => book.authors.join(', ')))

      expect(titres.size).toBe(1)
      expect(auteurs.size).toBe(1)
    })
  })

  it('chaque édition porte son propre ISBN', () => {
    oeuvres.forEach(editions => {
      const isbns = editions.map(book => book.isbn)

      expect(new Set(isbns).size).toBe(isbns.length)
    })
  })

  /* Le poche paraît après le grand format, et moins cher. */
  it('l\'édition de poche est postérieure et moins chère que le grand format', () => {
    oeuvres.forEach(editions => {
      const poche = editions.find(book => book.format === '115 x 175 mm')
      const grandFormat = editions.find(book => book.format !== '115 x 175 mm')
      if (!poche || !grandFormat) return

      expect(poche.publicationDate > grandFormat.publicationDate).toBe(true)
      expect(poche.priceTTC).toBeLessThan(grandFormat.priceTTC)
    })
  })
})

/*
  Une edition epuisee est le plus souvent remplacee par une autre, qui porte
  un ISBN neuf. Ces tests verrouillent la coherence du lien.
*/
describe('éditions remplacées du catalogue', () => {
  const catalogue = getCatalogueBooks()
  const remplacees = catalogue.filter(book => book.replacedById)

  it('au moins une édition du catalogue est remplacée', () => {
    expect(remplacees.length).toBeGreaterThan(0)
  })

  it('chaque remplaçant déclaré existe au catalogue', () => {
    const cibleIntrouvable = remplacees.filter(
      book => !catalogue.some(candidate => candidate.id === book.replacedById),
    )

    expect(cibleIntrouvable).toEqual([])
  })

  it('une édition remplacée est épuisée', () => {
    const encoreDisponibles = remplacees.filter(book => book.statut !== 'epuise')

    expect(encoreDisponibles).toEqual([])
  })

  it('une édition ne se remplace jamais elle-même', () => {
    const boucles = remplacees.filter(book => book.replacedById === book.id)

    expect(boucles).toEqual([])
  })

  it('un remplaçant n\'est jamais lui-même remplacé par son prédécesseur', () => {
    const allerRetours = remplacees.filter(book => {
      const cible = catalogue.find(candidate => candidate.id === book.replacedById)
      return cible?.replacedById === book.id
    })

    expect(allerRetours).toEqual([])
  })

  it('2 éditions ne sont jamais remplacées par la même', () => {
    const cibles = remplacees.map(book => book.replacedById)

    expect(new Set(cibles).size).toBe(cibles.length)
  })

  it('les 2 éditions d\'une filiation portent le même titre', () => {
    remplacees.forEach(book => {
      const cible = catalogue.find(candidate => candidate.id === book.replacedById)

      expect(cible!.title).toBe(book.title)
    })
  })
})

describe('EBOOK_FORMATS', () => {
  it('liste les 2 formats de fichier, sans combinaison des deux', () => {
    const expectedFormats: EbookFormat[] = ['PDF', 'EPUB']

    expect([...EBOOK_FORMATS]).toEqual(expectedFormats)
  })
})
