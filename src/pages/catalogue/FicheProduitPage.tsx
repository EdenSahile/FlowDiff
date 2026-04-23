import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getBookById } from '@/data/mockBooks'
import { slugifyAuthor } from '@/lib/slugify'
import { BookCover } from '@/components/catalogue/BookCover'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { ListPickerPopover } from '@/components/catalogue/ListPickerPopover'
import { StockStatus } from '@/components/ui/StockStatus'
import { StockAlertModal } from '@/components/ui/StockAlertModal'
import { theme } from '@/lib/theme'

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

const UNIVERSE_COLOR: Record<string, string> = {
  'Littérature':     '#1C3252',
  'BD/Mangas':       '#C04A00',
  'Jeunesse':        '#1565C0',
  'Adulte-pratique': '#1E7045',
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

const Wrap = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(28,58,95,0.11), 0 1px 4px rgba(28,58,95,0.06);
  overflow: hidden;
  border: 1px solid rgba(28,58,95,0.07);
`

const Body = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`

/* ── Colonne couverture ── */
const CoverCol = styled.div`
  width: 230px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #F2EFE8 0%, #EDE9E2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 22px 28px;
  gap: 22px;
  border-right: 1px solid #E5E0D8;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #E5E0D8;
    padding: 24px 20px 20px;
    flex-direction: row;
    align-items: flex-start;
    gap: 20px;
  }
`

const CoverShadow = styled.div`
  border-radius: 8px;
  box-shadow: 6px 10px 28px rgba(28,58,95,0.25);
  overflow: hidden;
  flex-shrink: 0;
`

const SecondaryActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1;
  }
`

const SecBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 12px;
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(28,58,95,0.12);
  border-radius: 9px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  transition: background .15s, border-color .15s, transform .1s;
  text-align: left;

  &:hover {
    background: #fff;
    border-color: rgba(28,58,95,0.25);
    transform: translateX(2px);
  }
`

/* ── Colonne info ── */
const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const InfoTop = styled.div`
  padding: 28px 30px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
`

const UniverseBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 20px;
  background: ${({ $color }) => $color}18;
  border: 1px solid ${({ $color }) => $color}35;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  &::before {
    content: '';
    display: inline-block;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`

const TypeBadge = styled.span<{ $type: string }>`
  padding: 4px 11px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ $type }) =>
    $type === 'nouveaute' ? '#FEF5E0' :
    $type === 'a-paraitre' ? '#EEE8FF' : '#E8F5EE'};
  color: ${({ $type }) =>
    $type === 'nouveaute' ? '#B8740A' :
    $type === 'a-paraitre' ? '#5B33C1' : '#1E7045'};
`

const BookTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.22;
  letter-spacing: -0.01em;
`

const BookAuthors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
  font-style: italic;
`

const MetaGrid = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 10px;
  padding: 14px 16px;
`

const MetaDt = styled.dt`
  color: ${({ theme }) => theme.colors.gray[400]};
  font-weight: 600;
  white-space: nowrap;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const MetaDd = styled.dd`
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
  font-weight: 500;
`

const Divider = styled.div`
  height: 1px;
  background: #EDE9E2;
  margin: 0 30px;
`

const FormatSection = styled.div`
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SectionLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
`

const FormatPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const FormatPill = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 13px 18px;
  border-radius: 12px;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.navy : '#E0DBD4'};
  background: ${({ $active }) => $active ? '#EEF2FA' : '#FAFAF8'};
  cursor: pointer;
  transition: border-color .18s, background .18s, transform .12s;
  min-width: 148px;
  text-align: left;
  box-shadow: ${({ $active }) => $active ? '0 2px 8px rgba(28,58,95,0.12)' : 'none'};
  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    background: ${({ $active }) => $active ? '#EEF2FA' : '#F2EEE8'};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`

const PillLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const PillDesc = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const PillPrice = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 800;
  margin-top: 5px;
  color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[600]};
  letter-spacing: -0.01em;
`

const ContentSection = styled.div`
  padding: 0 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const AccordionItem = styled.div`border-top: 1px solid #EDE9E2;`

const AccordionToggle = styled.button<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: ${({ $open, theme }) => $open ? theme.colors.navy : theme.colors.gray[400]};
  transition: color .15s;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const AccordionChevron = styled.span<{ $open: boolean }>`
  display: inline-block;
  transition: transform .2s ease;
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  font-size: 10px;
  opacity: 0.5;
`

const AccordionBody = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => $open ? 'block' : 'none'};
  padding-bottom: 16px;
`

const Description = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.75;
  margin: 0;
`

/* ── Footer commande ── */
const Footer = styled.div`
  padding: 18px 30px;
  border-top: 2px solid #EDE9E2;
  background: linear-gradient(0deg, #FAFAF8, #fff);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
`

const PriceBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const PriceTTC = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.02em;
`

const PriceCaption = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-weight: 500;
`

const OrderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 10px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[50]};
`

const QtyBtn = styled.button`
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

const QtyValue = styled.span`
  min-width: 48px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
`

const AddBtn = styled.button<{ $added: boolean }>`
  flex: 1;
  min-width: 200px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: ${({ $added, theme }) => $added ? theme.colors.primaryHover : theme.colors.primary};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: background .2s, transform .1s, box-shadow .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.01em;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  &:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
  &:active:not(:disabled) { transform: scale(0.98); }
`

/* ── Footer À paraître ── */
const ParaitreFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`

const ParaitreNotice = styled.div`
  background: #FFF3E0;
  border: 1px solid #E65100;
  border-left: 4px solid #E65100;
  border-radius: 10px;
  padding: 12px 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: #C84B00;
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 1.5;
`

const ContactRepBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, transform .1s, box-shadow .15s;
  box-shadow: 0 4px 14px rgba(28,58,95,0.25);
  &:hover {
    background: ${({ theme }) => theme.colors.navyHover};
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(28,58,95,0.30);
  }
  &:active { transform: scale(0.98); }
`

const NotFoundBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
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
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(10,18,35,0.30);
  display: flex;
  flex-direction: column;
  animation: ${modalIn} 0.22s ease;
  max-height: 90vh;
  overflow: hidden;
`

/* ─── Modal PDF ─── */

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
  border-radius: 18px 18px 0 0;
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
  border-radius: 8px;
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
  border-radius: 4px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  padding: 36px 40px;
  font-family: Georgia, serif;
`

/* Page 0 — Argumentaire */
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
  font-family: 'Roboto', Arial, sans-serif;
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
  font-family: 'Roboto', Arial, sans-serif;
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
  font-family: 'Roboto', Arial, sans-serif;
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
  font-family: 'Roboto', Arial, sans-serif;
`

const ArgMetaValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  font-family: 'Roboto', Arial, sans-serif;
`

/* Pages intérieures */
const InteriorPageNum = styled.p`
  text-align: center;
  font-size: 10px;
  color: #B5AFA7;
  margin-bottom: 28px;
  font-family: 'Roboto', Arial, sans-serif;
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
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #EDE9E2;
  background: #FAFAF8;
  border-radius: 0 0 18px 18px;
`

const NavArrow = styled.button<{ $disabled?: boolean }>`
  width: 40px; height: 40px;
  border: 1.5px solid ${({ $disabled, theme }) => $disabled ? '#E6E1DA' : theme.colors.navy};
  border-radius: 10px;
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
  border-radius: 4px;
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#D5CFC7'};
  transition: all 0.2s ease;
`

/* ─── Modal Vidéo ─── */

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
  border-radius: 12px;
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
  font-family: 'Roboto', Arial, sans-serif;
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
  border-radius: 4px;
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
  border-radius: 8px;
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
  border-radius: 8px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: #CC0000; }
`

function IconCart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

/* ══ Composant ══ */

export function FicheProduitPage() {
  const { id }        = useParams<{ id: string }>()
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { isInAnyList } = useWishlist()

  const [qty, setQty]             = useState(1)
  const [added, setAdded]         = useState(false)
  const [formatId, setFormatId]   = useState<FormatId>('broche')
  const [resumeOpen, setResumeOpen] = useState(true)
  const [listAnchor, setListAnchor] = useState<DOMRect | null>(null)
  const [alertOpen, setAlertOpen]   = useState(false)
  const listBtnRef = useRef<HTMLButtonElement>(null)

  /* Modals */
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
    { id: 'broche', label: 'Broché',  description: 'Format standard',  priceTTC: book.priceTTC },
    { id: 'poche',  label: 'Poche',   description: 'Format poche',     priceTTC: Math.round(book.priceTTC * 0.62 * 100) / 100 },
  ]

  const selectedFormat = formats.find(f => f.id === formatId)!
  const isAParaitre    = book.type === 'a-paraitre'
  const isEpuise       = book.statut === 'epuise'
  const needsConfirm   = book.statut === 'sur_commande' || book.statut === 'en_reimp'
  const isOrderable    = !isAParaitre && !isEpuise
  const uvColor        = UNIVERSE_COLOR[book.universe] ?? theme.colors.navy
  const typeLabel      = book.type === 'nouveaute' ? 'Nouveauté' : book.type === 'fonds' ? 'Fonds' : 'À paraître'

  const formattedDate = new Date(book.publicationDate).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const descriptionText = book.description
    ? `${book.description}\n\n${LOREM_LONG}`
    : LOREM_LONG

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
    if (needsConfirm) {
      setAlertOpen(true)
      return
    }
    performAdd(false)
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

  /* ── Pages intérieures : rendu d'une page selon son index ── */
  function renderPdfPage(index: number) {
    if (!book) return null
    if (index === 0) {
      return (
        <PdfPage>
          <ArgHeader>
            <ArgLabel>Argumentaire commercial</ArgLabel>
            <ArgTitle>{book.title}</ArgTitle>
            <ArgAuthor>{book.authors.join(', ')}</ArgAuthor>
            <ArgPublisher>
              {book.publisher}{book.collection ? ` · ${book.collection}` : ''}
            </ArgPublisher>
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
          <InteriorParagraph>
            <InteriorDrop>L</InteriorDrop>
            {LOREM_LONG}
          </InteriorParagraph>
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

  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>← Retour</BackButton>

      <Wrap>
        <Body>

          {/* ── Couverture ── */}
          <CoverCol>
            <CoverShadow>
              <BookCover isbn={book.isbn} alt={book.title} width={168} height={242} universe={book.universe} authors={book.authors} publisher={book.publisher} />
            </CoverShadow>

            <SecondaryActions>
              {/* Pages intérieures + Bande annonce : uniquement pour À paraître */}
              {isAParaitre && (
                <>
                  <SecBtn onClick={() => { setPagesOpen(true); setPageIdx(0) }}>
                    🖼 Pages intérieures
                  </SecBtn>
                  <SecBtn onClick={() => setVideoOpen(true)}>
                    ▶️ Bande annonce
                  </SecBtn>
                </>
              )}
              <SecBtn onClick={() => navigate(`/auteur/${slugifyAuthor(book.authors[0])}`)}>
                📚 Parutions de l'auteur
              </SecBtn>
              <SecBtn
                ref={listBtnRef}
                onClick={() => {
                  if (listBtnRef.current) setListAnchor(listBtnRef.current.getBoundingClientRect())
                }}
                aria-label="Ajouter à une liste"
              >
                <svg width="14" height="14" viewBox="0 0 24 24"
                  fill={book && isInAnyList(book.id) ? theme.colors.accent : 'none'}
                  stroke={book && isInAnyList(book.id) ? theme.colors.accent : 'currentColor'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {book && isInAnyList(book.id) ? 'Dans une liste' : 'Ajouter à une liste'}
              </SecBtn>
            </SecondaryActions>
          </CoverCol>

          {/* ── Infos ── */}
          <InfoCol>
            <InfoTop>
              <BadgeRow>
                <UniverseBadge $color={uvColor}>{book.universe}</UniverseBadge>
                <TypeBadge $type={book.type}>{typeLabel}</TypeBadge>
              </BadgeRow>

              <BookTitle>{book.title}</BookTitle>
              <BookAuthors>{book.authors.join(', ')}</BookAuthors>

              <MetaGrid>
                <MetaDt>Éditeur</MetaDt>
                <MetaDd>{book.publisher}{book.collection ? ` — ${book.collection}` : ''}</MetaDd>
                <MetaDt>ISBN</MetaDt>
                <MetaDd><code style={{ fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.02em' }}>{book.isbn}</code></MetaDd>
                {book.pages && <><MetaDt>Pages</MetaDt><MetaDd>{book.pages} p.</MetaDd></>}
                <MetaDt>Parution</MetaDt>
                <MetaDd>{formattedDate}</MetaDd>
                {book.programme && <><MetaDt>Programme</MetaDt><MetaDd>{book.programme}</MetaDd></>}
                {book.statut && !isAParaitre && (
                  <>
                    <MetaDt>Disponibilité</MetaDt>
                    <MetaDd><StockStatus statut={book.statut} delaiReimp={book.delaiReimp} /></MetaDd>
                  </>
                )}
              </MetaGrid>
              {isEpuise && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#555550', fontStyle: 'italic' }}>
                  Cet ouvrage n'est plus disponible.
                </p>
              )}
            </InfoTop>

            <Divider />

            {/* Format — uniquement pour titres commandables */}
            {isOrderable && (
              <>
                <FormatSection>
                  <SectionLabel>Format</SectionLabel>
                  <FormatPills>
                    {formats.map(f => (
                      <FormatPill key={f.id} $active={formatId === f.id} onClick={() => setFormatId(f.id)}>
                        <PillLabel>{f.label}</PillLabel>
                        <PillDesc>{f.description}</PillDesc>
                        <PillPrice $active={formatId === f.id}>{f.priceTTC.toFixed(2)} €</PillPrice>
                      </FormatPill>
                    ))}
                  </FormatPills>
                </FormatSection>
                <Divider />
              </>
            )}

            {/* ── Accordéon Résumé uniquement ── */}
            <ContentSection>
              <AccordionItem>
                <AccordionToggle $open={resumeOpen} onClick={() => setResumeOpen(o => !o)}>
                  <span>Résumé</span>
                  <AccordionChevron $open={resumeOpen}>▼</AccordionChevron>
                </AccordionToggle>
                <AccordionBody $open={resumeOpen}>
                  <Description>{descriptionText}</Description>
                </AccordionBody>
              </AccordionItem>
            </ContentSection>

          </InfoCol>
        </Body>

        {/* ── Footer ── */}
        <Footer>
          <PriceBlock>
            <PriceTTC>{selectedFormat.priceTTC.toFixed(2)} €</PriceTTC>
            <PriceCaption>Prix TTC{isOrderable ? ` — ${selectedFormat.label}` : ''}</PriceCaption>
          </PriceBlock>

          {isAParaitre ? (
            <ParaitreFooter>
              <ParaitreNotice>
                🚫 <span>Ce titre n'est pas encore commandable. La commande s'effectue via votre représentant commercial.</span>
              </ParaitreNotice>
              <ContactRepBtn onClick={handleContactRep}>
                ✉️ Contacter mon représentant
              </ContactRepBtn>
            </ParaitreFooter>
          ) : isEpuise ? (
            <OrderRow>
              <AddBtn
                $added={false}
                disabled
                aria-disabled="true"
                aria-label="Épuisé"
                onClick={e => e.preventDefault()}
                style={{ background: '#C9C9C2', color: '#6B6B68', cursor: 'not-allowed', flex: 1 }}
              >
                <IconCart /> Épuisé — indisponible
              </AddBtn>
            </OrderRow>
          ) : (
            <OrderRow>
              <QtyControl>
                <QtyBtn onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Diminuer">−</QtyBtn>
                <QtyValue>{qty}</QtyValue>
                <QtyBtn onClick={() => setQty(q => q + 1)} aria-label="Augmenter">+</QtyBtn>
              </QtyControl>
              <AddBtn
                $added={added}
                onClick={handleAdd}
                aria-label="Ajouter au panier"
                style={
                  book.statut === 'sur_commande' ? { background: '#506680' } :
                  book.statut === 'en_reimp'     ? { background: '#B65A00' } :
                                                    undefined
                }
              >
                {added ? '✓ Ajouté au panier !' : <><IconCart /> Ajouter {qty > 1 ? `${qty} ex. ` : ''}au panier</>}
              </AddBtn>
            </OrderRow>
          )}
        </Footer>
      </Wrap>

      {needsConfirm && book.statut && (
        <StockAlertModal
          open={alertOpen}
          statut={book.statut}
          onConfirm={() => {
            setAlertOpen(false)
            performAdd(book.statut === 'en_reimp')
          }}
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
                <PdfPageIndicator>
                  {pageIdx === 0 ? 'Argumentaire' : `Page intérieure ${pageIdx}`}
                </PdfPageIndicator>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PdfPageIndicator>{pageIdx + 1} / {TOTAL_PAGES}</PdfPageIndicator>
                <ModalCloseBtn onClick={() => setPagesOpen(false)} aria-label="Fermer">✕</ModalCloseBtn>
              </div>
            </PdfHeader>

            <PdfPageWrap>
              {renderPdfPage(pageIdx)}
            </PdfPageWrap>

            <PdfNav>
              <NavArrow
                $disabled={pageIdx === 0}
                disabled={pageIdx === 0}
                onClick={() => setPageIdx(i => Math.max(0, i - 1))}
                aria-label="Page précédente"
              >
                ‹
              </NavArrow>

              <PageDots>
                {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                  <PageDot key={i} $active={pageIdx === i} onClick={() => setPageIdx(i)} style={{ cursor: 'pointer' }} />
                ))}
              </PageDots>

              <NavArrow
                $disabled={pageIdx === TOTAL_PAGES - 1}
                disabled={pageIdx === TOTAL_PAGES - 1}
                onClick={() => setPageIdx(i => Math.min(TOTAL_PAGES - 1, i + 1))}
                aria-label="Page suivante"
              >
                ›
              </NavArrow>
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
