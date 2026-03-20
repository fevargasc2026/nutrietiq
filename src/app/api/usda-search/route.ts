import { NextResponse } from 'next/server'
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

// Helper para buscar palabras completas
const containsWord = (text: string, words: string[]) => {
  return words.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(text)
  })
}

// Inferir alérgenos basados en el nombre del ingrediente (Lógica local / Fallback)
function inferAllergens(ingredientName: string): string[] {
  const name = ingredientName.toLowerCase()
  const allergens: string[] = []

  if (containsWord(name, ['wheat', 'flour', 'trigo', 'harina', 'pan', 'pasta', 'cebada', 'avena', 'couscous', 'centeno', 'rye'])) {
    allergens.push('Gluten')
  }
  if (containsWord(name, ['milk', 'leche', 'cheese', 'queso', 'butter', 'mantequilla', 'yogur', 'cream', 'crema', 'lactosa', 'suero', 'whey', 'caseina'])) {
    allergens.push('Lácteos')
  }
  if (containsWord(name, ['egg', 'huevo', 'mayonnaise', 'mayonesa', 'albúmina'])) {
    allergens.push('Huevos')
  }
  if (containsWord(name, ['soy', 'soya', 'soja', 'lecytina', 'lecithin'])) {
    allergens.push('Soya')
  }
  if (containsWord(name, ['peanut', 'maní', 'cacahuate', 'almond', 'almendra', 'walnut', 'nuez', 'pistacho', 'cashew', 'avellana', 'hazelnut'])) {
    allergens.push('Frutos secos')
  }
  if (containsWord(name, ['fish', 'pescado', 'salmon', 'atún', 'tuna', 'salmón', 'merluza', 'bacalao'])) {
    allergens.push('Pescado')
  }
  if (containsWord(name, ['shellfish', 'crustacean', 'mariscos', 'camarón', 'shrimp', 'langosta', 'ostra', 'mejillón', 'mussel'])) {
    allergens.push('Crustáceos')
  }
  if (containsWord(name, ['sesame', 'sésamo', 'ajonjolí'])) {
    allergens.push('Sésamo')
  }

  return allergens
}

// Llamada a DeepSeek AI para evaluación inteligente de alérgenos (Modo experto)
async function callDeepSeekAI(ingredientName: string): Promise<string[] | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Eres un experto en seguridad alimentaria. Identifica alérgenos de esta lista exclusiva: Gluten, Lácteos, Huevos, Soya, Frutos secos, Pescado, Crustáceos, Sésamo. Responde ÚNICAMENTE un JSON: {\"alergenos\": []}"
          },
          {
            role: "user",
            content: `Ingrediente: ${ingredientName}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) return null
    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    return content.alergenos || []
  } catch (error) {
    console.error('Error calling DeepSeek API (Allergens):', error)
    return null
  }
}

// Generación COMPLETA de alimento por IA (Modo generativo / Fallback 404)
async function generateAIFoodSuggestion(ingredientName: string): Promise<{ data: any | null, reason?: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is missing')
    return { data: null, reason: 'AI_KEY_MISSING' }
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Eres un experto nutricionista. Tu tarea es proporcionar información nutricional ESTIMADA por cada 100g de un ingrediente. 
            Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
            {
              "description": "Nombre técnico en inglés",
              "description_es": "Nombre amigable en español",
              "energia_kcal": número,
              "proteina_g": número,
              "grasa_total_g": número,
              "grasa_saturada_g": número,
              "carbohidratos_g": número,
              "fibra_g": número,
              "azucares_g": número,
              "sodio_mg": número,
              "alergenos": ["Lista", "de", "Alérgenos", "MINSAL"]
            }
            Importante: Los alérgenos válidos son: Gluten, Lácteos, Huevos, Soya, Frutos secos, Pescado, Crustáceos, Sésamo.`
          },
          {
            role: "user",
            content: `Proporciona la información nutricional para: ${ingredientName}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      return { data: null, reason: `AI_API_ERROR_${response.status}` }
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return { data: result }
  } catch (error) {
    console.error('Error calling DeepSeek API (Generation):', error)
    return { data: null, reason: 'AI_EXCEPTION' }
  }
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
    'carrot,': 'Zanahoria,',
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
    let supabase = await createSupabaseServerClient()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                               process.env.SERVICE_ROLE_KEY || 
                               process.env.SUPABASE_SERVICE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
    }

    const body = await request.json()
    const ingredientName = body.nombre as string

    if (!ingredientName || ingredientName.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del ingrediente es requerido' },
        { status: 400 }
      )
    }

    const englishSearch = translateToEnglish(ingredientName)

    // BÚSQUEDA EN BASE DE DATOS LOCAL
    let foods: any[] | null = null
    const { data: foodsInitial } = await supabase
      .from('usda_alimentos')
      .select('*')
      .textSearch('description_es', ingredientName, { config: 'spanish', type: 'phrase' })
      .limit(5)
    
    foods = foodsInitial

    if (!foods || foods.length === 0) {
      const { data: foodsWide } = await supabase
        .from('usda_alimentos')
        .select('*')
        .textSearch('description_es', ingredientName.split(' ').join(' & '), { config: 'spanish' })
        .limit(5)
      foods = foodsWide
    }

    if (!foods || foods.length === 0) {
      const { data: foodsEng } = await supabase
        .from('usda_alimentos')
        .select('*')
        .or(`description.ilike.%${englishSearch}%,description_es.ilike.%${ingredientName}%`)
        .limit(5)
      foods = foodsEng
    }

    let food: any = null
    let esGeneradoIA = false
    let reasonAI = ''

    // FALLBACK A IA SI NO SE ENCONTRÓ EN LA DB
    if (!foods || foods.length === 0) {
      const { data: aiGeneratedFood, reason } = await generateAIFoodSuggestion(ingredientName)
      if (aiGeneratedFood) {
        // Limpiar objeto para asegurar que solo enviamos campos existentes en la DB
        const cleanFood = {
          description: aiGeneratedFood.description || englishSearch,
          description_es: aiGeneratedFood.description_es || ingredientName,
          energia_kcal: Number(aiGeneratedFood.energia_kcal) || 0,
          proteina_g: Number(aiGeneratedFood.proteina_g) || 0,
          grasa_total_g: Number(aiGeneratedFood.grasa_total_g) || 0,
          grasa_saturada_g: Number(aiGeneratedFood.grasa_saturada_g) || 0,
          carbohidratos_g: Number(aiGeneratedFood.carbohidratos_g) || 0,
          fibra_g: Number(aiGeneratedFood.fibra_g) || 0,
          azucares_g: Number(aiGeneratedFood.azucares_g) || 0,
          sodio_mg: Number(aiGeneratedFood.sodio_mg) || 0,
          alergenos: Array.isArray(aiGeneratedFood.alergenos) ? aiGeneratedFood.alergenos : [],
          data_type: 'AI_GENERATED',
          fdc_id: Math.floor(Date.now() / 1000) // Usar timestamp para evitar colisiones
        }

        food = cleanFood
        esGeneradoIA = true
        
        // CACHING: Insertar el nuevo alimento generado en la DB para el futuro
        try {
          const { data: insertedFood, error: insertError } = await supabase
            .from('usda_alimentos')
            .insert(cleanFood)
            .select()
            .single()
          
          if (insertError) {
            console.error('Error saving AI generated food to DB:', insertError)
            // Agregamos el error detallado a la respuesta para depuración (solo en desarrollo o temporalmente)
            reasonAI = `DB_SAVE_ERROR: ${insertError.message}`
          } else if (insertedFood) {
            food = insertedFood
            console.log('AI food cached successfully:', food.id)
          }
        } catch (e) {
          console.error('Exception during AI food caching:', e)
          reasonAI = 'DB_EXCEPTION'
        }
      } else {
        reasonAI = reason || ''
      }
    } else {
      food = foods[0]
    }

    if (!food) {
      let errorMessage = `No se encontró información para "${ingredientName}".`
      if (reasonAI === 'AI_KEY_MISSING') errorMessage += ' (La clave de IA DeepSeek no está configurada en el servidor)'
      else if (reasonAI === 'AI_API_ERROR_402') errorMessage += ' (Actualizar créditos de uso en DeepSeek)'
      else if (reasonAI.startsWith('AI_API_ERROR')) errorMessage += ` (Error de servicio IA: ${reasonAI.split('_').pop()})`
      else if (reasonAI === 'AI_EXCEPTION') errorMessage += ' (Error técnico al conectar con la IA)'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      )
    }

    // Procesar nutrientes
    const energia = food.energia_kcal ?? 0
    const proteina = food.proteina_g ?? 0
    const grasaTotal = food.grasa_total_g ?? 0
    const grasaSaturada = food.grasa_saturada_g ?? 0
    const carbohidratos = food.carbohidratos_g ?? 0
    const fibra = food.fibra_g ?? 0
    const azucares = food.azucares_g ?? 0
    const sodio = food.sodio_mg ?? 0

    const hidratosCarbono = (fibra > 0 && carbohidratos > 50) ? Math.max(0, carbohidratos - fibra) : carbohidratos

    const descripcion = food.description || ''
    const azucaresAñadidos = hasAddedSugars(descripcion)
    const grasasSaturadasAñadidas = hasAddedSaturatedFats(descripcion)

    // Lógica de alérgenos
    let alergenos = food.alergenos || []
    let origenAlergenos = 'Base de datos USDA'
    
    if (alergenos.length === 0) {
      if (esGeneradoIA) {
        origenAlergenos = 'IA-Deepseek'
      } else {
        const aiAlergenos = await callDeepSeekAI(food.description || englishSearch)
        if (aiAlergenos && aiAlergenos.length > 0) {
          alergenos = aiAlergenos
          origenAlergenos = 'IA-Deepseek'
          try {
            const { error: updateError } = await supabase
              .from('usda_alimentos')
              .update({ alergenos: aiAlergenos })
              .eq('id', food.id)
            
            if (updateError) {
              console.error('Error updating allergens cache:', updateError)
            }
          } catch (e) {
            console.error('Exception updating allergens cache:', e)
          }
        } else {
          alergenos = inferAllergens(food.description || englishSearch)
          origenAlergenos = 'Análisis automático Nutrietiq'
        }
      }
    } else {
      origenAlergenos = esGeneradoIA ? 'IA-Deepseek (Aprendido)' : 'Base de datos USDA (Aprendido)'
    }

    const nombreSugeridoEs = food.description_es || translateToSpanish(food.description || englishSearch)

    const result = {
      informacion_general: {
        nombre_sugerido_es: nombreSugeridoEs,
        nombre_original_usda: food.description || englishSearch,
        alergenos_sugeridos: alergenos.length > 0 ? alergenos.join(', ') : '',
        origen_alergenos: origenAlergenos,
        es_generado_ia: esGeneradoIA || food.data_type === 'AI_GENERATED'
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
    return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 })
  }
}