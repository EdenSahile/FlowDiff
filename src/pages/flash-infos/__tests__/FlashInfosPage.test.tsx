import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('FlashInfosPage : ajout au panier', () => {
  beforeEach(() => {
    mockAddToCart.mockClear()
    mockShowToast.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('n’affiche pas d’ajout au panier pour un titre en rupture', () => {
    renderPage()

    const card = flashCard('Blue Box T.1 : réimpression express')
    expect(card.getByText('Ouvrage indisponible')).toBeInTheDocument()
    expect(card.queryByRole('button', { name: 'Ajouter au panier' })).not.toBeInTheDocument()
  })

  it('demande confirmation pour une commande spéciale avant l’ajout', () => {
    renderPage()

    fireEvent.click(flashCard('J.K. Rowling : dossier Les Animaux fantastiques').getByRole('button', { name: 'Ajouter au panier' }))

    expect(mockAddToCart).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveTextContent('commande spéciale')

    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la commande' }))

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f-jes-animaux' }),
      1,
      { enReliquat: false },
    )
  })

  /*
    Le type d'un titre se déduit de sa date de parution (getCatalogueType) :
    « a-paraitre » tant que la parution est dans le futur, « nouveaute »
    ensuite. L'exemple ci-dessous, ap-bd-02, paraît le 19 novembre 2026, et ce
    test est tombé tout seul ce jour-là, sans qu'aucun code ne change.

    Le temps est donc figé avant cette parution. La règle testée, un titre à
    paraître demande confirmation, ne dépend pas du calendrier : le test ne
    doit pas en dépendre non plus. Seul Date est simulé, pour laisser les
    minuteries du composant intactes.
  */
  it('avertit puis ajoute un titre à paraître après confirmation', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-01T12:00:00'))

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
