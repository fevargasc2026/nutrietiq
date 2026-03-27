import { createClient } from '@/utils/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { RefreshButton } from '@/components/RefreshButton'
import { RecipeList } from '@/components/RecipeList'

export const dynamic = 'force-dynamic'

interface RecipeWithUser {
  id: string;
  nombre: string;
  categoria: string | null;
  porciones: number;
  peso_final: number;
  fecha_creacion: string;
  usuarios: {
    nombre: string | null;
  } | null;
}

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

  const typedRecetas = (recetas || []) as unknown as RecipeWithUser[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Recetas</h1>
          <p className="text-muted-foreground">Administra las formulaciones y genera cálculos nutricionales.</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton path="/recetas" />
          <Link 
            href="/recetas/nueva"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Receta
          </Link>
        </div>
      </div>

      <RecipeList initialRecipes={typedRecetas} />
    </div>
  )
}
