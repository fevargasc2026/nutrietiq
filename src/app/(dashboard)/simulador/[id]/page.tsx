import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SimulationView } from '@/components/SimulationView'

export const dynamic = 'force-dynamic'

export default async function SimuladorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: receta } = await supabase
    .from('recetas')
    .select(`
      id, 
      nombre, 
      porciones, 
      peso_final,
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
    .eq('id', params.id)
    .single()

  if (!receta) {
    return <div>Receta no encontrada</div>
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
        ingredientesCosteo={ingredientesCosteo}
      />
    </div>
  )
}
