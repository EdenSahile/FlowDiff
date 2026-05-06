import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getBookById, MOCK_BOOKS } from '@/data/mockBooks'
import { BookCover } from '@/components/catalogue/BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useRdv } from '@/contexts/RdvContext'
import { ListPickerPopover } from '@/components/catalogue/ListPickerPopover'
import { StockAlertModal } from '@/components/ui/StockAlertModal'
import { slugifyAuthor } from '@/lib/slugify'
import { theme } from '@/lib/theme'
import { mq } from '@/lib/responsive'

/* ── Formats physiques ── */
type FormatId = 'broche' | 'poche'

interface PhysicalFormat {
  id: FormatId
  label: string
  description: string
  priceTTC: number
}

const LOREM_SHORT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'

const LOREM_LONG =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, tincidunt pretium lorem. In turpis. Phasellus ultrices nulla quis nibh. Quisque a lectus.'

const LOREM_P2 =
  'Fusce fermentum. Nullam varius, turpis molestie dictum semper, metus arcu convallis lorem, quis dignissim diam lorem id nunc. Nulla aliquet porttitor quam. Donec at purus ut velit iaculis condimentum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi. Nullam vel sem. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus.'

const UNIVERSE_STYLES: Record<string, { bg: string; color: string }> = {
  'Littérature':     { bg: '#E8EDF3', color: '#1C3252' },
  'BD/Mangas':       { bg: '#FDEBD0', color: '#C04A00' },
  'Jeunesse':        { bg: '#F5E8F8', color: '#7B2D8B' },
  'Adulte-pratique': { bg: '#E6F4EC', color: '#1E7045' },
}

/* ══ Animations ══ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const modalIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

/* ══ Page layout ══ */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  animation: ${fadeIn} 0.22s ease;

  ${mq.belowMd} {
    padding: 14px 16px 48px;
  }
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  padding: 6px 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.65;
  transition: opacity .15s, transform .12s;
  &:hover { opacity: 1; transform: translateX(-2px); }
`

const NotFoundBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const SectionEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 14px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
    flex-shrink: 0;
  }
`

/* ── Breadcrumb ── */
const BreadcrumbNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 14px;
  flex-wrap: wrap;
`

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  cursor: pointer;
  transition: color .12s;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const BreadcrumbSep = styled.span`
  color: ${({ theme }) => theme.colors.gray[200]};
`

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`

/* ── Layout 2 colonnes ── */
const BookLayout = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 28px;
  align-items: start;

  ${mq.belowMd} {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

/* ── Colonne gauche sticky ── */
const CoverColNew = styled.div`
  position: sticky;
  top: 94px;

  ${mq.belowMd} {
    position: static;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

const CoverFrame = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(42,42,40,.15), 0 2px 8px rgba(42,42,40,.08);
  position: relative;

  ${mq.belowMd} {
    width: 140px;
  }
`

const CoverBadgeDetail = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .04em;
  padding: 3px 9px;
  border-radius: 10px;
  background: rgba(212,168,67,.15);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(212,168,67,.4);
  z-index: 1;
`

const CoverActionsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;

  ${mq.belowMd} {
    width: 140px;
  }
`

const CoverActionBtn = styled.button`
  flex: 1;
  height: 30px;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.12);
  border-radius: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: border-color .15s, color .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.navy}; color: ${({ theme }) => theme.colors.navy}; }
`

const MetaBox = styled.div`
  margin-top: 10px;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.07);
  border-radius: 8px;
  overflow: hidden;

  ${mq.belowMd} {
    width: 140px;
  }
`

const MetaRowItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(42,42,40,.06);
  gap: 1px;
  &:last-child { border-bottom: none; }
`

const MetaLabelEl = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: .07em;
`

const MetaValueEl = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  overflow-wrap: break-word;
  word-break: break-word;
  strong { color: ${({ theme }) => theme.colors.gray[800]}; font-weight: 600; }
`

/* ── Colonne droite ── */
const DetailCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const BookUniverseBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  margin-bottom: 6px;
  width: fit-content;
`

const BookTitleMain = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -.01em;
  line-height: 1.2;
  margin-bottom: 4px;

  ${mq.belowMd} {
    font-size: 18px;
  }
`

const BookAuthorMain = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 400;
  margin-bottom: 2px;
  strong { font-weight: 600; color: ${({ theme }) => theme.colors.gray[800]}; }
`

const BookEditorMain = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 12px;
`

const AuthorLinkBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: ${({ theme }) => theme.colors.accent};
  transition: opacity .15s;
  &:hover { opacity: 0.7; }
`

/* ── Format selector ── */
const FormatSelectorWrap = styled.div`
  margin-bottom: 12px;
`

const FormatLabelEl = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 6px;
`

const FormatOptionsRow = styled.div`
  display: flex;
  gap: 6px;
`

const FormatBtnEl = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : 'rgba(42,42,40,.12)'};
  background: ${({ $active, theme }) => $active ? 'rgba(45,58,74,.06)' : theme.colors.white};
  cursor: pointer;
  box-shadow: ${({ $active }) => $active ? '0 0 0 1px #2D3A4A' : 'none'};
  text-align: left;
  transition: border-color .15s, background .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.navy}; }
`

const FormatNameEl = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[800]};
`

const FormatPriceEl = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[400]};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  margin-top: 1px;
`

/* ── Zone prix ── */
const PriceZone = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.07);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
`

const PriceRowEl = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

const PricePublicEl = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -.01em;
`

const PricePublicLabelEl = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const PriceDividerEl = styled.div`
  height: 1px;
  background: rgba(42,42,40,.07);
  margin: 10px 0;
`

const StockZoneEl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`

const StockIndicatorEl = styled.span<{ $statut?: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  font-weight: 600;
  background: ${({ $statut }) =>
    $statut === 'disponible'   ? 'rgba(46,125,50,.08)' :
    $statut === 'sur_commande' ? 'rgba(91,122,158,.1)' :
    $statut === 'en_reimp'     ? 'rgba(160,112,64,.1)' : 'rgba(46,125,50,.08)'};
  color: ${({ $statut }) =>
    $statut === 'disponible'   ? '#2E7D32' :
    $statut === 'sur_commande' ? '#5B7A9E' :
    $statut === 'en_reimp'     ? '#A07040' : '#2E7D32'};
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`

const StockDispoDetailEl = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const OrderZoneEl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const QtyStepperLg = styled.div`
  display: flex;
  align-items: center;
  border: 1.5px solid rgba(42,42,40,.15);
  border-radius: 7px;
  overflow: hidden;
  flex-shrink: 0;
`

const QtyBtnLg = styled.button`
  width: 32px;
  height: 36px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .1s;
  &:hover { background: rgba(42,42,40,.08); }
  &:disabled { opacity: .35; cursor: not-allowed; }
`

const QtyInputLg = styled.input`
  width: 42px;
  height: 36px;
  border: none;
  border-left: 1px solid rgba(42,42,40,.12);
  border-right: 1px solid rgba(42,42,40,.12);
  background: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
`

const AddBtnMain = styled.button<{ $added: boolean }>`
  height: 36px;
  padding: 0 18px;
  background: ${({ $added, theme }) => $added ? '#2E7D32' : theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: .5; cursor: not-allowed; }
`

const EpuiseNoticeEl = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
  margin: 8px 0 0;
`

const ParaitreNoticeEl = styled.div`
  background: #FFF3E0;
  border: 1px solid #E65100;
  border-left: 4px solid #E65100;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 14px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: #C84B00;
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
`

/* ── Actions secondaires horizontales ── */
const SecondaryActionsHoriz = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const SecBtnHoriz = styled.button`
  flex: 1;
  min-width: 120px;
  height: 30px;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.12);
  border-radius: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: border-color .15s, color .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.navy}; color: ${({ theme }) => theme.colors.navy}; }
`

/* ── Synopsis ── */
const SynopsisBlock = styled.div`
  margin-bottom: 14px;
`

const SynopsisText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
`

/* ── Infos commande ── */
const OrderInfoBlockNew = styled.div`
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid rgba(212,168,67,.2);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const OrderInfoRowEl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  strong { font-weight: 700; color: ${({ theme }) => theme.colors.gray[800]}; }
`

const OrderInfoIconEl = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

/* ── Similar books ── */
const SimilarSectionNew = styled.section`
  margin-top: 28px;
`

const SimilarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(42,42,40,.1);
`

const SimilarTitleEl = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const SimilarLinkEl = styled.button`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 500;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`

const SimilarGridNew = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const SimilarCardNew = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.07);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform .15s, border-color .15s, box-shadow .15s;
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(42,42,40,.18);
    box-shadow: 0 4px 14px rgba(42,42,40,.09);
  }
`

const SimilarCoverNew = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
`

const SimilarBodyNew = styled.div`
  padding: 7px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

const SimilarUniverseBadgeEl = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  width: fit-content;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`

const SimilarTitleTextEl = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SimilarAuthorTextEl = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SimilarPriceEl = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-top: 3px;
`

/* ══════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════ */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 18, 35, 0.72);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${overlayIn} 0.18s ease;
`

const ModalBox = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 24px 64px rgba(10,18,35,0.30);
  display: flex;
  flex-direction: column;
  animation: ${modalIn} 0.22s ease;
  max-height: 90vh;
  overflow: hidden;
`

const PdfModal = styled(ModalBox)`
  width: 100%;
  max-width: 640px;
`

const PdfHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #EDE9E2;
  background: ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.xl} ${({ theme }) => theme.radii.xl} 0 0;
`

const PdfHeaderTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
`

const PdfPageIndicator = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: rgba(255,255,255,0.6);
`

const ModalCloseBtn = styled.button`
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s;
  &:hover { background: rgba(255,255,255,0.28); }
`

const PdfPageWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #F5F2EC;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`

const PdfPage = styled.div`
  width: 100%;
  max-width: 520px;
  min-height: 480px;
  background: #fff;
  margin: 24px auto;
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  padding: 36px 40px;
  font-family: Georgia, serif;
`

const ArgHeader = styled.div`
  text-align: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.navy};
  padding-bottom: 20px;
  margin-bottom: 24px;
`

const ArgLabel = styled.p`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #B5AFA7;
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const ArgTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
  line-height: 1.25;
`

const ArgAuthor = styled.p`
  font-size: 13px;
  color: #706A62;
  font-style: italic;
  margin-bottom: 4px;
`

const ArgPublisher = styled.p`
  font-size: 12px;
  color: #B5AFA7;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const ArgBody = styled.div`
  font-size: 12.5px;
  line-height: 1.8;
  color: #2C2820;
`

const ArgSection = styled.div`
  margin-bottom: 18px;
`

const ArgSectionTitle = styled.p`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #B5AFA7;
  margin-bottom: 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const ArgMeta = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #EDE9E2;
`

const ArgMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ArgMetaLabel = styled.span`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #B5AFA7;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const ArgMetaValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const PdfCartZone = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const PdfAddBtn = styled.button<{ $added: boolean }>`
  height: 40px;
  padding: 0 14px;
  border: 1.5px solid ${({ $added, theme }) => $added ? theme.colors.primaryHover : theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $added, theme }) => $added ? theme.colors.primaryLight : 'transparent'};
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: background .2s, border-color .2s;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent};
    color: #3d2f00;
  }
`

const QtyControlModal = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[50]};
`

const QtyBtnModal = styled.button`
  width: 40px; height: 44px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .1s;
  &:hover   { background: ${({ theme }) => theme.colors.gray[200]}; }
  &:disabled{ opacity: .3; cursor: not-allowed; }
`

const QtyValueModal = styled.span`
  min-width: 48px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
`

const InteriorPageNum = styled.p`
  text-align: center;
  font-size: 10px;
  color: #B5AFA7;
  margin-bottom: 28px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  letter-spacing: 0.08em;
`

const InteriorChapter = styled.h3`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.navy};
  text-align: center;
  margin-bottom: 20px;
`

const InteriorDrop = styled.span`
  float: left;
  font-size: 52px;
  font-weight: 700;
  line-height: 0.85;
  margin-right: 8px;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.navy};
`

const InteriorParagraph = styled.p`
  font-size: 13px;
  line-height: 1.85;
  color: #2C2820;
  margin-bottom: 16px;
  text-align: justify;
`

const PdfNav = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #EDE9E2;
  background: #FAFAF8;
  border-radius: 0 0 ${({ theme }) => theme.radii.xl} ${({ theme }) => theme.radii.xl};
  gap: 12px;
`

const NavArrow = styled.button<{ $disabled?: boolean }>`
  width: 40px; height: 40px;
  border: 1.5px solid ${({ $disabled, theme }) => $disabled ? '#E6E1DA' : theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $disabled }) => $disabled ? '#F5F2EE' : '#fff'};
  color: ${({ $disabled, theme }) => $disabled ? '#D5CFC7' : theme.colors.navy};
  font-size: 16px;
  font-weight: 700;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s, border-color .12s;
  &:hover:not([disabled]) {
    background: ${({ theme }) => theme.colors.navy};
    color: #fff;
  }
`

const PageDots = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`

const PageDot = styled.span<{ $active: boolean }>`
  width: ${({ $active }) => $active ? '20px' : '7px'};
  height: 7px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#D5CFC7'};
  transition: all 0.2s ease;
`

const VideoModal = styled(ModalBox)`
  width: 100%;
  max-width: 580px;
`

const VideoHeader = styled(PdfHeader)``

const VideoBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const VideoThumb = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 50%, #16213E 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover .play-btn { transform: scale(1.1); }
`

const VideoThumbnailText = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  line-height: 1.3;
`

const PlayBtn = styled.div`
  width: 68px; height: 68px;
  border-radius: 50%;
  background: #FF0000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255,0,0,0.4);
  transition: transform 0.18s ease;
  position: relative;
  z-index: 1;

  ${VideoThumb}:hover & { transform: scale(1.1); }

  &::after {
    content: '';
    display: block;
    width: 0; height: 0;
    border-style: solid;
    border-width: 12px 0 12px 22px;
    border-color: transparent transparent transparent #fff;
    margin-left: 5px;
  }
`

const YtBrand = styled.div`
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0,0,0,0.55);
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 3px 8px;
`

const YtLogo = styled.span`
  font-size: 10px;
  font-weight: 900;
  color: #FF0000;
  font-family: Arial, sans-serif;
  letter-spacing: -0.02em;
`

const YtLabel = styled.span`
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  font-family: Arial, sans-serif;
`

const VideoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const VideoTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const VideoUrlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 9px 12px;
`

const VideoUrl = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.navy};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.75;
`

const YtOpenBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #FF0000;
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: #CC0000; }
`

/* ══ Composant ══ */

export function FicheProduitPage() {
  const { id }        = useParams<{ id: string }>()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { addToRdv, isInRdv } = useRdv()

  const [qty, setQty]           = useState(1)
  const [added, setAdded]       = useState(false)
  const [pdfQty, setPdfQty]     = useState(1)
  const [pdfAdded, setPdfAdded] = useState(false)
  const [formatId, setFormatId] = useState<FormatId>('broche')
  const [listAnchor, setListAnchor] = useState<DOMRect | null>(null)
  const [alertOpen, setAlertOpen]   = useState(false)
  const listBtnRef = useRef<HTMLButtonElement>(null)

  const [pagesOpen, setPagesOpen] = useState(false)
  const [pageIdx, setPageIdx]     = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)

  const book = id ? getBookById(id) : undefined

  if (!book) {
    return (
      <Page>
        <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>
        <NotFoundBox>
          <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</p>
          <p>Livre introuvable.</p>
        </NotFoundBox>
      </Page>
    )
  }

  const formats: PhysicalFormat[] = [
    { id: 'broche', label: 'Broché', description: 'Format standard', priceTTC: book.priceTTC },
    { id: 'poche',  label: 'Poche',  description: 'Format poche',    priceTTC: Math.round(book.priceTTC * 0.62 * 100) / 100 },
  ]

  const selectedFormat = formats.find(f => f.id === formatId)!
  const isAParaitre    = book.type === 'a-paraitre'
  const isEpuise       = book.statut === 'epuise' || book.statut === 'rupture'
  const needsConfirm   = book.statut === 'sur_commande' || book.statut === 'en_reimp'
  const isOrderable    = !isAParaitre && !isEpuise

  const formattedDate = new Date(book.publicationDate).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const performAdd = (enReliquat: boolean) => {
    const ratio = selectedFormat.priceTTC / book.priceTTC
    addToCart({
      ...book,
      priceTTC: selectedFormat.priceTTC,
      price: Math.round(book.price * ratio * 100) / 100,
    }, qty, { enReliquat })
    showToast('Ouvrage ajouté au panier')
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleAdd = () => {
    if (isEpuise) return
    if (needsConfirm) { setAlertOpen(true); return }
    performAdd(false)
  }

  const handlePdfRdv = () => {
    addToRdv(book, pdfQty)
    setPdfAdded(true)
    setTimeout(() => setPdfAdded(false), 2000)
  }

  const handleContactRep = () => {
    navigate('/contact', {
      state: {
        fromBook: {
          title:     book.title,
          isbn:      book.isbn,
          publisher: book.publisher,
          authors:   book.authors.join(', '),
          programme: book.programme ?? '',
        },
      },
    })
  }

  const TOTAL_PAGES = 3

  function renderPdfPage(index: number) {
    if (!book) return null
    if (index === 0) {
      return (
        <PdfPage>
          <ArgHeader>
            <ArgLabel>Argumentaire commercial</ArgLabel>
            <ArgTitle>{book.title}</ArgTitle>
            <ArgAuthor>{book.authors.join(', ')}</ArgAuthor>
            <ArgPublisher>{book.publisher}{book.collection ? ` · ${book.collection}` : ''}</ArgPublisher>
          </ArgHeader>
          <ArgBody>
            <ArgSection>
              <ArgSectionTitle>Présentation de l'ouvrage</ArgSectionTitle>
              <p style={{ marginBottom: '12px' }}>{book.description}</p>
              <p>{LOREM_SHORT}</p>
            </ArgSection>
            <ArgSection>
              <ArgSectionTitle>Points forts</ArgSectionTitle>
              <ul style={{ paddingLeft: '16px', lineHeight: 2 }}>
                <li>Un titre attendu du grand public</li>
                <li>Campagne nationale de communication</li>
                <li>Presse confirmée : 15 médias nationaux</li>
                <li>Offres spéciales libraires dès 10 ex.</li>
              </ul>
            </ArgSection>
            <ArgMeta>
              <ArgMetaItem>
                <ArgMetaLabel>Parution</ArgMetaLabel>
                <ArgMetaValue>{formattedDate}</ArgMetaValue>
              </ArgMetaItem>
              <ArgMetaItem>
                <ArgMetaLabel>Format</ArgMetaLabel>
                <ArgMetaValue>{book.format}</ArgMetaValue>
              </ArgMetaItem>
              {book.pages && (
                <ArgMetaItem>
                  <ArgMetaLabel>Pages</ArgMetaLabel>
                  <ArgMetaValue>{book.pages} p.</ArgMetaValue>
                </ArgMetaItem>
              )}
              <ArgMetaItem>
                <ArgMetaLabel>Prix TTC</ArgMetaLabel>
                <ArgMetaValue>{book.priceTTC.toFixed(2)} €</ArgMetaValue>
              </ArgMetaItem>
            </ArgMeta>
          </ArgBody>
        </PdfPage>
      )
    }
    if (index === 1) {
      return (
        <PdfPage>
          <InteriorPageNum>— PAGE 1 —</InteriorPageNum>
          <InteriorChapter>Chapitre I</InteriorChapter>
          <InteriorParagraph><InteriorDrop>L</InteriorDrop>{LOREM_LONG}</InteriorParagraph>
          <InteriorParagraph>{LOREM_P2}</InteriorParagraph>
        </PdfPage>
      )
    }
    return (
      <PdfPage>
        <InteriorPageNum>— PAGE 2 —</InteriorPageNum>
        <InteriorChapter>Chapitre I (suite)</InteriorChapter>
        <InteriorParagraph>{LOREM_P2}</InteriorParagraph>
        <InteriorParagraph>{LOREM_LONG}</InteriorParagraph>
      </PdfPage>
    )
  }

  const fakeYtUrl = `https://www.youtube.com/watch?v=bookflow-${book.isbn.slice(-6)}`

  const uvStyle        = UNIVERSE_STYLES[book.universe] ?? { bg: '#E8EDF3', color: '#1C3252' }
  const sectionLabel   = book.type === 'a-paraitre' ? 'À paraître' : book.type === 'nouveaute' ? 'Nouveautés' : 'Fonds'
  const sectionPath    = book.type === 'fonds' ? '/fonds' : '/nouveautes'
  const showCoverBadge = book.selection || book.type === 'nouveaute' || book.type === 'a-paraitre'
  const coverBadgeLabel =
    book.selection ? 'SÉLECTION' : book.type === 'nouveaute' ? 'NOUVEAUTÉ' : 'À PARAÎTRE'
  const stockLabel =
    book.statut === 'disponible'   ? 'Disponible immédiatement' :
    book.statut === 'sur_commande' ? 'Sur commande' :
    book.statut === 'en_reimp'     ? 'En réimpression' :
    book.statut === 'rupture'      ? 'Rupture de stock' : 'Disponible'
  const similar = MOCK_BOOKS.filter(b => b.universe === book.universe && b.id !== book.id).slice(0, 7)

  return (
    <Page>
      <BreadcrumbNav aria-label="Fil d'Ariane">
        <BreadcrumbLink onClick={() => navigate('/')}>Accueil</BreadcrumbLink>
        <BreadcrumbSep>›</BreadcrumbSep>
        <BreadcrumbLink onClick={() => navigate(sectionPath)}>{sectionLabel}</BreadcrumbLink>
        <BreadcrumbSep>›</BreadcrumbSep>
        <BreadcrumbLink onClick={() => navigate(`${sectionPath}?universe=${encodeURIComponent(book.universe)}`)}>
          {book.universe}
        </BreadcrumbLink>
        <BreadcrumbSep>›</BreadcrumbSep>
        <BreadcrumbCurrent>{book.title}</BreadcrumbCurrent>
      </BreadcrumbNav>

      <BookLayout>

        {/* ── Colonne gauche ── */}
        <CoverColNew>
          <CoverFrame>
            <BookCover
              isbn={book.isbn}
              alt={book.title}
              width={160}
              height={240}
              universe={book.universe}
              authors={book.authors}
              publisher={book.publisher}
            />
            {showCoverBadge && <CoverBadgeDetail>{coverBadgeLabel}</CoverBadgeDetail>}
          </CoverFrame>

          <CoverActionsRow>
            <CoverActionBtn onClick={() => {
              if (navigator.share) {
                navigator.share({ title: book.title, text: book.authors.join(', '), url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
                showToast('Lien copié')
              }
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Partager
            </CoverActionBtn>
          </CoverActionsRow>

          <MetaBox>
            <MetaRowItem>
              <MetaLabelEl>ISBN</MetaLabelEl>
              <MetaValueEl style={{ fontSize: 13 }}><strong>{book.isbn}</strong></MetaValueEl>
            </MetaRowItem>
            <MetaRowItem>
              <MetaLabelEl>Éditeur</MetaLabelEl>
              <MetaValueEl>{book.publisher}</MetaValueEl>
            </MetaRowItem>
            <MetaRowItem>
              <MetaLabelEl>Parution</MetaLabelEl>
              <MetaValueEl>{formattedDate}</MetaValueEl>
            </MetaRowItem>
            {book.pages && (
              <MetaRowItem>
                <MetaLabelEl>Pages</MetaLabelEl>
                <MetaValueEl>{book.pages} pages</MetaValueEl>
              </MetaRowItem>
            )}
            <MetaRowItem>
              <MetaLabelEl>Format</MetaLabelEl>
              <MetaValueEl>{book.format}</MetaValueEl>
            </MetaRowItem>
            {book.collection && (
              <MetaRowItem>
                <MetaLabelEl>Collection</MetaLabelEl>
                <MetaValueEl>{book.collection}</MetaValueEl>
              </MetaRowItem>
            )}
          </MetaBox>
        </CoverColNew>

        {/* ── Colonne droite ── */}
        <DetailCol>
          <BookUniverseBadge $bg={uvStyle.bg} $color={uvStyle.color}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {book.universe}
          </BookUniverseBadge>

          <BookTitleMain>{book.title}</BookTitleMain>
          <BookAuthorMain>Par <strong>{book.authors.join(', ')}</strong></BookAuthorMain>
          {book.authors[0] && (
            <AuthorLinkBtn
              onClick={() => navigate(`/auteur/${slugifyAuthor(book.authors[0])}`)}
              aria-label={`Voir tous les ouvrages de ${book.authors[0]}`}
            >
              Tous les ouvrages de l'auteur →
            </AuthorLinkBtn>
          )}
          <BookEditorMain>
            {book.publisher}
            {book.collection ? ` · ${book.collection}` : ''}
            {' · '}{new Date(book.publicationDate).getFullYear()}
          </BookEditorMain>

          {isOrderable && (
            <FormatSelectorWrap>
              <FormatLabelEl>Format</FormatLabelEl>
              <FormatOptionsRow>
                {formats.map(f => (
                  <FormatBtnEl key={f.id} $active={formatId === f.id} onClick={() => setFormatId(f.id)}>
                    <FormatNameEl $active={formatId === f.id}>{f.label}</FormatNameEl>
                    <FormatPriceEl $active={formatId === f.id}>{f.priceTTC.toFixed(2)} € TTC</FormatPriceEl>
                  </FormatBtnEl>
                ))}
              </FormatOptionsRow>
            </FormatSelectorWrap>
          )}

          <PriceZone>
            <PriceRowEl>
              <PricePublicEl>{selectedFormat.priceTTC.toFixed(2)} €</PricePublicEl>
              <PricePublicLabelEl>TTC</PricePublicLabelEl>
            </PriceRowEl>

            {(isOrderable || isEpuise) && <PriceDividerEl />}

            {isOrderable && (
              <>
                <StockZoneEl>
                  <StockIndicatorEl $statut={book.statut}>{stockLabel}</StockIndicatorEl>
                  <StockDispoDetailEl>· Livraison 1–3 jours ouvrés</StockDispoDetailEl>
                </StockZoneEl>
                <OrderZoneEl>
                  <QtyStepperLg>
                    <QtyBtnLg onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtnLg>
                    <QtyInputLg
                      type="number"
                      value={qty}
                      min={1}
                      onChange={e => { const n = parseInt(e.target.value); if (n >= 1) setQty(n) }}
                      aria-label="Quantité"
                    />
                    <QtyBtnLg onClick={() => setQty(q => q + 1)} aria-label="Augmenter">+</QtyBtnLg>
                  </QtyStepperLg>
                  <AddBtnMain
                    $added={added}
                    onClick={handleAdd}
                    aria-label="Ajouter au panier"
                    style={
                      book.statut === 'sur_commande' ? { background: '#506680' } :
                      book.statut === 'en_reimp'     ? { background: '#B65A00' } :
                      undefined
                    }
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    {added ? '✓ Ajouté au panier !' : `Ajouter${qty > 1 ? ` ${qty} ex.` : ''} au panier`}
                  </AddBtnMain>
                </OrderZoneEl>
              </>
            )}

            {isEpuise && (
              <EpuiseNoticeEl>
                {book.statut === 'rupture'
                  ? 'Cet ouvrage est temporairement en rupture de stock.'
                  : 'Cet ouvrage n\'est plus disponible.'}
              </EpuiseNoticeEl>
            )}

            {isAParaitre && (
              <ParaitreNoticeEl>
                🚫 <span>Ce titre n'est pas encore commandable. La commande s'effectue via votre représentant commercial.</span>
              </ParaitreNoticeEl>
            )}
          </PriceZone>

          <SecondaryActionsHoriz>
            <SecBtnHoriz
              ref={listBtnRef}
              onClick={() => {
                if (listBtnRef.current) setListAnchor(listBtnRef.current.getBoundingClientRect())
              }}
              aria-label="Ajouter à une liste"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Ajouter à une liste
            </SecBtnHoriz>
            <SecBtnHoriz onClick={() => { setPagesOpen(true); setPageIdx(0) }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Pages intérieures
            </SecBtnHoriz>
            {isAParaitre && (
              <SecBtnHoriz onClick={() => setVideoOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Bande annonce
              </SecBtnHoriz>
            )}
            <SecBtnHoriz onClick={handleContactRep}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Contacter le représentant
            </SecBtnHoriz>
          </SecondaryActionsHoriz>

          <SynopsisBlock>
            <SectionEyebrow>Quatrième de couverture</SectionEyebrow>
            <SynopsisText>{book.description ? `${book.description} ${LOREM_LONG}` : LOREM_LONG}</SynopsisText>
          </SynopsisBlock>

          {!isAParaitre && !isEpuise && (
            <OrderInfoBlockNew>
              <OrderInfoRowEl>
                <OrderInfoIconEl>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </OrderInfoIconEl>
                <span>Livraison habituelle <strong>1–3 jours ouvrés</strong> · Possible jusqu'au <strong>vendredi 16h</strong></span>
              </OrderInfoRowEl>
              <OrderInfoRowEl>
                <OrderInfoIconEl>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </OrderInfoIconEl>
                <span>Commande passée avant 16h : expédition <strong>le jour même</strong></span>
              </OrderInfoRowEl>
            </OrderInfoBlockNew>
          )}

          {isAParaitre && (
            <div style={{ marginTop: 12 }}>
              <SecBtnHoriz
                onClick={handleContactRep}
                style={{ width: '100%', height: 38, fontSize: 13, fontWeight: 600, background: theme.colors.navy, color: '#fff', border: 'none', borderRadius: 7, justifyContent: 'center' }}
              >
                ✉️ Contacter mon représentant
              </SecBtnHoriz>
            </div>
          )}
        </DetailCol>
      </BookLayout>

      {similar.length > 0 && (
        <SimilarSectionNew>
          <SimilarHeaderRow>
            <SimilarTitleEl>Vous aimerez aussi</SimilarTitleEl>
            <SimilarLinkEl onClick={() => navigate(`${sectionPath}?universe=${encodeURIComponent(book.universe)}`)}>
              Voir tout en {book.universe} →
            </SimilarLinkEl>
          </SimilarHeaderRow>
          <SimilarGridNew>
            {similar.map(b => {
              const bStyle = UNIVERSE_STYLES[b.universe] ?? { bg: '#E8EDF3', color: '#1C3252' }
              return (
                <SimilarCardNew key={b.id} onClick={() => navigate(`/livre/${b.id}`)}>
                  <SimilarCoverNew>
                    <BookCover isbn={b.isbn} alt={b.title} width={120} height={180} universe={b.universe} authors={b.authors} publisher={b.publisher} />
                  </SimilarCoverNew>
                  <SimilarBodyNew>
                    <SimilarUniverseBadgeEl $bg={bStyle.bg} $color={bStyle.color}>{b.universe}</SimilarUniverseBadgeEl>
                    <SimilarTitleTextEl>{b.title}</SimilarTitleTextEl>
                    <SimilarAuthorTextEl>{b.authors[0]}</SimilarAuthorTextEl>
                    <SimilarPriceEl>{b.priceTTC.toFixed(2)} €</SimilarPriceEl>
                  </SimilarBodyNew>
                </SimilarCardNew>
              )
            })}
          </SimilarGridNew>
        </SimilarSectionNew>
      )}

      {needsConfirm && book.statut && (
        <StockAlertModal
          open={alertOpen}
          statut={book.statut}
          onConfirm={() => { setAlertOpen(false); performAdd(book.statut === 'en_reimp') }}
          onCancel={() => setAlertOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — PAGES INTÉRIEURES
      ══════════════════════════════════════════════════════ */}
      {pagesOpen && createPortal(
        <ModalOverlay onClick={() => setPagesOpen(false)}>
          <PdfModal onClick={e => e.stopPropagation()}>
            <PdfHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <PdfHeaderTitle>📄 Pages intérieures</PdfHeaderTitle>
                <PdfPageIndicator>{pageIdx === 0 ? 'Argumentaire' : `Page intérieure ${pageIdx}`}</PdfPageIndicator>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PdfPageIndicator>{pageIdx + 1} / {TOTAL_PAGES}</PdfPageIndicator>
                <ModalCloseBtn onClick={() => setPagesOpen(false)} aria-label="Fermer">✕</ModalCloseBtn>
              </div>
            </PdfHeader>
            <PdfPageWrap>{renderPdfPage(pageIdx)}</PdfPageWrap>
            <PdfNav>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <NavArrow $disabled={pageIdx === 0} disabled={pageIdx === 0} onClick={() => setPageIdx(i => Math.max(0, i - 1))} aria-label="Page précédente">‹</NavArrow>
                <PageDots>
                  {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                    <PageDot key={i} $active={pageIdx === i} onClick={() => setPageIdx(i)} style={{ cursor: 'pointer' }} />
                  ))}
                </PageDots>
                <NavArrow $disabled={pageIdx === TOTAL_PAGES - 1} disabled={pageIdx === TOTAL_PAGES - 1} onClick={() => setPageIdx(i => Math.min(TOTAL_PAGES - 1, i + 1))} aria-label="Page suivante">›</NavArrow>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {isAParaitre && (
                  <PdfCartZone>
                    <QtyControlModal>
                      <QtyBtnModal onClick={() => setPdfQty(q => Math.max(1, q - 1))} disabled={pdfQty <= 1} aria-label="Diminuer">−</QtyBtnModal>
                      <QtyValueModal style={{ minWidth: 36, fontSize: 15 }}>{pdfQty}</QtyValueModal>
                      <QtyBtnModal onClick={() => setPdfQty(q => q + 1)} aria-label="Augmenter">+</QtyBtnModal>
                    </QtyControlModal>
                    <PdfAddBtn
                      $added={pdfAdded || isInRdv(book.id)}
                      onClick={handlePdfRdv}
                      aria-label="Ajouter à ma sélection RDV"
                    >
                      {pdfAdded ? '✓ Ajouté !' : isInRdv(book.id) ? '✓ Dans ma sélection' : 'Sélectionner pour RDV'}
                    </PdfAddBtn>
                  </PdfCartZone>
                )}
              </div>
            </PdfNav>
          </PdfModal>
        </ModalOverlay>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — BANDE ANNONCE
      ══════════════════════════════════════════════════════ */}
      {videoOpen && createPortal(
        <ModalOverlay onClick={() => setVideoOpen(false)}>
          <VideoModal onClick={e => e.stopPropagation()}>
            <VideoHeader>
              <PdfHeaderTitle>▶️ Bande annonce</PdfHeaderTitle>
              <ModalCloseBtn onClick={() => setVideoOpen(false)} aria-label="Fermer">✕</ModalCloseBtn>
            </VideoHeader>
            <VideoBody>
              <VideoThumb>
                <YtBrand>
                  <YtLogo>▶ YouTube</YtLogo>
                  <YtLabel>Exemple fictif</YtLabel>
                </YtBrand>
                <PlayBtn className="play-btn" />
                <VideoThumbnailText>{book.title} — Bande annonce officielle</VideoThumbnailText>
              </VideoThumb>
              <VideoInfo>
                <VideoTitle>{book.title} — Bande annonce</VideoTitle>
                <VideoUrlRow>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>🔗</span>
                  <VideoUrl>{fakeYtUrl}</VideoUrl>
                </VideoUrlRow>
                <YtOpenBtn href={fakeYtUrl} target="_blank" rel="noopener noreferrer">
                  <span>▶</span> Ouvrir sur YouTube
                </YtOpenBtn>
              </VideoInfo>
            </VideoBody>
          </VideoModal>
        </ModalOverlay>,
        document.body
      )}

      {listAnchor && book && (
        <ListPickerPopover
          book={book}
          anchorRect={listAnchor}
          onClose={() => setListAnchor(null)}
        />
      )}
    </Page>
  )
}
