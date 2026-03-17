import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SimulationView } from '@/components/SimulationView'

export const dynamic = 'force-dynamic'

export default async function SimuladorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: receta, error } = await supabase
    .from('recetas')
    .select(`
      id, 
      nombre, 
      porciones, 
      peso_final,
      costo_indirecto_pct,
      markup_factor,
      receta_ingredientes (
        peso_gramos,
        ingredientes (
          id,
          nombre,
          costo_unitario,
          unidad_medida_costo
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !receta) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl space-y-2">
        <h2 className="text-lg font-bold">Receta no encontrada</h2>
        <p className="text-sm">ID Solicitado: {id}</p>
        {error && <p className="text-xs font-mono bg-red-100 p-2 rounded">{error.message}</p>}
        <Link href="/recetas" className="inline-flex items-center text-sm font-medium text-red-600 hover:underline">
          <ArrowLeft className="mr-1 h-3 w-3" /> Volver a Recetas
        </Link>
      </div>
    )
  }

  // Map ingredients for the view
  const ingredientesCosteo = receta.receta_ingredientes.map((ri: any) => ({
    nombre: ri.ingredientes.nombre,
    peso: ri.peso_gramos,
    costo_unitario: ri.ingredientes.costo_unitario,
    unidad: ri.ingredientes.unidad_medida_costo
  }))

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/recetas" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Simulador Nutricional</h1>
          <p className="text-muted-foreground">Evaluación de la receta: {receta.nombre}</p>
        </div>
      </div>

      <SimulationView 
        recetaId={receta.id} 
        recetaNombre={receta.nombre} 
        porciones={receta.porciones} 
        pesoFinal={receta.peso_final} 
        costoIndirectoPct={receta.costo_indirecto_pct}
        markupFactor={receta.markup_factor}
        ingredientesCosteo={ingredientesCosteo}
      />
    </div>
  )
}
