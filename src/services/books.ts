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
  }
}

export async function getAllBooksAsync(): Promise<Book[]> {
  const { data, error } = await supabase.from('livres').select('*')
  if (error) return MOCK_BOOKS
  return (data ?? []).length > 0 ? (data ?? []).map(rowToBook) : MOCK_BOOKS
}

export async function getBooksByTypeAsync(type: BookType, universe?: Universe): Promise<Book[]> {
  const base = supabase.from('livres').select('*').eq('type', type)
  const query = universe ? base.eq('universe', universe) : base
  const { data, error } = await query
  if (error) {
    const fallback = MOCK_BOOKS.filter(b => b.type === type)
    return universe ? fallback.filter(b => b.universe === universe) : fallback
  }
  return (data ?? []).map(rowToBook)
}

export async function getBookByIdAsync(id: string): Promise<Book | null> {
  const { data, error } = await supabase.from('livres').select('*').eq('id', id).single()
  if (error) return getBookByIdLocal(id) ?? null
  return rowToBook(data as Row)
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
