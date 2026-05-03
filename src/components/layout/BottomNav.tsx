import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'

/* ── Icons SVG inline ── */
function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 2l2.39 4.84 5.35.78-3.87 3.77.91 5.33L11 14.27l-4.78 2.51.91-5.33L3.26 7.62l5.35-.78L11 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M4 19V5a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}


function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="12" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="12" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

/* ── Styled ── */
const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.bottomNavHeight};
  background-color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: stretch;
  z-index: 100;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const StyledNavLink = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
  padding-bottom: env(safe-area-inset-bottom, 0px);

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background-color: rgba(255, 255, 255, 0.06);
  }

  &.active {
    color: ${({ theme }) => theme.colors.accent};
    background-color: rgba(212, 168, 67, 0.10);
  }
`

const TabLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  letter-spacing: 0.02em;
`

const CartTabWrap = styled.span`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
`

/* ── Component ── */
export function BottomNav() {
  const { totalItems } = useCart()

  return (
    <Nav aria-label="Navigation principale">
      <StyledNavLink to="/" end>
        <HomeIcon />
        <TabLabel>Accueil</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/nouveautes">
        <StarIcon />
        <TabLabel>Nouveautés</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/fonds">
        <BookIcon />
        <TabLabel>Fonds</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/panier">
        <CartTabWrap>
          <CartIcon />
          {totalItems > 0 && (
            <CartBadge>{totalItems > 99 ? '99+' : totalItems}</CartBadge>
          )}
        </CartTabWrap>
        <TabLabel>Panier</TabLabel>
      </StyledNavLink>
      <StyledNavLink to="/selections">
        <GridIcon />
        <TabLabel>Sélections</TabLabel>
      </StyledNavLink>
    </Nav>
  )
}
