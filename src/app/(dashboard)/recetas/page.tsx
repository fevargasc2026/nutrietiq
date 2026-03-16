import { createClient } from '@/utils/supabase/server'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RecetasPage() {
  const supabase = await createClient()

  const { data: recetas } = await supabase
    .from('recetas')
    .select(`
      id,
      nombre,
      categoria,
      porciones,
      peso_final,
      fecha_creacion,
      usuarios (nombre)
    `)
    .order('fecha_creacion', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Recetas</h1>
          <p className="text-muted-foreground">Administra las formulaciones y genera simulaciones nutricionales.</p>
        </div>
        <Link 
          href="/recetas/nueva"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva Receta
        </Link>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center px-3 py-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full max-w-sm">
            <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <input 
              placeholder="Buscar receta..." 
              className="flex h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoría</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Peso Final (g)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Porciones</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Creador</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {recetas?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm border-b">
                      No tienes recetas creadas aún. Crea la primera para empezar a simular etiquetas.
                    </td>
                  </tr>
                ) : (
                  recetas?.map((receta) => (
                    <tr key={receta.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{receta.nombre}</td>
                      <td className="p-4 align-middle">{receta.categoria || '-'}</td>
                      <td className="p-4 align-middle">{receta.peso_final}</td>
                      <td className="p-4 align-middle">{receta.porciones}</td>
                      <td className="p-4 align-middle">{(receta.usuarios as any)?.nombre || 'Desconocido'}</td>
                      <td className="p-4 align-middle">{new Date(receta.fecha_creacion).toLocaleDateString()}</td>
                      <td className="p-4 align-middle">
                         <div className="flex items-center justify-center gap-2">
                           <Link href={`/simulador/${receta.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-blue-600">
                             <Eye className="h-4 w-4" />
                           </Link>
                           <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                             <Edit2 className="h-4 w-4" />
                           </button>
                           <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
