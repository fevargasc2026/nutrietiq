import { createClient } from 'jsr:@supabase/supabase-js@2'

const roundRSAEnergy = (val: number) => Math.round(val);
const roundRSAMacro = (val: number) => Math.round(val * 10) / 10;
const roundRSASodium = (val: number) => Math.round(val / 5) * 5;

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), { status: 401 })
    }

    const { receta_id } = await req.json()
    if (!receta_id) {
      return new Response(JSON.stringify({ error: 'receta_id is required' }), { status: 400 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userErr || !user) {
      throw new Error(`Unauthorized: ${userErr?.message}`)
    }

    // Fetch Recipe
    const { data: receta, error: recetaErr } = await supabaseClient
      .from('recetas')
      .select('*')
      .eq('id', receta_id)
      .single()

    if (recetaErr || !receta) {
      throw new Error(`Recipe not found: ${recetaErr?.message}`)
    }

    // Fetch Recipe Ingredients with Ingredient Details
    const { data: recIngs, error: riErr } = await supabaseClient
      .from('receta_ingredientes')
      .select('*, ingredientes(*)')
      .eq('receta_id', receta_id)

    if (riErr || !recIngs) {
      throw new Error(`Error fetching ingredients: ${riErr?.message}`)
    }

    let sumEnergy = 0, sumProtein = 0, sumFat = 0, sumSatFat = 0, sumCarbs = 0, sumSugars = 0, sumSodium = 0;
    let hasAddedSugars = false;
    let hasAddedSatFats = false;
    const alergenos = new Set<string>();

    for (const item of recIngs) {
      const g = item.peso_gramos;
      const ing = item.ingredientes;
      if (!ing) continue;

      sumEnergy += (ing.energia_kcal * g) / 100;
      sumProtein += (ing.proteina_g * g) / 100;
      sumFat += (ing.grasa_total_g * g) / 100;
      sumSatFat += (ing.grasa_saturada_g * g) / 100;
      sumCarbs += (ing.carbohidratos_g * g) / 100;
      sumSugars += (ing.azucares_g * g) / 100;
      sumSodium += (ing.sodio_mg * g) / 100;

      if (ing.added_sugars) hasAddedSugars = true;
      if (ing.added_saturated_fats) hasAddedSatFats = true;

      if (ing.alergenos && Array.isArray(ing.alergenos)) {
        ing.alergenos.forEach((a: string) => alergenos.add(a));
      }
    }

    const finalWeight = receta.peso_final || 1; 

    // Calculate per 100g of final product
    const calc100g = (val: number) => (val / finalWeight) * 100;

    const e100g = roundRSAEnergy(calc100g(sumEnergy));
    const p100g = roundRSAMacro(calc100g(sumProtein));
    const f100g = roundRSAMacro(calc100g(sumFat));
    const sf100g = roundRSAMacro(calc100g(sumSatFat));
    const c100g = roundRSAMacro(calc100g(sumCarbs));
    const s100g = roundRSAMacro(calc100g(sumSugars));
    const na100g = roundRSASodium(calc100g(sumSodium));

    // Calculate per portion
    const porcionGramos = finalWeight / (receta.porciones || 1);
    const calcPorcion = (val100g: number) => (val100g * porcionGramos) / 100;

    const ePorcion = roundRSAEnergy(calcPorcion(e100g));
    const pPorcion = roundRSAMacro(calcPorcion(p100g));
    const fPorcion = roundRSAMacro(calcPorcion(f100g));
    const cPorcion = roundRSAMacro(calcPorcion(c100g));
    const sPorcion = roundRSAMacro(calcPorcion(s100g));
    const naPorcion = roundRSASodium(calcPorcion(na100g));

    // ALTO EN Rules (Sólidos)
    const selloCalorias = (e100g >= 275 && hasAddedSugars);
    const selloAzucar = (s100g >= 10 && hasAddedSugars);
    const selloGrasa = (sf100g >= 4 && hasAddedSatFats);
    const selloSodio = (na100g >= 400);

    // Save calculation
    const payload = {
      receta_id: receta_id,
      usuario_id: user.id,
      energia_100g: e100g,
      proteina_100g: p100g,
      grasa_total_100g: f100g,
      carbohidratos_100g: c100g,
      azucares_100g: s100g,
      sodio_100g: na100g,
      energia_porcion: ePorcion,
      proteina_porcion: pPorcion,
      grasa_porcion: fPorcion,
      carbohidratos_porcion: cPorcion,
      azucares_porcion: sPorcion,
      sodio_porcion: naPorcion,
      sello_calorias: selloCalorias,
      sello_sodio: selloSodio,
      sello_azucar: selloAzucar,
      sello_grasa: selloGrasa,
    };

    const { data: insertedValue, error: insertErr } = await supabaseClient
      .from('calculos_nutricionales')
      .insert(payload)
      .select()
      .single()

    if (insertErr) {
      throw new Error(`Error saving calculation: ${insertErr.message}`)
    }

    return new Response(JSON.stringify({ 
        success: true, 
        data: insertedValue, 
        alergenos: Array.from(alergenos) 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
