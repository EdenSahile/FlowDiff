import type {
  BookType, StockStatut, EbookFormat, Reliure, CategorieCommerciale,
} from '@/data/mockBooks'
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

/*
  Filiation d'une reference : une edition epuisee est le plus souvent
  remplacee par une autre, qui porte un ISBN neuf. Seul le sens « remplace
  par » est stocke, dans replacedById ; le sens inverse se deduit.
*/
type BookLineage = { id: string; replacedById?: string }

export function getReplacementEdition<T extends BookLineage>(book: BookLineage, catalogue: T[]): T | null {
  if (!book.replacedById) return null
  return catalogue.find(candidate => candidate.id === book.replacedById) ?? null
}

export function getReplacedEdition<T extends BookLineage>(book: BookLineage, catalogue: T[]): T | null {
  return catalogue.find(candidate => candidate.replacedById === book.id) ?? null
}

/*
  Editions papier de la meme oeuvre, hors celles qui ont ete remplacees : une
  edition remplacee n'est plus la reference courante, elle ne s'offre donc pas
  au choix. Elle reste atteignable par son ISBN et depuis la fiche de son
  remplacant.
*/
type BookEdition = BookLineage & { workId?: string }

export function getOtherEditions<T extends BookEdition>(book: BookEdition, catalogue: T[]): T[] {
  if (!book.workId) return []
  return catalogue.filter(candidate =>
    candidate.workId === book.workId
    && candidate.id !== book.id
    && !candidate.replacedById
    && candidate.id !== book.replacedById,
  )
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
  Filtres « Format » et « Reliure » de la recherche avancée.

  Les 2 ne sont pas sur le même axe, et le métier ne les confond pas. La
  reliure dit comment le livre est fabriqué, broché ou relié. La catégorie
  commerciale dit s'il s'agit de l'édition d'origine, le grand format, ou de
  sa reprise en poche 12 à 24 mois plus tard. Un roman français est presque
  toujours grand format ET broché.

  Les 2 étaient auparavant déduits des dimensions et mélangés dans une seule
  liste de pastilles qui s'excluaient. « Broché » y désignait en réalité un
  grand format de taille moyenne, et « Relié » restait vide non parce
  qu'aucun livre n'était cartonné, mais parce qu'aucune dimension ne lui
  était attribuée. Les 2 viennent maintenant des données.
*/
const CATEGORIE_LABELS: Record<CategorieCommerciale, string> = {
  'poche':        'Poche',
  'grand format': 'Grand format',
}

const RELIURE_LABELS: Record<Reliure, string> = {
  'broche': 'Broché',
  'relie':  'Relié',
}

const DIGITAL_FORMAT = 'Numérique'

export const FORMAT_OPTIONS = [...Object.values(CATEGORIE_LABELS), DIGITAL_FORMAT]
export const RELIURE_OPTIONS = Object.values(RELIURE_LABELS)

type BookFormat = {
  categorie?: CategorieCommerciale
  reliure?: Reliure
  collection?: string
  ebooks?: unknown[]
}

/** Nom commercial de l'édition, « Poche · Babel » sur une fiche. */
export function getFormatLabel(book: BookFormat): string | null {
  return book.categorie ? CATEGORIE_LABELS[book.categorie] : null
}

export function getReliureLabel(book: BookFormat): string | null {
  return book.reliure ? RELIURE_LABELS[book.reliure] : null
}

export function matchesFormat(book: BookFormat, selected: string[]): boolean {
  if (selected.length === 0) return true
  if (selected.includes(DIGITAL_FORMAT) && book.ebooks?.length) return true
  const label = getFormatLabel(book)
  return label !== null && selected.includes(label)
}

export function matchesReliure(book: BookFormat, selected: string[]): boolean {
  if (selected.length === 0) return true
  const label = getReliureLabel(book)
  return label !== null && selected.includes(label)
}
