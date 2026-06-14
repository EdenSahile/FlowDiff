import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('livres')
  .select('id, isbn, title, cover_url')
  .order('title')

if (error) { console.error(error.message); process.exit(1) }

console.log(`${data.length} livres au total\n`)

let nullCount = 0
let googleCount = 0
let otherCount = 0
const domains = {}

for (const l of data) {
  if (!l.cover_url) { nullCount++; continue }
  try {
    const d = new URL(l.cover_url).hostname
    domains[d] = (domains[d] || 0) + 1
  } catch { /* bad url */ }
  if (l.cover_url.includes('books.google')) googleCount++
  else otherCount++
}

console.log('Domaines des cover_url :')
for (const [d, n] of Object.entries(domains)) console.log(`  ${d}: ${n}`)
console.log(`\ncover_url NULL: ${nullCount}`)
console.log(`google: ${googleCount} | autres: ${otherCount}\n`)

// Tester réellement la taille des images (échantillon de tous)
console.log('Test taille réelle des images (Content-Length)...\n')
let tiny = 0, ok = 0, fail = 0
const tinyList = []
for (const l of data) {
  if (!l.cover_url) continue
  try {
    const res = await fetch(l.cover_url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const len = parseInt(res.headers.get('content-length') || '0', 10)
    const ct = res.headers.get('content-type') || ''
    if (!res.ok || !ct.startsWith('image')) { fail++; tinyList.push(`FAIL(${res.status},${ct}) ${l.title}`); continue }
    if (len > 0 && len < 3000) { tiny++; tinyList.push(`TINY(${len}o) ${l.title} — ${l.cover_url.slice(0,70)}`) }
    else ok++
  } catch (e) {
    fail++; tinyList.push(`ERR ${l.title} — ${e.message}`)
  }
}
console.log(`OK (>3ko): ${ok} | TINY (<3ko placeholder): ${tiny} | FAIL: ${fail}\n`)
console.log('Problématiques :')
tinyList.forEach(s => console.log('  ' + s))
