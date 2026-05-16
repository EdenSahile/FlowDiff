import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { MOCK_BOOKS } from '../src/data/mockBooks'

const supabaseUrl  = process.env.VITE_SUPABASE_URL
const supabaseKey  = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log(`Seeding ${MOCK_BOOKS.length} books…`)

  const rows = MOCK_BOOKS.map(b => ({
    id:              b.id,
    isbn:            b.isbn,
    title:           b.title,
    authors:         b.authors,
    publisher:       b.publisher,
    collection:      b.collection ?? null,
    universe:        b.universe,
    type:            b.type,
    price:           b.price,
    priceTTC:        b.priceTTC,
    format:          b.format,
    genre:           b.genre ?? null,
    language:        b.language ?? 'Français',
    pages:           b.pages ?? null,
    publicationDate: b.publicationDate,
    description:     b.description,
    programme:       b.programme ?? null,
    fictif:          b.fictif ?? false,
    statut:          b.statut ?? null,
    delaiReimp:      b.delaiReimp ?? null,
    topVente:        b.topVente ?? false,
    selection:       b.selection ?? false,
  }))

  const { error, count } = await supabase
    .from('livres')
    .upsert(rows, { onConflict: 'id', count: 'exact' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ ${count ?? rows.length} books upserted`)
}

main().catch(e => { console.error(e); process.exit(1) })
