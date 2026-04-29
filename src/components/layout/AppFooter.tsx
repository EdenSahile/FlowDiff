import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

const FooterBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.footerHeight};
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  z-index: 90;

  /* Caché sur mobile — BottomNav gère le bas */
  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: none;
  }

  /* Décalé du sidebar sur desktop */
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    left: ${({ theme }) => theme.layout.sidebarWidth};
  }
`

const FooterNavLink = styled(NavLink)`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gray[400]};
  transition: color 0.12s;
  white-space: nowrap;

  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

export function AppFooter() {
  return (
    <FooterBar>
      <FooterNavLink to="/cgv">CGV</FooterNavLink>
    </FooterBar>
  )
}
