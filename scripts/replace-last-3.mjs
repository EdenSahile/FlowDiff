import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

const REPLACEMENTS = [
  {
    fictiveIsbn: '9782290349878',
    title: 'Pars vite et reviens tard',
    authors: ['Fred Vargas'],
    search: 'Pars vite et reviens tard Fred Vargas',
  },
  {
    fictiveIsbn: '9782070584635',
    title: 'Hunger Games T.1',
    authors: ['Suzanne Collins'],
    search: 'Hunger Games Suzanne Collins',
  },
  {
    fictiveIsbn: '9782011355737',
    title: 'Je sais cuisiner',
    authors: ['Ginette Mathiot'],
    search: 'Je sais cuisiner Ginette Mathiot',
  },
]

async function searchByQuery(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}`
  const res = await fetch(url)
  const json = await res.json()
  if (!json.totalItems || !json.items?.length) return null
  for (const item of json.items) {
    const info = item.volumeInfo
    const isbn13 = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
    if (!isbn13) continue
    const imageLinks = info.imageLinks
    if (!imageLinks) continue
    const raw = imageLinks.extraLarge ?? imageLinks.large ?? imageLinks.medium ?? imageLinks.thumbnail
    if (!raw) continue
    return {
      isbn: isbn13,
      coverUrl: raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3'),
      foundTitle: info.title,
    }
  }
  return null
}

for (const r of REPLACEMENTS) {
  const result = await searchByQuery(r.search)
  if (!result) {
    console.log(`  - Introuvable: ${r.title}`)
    await new Promise(res => setTimeout(res, 200))
    continue
  }

  const { error } = await supabase.from('livres').update({
    title:     r.title,
    authors:   r.authors,
    isbn:      result.isbn,
    cover_url: result.coverUrl,
  }).eq('isbn', r.fictiveIsbn)

  if (error) console.error(`  ✗ ${r.fictiveIsbn}: ${error.message}`)
  else console.log(`  ✓ ${r.fictiveIsbn} → ${result.isbn} | ${r.title} (trouvé: "${result.foundTitle}")`)

  await new Promise(res => setTimeout(res, 200))
}
