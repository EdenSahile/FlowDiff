import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { BookCard } from '@/components/catalogue/BookCard'
import { slugifyAuthor } from '@/lib/slugify'

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

/* ── Styled ── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div`
  animation: ${fadeIn} 0.25s ease;
`

const Hero = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`

const HeroInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 7px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.18); color: #fff; }
`

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  flex-shrink: 0;
`

const AuthorInfo = styled.div``

const AuthorLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
`

const AuthorName = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`

const AuthorMeta = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin-top: 6px;
`

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`

const MonthSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const MonthPill = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  padding: 5px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  white-space: nowrap;
`

const MonthLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[200]};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const EmptyBox = styled.div`
  text-align: center;
  padding: 64px 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const EmptyIcon = styled.p`font-size: 3rem; margin-bottom: 12px;`
const EmptyTitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 8px;
`
const EmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ── Component ── */
export function AuteurPage() {
  const { auteurSlug } = useParams<{ auteurSlug: string }>()
  const navigate = useNavigate()

  /* Trouver le nom réel depuis le slug */
  const authorName = useMemo(() => {
    if (!auteurSlug) return null
    for (const book of MOCK_BOOKS) {
      for (const a of book.authors) {
        if (slugifyAuthor(a) === auteurSlug) return a
      }
    }
    return null
  }, [auteurSlug])

  /* Livres de cet auteur — 2 dernières années, triés date décroissante */
  const books = useMemo(() => {
    if (!authorName) return []
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const cutoff = twoYearsAgo.toISOString().slice(0, 10)
    return MOCK_BOOKS
      .filter(b =>
        b.authors.some(a => slugifyAuthor(a) === auteurSlug) &&
        b.publicationDate >= cutoff
      )
      .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
  }, [authorName, auteurSlug])

  /* Grouper par "Mois AAAA" */
  const groups = useMemo(() => {
    const map = new Map<string, typeof books>()
    for (const book of books) {
      const [year, month] = book.publicationDate.split('-')
      const key = `${MONTHS_FR[parseInt(month, 10) - 1]} ${year}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(book)
    }
    return Array.from(map.entries())
  }, [books])

  const initials = authorName
    ? authorName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <Page>
      <Hero>
        <HeroInner>
          <BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>
          <AuthorRow>
            <Avatar>{initials}</Avatar>
            <AuthorInfo>
              <AuthorLabel>Auteur</AuthorLabel>
              <AuthorName>{authorName ?? auteurSlug}</AuthorName>
              {books.length > 0 && (
                <AuthorMeta>
                  {books.length} titre{books.length > 1 ? 's' : ''} dans notre catalogue
                </AuthorMeta>
              )}
            </AuthorInfo>
          </AuthorRow>
        </HeroInner>
      </Hero>

      <Content>
        {books.length === 0 ? (
          <EmptyBox>
            <EmptyIcon>📚</EmptyIcon>
            <EmptyTitle>Aucun titre trouvé</EmptyTitle>
            <EmptyText>Cet auteur n'a pas de parution dans notre catalogue.</EmptyText>
          </EmptyBox>
        ) : (
          groups.map(([month, monthBooks]) => (
            <MonthSection key={month}>
              <MonthHeader>
                <MonthPill>{month}</MonthPill>
                <MonthLine />
              </MonthHeader>
              <Grid>
                {monthBooks.map(book => (
                  <BookCard key={book.id} book={book} showType coverFirst />
                ))}
              </Grid>
            </MonthSection>
          ))
        )}
      </Content>
    </Page>
  )
}
