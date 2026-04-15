import { useState } from 'react'
import styled from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 540px;
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
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  flex-shrink: 0;
`

const CheckLabel = styled.span`
  flex: 1;
`

const CheckTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
`

const CheckDesc = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`

const FieldGroup = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
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

const SubmitButton = styled.button`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.lg};
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

const NEWSLETTERS = [
  { id: 'nouveautes', title: 'Nouveautés du mois', desc: 'Résumé mensuel des nouvelles parutions' },
  { id: 'aparaitre', title: 'À paraître', desc: 'Catalogue des prochaines sorties' },
  { id: 'flashinfos', title: 'Flash Infos', desc: 'Actualités éditoriales et promotions' },
  { id: 'topventes', title: 'Top Ventes', desc: 'Classements hebdomadaires par univers' },
]

/* ── Component ── */
export function NewsletterPage() {
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const [email, setEmail] = useState(user?.email ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set(['nouveautes', 'flashinfos']))
  const [saving, setSaving] = useState(false)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || selected.size === 0) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Inscription newsletter enregistrée.')
    }, 700)
  }

  return (
    <Page>
      <Title>Newsletter</Title>
      <Subtitle>
        Choisissez les newsletters que vous souhaitez recevoir.
        Vous pouvez vous désinscrire à tout moment.
      </Subtitle>

      <form onSubmit={handleSubmit}>
        <Card>
          <SectionLabel>Sélectionnez vos newsletters</SectionLabel>
          {NEWSLETTERS.map(n => (
            <CheckRow key={n.id}>
              <Checkbox
                type="checkbox"
                checked={selected.has(n.id)}
                onChange={() => toggle(n.id)}
              />
              <CheckLabel>
                <CheckTitle>{n.title}</CheckTitle>
                <CheckDesc>{n.desc}</CheckDesc>
              </CheckLabel>
            </CheckRow>
          ))}

          <FieldGroup>
            <Label htmlFor="nl-email">Adresse email de réception</Label>
            <Input
              id="nl-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </FieldGroup>
        </Card>

        <SubmitButton type="submit" disabled={saving || selected.size === 0 || !email.trim()}>
          {saving ? 'Enregistrement…' : 'Valider mon inscription'}
        </SubmitButton>
      </form>
    </Page>
  )
}
