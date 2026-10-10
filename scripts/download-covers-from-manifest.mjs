/**
 * Télécharge les couvertures manquantes dans public/covers/{isbn}.jpg
 * à partir du manifeste local scripts/covers-found.json.
 *
 * Remplace download-covers.mjs, qui lisait les cover_url depuis Supabase :
 * le projet Supabase n'existe plus (son host ne résout plus), et l'app
 * retombe donc sur MOCK_BOOKS, dont les ISBN n'avaient aucune couverture.
 *
 * Usage : node scripts/download-covers-from-manifest.mjs
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const DIR = 'public/covers'
const MANIFEST = 'scripts/covers-found.json'
const UA = { 'User-Agent': 'Mozilla/5.0' }
const wait = ms => new Promise(r => setTimeout(r, ms))

// Images sentinelles renvoyées par Google/OL quand la couverture est absente.
const BAD_SIZES = new Set([1197, 9103])
const MIN_BYTES = 8000
const MIN_WIDTH = 300

function imageSize(buf) {
  if (buf.length < 24) return { w: 0, h: 0 }
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  let o = 2
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue }
    const m = buf[o + 1]
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) }
    }
    o += 2 + buf.readUInt16BE(o + 2)
  }
  return { w: 0, h: 0 }
}

async function downloadValid(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) })
      if (!res.ok) { await wait(1200); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length <= 50) { await wait(1200); continue }   // rate-limit → retry
      if (BAD_SIZES.has(buf.length)) return null
      if (buf.length < MIN_BYTES) return null
      if (imageSize(buf).w < MIN_WIDTH) return null
      return buf
    } catch { await wait(1200) }
  }
  return null
}

async function main() {
  await mkdir(DIR, { recursive: true })
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))

  const todo = manifest.filter(b => b.cover && !existsSync(`${DIR}/${b.isbn}.jpg`))
  const already = manifest.length - todo.length
  console.log(`${manifest.length} entrées dans ${MANIFEST} — ${already} déjà présentes, ${todo.length} à télécharger\n`)

  let ok = 0
  const failed = []

  for (const b of todo) {
    const buf = await downloadValid(b.cover)
    if (!buf) { console.log(`  ✗ ${b.isbn} | ${b.title.slice(0, 50)}`); failed.push(b); continue }

    await writeFile(`${DIR}/${b.isbn}.jpg`, buf)
    console.log(`  ✓ ${b.isbn} | ${b.title.slice(0, 50)} (${buf.length}o)`)
    ok++
    await wait(150)
  }

  console.log(`\n✓ ${ok}/${todo.length} téléchargées`)
  if (failed.length) {
    console.log(`\nÉchecs (${failed.length}) — ces titres gardent le placeholder :`)
    failed.forEach(f => console.log(`  ${f.isbn} — ${f.title.slice(0, 60)}`))
  }
}

main()
