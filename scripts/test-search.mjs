import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSearch(name) {
  console.log(`Testing search for: "${name}"`)
  
  // Logic from route.ts
  let { data: foods, error } = await supabase
    .from('usda_alimentos')
    .select('*')
    .textSearch('description_es', name, { 
      config: 'spanish',
      type: 'phrase'
    })
    .limit(5)

  if (!foods || foods.length === 0) {
    const { data: foodsWide } = await supabase
      .from('usda_alimentos')
      .select('*')
      .textSearch('description_es', name.split(' ').join(' & '), { 
        config: 'spanish'
      })
      .limit(5)
    foods = foodsWide
  }

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Found ${foods?.length || 0} results.`)
  if (foods?.length > 0) {
    console.log('First result:', foods[0].description, '/', foods[0].description_es)
  }
}

async function run() {
  await testSearch('harina')
  await testSearch('manzana')
  await testSearch('huevo')
}

run()
