import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { IngredientForm } from '@/components/forms/IngredientForm'

export default function NuevoIngredientePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/ingredientes" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nuevo Ingrediente</h1>
          <p className="text-muted-foreground">Ingresa la información nutricional por cada 100 gramos del producto.</p>
        </div>
      </div>

      <IngredientForm />
    </div>
  )
}
