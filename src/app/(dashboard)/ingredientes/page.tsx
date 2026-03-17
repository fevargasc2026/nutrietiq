import { createClient } from '@/utils/supabase/server'
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { DeleteIngredientButton } from '@/components/DeleteIngredientButton'
import { RefreshButton } from '@/components/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function IngredientesPage() {
  const supabase = await createClient()

  const { data: ingredientes, error } = await supabase
    .from('ingredientes')
    .select('*')
    .order('nombre')

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user?.id)
    .single()

  const isSuperUsuario = profile?.rol === 'SuperUsuario'

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl space-y-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Error al cargar ingredientes
        </h2>
        <p className="text-sm opacity-90">{error.message}</p>
        <p className="text-xs font-medium text-red-600 bg-red-100/50 p-2 rounded border border-red-200">
          Nota técnica: Verifique la conexión con Supabase y las políticas RLS.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ingredientes</h1>
          <p className="text-muted-foreground">Gestiona la base de datos de ingredientes y su información nutricional por 100g.</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton path="/ingredientes" />
          <Link 
            href="/ingredientes/nuevo"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Ingrediente
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center px-3 py-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full max-w-sm">
            <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <input 
              placeholder="Buscar ingrediente..." 
              className="flex h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" 
            />
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Energía (kcal)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Proteína (g)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Grasa Total (g)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">H. de C. (g)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Azúcares (g)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sodio (mg)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Costo</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {ingredientes?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm border-b">
                      No hay ingredientes registrados. Comienza creando el primero.
                    </td>
                  </tr>
                ) : (
                  ingredientes?.map((ing) => (
                    <tr key={ing.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{ing.nombre}</td>
                      <td className="p-4 align-middle">{ing.energia_kcal}</td>
                      <td className="p-4 align-middle">{ing.proteina_g}</td>
                      <td className="p-4 align-middle">{ing.grasa_total_g}</td>
                      <td className="p-4 align-middle">{ing.carbohidratos_g}</td>
                      <td className="p-4 align-middle">{ing.azucares_g}</td>
                      <td className="p-4 align-middle">{ing.sodio_mg}</td>
                      <td className="p-4 align-middle font-medium text-green-600 shrink-0 whitespace-nowrap">
                        ${ing.costo_unitario?.toLocaleString('es-CL')} / {ing.unidad_medida_costo}
                      </td>
                      <td className="p-4 align-middle">
                         <div className="flex items-center justify-center gap-2">
                            <Link 
                              href={`/ingredientes/${ing.id}/editar`} 
                              title="Editar ingrediente"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            {isSuperUsuario && (
                              <DeleteIngredientButton id={ing.id} ingredientName={ing.nombre} />
                            )}
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
