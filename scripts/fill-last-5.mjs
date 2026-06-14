import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

const TARGETS = [
  { isbn: '9782035876614', queries: ['Larousse jardinage potager', 'Guide Larousse jardinage'] },
  { isbn: '9782913366657', queries: ['Méditer jour après jour Christophe André', 'Christophe André méditer'] },
  { isbn: '9782290349878', queries: ['Sous les vents de Neptune Fred Vargas', 'Vargas Neptune commissaire Adamsberg'] },
  { isbn: '9782070584635', queries: ['Harry Potter Chambre Secrets Rowling', 'Harry Potter Chamber Secrets'] },
  { isbn: '9782011355737', queries: ['Grand Larousse cuisine', 'Larousse cuisine gastronomie'] },
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

for (const target of TARGETS) {
  let result = null
  for (const q of target.queries) {
    result = await searchByQuery(q)
    if (result) break
    await new Promise(r => setTimeout(r, 200))
  }

  if (result) {
    const { error } = await supabase.from('livres').update({ cover_url: result.coverUrl }).eq('isbn', target.isbn)
    if (error) console.error(`  ✗ ${target.isbn}: ${error.message}`)
    else console.log(`  ✓ ${target.isbn} → "${result.foundTitle}"`)
  } else {
    console.log(`  - ${target.isbn} — toujours introuvable`)
  }
  await new Promise(r => setTimeout(r, 200))
}
