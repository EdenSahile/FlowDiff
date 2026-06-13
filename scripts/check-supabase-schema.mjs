import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.from('livres').select('*').limit(2)

if (error) {
  console.error('Erreur:', error.message)
  process.exit(1)
}

if (!data || data.length === 0) {
  console.log('Table vide ou inaccessible')
  process.exit(0)
}

console.log('Colonnes présentes dans livres:')
console.log(Object.keys(data[0]).sort().join('\n'))
console.log('\n--- Exemple ligne 1 ---')
console.log(JSON.stringify(data[0], null, 2))
