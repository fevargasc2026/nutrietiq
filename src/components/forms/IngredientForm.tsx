"use client"

import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { forceRevalidate } from '@/app/actions'

export function IngredientForm({ 
  initialData 
}: { 
  initialData?: any 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorStr, setErrorStr] = useState("")

  const [nombre, setNombre] = useState(initialData?.nombre || "")
  const [alergenos, setAlergenos] = useState(initialData?.alergenos?.join(', ') || "")
  const [energia_kcal, setEnergia] = useState(initialData?.energia_kcal?.toString() || "0")
  const [proteina_g, setProteina] = useState(initialData?.proteina_g?.toString() || "0")
  const [grasa_total_g, setGrasa] = useState(initialData?.grasa_total_g?.toString() || "0")
  const [grasa_saturada_g, setGrasaSaturada] = useState(initialData?.grasa_saturada_g?.toString() || "0")
  const [carbohidratos_g, setCarbohidratos] = useState(initialData?.carbohidratos_g?.toString() || "0")
  const [azucares_g, setAzucares] = useState(initialData?.azucares_g?.toString() || "0")
  const [sodio_mg, setSodio] = useState(initialData?.sodio_mg?.toString() || "0")
  const [costo_unitario, setCosto] = useState(initialData?.costo_unitario?.toString() || "0")
  const [unidad_medida_costo, setUnidad] = useState(initialData?.unidad_medida_costo || "kg")
  const [added_sugars, setAddedSugars] = useState(initialData?.added_sugars || false)
  const [added_saturated_fats, setAddedSatFats] = useState(initialData?.added_saturated_fats || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorStr("")

    const payload = {
      nombre,
      energia_kcal: parseFloat(energia_kcal),
      proteina_g: parseFloat(proteina_g),
      grasa_total_g: parseFloat(grasa_total_g),
      grasa_saturada_g: parseFloat(grasa_saturada_g),
      carbohidratos_g: parseFloat(carbohidratos_g),
      azucares_g: parseFloat(azucares_g),
      sodio_mg: parseFloat(sodio_mg),
      added_sugars,
      added_saturated_fats,
      alergenos: alergenos ? alergenos.split(',').map((a: string) => a.trim()) : [],
      costo_unitario: parseFloat(costo_unitario),
      unidad_medida_costo
    }

    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('ingredientes')
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ingredientes')
          .insert(payload)
        if (error) throw error
      }

      await forceRevalidate('/ingredientes')
      router.push('/ingredientes')
      router.refresh()
    } catch (err: any) {
      setErrorStr(err.message || 'Error al guardar el ingrediente')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {errorStr && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm font-medium">
            {errorStr}
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium tracking-tight">Información General</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium leading-none">Nombre del Ingrediente</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} type="text" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. Harina de Trigo" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium leading-none">Alérgenos (separados por coma)</label>
              <input value={alergenos} onChange={e => setAlergenos(e.target.value)} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. Gluten, Leche, Soya" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium tracking-tight">Composición Nutricional (por 100g)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Energía (kcal)</label>
              <input value={energia_kcal} onChange={e => setEnergia(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Proteínas (g)</label>
              <input value={proteina_g} onChange={e => setProteina(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Grasa Total (g)</label>
              <input value={grasa_total_g} onChange={e => setGrasa(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Grasa Saturada (g)</label>
              <input value={grasa_saturada_g} onChange={e => setGrasaSaturada(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Hidratos de Carbono (g)</label>
              <input value={carbohidratos_g} onChange={e => setCarbohidratos(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Azúcares Totales (g)</label>
              <input value={azucares_g} onChange={e => setAzucares(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Sodio (mg)</label>
              <input value={sodio_mg} onChange={e => setSodio(e.target.value)} type="number" step="0.1" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium tracking-tight">Valorización de Costo</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Costo Unitario ($)</label>
              <input value={costo_unitario} onChange={e => setCosto(e.target.value)} type="number" step="0.01" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. 1500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Unidad de Medida del Costo</label>
              <select value={unidad_medida_costo} onChange={e => setUnidad(e.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
            <input type="checkbox" id="added_sugars" checked={added_sugars} onChange={e => setAddedSugars(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="added_sugars" className="text-sm font-medium leading-none cursor-pointer">
              Contiene Azúcares Añadidos
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="added_saturated_fats" checked={added_saturated_fats} onChange={e => setAddedSatFats(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="added_saturated_fats" className="text-sm font-medium leading-none cursor-pointer">
              Contiene Grasas Saturadas Añadidas
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            disabled={loading}
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Save className="mr-2 h-4 w-4" /> {loading ? 'Guardando...' : 'Guardar Ingrediente'}
          </button>
        </div>
      </form>
    </div>
  )
}
