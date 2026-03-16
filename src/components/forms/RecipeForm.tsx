"use client"

import { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type IngredienteOpcion = { id: string; nombre: string; energia_kcal: number }

export function RecipeForm({ ingredientesLista }: { ingredientesLista: IngredienteOpcion[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorStr, setErrorStr] = useState("")

  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("")
  const [pesoFinal, setPesoFinal] = useState("100")
  const [porciones, setPorciones] = useState("1")
  
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{id: string, peso: string}[]>([])

  const addIngredient = () => {
    setIngredientesSeleccionados([...ingredientesSeleccionados, { id: "", peso: "0" }])
  }

  const updateIngredient = (index: number, field: 'id' | 'peso', value: string) => {
    const newItems = [...ingredientesSeleccionados]
    newItems[index][field] = value
    setIngredientesSeleccionados(newItems)
  }

  const removeIngredient = (index: number) => {
    setIngredientesSeleccionados(ingredientesSeleccionados.filter((_, i) => i !== index))
  }

  const pesoBrutoNum = ingredientesSeleccionados.reduce((acc, curr) => acc + (parseFloat(curr.peso) || 0), 0)
  const pesoFinalNum = parseFloat(pesoFinal) || 1
  const rendimiento = pesoFinalNum / (pesoBrutoNum || 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorStr("")

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("No authentitcated user")

      // 1. Insert Recipe
      const { data: recetaData, error: recetaError } = await supabase.from('recetas').insert({
        nombre,
        categoria,
        peso_bruto: pesoBrutoNum,
        peso_final: pesoFinalNum,
        factor_rendimiento: isNaN(rendimiento) ? 1.0 : parseFloat(rendimiento.toFixed(4)),
        porciones: parseInt(porciones),
        usuario_creador: userData.user.id
      }).select('id').single()

      if (recetaError) throw recetaError;

      // 2. Insert mapped ingredients
      const mapped = ingredientesSeleccionados
        .filter(item => item.id && item.peso && parseFloat(item.peso) > 0)
        .map((item, index) => ({
          receta_id: recetaData.id,
          ingrediente_id: item.id,
          peso_gramos: parseFloat(item.peso),
          orden: index
        }))

      if (mapped.length > 0) {
        const { error: mapError } = await supabase.from('receta_ingredientes').insert(mapped)
        if (mapError) throw mapError
      }

      router.push('/recetas')
      router.refresh()
    } catch (err: any) {
      setErrorStr(err.message || 'Error occurred while saving.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorStr && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{errorStr}</div>}
      
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-medium tracking-tight border-b pb-2">Datos Generales</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de la Receta</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej. Torta de Chocolate" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <input value={categoria} onChange={e => setCategoria(e.target.value)} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej. Repostería" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Peso Bruto Teórico (g)</label>
            <input disabled value={pesoBrutoNum.toFixed(2)} type="number" className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Peso Físico (Final) (g)</label>
            <input required value={pesoFinal} onChange={e => setPesoFinal(e.target.value)} type="number" min="1" step="0.1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nº Porciones Reales</label>
            <input required value={porciones} onChange={e => setPorciones(e.target.value)} type="number" min="1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-medium tracking-tight">Ingredientes</h3>
          <button type="button" onClick={addIngredient} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
            <Plus className="mr-1 h-4 w-4" /> Agregar Ingrediente
          </button>
        </div>

        {ingredientesSeleccionados.length === 0 ? (
          <div className="text-center p-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            No has agregado ingredientes.
          </div>
        ) : (
          <div className="space-y-3">
            {ingredientesSeleccionados.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <select 
                    value={item.id} 
                    onChange={e => updateIngredient(index, 'id', e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>Seleccione un ingrediente...</option>
                    {ingredientesLista.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      required 
                      value={item.peso} 
                      onChange={e => updateIngredient(index, 'peso', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-8" 
                      placeholder="Peso" 
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">g</span>
                  </div>
                </div>
                <button type="button" onClick={() => removeIngredient(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          disabled={loading}
          type="submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {loading ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> Guardar Receta</>}
        </button>
      </div>

    </form>
  )
}
