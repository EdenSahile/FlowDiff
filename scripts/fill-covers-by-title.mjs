import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

// Remplacements pour les livres fictifs confirmés (ISBN inventé + auteur fictif)
const FICTIF_OVERRIDES = {
  '9782370739002': { title: 'Blacksad T.3 — Âme rouge',     authors: ['Juan Díaz Canales', 'Juanjo Guarnido'], search: 'Blacksad Ame rouge Canales' },
  '9782019469023': { title: 'Yoga, anatomie & mouvement',    authors: ['Leslie Kaminoff'],                     search: 'Yoga anatomie mouvement Kaminoff' },
  '9782019468422': { title: 'Pilates — Le guide complet',    authors: ['Rael Isacowitz'],                     search: 'Pilates guide complet Isacowitz' },
}

async function searchByQuery(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}`
  const res = await fetch(url)
  const json = await res.json()
  if (!json.totalItems || !json.items?.length) return null

  for (const item of json.items) {
    const info = item.volumeInfo
    const identifiers = info.industryIdentifiers ?? []
    const isbn13 = identifiers.find(i => i.type === 'ISBN_13')?.identifier
    if (!isbn13) continue
    const imageLinks = info.imageLinks
    if (!imageLinks) continue
    const raw = imageLinks.extraLarge ?? imageLinks.large ?? imageLinks.medium ?? imageLinks.thumbnail
    if (!raw) continue
    const coverUrl = raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3')
    return { isbn: isbn13, coverUrl, foundTitle: info.title, foundAuthor: info.authors?.[0] }
  }
  return null
}

function buildSearchQuery(title, author) {
  // Nettoyer le titre : retirer "T.1", "T.2", etc. pour les séries si présent
  const cleanTitle = title.replace(/\s*T\.\d+.*$/, '').replace(/\s*—.*$/, '').trim()
  return `intitle:"${cleanTitle}" inauthor:"${author.split(' ').pop()}"`
}

async function main() {
  const { data: livres, error } = await supabase
    .from('livres')
    .select('id, isbn, title, authors, type, universe, cover_url')
    .is('cover_url', null)

  if (error) { console.error(error.message); process.exit(1) }
  console.log(`${livres.length} livres à traiter\n`)

  let found = 0
  let notFound = []

  for (const livre of livres) {
    const override = FICTIF_OVERRIDES[livre.isbn]
    let result = null

    if (override) {
      // Livre fictif : chercher le remplacement
      result = await searchByQuery(override.search)
      if (result) {
        const { error: e } = await supabase.from('livres').update({
          title:     override.title,
          authors:   override.authors,
          isbn:      result.isbn,
          cover_url: result.coverUrl,
        }).eq('isbn', livre.isbn)
        if (e) console.error(`  ✗ ${livre.isbn}: ${e.message}`)
        else { console.log(`  ✓ [REMPLACÉ] ${livre.isbn} → ${result.isbn} | ${override.title}`); found++ }
      } else {
        console.log(`  - [FICTIF INTROUVABLE] ${livre.isbn} — ${override.title}`)
        notFound.push(livre)
      }
    } else {
      // Livre réel : chercher par titre+auteur
      const query = buildSearchQuery(livre.title, livre.authors?.[0] ?? '')
      result = await searchByQuery(query)
      if (result) {
        const { error: e } = await supabase.from('livres').update({
          cover_url: result.coverUrl,
        }).eq('isbn', livre.isbn)
        if (e) console.error(`  ✗ ${livre.isbn}: ${e.message}`)
        else { console.log(`  ✓ ${livre.isbn} | ${livre.title} → cover trouvée`); found++ }
      } else {
        console.log(`  - ${livre.isbn} — ${livre.title} (introuvable)`)
        notFound.push(livre)
      }
    }

    await new Promise(r => setTimeout(r, 250))
  }

  console.log(`\n✓ ${found} couvertures ajoutées`)
  if (notFound.length) {
    console.log(`\nEncore sans couverture (${notFound.length}):`)
    notFound.forEach(l => console.log(`  [${l.type}] [${l.universe}] ${l.isbn} — ${l.title}`))
  }
}

main()
