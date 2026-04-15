import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { BurgerMenu } from './BurgerMenu'
import { useCart } from '@/contexts/CartContext'

const LayoutRoot = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.gray[50]};
`

const Main = styled.main`
  padding-top: ${({ theme }) => theme.layout.headerHeight};
  padding-bottom: ${({ theme }) => theme.layout.bottomNavHeight};
  min-height: 100vh;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding-left: ${({ theme }) => theme.layout.sidebarWidth};
    padding-bottom: 0;
  }
`

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <LayoutRoot>
      <Sidebar />
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header
        cartCount={totalItems}
        onBurgerClick={() => setMenuOpen(true)}
        onCartClick={() => navigate('/panier')}
      />
      <Main>{children}</Main>
      <BottomNav />
    </LayoutRoot>
  )
}
