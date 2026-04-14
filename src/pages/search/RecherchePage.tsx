import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { Button } from '@/components/ui/Button'
import { TextBadge } from '@/components/ui/Badge'

/* ── Types ── */
interface BookInfo {
  isbn: string
  title: string
  authors: string[]
  publisher?: string
  coverUrl?: string
}

/* ── Fetch avec cache : Google Books → Open Library en fallback ── */
const bookCache = new Map<string, BookInfo | null>()

async function fetchFromGoogleBooks(isbn: string): Promise<BookInfo | null> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
  )
  if (!res.ok) return null
  const data = await res.json()
  const item = data.items?.[0]
  if (!item) return null

  const info = item.volumeInfo
  const coverRaw: string | undefined = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail
  const coverUrl = coverRaw
    ? coverRaw.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
    : undefined

  return {
    isbn,
    title: info.title ?? 'Titre inconnu',
    authors: info.authors ?? [],
    publisher: info.publisher,
    coverUrl,
  }
}

async function fetchFromOpenLibrary(isbn: string): Promise<BookInfo | null> {
  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  )
  if (!res.ok) return null
  const data = await res.json()
  const entry = data[`ISBN:${isbn}`]
  if (!entry) return null

  const coverUrl: string | undefined = entry.cover?.large ?? entry.cover?.medium
    ?? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

  return {
    isbn,
    title: entry.title ?? 'Titre inconnu',
    authors: (entry.authors ?? []).map((a: { name: string }) => a.name),
    publisher: entry.publishers?.[0]?.name,
    coverUrl,
  }
}

async function fetchBookByIsbn(isbn: string): Promise<BookInfo | null> {
  if (bookCache.has(isbn)) return bookCache.get(isbn)!

  const book = await fetchFromGoogleBooks(isbn) ?? await fetchFromOpenLibrary(isbn)
  bookCache.set(isbn, book)
  return book
}

function isEan(q: string) {
  return /^97[89]\d{10}$/.test(q.trim())
}

/* ── Animations ── */
const spin = keyframes`
  to { transform: rotate(360deg); }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

/* ── Styled ── */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 560px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease;
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover { text-decoration: underline; }
`

const TempNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 6px ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`

const CardBody = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
  }
`

const CoverWrapper = styled.div`
  flex-shrink: 0;
  width: 120px;
  height: 180px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 140px;
    height: 210px;
  }
`

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const CoverPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 2rem;
`

const BookDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BookTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
`

const BookAuthors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const BookPublisher = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[400]};
`

const IsbnRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.sm};
`

const IsbnLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const IsbnValue = styled.span`
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.navy};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: ${({ theme }) => theme.spacing['3xl']} auto;
`

const Message = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`

const MessageTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

/* ── Component ── */
export function RecherchePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''

  const [book, setBook] = useState<BookInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isEan(q)) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setBook(null)

    fetchBookByIsbn(q)
      .then((result) => {
        if (cancelled) return
        if (result) setBook(result)
        else setNotFound(true)
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [q])

  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>
        ← Retour
      </BackButton>

      <TempNotice>
        ⚠︎ Page temporaire — fiche produit complète en Phase 5
      </TempNotice>

      {/* ── Cas 1 : EAN scanné ── */}
      {isEan(q) && (
        <>
          {loading && <Spinner aria-label="Chargement…" />}

          {!loading && notFound && (
            <Message>
              <MessageTitle>Livre introuvable</MessageTitle>
              <p>Aucun résultat pour l'EAN <code>{q}</code>.</p>
              <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>
                Vérifiez le code-barres ou effectuez une recherche manuelle.
              </p>
            </Message>
          )}

          {!loading && book && (
            <Card>
              <CardBody>
                <CoverWrapper>
                  {book.coverUrl ? (
                    <CoverImage
                      src={book.coverUrl}
                      alt={`Couverture de ${book.title}`}
                      loading="lazy"
                    />
                  ) : (
                    <CoverPlaceholder>
                      📖
                      <span style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0 8px' }}>
                        Couverture indisponible
                      </span>
                    </CoverPlaceholder>
                  )}
                </CoverWrapper>

                <BookDetails>
                  <TextBadge variant="new">Résultat scan</TextBadge>
                  <BookTitle>{book.title}</BookTitle>
                  {book.authors.length > 0 && (
                    <BookAuthors>{book.authors.join(', ')}</BookAuthors>
                  )}
                  {book.publisher && (
                    <BookPublisher>{book.publisher}</BookPublisher>
                  )}
                  <IsbnRow>
                    <IsbnLabel>ISBN</IsbnLabel>
                    <IsbnValue>{book.isbn}</IsbnValue>
                  </IsbnRow>
                </BookDetails>
              </CardBody>

              <CardFooter>
                <Button variant="primary" size="md" fullWidth disabled>
                  Ajouter au panier — disponible Phase 6
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}

      {/* ── Cas 2 : recherche texte ── */}
      {!isEan(q) && q && (
        <Message>
          <MessageTitle>Recherche : « {q} »</MessageTitle>
          <p>La recherche par texte sera disponible en Phase 5.</p>
        </Message>
      )}

      {!q && (
        <Message>
          <MessageTitle>Aucune recherche</MessageTitle>
          <p>Utilisez la barre de recherche ou le scanner depuis l'accueil.</p>
        </Message>
      )}
    </Page>
  )
}
