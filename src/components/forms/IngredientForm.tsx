"use client"

import { useState } from 'react'
import { Save, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { forceRevalidate } from '@/app/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IngredientForm({ 
  initialData 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingUSDA, setLoadingUSDA] = useState(false)
  const [errorStr, setErrorStr] = useState("")
  const [usdaMessage, setUsdaMessage] = useState("")
  const [systemMessage, setSystemMessage] = useState("")

  const [nombre, setNombre] = useState(initialData?.nombre || "")
  const [alergenos, setAlergenos] = useState(initialData?.alergenos?.join(', ') || "")
  const [alergenosSource, setAlergenosSource] = useState("")
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

  // Función para consultar USDA
  const handleUSDAQuery = async () => {
    if (!nombre || nombre.trim() === '') {
      setErrorStr("Por favor ingresa el nombre del ingrediente primero")
      return
    }

    setLoadingUSDA(true)
    setErrorStr("")
    setUsdaMessage("")
    setAlergenosSource("")

    try {
      const response = await fetch('/api/usda-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al consultar USDA')
      }

      // Llenar los campos automáticamente
      if (data.composicion_nutricional) {
        const nutrient = data.composicion_nutricional
        setEnergia(nutrient.energia_kcal?.toString() || "0")
        setProteina(nutrient.proteinas_g?.toString() || "0")
        setGrasa(nutrient.grasa_total_g?.toString() || "0")
        setGrasaSaturada(nutrient.grasa_saturada_g?.toString() || "0")
        setCarbohidratos(nutrient.hidratos_carbono_g?.toString() || "0")
        setAzucares(nutrient.azucares_totales_g?.toString() || "0")
        setSodio(nutrient.sodio_mg?.toString() || "0")
      }

      if (data.parametros_ley) {
        setAddedSugars(data.parametros_ley.azucares_añadidos || false)
        setAddedSatFats(data.parametros_ley.grasas_saturadas_añadidas || false)
      }

      const infoGeneral = data.informacion_general
      if (infoGeneral) {
        if (infoGeneral.alergenos_sugeridos) {
          setAlergenos(infoGeneral.alergenos_sugeridos)
        }
        if (infoGeneral.origen_alergenos) {
          setAlergenosSource(infoGeneral.origen_alergenos)
        }
        if (infoGeneral.mensaje_sistema) {
          setSystemMessage(infoGeneral.mensaje_sistema)
        } else {
          setSystemMessage("")
        }
      }

      setUsdaMessage(infoGeneral?.nombre_original_usda
        ? `Datos cargados desde referencia: ${infoGeneral.nombre_original_usda}`
        : 'Datos nutricionales cargados correctamente desde la base local')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al consultar la base de datos local'
      setErrorStr(message)
    } finally {
      setLoadingUSDA(false)
    }
  }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el ingrediente'
      setErrorStr(message)
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
              <div className="flex gap-2">
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  type="text"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Ej. Harina de Trigo"
                />
                <button
                  type="button"
                  onClick={handleUSDAQuery}
                  disabled={loadingUSDA}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 h-10 px-3 py-2"
                  title="Consultar Base de Datos USDA"
                >
                  {loadingUSDA ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">USDA</span>
                </button>
              </div>
              {usdaMessage && (
                <p className="text-xs text-green-600 mt-1">{usdaMessage}</p>
              )}
              {systemMessage && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-blue-700 font-bold">
                    {systemMessage}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium leading-none">Alérgenos (separados por coma)</label>
              <input value={alergenos} onChange={e => {setAlergenos(e.target.value); setAlergenosSource("");}} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Ej. Gluten, Leche, Soya" />
              {alergenosSource && (
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                  Fuente consulta: <span className="font-semibold ml-1">{alergenosSource}</span>
                </p>
              )}
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
