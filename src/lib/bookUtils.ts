import type { BookType, StockStatut, EbookFormat } from '@/data/mockBooks'
import type { TypeCommande } from '@/data/mockOrders'

const TYPE_COMMANDE_BY_BOOK_TYPE: Record<BookType, TypeCommande> = {
  'a-paraitre': 'A paraître',
  'nouveaute':  'Nouveauté',
  'fonds':      'Fonds',
}

export function getTypeCommande(type: BookType): TypeCommande {
  return TYPE_COMMANDE_BY_BOOK_TYPE[type]
}

/*
  Libellé du choix de format, à côté de « Broché » et « Poche ». Le format
  s'écrit en minuscules entre parenthèses, les capitales attirant l'oeil plus
  que le mot « Ebook » lui-même.
*/
export function getEbookLabel(format: EbookFormat): string {
  return `Ebook (${format.toLowerCase()})`
}

/*
  Recherche par ISBN.

  Un titre porte 2 ISBN quand il existe en numérique, celui du papier et celui
  de l'ebook, et les deux désignent le même ouvrage. Un libraire qui saisit
  l'un ou l'autre doit donc tomber sur la même fiche.

  Le type d'entrée est volontairement minimal plutôt que `Book` : ces
  fonctions n'ont besoin que des ISBN, et plusieurs appelants manipulent des
  objets partiels.
*/
type BookIsbns = { isbn: string; ebooks?: { isbn: string }[] }

function normalizeIsbn(value: string): string {
  return value.replace(/[\s-]/g, '')
}

function isbnsOf(book: BookIsbns): string[] {
  return [book.isbn, ...(book.ebooks ?? []).map(offer => offer.isbn)]
}

/** Correspondance exacte, pour la recherche d'un ISBN saisi en entier. */
export function hasExactIsbn(book: BookIsbns, query: string): boolean {
  const normalized = normalizeIsbn(query.trim())
  if (!normalized) return false
  return isbnsOf(book).some(isbn => normalizeIsbn(isbn) === normalized)
}

/** Correspondance partielle, pour la recherche au fil de la frappe. */
export function matchesIsbn(book: BookIsbns, query: string): boolean {
  const normalized = normalizeIsbn(query.trim())
  if (!normalized) return false
  return isbnsOf(book).some(isbn => normalizeIsbn(isbn).includes(normalized))
}

export function getPurchaseAvailability(type: BookType, statut?: StockStatut) {
  const isAParaitre = type === 'a-paraitre'
  const isEpuise = statut === 'epuise' || statut === 'rupture'

  return {
    isAParaitre,
    isEpuise,
    needsConfirm: statut === 'sur_commande' || statut === 'en_reimp',
    canAddToCart: !isEpuise,
    showStandardOrder: !isAParaitre && !isEpuise,
  }
}

/*
  Filtre « Format » de la recherche avancée.

  Le champ `format` d'un livre contient ses dimensions, pas un nom de format
  commercial. Les pastilles « Poche », « Broché » et « Grand format » ne
  pouvaient donc correspondre à aucun titre, et restaient toutes grisées.
  Le format se déduit des dimensions, seule donnée disponible.

  « Numérique » ne regarde pas les dimensions : il retient les titres qui
  proposent une offre ebook.
*/
const FORMAT_BY_DIMENSIONS: Record<string, string> = {
  '115 x 175 mm': 'Poche',
  '145 x 195 mm': 'Broché',
  '145 x 215 mm': 'Broché',
  '155 x 235 mm': 'Broché',
  '190 x 240 mm': 'Grand format',
  '210 x 280 mm': 'Grand format',
  '220 x 290 mm': 'Grand format',
}

const DIGITAL_FORMAT = 'Numérique'

type BookFormat = { format?: string; ebooks?: unknown[] }

export function getFormatLabel(dimensions: string | undefined): string | null {
  return dimensions ? FORMAT_BY_DIMENSIONS[dimensions] ?? null : null
}

export function matchesFormat(book: BookFormat, selected: string[]): boolean {
  if (selected.length === 0) return true
  if (selected.includes(DIGITAL_FORMAT) && book.ebooks?.length) return true
  const label = getFormatLabel(book.format)
  return label !== null && selected.includes(label)
}
