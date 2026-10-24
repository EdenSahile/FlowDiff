import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FondsPage } from '@/pages/fonds/FondsPage'
import { NouveautesPage } from '@/pages/nouveautes/NouveautesPage'
import { theme } from '@/lib/theme'
import type { Book } from '@/data/mockBooks'

const mockGetBooksByTypeAsync = vi.fn()

vi.mock('@/services/books', () => ({
  getBooksByTypeAsync: (...args: unknown[]) => mockGetBooksByTypeAsync(...args),
  searchBooksLocal: (books: Book[], query: string) => {
    const normalized = query.toLocaleLowerCase('fr-FR').trim()
    return books.filter(book =>
      [book.title, ...book.authors, book.isbn, book.publisher]
        .join(' ')
        .toLocaleLowerCase('fr-FR')
        .includes(normalized),
    )
  },
}))

vi.mock('@/components/catalogue/BookCard', () => ({
  BookCard: ({ book }: { book: Book }) => <h2>{book.title}</h2>,
}))

vi.mock('@/contexts/NotificationsContext', () => ({
  useNotifications: () => ({ markAsRead: vi.fn() }),
}))

vi.mock('@/hooks/useRefetchOnFocus', () => ({ useRefetchOnFocus: () => undefined }))

const books: Book[] = [
  {
    id: 'fonds-alpha', isbn: '9780000000001', title: 'Alpha', authors: ['Alice'], publisher: 'Éditions A',
    universe: 'Littérature', type: 'fonds', price: 8, priceTTC: 10, format: 'Poche', publicationDate: '2020-01-01', description: '', statut: 'disponible',
  },
  {
    id: 'fonds-zebre', isbn: '9780000000002', title: 'Zèbre', authors: ['Zoé'], publisher: 'Éditions Z',
    universe: 'Littérature', type: 'fonds', price: 16, priceTTC: 20, format: 'Broché', publicationDate: '2020-01-01', description: '', statut: 'epuise',
  },
  {
    id: 'fonds-manga', isbn: '9780000000003', title: 'Manga', authors: ['Mina'], publisher: 'Éditions M',
    universe: 'BD/Mangas', type: 'fonds', price: 4, priceTTC: 5, format: 'Poche', publicationDate: '2020-01-01', description: '', statut: 'disponible',
  },
]

function renderPage(page: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{page}</MemoryRouter>
    </ThemeProvider>,
  )
}

function resultCount(count: number) {
  return screen.getByText((_, element) =>
    element?.tagName === 'P' && element.textContent?.includes(`${count} titre`) === true,
  )
}

beforeEach(() => {
  mockGetBooksByTypeAsync.mockImplementation(async (type: string) =>
    books.map(book => ({ ...book, type: type === 'nouveaute' ? 'nouveaute' : 'fonds' })),
  )
})

describe('catalogues : recherche, filtres et tri', () => {
  it('combine recherche, filtre et remise à zéro dans Fonds', async () => {
    renderPage(<FondsPage />)
    await screen.findByRole('heading', { name: 'Alpha', level: 2 })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Rechercher dans les fonds' }), { target: { value: 'zèbre' } })
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Zèbre', level: 2 })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: 'Alpha', level: 2 })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Littérature' }))
    fireEvent.click(screen.getByRole('button', { name: 'Épuisé' }))
    expect(resultCount(1)).toBeInTheDocument()

    const [allUniverses, allAvailability] = screen.getAllByRole('button', { name: 'Tous' })
    fireEvent.click(allUniverses)
    fireEvent.click(allAvailability)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Rechercher dans les fonds' }), { target: { value: '' } })
    await waitFor(() => expect(resultCount(3)).toBeInTheDocument())
  })

  it('trie les Nouveautés par prix et conserve le filtre d’univers', async () => {
    renderPage(<NouveautesPage />)
    await screen.findByRole('heading', { name: 'Alpha', level: 2 })

    fireEvent.click(screen.getByRole('button', { name: 'Littérature' }))
    expect(resultCount(2)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Trier par :'), { target: { value: 'prix_desc' } })
    const titles = screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)
    expect(titles).toEqual(['Zèbre', 'Alpha'])
  })
})
