import { NextResponse } from 'next/server'
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server'

interface SupabaseAuthClient {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string; email?: string } | null } | null; error: Error | null }>
  }
}

interface VerifyAuthResult {
  authenticated: boolean
  user: { id: string; email?: string } | null
}

async function verifyAuth(supabase: SupabaseAuthClient): Promise<VerifyAuthResult> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { authenticated: false, user: null }
  }
  return { authenticated: true, user }
}

// Diccionario de traducción español -> inglés técnico USDA
const translationMap: Record<string, string> = {
  'harina de trigo': 'wheat flour',
  'azúcar': 'sugar',
  'sal': 'salt',
  'aceite de oliva': 'olive oil',
  'mantequilla': 'butter',
  'leche': 'milk',
  'queso': 'cheese',
  'huevo': 'egg',
  'pollo': 'chicken',
  'carne de res': 'beef',
  'cerdo': 'pork',
  'pescado': 'fish',
  'arroz': 'rice',
  'pasta': 'pasta',
  'pan': 'bread',
  'vainilla': 'vanilla',
  'cacao': 'cocoa',
  'chocolate': 'chocolate',
  'almendra': 'almond',
  'avena': 'oats',
  'maíz': 'corn',
  'papa': 'potato',
  'zanahoria': 'carrot',
  'cebolla': 'onion',
  'ajo': 'garlic',
  'tomate': 'tomato',
  'plátano': 'banana',
  'manzana': 'apple',
  'naranja': 'orange',
  'palta': 'avocado',
  'lechuga': 'lettuce',
  'espinaca': 'spinach',
  'brócoli': 'broccoli',
  'seitán': 'seitan',
  'seitan': 'seitan'
}

// Función para traducir el nombre a inglés para mejor búsqueda en USDA
function translateToEnglish(name: string): string {
  const lowerName = name.toLowerCase()
  for (const [esp, eng] of Object.entries(translationMap)) {
    if (lowerName.includes(esp)) {
      return eng
    }
  }
  return name
}

// Inferencia de alérgenos por palabras clave (Regex robusto)
function inferAllergens(description: string): string[] {
  const desc = description.toLowerCase()
  const allergens: string[] = []

  const rules = [
    { key: 'Gluten', patterns: [/\bwheat\b/, /\bflour\b/, /\bbarley\b/, /\brye\b/, /\btrigo\b/, /\bharina\b/, /\bcebada\b/, /\bcenteno\b/, /\bseitan\b/, /\bseitán\b/] },
    { key: 'Lácteos', patterns: [/\bmilk\b/, /\bcheese\b/, /\bbutter\b/, /\byogurt\b/, /\blactose\b/, /\bleche\b/, /\bqueso\b/, /\bmantequilla\b/, /\byogur\b/, /\blactosa\b/] },
    { key: 'Huevos', patterns: [/\begg\b/, /\balbumin\b/, /\bhuevo\b/, /\balbumina\b/] },
    { key: 'Soya', patterns: [/\bsoy\b/, /\bsoya\b/, /\blecithin\b/] },
    { key: 'Frutos secos', patterns: [/\bnut\b/, /\balmond\b/, /\bwalnut\b/, /\bcashew\b/, /\bpistachio\b/, /\bpeanut\b/, /\bnuez\b/, /\balmendra\b/, /\bcastaña\b/, /\bmaní\b/] },
    { key: 'Pescado', patterns: [/\bfish\b/, /\bsalmon\b/, /\btuna\b/, /\bcod\b/, /\bpescado\b/, /\bsalmón\b/, /\batún\b/] },
    { key: 'Crustáceos', patterns: [/\bshrimp\b/, /\bcrab\b/, /\blobster\b/, /\bprawn\b/, /\bcamarón\b/, /\bcangrejo\b/, /\blagosta\b/] },
    { key: 'Sésamo', patterns: [/\bsesame\b/, /\bsésamo\b/, /\btahini\b/] }
  ]

  rules.forEach(rule => {
    if (rule.patterns.some(pattern => pattern.test(desc))) {
      allergens.push(rule.key)
    }
  })

  return allergens
}

// Generación de alérgenos por IA (DeepSeek)
async function callDeepSeekAI(description: string): Promise<string[] | null> {
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
            content: "Eres un experto en seguridad alimentaria. Tu tarea es identificar alérgenos en descripciones técnicas de alimentos (USDA). Responde ÚNICAMENTE con una lista JSON de alérgenos chilenos (Gluten, Lácteos, Huevos, Soya, Frutos secos, Pescado, Crustáceos, Sésamo). Si no hay, responde []. No incluyas explicaciones."
          },
          {
            role: "user",
            content: `Identifica alérgenos para: ${description}`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) return null
    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return Array.isArray(result.allergens) ? result.allergens : (result.alergenos || [])
  } catch (error) {
    console.error('Error calling DeepSeek API (Allergens):', error)
    return null
  }
}

interface AIFoodData {
  description: string
  description_es: string
  energia_kcal: number
  proteina_g: number
  grasa_total_g: number
  grasa_saturada_g: number
  carbohidratos_g: number
  fibra_g: number
  azucares_g: number
  sodio_mg: number
  alergenos: string[]
}

interface GenerateAIFoodResult {
  data: AIFoodData | null
  reason?: string
}

async function generateAIFoodSuggestion(ingredientName: string): Promise<GenerateAIFoodResult> {
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
    'broccoli': 'Brócoli',
    'tomatoes': 'Tomates',
    'tomato': 'Tomate',
    'canned': 'en conserva',
    'raw': 'crudo',
    'diced': 'en cubos',
    'ripe': 'maduro',
    'red': 'rojo',
    'grape': 'grape (uvas)',
    'carrot,': 'Zanahoria,',
  }

  // Ordenar por longitud de llave para reemplazar términos más específicos primero
  const sortedEng = Object.keys(reverseMap).sort((a, b) => b.length - a.length)

  for (const eng of sortedEng) {
    if (name.includes(eng)) {
      // Manejar plurales comunes en inglés
      const esp = reverseMap[eng]
      let replaced = name.replace(eng + 'es', esp + 's') // tomatoes -> tomates
      if (replaced === name) replaced = name.replace(eng + 's', esp + 's') // apples -> manzanas
      if (replaced === name) replaced = name.replace(eng, esp)
      return replaced.charAt(0).toUpperCase() + replaced.slice(1)
    }
  }
  return englishName.charAt(0).toUpperCase() + englishName.slice(1)
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Verificar autenticación
    const auth = await verifyAuth(supabase)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 1. Obtener de la base de referencia (USDA)
    const { data: usdaData, error: usdaError } = await supabase
      .from('usda_alimentos')
      .select('description_es, description')
      .order('description_es', { ascending: true })

    if (usdaError) throw usdaError

    // 2. Obtener de los ingredientes propios creados por el usuario
    const { data: userData, error: userError } = await supabase
      .from('ingredientes')
      .select('nombre')
      .order('nombre', { ascending: true })

    if (userError) {
      console.warn('Error fetching user ingredients (non-critical):', userError)
    }

    // Obtener nombres únicos y limpios
    const namesSet = new Set<string>()
    
    // Procesar USDA
    usdaData?.forEach(item => {
      if (item.description_es) {
        // Corrección de seguridad para evitar el error "Tomatees" si persiste en algún lado
        const clean = item.description_es.replace(/Tomatees/g, 'Tomates')
        namesSet.add(clean)
      } else if (item.description) {
        namesSet.add(translateToSpanish(item.description))
      }
    })

    // Procesar ingredientes de usuario
    userData?.forEach(item => {
      if (item.nombre) {
        namesSet.add(item.nombre.replace(/Tomatees/g, 'Tomates'))
      }
    })

    return NextResponse.json(
      Array.from(namesSet).sort((a, b) => a.localeCompare(b, 'es')),
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching ingredients list:', error)
    return NextResponse.json({ error: 'Error al obtener lista de ingredientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // Verificar autenticación
    const auth = await verifyAuth(supabase)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
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
    interface USDAAlimento {
      id?: string
      description: string
      description_es?: string
      energia_kcal?: number
      proteina_g?: number
      grasa_total_g?: number
      grasa_saturada_g?: number
      carbohidratos_g?: number
      fibra_g?: number
      azucares_g?: number
      sodio_mg?: number
      alergenos?: string[]
      data_type?: string
    }
    
    let foods: USDAAlimento[] | null = null
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

    // FALLBACK FINAL: Búsqueda aún más flexible antes de ir a IA para evitar duplicados
    if (!foods || foods.length === 0) {
      const query = ingredientName.length > 3 ? ingredientName.substring(0, 4) : ingredientName
      const { data: foodsFlexible } = await supabase
        .from('usda_alimentos')
        .select('*')
        .or(`description_es.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5)
      foods = foodsFlexible
    }

    let food: USDAAlimento | null = null
    let esGeneradoIA = false
    let reasonAI = ''

    // FALLBACK A IA SI NO SE ENCONTRÓ EN LA DB
    // Solo usuarios autenticados pueden usar IA (sin escritura a BD)
    if (!foods || foods.length === 0) {
      const { data: aiGeneratedFood, reason } = await generateAIFoodSuggestion(ingredientName)
      if (aiGeneratedFood) {
        // Limpiar objeto para asegurar que solo enviamos campos existentes en la DB
        // NO se guarda en BD - solo se usa en memoria para esta sesión
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
          data_type: 'AI_GENERATED'
        }

        food = cleanFood
        esGeneradoIA = true
        // Caching en memoria eliminado por seguridad - solo se usa la respuesta de IA directamente
      } else {
        reasonAI = reason || ''
      }
    } else {
      food = foods[0]
    }

    if (!food) {
      let errorMessage = `No se encontró información para "${ingredientName}".`
      if (reasonAI === 'AI_KEY_MISSING') errorMessage += ' (La clave de IA DeepSeek no está configurada)'
      else if (reasonAI === 'AI_API_ERROR_402') errorMessage += ' (Actualizar créditos de uso en DeepSeek)'
      else if (reasonAI.startsWith('AI_API_ERROR')) errorMessage += ` (Error servicio IA: ${reasonAI.split('_').pop()})`

      return NextResponse.json({ error: errorMessage }, { status: 404 })
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

    // Lógica de alérgenos y fuentes
    let alergenos = food.alergenos || []
    let origenAlergenos = 'Base de datos USDA'
    const shortId = food.id ? `[ID: ${String(food.id).slice(0, 8)}]` : ''
    
    // Identificar la fuente real de los datos
    if (food.data_type === 'AI_GENERATED') {
      origenAlergenos = `IA-Deepseek (Aprendido) ${shortId}`
    } else if (esGeneradoIA) {
      origenAlergenos = `IA-Deepseek ${shortId}`
    }

    // Si no hay alérgenos definidos, intentamos evaluarlos (solo análisis, sin escritura a BD)
    if (alergenos.length === 0) {
      const aiAlergenos = await callDeepSeekAI(food.description || englishSearch)
      if (aiAlergenos && aiAlergenos.length > 0) {
        alergenos = aiAlergenos
        origenAlergenos = food.data_type === 'AI_GENERATED' ? `IA-Deepseek ${shortId}` : `IA-Deepseek ${shortId}`
        // Eliminado: UPDATE a BD - solo análisis en memoria
      } else {
        alergenos = inferAllergens(food.description || englishSearch)
        origenAlergenos = `Análisis automático Nutrietiq ${shortId}`
      }
    } else {
      // Ajuste final de etiqueta si ya tiene alérgenos pero es de la base oficial
      if (food.data_type !== 'AI_GENERATED' && !esGeneradoIA) {
         origenAlergenos = `Base de datos USDA ${shortId}`
      }
    }

    const nombreSugeridoEs = food.description_es || translateToSpanish(food.description || englishSearch)

    const result = {
      informacion_general: {
        nombre_sugerido_es: nombreSugeridoEs,
        nombre_original_usda: food.description || englishSearch,
        alergenos_sugeridos: alergenos.length > 0 ? alergenos.join(', ') : '',
        origen_alergenos: origenAlergenos,
        db_id: food.id,
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