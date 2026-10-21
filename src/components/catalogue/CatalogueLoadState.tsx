import styled from 'styled-components'

interface CatalogueLoadStateProps {
  isLoading: boolean
  hasError: boolean
  onRetry: () => void
}

const StateBox = styled.div`
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const RetryButton = styled.button`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.navyHover}; }
`

export function CatalogueLoadState({ isLoading, hasError, onRetry }: CatalogueLoadStateProps) {
  if (isLoading) {
    return <StateBox role="status" aria-live="polite">Chargement du catalogue…</StateBox>
  }

  if (hasError) {
    return (
      <StateBox role="alert">
        <span>Le catalogue n’a pas pu être chargé.</span>
        <RetryButton type="button" onClick={onRetry}>Réessayer</RetryButton>
      </StateBox>
    )
  }

  return null
}
