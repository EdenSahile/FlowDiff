import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FlashInfosPage } from '@/pages/flash-infos/FlashInfosPage'
import { theme } from '@/lib/theme'

const mockAddToCart = vi.fn()
const mockShowToast = vi.fn()

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}))

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <FlashInfosPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

function flashCard(title: string) {
  const heading = screen.getByRole('heading', { name: title })
  const card = heading.closest('article')
  if (!card) throw new Error(`Carte introuvable : ${title}`)
  return within(card)
}

describe('FlashInfosPage — ajout au panier', () => {
  beforeEach(() => {
    mockAddToCart.mockClear()
    mockShowToast.mockClear()
  })

  it('n’affiche pas d’ajout au panier pour un titre en rupture', () => {
    renderPage()

    const card = flashCard('Blue Box T.1 — réimpression express')
    expect(card.getByText('Ouvrage indisponible')).toBeInTheDocument()
    expect(card.queryByRole('button', { name: 'Ajouter au panier' })).not.toBeInTheDocument()
  })

  it('demande confirmation pour une commande spéciale avant l’ajout', () => {
    renderPage()

    fireEvent.click(flashCard('J.K. Rowling — dossier Les Animaux fantastiques').getByRole('button', { name: 'Ajouter au panier' }))

    expect(mockAddToCart).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveTextContent('commande spéciale')

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la commande' }))

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f-jes-animaux' }),
      1,
      { enReliquat: false },
    )
  })

  it('avertit puis ajoute un titre à paraître après confirmation', () => {
    renderPage()

    fireEvent.click(flashCard('Rencontre autour de L’Atelier des nuages').getByRole('button', { name: 'Ajouter au panier' }))

    expect(mockAddToCart).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveTextContent('Titre à paraître')

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'ap-bd-02' }),
      1,
      { enReliquat: false },
    )
  })
})
