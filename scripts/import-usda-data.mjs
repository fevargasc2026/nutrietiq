/**
 * Script para importar datos de USDA FoodData Central a Supabase
 *
 * Instrucciones:
 * 1. Descargar datos de https://fdc.nal.usda.gov/data-guide.html
 *    - Descargar "Foundation Foods" en formato CSV
 * 2. Colocar el archivo CSV en la raíz del proyecto (ej: usda_foundation_foods.csv)
 * 3. Ejecutar: node scripts/import-usda-data.mjs
 *
 * El script espera un CSV con las columnas:
 * - fdcId
 * - description
 * - dataType
 * - energy (kcal)
 * - protein
 * - total lipid (fat)
 * - fatty acids, total saturated
 * - carbohydrate
 * - fiber
 * - sugars, total
 * - sodium
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxxxx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Error: Se requiere SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeo de columnas CSV a columnas de la tabla
const COLUMN_MAP = {
  'fdcId': 'fdc_id',
  'description': 'description',
  'dataType': 'data_type',
  'energy (kcal)': 'energia_kcal',
  'protein': 'proteina_g',
  'total lipid (fat)': 'grasa_total_g',
  'fatty acids, total saturated': 'grasa_saturada_g',
  'carbohydrate': 'carbohidratos_g',
  'fiber': 'fibra_g',
  'sugars, total': 'azucares_g',
  'sodium': 'sodio_mg'
}

// Traducciones básicas español-inglés para description_es
const basicTranslations = {
  'wheat': 'trigo',
  'flour': 'harina',
  'sugar': 'azúcar',
  'milk': 'leche',
  'cheese': 'queso',
  'butter': 'mantequilla',
  'egg': 'huevo',
  'chicken': 'pollo',
  'beef': 'carne',
  'pork': 'cerdo',
  'fish': 'pescado',
  'rice': 'arroz',
  'pasta': 'pasta',
  'bread': 'pan',
  'salt': 'sal',
  'oil': 'aceite',
  'olive': 'oliva',
  'vegetable': 'vegetal',
  'honey': 'miel',
  'cocoa': 'cacao',
  'chocolate': 'chocolate',
  'oats': 'avena',
  'corn': 'maíz',
  'potato': 'papa',
  'carrot': 'zanahoria',
  'onion': 'cebolla',
  'garlic': 'ajo',
  'tomato': 'tomate',
  'apple': 'manzana',
  'banana': 'plátano',
  'orange': 'naranja',
  'avocado': 'palta',
  'lettuce': 'lechuga',
  'spinach': 'espinaca',
  'broccoli': 'brócoli',
  'pepper': 'pimiento',
  'mushroom': 'champiñón',
  'garbanzo': 'garbanzo',
  'lenteja': 'lenteja',
  'quinoa': 'quinoa',
  'almond': 'almendra',
  'walnut': 'nuez',
  'peanut': 'maní',
  'yogurt': 'yogur',
  'cream': 'crema',
  'soy': 'soya'
}

function translateToSpanish(description) {
  let es = description.toLowerCase()
  for (const [eng, esp] of Object.entries(basicTranslations)) {
    es = es.replace(new RegExp(eng, 'gi'), esp)
  }
  // Capitalizar primera letra
  return es.charAt(0).toUpperCase() + es.slice(1)
}

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, index) => {
      let value = values[index]?.replace(/"/g, '').trim() || ''
      // Convertir a número si es un campo numérico
      const mappedCol = COLUMN_MAP[header]
      if (mappedCol && ['energia_kcal', 'proteina_g', 'grasa_total_g', 'grasa_saturada_g', 'carbohidratos_g', 'fibra_g', 'azucares_g', 'sodio_mg'].includes(mappedCol)) {
        value = parseFloat(value) || 0
      }
      row[mappedCol || header] = value
    })
    if (row.fdc_id) {
      rows.push(row)
    }
  }
  return rows
}

function inferAllergens(description) {
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

async function importData() {
  const csvFile = path.join(__dirname, '..', 'usda_foundation_foods.csv')

  if (!fs.existsSync(csvFile)) {
    console.error(`Error: No se encontró el archivo ${csvFile}`)
    console.log('Instrucciones:')
    console.log('1. Ir a https://fdc.nal.usda.gov/data-guide.html')
    console.log('2. Descargar "Foundation Foods" en formato CSV')
    console.log('3. Guardar como usda_foundation_foods.csv en la raíz del proyecto')
    console.log('4. Ejecutar: node scripts/import-usda-data.mjs')
    process.exit(1)
  }

  console.log('Leyendo archivo CSV...')
  const content = fs.readFileSync(csvFile, 'utf-8')
  const foods = parseCSV(content)

  console.log(`Procesando ${foods.length} alimentos...`)

  // Procesar en lotes
  const batchSize = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < foods.length; i += batchSize) {
    const batch = foods.slice(i, i + batchSize).map(food => ({
      fdc_id: food.fdc_id,
      description: food.description,
      description_es: translateToSpanish(food.description),
      data_type: food.data_type,
      category: 'Foundation',
      energia_kcal: food.energia_kcal || 0,
      proteina_g: food.proteina_g || 0,
      grasa_total_g: food.grasa_total_g || 0,
      grasa_saturada_g: food.grasa_saturada_g || 0,
      carbohidratos_g: food.carbohidratos_g || 0,
      fibra_g: food.fibra_g || 0,
      azucares_g: food.azucares_g || 0,
      sodio_mg: food.sodio_mg || 0,
      alergenos: inferAllergens(food.description)
    }))

    const { error } = await supabase
      .from('usda_alimentos')
      .upsert(batch, { onConflict: 'fdc_id' })

    if (error) {
      console.error('Error en lote:', error.message)
      errors += batch.length
    } else {
      imported += batch.length
    }

    console.log(`Procesados: ${Math.min(i + batchSize, foods.length)}/${foods.length}`)
  }

  console.log(`\nImportación completada: ${imported} alimentos`)
  if (errors > 0) {
    console.log(`Errores: ${errors}`)
  }
}

importData().catch(console.error)