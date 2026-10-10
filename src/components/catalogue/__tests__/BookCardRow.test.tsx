import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { describe, it, expect, vi } from 'vitest'
import { theme } from '@/lib/theme'
import { BookCardRow } from '@/components/catalogue/BookCardRow'
import type { Book } from '@/data/mockBooks'

/* ── Mocks des dépendances externes ── */

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/contexts/OrdersContext', () => ({
  useOrders: () => ({ orders: [] }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: null, isLoading: false }),
}))

vi.mock('@/contexts/CartContext', async () => {
  const actual = await vi.importActual<typeof import('@/contexts/CartContext')>('@/contexts/CartContext')
  return {
    ...actual,
    useCart: () => ({
      addToCart: vi.fn(),
      items: [],
      opGroups: [],
      totalItems: 0,
    }),
  }
})

vi.mock('@/contexts/WishlistContext', () => ({
  useWishlist: () => ({
    isInAnyList: () => false,
    getListsContaining: () => [],
    removeFromList: vi.fn(),
    lists: [],
  }),
}))

/* ── Helpers ── */

function wrap(ui: React.ReactElement) {
  return render(
    <SCThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </SCThemeProvider>
  )
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'test-book-01',
    isbn: '9781234567890',
    title: 'Livre de test',
    authors: ['Auteur Test'],
    publisher: 'Éditeur Test',
    universe: 'Littérature',
    type: 'fonds',
    price: 10.00,
    priceTTC: 14.90,
    format: '155 x 235 mm',
    publicationDate: '2024-01-01',
    description: 'Description de test',
    statut: 'disponible',
    ...overrides,
  }
}

/* ══════════════════════════════════════════════════════
   FLOW-RM-029 : BookCardRow — commandabilité
══════════════════════════════════════════════════════ */

describe('BookCardRow — commandabilité (FLOW-RM-029)', () => {
  it('affiche les contrôles de commande pour un titre à paraître', () => {
    const aParaitreBook = makeBook({
      id: 'ap-row-01',
      type: 'a-paraitre',
      statut: undefined,
    })

    wrap(<BookCardRow book={aParaitreBook} selected={false} onToggle={vi.fn()} />)

    expect(screen.getByLabelText('Ajouter à une liste')).toBeInTheDocument()
    expect(screen.getByText('Select')).toBeInTheDocument()
  })

  it('masque les contrôles de commande pour un titre épuisé', () => {
    const epuiseBook = makeBook({
      id: 'epuise-row-01',
      statut: 'epuise',
    })

    wrap(<BookCardRow book={epuiseBook} selected={false} onToggle={vi.fn()} />)

    expect(screen.queryByText('Select')).not.toBeInTheDocument()
  })

  it('masque les contrôles de commande pour un titre en rupture', () => {
    const ruptureBook = makeBook({
      id: 'rupture-row-01',
      statut: 'rupture',
    })

    wrap(<BookCardRow book={ruptureBook} selected={false} onToggle={vi.fn()} />)

    expect(screen.queryByText('Select')).not.toBeInTheDocument()
  })

  it('affiche les contrôles de commande pour un titre disponible', () => {
    const disponibleBook = makeBook({
      id: 'dispo-row-01',
      statut: 'disponible',
    })

    wrap(<BookCardRow book={disponibleBook} selected={false} onToggle={vi.fn()} />)

    expect(screen.getByText('Select')).toBeInTheDocument()
  })
})
