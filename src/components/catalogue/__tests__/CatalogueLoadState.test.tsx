import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'
import { CatalogueLoadState } from '@/components/catalogue/CatalogueLoadState'
import { theme } from '@/lib/theme'

function renderState(isLoading: boolean, hasError: boolean, onRetry = vi.fn()) {
  render(
    <ThemeProvider theme={theme}>
      <CatalogueLoadState isLoading={isLoading} hasError={hasError} onRetry={onRetry} />
    </ThemeProvider>
  )
  return onRetry
}

describe('CatalogueLoadState', () => {
  it('annonce le chargement du catalogue', () => {
    renderState(true, false)

    expect(screen.getByRole('status')).toHaveTextContent('Chargement du catalogue…')
  })

  it('propose de relancer après une erreur', () => {
    const onRetry = renderState(false, true)

    expect(screen.getByRole('alert')).toHaveTextContent('Le catalogue n’a pas pu être chargé.')
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('ne rend rien lorsque le catalogue est disponible', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CatalogueLoadState isLoading={false} hasError={false} onRetry={vi.fn()} />
      </ThemeProvider>
    )

    expect(container).toBeEmptyDOMElement()
  })
})
