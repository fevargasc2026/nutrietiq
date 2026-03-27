import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { getEmpresaConfig } from '@/app/actions/configuracion'

export const dynamic = 'force-dynamic'

export default async function NuevaRecetaPage() {
  const supabase = await createClient()

  // Need ingredients list to populate select
  const { data: ingredientes, error } = await supabase.from('ingredientes').select('id, nombre, energia_kcal, costo_unitario, unidad_medida_costo').order('nombre')
  const configGlobal = await getEmpresaConfig()

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl space-y-2 max-w-lg">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Plus className="h-5 w-5 text-red-500" />
          Error al cargar información
        </h2>
        <p className="text-sm opacity-90">{error.message}</p>
        <p className="text-xs font-medium text-red-600 bg-red-100/50 p-2 rounded border border-red-200">
          Nota técnica: Asegúrese de que las migraciones de base de datos estén sincronizadas.
        </p>
      </div>
    )
  }

  // Due to server actions limitations with complex dynamic lists, 
  // typical SPAs use Client Components for this form. 
  // We'll wrap the form into a Client Component `<RecipeForm />` to handle dynamic rows.
  
  return (
    <div className="space-y-6 max-w-7xl items-start">
      <div className="flex items-center gap-4">
        <Link href="/recetas" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nueva Receta</h1>
          <p className="text-muted-foreground">Configura los parámetros y añade los ingredientes de la formulación.</p>
        </div>
      </div>
      
      {/* Client component import to handle dynamic lists */}
      <RecipeForm 
        ingredientesLista={ingredientes || []} 
        bufferPct={configGlobal?.buffer_pct}
        markupFactor={configGlobal?.markup_factor}
        costoTransporte={configGlobal?.costo_transporte}
      />
    </div>
  )
}

// Inline the client component for now to simplify setup
// In a real prod environment we put it in components/forms/RecipeForm.tsx
import { RecipeForm } from '@/components/forms/RecipeForm'
