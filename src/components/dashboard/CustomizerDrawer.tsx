import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import type { DashboardConfig, DashboardZone, ConfigItem } from '../../hooks/useDashboardConfig'

/* ── Label + section maps ── */

const LABEL: Record<string, string> = {
  'action-offices':     'Office à valider',
  'action-panier':      'Panier',
  'action-commandes':   'Commandes à vérifier',
  'action-edi-error':   'Erreur EDI à corriger',
  'action-expeditions': 'Expéditions en retard',
  'kpi-commandes':      'Commandes passées',
  'kpi-montant':        'Montant total commandé',
  'kpi-exemplaires':    'Exemplaires commandés',
  'kpi-panier-moyen':   'Panier moyen',
  'kpi-delai':          'Délai moyen de livraison',
  'kpi-rupture':        'Taux de rupture',
  'kpi-references':     'Références distinctes',
  'panel-evolution':    'Évolution des commandes',
  'panel-donut':        'Répartition des achats',
  'panel-editeurs':     'Top éditeurs',
  'panel-edi':          'Suivi des flux EDI',
  'panel-nouveautes':   'Nouveautés du mois',
  'panel-raccourcis':   'Raccourcis',
}

const SECTIONS: { zone: DashboardZone; title: string }[] = [
  { zone: 'actionCards',  title: 'Actions en attente' },
  { zone: 'kpiCards',     title: 'Indicateurs KPI'    },
  { zone: 'mainPanels',   title: 'Analyses'           },
  { zone: 'bottomPanels', title: 'Widgets'            },
]

/* ── Styled components ── */

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 200;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 300ms ease;
`

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 100vw;
  height: 100dvh;
  background: white;
  border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
  z-index: 201;
  display: flex;
  flex-direction: column;
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 300ms ease;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
`

const DrawerTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 18px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.gray[600]};
  &:hover { color: ${({ theme }) => theme.colors.gray[800]}; }
`

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 8px;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 14px 20px 4px;
`

const ItemRow = styled.div<{ $dragging: boolean; $dropTarget: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: white;
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  border-top: 2px solid ${({ $dropTarget }) => ($dropTarget ? '#2563EB' : 'transparent')};
  transition: border-color 0.1s, opacity 0.1s;
  cursor: default;
`

const DragHandle = styled.div`
  cursor: grab;
  color: ${({ theme }) => theme.colors.gray[200]};
  font-size: 15px;
  flex-shrink: 0;
  user-select: none;
  line-height: 1;

  @media (max-width: 768px) {
    display: none;
  }
`

const MobileArrows = styled.div`
  display: none;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: flex;
  }
`

const ArrowBtn = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  padding: 1px 5px;
  font-size: 9px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  &:disabled { opacity: 0.3; cursor: default; }
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const ItemLabel = styled.span<{ $hidden: boolean }>`
  flex: 1;
  font-size: 13px;
  color: ${({ $hidden, theme }) => ($hidden ? theme.colors.gray[400] : theme.colors.gray[800])};
  text-decoration: ${({ $hidden }) => ($hidden ? 'line-through' : 'none')};
`

const ToggleBtn = styled.button<{ $visible: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  color: ${({ $visible, theme }) => ($visible ? theme.colors.gray[600] : theme.colors.gray[200])};
  display: flex;
  align-items: center;
  &:disabled { cursor: not-allowed; opacity: 0.35; }
  &:hover:not(:disabled) { color: ${({ theme }) => theme.colors.gray[800]}; }
`

const DrawerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
`

const ResetBtn = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 8px 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

const CloseFooterBtn = styled.button`
  background: ${({ theme }) => theme.colors.navy};
  border: none;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

/* ── SVG icons ── */

function IconEyeOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

/* ── Component ── */

interface Props {
  open: boolean
  onClose: () => void
  config: DashboardConfig
  onReorder: (zone: DashboardZone, fromIdx: number, toIdx: number) => void
  onToggle: (zone: DashboardZone, id: string) => void
  onReset: () => void
}

export function CustomizerDrawer({ open, onClose, config, onReorder, onToggle, onReset }: Props) {
  const dragRef = useRef<{ zone: DashboardZone; idx: number } | null>(null)
  const [dragging, setDragging] = useState<{ zone: DashboardZone; idx: number } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ zone: DashboardZone; idx: number } | null>(null)

  function handleDragStart(zone: DashboardZone, idx: number) {
    dragRef.current = { zone, idx }
    setDragging({ zone, idx })
  }

  function handleDragOver(e: React.DragEvent, zone: DashboardZone, idx: number) {
    e.preventDefault()
    if (dragRef.current?.zone === zone) setDropTarget({ zone, idx })
  }

  function handleDrop(zone: DashboardZone, toIdx: number) {
    if (!dragRef.current || dragRef.current.zone !== zone) return
    if (dragRef.current.idx !== toIdx) onReorder(zone, dragRef.current.idx, toIdx)
    dragRef.current = null
    setDragging(null)
    setDropTarget(null)
  }

  function handleDragEnd() {
    dragRef.current = null
    setDragging(null)
    setDropTarget(null)
  }

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Personnaliser le tableau de bord"
      >
        <DrawerHeader>
          <DrawerTitle>Personnaliser le tableau de bord</DrawerTitle>
          <CloseBtn onClick={onClose} aria-label="Fermer">✕</CloseBtn>
        </DrawerHeader>

        <DrawerBody>
          {SECTIONS.map(({ zone, title }) => {
            const items: ConfigItem[] = config[zone]
            const visibleCount = items.filter(i => i.visible).length
            return (
              <div key={zone}>
                <SectionLabel>{title}</SectionLabel>
                {items.map((item, idx) => {
                  const isDragging = dragging?.zone === zone && dragging.idx === idx
                  const isDropTarget = dropTarget?.zone === zone && dropTarget.idx === idx
                  const isLastVisible = item.visible && visibleCount === 1
                  return (
                    <ItemRow
                      key={item.id}
                      $dragging={isDragging}
                      $dropTarget={isDropTarget}
                      draggable
                      onDragStart={() => handleDragStart(zone, idx)}
                      onDragOver={e => handleDragOver(e, zone, idx)}
                      onDrop={() => handleDrop(zone, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <DragHandle title="Glisser pour réordonner">⠿</DragHandle>
                      <MobileArrows>
                        <ArrowBtn
                          disabled={idx === 0}
                          onClick={() => onReorder(zone, idx, idx - 1)}
                          aria-label="Monter"
                        >▲</ArrowBtn>
                        <ArrowBtn
                          disabled={idx === items.length - 1}
                          onClick={() => onReorder(zone, idx, idx + 1)}
                          aria-label="Descendre"
                        >▼</ArrowBtn>
                      </MobileArrows>
                      <ItemLabel $hidden={!item.visible}>
                        {LABEL[item.id] ?? item.id}
                      </ItemLabel>
                      <ToggleBtn
                        $visible={item.visible}
                        disabled={isLastVisible}
                        onClick={() => onToggle(zone, item.id)}
                        title={item.visible ? 'Masquer' : 'Afficher'}
                        aria-label={item.visible ? 'Masquer' : 'Afficher'}
                      >
                        {item.visible ? <IconEyeOpen /> : <IconEyeOff />}
                      </ToggleBtn>
                    </ItemRow>
                  )
                })}
              </div>
            )
          })}
        </DrawerBody>

        <DrawerFooter>
          <ResetBtn onClick={onReset}>Réinitialiser par défaut</ResetBtn>
          <CloseFooterBtn onClick={onClose}>Fermer</CloseFooterBtn>
        </DrawerFooter>
      </Panel>
    </>
  )
}
