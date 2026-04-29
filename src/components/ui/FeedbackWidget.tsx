import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styled, { keyframes, css } from 'styled-components'

// ─── Pure functions (exported for tests) ─────────────────────────────────────

const PAGE_MAP: Record<string, string> = {
  '/': 'Accueil',
  '/nouveautes': 'Nouveautés',
  '/fonds': 'Fonds',
  '/top-ventes': 'Top Ventes',
  '/selections': 'Sélections',
  '/flash-infos': 'Flash Infos',
  '/panier': 'Panier',
  '/mon-compte': 'Mon Compte',
  '/historique': 'Historique',
}

export function getPageName(pathname: string): string {
  if (PAGE_MAP[pathname]) return PAGE_MAP[pathname]
  if (pathname.startsWith('/produit/')) return 'Fiche produit'
  return 'Page inconnue'
}

export function isFeedbackValid(message: string): boolean {
  return message.trim().length <= 500
}

// ─── Animations ───────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// ─── Styled components ────────────────────────────────────────────────────────

const FAB = styled.button<{ $open: boolean }>`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.bottomNavHeight} + 16px);
  right: 20px;
  z-index: 900;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: background 200ms ease, transform 150ms ease, box-shadow 200ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    transition: opacity 150ms ease;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: calc(${({ theme }) => theme.layout.footerHeight} + 24px);
    right: 28px;
    width: 56px;
    height: 56px;
  }
`

const Panel = styled.div`
  position: fixed;
  bottom: calc(${({ theme }) => theme.layout.bottomNavHeight} + 80px);
  right: 20px;
  z-index: 900;
  width: min(340px, calc(100vw - 40px));
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: ${css`${slideUp}`} 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: calc(${({ theme }) => theme.layout.footerHeight} + 84px);
    right: 28px;
  }
`

const PanelHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`

const HeaderCloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  opacity: 0.75;
  transition: opacity 150ms ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  flex: 1;
`

const PanelBody = styled.div`
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const InfoBanner = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  background: ${({ theme }) => theme.colors.accentLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: 0 6px 6px 0;
  padding: 8px 10px;
  line-height: 1.45;
`

const PageLabel = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.gray[800]};
  background: ${({ theme }) => theme.colors.white};
  resize: vertical;
  transition: border-color 150ms ease;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const CharCount = styled.div<{ $warn: boolean }>`
  font-size: 0.72rem;
  text-align: right;
  color: ${({ theme, $warn }) => ($warn ? theme.colors.error : theme.colors.gray[400])};
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease, opacity 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const SuccessState = styled.div`
  padding: 20px 18px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  animation: ${css`${fadeIn}`} 300ms ease both;
`

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.navyLight};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const SuccessTitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const SuccessText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
`

const ErrorMsg = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.error};
  background: #fef2f2;
  border-radius: 6px;
  padding: 8px 10px;
`

const Spinner = styled.span`
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2.5px solid rgba(201, 168, 76, 0.3);
  border-top-color: ${({ theme }) => theme.colors.accent};
  animation: ${css`${spin}`} 0.7s linear infinite;
`

const ScreenshotRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const ScreenshotThumb = styled.button`
  padding: 0;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  transition: border-color 150ms ease;
  background: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ScreenshotLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.45;
`

const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${css`${fadeIn}`} 150ms ease both;
  cursor: zoom-out;
`

const LightboxImg = styled.img`
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  object-fit: contain;
  cursor: default;
`

const LightboxClose = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconMessage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'success' | 'error'

export function FeedbackWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorText, setErrorText] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setLightboxOpen(false)
    setScreenshot(null)
    setMessage('')
    setStatus('idle')
    setErrorText('')
  }, [pathname])

  const pageName = getPageName(pathname)
  const charCount = message.trim().length
  const tooLong = charCount > 500
  const canSubmit = isFeedbackValid(message) && status !== 'loading'

  async function handleFabClick() {
    if (open) {
      handleClose()
      return
    }
    setCapturing(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      })
      setScreenshot(canvas.toDataURL('image/jpeg', 0.65))
    } catch {
      setScreenshot(null)
    } finally {
      setCapturing(false)
      setOpen(true)
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setStatus('loading')
    setErrorText('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), page: pageName, screenshot }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erreur serveur')
      }

      setStatus('success')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setErrorText(err instanceof Error ? err.message : 'Impossible d\'envoyer le feedback.')
    }
  }

  function handleClose() {
    setOpen(false)
    setLightboxOpen(false)
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setStatus('idle')
        setErrorText('')
      }, 300)
    }
  }

  return (
    <>
      <FAB
        $open={open}
        onClick={handleFabClick}
        disabled={capturing}
        aria-label={open ? 'Fermer le feedback' : capturing ? 'Capture en cours…' : 'Donner un feedback'}
        title={open ? 'Fermer' : capturing ? 'Capture en cours…' : 'Feedback'}
      >
        {capturing ? <Spinner /> : open ? <IconClose /> : <IconMessage />}
      </FAB>

      {lightboxOpen && screenshot && (
        <LightboxOverlay onClick={() => setLightboxOpen(false)}>
          <LightboxImg
            src={screenshot}
            alt="Capture d'écran plein écran"
            onClick={(e) => e.stopPropagation()}
          />
          <LightboxClose aria-label="Fermer la capture d'écran">
            <IconClose />
          </LightboxClose>
        </LightboxOverlay>
      )}

      {open && (
        <Panel role="dialog" aria-label="Formulaire de feedback">
          <PanelHeader>
            <IconMessage />
            <PanelTitle>Votre avis</PanelTitle>
            <HeaderCloseBtn onClick={handleClose} aria-label="Fermer">
              <IconClose />
            </HeaderCloseBtn>
          </PanelHeader>

          {status === 'success' ? (
            <SuccessState>
              <SuccessIcon>
                <IconCheck />
              </SuccessIcon>
              <SuccessTitle>Merci pour votre feedback !</SuccessTitle>
              <SuccessText>
                Votre message a bien été transmis au développeur.
              </SuccessText>
            </SuccessState>
          ) : (
            <PanelBody>
              <InfoBanner>
                Votre feedback sera envoyé par email au développeur du site. Envoi anonyme.
              </InfoBanner>

              <PageLabel>
                <IconMapPin />
                Page actuelle : <span>{pageName}</span>
              </PageLabel>

              {screenshot && (
                <ScreenshotRow>
                  <ScreenshotThumb
                    onClick={() => setLightboxOpen(true)}
                    title="Voir en grand"
                    aria-label="Voir la capture d'écran en plein écran"
                  >
                    <img src={screenshot} alt="Capture d'écran" />
                  </ScreenshotThumb>
                  <ScreenshotLabel>Capture d'écran jointe — cliquer pour agrandir</ScreenshotLabel>
                </ScreenshotRow>
              )}

              <div>
                <label htmlFor="feedback-msg" style={{ display: 'none' }}>
                  Votre message
                </label>
                <Textarea
                  id="feedback-msg"
                  placeholder="Décrivez votre retour…"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  disabled={status === 'loading'}
                  aria-describedby="feedback-charcount"
                />
                <CharCount id="feedback-charcount" $warn={tooLong}>
                  {charCount}/500
                </CharCount>
              </div>

              {status === 'error' && errorText && (
                <ErrorMsg role="alert">{errorText} — Réessayez.</ErrorMsg>
              )}

              <SubmitButton
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-busy={status === 'loading'}
              >
                {status === 'loading' ? (
                  'Envoi en cours…'
                ) : (
                  <>
                    <IconSend />
                    Envoyer
                  </>
                )}
              </SubmitButton>
            </PanelBody>
          )}
        </Panel>
      )}
    </>
  )
}
