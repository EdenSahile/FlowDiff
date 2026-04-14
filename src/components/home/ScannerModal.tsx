import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type ScannerState = 'requesting' | 'scanning' | 'error' | 'no-camera'

/* ─────────────────────────────────────────
   Animations
───────────────────────────────────────── */
const fadeIn  = keyframes`from{opacity:0}to{opacity:1}`
const slideUp = keyframes`from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}`
const scanAnim = keyframes`
  0%  {top:12%;opacity:1}
  90% {top:78%;opacity:1}
  100%{top:78%;opacity:0}
`

/* ─────────────────────────────────────────
   Styled
───────────────────────────────────────── */
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.85);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  z-index:200;animation:${fadeIn} .2s ease;padding:${({theme})=>theme.spacing.md};
`
const Modal = styled.div`
  background:${({theme})=>theme.colors.navy};border-radius:${({theme})=>theme.radii.xl};
  overflow:hidden;width:100%;max-width:480px;
  animation:${slideUp} .25s ease;box-shadow:${({theme})=>theme.shadows.lg};
`
const ModalHeader = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:${({theme})=>theme.spacing.md} ${({theme})=>theme.spacing.lg};
  border-bottom:1px solid rgba(255,255,255,.1);
`
const ModalTitle = styled.h2`
  font-family:${({theme})=>theme.typography.fontFamily};
  font-size:${({theme})=>theme.typography.sizes.lg};
  font-weight:${({theme})=>theme.typography.weights.bold};
  color:${({theme})=>theme.colors.white};
`
const CloseButton = styled.button`
  width:32px;height:32px;background:rgba(255,255,255,.1);border:none;
  border-radius:${({theme})=>theme.radii.full};color:${({theme})=>theme.colors.white};
  cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;
  transition:background .15s;&:hover{background:rgba(255,255,255,.2);}
`
const VideoWrapper = styled.div`
  position:relative;width:100%;aspect-ratio:4/3;background:#000;overflow:hidden;
`
const Video = styled.video`
  width:100%;height:100%;object-fit:cover;display:block;
`
const ScanFrame = styled.div`
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;
`
const FrameBox = styled.div`
  position:relative;width:70%;height:50%;
  border:2px solid ${({theme})=>theme.colors.primary};border-radius:${({theme})=>theme.radii.md};
  &::before,&::after{content:'';position:absolute;width:20px;height:20px;
    border-color:${({theme})=>theme.colors.primary};border-style:solid;}
  &::before{top:-3px;left:-3px;border-width:3px 0 0 3px;border-radius:4px 0 0 0;}
  &::after{bottom:-3px;right:-3px;border-width:0 3px 3px 0;border-radius:0 0 4px 0;}
`
const ScanLine = styled.div`
  position:absolute;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,${({theme})=>theme.colors.primary},transparent);
  animation:${scanAnim} 2s ease-in-out infinite;
`
const EngineTag = styled.div`
  position:absolute;bottom:8px;right:10px;font-family:monospace;
  font-size:10px;color:rgba(255,255,255,.4);pointer-events:none;
`
const ModalBody = styled.div`
  padding:${({theme})=>theme.spacing.lg};display:flex;flex-direction:column;
  gap:${({theme})=>theme.spacing.md};
`
const StatusText = styled.p`
  font-family:${({theme})=>theme.typography.fontFamily};
  font-size:${({theme})=>theme.typography.sizes.sm};
  color:rgba(255,255,255,.75);text-align:center;
`
const ErrorBox = styled.div`
  background:rgba(211,47,47,.15);border:1px solid rgba(211,47,47,.4);
  border-radius:${({theme})=>theme.radii.md};padding:${({theme})=>theme.spacing.md};
  font-family:${({theme})=>theme.typography.fontFamily};
  font-size:${({theme})=>theme.typography.sizes.sm};color:#FFCDD2;text-align:center;
`
const Divider = styled.div`
  display:flex;align-items:center;gap:${({theme})=>theme.spacing.md};
  color:rgba(255,255,255,.3);font-family:${({theme})=>theme.typography.fontFamily};
  font-size:${({theme})=>theme.typography.sizes.xs};
  &::before,&::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.15);}
`
const ManualForm = styled.form`
  display:flex;gap:${({theme})=>theme.spacing.sm};align-items:flex-start;
`

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
interface Props { onClose: () => void }

export function ScannerModal({ onClose }: Props) {
  const navigate    = useNavigate()
  const videoRef    = useRef<HTMLVideoElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const doneRef     = useRef(false)

  const [state,     setState]     = useState<ScannerState>('requesting')
  const [errorMsg,  setErrorMsg]  = useState('')
  const [scanning,  setScanning]  = useState(false)
  const [manualEan, setManualEan] = useState('')
  const [manualErr, setManualErr] = useState('')

  /* ── Navigation après détection ── */
  const handleDetected = (ean: string) => {
    if (doneRef.current) return
    doneRef.current = true
    controlsRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    onClose()
    navigate(`/recherche?q=${encodeURIComponent(ean)}`)
  }

  useEffect(() => {
    let cancelled = false
    // Reset obligatoire : React 18 StrictMode fait mount → cleanup (doneRef=true) → remount.
    // Sans ce reset, le scan s'arrête immédiatement au remount.
    doneRef.current = false
    controlsRef.current = null

    const start = async () => {
      try {
        /* 1 — Vérifier la présence d'une caméra */
        const devices = await navigator.mediaDevices.enumerateDevices()
        if (!devices.some(d => d.kind === 'videoinput')) {
          if (!cancelled) setState('no-camera')
          return
        }

        /* 2 — Ouvrir le flux vidéo (haute résolution + autofocus pour les petits codes-barres) */
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width:  { ideal: 1920 },
            height: { ideal: 1080 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...({ focusMode: { ideal: 'continuous' } } as any),
          },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        if (cancelled) return

        setState('scanning')

        /* 3 — Charger ZXing et démarrer le scan via l'API officielle */
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')
        if (cancelled) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hints = new Map<any, any>([
          [DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
            BarcodeFormat.CODE_128, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          ]],
          [DecodeHintType.TRY_HARDER, true],
        ])

        const reader = new BrowserMultiFormatReader(hints)

        /* 4 — decodeFromStream : ZXing gère le timing vidéo en interne (plus fiable que canvas manuel) */
        const controls = await reader.decodeFromStream(stream, video, (result, err) => {
          if (cancelled || doneRef.current) return
          if (result) {
            console.log('[ZXing] HIT:', result.getText())
            handleDetected(result.getText())
          } else if (err && !/NotFoundException/i.test(err.name)) {
            console.warn('[ZXing] err:', err.message)
          }
        })

        if (cancelled) { controls.stop(); return }
        controlsRef.current = controls
        setScanning(true)

      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        if (/NotAllowed|Permission|denied/i.test(msg)) {
          setErrorMsg("Permission caméra refusée. Autorisez l'accès dans les paramètres du navigateur.")
        } else if (/NotFound|DevicesNotFound/i.test(msg)) {
          setState('no-camera'); return
        } else {
          setErrorMsg(`Impossible d'accéder à la caméra : ${msg}`)
        }
        setState('error')
      }
    }

    start()

    return () => {
      cancelled = true
      doneRef.current = true
      controlsRef.current?.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Saisie manuelle ── */
  const handleManual = (e: React.FormEvent) => {
    e.preventDefault()
    const ean = manualEan.trim().replace(/\s/g, '')
    if (!/^\d{8,14}$/.test(ean)) { setManualErr('EAN invalide — 8 à 14 chiffres.'); return }
    onClose()
    navigate(`/recherche?q=${encodeURIComponent(ean)}`)
  }

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal>
      <Modal>
        <ModalHeader>
          <ModalTitle>Scanner un code-barres</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Fermer">✕</CloseButton>
        </ModalHeader>

        <VideoWrapper>
          <Video ref={videoRef} autoPlay playsInline muted />
          {state === 'scanning' && <ScanFrame><FrameBox><ScanLine /></FrameBox></ScanFrame>}
          {scanning && <EngineTag>zxing</EngineTag>}
        </VideoWrapper>

        <ModalBody>
          {state === 'requesting' && <StatusText>Demande d'accès à la caméra…</StatusText>}
          {state === 'scanning'   && <StatusText>Pointez le code-barres vers la caméra</StatusText>}
          {state === 'error'      && <ErrorBox>{errorMsg}</ErrorBox>}
          {state === 'no-camera'  && <ErrorBox>Aucune caméra détectée sur cet appareil.</ErrorBox>}

          <Divider>ou saisir l'EAN manuellement</Divider>

          <ManualForm onSubmit={handleManual}>
            <div style={{ flex: 1 }}>
              <Input
                id="manual-ean" type="text" inputMode="numeric"
                placeholder="9782070360024"
                value={manualEan}
                onChange={e => { setManualEan(e.target.value); if (manualErr) setManualErr('') }}
                error={manualErr}
                aria-label="EAN du livre"
              />
            </div>
            <Button type="submit" variant="primary" size="md" style={{ marginTop: '2px' }}>OK</Button>
          </ManualForm>
        </ModalBody>
      </Modal>
    </Overlay>
  )
}
