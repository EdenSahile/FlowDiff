import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

// ISBN fictifs → données réelles de remplacement
const REPLACEMENTS = [
  { fictiveIsbn: '9782072999001', title: "La Promesse de l'aube",          authors: ['Romain Gary'] },
  { fictiveIsbn: '9782072999002', title: 'Le Père Goriot',                  authors: ['Honoré de Balzac'] },
  { fictiveIsbn: '9782072999003', title: 'Voyage au bout de la nuit',       authors: ['Louis-Ferdinand Céline'] },
  { fictiveIsbn: '9782072999004', title: 'La Peste',                        authors: ['Albert Camus'] },
  { fictiveIsbn: '9782072999005', title: 'Les Liaisons dangereuses',        authors: ['Choderlos de Laclos'] },
  { fictiveIsbn: '9782370739001', title: 'Blacksad T.2 — Arctic Nation',    authors: ['Juan Díaz Canales', 'Juanjo Guarnido'] },
  { fictiveIsbn: '9782370739002', title: 'Blacksad T.3 — Âme rouge',       authors: ['Juan Díaz Canales', 'Juanjo Guarnido'] },
  { fictiveIsbn: '9782370730220', title: 'Blacksad',                        authors: ['Juan Díaz Canales', 'Juanjo Guarnido'] },
]

const TO_DELETE_ISBN = '9782325671234'

async function searchBook(title, author) {
  const q = encodeURIComponent(`intitle:${title} inauthor:${author}`)
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&langRestrict=fr&key=${API_KEY}`
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
    return { isbn: isbn13, coverUrl, foundTitle: info.title }
  }
  return null
}

async function main() {
  // Supprimer le livre de test
  const { error: delErr } = await supabase
    .from('livres')
    .delete()
    .eq('isbn', TO_DELETE_ISBN)
  if (delErr) console.error(`✗ Suppression test échouée: ${delErr.message}`)
  else console.log(`✓ Supprimé: test ajout livre (${TO_DELETE_ISBN})\n`)

  // Remplacer les livres fictifs
  for (const r of REPLACEMENTS) {
    const found = await searchBook(r.title, r.authors[0])
    if (!found) {
      console.log(`  - Introuvable: ${r.title}`)
      await new Promise(res => setTimeout(res, 200))
      continue
    }

    const { error } = await supabase
      .from('livres')
      .update({
        title:     r.title,
        authors:   r.authors,
        isbn:      found.isbn,
        cover_url: found.coverUrl,
      })
      .eq('isbn', r.fictiveIsbn)

    if (error) {
      console.error(`  ✗ UPDATE échoué pour ${r.fictiveIsbn}: ${error.message}`)
    } else {
      console.log(`  ✓ ${r.fictiveIsbn} → ${found.isbn} | ${r.title} | ${found.foundTitle}`)
      console.log(`    cover: ${found.coverUrl}`)
    }
    await new Promise(res => setTimeout(res, 200))
  }

  console.log('\nTerminé.')
}

main()
