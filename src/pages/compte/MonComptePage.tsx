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

const InfoNote = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
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

      <InfoNote>
        Pour modifier vos informations (adresse, email, téléphone), veuillez contacter votre
        représentant commercial ou le service clients. Les modifications seront effectuées
        directement dans notre système CRM.
      </InfoNote>
    </Page>
  )
}
