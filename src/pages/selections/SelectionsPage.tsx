import { useState, useMemo, useRef, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { MOCK_BOOKS, UNIVERSES, type Universe } from '@/data/mockBooks'
import { MOCK_SERIES, type Serie, type OffreCommerciale } from '@/data/mockSeries'
import { BookCover } from '@/components/catalogue/BookCover'

/* ══════════════════════════════════════════════
   COUVERTURE SÉRIE — dégradé générique par univers
   (évite d'afficher une couverture de titre précis)
══════════════════════════════════════════════ */
const UNIVERSE_COVER_GRADIENTS: Record<string, [string, string]> = {
  'BD/Mangas':       ['#C08F2A', '#8B6514'],
  'Littérature':     ['#4E8C70', '#2D6450'],
  'Jeunesse':        ['#7E6BC4', '#5A4A9A'],
  'Adulte-pratique': ['#7A8FA0', '#5A6E80'],
}
const DEFAULT_COVER_GRADIENT: [string, string] = ['#5B7EA6', '#3D6391']

function SerieCover({ serie }: { serie: Serie; width?: number; height?: number }) {
  const [g0, g1] = UNIVERSE_COVER_GRADIENTS[serie.univers] ?? DEFAULT_COVER_GRADIENT
  const initials = serie.nom
    .split(/\s+/)
    .filter(w => w.length > 1)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || serie.nom[0].toUpperCase()

  return (
    <CoverWrapper>
      <CoverFallback style={{ background: `linear-gradient(160deg, ${g0} 0%, ${g1} 100%)` }}>
        <CoverFallbackSpine />
        <CoverFallbackInitials>{initials}</CoverFallbackInitials>
        <CoverFallbackText>{serie.nom}</CoverFallbackText>
        <CoverFallbackLabel>couv. fictive</CoverFallbackLabel>
      </CoverFallback>
    </CoverWrapper>
  )
}

const CoverWrapper = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`

const CoverFallback = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px 6px;
  gap: 4px;
`

const CoverFallbackInitials = styled.div`
  font-size: 30px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: -0.02em;
  line-height: 1;
  flex-shrink: 0;
`

const CoverFallbackSpine = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: rgba(201, 168, 76, 0.6);
`

const CoverFallbackText = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  display: flex;
  align-items: center;
`

const CoverFallbackLabel = styled.div`
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  letter-spacing: 0.02em;
  flex-shrink: 0;
`

/* ══════════════════════════════════════════════
   TYPES DE FILTRES
══════════════════════════════════════════════ */
type FilterType = Universe | 'Tous' | 'Prix littéraire'

/* ══════════════════════════════════════════════
   STYLES — page principale
══════════════════════════════════════════════ */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 900px;
  margin: 0 auto;
  animation: ${fadeIn} .25s ease;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const PageEyebrow = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 18px;
    height: 1.5px;
    background: ${({ theme }) => theme.colors.accent};
    display: inline-block;
  }
`

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0 0 4px;
`

const PageSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`

/* ── Champ de recherche ── */
const SearchBar = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SearchIconWrap = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  pointer-events: none;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 11px 16px 11px 42px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.xl};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
`

const ClearBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.gray[200]};
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 11px;
  line-height: 1;
  padding: 0;
  &:hover { background: ${({ theme }) => theme.colors.gray[400]}; color: white; }
`

/* ── Filtres ── */
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
`

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const FilterLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
  width: 80px;
`

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const FilterPill = styled.button<{ $active: boolean; $variant?: 'prix' | 'offre' }>`
  padding: 7px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ $active, $variant, theme }) => {
    if ($active && $variant === 'prix') return '#7B1FA2'
    if ($active && $variant === 'offre') return '#2E7D32'
    if ($active) return theme.colors.navy
    return theme.colors.gray[200]
  }};
  background-color: ${({ $active, $variant, theme }) => {
    if ($active && $variant === 'prix') return '#7B1FA2'
    if ($active && $variant === 'offre') return '#2E7D32'
    if ($active) return theme.colors.navy
    return theme.colors.white
  }};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 5px;
`

const GreenDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
  flex-shrink: 0;
`

/* ── Sections ── */
const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: 10px;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
`

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const SectionCount = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-weight: 600;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.lg};
`

/* ── Scroll horizontal — 5 max visibles ── */
const HScroll = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[200]};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`

/* ── Tuile : largeur fixe pour afficher ~5 par ligne ── */
const Tile = styled.button`
  position: relative;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  /* ~5 tiles visibles dans 900px : (900 - 32*2 - 14*4) / 5 ≈ 150px */
  width: 148px;
  height: 222px;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0;
  background: ${({ theme }) => theme.colors.navyLight};
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  scroll-snap-align: start;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.12);

  &:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 16px 40px rgba(30, 58, 95, 0.28);
  }
  &:active { transform: translateY(-2px) scale(1.01); }

  @media (max-width: 480px) { width: 112px; height: 168px; }
`

const TileGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 35%,
    rgba(10, 20, 45, 0.45) 55%,
    rgba(10, 20, 45, 0.92) 100%
  );
  z-index: 1;
  transition: opacity 0.22s ease;

  ${Tile}:hover & { opacity: 0.9; }
`

const TileLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 10px 14px;
  z-index: 2;
  text-align: center;
`

const TileName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  text-shadow: 0 1px 6px rgba(0,0,0,0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
`

const TileAuthor = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.70);
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`

const TileCount = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.50);
  margin-top: 2px;
  text-align: center;
`

/* Badge Offre spéciale */
const OffreBadge = styled.div`
  position: absolute;
  top: 9px;
  right: 9px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background-color: #43A047;
  box-shadow: 0 0 0 2.5px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.25);
  z-index: 3;
`

/* Badge Prix littéraire */
const PrixBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(103, 25, 140, 0.90);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: ${({ theme }) => theme.radii.md};
  z-index: 3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 3px;
`

/* ══════════════════════════════════════════════
   PLV SECTION — Mini visuel fictif + OP info
══════════════════════════════════════════════ */
const PLVSectionWrapper = styled.div`
  margin: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: 12px;
  align-items: stretch;
`

/* Mini PLV physique fictive — portrait, style affiche librairie */
const MiniPLV = styled.div`
  width: 92px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0,0,0,0.12);
  position: relative;
`

const MiniPLVTop = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  padding: 5px 6px;
  text-align: center;
`

const MiniPLVTopText = styled.div`
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: ${({ theme }) => theme.colors.navy};
`

const MiniPLVBody = styled.div`
  flex: 1;
  padding: 10px 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
`

const MiniPLVEmoji = styled.div`
  font-size: 22px;
  line-height: 1;
`

const MiniPLVOfferText = styled.div`
  font-size: 7.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.35;
`

const MiniPLVRule = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 192, 0, 0.28);
`

const MiniPLVSerieLabel = styled.div`
  font-size: 6.5px;
  font-weight: 600;
  color: rgba(255, 192, 0, 0.60);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.3;
`

/* Carte info OP — fond gradient jaune, texte navy */
const OPInfoCard = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #E8960C 0%, #C47A08 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 11px 14px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 3px 12px rgba(255, 143, 0, 0.22);
`

const OPInfoTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`

const OPInfoTag = styled.div`
  background: rgba(0, 0, 0, 0.16);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.sm};
`

const OPInfoValidity = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.80);
  font-weight: 500;
`

const OPInfoTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.25;
`

/* ══════════════════════════════════════════════
   STEPPER + INDICATEUR OP dans les lignes livre
══════════════════════════════════════════════ */
const BookRowControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
`

const PriceStepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StepperRow = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  overflow: hidden;
`

const StepBtn = styled.button`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s;
  &:hover { background: ${({ theme }) => theme.colors.gray[200]}; }
  &:active { background: ${({ theme }) => theme.colors.gray[400]}; }
`

const StepNum = styled.input`
  width: 38px;
  height: 26px;
  text-align: center;
  border: none;
  border-left: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-right: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  &:focus { outline: none; background: #FFFDE7; }
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
`

const AddToCartBtn = styled.button<{ $added?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 11px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $added, theme }) => $added ? theme.colors.success : theme.colors.primary};
  color: #fdfdfd;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  &:hover { opacity: 0.88; }
`

/* ══════════════════════════════════════════════
   FORMULAIRE DE COMMANDE OP (lot précomposé)
══════════════════════════════════════════════ */
const OPOrderSection = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
`

const OPSectionLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 8px;
  margin-top: ${({ theme }) => theme.spacing.md};
`


/* ══════════════════════════════════════════════
   TABLEAU COMPOSITION OP
   Grid : [cover 40px] [titre 1fr] [prix 76px] [qté 48px] [total 88px]
══════════════════════════════════════════════ */
const OPTable = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`

/* Ligne générique (header + data) */
const OPTRow = styled.div<{ $variant?: 'head' | 'cadeau' | 'total' }>`
  display: grid;
  grid-template-columns: 40px 1fr 76px 48px 88px;
  align-items: center;
  gap: 0;
  padding: 0 14px;
  min-height: ${({ $variant }) => $variant === 'head' ? '34px' : $variant === 'total' ? '40px' : '70px'};
  background: ${({ $variant, theme }) =>
    $variant === 'head'  ? theme.colors.gray[50] :
    $variant === 'cadeau'? '#F1F8E9' :
    $variant === 'total' ? 'rgba(30,58,95,0.04)' :
    'transparent'};
  border-bottom: ${({ $variant, theme }) =>
    $variant === 'total' ? 'none' :
    $variant === 'head'  ? `1.5px solid ${theme.colors.gray[100]}` :
    `1px solid ${theme.colors.gray[50]}`};
  border-top: ${({ $variant, theme }) =>
    $variant === 'total' ? `2px solid ${theme.colors.gray[200]}` : 'none'};
  &:last-child { border-bottom: none; }
`

/* Cellule cover */
const OPTCover = styled.div`
  padding: 8px 10px 8px 0;
  display: flex;
  align-items: center;
`

/* Cellule texte titre + meta */
const OPTText = styled.div`
  min-width: 0;
  padding: 8px 8px 8px 0;
`

const OPTTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const OPTMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/* Cellule générique (prix, qté, total) */
const OPTCell = styled.div<{ $bold?: boolean; $color?: string; $head?: boolean }>`
  font-size: ${({ $head }) => $head ? '10px' : '13px'};
  font-weight: ${({ $bold, $head }) => $bold || $head ? 800 : 500};
  color: ${({ $color, $head, theme }) => $head ? theme.colors.gray[400] : $color ?? theme.colors.navy};
  text-align: right;
  text-transform: ${({ $head }) => $head ? 'uppercase' : 'none'};
  letter-spacing: ${({ $head }) => $head ? '0.07em' : '0'};
  white-space: nowrap;
  padding: 0 4px;

  /* Colonne Qté : centré */
  &[data-col="qty"] {
    text-align: center;
  }
`

/* ══════════════════════════════════════════════
   BLOC QUANTITÉ PLV — commande du lot
══════════════════════════════════════════════ */
const PLVQtyBlock = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const PLVQtyLeft = styled.div`
  min-width: 0;
`

const PLVQtyTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const PLVQtySub = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 3px;
`

const PLVQtyRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`

const PLVQtyTotal = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
`

/* Bouton ajouter l'OP */
const OPAddBtn = styled.button<{ $added?: boolean }>`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: 14px 20px;
  background: ${({ $added, theme }) => $added ? theme.colors.success : theme.colors.primary};
  color: #fdfdfd;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  &:hover { opacity: 0.88; }
  &:active { transform: scale(0.99); }
`

/* ── Empty state ── */
const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

/* ═══════════════════════════════════════════════
   STYLES — vue détail série
═══════════════════════════════════════════════ */
const DetailPage = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.lg};
  padding-bottom: 0;
  opacity: 0.7;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
`

/* Bandeau header série */
const SerieHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
`

const SerieHeaderCover = styled.div`
  flex-shrink: 0;
  position: relative;
  width: 80px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(30, 58, 95, 0.25);
`

const SerieHeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const SerieHeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin: 0 0 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const SerieHeaderMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SerieHeaderDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.55;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  opacity: 0.75;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
`

const Badge = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
`

const AddAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fdfdfd;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover { background: #e6ac00; }
`

/* Divider */
const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[100]};
  margin: 0 ${({ theme }) => theme.spacing.lg};
`

/* Barre recherche détail */
const DetailSearchBar = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`

const DetailSearchIcon = styled.span`
  position: absolute;
  left: calc(${({ theme }) => theme.spacing.lg} + 12px);
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  pointer-events: none;
`

const DetailSearchInput = styled.input`
  width: 100%;
  padding: 9px 14px 9px 36px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.gray[50]};
  box-sizing: border-box;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; background: white; }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
`

/* Liste des livres */
const BookList = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BookRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 12px rgba(255, 192, 0, 0.18);
  }
`

const BookRowInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const BookRowTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BookRowMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`

const PriceBadge = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.navy};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.md};
`

const ResultCount = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  margin-bottom: 4px;
`

/* ── Icônes ── */
function IconTrophy({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  )
}

function IconDot({ size = 7 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="4"/>
    </svg>
  )
}

function IconBack() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconCart() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}

/* ══════════════════════════════════════════════
   COMPOSANT PLV — Mini visuel fictif + OP info
══════════════════════════════════════════════ */
function PLVSection({ offre, nom }: { offre: OffreCommerciale; nom: string }) {
  // Nom du cadeau sans le préfixe "Offre "
  const cadeauShort = offre.titre.replace(/^Offre\s+/i, '')

  return (
    <PLVSectionWrapper>

      {/* ── Mini PLV physique fictive ── */}
      <MiniPLV>
        <MiniPLVTop>
          <MiniPLVTopText>OP commerciale</MiniPLVTopText>
        </MiniPLVTop>

        <MiniPLVBody>
          <MiniPLVEmoji>{offre.cadeauEmoji}</MiniPLVEmoji>
          <MiniPLVOfferText>{cadeauShort}</MiniPLVOfferText>
          <MiniPLVRule />
          <MiniPLVSerieLabel>{nom}</MiniPLVSerieLabel>
        </MiniPLVBody>
      </MiniPLV>

      {/* ── Carte info OP ── */}
      <OPInfoCard>
        <OPInfoTopRow>
          <OPInfoTag>OP commerciale</OPInfoTag>
          {offre.validUntil && <OPInfoValidity>jusqu'au {offre.validUntil}</OPInfoValidity>}
        </OPInfoTopRow>
        <OPInfoTitle>{offre.description}</OPInfoTitle>
      </OPInfoCard>

    </PLVSectionWrapper>
  )
}

/* ══════════════════════════════════════════════
   COMPOSANT TUILE
══════════════════════════════════════════════ */
function HeroTile({ serie, onClick }: { serie: Serie; onClick: () => void }) {
  return (
    <Tile onClick={onClick} aria-label={`Voir la série ${serie.nom}`}>
      <SerieCover serie={serie} width={148} height={222} />
      <TileGradient />
      {serie.isOffreSpeciale && <OffreBadge />}
      {serie.isPrixLitteraire && <PrixBadge><IconTrophy size={8} /> Prix</PrixBadge>}
      <TileLabel>
        <TileName>{serie.nom}</TileName>
        <TileAuthor>{serie.auteur}</TileAuthor>
        <TileCount>
          {serie.bookIds.length} titre{serie.bookIds.length > 1 ? 's' : ''}
        </TileCount>
      </TileLabel>
    </Tile>
  )
}

/* ══════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════ */
export function SelectionsPage() {
  const navigate = useNavigate()
  const { addToCart, addOPToCart } = useCart()
  const searchRef = useRef<HTMLInputElement>(null)

  /* État grille */
  const [filter, setFilter] = useState<FilterType>('Tous')
  const [offreOnly, setOffreOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  /* État détail */
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null)
  const [detailSearch, setDetailSearch] = useState('')
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({})
  const [qtys, setQtys] = useState<Record<string, number>>({})   // séries sans OP
  const [nbPLV, setNbPLV] = useState(1)                          // séries avec OP
  const [opAdded, setOpAdded] = useState(false)

  /* ── Filtrage grille ── */
  const filteredSeries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return MOCK_SERIES.filter(s => {
      // Filtre univers / prix littéraire
      if (filter === 'Prix littéraire') {
        if (!s.isPrixLitteraire) return false
      } else if (filter !== 'Tous') {
        if (s.univers !== filter) return false
      }
      // Filtre offre spéciale
      if (offreOnly && !s.isOffreSpeciale) return false
      // Filtre recherche (nom série, auteur)
      if (q) {
        const inNom = s.nom.toLowerCase().includes(q)
        const inAuteur = s.auteur.toLowerCase().includes(q)
        const inBooks = MOCK_BOOKS.some(
          b =>
            s.bookIds.includes(b.id) &&
            (b.title.toLowerCase().includes(q) ||
              b.isbn.includes(q) ||
              b.authors.some(a => a.toLowerCase().includes(q)))
        )
        if (!inNom && !inAuteur && !inBooks) return false
      }
      return true
    })
  }, [filter, offreOnly, searchQuery])

  /* Groupement par catégorie */
  const groupedSections = useMemo(() => {
    const map = new Map<string, Serie[]>()
    filteredSeries.forEach(s => {
      if (!map.has(s.categorie)) map.set(s.categorie, [])
      map.get(s.categorie)!.push(s)
    })
    return Array.from(map.entries())
  }, [filteredSeries])

  /* ── Livres du détail ── */
  const serieBooks = useMemo(() => {
    if (!selectedSerie) return []
    return selectedSerie.bookIds
      .map(id => MOCK_BOOKS.find(b => b.id === id))
      .filter(Boolean)
      .sort((a, b) => b!.publicationDate.localeCompare(a!.publicationDate)) as typeof MOCK_BOOKS
  }, [selectedSerie])

  const filteredDetailBooks = useMemo(() => {
    const q = detailSearch.trim().toLowerCase()
    if (!q) return serieBooks
    return serieBooks.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.authors.some(a => a.toLowerCase().includes(q))
    )
  }, [serieBooks, detailSearch])

  /* Reset à chaque changement de série */
  useEffect(() => {
    if (!selectedSerie) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNbPLV(1)
    setOpAdded(false)
    setAddedMap({})
    // Pour les séries sans OP : qty = 1 par titre
    if (!selectedSerie.offreCommerciale) {
      const init: Record<string, number> = {}
      selectedSerie.bookIds.forEach(id => { init[id] = 1 })
      setQtys(init)
    }
  }, [selectedSerie])

  /* ── Handlers ── */
  // Ajouter une OP complète (lot × nbPLV)
  function handleAddOP() {
    if (!selectedSerie?.offreCommerciale) return
    const offre = selectedSerie.offreCommerciale
    const qtyParTitre = offre.qtyParTitreParPLV * nbPLV
    const totalTitres = serieBooks.length * qtyParTitre
    const nbCadeaux   = Math.floor(totalTitres / offre.ratioAchat)
    addOPToCart({
      serieId:       selectedSerie.id,
      serieName:     selectedSerie.nom,
      opTitle:       offre.titre,
      opDescription: offre.description,
      validUntil:    offre.validUntil,
      books: serieBooks.map(book => ({ book, quantity: qtyParTitre })),
      cadeau: {
        label:    offre.cadeauLabel,
        emoji:    offre.cadeauEmoji,
        isbn:     offre.isbnCadeau,
        quantity: nbCadeaux,
      },
      plv: {
        isbn:         offre.isbnPLV,
        description:  offre.descPLV,
        quantity:     nbPLV,
        pricePerUnit: offre.prixPLV,
      },
    })
    setOpAdded(true)
    setTimeout(() => setOpAdded(false), 3000)
  }

  // Ajouter un titre individuel (séries sans OP)
  function handleAdd(bookId: string, qty: number, e: React.MouseEvent) {
    e.stopPropagation()
    const book = MOCK_BOOKS.find(b => b.id === bookId)
    if (!book) return
    addToCart(book, qty)
    setAddedMap(prev => ({ ...prev, [bookId]: true }))
    setTimeout(() => setAddedMap(prev => ({ ...prev, [bookId]: false })), 2500)
  }

  // Ajouter tous les titres (bouton header, séries sans OP)
  function handleAddAll(e: React.MouseEvent) {
    e.stopPropagation()
    serieBooks.forEach(book => {
      const qty = qtys[book.id] ?? 1
      addToCart(book, qty)
    })
  }

  function handleBack() {
    setSelectedSerie(null)
    setDetailSearch('')
  }

  function formatEur(val: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
  }

  /* ════════════════════════
     VUE DÉTAIL SÉRIE
  ════════════════════════ */
  if (selectedSerie) {
    const offre = selectedSerie.offreCommerciale
    const qtyParTitre = offre ? offre.qtyParTitreParPLV * nbPLV : 0
    const totalTitres = offre ? serieBooks.length * qtyParTitre : 0
    const totalPLVPrice = offre ? offre.prixPLV * nbPLV : 0
    // Nb cadeaux = total ouvrages / ratio (ex: 16 livres / 2 = 8 paires de chaussettes)
    const nbCadeaux = offre ? Math.floor(totalTitres / offre.ratioAchat) : 0
    const totalOuvragesHT = offre
      ? serieBooks.reduce((sum, book) => sum + book.priceTTC * qtyParTitre, 0)
      : 0
    const totalOP = totalOuvragesHT + totalPLVPrice

    return (
      <DetailPage>
        <BackButton onClick={handleBack}>
          <IconBack />
          Retour aux sélections
        </BackButton>

        {/* ── Header série ── */}
        <SerieHeader>
          <SerieHeaderCover>
            <SerieCover serie={selectedSerie} width={80} height={120} />
          </SerieHeaderCover>

          <SerieHeaderInfo>
            <SerieHeaderTitle>
              {selectedSerie.nom}
              {selectedSerie.isOffreSpeciale && (
                <Badge $color="#1B5E20" $bg="#E8F5E9"><IconDot /> OP commerciale</Badge>
              )}
              {selectedSerie.isPrixLitteraire && (
                <Badge $color="#4A148C" $bg="#F3E5F5"><IconTrophy size={11} /> Prix littéraire</Badge>
              )}
            </SerieHeaderTitle>
            <SerieHeaderMeta>
              {selectedSerie.auteur} · {selectedSerie.univers} · {serieBooks.length} titre{serieBooks.length > 1 ? 's' : ''}
            </SerieHeaderMeta>
            <SerieHeaderDesc>{selectedSerie.description}</SerieHeaderDesc>

            {/* Bouton "Tout ajouter" seulement pour les séries sans OP */}
            {!offre && (
              <BadgeRow>
                <AddAllButton onClick={handleAddAll}>
                  <IconCart />
                  Tout ajouter au panier
                </AddAllButton>
              </BadgeRow>
            )}
          </SerieHeaderInfo>
        </SerieHeader>

        <Divider />

        {/* ══════════════════════════════
            MODE OP — lot précomposé
        ══════════════════════════════ */}
        {offre ? (
          <>
            {/* PLV visuel + carte info */}
            <PLVSection offre={offre} nom={selectedSerie.nom} />

            <OPOrderSection>

              {/* ── Tableau composition ── */}
              <OPSectionLabel>Composition du lot</OPSectionLabel>
              <OPTable>

                {/* En-têtes */}
                <OPTRow $variant="head">
                  <OPTCover />
                  <OPTText><OPTCell $head>Titre</OPTCell></OPTText>
                  <OPTCell $head>Prix TTC</OPTCell>
                  <OPTCell $head data-col="qty">Qté</OPTCell>
                  <OPTCell $head>Total TTC</OPTCell>
                </OPTRow>

                {/* Lignes ouvrages */}
                {serieBooks.map(book => (
                  <OPTRow key={book.id}>
                    <OPTCover>
                      <BookCover isbn={book.isbn} alt={book.title} width={36} height={50} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                    </OPTCover>
                    <OPTText>
                      <OPTTitle>{book.title}</OPTTitle>
                      <OPTMeta>{book.authors[0]} · {book.format}</OPTMeta>
                    </OPTText>
                    <OPTCell>{formatEur(book.priceTTC)}</OPTCell>
                    <OPTCell data-col="qty">{qtyParTitre}</OPTCell>
                    <OPTCell $bold>{formatEur(book.priceTTC * qtyParTitre)}</OPTCell>
                  </OPTRow>
                ))}

                {/* Ligne cadeau (après les ouvrages) */}
                <OPTRow $variant="cadeau">
                  <OPTCover>
                    <span style={{ fontSize: 26 }}>{offre.cadeauEmoji}</span>
                  </OPTCover>
                  <OPTText>
                    <OPTTitle style={{ color: '#2E7D32' }}>{offre.cadeauLabel}</OPTTitle>
                    <OPTMeta style={{ color: '#4CAF50' }}>Offert au lecteur final</OPTMeta>
                  </OPTText>
                  <OPTCell $color="#2E7D32">0,00 €</OPTCell>
                  <OPTCell data-col="qty" $color="#2E7D32">{nbCadeaux}</OPTCell>
                  <OPTCell $bold $color="#2E7D32">0,00 €</OPTCell>
                </OPTRow>

                {/* Ligne totaux — ouvrages uniquement */}
                <OPTRow $variant="total">
                  <OPTCover />
                  <OPTText>
                    <OPTCell $head style={{ fontSize: 11 }}>TOTAL OUVRAGES</OPTCell>
                  </OPTText>
                  <OPTCell />
                  <OPTCell data-col="qty" $bold>{totalTitres}</OPTCell>
                  <OPTCell $bold>{formatEur(totalOuvragesHT)}</OPTCell>
                </OPTRow>

              </OPTable>

              {/* ── Sélection nombre de PLV — pilote tout ── */}
              <PLVQtyBlock>
                <PLVQtyLeft>
                  <PLVQtyTitle>🪧 Nombre de PLV</PLVQtyTitle>
                  <PLVQtySub>{offre.descPLV} · {formatEur(offre.prixPLV)} / unité</PLVQtySub>
                </PLVQtyLeft>
                <PLVQtyRight>
                  <StepperRow>
                    <StepBtn onClick={() => setNbPLV(p => Math.max(1, p - 1))} aria-label="Diminuer PLV">−</StepBtn>
                    <StepNum
                      type="number" min={1} max={99} value={nbPLV}
                      onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 1) setNbPLV(v) }}
                      aria-label="Nombre de PLV" style={{ width: 44 }}
                    />
                    <StepBtn onClick={() => setNbPLV(p => p + 1)} aria-label="Augmenter PLV">+</StepBtn>
                  </StepperRow>
                  <PLVQtyTotal>{formatEur(totalPLVPrice)}</PLVQtyTotal>
                </PLVQtyRight>
              </PLVQtyBlock>

              {/* ── Bouton commande ── */}
              <OPAddBtn $added={opAdded} onClick={handleAddOP}>
                {opAdded
                  ? <><IconCheck /> OP ajoutée — {totalTitres} titres · {nbCadeaux} cadeaux</>
                  : <><IconCart /> Commander l'OP — {nbPLV} PLV · {formatEur(totalOP)}</>
                }
              </OPAddBtn>

            </OPOrderSection>
          </>
        ) : (

        /* ══════════════════════════════
            MODE STANDARD — steppers individuels
        ══════════════════════════════ */
        <>
          <DetailSearchBar>
            <DetailSearchIcon><IconSearch /></DetailSearchIcon>
            <DetailSearchInput
              type="search"
              placeholder="Rechercher par titre ou ISBN…"
              value={detailSearch}
              onChange={e => setDetailSearch(e.target.value)}
            />
          </DetailSearchBar>

          {detailSearch && (
            <ResultCount>
              {filteredDetailBooks.length} résultat{filteredDetailBooks.length !== 1 ? 's' : ''}
            </ResultCount>
          )}

          {filteredDetailBooks.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <p style={{ margin: 0 }}>Aucun titre ne correspond.</p>
            </EmptyState>
          ) : (
            <BookList>
              {filteredDetailBooks.map(book => {
                const qty = qtys[book.id] ?? 1

                function changeQty(delta: number) {
                  setQtys(prev => ({ ...prev, [book.id]: Math.max(1, (prev[book.id] ?? 1) + delta) }))
                }
                function setQty(val: number) {
                  if (!isNaN(val) && val >= 1) setQtys(prev => ({ ...prev, [book.id]: val }))
                }

                return (
                  <BookRow key={book.id} onClick={() => navigate(`/livre/${book.id}`)}>
                    <BookCover isbn={book.isbn} alt={book.title} width={52} height={72} universe={book.universe} authors={book.authors} publisher={book.publisher} />
                    <BookRowInfo>
                      <BookRowTitle>{book.title}</BookRowTitle>
                      <BookRowMeta>{book.authors.join(', ')}</BookRowMeta>
                      <BookRowMeta>
                        {book.format}{book.pages ? ` · ${book.pages} p.` : ''}{' · '}{book.publicationDate.slice(0, 4)}
                      </BookRowMeta>
                    </BookRowInfo>
                    <BookRowControls onClick={e => e.stopPropagation()}>
                      <PriceStepRow>
                        <PriceBadge>{formatEur(book.priceTTC * qty)}</PriceBadge>
                        <StepperRow>
                          <StepBtn onClick={() => changeQty(-1)} aria-label="Diminuer">−</StepBtn>
                          <StepNum
                            type="number" min={1} max={999} value={qty}
                            onChange={e => setQty(parseInt(e.target.value, 10))}
                            aria-label="Quantité"
                          />
                          <StepBtn onClick={() => changeQty(+1)} aria-label="Augmenter">+</StepBtn>
                        </StepperRow>
                      </PriceStepRow>
                      <AddToCartBtn
                        $added={!!addedMap[book.id]}
                        onClick={e => handleAdd(book.id, qty, e)}
                      >
                        {addedMap[book.id]
                          ? <><IconCheck /> Ajouté ×{qty}</>
                          : <><IconCart /> Ajouter ×{qty}</>
                        }
                      </AddToCartBtn>
                    </BookRowControls>
                  </BookRow>
                )
              })}
            </BookList>
          )}
        </>
        )}
      </DetailPage>
    )
  }

  /* ════════════════════════
     VUE GRILLE GROUPÉE
  ════════════════════════ */
  const FILTERS: Array<{ label: string; value: FilterType; variant?: 'prix' | 'offre' }> = [
    { label: 'Tous', value: 'Tous' },
    ...UNIVERSES.map(u => ({ label: u, value: u as FilterType })),
    { label: 'Prix littéraire', value: 'Prix littéraire', variant: 'prix' as const },
  ]

  return (
    <Page>
      <PageHeader>
        <PageEyebrow>Catalogue</PageEyebrow>
        <PageTitle>Sélections</PageTitle>
        <PageSubtitle>Sélections éditoriales thématiques et opérations commerciales</PageSubtitle>
      </PageHeader>

      {/* Champ de recherche */}
      <SearchBar>
        <SearchIconWrap><IconSearch /></SearchIconWrap>
        <SearchInput
          ref={searchRef}
          type="search"
          placeholder="Rechercher par titre, auteur ou ISBN…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <ClearBtn onClick={() => setSearchQuery('')} aria-label="Effacer">✕</ClearBtn>
        )}
      </SearchBar>

      {/* Filtres */}
      <FilterGroup role="group" aria-label="Filtres">
        <FiltersRow>
          <FilterLabel>Thématique</FilterLabel>
          <FilterBar>
            {FILTERS.map(f => (
              <FilterPill
                key={f.value}
                $active={filter === f.value}
                $variant={f.variant}
                onClick={() => setFilter(f.value)}
              >
                {f.variant === 'prix' && <IconTrophy size={11} />}
                {f.label}
              </FilterPill>
            ))}
          </FilterBar>
        </FiltersRow>

        <FiltersRow>
          <FilterLabel>Offre</FilterLabel>
          <FilterPill
            $active={offreOnly}
            $variant="offre"
            onClick={() => setOffreOnly(v => !v)}
          >
            <GreenDot />
            OP commerciale
          </FilterPill>
        </FiltersRow>
      </FilterGroup>

      {/* Sections */}
      {groupedSections.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
          <p style={{ margin: 0 }}>Aucune série pour cette sélection.</p>
        </EmptyState>
      ) : (
        groupedSections.map(([categorie, series]) => (
          <Section key={categorie}>
            <SectionHeader>
              <SectionTitle>{categorie}</SectionTitle>
              <SectionCount>{series.length} série{series.length > 1 ? 's' : ''}</SectionCount>
            </SectionHeader>
            <HScroll>
              {series.map(serie => (
                <HeroTile
                  key={serie.id}
                  serie={serie}
                  onClick={() => setSelectedSerie(serie)}
                />
              ))}
            </HScroll>
          </Section>
        ))
      )}
    </Page>
  )
}
