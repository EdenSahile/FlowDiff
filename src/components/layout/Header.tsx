import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Wordmark'
import {
  MOCK_BOOKS,
  GENRE_BY_UNIVERSE,
  PRICE_RANGES,
  LANGUAGES,
  searchBooks,
  type Universe,
} from '@/data/mockBooks'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'

const GOLD        = '#C9A84C'
const GOLD_BG     = 'rgba(201,168,76,0.15)'
const GOLD_BORDER = 'rgba(201,168,76,0.4)'

const UNIVERSES: Universe[] = ['Littérature', 'BD/Mangas', 'Jeunesse', 'Adulte-pratique']
const FORMATS = ['Poche', 'Grand format', 'Broché', 'Relié', 'Numérique']

/* ── Header bar ── */
const HeaderBar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  height: ${({ theme }) => theme.layout.headerHeight};
  background-color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid rgba(255,255,255,0.10);
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: 12px;
  z-index: 100;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex-wrap: wrap;
    height: auto;
    padding: 14px ${({ theme }) => theme.spacing.md};
    gap: 8px 0;
    align-items: center;
  }
`

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: ${({ theme }) => theme.layout.sidebarWidth};
    padding-left: 4px;
    flex-shrink: 0;
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 1;
  }
`

const BurgerBtn = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.10);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
  transition: background 0.15s;

  span {
    display: block;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 2px;
  }

  &:hover { background: rgba(255,255,255,0.18); }
  &:active { background: rgba(255,255,255,0.25); }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 2;
    margin-left: auto;
    gap: 8px;
  }

  @media (max-width: 479px) {
    gap: 6px;
  }
`

/* ── Search container (wraps input + filters btn + panel) ── */
const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 3;
    flex: none;
    width: 100%;
    margin-top: 4px;
    justify-content: flex-start;
  }
`

const SearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex: 1;
  }
`

const SearchIconWrap = styled.span`
  position: absolute;
  left: 11px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #555;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    color: rgba(255,255,255,0.7);
    left: 11px;
  }
`

const SearchInput = styled.input`
  width: 380px;
  padding: 9px 14px 9px 34px;
  background: #dcdcdc;
  border: none;
  border-radius: 8px;
  color: #111;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  outline: none;
  transition: width 0.2s ease, background 0.15s ease, box-shadow 0.15s ease;
  appearance: none;

  &::placeholder {
    color: #555;
    font-size: 13px;
  }

  &::-webkit-search-cancel-button { display: none; }

  &:focus {
    width: 480px;
    background: #ebebeb;
    box-shadow: 0 0 0 2px rgba(34,98,65,0.25);
    outline: none;
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    width: 100%;
    background: rgba(255,255,255,0.18);
    color: #fff;
    &::placeholder { color: rgba(255,255,255,0.6); }
    &:focus {
      width: 100%;
      background: rgba(255,255,255,0.24);
      box-shadow: none;
    }
    font-size: 14px;
    padding: 9px 12px 9px 36px;
  }
`

const AdvancedBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  background: ${({ $active }) => $active ? '#1E3A5F' : '#c8c8c8'};
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  color: ${({ $active }) => $active ? '#fff' : '#111'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ $active }) => $active ? '#25477A' : '#b8b8b8'};
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    padding: 0 14px;
    font-size: 13px;
    background: ${({ $active }) => $active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)'};
    color: #fff;
    border-radius: 8px;
    &:hover { background: rgba(255,255,255,0.22); }
  }
`

const AdvBtnLabel = styled.span``

const ActiveBadge = styled.span`
  background: ${GOLD};
  color: #3d2f00;
  font-size: 9px;
  font-weight: 700;
  border-radius: 10px;
  padding: 0 5px;
  line-height: 1.8;
  margin-left: 1px;
`

/* ── Advanced panel ── */
const AdvancedPanel = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.layout.headerHeight};
  right: 0;
  z-index: 200;
  background: #fff;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 40px rgba(28,58,95,0.20), 0 2px 8px rgba(28,58,95,0.08);
  border: 1px solid rgba(28,58,95,0.08);
  width: 480px;
  max-width: 100vw;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    top: ${({ theme }) => theme.layout.mobileHeaderHeight};
    width: 100vw;
    left: 0;
    border-radius: 0 0 16px 16px;
    padding: 0;
    gap: 0;
    max-height: calc(100dvh - ${({ theme }) => theme.layout.mobileHeaderHeight});
    overflow: hidden;
  }
`

const PanelScrollBody = styled.div`
  display: contents;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 16px 8px;
    -webkit-overflow-scrolling: touch;
  }
`

const PanelSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PanelLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#fff'};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all .12s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  }

  &:disabled {
    opacity: 0.32;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.gray[100]};
    border-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const PanelDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[100]};
`

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex-shrink: 0;
    padding: 12px 16px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
    background: #fff;
  }
`

const ResultCount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`

const ResultCountSub = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const ResetLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  transition: color .12s;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const ApplyBtn = styled.button`
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .12s;
  &:hover { background: #25477A; }
`

/* ── Mobile backdrop ── */
const MobileBackdrop = styled.div`
  display: none;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: block;
    position: fixed;
    inset: 0;
    top: ${({ theme }) => theme.layout.mobileHeaderHeight};
    background: rgba(0,0,0,0.45);
    z-index: 99;
  }
`

/* ── Panel mobile header (titre + fermer) ── */
const MobilePanelTop = styled.div`
  display: none;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    flex-shrink: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  }
`

const MobilePanelTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const ClosePanelBtn = styled.button`
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.gray[200]}; }
`

/* ── Notifications ── */
const NotifBtn = styled.button`
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: rgba(255,255,255,0.14); }

  @media (max-width: 479px) {
    width: 28px; height: 28px;
  }
`

const NotifDot = styled.span`
  position: absolute;
  top: 4px; right: 4px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #e24b4a;
  pointer-events: none;
`

/* ── Panier ── */
const CartLabel = styled.span`
  @media (max-width: 479px) {
    display: none;
  }
`

const CartBtn = styled.button<{ $hasItems: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  @media (max-width: 479px) {
    padding: 0 10px;
    min-height: 36px;
    gap: 4px;
  }

  ${({ $hasItems }) => $hasItems ? `
    background: ${GOLD};
    border: 1.5px solid ${GOLD};
    color: #1E3A5F;
    box-shadow: 0 2px 8px rgba(201,168,76,0.35);
    &:hover { background: #d4b05a; border-color: #d4b05a; box-shadow: 0 4px 14px rgba(201,168,76,0.45); }
    &:active { background: #b8962e; border-color: #b8962e; }
  ` : `
    background: transparent;
    border: 1.5px solid rgba(201,168,76,0.5);
    color: ${GOLD};
    &:hover { background: rgba(201,168,76,0.12); border-color: ${GOLD}; }
  `}

  &:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
`

const CartBadge = styled.span`
  background: #1E3A5F;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
`

/* ── Bouton Listes ── */
const ListsBtn = styled.button<{ $hasLists: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.75);

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.4);
    color: #fff;
  }

  ${({ $hasLists }) => $hasLists && `
    border-color: rgba(201,168,76,0.5);
    color: #C9A84C;
    &:hover { border-color: #C9A84C; }
  `}

  @media (max-width: 479px) {
    padding: 0 10px;
    min-height: 36px;
  }
`

const ListsBadge = styled.span`
  background: #C9A84C;
  color: #1E3A5F;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
`

const ListsLabel = styled.span`
  @media (max-width: 479px) {
    display: none;
  }
`

/* ── Panneau Listes ── */
const ListsPanel = styled.div<{ $top: number; $right: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  right: ${({ $right }) => $right}px;
  z-index: 9999;
  background: #fff;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 40px rgba(28,58,95,0.20), 0 2px 8px rgba(28,58,95,0.08);
  border: 1px solid rgba(28,58,95,0.08);
  width: 320px;
  max-width: calc(100vw - 16px);
  padding: 0;
  overflow: hidden;
  overflow: hidden;
`

const ListsPanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(28,58,95,0.08);
`

const ListsPanelTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const ListsPanelClose = styled.button`
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: none; border-radius: 50%;
  cursor: pointer; font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.gray[200]}; }
`

const ListsPanelBody = styled.div`
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 0;
`

const ListsPanelEmpty = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: center;
  padding: 24px 16px;
  font-style: italic;
`

const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid rgba(28,58,95,0.05);

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(28,58,95,0.04); }
`

const ListRowIcon = styled.div`
  width: 34px; height: 34px;
  border-radius: 8px;
  background: rgba(201,168,76,0.12);
  border: 1px solid rgba(201,168,76,0.3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
`

const ListRowInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ListRowName = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListRowCount = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 1px;
`

const ListRowDelete = styled.button`
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  border-radius: 6px;
  flex-shrink: 0;
  font-size: 14px;
  transition: color 0.12s, background 0.12s;

  &:hover {
    color: #e24b4a;
    background: rgba(226,75,74,0.08);
  }
`

/* ── Confirmation suppression liste ── */
const ConfirmOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  padding: 24px;
`

const ConfirmText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  text-align: center;
  margin: 0;
`

const ConfirmSub = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: center;
  margin: -6px 0 0;
`

const ConfirmRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 260px;
`

const ConfirmCancel = styled.button`
  flex: 1;
  padding: 9px;
  border: 1.5px solid rgba(28,58,95,0.18);
  border-radius: 8px;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: rgba(28,58,95,0.05); }
`

const ConfirmDelete = styled.button`
  flex: 1;
  padding: 9px;
  border: none;
  border-radius: 8px;
  background: #e24b4a;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: #c73a39; }
`

/* ── Vue détail d'une liste ── */
const DetailHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(28,58,95,0.08);
`

const BackBtn = styled.button`
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: none; border-radius: 50%;
  cursor: pointer; font-size: 14px;
  color: ${({ theme }) => theme.colors.navy};
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.gray[200]}; }
`

const DetailTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BookRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(28,58,95,0.05);
  cursor: pointer;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(28,58,95,0.04); }
`

const BookRowCover = styled.div`
  width: 32px; height: 44px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.gray[100]};
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
`

const BookRowInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const BookRowTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BookRowAuthor = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`

const BookRowRemove = styled.button`
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  border-radius: 5px;
  flex-shrink: 0;
  font-size: 14px;
  transition: color 0.12s, background 0.12s;

  &:hover {
    color: #e24b4a;
    background: rgba(226,75,74,0.08);
  }
`

const BookRowIsbn = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 1px;
`

const BookRowAddedBy = styled.span`
  display: inline-block;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: #3d2f00;
  background: rgba(201,168,76,0.20);
  border-radius: 10px;
  padding: 1px 7px;
  margin-top: 2px;
`

const PrenomsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(28,58,95,0.06);
  background: ${({ theme }) => theme.colors.gray[50]};
`

const PrenomChip = styled.button<{ $active: boolean }>`
  padding: 3px 10px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#fff'};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  }
`

const BookRowCartBtn = styled.button`
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: ${({ theme }) => theme.colors.navy};
  border: none;
  cursor: pointer;
  color: #fff;
  border-radius: 6px;
  flex-shrink: 0;
  transition: background 0.12s;

  &:hover { background: #25477A; }
`

const DetailFooter = styled.div`
  border-top: 1px solid rgba(28,58,95,0.08);
  padding: 10px 14px;
  background: #fafafa;
`

const AddAllBtn = styled.button`
  width: 100%;
  padding: 9px;
  border: none;
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s;

  &:hover { background: #25477A; }
`

const ExportCsvBtn = styled.button`
  width: 100%;
  margin-top: 7px;
  padding: 8px;
  border: 1.5px solid rgba(28,58,95,0.18);
  border-radius: 7px;
  background: transparent;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s, border-color 0.15s;
  letter-spacing: 0.01em;

  &:hover {
    background: rgba(28,58,95,0.05);
    border-color: rgba(28,58,95,0.35);
  }
`

/* ── Icônes SVG ── */
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconSliders() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconLists() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function IconStarSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill="#C9A84C" stroke="#C9A84C"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}

function IconCartSvg({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
      <circle cx="20" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

/* ── Props ── */
interface HeaderProps {
  cartCount?: number
  onBurgerClick?: () => void
  onCartClick?: () => void
  hasNotif?: boolean
}

export function Header({ cartCount = 0, onBurgerClick, onCartClick, hasNotif = true }: HeaderProps) {
  const navigate = useNavigate()
  const { lists, deleteList, removeFromList } = useWishlist()
  const { addToCart } = useCart()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const exportListCSV = (list: { name: string; items: Array<{ book: { isbn: string; title: string; authors: string[]; priceTTC: number; publicationDate: string }; addedBy?: string }> }) => {
    const header = ['ISBN', 'Titre', 'Auteur', 'Prix TTC', 'Date parution', 'Nom de la liste', 'Ajouté par']
    const rows = list.items.map(({ book, addedBy }) => [
      book.isbn,
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.authors.join(', ').replace(/"/g, '""')}"`,
      book.priceTTC.toFixed(2).replace('.', ','),
      book.publicationDate,
      `"${list.name.replace(/"/g, '""')}"`,
      addedBy ? `"${addedBy.replace(/"/g, '""')}"` : '',
    ])
    const csv = [header.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${list.name.replace(/[^a-z0-9]/gi, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [search, setSearch] = useState('')
  const [showPanel, setShowPanel]           = useState(false)
  const [showListsPanel, setShowListsPanel] = useState(false)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [filterPrenom, setFilterPrenom]     = useState<string | null>(null)
  const listsPanelRef = useRef<HTMLDivElement>(null)
  const [selUniverse, setSelUniverse] = useState<Universe[]>([])
  const [selGenre, setSelGenre]       = useState<string[]>([])
  const [selLangue, setSelLangue]     = useState<string[]>([])
  const [selPrix, setSelPrix]         = useState<string[]>([])
  const [selFormat, setSelFormat]     = useState<string[]>([])

  const containerRef  = useRef<HTMLDivElement>(null)
  const listsBtnRef   = useRef<HTMLButtonElement>(null)
  const [listsPanelPos, setListsPanelPos] = useState({ top: 0, right: 0 })

  /* Fermer panneau listes au clic extérieur */
  useEffect(() => {
    if (!showListsPanel) return
    function handler(e: MouseEvent) {
      if (listsPanelRef.current?.contains(e.target as Node)) return
      if (listsBtnRef.current?.contains(e.target as Node)) return
      setShowListsPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showListsPanel])

  function toggleListsPanel() {
    if (!showListsPanel && listsBtnRef.current) {
      const rect = listsBtnRef.current.getBoundingClientRect()
      setListsPanelPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
      setSelectedListId(null)
      setFilterPrenom(null)
    }
    setShowListsPanel(v => !v)
  }

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  const activeCount = selUniverse.length + selGenre.length + selLangue.length + selPrix.length + selFormat.length

  /* ── Base books (by search query) ── */
  const baseBooks = useMemo(() =>
    search.trim() ? searchBooks(search) : [...MOCK_BOOKS],
    [search]
  )

  /* ── Helper: apply price range filter (multi) ── */
  function applyPrix(books: typeof MOCK_BOOKS, labels: string[]) {
    if (!labels.length) return books
    return books.filter(b => labels.some(label => {
      const r = PRICE_RANGES.find(r => r.label === label)
      return r && b.priceTTC >= r.min && b.priceTTC < r.max
    }))
  }

  /* ── For each group: books filtered by ALL OTHER groups ── */
  const booksForUniverse = useMemo(() => {
    let b = baseBooks
    if (selGenre.length)  b = b.filter(x => x.genre  && selGenre.includes(x.genre))
    if (selLangue.length) b = b.filter(x => x.language && selLangue.includes(x.language))
    b = applyPrix(b, selPrix)
    if (selFormat.length) b = b.filter(x => x.format && selFormat.includes(x.format))
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selGenre, selLangue, selPrix, selFormat])

  const booksForGenre = useMemo(() => {
    let b = baseBooks
    if (selUniverse.length) b = b.filter(x => selUniverse.includes(x.universe))
    if (selLangue.length)   b = b.filter(x => x.language && selLangue.includes(x.language))
    b = applyPrix(b, selPrix)
    if (selFormat.length)   b = b.filter(x => x.format && selFormat.includes(x.format))
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selLangue, selPrix, selFormat])

  const booksForLangue = useMemo(() => {
    let b = baseBooks
    if (selUniverse.length) b = b.filter(x => selUniverse.includes(x.universe))
    if (selGenre.length)    b = b.filter(x => x.genre && selGenre.includes(x.genre))
    b = applyPrix(b, selPrix)
    if (selFormat.length)   b = b.filter(x => x.format && selFormat.includes(x.format))
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selPrix, selFormat])

  const booksForPrix = useMemo(() => {
    let b = baseBooks
    if (selUniverse.length) b = b.filter(x => selUniverse.includes(x.universe))
    if (selGenre.length)    b = b.filter(x => x.genre && selGenre.includes(x.genre))
    if (selLangue.length)   b = b.filter(x => x.language && selLangue.includes(x.language))
    if (selFormat.length)   b = b.filter(x => x.format && selFormat.includes(x.format))
    return b
  }, [baseBooks, selUniverse, selGenre, selLangue, selFormat])

  const booksForFormat = useMemo(() => {
    let b = baseBooks
    if (selUniverse.length) b = b.filter(x => selUniverse.includes(x.universe))
    if (selGenre.length)    b = b.filter(x => x.genre && selGenre.includes(x.genre))
    if (selLangue.length)   b = b.filter(x => x.language && selLangue.includes(x.language))
    b = applyPrix(b, selPrix)
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selLangue, selPrix])

  /* ── Available options per group ── */
  const availableUniverses = useMemo(() => new Set(booksForUniverse.map(b => b.universe)), [booksForUniverse])
  const availableGenres    = useMemo(() => new Set(booksForGenre.map(b => b.genre).filter(Boolean) as string[]), [booksForGenre])
  const availableLangues   = useMemo(() => new Set(booksForLangue.map(b => b.language).filter(Boolean) as string[]), [booksForLangue])
  const availablePrix      = useMemo(() => {
    const s = new Set<string>()
    PRICE_RANGES.forEach(r => {
      if (booksForPrix.some(b => b.priceTTC >= r.min && b.priceTTC < r.max)) s.add(r.label)
    })
    return s
  }, [booksForPrix])
  const availableFormats   = useMemo(() => new Set(booksForFormat.map(b => b.format).filter(Boolean) as string[]), [booksForFormat])

  /* ── Auto-clear selections that become unavailable ── */
  useEffect(() => {
    setSelGenre(prev => prev.filter(g => availableGenres.has(g)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableGenres])
  useEffect(() => {
    setSelLangue(prev => prev.filter(l => availableLangues.has(l)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLangues])
  useEffect(() => {
    setSelPrix(prev => prev.filter(p => availablePrix.has(p)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePrix])
  useEffect(() => {
    setSelFormat(prev => prev.filter(f => availableFormats.has(f)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFormats])

  /* ── Filtered count (all filters applied) ── */
  const filteredCount = useMemo(() => {
    let b = baseBooks
    if (selUniverse.length) b = b.filter(x => selUniverse.includes(x.universe))
    if (selGenre.length)    b = b.filter(x => x.genre && selGenre.includes(x.genre))
    if (selLangue.length)   b = b.filter(x => x.language && selLangue.includes(x.language))
    b = applyPrix(b, selPrix)
    if (selFormat.length)   b = b.filter(x => x.format && selFormat.includes(x.format))
    return b.length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selLangue, selPrix, selFormat])

  /* close panel on outside click */
  useEffect(() => {
    if (!showPanel) return
    function handler(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return
      setShowPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPanel])

  function handleReset() {
    setSelUniverse([])
    setSelGenre([])
    setSelLangue([])
    setSelPrix([])
    setSelFormat([])
  }

  function buildParams(q: string) {
    const params = new URLSearchParams()
    if (q.trim())           params.set('q',       q.trim())
    if (selUniverse.length) params.set('universe', selUniverse.join(','))
    if (selGenre.length)    params.set('genres',   selGenre.join(','))
    if (selLangue.length)   params.set('langues',  selLangue.join(','))
    if (selPrix.length)     params.set('prix',     selPrix.join(','))
    if (selFormat.length)   params.set('formats',  selFormat.join(','))
    return params.toString()
  }

  function handleApply() {
    navigate(`/recherche?${buildParams(search)}`)
    setShowPanel(false)
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && (search.trim() || activeCount > 0)) {
      navigate(`/recherche?${buildParams(search)}`)
      setSearch('')
    }
  }

  return (
    <>
      {showPanel && <MobileBackdrop onClick={() => setShowPanel(false)} aria-hidden="true" />}

      <HeaderBar>
        <LogoWrap>
          <BurgerBtn onClick={onBurgerClick} aria-label="Ouvrir le menu">
            <span /><span /><span />
          </BurgerBtn>
          <Wordmark onDark size="sm" />
        </LogoWrap>

        <SearchContainer ref={containerRef}>
          <SearchWrap>
            <SearchIconWrap><IconSearch /></SearchIconWrap>
            <SearchInput
              id="header-search-input"
              type="search"
              placeholder="Titre, auteur, ISBN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
              aria-label="Recherche globale"
            />
          </SearchWrap>

          <AdvancedBtn
            $active={showPanel || activeCount > 0}
            onClick={() => setShowPanel(v => !v)}
            aria-label="Filtres avancés"
            aria-expanded={showPanel}
          >
            <IconSliders />
            <AdvBtnLabel>Filtres</AdvBtnLabel>
            {activeCount > 0 && <ActiveBadge>{activeCount}</ActiveBadge>}
          </AdvancedBtn>

          {showPanel && (
            <AdvancedPanel role="dialog" aria-label="Filtres de recherche avancée">

              <MobilePanelTop>
                <MobilePanelTitle>Filtres</MobilePanelTitle>
                <ClosePanelBtn onClick={() => setShowPanel(false)} aria-label="Fermer les filtres">✕</ClosePanelBtn>
              </MobilePanelTop>

              <PanelScrollBody>
                <PanelSection>
                  <PanelLabel>Thématique</PanelLabel>
                  <ChipGroup>
                    {UNIVERSES.map(u => (
                      <Chip
                        key={u}
                        $active={selUniverse.includes(u)}
                        disabled={!availableUniverses.has(u)}
                        onClick={() => {
                          const next = toggle(selUniverse, u)
                          setSelUniverse(next)
                          if (!next.includes(u)) setSelGenre(prev => prev.filter(g => next.flatMap(nu => GENRE_BY_UNIVERSE[nu]).includes(g)))
                        }}
                      >
                        {u}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                {selUniverse.length > 0 && (
                  <PanelSection>
                    <PanelLabel>Genre</PanelLabel>
                    <ChipGroup>
                      {[...new Set(selUniverse.flatMap(u => GENRE_BY_UNIVERSE[u]))].map(g => (
                        <Chip
                          key={g}
                          $active={selGenre.includes(g)}
                          disabled={!availableGenres.has(g)}
                          onClick={() => setSelGenre(toggle(selGenre, g))}
                        >
                          {g}
                        </Chip>
                      ))}
                    </ChipGroup>
                  </PanelSection>
                )}

                <PanelDivider />

                <PanelSection>
                  <PanelLabel>Langue</PanelLabel>
                  <ChipGroup>
                    {LANGUAGES.map(l => (
                      <Chip
                        key={l}
                        $active={selLangue.includes(l)}
                        disabled={!availableLangues.has(l)}
                        onClick={() => setSelLangue(toggle(selLangue, l))}
                      >
                        {l}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelSection>
                  <PanelLabel>Prix</PanelLabel>
                  <ChipGroup>
                    {PRICE_RANGES.map(r => (
                      <Chip
                        key={r.label}
                        $active={selPrix.includes(r.label)}
                        disabled={!availablePrix.has(r.label)}
                        onClick={() => setSelPrix(toggle(selPrix, r.label))}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelSection>
                  <PanelLabel>Format</PanelLabel>
                  <ChipGroup>
                    {FORMATS.map(f => (
                      <Chip
                        key={f}
                        $active={selFormat.includes(f)}
                        disabled={!availableFormats.has(f)}
                        onClick={() => setSelFormat(toggle(selFormat, f))}
                      >
                        {f}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelDivider />
              </PanelScrollBody>

              <PanelFooter>
                <ResetLink onClick={handleReset}>Réinitialiser les filtres</ResetLink>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ResultCount>
                    {filteredCount}{' '}
                    <ResultCountSub>ouvrage{filteredCount !== 1 ? 's' : ''}</ResultCountSub>
                  </ResultCount>
                  <ApplyBtn onClick={handleApply}>Voir les résultats</ApplyBtn>
                </div>
              </PanelFooter>

            </AdvancedPanel>
          )}
        </SearchContainer>

        <RightSection>
          <NotifBtn aria-label="Notifications">
            <IconBell />
            {hasNotif && <NotifDot />}
          </NotifBtn>

          {/* ─ Bouton Listes ─ */}
          <ListsBtn
            ref={listsBtnRef}
            $hasLists={lists.length > 0}
            onClick={toggleListsPanel}
            aria-label={`Mes listes — ${lists.length} liste${lists.length !== 1 ? 's' : ''}`}
          >
            <IconLists />
            <ListsLabel>Listes</ListsLabel>
            {lists.length > 0 && (
              <ListsBadge>{lists.length}</ListsBadge>
            )}
          </ListsBtn>

          <CartBtn
            $hasItems={cartCount > 0}
            onClick={onCartClick}
            aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
          >
            <IconCartSvg filled={cartCount > 0} />
            <CartLabel>Panier</CartLabel>
            {cartCount > 0 && (
              <CartBadge>{cartCount > 99 ? '99+' : cartCount}</CartBadge>
            )}
          </CartBtn>
        </RightSection>
      </HeaderBar>

      {showListsPanel && createPortal(
        <ListsPanel
          ref={listsPanelRef}
          $top={listsPanelPos.top}
          $right={listsPanelPos.right}
          role="dialog"
          aria-label="Mes listes de commandes"
        >
          {confirmDeleteId && (() => {
            const target = lists.find(l => l.id === confirmDeleteId)
            return (
              <ConfirmOverlay>
                <ConfirmText>Supprimer la liste&nbsp;?</ConfirmText>
                <ConfirmSub>« {target?.name} » et ses {target?.items.length ?? 0} titre{(target?.items.length ?? 0) !== 1 ? 's' : ''} seront supprimés.</ConfirmSub>
                <ConfirmRow>
                  <ConfirmCancel onClick={() => setConfirmDeleteId(null)}>Annuler</ConfirmCancel>
                  <ConfirmDelete onClick={() => { deleteList(confirmDeleteId); setConfirmDeleteId(null) }}>Supprimer</ConfirmDelete>
                </ConfirmRow>
              </ConfirmOverlay>
            )
          })()}
          {selectedListId ? (() => {
            const list = lists.find(l => l.id === selectedListId)
            if (!list) { setSelectedListId(null); return null }
            const prenoms = [...new Set(list.items.map(i => i.addedBy).filter(Boolean) as string[])]
            const visibleItems = filterPrenom
              ? list.items.filter(i => i.addedBy === filterPrenom)
              : list.items
            return (
              <>
                <DetailHead>
                  <BackBtn onClick={() => { setSelectedListId(null); setFilterPrenom(null) }} aria-label="Retour">←</BackBtn>
                  <DetailTitle>{list.name}</DetailTitle>
                  <ListsPanelClose onClick={() => { setShowListsPanel(false); setSelectedListId(null); setFilterPrenom(null) }} aria-label="Fermer">✕</ListsPanelClose>
                </DetailHead>
                {prenoms.length >= 2 && (
                  <PrenomsBar>
                    <PrenomChip $active={filterPrenom === null} onClick={() => setFilterPrenom(null)}>
                      Tous
                    </PrenomChip>
                    {prenoms.map(p => (
                      <PrenomChip
                        key={p}
                        $active={filterPrenom === p}
                        onClick={() => setFilterPrenom(prev => prev === p ? null : p)}
                      >
                        {p}
                      </PrenomChip>
                    ))}
                  </PrenomsBar>
                )}
                <ListsPanelBody>
                  {visibleItems.length === 0 ? (
                    <ListsPanelEmpty>Aucun titre ajouté par {filterPrenom}.</ListsPanelEmpty>
                  ) : (
                    visibleItems.map(({ book, addedBy }) => (
                      <BookRow key={book.id} onClick={() => { navigate(`/livre/${book.id}`); setShowListsPanel(false); setSelectedListId(null) }}>
                        <BookRowCover>
                          <span style={{ fontSize: 20 }}>📖</span>
                        </BookRowCover>
                        <BookRowInfo>
                          <BookRowTitle>{book.title}</BookRowTitle>
                          <BookRowAuthor>{book.authors.join(', ')}</BookRowAuthor>
                          <BookRowIsbn>{book.isbn}</BookRowIsbn>
                          {addedBy && <BookRowAddedBy>{addedBy}</BookRowAddedBy>}
                        </BookRowInfo>
                        {book.type !== 'a-paraitre' && (
                          <BookRowCartBtn
                            onClick={e => { e.stopPropagation(); addToCart(book, 1) }}
                            aria-label={`Ajouter ${book.title} au panier`}
                            title="Ajouter au panier"
                          >
                            <IconCartSvg filled={false} />
                          </BookRowCartBtn>
                        )}
                        <BookRowRemove
                          onClick={e => { e.stopPropagation(); removeFromList(list.id, book.id) }}
                          aria-label={`Retirer ${book.title}`}
                          title="Retirer de la liste"
                        >
                          <IconTrash />
                        </BookRowRemove>
                      </BookRow>
                    ))
                  )}
                </ListsPanelBody>
                <DetailFooter>
                  {list.items.some(i => i.book.type !== 'a-paraitre') && (
                    <AddAllBtn
                      onClick={() => {
                        list.items
                          .filter(i => i.book.type !== 'a-paraitre')
                          .forEach(i => addToCart(i.book, 1))
                      }}
                    >
                      <IconCartSvg filled={false} />
                      Tout ajouter au panier
                    </AddAllBtn>
                  )}
                  <ExportCsvBtn
                    onClick={() => exportListCSV(list)}
                    aria-label={`Exporter la liste "${list.name}" en CSV`}
                    title="Exporter en CSV"
                  >
                    ↓ Exporter la liste (.csv)
                  </ExportCsvBtn>
                </DetailFooter>
              </>
            )
          })() : (
            <>
              <ListsPanelHead>
                <ListsPanelTitle>Mes listes ({lists.length})</ListsPanelTitle>
                <ListsPanelClose onClick={() => setShowListsPanel(false)} aria-label="Fermer">✕</ListsPanelClose>
              </ListsPanelHead>
              <ListsPanelBody>
                {lists.length === 0 ? (
                  <ListsPanelEmpty>Aucune liste créée.<br />Cliquez sur ★ sur un livre pour commencer.</ListsPanelEmpty>
                ) : (
                  lists.map(list => (
                    <ListRow key={list.id} onClick={() => setSelectedListId(list.id)}>
                      <ListRowIcon><IconStarSmall /></ListRowIcon>
                      <ListRowInfo>
                        <ListRowName>{list.name}</ListRowName>
                        <ListRowCount>{list.items.length} titre{list.items.length !== 1 ? 's' : ''}</ListRowCount>
                      </ListRowInfo>
                      <ListRowDelete
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(list.id) }}
                        aria-label={`Supprimer la liste ${list.name}`}
                        title="Supprimer cette liste"
                      >
                        <IconTrash />
                      </ListRowDelete>
                    </ListRow>
                  ))
                )}
              </ListsPanelBody>
            </>
          )}
        </ListsPanel>,
        document.body
      )}
    </>
  )
}
