# FicheProduitPage — Conformité maquette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorer `FicheProduitPage.tsx` pour correspondre exactement à la maquette `fiche-livre.html` : layout 2 colonnes sticky, meta-box gauche, zone prix intégrée droite, breadcrumb, synopsis direct, infos livraison, cards similaires améliorées.

**Architecture:** Refactor complet d'un seul fichier — `FicheProduitPage.tsx`. Toute la logique métier (panier, modales, wishlist, RDV) est conservée. Seuls les styled-components et le JSX sont restructurés pour coller à la maquette.

**Tech Stack:** React 18, styled-components v6, React Router v6, TypeScript strict

---

## Fichiers touchés

- **Modify:** `src/pages/catalogue/FicheProduitPage.tsx` — refactor complet des styled-components et du JSX

---

## Task 1 : Remplacement des styled-components

**Files:**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

- [ ] **Step 1 : Vérifier que les tests passent avant de commencer**

```bash
cd /Users/macbookeden/Desktop/AppBook
npm run test -- --run 2>&1 | tail -20
```
Expected: toutes les suites passent (161 tests).

- [ ] **Step 2 : Remplacer le bloc de styled-components**

Garder ces éléments existants (modales, animations, Page, BackButton, NotFoundBox, SectionEyebrow, OrderInfoBlock, SimilarSection, SimilarGrid, SimilarCard, SimilarCover, SimilarTitle, SimilarAuthor, plus tout le bloc modal PDF/vidéo).

Supprimer : `Wrap`, `Body`, `CoverCol`, `CoverShadow`, `SecondaryActions`, `SecBtn`, `InfoCol`, `InfoTop`, `BadgeRow`, `UniverseBadge`, `TypeBadge`, `BookTitle`, `BookAuthors`, `MetaGrid`, `MetaDt`, `MetaDd`, `Divider`, `FormatSection`, `SectionLabel`, `FormatPills`, `FormatPill`, `PillLabel`, `PillDesc`, `PillPrice`, `ContentSection`, `AccordionItem`, `AccordionToggle`, `AccordionChevron`, `AccordionBody`, `Description`, `Footer`, `PriceBlock`, `PriceTTC`, `PriceCaption`, `OrderRow`, `QtyControl`, `QtyBtn`, `QtyValue`, `AddBtn`, `ParaitreFooter`, `ParaitreNotice`, `ContactRepBtn`, `PriceCard`.

Ajouter ces nouveaux styled-components après `NotFoundBox` et avant les modales :

```tsx
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
  grid-template-columns: 240px 1fr;
  gap: 28px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

/* ── Colonne gauche sticky ── */
const CoverColNew = styled.div`
  position: sticky;
  top: 94px;
`

const CoverFrame = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(42,42,40,.15), 0 2px 8px rgba(42,42,40,.08);
  position: relative;
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
`

const MetaRowItem = styled.div`
  display: flex;
  align-items: baseline;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(42,42,40,.06);
  gap: 8px;
  &:last-child { border-bottom: none; }
`

const MetaLabelEl = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: .07em;
  width: 74px;
  flex-shrink: 0;
`

const MetaValueEl = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
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
  box-shadow: ${({ $active }) => $active ? `0 0 0 1px #2D3A4A` : 'none'};
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
    $statut === 'dispo'         ? 'rgba(46,125,50,.08)' :
    $statut === 'sur_commande'  ? 'rgba(91,122,158,.1)' :
    $statut === 'en_reimp'      ? 'rgba(160,112,64,.1)' : 'rgba(46,125,50,.08)'};
  color: ${({ $statut }) =>
    $statut === 'dispo'         ? '#2E7D32' :
    $statut === 'sur_commande'  ? '#5B7A9E' :
    $statut === 'en_reimp'      ? '#A07040' : '#2E7D32'};
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
  flex: 1;
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

/* ── Similar books (mise à jour) ── */
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
```

- [ ] **Step 3 : Ajouter la map de styles d'univers**

Remplacer le `UNIVERSE_COLOR` existant par :

```tsx
const UNIVERSE_STYLES: Record<string, { bg: string; color: string }> = {
  'Littérature':     { bg: '#E8EDF3', color: '#1C3252' },
  'BD/Mangas':       { bg: '#FDEBD0', color: '#C04A00' },
  'Jeunesse':        { bg: '#F5E8F8', color: '#7B2D8B' },
  'Adulte-pratique': { bg: '#E6F4EC', color: '#1E7045' },
}
```

- [ ] **Step 4 : Supprimer les états devenus inutiles**

Dans le composant, supprimer `resumeOpen` et `setResumeOpen` (l'accordéon n'existe plus).
Garder : `qty`, `added`, `pdfQty`, `pdfAdded`, `formatId`, `listAnchor`, `alertOpen`, `listBtnRef`, `pagesOpen`, `pageIdx`, `videoOpen`.

---

## Task 2 : Refactor du JSX — return principal

**Files:**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

- [ ] **Step 1 : Remplacer le `return` principal**

Remplacer tout le contenu de `return (` jusqu'à la fin du JSX (avant les modales) par :

```tsx
  const uvStyle = UNIVERSE_STYLES[book.universe] ?? { bg: '#E8EDF3', color: '#1C3252' }
  const sectionLabel = book.type === 'a-paraitre' ? 'À paraître' : book.type === 'nouveaute' ? 'Nouveautés' : 'Fonds'
  const sectionPath  = book.type === 'fonds' ? '/fonds' : '/nouveautes'
  const showCoverBadge = book.selection || book.type === 'nouveaute' || book.type === 'a-paraitre'
  const coverBadgeLabel =
    book.selection ? 'SÉLECTION' : book.type === 'nouveaute' ? 'NOUVEAUTÉ' : 'À PARAÎTRE'

  const stockLabel =
    book.statut === 'dispo'        ? 'Disponible immédiatement' :
    book.statut === 'sur_commande' ? 'Sur commande' :
    book.statut === 'en_reimp'     ? 'En réimpression'
                                   : 'Disponible'

  const similar = MOCK_BOOKS
    .filter(b => b.universe === book.universe && b.id !== book.id)
    .slice(0, 7)

  return (
    <Page>
      {/* Fil d'Ariane */}
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
              width={240}
              height={360}
              universe={book.universe}
              authors={book.authors}
              publisher={book.publisher}
            />
            {showCoverBadge && <CoverBadgeDetail>{coverBadgeLabel}</CoverBadgeDetail>}
          </CoverFrame>

          <CoverActionsRow>
            <CoverActionBtn onClick={() => {
              if (navigator.share) {
                navigator.share({ title: book.title, text: book.authors.join(', ') })
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
              <MetaValueEl><strong>{book.isbn}</strong></MetaValueEl>
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
            <MetaRowItem>
              <MetaLabelEl>EAN</MetaLabelEl>
              <MetaValueEl>{book.isbn}</MetaValueEl>
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
          <BookEditorMain>
            {book.publisher}
            {book.collection ? ` · ${book.collection}` : ''}
            {' · '}{new Date(book.publicationDate).getFullYear()}
          </BookEditorMain>

          {/* Sélecteur de format — uniquement si commandable */}
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

          {/* Zone prix */}
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
                    <QtyBtnLg
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Diminuer"
                    >−</QtyBtnLg>
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
              <EpuiseNoticeEl>Cet ouvrage n'est plus disponible.</EpuiseNoticeEl>
            )}

            {isAParaitre && (
              <ParaitreNoticeEl>
                🚫 <span>Ce titre n'est pas encore commandable. La commande s'effectue via votre représentant commercial.</span>
              </ParaitreNoticeEl>
            )}
          </PriceZone>

          {/* Actions secondaires */}
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
              Fiche produit PDF
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

          {/* Synopsis */}
          <SynopsisBlock>
            <SectionEyebrow>Quatrième de couverture</SectionEyebrow>
            <SynopsisText>{book.description ? `${book.description} ${LOREM_LONG}` : LOREM_LONG}</SynopsisText>
          </SynopsisBlock>

          {/* Infos commande */}
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

      {/* ── Titres similaires ── */}
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
                    <BookCover
                      isbn={b.isbn}
                      alt={b.title}
                      width={120}
                      height={180}
                      universe={b.universe}
                      authors={b.authors}
                      publisher={b.publisher}
                    />
                  </SimilarCoverNew>
                  <SimilarBodyNew>
                    <SimilarUniverseBadgeEl $bg={bStyle.bg} $color={bStyle.color}>
                      {b.universe}
                    </SimilarUniverseBadgeEl>
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

      {/* StockAlertModal */}
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
```

Ensuite viennent les portails modales (pagesOpen, videoOpen) et le ListPickerPopover — **ne pas les modifier**.

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /Users/macbookeden/Desktop/AppBook
npx tsc --noEmit 2>&1 | head -40
```
Expected: aucune erreur TS.

- [ ] **Step 3 : Vérifier que les tests passent**

```bash
npm run test -- --run 2>&1 | tail -20
```
Expected: toutes les suites passent (161 tests).

- [ ] **Step 4 : Commit**

```bash
git add src/pages/catalogue/FicheProduitPage.tsx
git commit -m "feat(fiche-produit): conformité maquette — layout 2 colonnes sticky, meta-box, zone prix intégrée, breadcrumb, synopsis direct, infos livraison, cards similaires"
```

---

## Self-review checklist

- [x] Breadcrumb → Step 2 (BookLayout JSX)
- [x] Colonne gauche sticky : cover + partager + meta-box → Step 2
- [x] Badge univers avec bg+color → Task 1 Step 3 + Task 2 Step 1
- [x] Titre, auteur, éditeur → Step 2
- [x] Sélecteur format compact → Step 2
- [x] Zone prix intégrée (prix + stock + stepper + bouton) → Step 2
- [x] 3 actions secondaires horizontales → Step 2
- [x] Synopsis direct (pas d'accordéon) → Step 2
- [x] Bloc infos livraison champagne → Step 2
- [x] Cards similaires : bordure + univers badge + prix → Step 2
- [x] Modales PDF + vidéo conservées → non touchées
- [x] StockAlertModal conservée → non touchée
- [x] ListPickerPopover conservé → non touché
- [x] isAParaitre / isEpuise logic → Step 2
