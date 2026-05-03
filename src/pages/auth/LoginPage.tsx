import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, getZodErrors, type LoginInput } from '@/lib/authUtils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DemoBanner } from '@/components/ui/DemoBanner'
import { Wordmark } from '@/components/brand/Wordmark'
import { theme } from '@/lib/theme'
import {
  AuthLogo,
  AuthTitle,
  AuthSubtitle,
  AuthForm,
  AuthError,
  AuthLink,
  PasswordWrapper,
  SplitPage,
  BrandPanel,
  BrandPanelDotGrid,
  BrandLine,
  BrandName,
  BrandTagline,
  BrandFeatureList,
  BrandFeatureItem,
  BrandFooter,
  FormPanel,
  FormPanelInner,
} from '@/components/auth/AuthLayout'

/* ── Blocked modal ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`

const Modal = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 32px 28px 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
`

const ModalIcon = styled.div`
  width: 52px;
  height: 52px;
  background: #FFF3E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
`

const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 8px;
`

const ModalBody = styled.p`
  font-size: 0.875rem;
  color: #616161;
  line-height: 1.5;
  margin-bottom: 24px;
`

const ModalClose = styled.button`
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 11px 32px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`

function BlockedModal({ message, onClose }: { message: string; onClose: () => void }) {
  return createPortal(
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalIcon>🔒</ModalIcon>
        <ModalTitle>Accès restreint</ModalTitle>
        <ModalBody>{message}</ModalBody>
        <ModalClose onClick={onClose}>Fermer</ModalClose>
      </Modal>
    </Overlay>,
    document.body
  )
}

/* ── Page ── */
export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState<LoginInput>({ identifier: 'LIB001', password: 'Libraire123!' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null)

  const handleChange = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getZodErrors(result))
      return
    }

    setIsSubmitting(true)
    setServerError('')

    const res = await login(result.data)

    if (!res.success) {
      if (res.fieldErrors) setFieldErrors(res.fieldErrors as Partial<Record<keyof LoginInput, string>>)
      else setServerError(res.error ?? 'Erreur de connexion.')
      setIsSubmitting(false)
      return
    }

    navigate('/')
  }

  return (
    <SplitPage>
      <BrandPanel>
        <BrandPanelDotGrid />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BrandLine />
          <BrandName>Flow<span>Diff</span></BrandName>
          <BrandTagline>La plateforme des libraires</BrandTagline>
          <BrandFeatureList>
            <BrandFeatureItem>Catalogue fonds, nouveautés &amp; à paraître</BrandFeatureItem>
            <BrandFeatureItem>Commandes directes et suivi temps réel</BrandFeatureItem>
            <BrandFeatureItem>Remises personnalisées par thématique</BrandFeatureItem>
            <BrandFeatureItem>Historique, retours et EDI intégrés</BrandFeatureItem>
          </BrandFeatureList>
        </div>
        <BrandFooter>© 2026 FlowDiff — Accès réservé aux libraires</BrandFooter>
      </BrandPanel>

      <FormPanel>
        <FormPanelInner>
          <AuthLogo>
            <Wordmark size="lg" showBaseline />
          </AuthLogo>

          <AuthTitle>Connexion</AuthTitle>
          <AuthSubtitle>Accès réservé aux libraires</AuthSubtitle>

          <div style={{
            background: '#FFF8E1',
            border: '1px solid #FFD54F',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.8125rem',
            color: '#5D4037',
            marginBottom: '4px',
            lineHeight: 1.4,
          }}>
            Les identifiants sont pré-remplis. Cliquez directement sur le bouton de connexion.
          </div>

          {serverError && <AuthError role="alert">{serverError}</AuthError>}

          <AuthForm onSubmit={handleSubmit} noValidate>
            <Input
              id="identifier"
              label="Code client ou email"
              type="password"
              placeholder="LIB001 ou contact@malib.fr"
              value={form.identifier}
              onChange={handleChange('identifier')}
              error={fieldErrors.identifier}
              autoComplete="username"
              autoFocus
              disabled
            />

            <div>
              <PasswordWrapper>
                <Input
                  id="password"
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={fieldErrors.password}
                  autoComplete="current-password"
                  disabled
                />
              </PasswordWrapper>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <a
                href="#"
                onClick={e => { e.preventDefault(); setBlockedMsg('La réinitialisation de mot de passe a été bloquée.') }}
                style={{ fontSize: '0.875rem', color: theme.colors.navy, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </AuthForm>

          <AuthLink>
            <a
              href="#"
              onClick={e => { e.preventDefault(); setBlockedMsg('La création de compte a été bloquée.') }}
            >
              Demander un accès
            </a>
          </AuthLink>

          <DemoBanner position="bottom" />
        </FormPanelInner>
      </FormPanel>

      {blockedMsg && <BlockedModal message={blockedMsg} onClose={() => setBlockedMsg(null)} />}
    </SplitPage>
  )
}
