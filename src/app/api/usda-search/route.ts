import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
  'platano': 'banano',
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

// Traducir de español a inglés
function translateToEnglish(spanishName: string): string {
  const normalized = spanishName.toLowerCase().trim()
  if (translationMap[normalized]) {
    return translationMap[normalized]
  }
  for (const [esp, eng] of Object.entries(translationMap)) {
    if (normalized.includes(esp)) {
      return normalized.replace(esp, eng)
    }
  }
  return spanishName.toLowerCase().trim()
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
function hasAddedSugars(description: string): boolean {
  const desc = description.toLowerCase()
  const addedSugarTerms = ['sugar', 'syrup', 'honey', 'fructose', 'glucose', 'dextrose', 'maltose', 'corn syrup', 'high fructose', 'cane sugar', 'refined sugar', 'azúcar', 'miel', 'syrup', 'melaza', 'molasses', 'cane', 'stevia']
  return addedSugarTerms.some(term => desc.includes(term))
}

// Determinar si contiene grasas saturadas añadidas
function hasAddedSaturatedFats(description: string): boolean {
  const desc = description.toLowerCase()
  const processedFatTerms = ['hydrogenated', 'partially hydrogenated', 'margarine', 'shortening', 'lard', 'butter', 'cream', 'cocoa butter', 'palm oil', 'coconut oil', 'vegetable shortening']
  return processedFatTerms.some(term => desc.includes(term))
}

// Traducir de inglés a español (para el nombre sugerido)
function translateToSpanish(englishName: string): string {
  const name = englishName.toLowerCase()
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
  return englishName.charAt(0).toUpperCase() + englishName.slice(1)
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

    // 1. Traducir al inglés para búsqueda
    const englishSearch = translateToEnglish(ingredientName)

    // 2. Buscar en Supabase (tabla usda_alimentos)
    // Intentamos búsqueda por texto completo primero en español, luego en inglés
    let { data: foods, error } = await supabase
      .from('usda_alimentos')
      .select('*')
      .textSearch('description_es', ingredientName, { 
        config: 'spanish',
        type: 'phrase'
      })
      .limit(5)

    // Si no hay resultados exactos en español, probamos búsqueda amplia en español
    if (!foods || foods.length === 0) {
      const { data: foodsWide } = await supabase
        .from('usda_alimentos')
        .select('*')
        .textSearch('description_es', ingredientName.split(' ').join(' & '), { 
          config: 'spanish'
        })
        .limit(5)
      foods = foodsWide
    }

    // Si sigue sin haber resultados, probamos en inglés con la traducción
    if (!foods || foods.length === 0) {
      const { data: foodsEng } = await supabase
        .from('usda_alimentos')
        .select('*')
        .or(`description.ilike.%${englishSearch}%,description_es.ilike.%${ingredientName}%`)
        .limit(5)
      foods = foodsEng
    }

    if (error) {
      console.error('Error consultando Supabase:', error)
      throw new Error('Error de base de datos')
    }

    if (!foods || foods.length === 0) {
      return NextResponse.json(
        { error: `No se encontró información nutricional para "${ingredientName}" en la base de datos local.` },
        { status: 404 }
      )
    }

    // Usar el primer resultado
    const food = foods[0]

    // 3. Extraer nutrientes
    const energia = food.energia_kcal ?? 0
    const proteina = food.proteina_g ?? 0
    const grasaTotal = food.grasa_total_g ?? 0
    const grasaSaturada = food.grasa_saturada_g ?? 0
    const carbohidratos = food.carbohidratos_g ?? 0
    const fibra = food.fibra_g ?? 0
    const azucares = food.azucares_g ?? 0
    const sodio = food.sodio_mg ?? 0

    // 4. Calcular carbohidratos disponibles (totales - fibra)
    let hidratosCarbono = carbohidratos
    if (fibra > 0 && carbohidratos > 50) {
      hidratosCarbono = Math.max(0, carbohidratos - fibra)
    }

    // 5. Determinar parámetros ley de etiquetado
    const descripcion = food.description || ''
    const azucaresAñadidos = hasAddedSugars(descripcion)
    const grasasSaturadasAñadidas = hasAddedSaturatedFats(descripcion)

    // 6. Usar alérgenos de la tabla o inferir
    let alergenos = food.alergenos || []
    if (alergenos.length === 0) {
      alergenos = inferAllergens(food.description || englishSearch)
    }

    // 7. Nombre sugerido en español
    const nombreSugeridoEs = food.description_es || translateToSpanish(food.description || englishSearch)

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