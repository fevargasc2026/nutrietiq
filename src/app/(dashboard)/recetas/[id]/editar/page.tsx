import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RecipeForm } from '@/components/forms/RecipeForm'
import { getEmpresaConfig } from '@/app/actions/configuracion'

export const dynamic = 'force-dynamic'

export default async function EditarRecetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch recipe
  const { data: receta, error: recipeError } = await supabase
    .from('recetas')
    .select('*')
    .eq('id', id)
    .single()

  // Fetch recipe ingredients
  const { data: recipeIngs } = await supabase
    .from('receta_ingredientes')
    .select('ingrediente_id, peso_gramos')
    .eq('receta_id', id)
    .order('orden')

  // Fetch all ingredients for the select
  const { data: ingredientes, error: ingsError } = await supabase
    .from('ingredientes')
    .select('id, nombre, energia_kcal, costo_unitario, unidad_medida_costo')
    .order('nombre')

  const configGlobal = await getEmpresaConfig()

  if (recipeError || ingsError || !receta) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl">
        <h2 className="text-lg font-bold">Error al cargar receta</h2>
        <p className="text-sm">{(recipeError || ingsError)?.message || 'Receta no encontrada'}</p>
        <Link href="/recetas" className="mt-4 inline-flex items-center text-sm font-medium hover:underline">
          <ArrowLeft className="mr-1 h-3 w-3" /> Volver
        </Link>
      </div>
    )
  }

  const mappedIngredients = (recipeIngs || []).map(ri => ({
    id: ri.ingrediente_id,
    peso_gramos: ri.peso_gramos
  }))

  return (
    <div className="space-y-6 max-w-7xl items-start">
      <div className="flex items-center gap-4">
        <Link href="/recetas" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Receta</h1>
          <p className="text-muted-foreground">Actualiza los parámetros de la formulación.</p>
        </div>
      </div>

      <RecipeForm 
        ingredientesLista={ingredientes} 
        initialData={receta}
        recetaIngredientes={mappedIngredients}
        bufferPct={configGlobal?.buffer_pct}
        markupFactor={configGlobal?.markup_factor}
        costoTransporte={configGlobal?.costo_transporte}
      />
    </div>
  )
}
