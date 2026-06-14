import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const UA = { 'User-Agent': 'Mozilla/5.0' }
const DIR = 'public/covers'
const wait = (ms) => new Promise(r => setTimeout(r, ms))
const BAD_SIZES = new Set([1197, 9103])

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

// Télécharge + valide (octets réels), avec retry (OL rate-limite en rafale)
async function downloadValid(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) })
      if (!res.ok) { await wait(1200); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length <= 50) { await wait(1200); continue }       // rate-limit → retry
      if (BAD_SIZES.has(buf.length)) return null
      if (buf.length < 8000) return null
      if (imageSize(buf).w < 300) return null
      return buf
    } catch { await wait(1200) }
  }
  return null
}

async function main() {
  await mkdir(DIR, { recursive: true })
  const { data, error } = await supabase.from('livres').select('isbn, title, cover_url').order('title')
  if (error) { console.error(error.message); process.exit(1) }

  console.log(`${data.length} livres — téléchargement des couvertures vers ${DIR}/\n`)
  let ok = 0
  const failed = []

  for (const l of data) {
    if (!l.cover_url) { failed.push({ ...l, reason: 'cover_url NULL' }); continue }
    // déjà auto-hébergée ? on saute le téléchargement mais on garde l'URL locale
    if (l.cover_url.startsWith('/covers/')) { ok++; console.log(`  · ${l.isbn} déjà local`); continue }

    const buf = await downloadValid(l.cover_url)
    if (!buf) { console.log(`  ✗ ${l.isbn} | ${l.title} → téléchargement invalide`); failed.push({ ...l, reason: 'download' }); continue }

    await writeFile(`${DIR}/${l.isbn}.jpg`, buf)
    const localPath = `/covers/${l.isbn}.jpg`
    const { error: e } = await supabase.from('livres').update({ cover_url: localPath }).eq('isbn', l.isbn)
    if (e) { console.log(`  ✗ ${l.isbn} update: ${e.message}`); failed.push({ ...l, reason: 'update' }); continue }

    console.log(`  ✓ ${l.isbn} | ${l.title} → ${localPath} (${buf.length}o)`)
    ok++
    await wait(150)
  }

  console.log(`\n✓ ${ok}/${data.length} auto-hébergées`)
  if (failed.length) {
    console.log(`\nÉchecs (${failed.length}) — cover_url inchangée :`)
    failed.forEach(f => console.log(`  ${f.isbn} — ${f.title} (${f.reason})`))
  }
}

main()
