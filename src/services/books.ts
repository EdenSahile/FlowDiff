import { getCatalogueBookById, getCatalogueBooks } from '@/data/mockBooks'
import type { Book, BookType, Universe } from '@/data/mockBooks'
import { matchesIsbn } from '@/lib/bookUtils'

/* Le catalogue vient de MOCK_BOOKS, en mémoire. Ces fonctions restent async
   parce que les pages les consomment en await/then. */
async function loadAllBooks(referenceDate?: Date): Promise<Book[]> {
  return getCatalogueBooks(referenceDate)
}

export async function getAllBooksAsync(referenceDate?: Date): Promise<Book[]> {
  return loadAllBooks(referenceDate)
}

export async function getBooksByTypeAsync(type: BookType, universe?: Universe, referenceDate?: Date): Promise<Book[]> {
  const all = await loadAllBooks(referenceDate)
  const byType = all.filter(b => b.type === type)
  return universe ? byType.filter(b => b.universe === universe) : byType
}

export async function getBookByIdAsync(id: string, referenceDate?: Date): Promise<Book | null> {
  return getCatalogueBookById(id, referenceDate) ?? null
}

export function searchBooksLocal(books: Book[], query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return books
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    matchesIsbn(b, q) ||
    (b.collection?.toLowerCase().includes(q) ?? false) ||
    (b.genre?.toLowerCase().includes(q) ?? false)
  )
}
