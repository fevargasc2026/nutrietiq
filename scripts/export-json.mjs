/**
 * Exportar datos USDA a JSON para importación por SQL
 * Procesa TODOS los alimentos con datos nutricionales
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USDA_DIR = path.join(__dirname, '..', 'FoodData_Central_foundation_food_csv_2025-12-18')

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
  'peanut': 'maní', 'yogurt': 'yogur', 'cream': 'crema', 'soy': 'soya'
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

  if (name.includes('wheat') || name.includes('flour') || name.includes('pan') || name.includes('pasta') || name.includes('barley') || name.includes('avena')) {
    allergens.push('Gluten')
  }
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') || name.includes('cream') || name.includes('yogurt') || name.includes('lactose')) {
    allergens.push('Lácteos')
  }
  if (name.includes('egg') || name.includes('mayonnaise') || name.includes('mayonesa')) {
    allergens.push('Huevos')
  }
  if (name.includes('soy') || name.includes('soya') || name.includes('soja')) {
    allergens.push('Soya')
  }
  if (name.includes('peanut') || name.includes('almond') || name.includes('walnut') || name.includes('nuez') || name.includes('pistachio') || name.includes('cashew')) {
    allergens.push('Frutos secos')
  }
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') || name.includes('cod')) {
    allergens.push('Pescado')
  }
  if (name.includes('shellfish') || name.includes('shrimp') || name.includes('crab') || name.includes('lobster')) {
    allergens.push('Crustáceos')
  }
  return allergens
}

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

  const rows = []
  for (let i = 1; i < lines.length; i++) {
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

// Cargar datos
console.log('Cargando archivos CSV...')
const foods = parseCSV(path.join(USDA_DIR, 'food.csv'))
const foodNutrients = parseCSV(path.join(USDA_DIR, 'food_nutrient.csv'))

console.log(`- ${foods.length} alimentos`)
console.log(`- ${foodNutrients.length} registros de nutrientes`)

// Agrupar nutrientes por fdc_id
const nutrientsByFood = {}
foodNutrients.forEach(fn => {
  const fdcId = fn.fdc_id
  if (!nutrientsByFood[fdcId]) {
    nutrientsByFood[fdcId] = {}
  }
  const nutrientId = parseInt(fn.nutrient_id)
  const amount = parseFloat(fn.amount) || 0
  nutrientsByFood[fdcId][nutrientId] = amount
})

console.log(`- ${Object.keys(nutrientsByFood).length} alimentos con nutrientes`)

// IDs de energía
const energiaIds = [1008, 208, 957, 958]

// Procesar alimentos que tienen nutrientes
const processedFoods = []
for (const food of foods) {
  const fdcId = food.fdc_id
  const foodNutrientsMap = nutrientsByFood[fdcId]

  if (!foodNutrientsMap) continue

  // Buscar energía
  let energia = 0
  for (const id of energiaIds) {
    if (foodNutrientsMap[id]) {
      energia = foodNutrientsMap[id]
      break
    }
  }

  // Solo incluir si tiene energía
  if (energia <= 0) continue

  processedFoods.push({
    fdc_id: parseInt(fdcId),
    description: food.description,
    data_type: food.data_type,
    description_es: translateToSpanish(food.description),
    energia_kcal: Math.round(energia * 10) / 10,
    proteina_g: Math.round((foodNutrientsMap[1003] || 0) * 10) / 10,
    grasa_total_g: Math.round((foodNutrientsMap[1004] || 0) * 10) / 10,
    grasa_saturada_g: Math.round((foodNutrientsMap[1258] || 0) * 10) / 10,
    carbohidratos_g: Math.round((foodNutrientsMap[1005] || 0) * 10) / 10,
    fibra_g: Math.round((foodNutrientsMap[1079] || 0) * 10) / 10,
    azucares_g: Math.round((foodNutrientsMap[2000] || 0) * 10) / 10,
    sodio_mg: Math.round((foodNutrientsMap[1093] || 0) * 10) / 10,
    alergenos: inferAllergens(food.description)
  })
}

console.log(`- ${processedFoods.length} alimentos con datos nutricionales`)

// Agrupar por tipo
const byType = {}
processedFoods.forEach(f => {
  const type = f.data_type || 'unknown'
  if (!byType[type]) byType[type] = 0
  byType[type]++
})
console.log('Distribución por tipo:', byType)

// Generar SQL
console.log('\nGenerando SQL...')
const sqlStatements = processedFoods.map(food => {
  const alergenosStr = food.alergenos.length > 0
    ? `ARRAY['${food.alergenos.join("','")}']`
    : 'ARRAY[]::text[]'

  return `(${food.fdc_id}, '${food.description.replace(/'/g, "''")}', '${food.description_es ? food.description_es.replace(/'/g, "''") : ''}', '${food.data_type}', '${food.data_type}', ${food.energia_kcal}, ${food.proteina_g}, ${food.grasa_total_g}, ${food.grasa_saturada_g}, ${food.carbohidratos_g}, ${food.fibra_g}, ${food.azucares_g}, ${food.sodio_mg}, ${alergenosStr})`
})

// Dividir en batches de 100
const batchSize = 100
const sqlBatches = []
for (let i = 0; i < sqlStatements.length; i += batchSize) {
  sqlBatches.push(sqlStatements.slice(i, i + batchSize).join(',\n'))
}

// Generar archivo SQL
let sql = `-- Datos de alimentos USDA Foundation Foods (diciembre 2025)\n`
sql += `-- Generado automáticamente - ${processedFoods.length} alimentos\n\n`

sqlBatches.forEach((batch, index) => {
  sql += `-- Batch ${index + 1}\n`
  sql += `INSERT INTO usda_alimentos (fdc_id, description, description_es, data_type, category, energia_kcal, proteina_g, grasa_total_g, grasa_saturada_g, carbohidratos_g, fibra_g, azucares_g, sodio_mg, alergenos)\n`
  sql += `VALUES\n${batch}\n`
  sql += `ON CONFLICT (fdc_id) DO UPDATE SET\n`
  sql += `  description = EXCLUDED.description,\n`
  sql += `  description_es = EXCLUDED.description_es,\n`
  sql += `  data_type = EXCLUDED.data_type,\n`
  sql += `  energia_kcal = EXCLUDED.energia_kcal,\n`
  sql += `  proteina_g = EXCLUDED.proteina_g,\n`
  sql += `  grasa_total_g = EXCLUDED.grasa_total_g,\n`
  sql += `  grasa_saturada_g = EXCLUDED.grasa_saturada_g,\n`
  sql += `  carbohidratos_g = EXCLUDED.carbohidratos_g,\n`
  sql += `  fibra_g = EXCLUDED.fibra_g,\n`
  sql += `  azucares_g = EXCLUDED.azucares_g,\n`
  sql += `  sodio_mg = EXCLUDED.sodio_mg,\n`
  sql += `  alergenos = EXCLUDED.alergenos;\n\n`
})

fs.writeFileSync(path.join(__dirname, '..', 'usda_import.sql'), sql)
console.log('SQL generado: usda_import.sql')
console.log(`Total de ${sqlStatements.length} alimentos en ${sqlBatches.length} batches`)