import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { adminColors } from '@/admin/adminTheme'

export function AdminLoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = (fd.get('email') as string).trim()
    const password = fd.get('password') as string
    const ok = login(email, password)
    if (ok) navigate('/admin/dashboard', { replace: true })
    else setError('Identifiants incorrects')
  }

  return (
    <Page>
      <Card>
        <Logo>FlowDiff <Sup>Admin</Sup></Logo>
        <Subtitle>Espace réservé aux équipes internes</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue="admin@flowdiff.com" autoComplete="username" />
          </Field>
          <Field>
            <Label>Mot de passe</Label>
            <Input name="password" type="password" defaultValue="FlowDiff2024!" autoComplete="current-password" />
          </Field>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <SubmitBtn type="submit">Se connecter</SubmitBtn>
        </Form>
      </Card>
    </Page>
  )
}

const Page = styled.div`
  min-height: 100vh;
  background: ${adminColors.pageBg};
  display: flex;
  align-items: center;
  justify-content: center;
`

const Card = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  padding: 48px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
`

const Logo = styled.h1`
  font-family: 'Open Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: ${adminColors.sidebarBg};
  margin: 0 0 8px;
`

const Sup = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${adminColors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 6px;
  vertical-align: super;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: ${adminColors.textSecondary};
  margin: 0 0 32px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${adminColors.textPrimary};
`

const Input = styled.input`
  border: 1px solid ${adminColors.border};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;
  color: ${adminColors.textPrimary};
  outline: none;
  &:focus { border-color: ${adminColors.accent}; }
`

const ErrorMsg = styled.p`
  font-size: 13px;
  color: ${adminColors.danger};
  margin: 0;
`

const SubmitBtn = styled.button`
  background: ${adminColors.accent};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  cursor: pointer;
  margin-top: 8px;
  &:hover { background: ${adminColors.accentHover}; }
`
