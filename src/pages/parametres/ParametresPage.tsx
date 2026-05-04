import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { newsletterSchema } from '@/lib/formSchemas'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { mq } from '@/lib/responsive'

/* ── Types ── */
type Universe = 'BD/Mangas' | 'Jeunesse' | 'Littérature' | 'Adulte-pratique'

interface NotifPrefs {
  nouveautes: boolean
  flashInfos: boolean
  promotions: boolean
  universes: Record<Universe, boolean>
}

const DEFAULT_PREFS: NotifPrefs = {
  nouveautes: true,
  flashInfos: true,
  promotions: false,
  universes: {
    'BD/Mangas': true,
    'Jeunesse': true,
    'Littérature': true,
    'Adulte-pratique': false,
  },
}

const UNIVERSES: Universe[] = ['BD/Mangas', 'Jeunesse', 'Littérature', 'Adulte-pratique']

const NEWSLETTERS = [
  { id: 'nouveautes', title: 'Nouveautés du mois', desc: 'Résumé mensuel des nouvelles parutions' },
  { id: 'aparaitre',  title: 'À paraître',          desc: 'Catalogue des prochaines sorties'      },
  { id: 'flashinfos', title: 'Flash Infos',          desc: 'Actualités éditoriales et promotions'  },
  { id: 'topventes',  title: 'Top Ventes',           desc: 'Classements hebdomadaires par univers' },
]

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 540px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
  ${mq.sm} { padding: ${({ theme }) => theme.spacing.lg}; }
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

const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.navyLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  ${mq.sm} { padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg}; }
`

const Row = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 10px ${({ theme }) => theme.spacing.md};
  min-height: 44px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  cursor: pointer;
  ${mq.sm} { padding: 14px ${({ theme }) => theme.spacing.lg}; }

  &:last-child { border-bottom: none; }
`

const RowLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.navy};
  flex: 1;
  min-width: 0;
`

/* Toggle */
const ToggleTrack = styled.span<{ $on: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.gray[400]};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: background-color 0.2s ease;
  flex-shrink: 0;
`

const ToggleThumb = styled.span<{ $on: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => $on ? '23px' : '3px'};
  width: 18px;
  height: 18px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: left 0.2s ease;
  border: 1.5px solid rgba(0,0,0,0.12);
`

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

/* Newsletter checkboxes */
const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 10px ${({ theme }) => theme.spacing.md};
  min-height: 44px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  cursor: pointer;
  ${mq.sm} { padding: 12px ${({ theme }) => theme.spacing.lg}; }

  &:last-of-type { border-bottom: none; }
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

const EmailGroup = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const EmailLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`

const EmailInput = styled.input`
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

const ErrorText = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`

const SaveButton = styled.button`
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

  &:hover { background-color: ${({ theme }) => theme.colors.navyHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const TourBtn = styled.button`
  width: 100%;
  padding: 12px 14px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.navy};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`

/* ── Toggle component ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <ToggleTrack $on={checked}>
      <HiddenCheckbox
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <ToggleThumb $on={checked} />
    </ToggleTrack>
  )
}

/* ── Component ── */
export function ParametresPage() {
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const { resetTour } = useOnboarding()

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)
  const [selected, setSelected] = useState<Set<string>>(new Set(['nouveautes', 'flashinfos']))
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailError, setEmailError] = useState('')
  const [saving, setSaving] = useState(false)

  function setGlobal(key: keyof Omit<NotifPrefs, 'universes'>, val: boolean) {
    setPrefs(p => ({ ...p, [key]: val }))
  }

  function setUniverse(u: Universe, val: boolean) {
    setPrefs(p => ({ ...p, universes: { ...p.universes, [u]: val } }))
  }

  function toggleNewsletter(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const validation = newsletterSchema.safeParse({ email, selected: [...selected] })
    if (!validation.success) {
      const issues = Object.fromEntries(validation.error.issues.map(i => [i.path[0], i.message]))
      setEmailError(issues.email ?? issues.selected ?? '')
      return
    }
    setEmailError('')
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Préférences enregistrées.')
    }, 700)
  }

  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Mon espace</PageEyebrow>
        <PageTitle>Paramètres</PageTitle>
      </PageHeader>

      <form onSubmit={handleSave}>
        {/* ── Notifications ── */}
        <Section>
          <SectionTitle>Notifications</SectionTitle>
          <Row>
            <RowLabel>Nouveautés du mois</RowLabel>
            <Toggle checked={prefs.nouveautes} onChange={v => setGlobal('nouveautes', v)} />
          </Row>
          <Row>
            <RowLabel>Flash Infos</RowLabel>
            <Toggle checked={prefs.flashInfos} onChange={v => setGlobal('flashInfos', v)} />
          </Row>
          <Row>
            <RowLabel>Offres & promotions</RowLabel>
            <Toggle checked={prefs.promotions} onChange={v => setGlobal('promotions', v)} />
          </Row>
        </Section>

        {/* ── Newsletters ── */}
        <Section>
          <SectionTitle>Newsletters</SectionTitle>
          {NEWSLETTERS.map(n => (
            <CheckRow key={n.id}>
              <Checkbox
                type="checkbox"
                checked={selected.has(n.id)}
                onChange={() => toggleNewsletter(n.id)}
              />
              <CheckLabel>
                <CheckTitle>{n.title}</CheckTitle>
                <CheckDesc>{n.desc}</CheckDesc>
              </CheckLabel>
            </CheckRow>
          ))}
          <EmailGroup>
            <EmailLabel htmlFor="pref-email">Adresse email de réception</EmailLabel>
            <EmailInput
              id="pref-email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
            />
            {emailError && <ErrorText>{emailError}</ErrorText>}
          </EmailGroup>
        </Section>

        {/* ── Univers suivis ── */}
        <Section>
          <SectionTitle>Univers suivis</SectionTitle>
          {UNIVERSES.map(u => (
            <Row key={u}>
              <RowLabel>{u}</RowLabel>
              <Toggle checked={prefs.universes[u]} onChange={v => setUniverse(u, v)} />
            </Row>
          ))}
        </Section>

        <SaveButton
          type="submit"
          disabled={saving || !email.trim()}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer les préférences'}
        </SaveButton>

        <TourBtn type="button" onClick={resetTour}>
          ▶ Revoir le tour guidé
        </TourBtn>
      </form>
    </Page>
  )
}
