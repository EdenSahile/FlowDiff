import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { BurgerMenu } from './BurgerMenu'
import { DemoBanner } from '@/components/ui/DemoBanner'
import { AppFooter } from './AppFooter'
import { useCart } from '@/contexts/CartContext'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'

const LayoutRoot = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.gray[50]};
`

const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const StickyBand = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
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
      {/* onFeedbackOpen n'est plus passé : le formulaire d'avis est parqué
          dans parked/feedback/. Sidebar et BurgerMenu masquent l'entrée
          d'eux-mêmes quand la prop est absente. */}
      <Sidebar />
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <MainColumn>
        <StickyBand>
          <Header
            cartCount={totalItems}
            onBurgerClick={() => setMenuOpen(true)}
            onCartClick={() => navigate('/panier')}
          />
          <DemoBanner />
        </StickyBand>
        <PageContent>
          {children}
        </PageContent>
        <AppFooter />
      </MainColumn>
      <BottomNav />
      <OnboardingTour />
    </LayoutRoot>
  )
}
