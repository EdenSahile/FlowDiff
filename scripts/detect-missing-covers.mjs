import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('livres')
  .select('id, isbn, title, authors, cover_url')
  .order('title')

if (error) { console.error(error.message); process.exit(1) }

// Lit les dimensions réelles depuis l'en-tête JPEG/PNG
function imageSize(buf) {
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

const rows = []
for (const l of data) {
  if (!l.cover_url) { rows.push({ ...l, len: 0, w: 0, h: 0, status: 'NULL' }); continue }
  try {
    const res = await fetch(l.cover_url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const buf = Buffer.from(await res.arrayBuffer())
    const { w, h } = imageSize(buf)
    rows.push({ ...l, len: buf.length, w, h, status: res.status })
  } catch (e) {
    rows.push({ ...l, len: 0, w: 0, h: 0, status: 'ERR:' + e.message })
  }
}

// Détection placeholder : groupe par (len) identique → fichier réutilisé = "image not available"
const byLen = {}
for (const r of rows) byLen[r.len] = (byLen[r.len] || 0) + 1

const bad = rows.filter(r =>
  r.status === 'NULL' ||
  String(r.status).startsWith('ERR') ||
  r.len < 5000 ||           // trop petit pour une vraie couverture
  r.w < 120 ||              // largeur dérisoire
  byLen[r.len] > 1          // taille partagée par plusieurs livres = placeholder réutilisé
)

console.log(`${rows.length} livres analysés — ${bad.length} couverture(s) suspecte(s) :\n`)
for (const r of bad) {
  const reason = r.status === 'NULL' ? 'pas de cover_url'
    : String(r.status).startsWith('ERR') ? r.status
    : byLen[r.len] > 1 ? `taille partagée (${r.len}o, x${byLen[r.len]}) = placeholder`
    : `trop petite (${r.len}o, ${r.w}x${r.h})`
  console.log(`• ${r.isbn} — ${r.title} (${r.authors?.[0] ?? '?'}) → ${reason}`)
}
if (bad.length === 0) console.log('Aucune. Toutes les couvertures sont de vrais visuels.')
