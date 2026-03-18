import { NextResponse } from 'next/server'

// API Key de USDA
const USDA_API_KEY = 'HVGo7uydDWzOYYGnar9Mdfa3jmWCssp1mXgp5kND'
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

// Diccionario de traducción español -> inglés técnico USDA
const translationMap: Record<string, string> = {
  'harina de trigo': 'wheat flour white all purpose',
  'harina': 'wheat flour',
  'azúcar': 'sugar',
  'azúcar blanca': 'sugar white',
  'azúcar rubia': 'brown sugar',
  'miel': 'honey',
  'sal': 'salt',
  'aceite de oliva': 'olive oil',
  'aceite vegetal': 'vegetable oil',
  'aceite': 'oil',
  'mantequilla': 'butter',
  'margarina': 'margarine',
  'leche': 'milk',
  'leche entera': 'milk whole',
  'leche descremada': 'milk skim',
  'crema': 'cream',
  'queso': 'cheese',
  'queso cheddar': 'cheese cheddar',
  'queso mozzarella': 'cheese mozzarella',
  'huevo': 'egg',
  'huevos': 'egg',
  'pollo': 'chicken',
  'carne': 'meat',
  'carne molida': 'ground beef',
  'cerdo': 'pork',
  'tocino': 'bacon',
  'jamón': 'ham',
  'pescado': 'fish',
  'salmon': 'salmon',
  'atún': 'tuna',
  'arroz': 'rice',
  'arroz blanco': 'rice white',
  'pasta': 'pasta',
  'fideos': 'pasta',
  'pan': 'bread',
  'pan blanco': 'bread white',
  'levadura': 'yeast',
  'polvo de hornear': 'baking powder',
  'bicarbonato': 'baking soda',
  'vainilla': 'vanilla',
  'canela': 'cinnamon',
  'cacao': 'cocoa',
  'chocolate': 'chocolate',
  'chocolate negro': 'chocolate dark',
  'nuez': 'walnut',
  'almendra': 'almond',
  'maní': 'peanut',
  'avena': 'oats',
  'maíz': 'corn',
  'trigo': 'wheat',
  'cebada': 'barley',
  'zanahoria': 'carrot',
  'cebolla': 'onion',
  'ajo': 'garlic',
  'tomate': 'tomato',
  'papa': 'potato',
  'papa blanca': 'potato white',
  'camote': 'sweet potato',
  'platano': 'banana',
  'manzana': 'apple',
  'naranja': 'orange',
  'limón': 'lemon',
  'uva': 'grape',
  'fresa': 'strawberry',
  'palta': 'avocado',
  'aguacate': 'avocado',
  'lechuga': 'lettuce',
  'espárrago': 'asparagus',
  'brócoli': 'broccoli',
  'espinaca': 'spinach',
  'ají': 'pepper',
  'pimiento': 'pepper',
  'pimentón': 'pepper',
  'champiñón': 'mushroom',
  'hongos': 'mushroom',
  'salsa de tomate': 'tomato sauce',
  'ketchup': 'ketchup',
  'mostaza': 'mustard',
  'mayonesa': 'mayonnaise',
  'vinagre': 'vinegar',
  'salsa de soja': 'soy sauce',
  'salsa bbq': 'barbecue sauce',
  'salsa': 'sauce',
  'consomé': 'broth',
  'caldo': 'broth',
  'concentrado de pollo': 'chicken broth',
  'gelatina': 'gelatin',
  'almidón': 'starch',
  'almidón de maíz': 'corn starch',
  'maicena': 'corn starch',
  'fibra': 'fiber',
  'proteína': 'protein',
  'suero de leche': 'whey protein',
  'leche en polvo': 'milk powder',
  'leche condensada': 'condensed milk',
  'crema de leche': 'heavy cream',
  'yogur': 'yogurt',
  'yogur natural': 'yogurt plain',
  'nata': 'heavy cream',
  'ricota': 'ricotta cheese',
  'cottage cheese': 'cottage cheese',
  'parmesano': 'parmesan cheese',
  'requesón': 'cottage cheese',
  'sémola': 'semolina',
  'grits': 'corn grits',
  'quinoa': 'quinoa',
  'lentajas': 'lentils',
  'lentejas': 'lentils',
  'garbanzos': 'chickpeas',
  'porotos': 'beans',
  'frijoles': 'beans',
  'poroto negro': 'black beans',
  'poroto rojo': 'red kidney beans',
  'soya': 'soy',
  'soya texturizada': 'textured vegetable protein',
  'tvp': 'textured vegetable protein',
}

// Mapeo de IDs de nutrientes USDA
const NUTRIENT_IDS = {
  energia: 1008,      // Energy (kcal)
  proteina: 1003,    // Protein
  grasaTotal: 1004,  // Total lipid (fat)
  grasaSaturada: 1258, // Fatty acids, total saturated
  carbohidratos: 1005, // Carbohydrate, by difference
  fibra: 1079,       // Fiber, total dietary
  azucares: 2000,    // Sugars, total
  sodio: 1093,       // Sodium, Na
}

// Inferir alérgenos basados en el nombre del ingrediente
function inferAllergens(ingredientName: string): string[] {
  const name = ingredientName.toLowerCase()
  const allergens: string[] = []

  if (name.includes('wheat') || name.includes('flour') || name.includes('trigo') || name.includes('harina') || name.includes('pan') || name.includes('pasta') || name.includes('cebada') || name.includes('avena')) {
    allergens.push('Gluten')
  }
  if (name.includes('milk') || name.includes('leche') || name.includes('cheese') || name.includes('queso') || name.includes('butter') || name.includes('mantequilla') || name.includes('yogur') || name.includes('cream') || name.includes('crema') || name.includes('lactosa')) {
    allergens.push('Lácteos')
  }
  if (name.includes('egg') || name.includes('huevo') || name.includes('mayonnaise') || name.includes('mayonesa')) {
    allergens.push('Huevos')
  }
  if (name.includes('soy') || name.includes('soya') || name.includes('soja')) {
    allergens.push('Soya')
  }
  if (name.includes('peanut') || name.includes('maní') || name.includes('cacahuate') || name.includes('almond') || name.includes('almendra') || name.includes('walnut') || name.includes('nuez') || name.includes('pistacho') || name.includes('cashew') || name.includes('nuez de la india')) {
    allergens.push('Frutos secos')
  }
  if (name.includes('fish') || name.includes('pescado') || name.includes('salmon') || name.includes('atún') || name.includes('tuna') || name.includes('salmón')) {
    allergens.push('Pescado')
  }
  if (name.includes('shellfish') || name.includes('crustacean') || name.includes('mariscos') || name.includes('camarón') || name.includes('shrimp') || name.includes('langosta') || name.includes('ostra') || name.includes('oyster')) {
    allergens.push('Crustáceos')
  }
  if (name.includes('sesame') || name.includes('sésamo')) {
    allergens.push('Sésamo')
  }

  return allergens
}

// Determinar si contiene azúcares añadidos
function hasAddedSugars(description: string, nutrients: any[]): boolean {
  const desc = description.toLowerCase()
  const addedSugarTerms = ['sugar', 'syrup', 'honey', 'fructose', 'glucose', 'dextrose', 'maltose', 'corn syrup', 'high fructose', 'cane sugar', 'refined sugar']

  for (const term of addedSugarTerms) {
    if (desc.includes(term)) return true
  }

  // También verificar si el nombre del ingrediente indica un endulzante
  const sweetenerNames = ['sugar', 'azúcar', 'miel', 'syrup', 'melaza', 'molasses', 'cane', 'stevia', 'aspartame', 'sucralose', 'saccharin']
  for (const term of sweetenerNames) {
    if (desc.includes(term)) return true
  }

  return false
}

// Determinar si contiene grasas saturadas añadidas
function hasAddedSaturatedFats(description: string): boolean {
  const desc = description.toLowerCase()

  // Productos procesados con grasas añadidas
  const processedFatTerms = ['hydrogenated', 'partially hydrogenated', 'margarine', 'shortening', 'lard', 'butter', 'cream', 'cocoa butter', 'palm oil', 'coconut oil', 'vegetable shortening']

  for (const term of processedFatTerms) {
    if (desc.includes(term)) return true
  }

  return false
}

// Traducir de español a inglés
function translateToEnglish(spanishName: string): string {
  const normalized = spanishName.toLowerCase().trim()

  // Buscar en el diccionario
  if (translationMap[normalized]) {
    return translationMap[normalized]
  }

  // Buscar palabras clave en el nombre
  for (const [esp, eng] of Object.entries(translationMap)) {
    if (normalized.includes(esp)) {
      return normalized.replace(esp, eng)
    }
  }

  // Si no hay traducción, devolver el nombre original limpio
  return spanishName.toLowerCase().trim()
}

// Traducir de inglés a español (para el nombre sugerido)
function translateToSpanish(englishName: string): string {
  const name = englishName.toLowerCase()

  // Mapeo inverso básico
  const reverseMap: Record<string, string> = {
    'wheat flour': 'Harina de trigo',
    'sugar': 'Azúcar',
    'honey': 'Miel',
    'salt': 'Sal',
    'olive oil': 'Aceite de oliva',
    'butter': 'Mantequilla',
    'milk': 'Leche',
    'cheese': 'Queso',
    'egg': 'Huevo',
    'chicken': 'Pollo',
    'beef': 'Carne de res',
    'pork': 'Cerdo',
    'fish': 'Pescado',
    'rice': 'Arroz',
    'pasta': 'Pasta',
    'bread': 'Pan',
    'vanilla': 'Vainilla',
    'cocoa': 'Cacao',
    'chocolate': 'Chocolate',
    'almond': 'Almendra',
    'oats': 'Avena',
    'corn': 'Maíz',
    'potato': 'Papa',
    'carrot': 'Zanahoria',
    'onion': 'Cebolla',
    'garlic': 'Ajo',
    'tomato': 'Tomate',
    'banana': 'Plátano',
    'apple': 'Manzana',
    'orange': 'Naranja',
    'avocado': 'Palta',
    'lettuce': 'Lechuga',
    'spinach': 'Espinaca',
    'broccoli': 'Brócoli',
  }

  for (const [eng, esp] of Object.entries(reverseMap)) {
    if (name.includes(eng)) {
      return name.replace(eng, esp)
    }
  }

  // Capitalizar primera letra
  return englishName.charAt(0).toUpperCase() + englishName.slice(1)
}

// Obtener valor de nutriente
function getNutrientValue(nutrients: any[], nutrientId: number): number | null {
  const nutrient = nutrients.find((n: any) => n.number === nutrientId)
  if (nutrient && nutrient.value) {
    return parseFloat(nutrient.value.toFixed(1))
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ingredientName = body.nombre as string

    if (!ingredientName || ingredientName.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del ingrediente es requerido' },
        { status: 400 }
      )
    }

    // 1. Traducir al inglés
    const englishSearch = translateToEnglish(ingredientName)

    // 2. Buscar en USDA
    const searchUrl = `${USDA_BASE_URL}/foods/search`
    const searchParams = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: englishSearch,
      format: 'abridged',
      pageSize: '10',
      sortBy: 'relevance',
    })

    const fullUrl = `${searchUrl}?${searchParams}`
    console.log('USDA Request URL:', fullUrl)

    const searchResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!searchResponse.ok) {
      throw new Error(`Error en la búsqueda USDA: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (!searchData.foods || searchData.foods.length === 0) {
      return NextResponse.json(
        { error: `No se encontró información nutricional para "${ingredientName}"` },
        { status: 404 }
      )
    }

    // Usar el primer resultado (más relevante)
    const food = searchData.foods[0]

    // Si el resultado no tiene nutrientes, intentar obtener el detalle
    let nutrients = food.foodNutrients || []

    if (nutrients.length === 0 && food.fdcId) {
      // Obtener detalle del alimento
      const detailUrl = `${USDA_BASE_URL}/food/${food.fdcId}`
      const detailParams = new URLSearchParams({
        api_key: USDA_API_KEY,
      })

      const detailResponse = await fetch(`${detailUrl}?${detailParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (detailResponse.ok) {
        const detailData = await detailResponse.json()
        nutrients = detailData.foodNutrients || []
      }
    }

    // 3. Extraer nutrientes
    const energia = getNutrientValue(nutrients, NUTRIENT_IDS.energia) ?? 0
    const proteina = getNutrientValue(nutrients, NUTRIENT_IDS.proteina) ?? 0
    const grasaTotal = getNutrientValue(nutrients, NUTRIENT_IDS.grasaTotal) ?? 0
    const grasaSaturada = getNutrientValue(nutrients, NUTRIENT_IDS.grasaSaturada) ?? 0
    const carbohidratos = getNutrientValue(nutrients, NUTRIENT_IDS.carbohidratos) ?? 0
    const fibra = getNutrientValue(nutrients, NUTRIENT_IDS.fibra) ?? 0
    const azucares = getNutrientValue(nutrients, NUTRIENT_IDS.azucares) ?? 0
    const sodio = getNutrientValue(nutrients, NUTRIENT_IDS.sodio) ?? 0

    // 4. Calcular carbohidratos disponibles (totales - fibra)
    let hidratosCarbono = carbohidratos
    if (fibra > 0 && carbohidratos > 50) {
      // Probablemente son carbohidratos totales, restar fibra
      hidratosCarbono = Math.max(0, carbohidratos - fibra)
    }

    // 5. Determinar parámetros ley de etiquetado
    const descripcion = food.description || ''
    const azucaresAñadidos = hasAddedSugars(descripcion, nutrients)
    const grasasSaturadasAñadidas = hasAddedSaturatedFats(descripcion)

    // 6. Inferir alérgenos
    const alergenos = inferAllergens(food.description || englishSearch)

    // 7. Nombre sugerido en español
    const nombreSugeridoEs = translateToSpanish(food.description || englishSearch)

    // Construir respuesta
    const result = {
      informacion_general: {
        nombre_sugerido_es: nombreSugeridoEs,
        nombre_original_usda: food.description || englishSearch,
        alergenos_sugeridos: alergenos.length > 0 ? alergenos.join(', ') : '',
      },
      composicion_nutricional: {
        energia_kcal: energia,
        proteinas_g: proteina,
        grasa_total_g: grasaTotal,
        grasa_saturada_g: grasaSaturada,
        hidratos_carbono_g: hidratosCarbono,
        azucares_totales_g: azucares,
        sodio_mg: sodio,
      },
      parametros_ley: {
        azucares_añadidos: azucaresAñadidos,
        grasas_saturadas_añadidas: grasasSaturadasAñadidas,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en USDA search:', error)
    return NextResponse.json(
      { error: 'Error al consultar la base de datos USDA' },
      { status: 500 }
    )
  }
}