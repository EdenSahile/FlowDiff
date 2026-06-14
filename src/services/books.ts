import { supabase } from '@/lib/supabase'
import { MOCK_BOOKS, getBookById as getBookByIdLocal } from '@/data/mockBooks'
import type { Book, BookType, Universe } from '@/data/mockBooks'

type Row = Record<string, unknown>

function rowToBook(row: Row): Book {
  return {
    id:              row.id as string,
    isbn:            row.isbn as string,
    title:           row.title as string,
    authors:         row.authors as string[],
    publisher:       row.publisher as string,
    collection:      (row.collection as string) || undefined,
    universe:        row.universe as Universe,
    type:            row.type as BookType,
    price:           row.price as number,
    priceTTC:        row.priceTTC as number,
    format:          row.format as string,
    genre:           (row.genre as string) || undefined,
    language:        (row.language as string) || undefined,
    pages:           (row.pages as number) || undefined,
    publicationDate: row.publicationDate as string,
    description:     row.description as string,
    programme:       (row.programme as string) || undefined,
    fictif:          (row.fictif as boolean) || undefined,
    statut:          (row.statut as Book['statut']) || undefined,
    delaiReimp:      (row.delaiReimp as string) || undefined,
    topVente:        (row.topVente as boolean) || undefined,
    selection:       (row.selection as boolean) || undefined,
    coverUrl:        (row.cover_url as string) || undefined,
  }
}

/* ─────────────────────────────────────────
   Cache module-level : un seul fetch Supabase par session.
   Évite le re-fetch (et le flash de placeholders) à chaque navigation,
   et fiabilise getBookByIdAsync (lecture en mémoire plutôt que .single()).
───────────────────────────────────────── */
let booksCache: Book[] | null = null
let booksPromise: Promise<Book[]> | null = null

async function loadAllBooks(): Promise<Book[]> {
  if (booksCache) return booksCache
  if (booksPromise) return booksPromise
  booksPromise = (async () => {
    try {
      const { data, error } = await supabase.from('livres').select('*')
      if (error) throw error
      booksCache = (data ?? []).length > 0 ? (data ?? []).map(rowToBook) : MOCK_BOOKS
    } catch {
      booksCache = MOCK_BOOKS
    } finally {
      booksPromise = null
    }
    return booksCache!
  })()
  return booksPromise
}

export async function getAllBooksAsync(): Promise<Book[]> {
  return loadAllBooks()
}

export async function getBooksByTypeAsync(type: BookType, universe?: Universe): Promise<Book[]> {
  const all = await loadAllBooks()
  const byType = all.filter(b => b.type === type)
  return universe ? byType.filter(b => b.universe === universe) : byType
}

export async function getBookByIdAsync(id: string): Promise<Book | null> {
  const all = await loadAllBooks()
  return all.find(b => b.id === id) ?? getBookByIdLocal(id) ?? null
}

export function searchBooksLocal(books: Book[], query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return books
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    b.isbn.includes(q.replace(/[\s-]/g, '')) ||
    (b.collection?.toLowerCase().includes(q) ?? false) ||
    (b.genre?.toLowerCase().includes(q) ?? false)
  )
}
