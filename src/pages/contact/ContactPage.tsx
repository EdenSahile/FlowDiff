import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { contactSchema } from '@/lib/formSchemas'
import { BackButton } from '@/components/ui/BackButton'

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 640px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
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
  margin: 0 0 4px;
`

const PageSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`

const TabRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 20px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover:not([disabled]) {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  }
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl};
`

const FieldGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.white};
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  resize: vertical;
  min-height: 140px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.white};
  }
`

const SendButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:hover {
    background-color: ${({ theme }) => theme.colors.navyHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorText = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.navyLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const InfoTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const InfoLine = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 4px 0;

  a {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`

/* ── Component ── */
interface FromBook {
  title: string
  isbn: string
  publisher: string
  authors: string
  programme?: string
}

type Recipient = 'representant' | 'service'

export function ContactPage() {
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const location = useLocation()

  const fromBook = (location.state as { fromBook?: FromBook } | null)?.fromBook

  const [recipient, setRecipient] = useState<Recipient>('representant')
  const [sujet, setSujet] = useState(
    fromBook ? `Renseignement — ${fromBook.title}` : ''
  )
  const [message, setMessage] = useState(
    fromBook
      ? `Bonjour,\n\nJe souhaite obtenir des informations sur l'ouvrage suivant :\n\nTitre : ${fromBook.title}\nAuteur(s) : ${fromBook.authors}\nÉditeur : ${fromBook.publisher}\nISBN : ${fromBook.isbn}${fromBook.programme ? `\nProgramme : ${fromBook.programme}` : ''}\n\nMerci de me contacter.\n\nCordialement,\n${user?.nomLibrairie}`
      : ''
  )
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<{ sujet?: string; message?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = contactSchema.safeParse({ sujet, message })
    if (!validation.success) {
      const issues = Object.fromEntries(
        validation.error.issues.map(i => [i.path[0], i.message])
      ) as { sujet?: string; message?: string }
      setErrors(issues)
      return
    }
    setErrors({})
    setSending(true)
    // Simulation d'envoi (mock)
    setTimeout(() => {
      setSending(false)
      setSujet('')
      setMessage('')
      showToast('Votre message a été envoyé. Nous vous répondrons dans les meilleurs délais.')
    }, 800)
  }

  return (
    <Page>
      <PageHeader>
        <BackButton />
        <PageEyebrow>Informations</PageEyebrow>
        <PageTitle>Contact</PageTitle>
        <PageSubtitle>Envoyez un message à votre représentant ou au service clients.</PageSubtitle>
      </PageHeader>

      <TabRow>
        <Tab $active={recipient === 'representant'} onClick={() => setRecipient('representant')}>
          Mon représentant
        </Tab>
        <Tab $active={recipient === 'service'} onClick={() => setRecipient('service')}>
          Service clients
        </Tab>
      </TabRow>

      <Card>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label>De</Label>
            <Input
              type="text"
              value={`${user?.nomLibrairie} (${user?.email})`}
              readOnly
              style={{ opacity: 0.75 }}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="sujet">Sujet *</Label>
            <Input
              id="sujet"
              type="text"
              placeholder="Ex : Demande de renseignement, problème de commande…"
              value={sujet}
              onChange={e => { setSujet(e.target.value); setErrors(p => ({ ...p, sujet: undefined })) }}
            />
            {errors.sujet && <ErrorText>{errors.sujet}</ErrorText>}
          </FieldGroup>

          <FieldGroup style={{ marginBottom: 0 }}>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Votre message…"
              value={message}
              onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: undefined })) }}
            />
            {errors.message && <ErrorText>{errors.message}</ErrorText>}
          </FieldGroup>

          <SendButton
            type="submit"
            disabled={sending}
            style={{ marginTop: '24px' }}
          >
            {sending ? 'Envoi en cours…' : `Envoyer à ${recipient === 'representant' ? 'mon représentant' : 'le service clients'}`}
          </SendButton>
        </form>
      </Card>

      <InfoCard>
        <InfoTitle>
          {recipient === 'representant' ? 'Votre représentant commercial' : 'Service clients FlowDiff'}
        </InfoTitle>
        {recipient === 'representant' ? (
          <>
            <InfoLine>Disponible du lundi au vendredi, 9h–18h</InfoLine>
            <InfoLine>Téléphone : <a href={`tel:${user?.telephone}`}>{user?.telephone}</a></InfoLine>
          </>
        ) : (
          <>
            <InfoLine>Disponible du lundi au vendredi, 8h–19h</InfoLine>
            <InfoLine>Délai de réponse : sous 24h ouvrées</InfoLine>
          </>
        )}
      </InfoCard>
    </Page>
  )
}
