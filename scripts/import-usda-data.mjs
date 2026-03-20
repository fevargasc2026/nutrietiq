/**
 * Script para importar datos de USDA FoodData Central a Supabase
 *
 * Este script procesa los archivos CSV de USDA y los importa a Supabase.
 * Los datos ya deben estar descargados en FoodData_Central_foundation_food_csv_2025-12-18/
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USDA_DIR = path.join(__dirname, '..', 'FoodData_Central_foundation_food_csv_2025-12-18')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxxxx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Error: Se requiere SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// IDs de nutrientes USDA que nos interesan
const NUTRIENT_IDS = {
  energia: [1008, 208],       // Energy, kcal
  proteina: 1003,             // Protein
  grasaTotal: 1004,           // Total lipid (fat)
  grasaSaturada: 1258,        // Fatty acids, total saturated
  carbohidratos: 1005,       // Carbohydrate, by difference
  fibra: 1079,                // Fiber, total dietary
  azucares: 2000,             // Sugars, total
  sodio: 1093                 // Sodium, Na
}

// Traducciones básicas español-inglés
const basicTranslations = {
  'wheat': 'trigo', 'flour': 'harina', 'sugar': 'azúcar', 'milk': 'leche',
  'cheese': 'queso', 'butter': 'mantequilla', 'egg': 'huevo', 'chicken': 'pollo',
  'beef': 'carne', 'pork': 'cerdo', 'fish': 'pescado', 'rice': 'arroz',
  'pasta': 'pasta', 'bread': 'pan', 'salt': 'sal', 'oil': 'aceite',
  'olive': 'oliva', 'vegetable': 'vegetal', 'honey': 'miel', 'cocoa': 'cacao',
  'chocolate': 'chocolate', 'oats': 'avena', 'corn': 'maíz', 'potato': 'papa',
  'carrot': 'zanahoria', 'onion': 'cebolla', 'garlic': 'ajo', 'tomato': 'tomate',
  'apple': 'manzana', 'banana': 'plátano', 'orange': 'naranja', 'avocado': 'palta',
  'lettuce': 'lechuga', 'spinach': 'espinaca', 'broccoli': 'brócoli',
  'pepper': 'pimiento', 'mushroom': 'champiñón', 'chickpea': 'garbanzo',
  'lentil': 'lenteja', 'quinoa': 'quinoa', 'almond': 'almendra', 'walnut': 'nuez',
  'peanut': 'maní', 'yogurt': 'yogur', 'cream': 'crema', 'soy': 'soya',
  'garbanzo': 'garbanzo', 'lenteja': 'lenteja', 'frijol': 'frijol'
}

function translateToSpanish(description) {
  if (!description) return null
  let es = description.toLowerCase()
  for (const [eng, esp] of Object.entries(basicTranslations)) {
    es = es.replace(new RegExp(eng, 'gi'), esp)
  }
  return es.charAt(0).toUpperCase() + es.slice(1)
}

function inferAllergens(description) {
  if (!description) return []
  const name = description.toLowerCase()
  const allergens = []

  if (name.includes('wheat') || name.includes('flour') || name.includes('pan') || name.includes('pasta')) {
    allergens.push('Gluten')
  }
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') || name.includes('cream') || name.includes('yogurt')) {
    allergens.push('Lácteos')
  }
  if (name.includes('egg')) {
    allergens.push('Huevos')
  }
  if (name.includes('soy')) {
    allergens.push('Soya')
  }
  if (name.includes('peanut') || name.includes('almond') || name.includes('walnut')) {
    allergens.push('Frutos secos')
  }
  if (name.includes('fish')) {
    allergens.push('Pescado')
  }

  return allergens
}

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  // Parse headers
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    // Handle CSV with quoted fields
    const values = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.replace(/"/g, '').trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.replace(/"/g, '').trim())

    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }
  return rows
}

async function importData() {
  console.log('Cargando archivos CSV de USDA...')

  if (!fs.existsSync(path.join(USDA_DIR, 'food.csv'))) {
    console.error(`Error: No se encontró el directorio ${USDA_DIR}`)
    console.log('Por favor descarga los datos de USDA primero.')
    process.exit(1)
  }

  // Cargar datos
  const foods = parseCSV(path.join(USDA_DIR, 'food.csv'))
  const nutrients = parseCSV(path.join(USDA_DIR, 'nutrient.csv'))
  const foodNutrients = parseCSV(path.join(USDA_DIR, 'food_nutrient.csv'))

  console.log(`- ${foods.length} alimentos`)
  console.log(`- ${nutrients.length} nutrientes`)
  console.log(`- ${foodNutrients.length} registros de nutrientes`)

  // Crear mapa de nutrientes por ID
  const nutrientMap = {}
  nutrients.forEach(n => {
    nutrientMap[n.id] = n.name
  })

  // Agrupar nutrientes por fdc_id
  const nutrientsByFood = {}
  foodNutrients.forEach(fn => {
    if (!nutrientsByFood[fn.fdc_id]) {
      nutrientsByFood[fn.fdc_id] = {}
    }
    const nutrientId = parseInt(fn.nutrient_id)
    const amount = parseFloat(fn.amount) || 0
    nutrientsByFood[fn.fdc_id][nutrientId] = amount
  })

  // Mapear IDs de energía
  const energiaIds = [1008, 208, 957, 958]

  // Procesar alimentos
  console.log('Procesando alimentos...')
  const processedFoods = foods.map(food => {
    const fdcId = parseInt(food.fdc_id)
    const foodNutrientsMap = nutrientsByFood[fdcId] || {}

    // Buscar energía
    let energia = 0
    for (const id of energiaIds) {
      if (foodNutrientsMap[id]) {
        energia = foodNutrientsMap[id]
        break
      }
    }

    return {
      fdc_id: fdcId,
      description: food.description,
      description_es: translateToSpanish(food.description),
      data_type: food.data_type,
      category: 'Foundation',
      energia_kcal: energia,
      proteina_g: foodNutrientsMap[1003] || 0,
      grasa_total_g: foodNutrientsMap[1004] || 0,
      grasa_saturada_g: foodNutrientsMap[1258] || 0,
      carbohidratos_g: foodNutrientsMap[1005] || 0,
      fibra_g: foodNutrientsMap[1079] || 0,
      azucares_g: foodNutrientsMap[2000] || 0,
      sodio_mg: foodNutrientsMap[1093] || 0,
      alergenos: inferAllergens(food.description)
    }
  }).filter(f => f.energia_kcal > 0) // Solo alimentos con energía

  console.log(`- ${processedFoods.length} alimentos con datos nutricionales`)

  // Importar en lotes
  const batchSize = 100
  let imported = 0
  let errors = 0

  console.log('Importando a Supabase...')

  for (let i = 0; i < processedFoods.length; i += batchSize) {
    const batch = processedFoods.slice(i, i + batchSize)

    const { error } = await supabase
      .from('usda_alimentos')
      .upsert(batch, { onConflict: 'fdc_id' })

    if (error) {
      console.error(`Error en lote ${i/batchSize + 1}:`, error.message)
      errors += batch.length
    } else {
      imported += batch.length
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= processedFoods.length) {
      console.log(`Procesados: ${Math.min(i + batchSize, processedFoods.length)}/${processedFoods.length}`)
    }
  }

  console.log(`\nImportación completada: ${imported} alimentos`)
  if (errors > 0) {
    console.log(`Errores: ${errors}`)
  }

  // Verificar
  const { count } = await supabase
    .from('usda_alimentos')
    .select('*', { count: 'exact', head: true })

  console.log(`Total en base de datos: ${count}`)
}

importData().catch(console.error)