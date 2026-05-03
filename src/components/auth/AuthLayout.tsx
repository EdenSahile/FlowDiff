import styled from 'styled-components'

export const AuthPage = styled.main`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
`

export const AuthCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing['2xl']};
  width: 100%;
  max-width: 420px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xl};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`

export const AuthLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

export const AuthLogoCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.white};
`

export const AuthLogoText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.02em;
`

export const AuthTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

export const AuthSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

export const AuthError = styled.div`
  background-color: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.error};
`

export const AuthLink = styled.div`
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: ${({ theme }) => theme.spacing.md};

  a {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.navyHover};
    }
  }
`

export const PasswordWrapper = styled.div`
  position: relative;
`

export const InputHint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
`

export const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.navy};
  }
`

/* ── Split-panel layout (LoginPage only) ── */

export const SplitPage = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  padding-top: ${({ theme }) => theme.layout.demoBannerHeight};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

export const BrandPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.navy};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 56px 44px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(212,168,67,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(212,168,67,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

export const BrandPanelDotGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`

export const BrandLine = styled.div`
  width: 2px;
  height: 48px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ theme }) => theme.colors.accent} 20%,
    ${({ theme }) => theme.colors.accent} 80%,
    transparent 100%
  );
  margin-bottom: 20px;
`

export const BrandName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
  margin-bottom: 4px;

  span { color: ${({ theme }) => theme.colors.accent}; }
`

export const BrandTagline = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.58);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 36px;
`

export const BrandFeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const BrandFeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.72);
  line-height: 1.4;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    flex-shrink: 0;
  }
`

export const BrandFooter = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.30);
  letter-spacing: 0.05em;
`

export const FormPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background-color: ${({ theme }) => theme.colors.navy};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

export const FormPanelInner = styled.div`
  width: 100%;
  max-width: 380px;
`
