import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data } = await supabase.from('livres').select('id, isbn, title, cover_url').limit(5)

console.log('Exemple de lignes Supabase :')
for (const row of data) {
  console.log(`${row.id} | ${row.isbn} | cover_url: ${row.cover_url ? row.cover_url.slice(0, 60) + '...' : 'NULL'}`)
}

// Tester si une URL répond avec une image valide depuis Node
const testUrl = data.find(r => r.cover_url)?.cover_url
if (testUrl) {
  const res = await fetch(testUrl)
  console.log(`\nTest HTTP sur cover_url: status=${res.status} content-type=${res.headers.get('content-type')}`)
}
