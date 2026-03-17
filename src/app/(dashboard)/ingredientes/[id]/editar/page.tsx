import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { IngredientForm } from '@/components/forms/IngredientForm'

export const dynamic = 'force-dynamic'

export default async function EditarIngredientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ingrediente, error } = await supabase
    .from('ingredientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ingrediente) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl">
        <h2 className="text-lg font-bold">Error al cargar ingrediente</h2>
        <p className="text-sm">{error?.message || 'Ingrediente no encontrado'}</p>
        <Link href="/ingredientes" className="mt-4 inline-flex items-center text-sm font-medium hover:underline">
          <ArrowLeft className="mr-1 h-3 w-3" /> Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/ingredientes" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Ingrediente</h1>
          <p className="text-muted-foreground">Actualiza la información nutricional o el costo del ingrediente.</p>
        </div>
      </div>

      <IngredientForm initialData={ingrediente} />
    </div>
  )
}
