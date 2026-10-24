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
type BookIsbns = { isbn: string; ebook?: { isbn: string } }

function normalizeIsbn(value: string): string {
  return value.replace(/[\s-]/g, '')
}

function isbnsOf(book: BookIsbns): string[] {
  return book.ebook ? [book.isbn, book.ebook.isbn] : [book.isbn]
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
