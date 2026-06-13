import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY
const UA = { 'User-Agent': 'Mozilla/5.0' }
const BAD_SIZES = new Set([1197, 9103])
const wait = (ms) => new Promise(r => setTimeout(r, ms))

// ISBN fictif actuel → vrai titre Leïla Slimani + métadonnées réelles.
// authors / publisher / universe / type / price restent ceux de la ligne existante.
const REPLACEMENTS = [
  {
    fictiveIsbn: '9782072999010',
    title: 'Le pays des autres',
    search: 'Le pays des autres',
    genre: 'Roman historique',
    pages: 368,
    publicationDate: '2020-03-05',
    description: "Après la Seconde Guerre mondiale, Mathilde, jeune Alsacienne, suit Amine au Maroc. Premier tome de la trilogie : une saga sur le couple, le colonialisme et la liberté.",
  },
  {
    fictiveIsbn: '9782072999011',
    title: 'Regardez-nous danser',
    search: 'Regardez-nous danser Slimani',
    genre: 'Roman historique',
    pages: 368,
    publicationDate: '2022-02-03',
    description: "Le pays des autres, tome 2. Maroc des années 1960-70 : la génération suivante grandit entre traditions et modernité, désirs d'émancipation et tensions politiques.",
  },
  {
    fictiveIsbn: '9782072999012',
    title: "J'emporterai le feu",
    search: "J'emporterai le feu Slimani",
    genre: 'Roman historique',
    pages: 416,
    publicationDate: '2025-01-09',
    description: "Le pays des autres, tome 3. Conclusion de la fresque familiale, entre le Maroc et la France, sur trois générations marquées par l'Histoire.",
  },
  {
    fictiveIsbn: '9782072999013',
    title: "Dans le jardin de l'ogre",
    search: "Dans le jardin de l'ogre Slimani",
    genre: 'Roman contemporain',
    pages: 240,
    publicationDate: '2014-08-20',
    description: "Premier roman de Leïla Slimani. Adèle, journaliste à Paris, mène une double vie dévorée par l'addiction. Un portrait sans fard du désir et de la dépendance.",
  },
  {
    fictiveIsbn: '9782072999015',
    title: 'Le parfum des fleurs la nuit',
    search: 'Le parfum des fleurs la nuit Slimani',
    genre: 'Récit',
    pages: 160,
    publicationDate: '2021-02-04',
    description: "Enfermée une nuit dans un musée vénitien, Leïla Slimani interroge l'écriture, l'enfermement et la liberté. Un récit intime sur ce que c'est qu'écrire.",
  },
]

// --- dimensions image (en-tête JPEG/PNG) ---
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

async function validateCover(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) })
      if (!res.ok) { await wait(1200); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length <= 50) { await wait(1200); continue }
      if (BAD_SIZES.has(buf.length)) return null
      if (buf.length < 8000) return null
      if (imageSize(buf).w < 300) return null
      return url
    } catch { await wait(1200) }
  }
  return null
}

function pickImageLink(info) {
  const l = info.imageLinks
  if (!l) return null
  const raw = l.extraLarge ?? l.large ?? l.medium ?? l.thumbnail
  return raw ? raw.replace('http://', 'https://').replace(/&zoom=\d/, '&zoom=3') : null
}

// Cherche un volume Google : retourne { isbn13, coverUrl } (cover validée), sinon null pour cover
async function searchGoogle(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=fr&maxResults=10&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = await res.json()
  for (const item of json.items ?? []) {
    const info = item.volumeInfo
    const isbn13 = (info.industryIdentifiers ?? []).find(i => i.type === 'ISBN_13')?.identifier
    if (!isbn13) continue
    const link = pickImageLink(info)
    const coverUrl = link ? await validateCover(link) : null
    return { isbn13, coverUrl, foundTitle: info.title }
  }
  return null
}

async function main() {
  console.log(`${REPLACEMENTS.length} titres Slimani fictifs à remplacer\n`)
  let done = 0
  for (const r of REPLACEMENTS) {
    const q = `intitle:"${r.title}" inauthor:Slimani`
    let res = await searchGoogle(q)
    if (!res) res = await searchGoogle(r.search)

    if (!res) { console.log(`  ✗ ${r.fictiveIsbn} | ${r.title} → introuvable Google`); await wait(300); continue }

    // ISBN réel ; cover : Google validée sinon fallback Open Library par cet ISBN
    let coverUrl = res.coverUrl
    if (!coverUrl) coverUrl = await validateCover(`https://covers.openlibrary.org/b/isbn/${res.isbn13}-L.jpg`)

    const update = {
      title: r.title,
      isbn: res.isbn13,
      fictif: false,
      genre: r.genre,
      pages: r.pages,
      publicationDate: r.publicationDate,
      description: r.description,
    }
    if (coverUrl) update.cover_url = coverUrl

    const { error } = await supabase.from('livres').update(update).eq('isbn', r.fictiveIsbn)
    if (error) { console.error(`  ✗ ${r.fictiveIsbn} update: ${error.message}`); await wait(300); continue }

    console.log(`  ✓ ${r.fictiveIsbn} → ${res.isbn13} | ${r.title}${coverUrl ? '' : '  ⚠ SANS COVER VALIDE'}`)
    done++
    await wait(300)
  }
  console.log(`\n✓ ${done}/${REPLACEMENTS.length} remplacés`)
}

main()
