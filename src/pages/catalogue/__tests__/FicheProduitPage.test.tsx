import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { FicheProduitPage } from '../FicheProduitPage'
import { theme } from '@/lib/theme'
import type { Book } from '@/data/mockBooks'

const aParaitreBook: Book = {
  id: 'ap-test-01', isbn: '9789990002999',
  title: 'Titre à paraître de test', authors: ['Autrice Test'],
  publisher: 'Éditions Test', universe: 'Littérature', type: 'a-paraitre',
  price: 12, priceTTC: 18, format: '155 x 235 mm', pages: 220,
  publicationDate: '2027-03-15', description: 'Description de test.',
}

const mockAddToCart = vi.fn()
const mockShowToast = vi.fn()

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

vi.mock('@/services/books', () => ({
  getBookByIdAsync: vi.fn(async () => aParaitreBook),
  getBooksByTypeAsync: vi.fn(async () => []),
}))

vi.mock('@/contexts/CartContext', async importOriginal => {
  const actual = await importOriginal<typeof import('@/contexts/CartContext')>()
  return { ...actual, useCart: () => ({ addToCart: mockAddToCart }) }
})

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/contexts/RdvContext', () => ({
  useRdv: () => ({ addToRdv: vi.fn(), isInRdv: () => false }),
}))

vi.mock('@/hooks/useRefetchOnFocus', () => ({ useRefetchOnFocus: () => undefined }))

describe('FicheProduitPage, titre à paraître', () => {
  it('affiche 1 seul bouton, avertit, puis ajoute le titre après confirmation', async () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/livre/ap-test-01']}>
          <Routes>
            <Route path="/livre/:id" element={<FicheProduitPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    )

    const addButtons = await screen.findAllByRole('button', { name: 'Ajouter au panier' })
    expect(addButtons).toHaveLength(1)
    expect(screen.getByText(/Disponible à partir du 15 mars 2027/)).toBeInTheDocument()

    fireEvent.click(addButtons[0])

    expect(mockAddToCart).not.toHaveBeenCalled()
    expect(screen.getByText('Titre à paraître')).toBeInTheDocument()
    expect(screen.getByText('Ce titre sera enregistré comme « noté » et conservé indéfiniment.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    await waitFor(() => expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ap-test-01' }),
      1,
      { enReliquat: false }
    ))
    expect(mockShowToast).toHaveBeenCalledWith('Ouvrage ajouté au panier')
  })
})
