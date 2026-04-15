import styled from 'styled-components'
import { NumberBadge } from '@/components/ui/Badge'

/* ── Icons SVG inline ── */
function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="15" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M2 2h2l2.68 10.39a2 2 0 0 0 1.94 1.51h7.46a2 2 0 0 0 1.95-1.56L20 7H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}

/* ── Styled ── */
const HeaderBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.headerHeight};
  background-color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    left: ${({ theme }) => theme.layout.sidebarWidth};
    justify-content: flex-end;
  }
`

const IconButton = styled.button<{ $mobileOnly?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Masqué en desktop si mobile-only */
  ${({ $mobileOnly, theme }) =>
    $mobileOnly &&
    `@media (min-width: ${theme.breakpoints.mobile}) { display: none; }`}
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  user-select: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const LogoCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
`

const LogoText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -0.02em;
`

const CartWrapper = styled.div`
  position: relative;
`

const CartBadge = styled(NumberBadge)`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  font-size: 10px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
`

/* ── Component ── */
interface HeaderProps {
  cartCount?: number
  onBurgerClick?: () => void
  onCartClick?: () => void
}

export function Header({ cartCount = 0, onBurgerClick, onCartClick }: HeaderProps) {
  return (
    <HeaderBar>
      <IconButton $mobileOnly onClick={onBurgerClick} aria-label="Ouvrir le menu">
        <BurgerIcon />
      </IconButton>

      <Logo>
        <LogoCircle>B</LogoCircle>
        <LogoText>BookFlow</LogoText>
      </Logo>

      <CartWrapper>
        <IconButton onClick={onCartClick} aria-label={`Panier — ${cartCount} article${cartCount > 1 ? 's' : ''}`}>
          <CartIcon />
        </IconButton>
        {cartCount > 0 && <CartBadge>{cartCount > 99 ? '99+' : cartCount}</CartBadge>}
      </CartWrapper>
    </HeaderBar>
  )
}
