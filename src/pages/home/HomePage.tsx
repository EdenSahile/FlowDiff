import { useState, lazy, Suspense } from 'react'
import styled from 'styled-components'
import { SearchBar } from '@/components/home/SearchBar'
import { ScannerButton } from '@/components/home/ScannerButton'
import { FlashInfoButton } from '@/components/home/FlashInfoButton'
import { useAuth } from '@/hooks/useAuth'

const ScannerModal = lazy(() =>
  import('@/components/home/ScannerModal').then((m) => ({ default: m.ScannerModal }))
)

const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing['2xl']};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: center;
    min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing['3xl']};
  }
`

const Greeting = styled.div`
  text-align: center;
  align-self: stretch;
`

const GreetingTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 4px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
  }
`

const GreetingSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const SearchSection = styled.section`
  width: 100%;
  max-width: 480px;
`

const ScannerSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ScannerHint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: center;
`

const FlashSection = styled.section`
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: center;
`

export function HomePage() {
  const { user } = useAuth()
  const [scannerOpen, setScannerOpen] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <Page>
      <Greeting>
        <GreetingTitle>
          {greeting}{user ? `, ${user.nomLibrairie}` : ''} 👋
        </GreetingTitle>
        <GreetingSubtitle>Que souhaitez-vous commander aujourd'hui ?</GreetingSubtitle>
      </Greeting>

      <SearchSection aria-label="Recherche">
        <SearchBar />
      </SearchSection>

      <ScannerSection aria-label="Scanner">
        <ScannerButton onClick={() => setScannerOpen(true)} />
        <ScannerHint>Scannez le code-barres d'un livre</ScannerHint>
      </ScannerSection>

      <FlashSection aria-label="Flash infos">
        <FlashInfoButton count={3} />
      </FlashSection>

      {scannerOpen && (
        <Suspense fallback={null}>
          <ScannerModal onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}
    </Page>
  )
}
