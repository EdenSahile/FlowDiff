import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { BookCover } from './BookCover'
import { useCart, REMISE_RATES } from '@/contexts/CartContext'
import { useToast, type ToastAction } from '@/contexts/ToastContext'
import { useAuth } from '@/hooks/useAuth'
import { useWishlist } from '@/contexts/WishlistContext'
import { ListPickerPopover } from './ListPickerPopover'
import { StockStatus } from '@/components/ui/StockStatus'
import { StockAlertModal } from '@/components/ui/StockAlertModal'
import { theme } from '@/lib/theme'
import { useRdv } from '@/contexts/RdvContext'
import { RdvPopup } from '@/components/catalogue/RdvPopup'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Littérature':     { bg: '#E8EDF3', text: '#1C3252' },
  'BD/Mangas':       { bg: '#FDEBD0', text: '#C04A00' },
  'Jeunesse':        { bg: '#F5E8F8', text: '#7B2D8B' },
  'Adulte-pratique': { bg: '#E6F4EC', text: '#1E7045' },
  'Autres':          { bg: '#F1EFE8', text: '#5F5E5A' },
}

/* ══════════════════════════════════════
   ENVELOPPE CARD
══════════════════════════════════════ */
const Card = styled.article`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  will-change: transform;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.colors.gray[400]};
  }
  &:active { transform: translateY(-1px); }
`

/* ══════════════════════════════════════
   HEADER — titre · auteur · badges
══════════════════════════════════════ */
const CardHeader = styled.div`
  padding: 10px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`

const UniverseBadge = styled.span<{ $bg: string; $color: string }>`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
`

const NouveauteBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.accent};
  color: #3d2f00;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
`

const AParaitreBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: #E65100;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
`

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`

const Publisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/* ══════════════════════════════════════
   BODY — couverture
══════════════════════════════════════ */
const CardBody = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 12px;
  background: linear-gradient(180deg, #F7F5F1 0%, #FAFAF8 100%);
  flex: 1;
`

const StarWrap = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
`

const StarBtn = styled.button<{ $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => $active ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.88)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(28,58,95,0.12);
  transition: background 0.15s, transform 0.12s;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(201,168,76,0.30)' : 'rgba(255,255,255,1)'};
    transform: scale(1.1);
  }
  &:active { transform: scale(0.93); }
`

/* ══════════════════════════════════════
   FOOTER — prix · quantité · panier
══════════════════════════════════════ */
const CardFooter = styled.div`
  padding: 10px 12px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.white};
`

const StockLine = styled.div`
  display: flex;
  align-items: center;
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const Price = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.02em;
  line-height: 1.1;
`

const PriceLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const PriceNet = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`

const PriceNetLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-left: 4px;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 2px 4px;
`

const QtyBtn = styled.button`
  width: 36px; height: 36px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .12s;

  &:hover    { opacity: 0.7; }
  &:disabled { opacity: .3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  width: 20px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
`

const AjouterBtn = styled.button<{ $epuise?: boolean; $added?: boolean }>`
  width: 100%;
  padding: 12px 8px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $epuise, $added, theme }) =>
    $epuise ? theme.colors.gray[200]
    : $added  ? theme.colors.success
    : theme.colors.navy};
  color: ${({ $epuise, theme }) => $epuise ? theme.colors.gray[400] : '#fdfdfd'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: ${({ $epuise }) => $epuise ? 'not-allowed' : 'pointer'};
  transition: background .15s, transform .1s;
  white-space: nowrap;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${({ $epuise, $added, theme }) =>
      $epuise ? theme.colors.gray[200]
      : $added  ? theme.colors.success
      : theme.colors.primaryHover};
  }
  &:active { transform: ${({ $epuise }) => $epuise ? 'none' : 'scale(0.97)'}; }
`

const EpuiseNote = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-style: italic;
  text-align: center;
`

const NotesNote = styled.p`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-style: italic;
  text-align: center;
  margin: 0;
  line-height: 1.3;
`

const AParaitreFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const RdvBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: #7a5c00;
`

const RdvBtn = styled.button`
  width: 100%;
  padding: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: background .15s, color .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.02em;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: #3d2f00;
  }
  &:active { transform: scale(0.97); }
`

/* ══════════════════════════════════════
   COVER-FIRST LAYOUT
══════════════════════════════════════ */
const CoverZone = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  flex-shrink: 0;
`

const Book3D = styled.div`
  display: inline-block;
  transform: perspective(1200px) rotateY(-10deg) rotateX(2deg);
  filter: drop-shadow(8px 12px 20px rgba(0, 0, 0, 0.22));
  transition: transform 0.22s ease, filter 0.22s ease;
  border-radius: 2px;

  ${Card}:hover & {
    transform: perspective(1200px) rotateY(-6deg) rotateX(1deg) translateY(-3px);
    filter: drop-shadow(10px 16px 26px rgba(0, 0, 0, 0.28));
  }
`

const StarCorner = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
`

const TopVenteBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  z-index: 2;
  box-shadow: 0 1px 6px rgba(0,0,0,0.18);
`

const CFInfoSection = styled.div`
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
`

const CFBadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 7px;
`

const SelectionChip = styled.span`
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.accentLight};
  color: #7a5c00;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
`

const CF2Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 3px;
`

const CF2Authors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 1px;
`

const CF2Publisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`

const IsbnText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 3px 0 0;
  letter-spacing: 0.01em;
`


const CFPrice = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.03em;
  line-height: 1;

  sup {
    font-size: 11px;
    font-weight: 600;
    vertical-align: super;
    letter-spacing: 0;
    opacity: 0.75;
  }
`

const CFQtyInput = styled.input`
  width: 32px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  background: none;
  border: none;
  outline: none;
  padding: 0;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; }
`

const CFPriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
`

const CFStockRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6px;
`

const CFActionRow = styled.div`
  margin-top: 10px;
`

/* ── Icônes ── */
function IconCart() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill={filled ? theme.colors.accent : 'none'}
      stroke={filled ? theme.colors.accent : theme.colors.navy}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

interface Props {
  book: Book
  showType?: boolean
  coverFirst?: boolean
}

export function BookCard({ book, showType = false, coverFirst = false }: Props) {
  const navigate      = useNavigate()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { user }      = useAuth()
  const { isInAnyList, getListsContaining, removeFromList } = useWishlist()
  const { isInRdv, getQty } = useRdv()

  const userRate: number = user?.remisesParUnivers?.[book.universe] != null
    ? user.remisesParUnivers[book.universe] / 100
    : (REMISE_RATES[book.universe as keyof typeof REMISE_RATES] ?? 0)
  const priceNet = userRate > 0 ? (book.priceTTC * (1 - userRate)).toFixed(2) : null
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [rdvAnchor, setRdvAnchor] = useState<DOMRect | null>(null)
  const starRef = useRef<HTMLDivElement>(null)
  const rdvBtnRef = useRef<HTMLButtonElement>(null)

  const isAParaitre  = book.type === 'a-paraitre'
  const isEpuise     = book.statut === 'epuise' || book.statut === 'rupture'
  const needsConfirm = book.statut === 'sur_commande' || book.statut === 'en_reimp'
  const isOrderable  = !isEpuise
  const catColors    = CATEGORY_COLORS[book.universe] ?? CATEGORY_COLORS['Autres']
  const inList       = isInAnyList(book.id)

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inList) {
      getListsContaining(book.id).forEach(list => removeFromList(list.id, book.id))
    } else if (starRef.current) {
      setPopoverAnchor(starRef.current.getBoundingClientRect())
    }
  }

  const confirmAdd = (enReliquat: boolean) => {
    addToCart(book, qty, { enReliquat })
    const action: ToastAction = { label: 'Voir le panier →', onClick: () => navigate('/panier') }
    showToast(`"${book.title}" ajouté au panier`, 'success', action)
    setQty(1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEpuise) return
    if (needsConfirm) { setAlertOpen(true); return }
    confirmAdd(false)
  }

  const handleQty = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    setQty(q => Math.max(1, q + delta))
  }

  const handleCardClick = () => {
    if (window.getSelection()?.toString()) return
    navigate(`/livre/${book.id}`)
  }

  const pubYear = book.publicationDate ? new Date(book.publicationDate).getFullYear() : null
  if (coverFirst) {
    const isIndispo = isEpuise
    return (
      <>
        <Card
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/livre/${book.id}`)}
        >
          {/* ── Couverture centrée sur fond neutre ── */}
          <CoverZone>
            <Book3D>
              <BookCover
                isbn={book.isbn}
                alt={book.title}
                universe={book.universe}
                authors={book.authors}
                publisher={book.publisher}
                collection={book.collection}
                width={108}
                height={158}
              />
            </Book3D>
            {book.topVente && <TopVenteBadge>Top vente</TopVenteBadge>}
            <StarCorner ref={starRef}>
              <StarBtn
                $active={inList}
                onClick={handleStarClick}
                aria-label="Ajouter à une liste"
                title="Ajouter à une liste"
              >
                <IconStar filled={inList} />
              </StarBtn>
            </StarCorner>
          </CoverZone>

          {/* ── Infos + zone commerciale ── */}
          <CFInfoSection>
            <CFBadgeGroup>
              <UniverseBadge $bg={catColors.bg} $color={catColors.text}>
                {book.universe}
              </UniverseBadge>
              {book.selection && <SelectionChip>Sélection</SelectionChip>}
            </CFBadgeGroup>
            <CF2Title>{book.title}</CF2Title>
            <CF2Authors>{book.authors.join(', ')}</CF2Authors>
            {(book.publisher || pubYear) && (
              <CF2Publisher>
                {book.publisher}{pubYear ? ` · ${pubYear}` : ''}
              </CF2Publisher>
            )}
            {book.isbn && <IsbnText>{book.isbn}</IsbnText>}

            <CFPriceRow>
              <CFPrice>
                {book.priceTTC.toFixed(2).replace('.', ',')} €<sup>TTC</sup>
              </CFPrice>
              {!isIndispo && (
                <QtyControl onClick={e => e.stopPropagation()}>
                  <QtyBtn
                    onClick={e => handleQty(e, -1)}
                    disabled={qty <= 1}
                    aria-label="Diminuer la quantité"
                  >−</QtyBtn>
                  <CFQtyInput
                    type="number"
                    min={1}
                    value={qty}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10)
                      if (!isNaN(v) && v >= 1) setQty(v)
                    }}
                    onBlur={e => {
                      const v = parseInt(e.target.value, 10)
                      setQty(isNaN(v) || v < 1 ? 1 : v)
                    }}
                    aria-label="Quantité"
                  />
                  <QtyBtn
                    onClick={e => handleQty(e, +1)}
                    aria-label="Augmenter la quantité"
                  >+</QtyBtn>
                </QtyControl>
              )}
            </CFPriceRow>

            {book.statut && (
              <CFStockRow>
                <StockStatus statut={book.statut} delaiReimp={book.delaiReimp} />
              </CFStockRow>
            )}

            <CFActionRow>
              {isIndispo ? (
                <AjouterBtn $epuise disabled aria-disabled="true" onClick={e => e.stopPropagation()}>
                  Indisponible
                </AjouterBtn>
              ) : (
                <AjouterBtn onClick={handleAdd} $added={added} aria-label="Ajouter au panier">
                  {added ? <><IconCheck /> Ajouté au panier</> : <><IconCart /> Ajouter au panier</>}
                </AjouterBtn>
              )}
            </CFActionRow>
          </CFInfoSection>
        </Card>

        {popoverAnchor && (
          <ListPickerPopover
            book={book}
            anchorRect={popoverAnchor}
            onClose={() => setPopoverAnchor(null)}
          />
        )}

        {needsConfirm && book.statut && (
          <StockAlertModal
            open={alertOpen}
            statut={book.statut}
            onConfirm={() => { setAlertOpen(false); confirmAdd(book.statut === 'en_reimp') }}
            onCancel={() => setAlertOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Card
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/livre/${book.id}`)}
      >
        {/* ── Header : contexte textuel ── */}
        <CardHeader>
          <BadgeRow>
            <UniverseBadge $bg={catColors.bg} $color={catColors.text}>
              {book.universe}
            </UniverseBadge>
            {showType && book.type === 'nouveaute' && (
              <NouveauteBadge>Nouveauté</NouveauteBadge>
            )}
            {book.type === 'a-paraitre' && (
              <AParaitreBadge>À paraître</AParaitreBadge>
            )}
          </BadgeRow>
          <Title>{book.title}</Title>
          <Authors>{book.authors.join(', ')}</Authors>
          {(book.publisher || book.collection) && (
            <Publisher>
              {book.publisher}{book.collection ? ` · ${book.collection}` : ''}
            </Publisher>
          )}
          {book.isbn && <IsbnText>{book.isbn}</IsbnText>}
        </CardHeader>

        {/* ── Body : visuel ── */}
        <CardBody>
          <BookCover
            isbn={book.isbn}
            alt={book.title}
            width={96}
            height={138}
            universe={book.universe}
            authors={book.authors}
            publisher={book.publisher}
            collection={book.collection}
          />
          <StarWrap ref={starRef}>
            <StarBtn
              $active={inList}
              onClick={handleStarClick}
              aria-label="Ajouter à une liste"
              title="Ajouter à une liste"
            >
              <IconStar filled={inList} />
            </StarBtn>
          </StarWrap>
        </CardBody>

        {/* ── Footer : prix · quantité · actions ── */}
        <CardFooter>
          {book.statut && !isAParaitre && (
            <StockLine>
              <StockStatus statut={book.statut} delaiReimp={book.delaiReimp} />
            </StockLine>
          )}

          {isAParaitre ? (
            <AParaitreFooter>
              <PriceRow>
                <PriceInfo>
                  <Price>{book.priceTTC.toFixed(2)} €</Price>
                  <PriceLabel>Prix public TTC</PriceLabel>
                  {priceNet && (
                    <PriceNet>{priceNet} €<PriceNetLabel>Net remisé</PriceNetLabel></PriceNet>
                  )}
                </PriceInfo>
                <QtyControl>
                  <QtyBtn
                    onClick={e => handleQty(e, -1)}
                    disabled={qty <= 1}
                    aria-label="Diminuer la quantité"
                  >−</QtyBtn>
                  <QtyValue>{qty}</QtyValue>
                  <QtyBtn
                    onClick={e => handleQty(e, +1)}
                    aria-label="Augmenter la quantité"
                  >+</QtyBtn>
                </QtyControl>
              </PriceRow>
              <AjouterBtn onClick={handleAdd} $added={added} aria-label="Ajouter au panier">
                {added ? <><IconCheck /> Ajouté</> : <><IconCart /> Ajouter au panier</>}
              </AjouterBtn>
              <NotesNote>Le titre sera enregistré en notés</NotesNote>
            </AParaitreFooter>
          ) : (
            <>
              <PriceRow>
                <PriceInfo>
                  <Price>{book.priceTTC.toFixed(2)} €</Price>
                  <PriceLabel>Prix public TTC</PriceLabel>
                  {priceNet && (
                    <PriceNet>{priceNet} €<PriceNetLabel>Net remisé</PriceNetLabel></PriceNet>
                  )}
                </PriceInfo>
                {isOrderable && (
                  <QtyControl>
                    <QtyBtn
                      onClick={e => handleQty(e, -1)}
                      disabled={qty <= 1}
                      aria-label="Diminuer la quantité"
                    >−</QtyBtn>
                    <QtyValue>{qty}</QtyValue>
                    <QtyBtn
                      onClick={e => handleQty(e, +1)}
                      aria-label="Augmenter la quantité"
                    >+</QtyBtn>
                  </QtyControl>
                )}
              </PriceRow>

              {isEpuise ? (
                <>
                  <AjouterBtn $epuise disabled aria-disabled="true" onClick={e => e.stopPropagation()}>
                    <IconCart /> {book.statut === 'rupture' ? 'Rupture' : 'Épuisé'}
                  </AjouterBtn>
                  <EpuiseNote>{book.statut === 'rupture' ? 'Temporairement indisponible' : 'Cet ouvrage n\'est plus disponible'}</EpuiseNote>
                </>
              ) : (
                <AjouterBtn onClick={handleAdd} $added={added} aria-label="Ajouter au panier">
                  {added ? <><IconCheck /> Ajouté</> : <><IconCart /> Ajouter au panier</>}
                </AjouterBtn>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {popoverAnchor && (
        <ListPickerPopover
          book={book}
          anchorRect={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
        />
      )}

      {needsConfirm && book.statut && (
        <StockAlertModal
          open={alertOpen}
          statut={book.statut}
          onConfirm={() => { setAlertOpen(false); confirmAdd(book.statut === 'en_reimp') }}
          onCancel={() => setAlertOpen(false)}
        />
      )}

      {rdvAnchor && (
        <RdvPopup
          book={book}
          anchorRect={rdvAnchor}
          onClose={() => setRdvAnchor(null)}
        />
      )}
    </>
  )
}
