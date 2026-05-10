import { useState, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useCart, REMISE_RATES, getItemKey } from '@/contexts/CartContext'
import { useOrders } from '@/contexts/OrdersContext'
import { useAuth } from '@/hooks/useAuth'
import { BookCover } from '@/components/catalogue/BookCover'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { useToast } from '@/contexts/ToastContext'
import { theme } from '@/lib/theme'
import { mq } from '@/lib/responsive'
import { CHECKOUT_STEPS, type CheckoutStep, getNextStep, getPrevStep, getStepIndex, getStepLabel } from './checkoutSteps'
import { addressSchema, parseAddressString, type AddressData, type TransmissionMode } from './checkoutSchemas'
import { OrderTransmissionStep } from './OrderTransmissionStep'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconTrash, IconCart, IconChevronLeft } from '@/components/ui/icons'
import { BackButton } from '@/components/ui/BackButton'

/* ── SVG Icons ── */
function IconScreen() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', color: theme.colors.success }}>
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function IconCheckSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  )
}

/* ── Animations ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

/* ══════════════════════════════════════════════════════
   LAYOUT GÉNÉRAL
══════════════════════════════════════════════════════ */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 720px;
  margin: 0 auto;
  overflow-x: hidden;
  animation: ${fadeIn} .25s ease;

  ${mq.sm} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ClientCode = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ClientCodeBold = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

const ClearCartBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  min-height: 36px;
  border: 1.5px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.md};
  background: none;
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
  transition: background .15s, color .15s;
  &:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.error}; outline-offset: 2px; }
`

/* ══════════════════════════════════════════════════════
   RÉSUMÉ FINANCIER
══════════════════════════════════════════════════════ */
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.white};
`

const SummaryTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: .75;
  text-transform: uppercase;
  letter-spacing: .05em;
`

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ $total, theme }) => $total ? theme.typography.sizes.xl : theme.typography.sizes.sm};
  font-weight: ${({ $total, theme }) => $total ? theme.typography.weights.bold : theme.typography.weights.normal};
  border-top: ${({ $total }) => $total ? '1px solid rgba(255,255,255,.2)' : 'none'};
  margin-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '0'};
  padding-top: ${({ $total, theme }) => $total ? theme.spacing.sm : '5px'};
`

const SummaryLabel = styled.span`opacity: .8;`
const SummaryValue = styled.span``

const RemiseBadge = styled.span`
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 6px;
  margin-left: ${({ theme }) => theme.spacing.xs};
`

/* ══════════════════════════════════════════════════════
   SECTION + TITRES INDIVIDUELS
══════════════════════════════════════════════════════ */
const Section = styled.section`margin-bottom: ${({ theme }) => theme.spacing.xl};`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ItemCard = styled.div<{ $ebook?: boolean }>`
  background: ${({ $ebook, theme }) => $ebook ? theme.colors.accentLight : theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EbookFormatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 8px;
  margin-bottom: 3px;
`

const EbookPlatformTag = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}18;
  border: 1px solid ${({ $color }) => $color}35;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 2px 8px;
  margin-left: 6px;
`

const ItemInfo = styled.div`flex: 1; min-width: 0;`

const ItemTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ItemAuthor = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 2px;
`

const ItemStatutLine = styled.p<{ $variant: 'sur_commande' | 'reimp' }>`
  margin: 2px 0 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 500;
  color: ${({ $variant }) => $variant === 'reimp' ? '#B65A00' : '#1C3252'};
`

const ItemIsbn = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  letter-spacing: 0.02em;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ItemFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PriceStrip = styled.div`
  display: flex;
  width: 100%;
  align-items: stretch;
  background: rgba(28, 58, 95, 0.03);
  border: 1px solid rgba(28, 58, 95, 0.10);
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  margin-top: 6px;
`

const PriceCell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 6px;

  ${mq.sm} {
    padding: 5px 12px;
  }

  & + & {
    border-left: 1px solid rgba(28, 58, 95, 0.08);
  }
`

const PriceCellLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1;
`

const PriceCellValue = styled.span<{ $gold?: boolean; $emphasis?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: ${({ $emphasis }) => $emphasis ? '13px' : '12px'};
  font-weight: ${({ $emphasis }) => $emphasis ? '700' : '500'};
  color: ${({ $gold, theme }) => $gold ? '#B8860B' : theme.colors.navy};
  white-space: nowrap;
  margin-top: 3px;
  letter-spacing: -0.01em;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`

const QtyBtn = styled.button`
  width: 44px; height: 44px;
  background: none; border: none; cursor: pointer;
  font-size: 1.1rem; color: ${({ theme }) => theme.colors.navy};
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  border-radius: ${({ theme }) => theme.radii.sm};
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.navy}; outline-offset: 1px; }
  &:disabled { opacity: .35; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 32px; text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const DeleteBtn = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color .15s, background .15s;
  &:hover { color: ${({ theme }) => theme.colors.error}; background: ${({ theme }) => theme.colors.gray[100]}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.error}; outline-offset: 1px; color: ${({ theme }) => theme.colors.error}; }
`

/* ══════════════════════════════════════════════════════
   BLOC OP
══════════════════════════════════════════════════════ */
const OPBlock = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.navy};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
`

const OPHeader = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const OPHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const OPTag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.sm};
  align-self: flex-start;
  margin-bottom: 2px;
`

const OPTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OPDesc = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.65);
`

const OPValidity = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
`

const OPDeleteBtn = styled.button`
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  color: rgba(255,255,255,0.75);
  padding: 0 14px;
  min-height: 44px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s, color .15s;
  &:hover { background: rgba(255,255,255,0.22); color: #fff; }
  &:focus-visible { outline: 2px solid rgba(255,255,255,0.8); outline-offset: 2px; }
`

const OPTable = styled.div`
  background: ${({ theme }) => theme.colors.white};
`

const OPRow = styled.div<{ $variant?: 'book' | 'cadeau' | 'plv' | 'total' }>`
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  align-items: center;
  gap: 0;
  padding: 0 14px;
  min-height: ${({ $variant }) =>
    $variant === 'total' ? '40px' :
    $variant === 'book'  ? '72px' : '52px'};
  background: ${({ $variant, theme }) =>
    $variant === 'cadeau' ? theme.colors.primaryLight :
    $variant === 'plv'    ? theme.colors.accentLight :
    $variant === 'total'  ? theme.colors.gray[50] :
    theme.colors.white};
  border-top: ${({ $variant, theme }) =>
    $variant === 'total'  ? `2px solid ${theme.colors.gray[200]}` :
    $variant === 'cadeau' ? `1px dashed ${theme.colors.gray[200]}` :
    $variant === 'plv'    ? `1px dashed ${theme.colors.accent}` :
    `1px solid ${theme.colors.gray[50]}`};

  ${mq.md} {
    grid-template-columns: 44px 1fr auto auto auto;
  }
`

const OPCover = styled.div`
  padding: 6px 10px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const OPText = styled.div`min-width: 0; padding: 6px 8px 6px 0;`

const OPRowTitle = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OPRowMeta = styled.div`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 1px;
`

const OPRowIsbn = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  letter-spacing: 0.02em;
  margin-top: 1px;
`

const OPCell = styled.div<{ $color?: string; $bold?: boolean }>`
  text-align: right;
  font-size: 12px;
  font-weight: ${({ $bold }) => $bold ? 700 : 500};
  color: ${({ $color, theme }) => $color ?? theme.colors.navy};
  white-space: nowrap;
  padding: 0 6px;
  min-width: 64px;
`

const OPFooter = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2px solid ${({ theme }) => theme.colors.gray[200]};
  flex-wrap: wrap;
  gap: 8px;
`

const OPFooterStats = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
`

const OPFooterStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const OPFooterLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const OPFooterValue = styled.span<{ $highlight?: boolean }>`
  font-size: ${({ $highlight }) => $highlight ? '15px' : '12px'};
  font-weight: ${({ $highlight }) => $highlight ? 800 : 600};
  color: ${({ theme }) => theme.colors.navy};
`

/* ══════════════════════════════════════════════════════
   LIVRAISON
══════════════════════════════════════════════════════ */
const DeliveryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
`

const DatePickerWrap = styled.div`
  margin-left: calc(1rem + 20px);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DatePickerLabel = styled.label`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ══════════════════════════════════════════════════════
   ÉTATS VIDE / SUCCÈS
══════════════════════════════════════════════════════ */
const Empty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EmptySubtext = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const SuccessBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  animation: ${fadeIn} .3s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

/* ══════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════ */
const StepperWrap = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
`

const StepperItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
`

const StepperDot = styled.div<{ $active: boolean; $done: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ $active, $done, theme }) =>
    $done   ? theme.colors.success :
    $active ? theme.colors.navy   : theme.colors.gray[200]};
  color: ${({ $active, $done }) => ($active || $done) ? '#fff' : '#9ca3af'};
  z-index: 1;
  transition: background .2s, color .2s;
  flex-shrink: 0;
`

const StepperConnector = styled.div<{ $done: boolean }>`
  position: absolute;
  top: 16px;
  left: calc(50% + 18px);
  right: calc(-50% + 18px);
  height: 2px;
  background: ${({ $done, theme }) => $done ? theme.colors.success : theme.colors.gray[200]};
  transition: background .3s;
`

const StepperLabel = styled.span<{ $active: boolean; $done: boolean }>`
  margin-top: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  color: ${({ $active, $done, theme }) =>
    $active ? theme.colors.navy :
    $done   ? theme.colors.success :
    theme.colors.gray[400]};
  text-align: center;
  max-width: 68px;
  line-height: 1.3;
`

/* ══════════════════════════════════════════════════════
   FORMULAIRE ADRESSE
══════════════════════════════════════════════════════ */
const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const FormLabel = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const FormInput = styled.input<{ $hasError?: boolean }>`
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid ${({ $hasError, theme }) => $hasError ? theme.colors.error : theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  width: 100%;
  transition: border-color .15s;
  &:focus {
    outline: none;
    border-color: ${({ $hasError, theme }) => $hasError ? theme.colors.error : theme.colors.navy};
  }
`

const FormError = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
`

const SameAsDeliveryRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

/* ══════════════════════════════════════════════════════
   RECAP COMMANDE (étapes tunnel)
══════════════════════════════════════════════════════ */
const RecapCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const RecapTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const RecapRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 4px 0;
`

const AddressSummary = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 12px 14px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AddressSummaryLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 4px;
`

const AddressSummaryValue = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
`

const NavActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

/* ══════════════════════════════════════════════════════
   LAYOUT 2 COLONNES (step panier)
══════════════════════════════════════════════════════ */
const TwoColLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;

  ${mq.md} {
    grid-template-columns: 1fr 320px;
  }
`

const ItemsCol = styled.div``

const RecapCol = styled.div`
  ${mq.md} {
    position: sticky;
    top: calc(${({ theme }) => theme.layout.headerHeight} + 16px);
  }
`

const UniverseGroupLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 10px;
  margin-top: 20px;

  &:first-child { margin-top: 0; }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`

const RecapSideCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  margin-bottom: 12px;
`

const RecapSideHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RecapSideTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const RecapSideCount = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const RecapSideBody = styled.div`
  padding: 14px 18px;
`

const RecapSideRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const RecapSideDiscount = styled(RecapSideRow)`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`

const RecapSideDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin: 10px 0;
`

const RecapSideTotalLine = styled.div`
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -18px -14px;
`

const RecapSideTotalLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
`

const RecapSideTotalValue = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const ValidateBtn = styled.button`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  height: 52px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
  margin-bottom: 10px;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const EDIHint = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  padding: 8px 0;

  a {
    color: ${({ theme }) => theme.colors.navy};
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
`

const EDIHintIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 15px;
  font-weight: 700;
`

/* ══════════════════════════════════════════════════════
   TYPE & HELPERS
══════════════════════════════════════════════════════ */
type Page = 'cart' | CheckoutStep | 'success'
type DeliveryMode = 'standard' | 'specific'
type FormErrors = Partial<Record<keyof AddressData, string>>

const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €'
const today = new Date().toISOString().split('T')[0]

function fmtAddress(a: AddressData) {
  return `${a.rue}, ${a.codePostal} ${a.ville}`
}

function validateAddress(data: AddressData): FormErrors {
  const result = addressSchema.safeParse(data)
  if (result.success) return {}
  const errs: FormErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AddressData
    if (!errs[field]) errs[field] = issue.message
  }
  return errs
}

/* ══════════════════════════════════════════════════════
   SOUS-COMPOSANTS
══════════════════════════════════════════════════════ */
function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const currentIdx = getStepIndex(current)
  return (
    <StepperWrap role="list" aria-label="Étapes de la commande">
      {CHECKOUT_STEPS.map((step, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        const last   = i === CHECKOUT_STEPS.length - 1
        return (
          <StepperItem key={step} role="listitem">
            <StepperDot $active={active} $done={done} aria-label={getStepLabel(step)}>
              {done ? <IconCheckSmall /> : i + 1}
            </StepperDot>
            <StepperLabel $active={active} $done={done}>{getStepLabel(step)}</StepperLabel>
            {!last && <StepperConnector $done={done} />}
          </StepperItem>
        )
      })}
    </StepperWrap>
  )
}

function AddressFormFields({
  data, errors, onChange,
}: {
  data: AddressData
  errors: FormErrors
  onChange: (field: keyof AddressData, val: string) => void
}) {
  return (
    <FormGrid>
      <FormField>
        <FormLabel htmlFor="addr-rue">Rue / Adresse</FormLabel>
        <FormInput
          id="addr-rue"
          $hasError={!!errors.rue}
          value={data.rue}
          onChange={e => onChange('rue', e.target.value)}
          placeholder="12 rue de la Paix"
          autoComplete="street-address"
        />
        {errors.rue && <FormError>{errors.rue}</FormError>}
      </FormField>
      <FormRow>
        <FormField>
          <FormLabel htmlFor="addr-cp">Code postal</FormLabel>
          <FormInput
            id="addr-cp"
            $hasError={!!errors.codePostal}
            value={data.codePostal}
            onChange={e => onChange('codePostal', e.target.value)}
            placeholder="75001"
            maxLength={5}
            autoComplete="postal-code"
          />
          {errors.codePostal && <FormError>{errors.codePostal}</FormError>}
        </FormField>
        <FormField>
          <FormLabel htmlFor="addr-ville">Ville</FormLabel>
          <FormInput
            id="addr-ville"
            $hasError={!!errors.ville}
            value={data.ville}
            onChange={e => onChange('ville', e.target.value)}
            placeholder="Paris"
            autoComplete="address-level2"
          />
          {errors.ville && <FormError>{errors.ville}</FormError>}
        </FormField>
      </FormRow>
    </FormGrid>
  )
}

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */
export function CartPage() {
  const { markAsRead } = useNotifications()
  useEffect(() => { markAsRead('panier') }, [markAsRead])

  const { items, opGroups, totalItems, updateQty, removeFromCart, removeOP, clearCart, hasReliquatItems,
          subtotalTTC, remiseAmount, netHT, tva, totalTTC,
          transmissionMode, setTransmissionMode } = useCart()
  const { addOrder } = useOrders()
  const { showToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [page, setPage]         = useState<Page>('cart')
  const [delivery, setDelivery] = useState<DeliveryMode>('standard')
  const [specificDate, setSpecific] = useState('')
  const [confirm, setConfirm]   = useState<{ open: false } | { open: true; title: string; message: string; onConfirm: () => void }>({ open: false })

  const [deliveryAddress, setDeliveryAddress] = useState<AddressData>(() =>
    parseAddressString(user?.adresseLivraison ?? '')
  )
  const [billingAddress, setBillingAddress] = useState<AddressData>(() =>
    parseAddressString(user?.adresseLivraison ?? '')
  )
  const [sameAsDelivery, setSameAsDelivery]     = useState(true)
  const [deliveryErrors, setDeliveryErrors]     = useState<FormErrors>({})
  const [billingErrors, setBillingErrors]       = useState<FormErrors>({})
  const [localTransmission, setLocalTransmission] = useState<TransmissionMode>(transmissionMode)
  const [saveAsDefault, setSaveAsDefault]       = useState(false)

  const askConfirm = (title: string, message: string, onConfirm: () => void) =>
    setConfirm({ open: true, title, message, onConfirm })

  /* ── Taux de remise ── */
  const getUserRate = (universe: string): number => {
    if (user?.remisesParUnivers) {
      const rate = user.remisesParUnivers[universe]
      if (rate !== undefined) return rate / 100
    }
    return REMISE_RATES[universe as keyof typeof REMISE_RATES] ?? 0
  }

  /* ── Récapitulatif HT ── */
  const montantHT = subtotalTTC / 1.055

  /* ── Badge remise % (base livres uniquement, hors PLV) ── */
  const booksTTCOnly = items.reduce((s, { book, quantity }) => s + book.priceTTC * quantity, 0)
    + opGroups.reduce((s, op) => s + op.books.reduce((ss, { book, quantity }) => ss + book.priceTTC * quantity, 0), 0)
  const remisePct = booksTTCOnly > 0 ? (remiseAmount / booksTTCOnly) * 100 : 0

  const allUniverses = [
    ...items.map(i => i.book.universe),
    ...opGroups.flatMap(op => op.books.map(b => b.book.universe)),
  ]
  const universeRates = [...new Set(allUniverses)].map(u => getUserRate(u) * 100)
  const hasMultiRates = new Set(universeRates).size > 1

  const deliveryLabel = delivery === 'standard'
    ? 'Délai habituel (1–3 jours ouvrés)'
    : specificDate || 'Date à préciser'

  const hasItems = items.length > 0 || opGroups.length > 0

  /* ── Navigation tunnel ── */
  function goNext() {
    if (page === 'addresses') {
      const delivErr = validateAddress(deliveryAddress)
      if (Object.keys(delivErr).length > 0) { setDeliveryErrors(delivErr); return }
      setDeliveryErrors({})
      if (!sameAsDelivery) {
        const billErr = validateAddress(billingAddress)
        if (Object.keys(billErr).length > 0) { setBillingErrors(billErr); return }
      }
      setBillingErrors({})
    }
    if (page === 'transmission' && saveAsDefault) {
      setTransmissionMode(localTransmission)
    }
    const next = getNextStep(page as CheckoutStep)
    if (next) setPage(next)
  }

  function goBack() {
    const prev = getPrevStep(page as CheckoutStep)
    if (prev) setPage(prev)
    else setPage('cart')
  }

  function handleConfirmOrder() {
    const effectiveBilling = sameAsDelivery ? deliveryAddress : billingAddress
    const reliquat = hasReliquatItems
    addOrder({
      codeClient: user?.codeClient ?? '',
      adresseLivraison: fmtAddress(deliveryAddress),
      items,
      subtotalHT: subtotalTTC / 1.055,
      remiseAmount: remiseAmount / 1.055,
      netHT,
      tva,
      totalTTC,
      deliveryMode: delivery,
      deliveryDate: delivery === 'specific' ? specificDate : undefined,
      transmissionMode: localTransmission,
    })
    void effectiveBilling // billing address acknowledged
    clearCart()
    setPage('success')
    if (reliquat) {
      showToast('📧 Vous serez notifié par email dès l\'expédition des titres en reliquat.')
    }
  }

  /* ── Succès ── */
  if (page === 'success') return (
    <Page>
      <SuccessBox>
        <IconCheck />
        <EmptyText>Commande envoyée !</EmptyText>
        {localTransmission === 'EDI' ? (
          <>
            <EmptySubtext style={{ marginBottom: '8px' }}>
              Commande transmise via Dilicom (EDI). Vous recevrez un accusé de réception automatique.
            </EmptySubtext>
            <EmptySubtext style={{ marginBottom: '24px' }}>
              Statut EDI initial : <strong>En attente d'envoi</strong>
            </EmptySubtext>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/historique')}>
                Voir mes commandes
              </Button>
              <Button variant="ghost" size="md" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </>
        ) : (
          <>
            <EmptySubtext style={{ marginBottom: '24px' }}>
              Votre commande a bien été transmise via FlowDiff. Un récapitulatif vous sera envoyé par email.
            </EmptySubtext>
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </>
        )}
      </SuccessBox>
    </Page>
  )

  /* ── Panier vide ── */
  if (!hasItems && page === 'cart') return (
    <Page>
      <PageTitle>Panier</PageTitle>
      <Empty>
        <span style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4, width: 'fit-content' }}>
          <IconCart size={48} />
        </span>
        <EmptyText>Votre panier est vide</EmptyText>
        <EmptySubtext style={{ marginBottom: '24px' }}>
          Parcourez le catalogue pour ajouter des titres.
        </EmptySubtext>
        <Button variant="primary" size="lg" onClick={() => navigate('/fonds')}>
          Voir le catalogue
        </Button>
      </Empty>
    </Page>
  )

  /* ────────── TUNNEL — ÉTAPE 1 : Récapitulatif ────────── */
  if (page === 'recap') return (
    <Page>
      <PageTitle style={{ marginBottom: '4px' }}>Votre commande</PageTitle>
      <ClientCode>Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold></ClientCode>
      <CheckoutStepper current="recap" />

      <RecapCard>
        <RecapTitle>Détail de la commande</RecapTitle>

        {items.map(({ book, quantity }) => (
          <RecapRow key={book.id}>
            <span>{book.title} × {quantity}</span>
            <span>{fmt(book.priceTTC * quantity)}</span>
          </RecapRow>
        ))}

        {opGroups.map(op => (
          <div key={op.id} style={{ margin: '8px 0', padding: '8px 0', borderTop: '1px dashed #eee' }}>
            <RecapRow style={{ fontWeight: 700, color: theme.colors.success }}>
              <span>OP — {op.opTitle}</span><span></span>
            </RecapRow>
            {op.books.map(({ book, quantity }) => (
              <RecapRow key={book.id} style={{ paddingLeft: 12 }}>
                <span>{book.title} × {quantity}</span>
                <span>{fmt(book.priceTTC * quantity)}</span>
              </RecapRow>
            ))}
            <RecapRow style={{ paddingLeft: 12, color: theme.colors.success }}>
              <span>{op.cadeau.emoji} {op.cadeau.label} × {op.cadeau.quantity} (offert)</span>
              <span>0,00 €</span>
            </RecapRow>
            <RecapRow style={{ paddingLeft: 12, color: '#8B6914' }}>
              <span>PLV × {op.plv.quantity}</span>
              <span>{fmt(op.plv.pricePerUnit * op.plv.quantity)}</span>
            </RecapRow>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
          <RecapRow><span>Livraison</span><span>{deliveryLabel}</span></RecapRow>
          <RecapRow><span>Montant HT</span><span>{fmt(montantHT)}</span></RecapRow>
          <RecapRow><span>Remise</span><span>− {fmt(remiseAmount / 1.055)}</span></RecapRow>
          <RecapRow><span>Net HT</span><span>{fmt(netHT)}</span></RecapRow>
          <RecapRow><span>TVA 5,5%</span><span>{fmt(tva)}</span></RecapRow>
          <RecapRow style={{ fontWeight: 700, fontSize: '1rem', color: theme.colors.success, paddingTop: '8px' }}>
            <span>Total TTC</span><span>{fmt(totalTTC)}</span>
          </RecapRow>
        </div>
      </RecapCard>

      <NavActions>
        <Button variant="primary" size="lg" fullWidth onClick={goNext}>
          Suivant — Adresses
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={goBack}>
          <IconChevronLeft /> Modifier le panier
        </Button>
      </NavActions>
    </Page>
  )

  /* ────────── TUNNEL — ÉTAPE 2 : Adresses ────────── */
  if (page === 'addresses') return (
    <Page>
      <PageTitle style={{ marginBottom: '4px' }}>Adresses</PageTitle>
      <ClientCode>Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold></ClientCode>
      <CheckoutStepper current="addresses" />

      <FormCard>
        <SectionTitle style={{ marginBottom: '16px' }}>Adresse de livraison</SectionTitle>
        <AddressFormFields
          data={deliveryAddress}
          errors={deliveryErrors}
          onChange={(field, val) => {
            setDeliveryAddress(prev => ({ ...prev, [field]: val }))
            setDeliveryErrors(prev => ({ ...prev, [field]: undefined }))
          }}
        />
      </FormCard>

      <SameAsDeliveryRow>
        <input
          type="checkbox"
          checked={sameAsDelivery}
          onChange={e => {
            setSameAsDelivery(e.target.checked)
            if (e.target.checked) setBillingErrors({})
          }}
        />
        Adresse de facturation identique à la livraison
      </SameAsDeliveryRow>

      {!sameAsDelivery && (
        <FormCard>
          <SectionTitle style={{ marginBottom: '16px' }}>Adresse de facturation</SectionTitle>
          <AddressFormFields
            data={billingAddress}
            errors={billingErrors}
            onChange={(field, val) => {
              setBillingAddress(prev => ({ ...prev, [field]: val }))
              setBillingErrors(prev => ({ ...prev, [field]: undefined }))
            }}
          />
        </FormCard>
      )}

      <NavActions>
        <Button variant="primary" size="lg" fullWidth onClick={goNext}>
          Suivant — Mode de transmission
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={goBack}>
          <IconChevronLeft /> Récapitulatif
        </Button>
      </NavActions>
    </Page>
  )

  /* ────────── TUNNEL — ÉTAPE 3 : Mode de transmission ────────── */
  if (page === 'transmission') return (
    <Page>
      <PageTitle style={{ marginBottom: '4px' }}>Mode de transmission</PageTitle>
      <ClientCode>Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold></ClientCode>
      <CheckoutStepper current="transmission" />

      <FormCard>
        <OrderTransmissionStep
          value={localTransmission}
          onChange={setLocalTransmission}
          saveAsDefault={saveAsDefault}
          onSaveAsDefaultChange={setSaveAsDefault}
        />
      </FormCard>

      <NavActions>
        <Button variant="primary" size="lg" fullWidth onClick={goNext}>
          Suivant — Confirmation
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={goBack}>
          <IconChevronLeft /> Adresses
        </Button>
      </NavActions>
    </Page>
  )

  /* ────────── TUNNEL — ÉTAPE 4 : Confirmation finale ────────── */
  if (page === 'final') {
    const effectiveBilling = sameAsDelivery ? deliveryAddress : billingAddress
    return (
      <Page>
        <PageTitle style={{ marginBottom: '4px' }}>Confirmation finale</PageTitle>
        <ClientCode>Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold></ClientCode>
        <CheckoutStepper current="final" />

        <RecapCard>
          <RecapTitle>Récapitulatif complet</RecapTitle>

          {items.map(({ book, quantity }) => (
            <RecapRow key={book.id}>
              <span>{book.title} × {quantity}</span>
              <span>{fmt(book.priceTTC * quantity)}</span>
            </RecapRow>
          ))}

          {opGroups.map(op => (
            <div key={op.id} style={{ margin: '8px 0', padding: '8px 0', borderTop: '1px dashed #eee' }}>
              <RecapRow style={{ fontWeight: 700, color: theme.colors.success }}>
                <span>OP — {op.opTitle}</span><span></span>
              </RecapRow>
              {op.books.map(({ book, quantity }) => (
                <RecapRow key={book.id} style={{ paddingLeft: 12 }}>
                  <span>{book.title} × {quantity}</span>
                  <span>{fmt(book.priceTTC * quantity)}</span>
                </RecapRow>
              ))}
              <RecapRow style={{ paddingLeft: 12, color: theme.colors.success }}>
                <span>{op.cadeau.emoji} {op.cadeau.label} × {op.cadeau.quantity} (offert)</span>
                <span>0,00 €</span>
              </RecapRow>
              <RecapRow style={{ paddingLeft: 12, color: '#8B6914' }}>
                <span>PLV × {op.plv.quantity}</span>
                <span>{fmt(op.plv.pricePerUnit * op.plv.quantity)}</span>
              </RecapRow>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
            <RecapRow><span>Livraison</span><span>{deliveryLabel}</span></RecapRow>
            <RecapRow>
              <span>Transmission</span>
              <span>{localTransmission === 'EDI' ? '📡 EDI Dilicom' : '🌐 FlowDiff'}</span>
            </RecapRow>
            <RecapRow><span>Montant HT</span><span>{fmt(montantHT)}</span></RecapRow>
            <RecapRow><span>Remise</span><span>− {fmt(remiseAmount / 1.055)}</span></RecapRow>
            <RecapRow><span>Net HT</span><span>{fmt(netHT)}</span></RecapRow>
            <RecapRow><span>TVA 5,5%</span><span>{fmt(tva)}</span></RecapRow>
            <RecapRow style={{ fontWeight: 700, fontSize: '1rem', color: theme.colors.success, paddingTop: '8px' }}>
              <span>Total TTC</span><span>{fmt(totalTTC)}</span>
            </RecapRow>
          </div>
        </RecapCard>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <AddressSummary>
              <AddressSummaryLabel>Livraison</AddressSummaryLabel>
              <AddressSummaryValue>{fmtAddress(deliveryAddress)}</AddressSummaryValue>
            </AddressSummary>
          </div>
          <div style={{ flex: 1 }}>
            <AddressSummary>
              <AddressSummaryLabel>Facturation</AddressSummaryLabel>
              <AddressSummaryValue>{fmtAddress(effectiveBilling)}</AddressSummaryValue>
            </AddressSummary>
          </div>
        </div>

        <NavActions>
          <Button variant="primary" size="lg" fullWidth onClick={handleConfirmOrder}>
            Confirmer la commande
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={goBack}>
            <IconChevronLeft /> Mode de transmission
          </Button>
        </NavActions>
      </Page>
    )
  }

  /* ════════════════════════════════════════════════════════
     PANIER PRINCIPAL
  ════════════════════════════════════════════════════════ */

  /* Grouper les items par univers */
  const itemsByUniverse = items.reduce<Record<string, typeof items>>((acc, item) => {
    const u = item.book.universe
    if (!acc[u]) acc[u] = []
    acc[u].push(item)
    return acc
  }, {})

  return (
    <Page style={{ maxWidth: '1160px' }}>
      <ConfirmDialog
        open={confirm.open}
        title={confirm.open ? confirm.title : ''}
        message={confirm.open ? confirm.message : ''}
        confirmLabel="Supprimer"
        destructive
        onConfirm={confirm.open ? confirm.onConfirm : () => {}}
        onCancel={() => setConfirm({ open: false })}
      />
      <BackButton />
      <PageHeader>
        <PageTitle style={{ marginBottom: 0 }}>Panier</PageTitle>
        <ClearCartBtn
          aria-label="Vider tout le panier"
          onClick={() => askConfirm(
            'Vider le panier ?',
            'Tous les articles et opérations commerciales seront supprimés. Cette action est irréversible.',
            () => clearCart()
          )}
        >
          <IconTrash />
          Tout vider
        </ClearCartBtn>
      </PageHeader>
      <ClientCode>
        Code client : <ClientCodeBold>{user?.codeClient ?? '—'}</ClientCodeBold>
        {' · '}{totalItems} article{totalItems > 1 ? 's' : ''}
      </ClientCode>

      <TwoColLayout>
        <ItemsCol>
          {/* ══ 1. TITRES INDIVIDUELS — groupés par univers ══ */}
          {items.length > 0 && (
            <Section>
              {Object.entries(itemsByUniverse).map(([universe, universeItems]) => (
                <div key={universe}>
                  <UniverseGroupLabel>{universe}</UniverseGroupLabel>
                  {universeItems.map((item) => {
            const { book, quantity, ebookOption } = item
            const key       = getItemKey(item)
            const isEbook   = !!ebookOption
            const unitPrice = isEbook ? ebookOption!.price : book.priceTTC
            const remise    = getUserRate(book.universe)

            const platformColor =
              ebookOption?.hebergeur === 'OpenEdition' ? '#D4500A' :
              ebookOption?.hebergeur === 'Cairn'       ? '#1A5E8A' :
              ebookOption?.hebergeur === 'Izneo'       ? '#6B3FA0' :
              ebookOption?.hebergeur === 'Numilog'     ? '#2D7A3A' : '#555'

            const showPlatformTag = isEbook && ebookOption!.hebergeur !== 'Amalivre'

            return (
              <ItemCard key={key} $ebook={isEbook}>
                <BookCover isbn={book.isbn} alt={book.title} width={56} height={80} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                <ItemInfo>
                  {isEbook && (
                    <div style={{ marginBottom: 4 }}>
                      <EbookFormatBadge>
                        <IconScreen /> EBOOK · {ebookOption!.format}
                      </EbookFormatBadge>
                      {showPlatformTag && (
                        <EbookPlatformTag $color={platformColor}>
                          {ebookOption!.hebergeur}
                        </EbookPlatformTag>
                      )}
                    </div>
                  )}
                  <ItemTitle>{book.title}</ItemTitle>
                  {item.enReliquat ? (
                    <ItemStatutLine $variant="reimp">
                      🔁 Reliquat — expédition dès disponibilité
                    </ItemStatutLine>
                  ) : item.statut === 'sur_commande' ? (
                    <ItemStatutLine $variant="sur_commande">
                      🔄 Sur commande — délai 7-15 jours
                    </ItemStatutLine>
                  ) : null}
                  <ItemAuthor>{book.authors.join(', ')} — {book.publisher}</ItemAuthor>
                  <ItemIsbn>ISBN {isEbook ? ebookOption!.isbnEbook : book.isbn} · {isEbook ? ebookOption!.format : book.format}</ItemIsbn>
                  <ItemFooter>
                    <div>
                      <PriceStrip>
                        <PriceCell>
                          <PriceCellLabel>Prix public TTC</PriceCellLabel>
                          <PriceCellValue>{fmt(unitPrice)}</PriceCellValue>
                        </PriceCell>
                        <PriceCell>
                          <PriceCellLabel>Remise</PriceCellLabel>
                          <PriceCellValue $gold>−{(remise * 100).toFixed(0)} %</PriceCellValue>
                        </PriceCell>
                        <PriceCell>
                          <PriceCellLabel>Prix net TTC</PriceCellLabel>
                          <PriceCellValue $emphasis>{fmt(unitPrice * (1 - remise))}</PriceCellValue>
                        </PriceCell>
                      </PriceStrip>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <QtyControl>
                        <QtyBtn onClick={() => updateQty(key, quantity - 1)} disabled={quantity <= 1} aria-label="Diminuer">−</QtyBtn>
                        <QtyValue>{quantity}</QtyValue>
                        <QtyBtn onClick={() => updateQty(key, quantity + 1)} aria-label="Augmenter">+</QtyBtn>
                      </QtyControl>
                      <DeleteBtn
                        aria-label={`Supprimer ${book.title}`}
                        onClick={() => askConfirm(
                          'Supprimer cet article ?',
                          `"${book.title}" sera retiré de votre panier.`,
                          () => removeFromCart(key)
                        )}
                      >
                        <IconTrash />
                      </DeleteBtn>
                    </div>
                  </ItemFooter>
                </ItemInfo>
              </ItemCard>
              )
            })}
          </div>
          ))}
        </Section>
      )}

          {/* ══ 2. OPÉRATIONS PROMOTIONNELLES ══ */}
      {opGroups.length > 0 && (
        <Section>
          <SectionTitle>
            {opGroups.length} opération{opGroups.length > 1 ? 's' : ''} promotionnelle{opGroups.length > 1 ? 's' : ''}
          </SectionTitle>

          {opGroups.map(op => {
            const opBooksTTC = op.books.reduce((s, { book, quantity }) =>
              s + book.priceTTC * quantity, 0)
            const opRemise   = op.books.reduce((s, { book, quantity }) =>
              s + book.priceTTC * quantity * getUserRate(book.universe), 0)
            const opPLVPrice = op.plv.pricePerUnit * op.plv.quantity
            const opTotalTTC = (opBooksTTC - opRemise) + opPLVPrice

            return (
              <OPBlock key={op.id}>
                <OPHeader>
                  <OPHeaderLeft>
                    <OPTag>OP commerciale</OPTag>
                    <OPTitle>{op.opTitle}</OPTitle>
                    <OPDesc>{op.opDescription}</OPDesc>
                  </OPHeaderLeft>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    {op.validUntil && <OPValidity>jusqu'au {op.validUntil}</OPValidity>}
                    <OPDeleteBtn
                      onClick={() => askConfirm(
                        'Supprimer cette opération ?',
                        `L'opération "${op.opTitle}" et tous ses articles seront retirés du panier.`,
                        () => removeOP(op.id)
                      )}
                    >
                      Supprimer
                    </OPDeleteBtn>
                  </div>
                </OPHeader>

                <OPTable>
                  <OPRow style={{ minHeight: 32, borderTop: 'none', background: '#FAFAF8' }}>
                    <OPCover />
                    <OPText>
                      <OPRowMeta style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>
                        Titre / Article
                      </OPRowMeta>
                    </OPText>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>Prix unit.</OPCell>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7', textAlign: 'center' }}>Qté</OPCell>
                    <OPCell style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B5AFA7' }}>Total</OPCell>
                  </OPRow>

                  {op.books.map(({ book, quantity }) => (
                    <OPRow key={book.id} $variant="book">
                      <OPCover>
                        <BookCover isbn={book.isbn} alt={book.title} width={34} height={48} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                      </OPCover>
                      <OPText>
                        <OPRowTitle>{book.title}</OPRowTitle>
                        <OPRowMeta>{book.authors[0]} · {book.format}</OPRowMeta>
                        <OPRowIsbn>ISBN {book.isbn}</OPRowIsbn>
                      </OPText>
                      <OPCell>{fmt(book.priceTTC)}</OPCell>
                      <OPCell style={{ textAlign: 'center' }}>{quantity}</OPCell>
                      <OPCell $bold>{fmt(book.priceTTC * quantity)}</OPCell>
                    </OPRow>
                  ))}

                  <OPRow $variant="cadeau">
                    <OPCover>
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{op.cadeau.emoji}</span>
                    </OPCover>
                    <OPText>
                      <OPRowTitle style={{ color: theme.colors.success }}>{op.cadeau.label}</OPRowTitle>
                      <OPRowMeta>Offert au lecteur final</OPRowMeta>
                      <OPRowIsbn>ISBN {op.cadeau.isbn}</OPRowIsbn>
                    </OPText>
                    <OPCell $color={theme.colors.success}>0,00 €</OPCell>
                    <OPCell $color={theme.colors.success} style={{ textAlign: 'center' }}>{op.cadeau.quantity}</OPCell>
                    <OPCell $bold $color={theme.colors.success}>0,00 €</OPCell>
                  </OPRow>

                  <OPRow $variant="plv">
                    <OPCover style={{ color: '#8B6914' }}>
                      <IconTag />
                    </OPCover>
                    <OPText>
                      <OPRowTitle style={{ color: '#8B6914' }}>{op.plv.description}</OPRowTitle>
                      <OPRowMeta>PLV payante</OPRowMeta>
                      <OPRowIsbn>ISBN {op.plv.isbn}</OPRowIsbn>
                    </OPText>
                    <OPCell $color="#8B6914">{fmt(op.plv.pricePerUnit)}</OPCell>
                    <OPCell $color="#8B6914" style={{ textAlign: 'center' }}>{op.plv.quantity}</OPCell>
                    <OPCell $bold $color="#8B6914">{fmt(opPLVPrice)}</OPCell>
                  </OPRow>
                </OPTable>

                <OPFooter>
                  <OPFooterStats>
                    <OPFooterStat>
                      <OPFooterLabel>Ouvrages</OPFooterLabel>
                      <OPFooterValue>{op.books.reduce((s, { quantity }) => s + quantity, 0)} ex.</OPFooterValue>
                    </OPFooterStat>
                    <OPFooterStat>
                      <OPFooterLabel>Cadeaux</OPFooterLabel>
                      <OPFooterValue>{op.cadeau.quantity} offerts</OPFooterValue>
                    </OPFooterStat>
                    <OPFooterStat>
                      <OPFooterLabel>PLV</OPFooterLabel>
                      <OPFooterValue>{op.plv.quantity} unité{op.plv.quantity > 1 ? 's' : ''}</OPFooterValue>
                    </OPFooterStat>
                  </OPFooterStats>
                  <OPFooterStat style={{ alignItems: 'flex-end' }}>
                    <OPFooterLabel>Total OP TTC</OPFooterLabel>
                    <OPFooterValue $highlight>{fmt(opTotalTTC)}</OPFooterValue>
                  </OPFooterStat>
                </OPFooter>
              </OPBlock>
            )
          })}
        </Section>
      )}

          {/* ── Livraison ── */}
          <Section>
            <DeliveryCard>
              <SectionTitle style={{ marginBottom: '16px' }}>Date de livraison</SectionTitle>
              <RadioGroup>
                <RadioLabel>
                  <input type="radio" name="delivery" value="standard"
                    checked={delivery === 'standard'} onChange={() => setDelivery('standard')} />
                  Délai habituel (1–3 jours ouvrés)
                </RadioLabel>
                <RadioLabel>
                  <input type="radio" name="delivery" value="specific"
                    checked={delivery === 'specific'} onChange={() => setDelivery('specific')} />
                  Date spécifique
                </RadioLabel>
                {delivery === 'specific' && (
                  <DatePickerWrap>
                    <DatePickerLabel htmlFor="delivery-date">Date souhaitée</DatePickerLabel>
                    <DatePicker
                      value={specificDate}
                      onChange={setSpecific}
                      min={today}
                      placeholder="JJ/MM/AAAA"
                    />
                  </DatePickerWrap>
                )}
              </RadioGroup>
            </DeliveryCard>
          </Section>
        </ItemsCol>

        {/* ── Récapitulatif sidebar ── */}
        <RecapCol>
          <RecapSideCard>
            <RecapSideHeader>
              <RecapSideTitle>Récapitulatif</RecapSideTitle>
              <RecapSideCount>{totalItems} article{totalItems > 1 ? 's' : ''}</RecapSideCount>
            </RecapSideHeader>
            <RecapSideBody>
              <RecapSideRow>
                <span>Montant HT</span>
                <span>{fmt(montantHT)}</span>
              </RecapSideRow>
              {remisePct > 0 && (
                <RecapSideDiscount>
                  <span>
                    Remise{' '}
                    {hasMultiRates
                      ? <RemiseBadge style={{ background: 'rgba(0,0,0,0.08)', border: 'none', color: 'inherit' }}>variable</RemiseBadge>
                      : <span>−{remisePct.toFixed(1)}%</span>
                    }
                  </span>
                  <span>− {fmt(remiseAmount / 1.055)}</span>
                </RecapSideDiscount>
              )}
              <RecapSideRow>
                <span>Net HT</span>
                <span>{fmt(netHT)}</span>
              </RecapSideRow>
              <RecapSideRow>
                <span>TVA 5,5%</span>
                <span>{fmt(tva)}</span>
              </RecapSideRow>
              <RecapSideDivider />
              <RecapSideTotalLine>
                <RecapSideTotalLabel>Total TTC</RecapSideTotalLabel>
                <RecapSideTotalValue>{fmt(totalTTC)}</RecapSideTotalValue>
              </RecapSideTotalLine>
            </RecapSideBody>
          </RecapSideCard>

          <ValidateBtn
            onClick={() => setPage('recap')}
            disabled={delivery === 'specific' && !specificDate}
          >
            Valider la commande
          </ValidateBtn>

          <EDIHint>
            <EDIHintIcon>⇄</EDIHintIcon>
            <span>Commande EDI disponible via <a onClick={() => navigate('/edi')}>Dilicom</a></span>
          </EDIHint>
        </RecapCol>
      </TwoColLayout>
    </Page>
  )
}
