import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, it, expect, vi } from 'vitest'
import { theme } from '@/lib/theme'
import { StockAlertModal } from '@/components/ui/StockAlertModal'

function renderModal(props: Partial<Parameters<typeof StockAlertModal>[0]> = {}) {
  const defaultProps = {
    open: true,
    statut: 'sur_commande' as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...props,
  }
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <StockAlertModal {...defaultProps} />
      </ThemeProvider>
    ),
    onConfirm: defaultProps.onConfirm,
    onCancel: defaultProps.onCancel,
  }
}

/* ─────────────────────────────────────────────────
   FLOW-RM-114 : modale de confirmation pour
   sur_commande et en_reimp avant ajout au panier
─────────────────────────────────────────────────── */

describe('FLOW-RM-114 : modale de confirmation stock', () => {
  it('affiche le contenu sur_commande avec le bouton Confirmer la commande', () => {
    renderModal({ statut: 'sur_commande' })

    expect(screen.getByText(/commande spéciale/i)).toBeInTheDocument()
    expect(screen.getByText('Confirmer la commande')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('affiche le contenu en_reimp avec le bouton Ajouter en reliquat', () => {
    renderModal({ statut: 'en_reimp' })

    expect(screen.getByRole('heading', { name: /réimpression/i })).toBeInTheDocument()
    expect(screen.getByText('Ajouter en reliquat')).toBeInTheDocument()
  })

  it('ne rend rien quand open est false', () => {
    renderModal({ open: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ne rend rien pour un statut autre que sur_commande ou en_reimp', () => {
    renderModal({ statut: 'disponible' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('appelle onConfirm au clic sur le bouton de confirmation', () => {
    const { onConfirm } = renderModal({ statut: 'sur_commande' })

    fireEvent.click(screen.getByText('Confirmer la commande'))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('appelle onCancel au clic sur Annuler', () => {
    const { onCancel } = renderModal({ statut: 'sur_commande' })

    fireEvent.click(screen.getByText('Annuler'))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-115 : en_reimp est ajouté comme reliquat
─────────────────────────────────────────────────── */

describe('FLOW-RM-115 : en_reimp signale un ajout en reliquat', () => {
  it('le message mentionne le reliquat et l\'expédition automatique', () => {
    renderModal({ statut: 'en_reimp' })

    const message = screen.getByText(/enregistré en reliquat/i)

    expect(message).toBeInTheDocument()
    expect(message.textContent).toMatch(/expédié automatiquement/i)
  })

  it('le bouton de confirmation est libellé Ajouter en reliquat', () => {
    renderModal({ statut: 'en_reimp' })

    const confirmBtn = screen.getByText('Ajouter en reliquat')

    expect(confirmBtn.tagName).toBe('BUTTON')
  })
})
