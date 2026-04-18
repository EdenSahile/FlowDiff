import styled, { css } from 'styled-components'

/* ── Badge numérique (panier, notifications) ── */
export const NumberBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.radii.full};
  line-height: 1;
`

/* ── Badge texte (TOP 1, TOP 2, Offre spéciale…) ── */
type TextBadgeVariant = 'top' | 'promo' | 'new'

interface TextBadgeProps {
  variant?: TextBadgeVariant
}

const textBadgeVariants = {
  top: css`
    background-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme }) => theme.colors.white};
  `,
  promo: css`
    background-color: #2E7D32;
    color: ${({ theme }) => theme.colors.white};
  `,
  new: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  `,
}

export const TextBadge = styled.span<TextBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.radii.sm};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;

  ${({ variant = 'top' }) => textBadgeVariants[variant]}
`
