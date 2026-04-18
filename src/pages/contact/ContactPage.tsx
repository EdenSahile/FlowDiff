import { useState } from 'react'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const TabRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background-color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.navy};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not([disabled]) {
    border-color: ${({ theme }) => theme.colors.navy};
  }
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
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
  color: ${({ theme }) => theme.colors.white};
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

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.navyLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const InfoTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const InfoLine = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sujet.trim() || !message.trim()) return

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
      <Title>Contact</Title>
      <Subtitle>Envoyez un message à votre représentant ou au service clients.</Subtitle>

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
              onChange={e => setSujet(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup style={{ marginBottom: 0 }}>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Votre message…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </FieldGroup>

          <SendButton
            type="submit"
            disabled={sending || !sujet.trim() || !message.trim()}
            style={{ marginTop: '24px' }}
          >
            {sending ? 'Envoi en cours…' : `Envoyer à ${recipient === 'representant' ? 'mon représentant' : 'le service clients'}`}
          </SendButton>
        </form>
      </Card>

      <InfoCard>
        <InfoTitle>
          {recipient === 'representant' ? 'Votre représentant commercial' : 'Service clients BookFlow'}
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
