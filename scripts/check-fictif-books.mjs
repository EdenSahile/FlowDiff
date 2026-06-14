import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('livres')
  .select('id, isbn, title, authors, type, universe, cover_url')
  .is('cover_url', null)
  .order('type')

if (error) { console.error(error.message); process.exit(1) }

console.log(`${data.length} livres sans couverture:\n`)
for (const l of data) {
  console.log(`[${l.type}] [${l.universe}] ${l.isbn} — ${l.title} (${l.authors?.[0] ?? '?'})`)
}
