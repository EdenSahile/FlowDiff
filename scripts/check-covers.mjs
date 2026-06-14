/**
 * Vérifie quels ISBN ont une couverture disponible sur Google Books.
 * Usage : node scripts/check-covers.mjs
 */

import fs from 'fs'

// Lit la clé API depuis .env
const envContent = fs.readFileSync('.env', 'utf-8')
const apiKeyMatch = envContent.match(/VITE_GOOGLE_BOOKS_API_KEY=(.+)/)
const API_KEY = apiKeyMatch?.[1]?.trim().replace(/['"]/g, '')
if (!API_KEY) { console.error('VITE_GOOGLE_BOOKS_API_KEY absent du .env'); process.exit(1) }

const BOOKS = [
  { isbn: '9782072994371', title: 'Houris' },
  { isbn: '9782221259146', title: 'Jacaranda' },
  { isbn: '9782226476265', title: 'La Fille sans visage' },
  { isbn: '9782820341181', title: "Frieren T.1" },
  { isbn: '9782344058640', title: 'Dandadan T.1' },
  { isbn: '9782344066645', title: 'Blue Box T.1' },
  { isbn: '9782017214922', title: 'Heartstopper T.5' },
  { isbn: '9782017212812', title: 'Good Omens' },
  { isbn: '9782412090282', title: 'Anti-Gaspi' },
  { isbn: '9782501172097', title: 'Guide Marabout bien-être' },
  { isbn: '9782072979958', title: 'Le Sillage de la baleine' },
  { isbn: '9782073087904', title: 'Un monde à part' },
  { isbn: '9782344078914', title: 'Jujutsu Kaisen T.27' },
  { isbn: '9782017249580', title: 'Heartstopper T.6' },
  { isbn: '9782501193382', title: 'Longévité' },
  { isbn: '9782330094058', title: 'Leurs enfants après eux' },
  { isbn: '9782246814436', title: 'La Tresse' },
  { isbn: '9782366120547', title: 'En attendant Bojangles' },
  { isbn: '9782330072131', title: "L'Ordre du jour" },
  { isbn: '9782081491083', title: 'Sérotonine' },
  { isbn: '9782234089472', title: 'Normal People' },
  { isbn: '9782226392336', title: "Changer l'eau des fleurs" },
  { isbn: '9782246821427', title: 'La Carte postale' },
  { isbn: '9782709664493', title: 'Les Gratitudes' },
  { isbn: '9782246819714', title: 'La Jeune Femme et la Nuit' },
  { isbn: '9782072886423', title: 'Le Pays des autres' },
  { isbn: '9782072972812', title: 'Regardez-nous danser' },
  { isbn: '9782072762512', title: 'Toutes les familles heureuses' },
  { isbn: '9782344003459', title: 'My Hero Academia T.2' },
  { isbn: '9782344005002', title: 'My Hero Academia T.3' },
  { isbn: '9782344006467', title: 'My Hero Academia T.4' },
  { isbn: '9782809491739', title: 'Demon Slayer T.1' },
  { isbn: '9782809494013', title: 'Demon Slayer T.2' },
  { isbn: '9782809494020', title: 'Demon Slayer T.3' },
  { isbn: '9782355858437', title: 'Jujutsu Kaisen T.1' },
  { isbn: '9782355858444', title: 'Jujutsu Kaisen T.2' },
  { isbn: '9782331024474', title: 'One-Punch Man T.1' },
  { isbn: '9782380711448', title: 'Spy x Family T.1' },
  { isbn: '9782380711455', title: 'Spy x Family T.2' },
  { isbn: '9782756093802', title: 'Vinland Saga T.1' },
  { isbn: '9782205074833', title: 'La Légèreté' },
  { isbn: '9782370733498', title: "L'Arabe du futur T.4" },
  { isbn: '9782370737700', title: "L'Arabe du futur T.5" },
  { isbn: '9782370739512', title: "L'Arabe du futur T.6" },
  { isbn: '9782370733047', title: "Les Cahiers d'Esther T.1" },
  { isbn: '9782370734785', title: "Les Cahiers d'Esther T.2" },
  { isbn: '9782070585113', title: 'Les Animaux fantastiques' },
  { isbn: '9782070665167', title: 'La Passe-Miroir T.3' },
  { isbn: '9782070665174', title: 'La Passe-Miroir T.4' },
  { isbn: '9782017136698', title: 'Heartstopper T.2' },
  { isbn: '9782017175902', title: 'Heartstopper T.3' },
  { isbn: '9782371023116', title: 'Six of Crows T.1' },
  { isbn: '9782371023123', title: 'Six of Crows T.2' },
  { isbn: '9782011355737', title: 'Grand Larousse de la cuisine' },
  { isbn: '9782019468422', title: 'Méthode Pilates complète' },
  { isbn: '9782501156509', title: 'Atomic Habits' },
  { isbn: '9782226393876', title: 'Homo Deus' },
  { isbn: '9782226439000', title: '21 leçons pour le XXIe siècle' },
  { isbn: '9782221218532', title: 'Factfulness' },
  { isbn: '9782072918513', title: 'Le Corps' },
  { isbn: '9782501123990', title: 'Ikigaï' },
  { isbn: '9782501155229', title: 'Une vie sur notre planète' },
]

async function checkCover(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&fields=items(volumeInfo/imageLinks)&maxResults=1&key=${API_KEY}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const links = data?.items?.[0]?.volumeInfo?.imageLinks
    return links?.large || links?.medium || links?.thumbnail || links?.smallThumbnail || null
  } catch {
    return null
  }
}

const wait = ms => new Promise(r => setTimeout(r, ms))

console.log(`\nVérification de ${BOOKS.length} ISBN via Google Books API...\n`)

const withCover = []
const withoutCover = []

for (const book of BOOKS) {
  const cover = await checkCover(book.isbn)
  const status = cover ? '✅' : '❌'
  console.log(`${status} ${book.isbn}  ${book.title}`)
  if (cover) withCover.push({ ...book, cover })
  else withoutCover.push(book)
  await wait(200) // évite le rate limiting
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`✅ Avec couverture  : ${withCover.length}`)
console.log(`❌ Sans couverture  : ${withoutCover.length}`)
console.log(`\nISBN sans couverture à remplacer :`)
withoutCover.forEach(b => console.log(`  • ${b.isbn}  ${b.title}`))
