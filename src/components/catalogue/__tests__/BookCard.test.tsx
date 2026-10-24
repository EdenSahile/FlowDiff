import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { theme } from '@/lib/theme'
import { BookCard } from '@/components/catalogue/BookCard'
import type { Book } from '@/data/mockBooks'

/* ── Mocks des dépendances externes ── */

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockAddToCart = vi.fn()
vi.mock('@/contexts/CartContext', async () => {
  const actual = await vi.importActual<typeof import('@/contexts/CartContext')>('@/contexts/CartContext')
  return {
    ...actual,
    useCart: () => ({
      addToCart: mockAddToCart,
      items: [],
      opGroups: [],
      totalItems: 0,
      totalHT: 0,
      totalTTC: 0,
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    }),
  }
})

const mockShowToast = vi.fn()
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isLoading: false }),
}))

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

beforeEach(() => {
  mockNavigate.mockClear()
  mockAddToCart.mockClear()
  mockShowToast.mockClear()
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-027 : titre épuisé = bouton désactivé
══════════════════════════════════════════════════════ */

describe('BookCard : titre épuisé (FLOW-RM-027)', () => {
  it('affiche le bouton "Épuisé" désactivé pour un livre épuisé', () => {
    const epuiseBook = makeBook({ id: 'epuise-01', statut: 'epuise' })

    wrap(<BookCard book={epuiseBook} />)

    const epuiseButton = screen.getByRole('button', { name: 'Épuisé' })
    expect(epuiseButton).toBeDisabled()
  })

  it('affiche le bouton "Rupture" désactivé pour un livre en rupture', () => {
    const ruptureBook = makeBook({ id: 'rupture-01', statut: 'rupture' })

    wrap(<BookCard book={ruptureBook} />)

    const ruptureButton = screen.getByRole('button', { name: 'Rupture' })
    expect(ruptureButton).toBeDisabled()
  })

  it('affiche "Indisponible" désactivé pour un livre épuisé en mode coverFirst', () => {
    const epuiseBook = makeBook({ id: 'epuise-02', statut: 'epuise' })

    wrap(<BookCard book={epuiseBook} coverFirst />)

    const indispoButton = screen.getByText('Indisponible')
    expect(indispoButton.closest('button')).toBeDisabled()
  })
})

/* ══════════════════════════════════════════════════════
   Édition épuisée remplacée par une autre : la carte
   mène au titre commandable, celui que le libraire cherche
══════════════════════════════════════════════════════ */

describe('BookCard : édition remplacée', () => {
  it('remplace le bouton désactivé par un lien vers la nouvelle édition', () => {
    const remplacee = makeBook({ id: 'ed-2021', statut: 'epuise', replacedById: 'ed-2024' })

    wrap(<BookCard book={remplacee} />)

    const lien = screen.getByRole('link', { name: /Voir la nouvelle édition/ })
    expect(lien).toHaveAttribute('href', '/livre/ed-2024')
  })

  it('fait de même en mode coverFirst', () => {
    const remplacee = makeBook({ id: 'ed-2021b', statut: 'epuise', replacedById: 'ed-2024' })

    wrap(<BookCard book={remplacee} coverFirst />)

    const lien = screen.getByRole('link', { name: /Voir la nouvelle édition/ })
    expect(lien).toHaveAttribute('href', '/livre/ed-2024')
  })

  it('mène au remplaçant depuis le titre, pas à la fiche épuisée', () => {
    const remplacee = makeBook({ id: 'ed-2021c', title: 'Titre remplacé', statut: 'epuise', replacedById: 'ed-2024' })

    wrap(<BookCard book={remplacee} />)

    expect(screen.getByRole('link', { name: 'Titre remplacé' })).toHaveAttribute('href', '/livre/ed-2024')
  })

  it('laisse le bouton désactivé quand aucune édition ne remplace le titre', () => {
    const epuiseSansSuite = makeBook({ id: 'epuise-03', statut: 'epuise' })

    wrap(<BookCard book={epuiseSansSuite} />)

    expect(screen.queryByRole('link', { name: /Voir la nouvelle édition/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Épuisé' })).toBeDisabled()
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-028 : BookCard permet l'ajout d'un titre à paraître
══════════════════════════════════════════════════════ */

describe('BookCard : titre à paraître (FLOW-RM-028)', () => {
  it('le bouton d\'ajout est actif pour un titre à paraître', () => {
    const aParaitreBook = makeBook({
      id: 'ap-01',
      type: 'a-paraitre',
      statut: undefined,
    })

    wrap(<BookCard book={aParaitreBook} />)

    const addButton = screen.getByRole('button', { name: 'Ajouter au panier' })
    expect(addButton).not.toBeDisabled()
  })

  it('cliquer sur ajout ouvre la popin "Titre à paraître"', () => {
    const aParaitreBook = makeBook({
      id: 'ap-02',
      type: 'a-paraitre',
      statut: undefined,
    })

    wrap(<BookCard book={aParaitreBook} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter au panier' }))

    expect(screen.getByText('Titre à paraître')).toBeInTheDocument()
  })
})

/* ══════════════════════════════════════════════════════
   FLOW-RM-030 : modale de confirmation pour sur_commande/en_reimp
══════════════════════════════════════════════════════ */

describe('BookCard : modale stock alert (FLOW-RM-030)', () => {
  it('cliquer sur ajout d\'un livre sur_commande ouvre la modale de confirmation', () => {
    const surCommandeBook = makeBook({
      id: 'sc-01',
      type: 'fonds',
      statut: 'sur_commande',
    })

    wrap(<BookCard book={surCommandeBook} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter au panier' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/commande spéciale/i)).toBeInTheDocument()
  })

  it('cliquer sur ajout d\'un livre en_reimp ouvre la modale de confirmation', () => {
    const enReimpBook = makeBook({
      id: 'reimp-01',
      type: 'fonds',
      statut: 'en_reimp',
    })

    wrap(<BookCard book={enReimpBook} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter au panier' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /réimpression/i })).toBeInTheDocument()
  })
})
