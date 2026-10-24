import { describe, it, expect } from 'vitest'
import { MOCK_BOOKS, EBOOK_FORMATS } from '@/data/mockBooks'
import type { BookType, Universe, StockStatut } from '@/data/mockBooks'
import {
  getPurchaseAvailability, getTypeCommande, getEbookLabel, hasExactIsbn, matchesIsbn, matchesFormat, matchesReliure,
  getReplacementEdition, getReplacedEdition, getOtherEditions,
} from '@/lib/bookUtils'

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

  /* Un titre vendu dans les 2 formats porte 2 offres distinctes, donc 2
     boutons, jamais un libellé qui réunirait les 2 formats. */
  it('ne connaît aucun libellé réunissant les 2 formats', () => {
    expect(EBOOK_FORMATS).toEqual(['PDF', 'EPUB'])
  })
})

/* ══════════════════════════════════════════════════════
   Recherche par ISBN : l'ebook désigne le même titre
══════════════════════════════════════════════════════ */

describe('hasExactIsbn', () => {
  const bookWithEbook = {
    isbn: '9782501172097',
    ebooks: [{ isbn: '9789990030022', format: 'PDF' as const, priceTTC: 9.99 }],
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
    ebooks: [{ isbn: '9789990030022', format: 'PDF' as const, priceTTC: 9.99 }],
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
  const poche      = { categorie: 'poche' as const,        reliure: 'broche' as const }
  const grandFormat = { categorie: 'grand format' as const, reliure: 'broche' as const }
  const manga      = { reliure: 'broche' as const }  // tankobon : ni poche ni grand format
  const avecEbook  = {
    categorie: 'grand format' as const,
    reliure: 'broche' as const,
    ebooks: [{ isbn: '9789990030011', format: 'PDF' as const, priceTTC: 9.99 }],
  }

  it('ne filtre rien quand aucun format n\'est coché', () => {
    expect(matchesFormat(poche, [])).toBe(true)
    expect(matchesFormat(grandFormat, [])).toBe(true)
  })

  it('distingue le poche du grand format', () => {
    expect(matchesFormat(poche, ['Poche'])).toBe(true)
    expect(matchesFormat(grandFormat, ['Poche'])).toBe(false)
    expect(matchesFormat(grandFormat, ['Grand format'])).toBe(true)
  })

  /* La reliure est un autre axe : un broché peut être poche ou grand format,
     « Broché » n'est donc pas une réponse à la question du format. */
  it('ne connaît pas la reliure comme un format', () => {
    expect(matchesFormat(grandFormat, ['Broché'])).toBe(false)
  })

  it('accepte un titre si l\'un des formats cochés correspond', () => {
    expect(matchesFormat(poche, ['Grand format', 'Poche'])).toBe(true)
  })

  it('ne retient en numérique que les titres ayant une offre ebook', () => {
    expect(matchesFormat(avecEbook, ['Numérique'])).toBe(true)
    expect(matchesFormat(grandFormat, ['Numérique'])).toBe(false)
  })

  it('accepte un titre numérique croisé avec son format papier', () => {
    expect(matchesFormat(avecEbook, ['Numérique', 'Poche'])).toBe(true)
  })

  /* Un manga ne se vend ni en poche ni en grand format : il ne répond à
     aucune des 2 pastilles plutôt que d'être rangé de force dans l'une. */
  it('ne retient un tankobon dans aucune des 2 catégories', () => {
    expect(matchesFormat(manga, ['Poche'])).toBe(false)
    expect(matchesFormat(manga, ['Grand format'])).toBe(false)
  })
})

describe('matchesReliure', () => {
  const broche = { categorie: 'grand format' as const, reliure: 'broche' as const }
  const relie  = { categorie: 'grand format' as const, reliure: 'relie' as const }

  it('ne filtre rien quand aucune reliure n\'est cochée', () => {
    expect(matchesReliure(broche, [])).toBe(true)
  })

  it('distingue le broché du relié', () => {
    expect(matchesReliure(broche, ['Broché'])).toBe(true)
    expect(matchesReliure(relie, ['Broché'])).toBe(false)
    expect(matchesReliure(relie, ['Relié'])).toBe(true)
  })

  /* Les 2 axes se cumulent : un grand format relié répond aux deux. */
  it('se croise avec le format sans l\'exclure', () => {
    expect(matchesFormat(relie, ['Grand format'])).toBe(true)
    expect(matchesReliure(relie, ['Relié'])).toBe(true)
  })

  it('écarte un titre dont la reliure n\'est pas renseignée', () => {
    expect(matchesReliure({ categorie: 'poche' as const }, ['Broché'])).toBe(false)
  })
})

/* ══════════════════════════════════════════════════════
   Filiation d'une référence : une édition épuisée est
   remplacée par une autre, qui porte un ISBN neuf
══════════════════════════════════════════════════════ */

describe('éditions remplacées', () => {
  const ancienne = { id: 'ed-2021', workId: 'w-1', replacedById: 'ed-2024' }
  const nouvelle = { id: 'ed-2024', workId: 'w-1' }
  const broche   = { id: 'ed-broche', workId: 'w-1' }
  const autreOeuvre = { id: 'ed-autre', workId: 'w-2' }
  const catalogue = [ancienne, nouvelle, broche, autreOeuvre]

  it('donne l\'édition qui remplace celle-ci', () => {
    expect(getReplacementEdition(ancienne, catalogue)).toBe(nouvelle)
  })

  it('ne donne rien pour une édition qui n\'est pas remplacée', () => {
    expect(getReplacementEdition(nouvelle, catalogue)).toBe(null)
  })

  it('retrouve l\'édition précédente sans qu\'elle soit déclarée sur le remplaçant', () => {
    expect(getReplacedEdition(nouvelle, catalogue)).toBe(ancienne)
  })

  it('ne donne rien quand aucune édition ne désigne celle-ci', () => {
    expect(getReplacedEdition(broche, catalogue)).toBe(null)
  })

  it('ne donne rien si le remplaçant déclaré est absent du catalogue', () => {
    const orpheline = { id: 'ed-x', replacedById: 'ed-inexistante' }

    expect(getReplacementEdition(orpheline, catalogue)).toBe(null)
  })
})

describe('getOtherEditions', () => {
  const ancienne = { id: 'ed-2021', workId: 'w-1', replacedById: 'ed-2024' }
  const nouvelle = { id: 'ed-2024', workId: 'w-1' }
  const broche   = { id: 'ed-broche', workId: 'w-1' }
  const autreOeuvre = { id: 'ed-autre', workId: 'w-2' }
  const catalogue = [ancienne, nouvelle, broche, autreOeuvre]

  it('liste les éditions de la même œuvre, sauf elle-même', () => {
    expect(getOtherEditions(broche, catalogue)).toEqual([nouvelle])
  })

  /* Une édition remplacée n'est plus la référence courante : elle ne
     s'offre pas au choix, et reste atteignable depuis son remplaçant. */
  it('écarte les éditions remplacées', () => {
    expect(getOtherEditions(nouvelle, catalogue)).toEqual([broche])
  })

  it('écarte le remplaçant de la liste de l\'édition remplacée', () => {
    expect(getOtherEditions(ancienne, catalogue)).toEqual([broche])
  })

  it('ne retient aucune édition pour un titre sans œuvre déclarée', () => {
    expect(getOtherEditions({ id: 'seul' }, catalogue)).toEqual([])
  })
})
