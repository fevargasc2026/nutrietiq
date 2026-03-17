import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NuevoIngredientePage() {
  const createIngrediente = async (formData: FormData) => {
    'use server'

    const supabase = await createClient()

    const nombre = formData.get('nombre') as string
    const energia_kcal = parseFloat(formData.get('energia_kcal') as string || '0')
    const proteina_g = parseFloat(formData.get('proteina_g') as string || '0')
    const grasa_total_g = parseFloat(formData.get('grasa_total_g') as string || '0')
    const grasa_saturada_g = parseFloat(formData.get('grasa_saturada_g') as string || '0')
    const carbohidratos_g = parseFloat(formData.get('carbohidratos_g') as string || '0')
    const azucares_g = parseFloat(formData.get('azucares_g') as string || '0')
    const sodio_mg = parseFloat(formData.get('sodio_mg') as string || '0')
    
    const costo_unitario = parseFloat(formData.get('costo_unitario') as string || '0')
    const unidad_medida_costo = formData.get('unidad_medida_costo') as string

    // Flags ALTO EN
    const added_sugars = formData.get('added_sugars') === 'on'
    const added_saturated_fats = formData.get('added_saturated_fats') === 'on'

    const alergenosRaw = formData.get('alergenos') as string
    const alergenos = alergenosRaw ? alergenosRaw.split(',').map(a => a.trim()) : []

    const { error } = await supabase.from('ingredientes').insert({
      nombre,
      energia_kcal,
      proteina_g,
      grasa_total_g,
      grasa_saturada_g,
      carbohidratos_g,
      azucares_g,
      sodio_mg,
      added_sugars,
      added_saturated_fats,
      alergenos,
      costo_unitario,
      unidad_medida_costo
    })

    if (error) {
      console.error(error)
      redirect('/ingredientes/nuevo?error=No se pudo guardar el ingrediente')
    }

    revalidatePath('/ingredientes')
    redirect('/ingredientes')
  }

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

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <form action={createIngrediente} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium tracking-tight">Información General</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 col-span-2">
                <label htmlFor="nombre" className="text-sm font-medium leading-none">Nombre del Ingrediente</label>
                <input id="nombre" name="nombre" type="text" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. Harina de Trigo" />
              </div>
              <div className="space-y-2 col-span-2">
                <label htmlFor="alergenos" className="text-sm font-medium leading-none">Alérgenos (separados por coma)</label>
                <input id="alergenos" name="alergenos" type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. Gluten, Leche, Soya" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium tracking-tight">Composición Nutricional (por 100g)</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="energia_kcal" className="text-sm font-medium leading-none">Energía (kcal)</label>
                <input id="energia_kcal" name="energia_kcal" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="proteina_g" className="text-sm font-medium leading-none">Proteínas (g)</label>
                <input id="proteina_g" name="proteina_g" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="grasa_total_g" className="text-sm font-medium leading-none">Grasa Total (g)</label>
                <input id="grasa_total_g" name="grasa_total_g" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="grasa_saturada_g" className="text-sm font-medium leading-none">Grasa Saturada (g)</label>
                <input id="grasa_saturada_g" name="grasa_saturada_g" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="carbohidratos_g" className="text-sm font-medium leading-none">Hidratos de Carbono (g)</label>
                <input id="carbohidratos_g" name="carbohidratos_g" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="azucares_g" className="text-sm font-medium leading-none">Azúcares Totales (g)</label>
                <input id="azucares_g" name="azucares_g" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-2">
                <label htmlFor="sodio_mg" className="text-sm font-medium leading-none">Sodio (mg)</label>
                <input id="sodio_mg" name="sodio_mg" type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium tracking-tight">Valorización de Costo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="costo_unitario" className="text-sm font-medium leading-none">Costo Unitario ($)</label>
                <input id="costo_unitario" name="costo_unitario" type="number" step="0.01" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. 1500" />
              </div>
              <div className="space-y-2">
                <label htmlFor="unidad_medida_costo" className="text-sm font-medium leading-none">Unidad de Medida del Costo</label>
                <select id="unidad_medida_costo" name="unidad_medida_costo" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="kg">Por Kilogramo (kg)</option>
                  <option value="litro">Por Litro (L)</option>
                  <option value="unidad">Por Unidad</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <h3 className="text-sm font-medium tracking-tight">Parámetros Ley de Etiquetado</h3>
            <p className="text-xs text-muted-foreground">Indica si este ingrediente aporta intrínsecamente azúcares o grasas saturadas añadidas al producto final según los criterios del MINSAL.</p>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="added_sugars" name="added_sugars" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="added_sugars" className="text-sm font-medium leading-none">
                Contiene Azúcares Añadidos
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="added_saturated_fats" name="added_saturated_fats" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="added_saturated_fats" className="text-sm font-medium leading-none">
                Contiene Grasas Saturadas Añadidas
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Save className="mr-2 h-4 w-4" /> Guardar Ingrediente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
