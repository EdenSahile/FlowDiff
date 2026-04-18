import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, getZodErrors, type RegisterInput } from '@/lib/authUtils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/brand/Wordmark'
import {
  AuthPage,
  AuthCard,
  AuthLogo,
  AuthTitle,
  AuthSubtitle,
  AuthForm,
  AuthError,
  AuthLink,
  PasswordWrapper,
  PasswordToggle,
  InputHint,
} from './AuthLayout'

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M1 11S4.5 4 11 4s10 7 10 7-3.5 7-10 7S1 11 1 11z" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M1 1l20 20M9.88 9.88A3 3 0 0 0 11 14a3 3 0 0 0 2.12-5.12M6.94 6.94C4.23 8.3 2.27 10.22 1 11c0 0 3.5 7 10 7a9.87 9.87 0 0 0 4.34-.98M9.9 4.24A9.12 9.12 0 0 1 11 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

type RegisterForm = RegisterInput

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState<RegisterForm>({
    codeClient: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'codeClient' ? e.target.value.toUpperCase() : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = registerSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getZodErrors(result))
      return
    }

    setIsSubmitting(true)
    setServerError('')

    const res = await register(result.data)

    if (!res.success) {
      if (res.fieldErrors) setFieldErrors(res.fieldErrors as Partial<Record<keyof RegisterForm, string>>)
      else setServerError(res.error ?? "Erreur lors de la création du compte.")
      setIsSubmitting(false)
      return
    }

    navigate('/')
  }

  return (
    <AuthPage>
      <AuthCard>
        <AuthLogo>
          <Wordmark size="lg" showBaseline />
        </AuthLogo>

        <AuthTitle>Créer votre accès</AuthTitle>
        <AuthSubtitle>Renseignez les informations de votre librairie</AuthSubtitle>

        {serverError && <AuthError role="alert">{serverError}</AuthError>}

        <AuthForm onSubmit={handleSubmit} noValidate>
          <Input
            id="codeClient"
            label="Code client"
            type="text"
            placeholder="LIB001"
            value={form.codeClient}
            onChange={handleChange('codeClient')}
            error={fieldErrors.codeClient}
            autoComplete="off"
            autoFocus
          />

          <div>
            <Input
              id="email"
              label="Email professionnel"
              type="email"
              placeholder="contact@malibrairie.fr"
              value={form.email}
              onChange={handleChange('email')}
              error={fieldErrors.email}
              autoComplete="email"
            />
            {!fieldErrors.email && (
              <InputHint>
                Utilisez l'email associé à votre compte client chez votre distributeur.
              </InputHint>
            )}
          </div>

          <PasswordWrapper>
            <Input
              id="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={handleChange('password')}
              error={fieldErrors.password}
              autoComplete="new-password"
              style={{ paddingRight: '44px' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
              style={{ top: fieldErrors.password ? 'calc(50% - 10px)' : '50%' }}
            >
              <EyeIcon visible={showPassword} />
            </PasswordToggle>
          </PasswordWrapper>

          <PasswordWrapper>
            <Input
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              style={{ paddingRight: '44px' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              style={{ top: fieldErrors.confirmPassword ? 'calc(50% - 10px)' : '50%' }}
            >
              <EyeIcon visible={showConfirm} />
            </PasswordToggle>
          </PasswordWrapper>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Création du compte…' : 'Créer mon accès'}
          </Button>
        </AuthForm>

        <AuthLink>
          Déjà un compte ?{' '}
          <Link to="/login">Se connecter</Link>
        </AuthLink>
      </AuthCard>
    </AuthPage>
  )
}
