import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY

const UA = { 'User-Agent': 'Mozilla/5.0' }

// Tailles de placeholders Google connus à rejeter d'office
const BAD_SIZES = new Set([1197, 9103])

// Hors périmètre étape 1 :
// - Slimani fictifs (→ étape 2, remplacement titre/ISBN) : exclus par ISBN
// - My Hero Academia (→ étape 3, re-fetch par tome exact) : exclus par titre
const EXCLUDE_ISBN = new Set([
  '9782072999010', '9782072999011', '9782072999012', '9782072999013',
  '9782072999014', '9782072999015',
])
const isExcluded = (l) =>
  EXCLUDE_ISBN.has(l.isbn) || /my hero academia/i.test(l.title ?? '')

// Covers vérifiées à la main (cover_i Open Library) pour les titres absents
// des recherches FR/ISBN automatiques. Tous validés réels (> 8 ko, single-title).
// VO faute d'édition FR sur OL ; La Zizanie = vraie cover Astérix française.
const MANUAL_OVERRIDE = {
  '9782070589002': 14838233, // Les Deux Gredins (The Twits, Dahl)
  '9782070589001': 8252454,  // James et la Grosse Pêche (James and the Giant Peach)
  '9782070589004': 11388220, // La Potion magique de Georges Bouillon (George's Marvellous Medicine)
  '9782070625734': 8441376,  // Le Lion, la Sorcière… (The Lion, the Witch and the Wardrobe)
  '9782012101449': 14006624, // Astérix — La Zizanie (cover FR)
}

// --- Lecture des dimensions réelles depuis l'en-tête JPEG/PNG ---
function imageSize(buf) {
  if (buf.length < 24) return { w: 0, h: 0 }
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  }
  // JPEG : parcourt les segments jusqu'à SOF
  let o = 2
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue }
    const marker = buf[o + 1]
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) }
    }
    o += 2 + buf.readUInt16BE(o + 2)
  }
  return { w: 0, h: 0 }
}

// Télécharge un candidat et le valide (octets + dimensions réelles).
// Retry : Open Library rate-limite en rafale et renvoie des réponses ~9 octets
// (faux négatifs) ; on réessaie avant de conclure que la cover est absente.
async function validateCover(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) })
      if (!res.ok) { await wait(1200); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      // Réponse minuscule = rate-limit / pas d'image → on réessaie
      if (buf.length <= 50) { await wait(1200); continue }
      if (BAD_SIZES.has(buf.length)) return null
      if (buf.length < 8000) return null
      const { w } = imageSize(buf)
      if (w < 300) return null
      return { url, len: buf.length, w }
    } catch {
      await wait(1200)
    }
  }
  return null
}

const wait = (ms) => new Promise(r => setTimeout(r, ms))

// Extrait la meilleure URL d'image d'un item Google Books
function pickImageLink(info) {
  const links = info.imageLinks
  if (!links) return null
  const raw = links.extraLarge ?? links.large ?? links.medium ?? links.thumbnail
  if (!raw) return null
  return raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3')
}

async function googleSearch(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return json.items ?? []
}

// Essaie chaque source dans l'ordre, retourne la 1re cover validée
async function findValidCover(livre) {
  const { isbn, title, authors } = livre
  const author = authors?.[0] ?? ''

  // 0. Override manuel (cover_i OL vérifié) — prioritaire
  const overrideId = MANUAL_OVERRIDE[isbn]
  if (overrideId) {
    const ok = await validateCover(`https://covers.openlibrary.org/b/id/${overrideId}-L.jpg`)
    if (ok) return { ...ok, source: 'Manual override' }
  }

  // a. Google par ISBN
  for (const item of await googleSearch(`isbn:${isbn}`)) {
    const link = pickImageLink(item.volumeInfo)
    if (!link) continue
    const ok = await validateCover(link)
    if (ok) return { ...ok, source: 'Google isbn' }
  }

  // b. Google par titre + auteur
  const cleanTitle = title.replace(/\s*T\.\d+.*$/, '').replace(/\s*—.*$/, '').trim()
  const q = `intitle:"${cleanTitle}"${author ? ` inauthor:"${author.split(' ').pop()}"` : ''}`
  for (const item of await googleSearch(q)) {
    const link = pickImageLink(item.volumeInfo)
    if (!link) continue
    const ok = await validateCover(link)
    if (ok) return { ...ok, source: 'Google titre' }
  }

  // c. Fallback Open Library par ISBN
  const ol = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
  const okOl = await validateCover(ol)
  if (okOl) return { ...okOl, source: 'OpenLibrary isbn' }

  // d. Open Library search par titre + auteur → cover_i → /b/id/{id}-L.jpg
  for (const coverId of await openLibSearchCovers(title, author)) {
    const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    const ok = await validateCover(url)
    if (ok) return { ...ok, source: 'OpenLibrary titre' }
  }

  return null
}

// Cherche des cover IDs via l'API search d'Open Library (par titre + auteur)
async function openLibSearchCovers(title, author) {
  const cleanTitle = title.replace(/\s*T\.\d+.*$/, '').replace(/\s*—.*$/, '').trim()
  const params = new URLSearchParams({ title: cleanTitle, limit: '5', fields: 'cover_i' })
  if (author) params.set('author', author)
  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params}`, { headers: UA })
    if (!res.ok) return []
    const json = await res.json()
    return (json.docs ?? []).map(d => d.cover_i).filter(Boolean)
  } catch {
    return []
  }
}

// Refait le diagnostic de detect-missing-covers.mjs pour cibler dynamiquement
async function detectBroken(rows) {
  const analysed = []
  for (const l of rows) {
    if (!l.cover_url) { analysed.push({ ...l, len: 0, w: 0 }); continue }
    try {
      const res = await fetch(l.cover_url, { headers: UA })
      const buf = Buffer.from(await res.arrayBuffer())
      analysed.push({ ...l, len: buf.length, w: imageSize(buf).w })
    } catch {
      analysed.push({ ...l, len: 0, w: 0 })
    }
  }
  const byLen = {}
  for (const r of analysed) byLen[r.len] = (byLen[r.len] || 0) + 1
  return analysed.filter(r =>
    r.len === 0 || r.len < 5000 || r.w < 120 || byLen[r.len] > 1
  )
}

async function main() {
  const { data: livres, error } = await supabase
    .from('livres')
    .select('id, isbn, title, authors, cover_url')
    .order('title')
  if (error) { console.error(error.message); process.exit(1) }

  console.log(`Diagnostic en cours sur ${livres.length} livres…`)
  const allBroken = await detectBroken(livres)
  const broken = allBroken.filter(l => !isExcluded(l))
  const skipped = allBroken.filter(isExcluded)
  console.log(`${broken.length} couverture(s) à réparer (étape 1).`)
  if (skipped.length) {
    console.log(`${skipped.length} ignorée(s) (étapes 2-3) : ${skipped.map(l => l.isbn).join(', ')}`)
  }
  console.log('')

  let fixed = 0
  const failed = []

  for (const livre of broken) {
    const result = await findValidCover(livre)
    if (result) {
      const { error: e } = await supabase
        .from('livres')
        .update({ cover_url: result.url })
        .eq('isbn', livre.isbn)
      if (e) { console.error(`  ✗ ${livre.isbn} update: ${e.message}`); failed.push(livre) }
      else { console.log(`  ✓ ${livre.isbn} | ${livre.title} → ${result.source} (${result.len}o, ${result.w}px)`); fixed++ }
    } else {
      console.log(`  ✗ ${livre.isbn} | ${livre.title} → aucun visuel valide trouvé`)
      failed.push(livre)
    }
    await new Promise(r => setTimeout(r, 250))
  }

  console.log(`\n✓ ${fixed} couverture(s) réparée(s)`)
  if (failed.length) {
    console.log(`\nÉchecs (${failed.length}) — à traiter manuellement :`)
    failed.forEach(l => console.log(`  ${l.isbn} — ${l.title} (${l.authors?.[0] ?? '?'})`))
  }
}

main()
