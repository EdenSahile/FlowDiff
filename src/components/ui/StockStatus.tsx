import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import type { StockStatut } from '@/data/mockBooks'

/* ── Palette par statut ── */
const STATUT_CONFIG: Record<StockStatut, { icon: string; label: string; color: string }> = {
  disponible:   { icon: '✅', label: 'Disponible',      color: '#2E7D32' },
  stock_limite: { icon: '⚠️', label: 'Stock limité',    color: '#C17E00' },
  sur_commande: { icon: '🔄', label: 'Sur commande',    color: '#5B7A9E' },
  en_reimp:     { icon: '🔁', label: 'En réimpression', color: '#A07040' },
  epuise:       { icon: '❌', label: 'Épuisé',          color: '#999999' },
}

const STATUTS_WITH_TOOLTIP: ReadonlyArray<StockStatut> = ['sur_commande', 'en_reimp']

export function getTooltipText(statut: StockStatut, delaiReimp: string | undefined): string | null {
  if (statut === 'sur_commande') {
    return "Commandé spécialement auprès de l'éditeur — délai 7 à 15 jours ouvrés"
  }
  if (statut === 'en_reimp') {
    return delaiReimp ? `Délai prévu : ${delaiReimp}` : 'Délai non communiqué'
  }
  return null
}

/* ── Styled ── */
const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const Text = styled.span<{ $color: string }>`
  font-size: 11.5px;
  font-weight: 500;
  color: ${({ $color }) => $color};
  line-height: 1.2;
`

const InfoIcon = styled.span`
  font-size: 11px;
  color: #AAAAAA;
  cursor: help;
  line-height: 1;
  flex-shrink: 0;
`

const Tooltip = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  transform: translateY(-100%) translateY(-6px);
  background: #1E3A5F;
  color: #ffffff;
  font-size: 11px;
  line-height: 1.45;
  padding: 6px 10px;
  border-radius: 6px;
  max-width: 240px;
  white-space: normal;
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`

/* ── Component ── */
export interface StockStatusProps {
  statut: StockStatut
  delaiReimp?: string
  className?: string
}

export function StockStatus({ statut, delaiReimp, className }: StockStatusProps) {
  const { icon, label, color } = STATUT_CONFIG[statut]
  const tooltipText = getTooltipText(statut, delaiReimp)
  const hasTooltip = STATUTS_WITH_TOOLTIP.includes(statut) && tooltipText !== null

  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const showTooltip = useCallback(() => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setTooltipPos({ top: rect.top, left: rect.left + rect.width / 2 })
  }, [])

  const hideTooltip = useCallback(() => setTooltipPos(null), [])

  return (
    <Wrap className={className}>
      <Text $color={color}>
        {icon} {label}
      </Text>
      {hasTooltip && (
        <InfoIcon
          ref={iconRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          aria-label={tooltipText ?? undefined}
          role="img"
        >
          ⓘ
        </InfoIcon>
      )}
      {hasTooltip && tooltipPos && tooltipText && createPortal(
        <Tooltip $top={tooltipPos.top} $left={tooltipPos.left}>
          {tooltipText}
        </Tooltip>,
        document.body,
      )}
    </Wrap>
  )
}
