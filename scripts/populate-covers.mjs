import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

async function fetchCoverUrl(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`
  const res = await fetch(url)
  const json = await res.json()
  if (!json.totalItems || !json.items?.length) return null
  const imageLinks = json.items[0]?.volumeInfo?.imageLinks
  if (!imageLinks) return null
  const raw = imageLinks.extraLarge ?? imageLinks.large ?? imageLinks.medium ?? imageLinks.thumbnail ?? null
  if (!raw) return null
  // Force HTTPS et zoom maximal
  return raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3')
}

async function main() {
  const { data: livres, error } = await supabase
    .from('livres')
    .select('id, isbn, title, cover_url')
    .is('cover_url', null)

  if (error) { console.error('Erreur lecture:', error.message); process.exit(1) }
  console.log(`${livres.length} livres sans cover_url à traiter\n`)

  let found = 0
  let notFound = 0

  for (const livre of livres) {
    const coverUrl = await fetchCoverUrl(livre.isbn)
    if (coverUrl) {
      const { error: updateError } = await supabase
        .from('livres')
        .update({ cover_url: coverUrl })
        .eq('id', livre.id)
      if (updateError) {
        console.error(`  ✗ UPDATE échoué pour ${livre.isbn}: ${updateError.message}`)
      } else {
        console.log(`  ✓ ${livre.isbn} — ${livre.title}`)
        found++
      }
    } else {
      console.log(`  - ${livre.isbn} — ${livre.title} (introuvable)`)
      notFound++
    }
    // Pause pour éviter rate-limit Google Books API
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nTerminé : ${found} couvertures trouvées, ${notFound} introuvables`)
}

main()
