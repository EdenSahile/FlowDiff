import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, getZodErrors, type ForgotPasswordInput } from '@/lib/authUtils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import styled from 'styled-components'
import { Wordmark } from '@/components/brand/Wordmark'
import {
  AuthPage,
  AuthCard,
  AuthLogo,
  AuthTitle,
  AuthSubtitle,
  AuthForm,
  AuthLink,
} from './AuthLayout'

const SuccessBox = styled.div`
  background-color: #E8F5E9;
  border: 1px solid #A5D6A7;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: #1B5E20;
  text-align: center;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      const errors = getZodErrors(result)
      setFieldError(errors.email ?? '')
      return
    }

    setIsSubmitting(true)
    // Mock : simule un délai d'envoi email
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <AuthPage>
      <AuthCard>
        <AuthLogo>
          <Wordmark size="lg" showBaseline />
        </AuthLogo>

        <AuthTitle>Mot de passe oublié</AuthTitle>
        <AuthSubtitle>
          {submitted
            ? 'Email envoyé'
            : 'Renseignez votre email pour recevoir un lien de réinitialisation'}
        </AuthSubtitle>

        {submitted ? (
          <>
            <SuccessBox>
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un email
              avec les instructions de réinitialisation dans quelques minutes.
              <br /><br />
              Pensez à vérifier vos spams.
            </SuccessBox>
            <AuthLink>
              <Link to="/login">Retour à la connexion</Link>
            </AuthLink>
          </>
        ) : (
          <>
            <AuthForm onSubmit={handleSubmit} noValidate>
              <Input
                id="email"
                label="Email professionnel"
                type="email"
                placeholder="contact@malibrairie.fr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldError) setFieldError('')
                }}
                error={fieldError}
                autoComplete="email"
                autoFocus
              />

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le lien'}
              </Button>
            </AuthForm>

            <AuthLink>
              <Link to="/login">Retour à la connexion</Link>
            </AuthLink>
          </>
        )}
      </AuthCard>
    </AuthPage>
  )
}
