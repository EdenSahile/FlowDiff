import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS } from '@/data/mockBooks'
import type { BookType, Universe, StockStatut } from '@/data/mockBooks'
import { getPurchaseAvailability, getTypeCommande, getEbookLabel, hasExactIsbn, matchesIsbn, matchesFormat } from '@/lib/bookUtils'

describe('getPurchaseAvailability', () => {
  it('autorise l’ajout direct d’un titre à paraître par son unique bouton', () => {
    const availability = getPurchaseAvailability('a-paraitre')

    expect(availability.isAParaitre).toBe(true)
    expect(availability.canAddToCart).toBe(true)
    expect(availability.showStandardOrder).toBe(false)
    expect(availability.isEpuise).toBe(false)
  })

  it('maintient le bouton standard pour un titre disponible', () => {
    expect(getPurchaseAvailability('fonds', 'disponible').showStandardOrder).toBe(true)
  })
})

/* ══════════════════════════════════════════════════════
   DEC-001 : le type de titre devient le type de commande
   porté par la ligne de commande
══════════════════════════════════════════════════════ */

describe('getTypeCommande', () => {
  it('traduit un titre à paraître en commande « A paraître »', () => {
    expect(getTypeCommande('a-paraitre')).toBe('A paraître')
  })

  it('traduit une nouveauté en commande « Nouveauté »', () => {
    expect(getTypeCommande('nouveaute')).toBe('Nouveauté')
  })

  it('traduit un titre de fonds en commande « Fonds »', () => {
    expect(getTypeCommande('fonds')).toBe('Fonds')
  })

  it('couvre les 3 types de titres du catalogue, sans valeur indéfinie', () => {
    const typesCommandeDuCatalogue = [...new Set(MOCK_BOOKS.map(b => getTypeCommande(b.type)))]

    expect(typesCommandeDuCatalogue.sort()).toEqual(['A paraître', 'Fonds', 'Nouveauté'])
  })
})

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

/* ══════════════════════════════════════════════════════
   Offre ebook : libellé du bouton de format
══════════════════════════════════════════════════════ */

describe('getEbookLabel', () => {
  it('annonce le format PDF en minuscules entre parenthèses', () => {
    expect(getEbookLabel('PDF')).toBe('Ebook (pdf)')
  })

  it('annonce le format EPUB en minuscules entre parenthèses', () => {
    expect(getEbookLabel('EPUB')).toBe('Ebook (epub)')
  })

  it('annonce les 2 formats quand l\'ebook est disponible dans les deux', () => {
    expect(getEbookLabel('PDF+EPUB')).toBe('Ebook (pdf+epub)')
  })
})

/* ══════════════════════════════════════════════════════
   Recherche par ISBN : l'ebook désigne le même titre
══════════════════════════════════════════════════════ */

describe('hasExactIsbn', () => {
  const bookWithEbook = {
    isbn: '9782501172097',
    ebook: { isbn: '9789990030022', format: 'PDF' as const, priceTTC: 9.99 },
  }
  const bookWithoutEbook = { isbn: '9782330108724' }

  it('reconnaît l\'ISBN du papier', () => {
    expect(hasExactIsbn(bookWithEbook, '9782501172097')).toBe(true)
  })

  it('reconnaît l\'ISBN de l\'ebook, qui désigne le même titre', () => {
    expect(hasExactIsbn(bookWithEbook, '9789990030022')).toBe(true)
  })

  it('ignore les espaces et les tirets de la saisie', () => {
    expect(hasExactIsbn(bookWithEbook, ' 978-99900-30022 ')).toBe(true)
  })

  it('refuse un ISBN qui n\'est ni le papier ni l\'ebook', () => {
    expect(hasExactIsbn(bookWithEbook, '9780000000000')).toBe(false)
  })

  it('refuse un ISBN partiel, la correspondance est exacte', () => {
    expect(hasExactIsbn(bookWithEbook, '978999003')).toBe(false)
  })

  it('ne plante pas sur un titre sans ebook', () => {
    expect(hasExactIsbn(bookWithoutEbook, '9782330108724')).toBe(true)
    expect(hasExactIsbn(bookWithoutEbook, '9789990030022')).toBe(false)
  })

  it('refuse une recherche vide', () => {
    expect(hasExactIsbn(bookWithEbook, '   ')).toBe(false)
  })
})

describe('matchesIsbn', () => {
  const bookWithEbook = {
    isbn: '9782501172097',
    ebook: { isbn: '9789990030022', format: 'PDF' as const, priceTTC: 9.99 },
  }

  it('accepte un début d\'ISBN papier', () => {
    expect(matchesIsbn(bookWithEbook, '97825011')).toBe(true)
  })

  it('accepte un début d\'ISBN ebook', () => {
    expect(matchesIsbn(bookWithEbook, '9789990030')).toBe(true)
  })

  it('refuse une suite de chiffres absente des deux', () => {
    expect(matchesIsbn(bookWithEbook, '1111111')).toBe(false)
  })
})

/* ══════════════════════════════════════════════════════
   Filtre « Format » de la recherche avancée
══════════════════════════════════════════════════════ */

describe('matchesFormat', () => {
  const poche      = { format: '115 x 175 mm' }
  const broche     = { format: '155 x 235 mm' }
  const grand      = { format: '220 x 290 mm' }
  const avecEbook  = { format: '155 x 235 mm', ebook: { isbn: '9789990030011', format: 'PDF' as const, priceTTC: 9.99 } }

  it('ne filtre rien quand aucun format n\'est coché', () => {
    expect(matchesFormat(poche, [])).toBe(true)
    expect(matchesFormat(grand, [])).toBe(true)
  })

  it('reconnaît un poche à ses dimensions', () => {
    expect(matchesFormat(poche, ['Poche'])).toBe(true)
    expect(matchesFormat(broche, ['Poche'])).toBe(false)
  })

  it('reconnaît un broché et un grand format à leurs dimensions', () => {
    expect(matchesFormat(broche, ['Broché'])).toBe(true)
    expect(matchesFormat(grand, ['Grand format'])).toBe(true)
    expect(matchesFormat(grand, ['Broché'])).toBe(false)
  })

  it('accepte un titre si l\'un des formats cochés correspond', () => {
    expect(matchesFormat(poche, ['Broché', 'Poche'])).toBe(true)
  })

  it('ne retient en numérique que les titres ayant une offre ebook', () => {
    expect(matchesFormat(avecEbook, ['Numérique'])).toBe(true)
    expect(matchesFormat(broche, ['Numérique'])).toBe(false)
  })

  it('accepte un titre numérique croisé avec son format papier', () => {
    expect(matchesFormat(avecEbook, ['Numérique', 'Poche'])).toBe(true)
  })

  it('refuse un titre dont les dimensions sont inconnues', () => {
    expect(matchesFormat({ format: '999 x 999 mm' }, ['Poche'])).toBe(false)
  })
})
