import styled, { keyframes } from 'styled-components'
import { mq } from '@/lib/responsive'
import { BackButton } from '@/components/ui/BackButton'

/*
  Écran d'attente de la section Office.

  Le bordereau d'office complet a été écrit puis mis de côté, inachevé. Il
  vivait dans ce fichier sous le nom OfficesPageFull : compilé à chaque build,
  rendu par rien, puisque App.tsx route OfficesPage. Du code mort qui avait
  l'air vivant, retiré le 28 novembre 2026 ; son historique reste dans git.
*/

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 28px 32px;

  ${mq.belowMd} {
    padding: 16px;
  }
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const ComingWrap = styled.div`
  flex: 1;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
  padding: 40px 16px;
`

const ComingIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentLight};
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
`

const ComingEyebrow = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
`

const ComingTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const ComingText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
  max-width: 440px;
`

export function OfficesPage() {
  return (
    <Page>
      <Content>
        <BackButton />
        <ComingWrap>
          <ComingIcon>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </ComingIcon>
          <ComingEyebrow>Office</ComingEyebrow>
          <ComingTitle>Bientôt disponible</ComingTitle>
          <ComingText>
            La gestion de vos offices arrive prochainement. Cette section est
            en cours de finalisation.
          </ComingText>
        </ComingWrap>
      </Content>
    </Page>
  )
}
