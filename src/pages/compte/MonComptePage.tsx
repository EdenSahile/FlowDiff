import styled, { keyframes } from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { mq } from '@/lib/responsive'
import { BackButton } from '@/components/ui/BackButton'

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }

  ${mq.md} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const PageEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '';
    width: 18px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
  }
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CardHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.navy};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: #3d2f00;
  flex-shrink: 0;
`

const HeaderInfo = styled.div``

const HeaderName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
`

const HeaderCode = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: rgba(255, 255, 255, 0.65);
  margin-top: 2px;
`

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`

const FieldLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const FieldValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const RemiseBadge = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.primary};
`

const RemisesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: 6px;
`

const RemiseTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-top: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
`

const RemiseTileLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const RemiseTileValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const RemiseTileSub = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const ReliquatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const ReliquatBadge = styled.span<{ $accepted: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  background: ${({ $accepted }) => $accepted ? 'rgba(46,125,50,0.10)' : 'rgba(107,107,104,0.10)'};
  color: ${({ $accepted }) => $accepted ? '#2E7D32' : '#6B6B68'};
  border: 1px solid ${({ $accepted }) => $accepted ? 'rgba(46,125,50,0.25)' : 'rgba(107,107,104,0.20)'};
`

const InfoNote = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`

const PolicySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const PolicyEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '';
    width: 18px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
  }
`

const PolicyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  ${mq.belowMd} {
    grid-template-columns: 1fr;
  }
`

const PolicyTile = styled.div<{ $variant: 'gold' | 'navy' }>`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.07);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: ${({ $variant, theme }) =>
      $variant === 'navy' ? theme.colors.navy : theme.colors.accent};
  }
`

const PolicyTileIcon = styled.div<{ $variant: 'gold' | 'navy' }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $variant, theme }) =>
    $variant === 'navy' ? theme.colors.primaryLight : theme.colors.accentLight};
  color: ${({ $variant, theme }) =>
    $variant === 'navy' ? theme.colors.navy : '#7a5c00'};
  margin-bottom: 2px;
`

const PolicyTileLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
`

const PolicyTileValue = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
  letter-spacing: -0.01em;
`

const PolicyTileDesc = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  margin: 0;
`

/* ── Component ── */
export function MonComptePage() {
  const { user } = useAuthContext()

  if (!user) return null

  const initiale = user.nomLibrairie[0]?.toUpperCase() ?? 'L'

  return (
    <Page>
      <PageHeader>
        <BackButton />
        <PageEyebrow>Mon espace</PageEyebrow>
        <PageTitle>Mon compte</PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <Avatar>{initiale}</Avatar>
          <HeaderInfo>
            <HeaderName>{user.nomLibrairie}</HeaderName>
            <HeaderCode>Code client : {user.codeClient}</HeaderCode>
          </HeaderInfo>
        </CardHeader>

        <CardBody>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldValue>{user.email}</FieldValue>
          </Field>
          <Field>
            <FieldLabel>Téléphone</FieldLabel>
            <FieldValue>{user.telephone}</FieldValue>
          </Field>
          <Field>
            <FieldLabel>Adresse de livraison</FieldLabel>
            <FieldValue>{user.adresseLivraison}</FieldValue>
          </Field>
          <Field>
            <FieldLabel>Reliquat accepté</FieldLabel>
            <ReliquatRow>
              <ReliquatBadge $accepted={user.reliquatAccepte}>
                {user.reliquatAccepte ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Oui
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Non
                  </>
                )}
              </ReliquatBadge>
            </ReliquatRow>
          </Field>
          <Field>
            <FieldLabel>Remises par thématique</FieldLabel>
            {Object.keys(user.remisesParUnivers).length > 0 ? (
              <RemisesGrid>
                {Object.entries(user.remisesParUnivers).map(([univers, taux]) => (
                  <RemiseTile key={univers}>
                    <RemiseTileLabel>{univers}</RemiseTileLabel>
                    <RemiseTileValue>{taux} %</RemiseTileValue>
                    <RemiseTileSub>de remise</RemiseTileSub>
                  </RemiseTile>
                ))}
              </RemisesGrid>
            ) : (
              <FieldValue>
                <RemiseBadge>{user.remise} % sur tous les titres</RemiseBadge>
              </FieldValue>
            )}
          </Field>
        </CardBody>
      </Card>

      <PolicySection>
        <PolicyEyebrow>Gestion des commandes</PolicyEyebrow>
        <PolicyGrid>
          <PolicyTile $variant="gold">
            <PolicyTileIcon $variant="gold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </PolicyTileIcon>
            <PolicyTileLabel>Notés — titres à paraître</PolicyTileLabel>
            <PolicyTileValue>Conservés indéfiniment</PolicyTileValue>
            <PolicyTileDesc>
              Les titres à paraître ajoutés au panier sont enregistrés en noté jusqu'à leur mise en disponibilité.
            </PolicyTileDesc>
          </PolicyTile>

          <PolicyTile $variant="navy">
            <PolicyTileIcon $variant="navy">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </PolicyTileIcon>
            <PolicyTileLabel>Reliquats — titres en réassort</PolicyTileLabel>
            <PolicyTileValue>3 mois (fin de mois)</PolicyTileValue>
            <PolicyTileDesc>
              Les reliquats sont conservés 3 mois et expédiés avec votre prochaine commande.
            </PolicyTileDesc>
          </PolicyTile>
        </PolicyGrid>
      </PolicySection>

      <InfoNote>
        Pour modifier vos informations (adresse, email, téléphone), veuillez contacter votre
        représentant commercial ou le service clients. Les modifications seront effectuées
        directement dans notre système CRM.
      </InfoNote>
    </Page>
  )
}
