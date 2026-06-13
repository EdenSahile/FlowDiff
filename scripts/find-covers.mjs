/**
 * Cherche des livres sur Google Books par titre+auteur et retourne
 * l'ISBN + URL couverture que Google Books connaît réellement.
 * Usage : node scripts/find-covers.mjs
 */

import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const apiKeyMatch = envContent.match(/VITE_GOOGLE_BOOKS_API_KEY=(.+)/)
const API_KEY = apiKeyMatch?.[1]?.trim().replace(/['"]/g, '')
if (!API_KEY) { console.error('VITE_GOOGLE_BOOKS_API_KEY absent du .env'); process.exit(1) }

// Livres à trouver — on cherche par titre+auteur, pas par ISBN
// Garder les mêmes univers/types que les mocks actuels
const TARGETS = [
  // ── Littérature ──────────────────────────────────────────────
  { query: 'Houris Kamel Daoud',                  universe: 'Littérature', type: 'nouveaute' },
  { query: 'Jacaranda Gaël Faye',                  universe: 'Littérature', type: 'nouveaute' },
  { query: 'Fille sans visage Amélie Nothomb',     universe: 'Littérature', type: 'nouveaute' },
  { query: 'Sillage baleine',                       universe: 'Littérature', type: 'a-paraitre' },
  { query: 'Leurs enfants après eux Nicolas Mathieu', universe: 'Littérature', type: 'fonds' },
  { query: 'La Tresse Laetitia Colombani',          universe: 'Littérature', type: 'fonds' },
  { query: 'En attendant Bojangles Olivier Bourdeaut', universe: 'Littérature', type: 'fonds' },
  { query: "L'Ordre du jour Eric Vuillard",         universe: 'Littérature', type: 'fonds' },
  { query: 'Sérotonine Houellebecq',                universe: 'Littérature', type: 'fonds' },
  { query: 'Normal People Sally Rooney',            universe: 'Littérature', type: 'fonds' },
  { query: "Changer l'eau des fleurs Valérie Perrin", universe: 'Littérature', type: 'fonds' },
  { query: 'La Carte postale Anne Berest',          universe: 'Littérature', type: 'fonds' },
  { query: 'Les Gratitudes Delphine de Vigan',      universe: 'Littérature', type: 'fonds' },
  { query: 'Le Pays des autres Leila Slimani',      universe: 'Littérature', type: 'fonds' },
  { query: 'Regardez-nous danser Leila Slimani',    universe: 'Littérature', type: 'fonds' },
  { query: 'Toutes les familles heureuses Hervé Le Tellier', universe: 'Littérature', type: 'fonds' },
  // ── BD / Mangas ──────────────────────────────────────────────
  { query: 'Frieren Requiem elfe Yamada',           universe: 'BD/Mangas', type: 'nouveaute' },
  { query: 'Dandadan Yukinobu Tatsu tome 1',        universe: 'BD/Mangas', type: 'nouveaute' },
  { query: 'Blue Box Kouji Miura tome 1',           universe: 'BD/Mangas', type: 'nouveaute' },
  { query: 'Jujutsu Kaisen tome 1 Gege Akutami',   universe: 'BD/Mangas', type: 'fonds' },
  { query: 'Jujutsu Kaisen tome 2',                 universe: 'BD/Mangas', type: 'fonds' },
  { query: 'My Hero Academia tome 1 Kohei Horikoshi', universe: 'BD/Mangas', type: 'fonds' },
  { query: 'My Hero Academia tome 2',               universe: 'BD/Mangas', type: 'fonds' },
  { query: 'Demon Slayer tome 1 Koyoharu Gotouge',  universe: 'BD/Mangas', type: 'fonds' },
  { query: 'Demon Slayer tome 2',                   universe: 'BD/Mangas', type: 'fonds' },
  { query: 'One-Punch Man tome 1 ONE',              universe: 'BD/Mangas', type: 'fonds' },
  { query: 'Spy x Family tome 1 Tatsuya Endo',      universe: 'BD/Mangas', type: 'fonds' },
  { query: 'Vinland Saga tome 1 Makoto Yukimura',   universe: 'BD/Mangas', type: 'fonds' },
  { query: "L'Arabe du futur tome 1 Riad Sattouf",  universe: 'BD/Mangas', type: 'fonds' },
  { query: "L'Arabe du futur tome 2",               universe: 'BD/Mangas', type: 'fonds' },
  { query: "Les Cahiers d'Esther tome 1 Riad Sattouf", universe: 'BD/Mangas', type: 'fonds' },
  // ── Jeunesse ─────────────────────────────────────────────────
  { query: 'Heartstopper tome 1 Alice Oseman',      universe: 'Jeunesse', type: 'fonds' },
  { query: 'Heartstopper tome 2',                   universe: 'Jeunesse', type: 'fonds' },
  { query: 'Heartstopper tome 3',                   universe: 'Jeunesse', type: 'fonds' },
  { query: 'La Passe-Miroir tome 1 Christelle Dabos', universe: 'Jeunesse', type: 'fonds' },
  { query: 'La Passe-Miroir tome 2 Les Disparus',   universe: 'Jeunesse', type: 'fonds' },
  { query: 'Six of Crows tome 1 Leigh Bardugo',     universe: 'Jeunesse', type: 'fonds' },
  { query: 'Les Animaux fantastiques J.K. Rowling', universe: 'Jeunesse', type: 'fonds' },
  // ── Adulte-pratique ──────────────────────────────────────────
  { query: 'Atomic Habits James Clear',             universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Homo Deus Yuval Noah Harari',           universe: 'Adulte-pratique', type: 'fonds' },
  { query: '21 leçons XXIe siècle Harari',          universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Factfulness Hans Rosling',              universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Ikigaï Francesc Miralles',              universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Une vie sur notre planète David Attenborough', universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Le Corps humain Bill Bryson',           universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Méthode Pilates complète',              universe: 'Adulte-pratique', type: 'fonds' },
  { query: 'Larousse cuisine',                      universe: 'Adulte-pratique', type: 'fonds' },
]

async function searchBook(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&fields=items(volumeInfo/title,volumeInfo/authors,volumeInfo/imageLinks,volumeInfo/industryIdentifiers)&maxResults=5&key=${API_KEY}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const items = data?.items ?? []
    // Prend le premier résultat qui a une couverture ET un ISBN-13
    for (const item of items) {
      const links = item.volumeInfo?.imageLinks
      const cover = links?.large || links?.medium || links?.thumbnail || links?.smallThumbnail
      if (!cover) continue
      const ids = item.volumeInfo?.industryIdentifiers ?? []
      const isbn13 = ids.find(i => i.type === 'ISBN_13')?.identifier
      if (!isbn13) continue
      return {
        isbn: isbn13,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors ?? [],
        cover: cover.replace('zoom=1', 'zoom=3').replace('http://', 'https://').replace('&edge=curl', ''),
      }
    }
    return null
  } catch {
    return null
  }
}

const wait = ms => new Promise(r => setTimeout(r, ms))

console.log(`\nRecherche de ${TARGETS.length} livres sur Google Books...\n`)

const results = []

for (const target of TARGETS) {
  const found = await searchBook(target.query)
  if (found) {
    console.log(`✅ "${found.title}" — ${found.isbn}`)
    results.push({ ...found, universe: target.universe, type: target.type, query: target.query })
  } else {
    console.log(`❌ Introuvable : ${target.query}`)
  }
  await wait(250)
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`✅ Trouvés avec couverture : ${results.length} / ${TARGETS.length}`)

// Génère un fichier JSON avec les résultats
fs.writeFileSync('scripts/covers-found.json', JSON.stringify(results, null, 2))
console.log(`\n→ Résultats sauvegardés dans scripts/covers-found.json`)
