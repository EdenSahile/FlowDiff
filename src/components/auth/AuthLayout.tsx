import styled from 'styled-components'
import { mq } from '@/lib/responsive'

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

  ${mq.belowMd} {
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
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  ${mq.md} {
    color: ${({ theme }) => theme.colors.navy};
  }
`

export const AuthSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  ${mq.md} {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
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
  color: rgba(255, 255, 255, 0.55);
  margin-top: ${({ theme }) => theme.spacing.md};

  a {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  ${mq.md} {
    color: ${({ theme }) => theme.colors.gray[600]};

    a {
      color: ${({ theme }) => theme.colors.navy};

      &:hover {
        color: ${({ theme }) => theme.colors.navyHover};
        opacity: 1;
      }
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
  grid-template-columns: 1fr;
  min-height: 100vh;

  ${mq.md} {
    grid-template-columns: 1fr 1fr;
  }
`

export const BrandPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.navy};
  position: relative;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 56px 44px;
  overflow: hidden;
  min-width: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(212,168,67,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(212,168,67,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  ${mq.md} {
    display: flex;
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

export const BrandHeadline = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 34px;
  font-weight: 700;
  color: #fff;
  line-height: 1.22;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;

  em {
    font-style: normal;
    color: ${({ theme }) => theme.colors.accent};
  }
`

export const BrandSub = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255,255,255,0.58);
  line-height: 1.65;
  max-width: 340px;
  position: relative;
  z-index: 1;
`

export const BrandStatsRow = styled.div`
  display: flex;
  gap: 40px;
  position: relative;
  z-index: 1;
  margin-top: 52px;
`

export const BrandStatItem = styled.div``

export const BrandStatNum = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: -0.03em;
  line-height: 1;
`

export const BrandStatLabel = styled.div`
  font-size: 11px;
  font-weight: 400;
  color: rgba(255,255,255,0.45);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const BrandStatSep = styled.div`
  width: 1px;
  align-self: stretch;
  background: rgba(255,255,255,0.08);
`

export const BrandQuote = styled.blockquote`
  position: relative;
  z-index: 1;
  margin-top: 40px;
  padding: 20px 24px;
  border-left: 2px solid ${({ theme }) => theme.colors.accent};
  background: rgba(255,255,255,0.04);
  border-radius: 0 6px 6px 0;

  p {
    font-size: 13px;
    font-style: italic;
    font-weight: 300;
    color: rgba(255,255,255,0.72);
    line-height: 1.6;
    margin-bottom: 8px;
  }

  cite {
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.accent};
    opacity: 0.8;
    letter-spacing: 0.05em;
  }
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

export const FormEyebrow = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 24px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 2px;
    flex-shrink: 0;
  }
`

export const FormPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.navy};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px ${({ theme }) => theme.spacing.md};
  min-width: 0;

  ${mq.md} {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    align-items: center;
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  }
`

export const FormPanelInner = styled.div`
  width: 100%;
  max-width: 380px;
  min-width: 0;
`
