import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { MOCK_BOOKS, type Book, type Universe } from '@/data/mockBooks'
import { BookCard } from '@/components/catalogue/BookCard'
import { useCart } from '@/contexts/CartContext'

/* ══════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════ */

function isIsbn(q: string) {
  return /^97[89]\d{10}$/.test(q.replace(/[\s-]/g, ''))
}

function normalise(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function searchCatalog(query: string): Book[] {
  const q = normalise(query.trim())
  if (!q) return []
  return MOCK_BOOKS.filter(b =>
    normalise(b.title).includes(q) ||
    b.authors.some(a => normalise(a).includes(q)) ||
    normalise(b.publisher).includes(q) ||
    (b.collection && normalise(b.collection).includes(q)) ||
    b.isbn.includes(q.replace(/[\s-]/g, ''))
  )
}

/* ══════════════════════════════════════════════════════
   GOOGLE BOOKS — confirmation hors-catalogue
══════════════════════════════════════════════════════ */

interface ExternalBook {
  isbn: string
  title: string
  authors: string[]
  publisher?: string
  coverUrl?: string
}

const _cache = new Map<string, ExternalBook | null>()

async function fetchExternal(isbn: string): Promise<ExternalBook | null> {
  if (_cache.has(isbn)) return _cache.get(isbn)!
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
    )
    if (!res.ok) { _cache.set(isbn, null); return null }
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) { _cache.set(isbn, null); return null }
    const info = item.volumeInfo
    const raw: string | undefined = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail
    const result: ExternalBook = {
      isbn,
      title:     info.title ?? 'Titre inconnu',
      authors:   info.authors ?? [],
      publisher: info.publisher,
      coverUrl:  raw ? raw.replace('http://', 'https://').replace('zoom=1', 'zoom=2') : undefined,
    }
    _cache.set(isbn, result)
    return result
  } catch { _cache.set(isbn, null); return null }
}

/* ══════════════════════════════════════════════════════
   STYLED
══════════════════════════════════════════════════════ */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`
const spin = keyframes`to { transform: rotate(360deg); }`

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1100px;
  margin: 0 auto;
  animation: ${fadeIn} 0.25s ease;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
`

const ResultTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 4px;
`

const ResultSub = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  opacity: 0.65;
  transition: opacity .15s, transform .12s;
  &:hover { opacity: 1; transform: translateX(-2px); }
`

/* ── Filtres univers ── */
const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#fff'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.navy}; }
`

/* ── Grille résultats ── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

/* ── États ── */
const Spinner = styled.div`
  width: 36px; height: 36px;
  border: 3px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.navy};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 48px auto;
`

const EmptyBox = styled.div`
  text-align: center;
  padding: 48px 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.gray[400]};
`

const EmptyIcon = styled.p`font-size: 2.5rem; margin-bottom: 12px;`
const EmptyTitle = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 6px;
`
const EmptyText = styled.p`font-size: 13px; line-height: 1.6;`

/* ── Hors catalogue ── */
const HorsCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(28,58,95,0.10);
  border: 1px solid rgba(28,58,95,0.07);
  overflow: hidden;
  max-width: 480px;
  margin: 0 auto;
  animation: ${fadeIn} 0.25s ease;
`

const HorsHeader = styled.div`
  background: #FFF3E0;
  border-bottom: 1px solid #FFD599;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`

const HorsHeaderIcon = styled.span`font-size: 18px;`

const HorsHeaderText = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: #8B4500;
`

const HorsHeaderSub = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: #B86400;
  margin-top: 1px;
`

const HorsBody = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: flex-start;
`

const HorsCover = styled.div`
  width: 80px;
  height: 114px;
  border-radius: 6px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[100]};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 3px 6px 16px rgba(28,58,95,0.18);
`

const HorsCoverImg = styled.img`
  width: 100%; height: 100%;
  object-fit: cover;
`

const HorsCoverPlaceholder = styled.div`
  font-size: 2rem;
  opacity: 0.4;
`

const HorsInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const HorsTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.3;
`

const HorsAuthor = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
`

const HorsPublisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const HorsIsbn = styled.p`
  font-family: monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 4px;
`

const HorsFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const HorsNotice = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
`

const ContactRepBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: ${({ theme }) => theme.colors.navyHover}; }
`

const SearchCatalogBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 10px;
  background: #fff;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.navy}; background: ${({ theme }) => theme.colors.gray[50]}; }
`

/* ══════════════════════════════════════════════════════
   SOUS-COMPOSANT — hors catalogue
══════════════════════════════════════════════════════ */

function HorsCatalogue({ isbn }: { isbn: string }) {
  const navigate = useNavigate()
  const [ext, setExt]         = useState<ExternalBook | null | 'loading'>('loading')

  useEffect(() => {
    fetchExternal(isbn).then(setExt)
  }, [isbn])

  const title     = ext && ext !== 'loading' ? ext.title     : isbn
  const authors   = ext && ext !== 'loading' ? ext.authors.join(', ') : ''
  const publisher = ext && ext !== 'loading' ? ext.publisher : undefined
  const coverUrl  = ext && ext !== 'loading' ? ext.coverUrl  : undefined

  const handleContact = () => {
    navigate('/contact', {
      state: {
        fromBook: {
          title:     title,
          isbn,
          publisher: publisher ?? 'inconnu',
          authors:   authors,
          programme: 'Non référencé',
        },
      },
    })
  }

  return (
    <HorsCard>
      <HorsHeader>
        <HorsHeaderIcon>📦</HorsHeaderIcon>
        <div>
          <HorsHeaderText>Titre hors catalogue</HorsHeaderText>
          <HorsHeaderSub>Ce titre n'est pas distribué par nos éditions</HorsHeaderSub>
        </div>
      </HorsHeader>

      <HorsBody>
        <HorsCover>
          {coverUrl
            ? <HorsCoverImg src={coverUrl} alt={title} />
            : ext === 'loading'
              ? <Spinner style={{ width: 20, height: 20, borderWidth: 2, margin: 0 }} />
              : <HorsCoverPlaceholder>📖</HorsCoverPlaceholder>
          }
        </HorsCover>

        <HorsInfo>
          <HorsTitle>
            {ext === 'loading' ? 'Recherche en cours…' : title}
          </HorsTitle>
          {authors    && <HorsAuthor>{authors}</HorsAuthor>}
          {publisher  && <HorsPublisher>{publisher}</HorsPublisher>}
          <HorsIsbn>ISBN {isbn}</HorsIsbn>
        </HorsInfo>
      </HorsBody>

      <HorsFooter>
        <HorsNotice>
          Cet ouvrage ne fait pas partie de notre catalogue. Vous pouvez contacter votre représentant commercial pour savoir si ce titre peut être référencé ou pour toute demande spéciale.
        </HorsNotice>
        <ContactRepBtn onClick={handleContact}>
          ✉️ Contacter mon représentant
        </ContactRepBtn>
        <SearchCatalogBtn onClick={() => navigate(-1)}>
          ← Retour à la recherche
        </SearchCatalogBtn>
      </HorsFooter>
    </HorsCard>
  )
}

/* ══════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════ */

const UNIVERSES: Universe[] = ['BD/Mangas', 'Jeunesse', 'Littérature', 'Adulte-pratique']

export function RecherchePage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { addToCart } = useCart()

  const q = (params.get('q') ?? '').trim()
  const [universeFilter, setUniverseFilter] = useState<Universe | null>(null)

  /* Si l'ISBN est dans le catalogue, rediriger direct vers la fiche */
  useEffect(() => {
    if (!q) return
    const isbn = q.replace(/[\s-]/g, '')
    if (isIsbn(isbn)) {
      const found = MOCK_BOOKS.find(b => b.isbn === isbn)
      if (found) navigate(`/livre/${found.id}`, { replace: true })
    }
  }, [q, navigate])

  /* Résultats catalogue */
  const allResults = useMemo(() => searchCatalog(q), [q])

  const results = useMemo(() =>
    universeFilter ? allResults.filter(b => b.universe === universeFilter) : allResults,
    [allResults, universeFilter]
  )

  /* Cas ISBN hors catalogue */
  const isbnNotFound = isIsbn(q.replace(/[\s-]/g, '')) &&
    !MOCK_BOOKS.find(b => b.isbn === q.replace(/[\s-]/g, ''))

  /* ── Rendu ── */
  if (!q) {
    return (
      <Page>
        <BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>
        <EmptyBox>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>Lancez une recherche</EmptyTitle>
          <EmptyText>Saisissez un titre, un auteur, un éditeur ou un ISBN dans la barre de recherche.</EmptyText>
        </EmptyBox>
      </Page>
    )
  }

  if (isbnNotFound) {
    return (
      <Page>
        <BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>
        <PageHeader>
          <ResultTitle>ISBN {q}</ResultTitle>
          <ResultSub>Ce titre n'a pas été trouvé dans notre catalogue</ResultSub>
        </PageHeader>
        <HorsCatalogue isbn={q.replace(/[\s-]/g, '')} />
      </Page>
    )
  }

  return (
    <Page>
      <BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>

      <PageHeader>
        <ResultTitle>
          {allResults.length > 0
            ? `${allResults.length} résultat${allResults.length > 1 ? 's' : ''} pour « ${q} »`
            : `Aucun résultat pour « ${q} »`}
        </ResultTitle>
        {results.length !== allResults.length && (
          <ResultSub>{results.length} titre{results.length > 1 ? 's' : ''} dans cette thématique</ResultSub>
        )}
      </PageHeader>

      {allResults.length > 0 && (
        <FilterRow>
          <FilterChip
            $active={universeFilter === null}
            onClick={() => setUniverseFilter(null)}
          >
            Tous ({allResults.length})
          </FilterChip>
          {UNIVERSES.filter(u => allResults.some(b => b.universe === u)).map(u => (
            <FilterChip
              key={u}
              $active={universeFilter === u}
              onClick={() => setUniverseFilter(v => v === u ? null : u)}
            >
              {u} ({allResults.filter(b => b.universe === u).length})
            </FilterChip>
          ))}
        </FilterRow>
      )}

      {results.length > 0 ? (
        <Grid>
          {results.map(book => (
            <BookCard key={book.id} book={book} showType />
          ))}
        </Grid>
      ) : (
        <EmptyBox>
          <EmptyIcon>📚</EmptyIcon>
          <EmptyTitle>Aucun titre trouvé</EmptyTitle>
          <EmptyText>
            Aucun ouvrage de notre catalogue ne correspond à « {q} ».
            <br />
            Essayez avec un titre partiel, un nom d'auteur ou un ISBN.
          </EmptyText>
          <ContactRepBtn
            onClick={() => navigate('/contact', { state: { fromBook: { title: q, isbn: '', publisher: '', authors: '', programme: '' } } })}
            style={{ marginTop: 20, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}
          >
            ✉️ Contacter mon représentant
          </ContactRepBtn>
        </EmptyBox>
      )}
    </Page>
  )
}
