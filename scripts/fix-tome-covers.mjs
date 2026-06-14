import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY
const UA = { 'User-Agent': 'Mozilla/5.0' }
const wait = (ms) => new Promise(r => setTimeout(r, ms))

// Tailles à rejeter : placeholders Google + covers actuellement partagées par tomes
const BAD_SIZES = new Set([1197, 9103, 131869, 44195])

// Cibles : tomes dont la cover est partagée (héritée du T.1).
// Pour chacun, sources candidates dans l'ordre.
const TARGETS = [
  { isbn: '9782344003459', label: 'My Hero Academia T.2', olCoverIds: [8491062], olSearch: { title: 'My Hero Academia 2', author: 'Horikoshi' } },
  { isbn: '9782344005002', label: 'My Hero Academia T.3', olCoverIds: [8491079], olSearch: { title: 'My Hero Academia 3', author: 'Horikoshi' } },
  { isbn: '9782344006467', label: 'My Hero Academia T.4', olCoverIds: [8491114], olSearch: { title: 'My Hero Academia 4', author: 'Horikoshi' } },
  { isbn: '9782370739007', label: "Cahiers d'Esther T.2", olCoverIds: [12369452], googleIsbn: '9782370731142', olSearch: { title: 'Cahiers Esther Tome 2', author: 'Sattouf' } },
]

function imageSize(buf) {
  if (buf.length < 24) return { w: 0, h: 0 }
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  let o = 2
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue }
    const m = buf[o + 1]
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) }
    o += 2 + buf.readUInt16BE(o + 2)
  }
  return { w: 0, h: 0 }
}

// Télécharge + valide, avec retry (OL rate-limite → réponses ~9 octets)
async function validateCover(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) })
      if (!res.ok) { await wait(1200); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length <= 50) { await wait(1200); continue }   // rate-limit → retry
      if (BAD_SIZES.has(buf.length)) return null
      if (buf.length < 8000) return null
      if (imageSize(buf).w < 300) return null
      return { url, len: buf.length, w: imageSize(buf).w }
    } catch { await wait(1200) }
  }
  return null
}

async function olSearchCoverIds(title, author) {
  const params = new URLSearchParams({ title, author, limit: '10', fields: 'cover_i' })
  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params}`, { headers: UA, signal: AbortSignal.timeout(15000) })
    if (!res.ok) return []
    const json = await res.json()
    return [...new Set((json.docs ?? []).map(d => d.cover_i).filter(Boolean))]
  } catch { return [] }
}

async function googleCoverByIsbn(isbn) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`)
    const json = await res.json()
    const l = (json.items ?? [])[0]?.volumeInfo?.imageLinks
    if (!l) return null
    const raw = l.extraLarge ?? l.large ?? l.medium ?? l.thumbnail
    return raw ? raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3') : null
  } catch { return null }
}

async function findCover(t) {
  // 1. cover_i OL explicites
  for (const id of t.olCoverIds ?? []) {
    const ok = await validateCover(`https://covers.openlibrary.org/b/id/${id}-L.jpg`)
    if (ok) return { ...ok, source: `OL cover_i ${id}` }
  }
  // 2. Google par ISBN réel du tome
  if (t.googleIsbn) {
    const url = await googleCoverByIsbn(t.googleIsbn)
    if (url) { const ok = await validateCover(url); if (ok) return { ...ok, source: `Google isbn ${t.googleIsbn}` } }
  }
  // 3. OL recherche par titre
  if (t.olSearch) {
    for (const id of await olSearchCoverIds(t.olSearch.title, t.olSearch.author)) {
      const ok = await validateCover(`https://covers.openlibrary.org/b/id/${id}-L.jpg`)
      if (ok) return { ...ok, source: `OL search cover_i ${id}` }
    }
  }
  return null
}

async function main() {
  console.log(`${TARGETS.length} tomes à corriger\n`)
  const seen = new Set()  // pour garantir des covers distinctes entre tomes
  let fixed = 0
  for (const t of TARGETS) {
    const r = await findCover(t)
    if (!r) { console.log(`  ✗ ${t.isbn} | ${t.label} → aucune cover valide`); continue }
    if (seen.has(r.len)) { console.log(`  ✗ ${t.isbn} | ${t.label} → cover en doublon (${r.len}o), ignorée`); continue }
    seen.add(r.len)
    const { error } = await supabase.from('livres').update({ cover_url: r.url }).eq('isbn', t.isbn)
    if (error) { console.log(`  ✗ ${t.isbn} update: ${error.message}`); continue }
    console.log(`  ✓ ${t.isbn} | ${t.label} → ${r.source} (${r.len}o, ${r.w}px)`)
    fixed++
    await wait(300)
  }
  console.log(`\n✓ ${fixed}/${TARGETS.length} corrigés`)
}

main()
