import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NuevaRecetaPage() {
  const supabase = await createClient()

  // Need ingredients list to populate select
  const { data: ingredientes, error } = await supabase.from('ingredientes').select('id, nombre, energia_kcal, costo_unitario, unidad_medida_costo').order('nombre')

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-md max-w-lg">
        <h2 className="text-lg font-bold">Error al cargar formulario</h2>
        <p className="text-sm">{error.message}</p>
        <p className="text-xs mt-2 italic text-red-600">Por favor, verifica que las migraciones de base de datos hayan sido aplicadas.</p>
      </div>
    )
  }

  // Due to server actions limitations with complex dynamic lists, 
  // typical SPAs use Client Components for this form. 
  // We'll wrap the form into a Client Component `<RecipeForm />` to handle dynamic rows.
  
  return (
    <div className="space-y-6 max-w-4xl">
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
      <RecipeForm ingredientesLista={ingredientes || []} />
    </div>
  )
}

// Inline the client component for now to simplify setup
// In a real prod environment we put it in components/forms/RecipeForm.tsx
import { RecipeForm } from '@/components/forms/RecipeForm'
