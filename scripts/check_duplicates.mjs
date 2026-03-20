
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkIngrediente(nombre) {
  const { data, error, count } = await supabase
    .from('usda_alimentos')
    .select('*', { count: 'exact' })
    .or(`description_es.ilike.%${nombre}%,description.ilike.%${nombre}%`)

  if (error) {
    console.error(`Error buscando ${nombre}:`, error)
    return
  }

  console.log(`\nResultados para "${nombre}": ${count} registros encontrados.`)
  data.forEach(item => {
    console.log(`- ID: ${item.id}, Desc: ${item.description_es || item.description}, Data Type: ${item.data_type}`)
  })
}

async function run() {
  await checkIngrediente('Saitan')
  await checkIngrediente('Seitan')
  await checkIngrediente('Seitán')
}

run()
