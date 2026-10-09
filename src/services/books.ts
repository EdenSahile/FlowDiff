import { MOCK_BOOKS, getBookById as getBookByIdLocal } from '@/data/mockBooks'
import type { Book, BookType, Universe } from '@/data/mockBooks'

/* Le catalogue vient de MOCK_BOOKS, en mémoire. Ces fonctions restent async
   parce que les pages les consomment en await/then. */
async function loadAllBooks(): Promise<Book[]> {
  return MOCK_BOOKS
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
