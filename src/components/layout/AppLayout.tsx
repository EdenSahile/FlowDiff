import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { BurgerMenu } from './BurgerMenu'
import { DemoBanner } from '@/components/ui/DemoBanner'
import { FeedbackWidget } from '@/components/ui/FeedbackWidget'
import { AppFooter } from './AppFooter'
import { useCart } from '@/contexts/CartContext'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  overflow-x: hidden;
`

const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const PageContent = styled.main`
  flex: 1;

  /* Mobile : espace pour la BottomNav */
  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    padding-bottom: ${({ theme }) => theme.layout.bottomNavHeight};
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
      <MainColumn>
        <Header
          cartCount={totalItems}
          onBurgerClick={() => setMenuOpen(true)}
          onCartClick={() => navigate('/panier')}
        />
        <DemoBanner />
        <PageContent>
          {children}
        </PageContent>
        <AppFooter />
      </MainColumn>
      <BottomNav />
      <FeedbackWidget />
      <OnboardingTour />
    </LayoutRoot>
  )
}
