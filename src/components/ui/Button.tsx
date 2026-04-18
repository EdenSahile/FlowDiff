import styled, { css } from 'styled-components'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  `,
  md: css`
    padding: 10px 20px;
    font-size: ${({ theme }) => theme.typography.sizes.md};
  `,
  lg: css`
    padding: 14px 28px;
    font-size: ${({ theme }) => theme.typography.sizes.lg};
  `,
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: 2px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme }) => theme.colors.white};
    border: 2px solid ${({ theme }) => theme.colors.navy};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.navyHover};
      border-color: ${({ theme }) => theme.colors.navyHover};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.navy};
    border: 2px solid ${({ theme }) => theme.colors.navy};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.navyLight};
    }
  `,
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  ${({ size = 'md' }) => sizeStyles[size]}
  ${({ variant = 'primary' }) => variantStyles[variant]}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`
