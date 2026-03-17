"use client"

import { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type IngredienteOpcion = { 
  id: string; 
  nombre: string; 
  energia_kcal: number;
  costo_unitario: number;
  unidad_medida_costo: string;
}

export function RecipeForm({ 
  ingredientesLista, 
  initialData, 
  recetaIngredientes = [] 
}: { 
  ingredientesLista: IngredienteOpcion[],
  initialData?: any,
  recetaIngredientes?: { id: string, peso_gramos: number }[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorStr, setErrorStr] = useState("")

  const [nombre, setNombre] = useState(initialData?.nombre || "")
  const [categoria, setCategoria] = useState(initialData?.categoria || "")
  const [pesoFinal, setPesoFinal] = useState(initialData?.peso_final?.toString() || "100")
  const [porciones, setPorciones] = useState(initialData?.porciones?.toString() || "1")
  
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{id: string, peso: string}[]>(
    recetaIngredientes.length > 0 
      ? recetaIngredientes.map(ri => ({ id: ri.id, peso: ri.peso_gramos.toString() }))
      : []
  )

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
  const porcionesNum = parseInt(porciones) || 1
  const rendimiento = pesoFinalNum / (pesoBrutoNum || 1)

  // Cost calculation logic
  const calculateIngredientCost = (ingId: string, pesoGramos: string) => {
    const ing = ingredientesLista.find(i => i.id === ingId)
    if (!ing || !ing.costo_unitario) return 0
    const peso = parseFloat(pesoGramos) || 0
    
    // Si la unidad es kg o litro, el costo es por 1000 unidades (g o ml)
    if (ing.unidad_medida_costo === 'kg' || ing.unidad_medida_costo === 'litro') {
      return (peso * ing.costo_unitario) / 1000
    }
    // Si es por unidad, asumimos que el peso ingresado es la cantidad de unidades
    return peso * ing.costo_unitario
  }

  const costoTotalReceta = ingredientesSeleccionados.reduce((acc, curr) => {
    return acc + calculateIngredientCost(curr.id, curr.peso)
  }, 0)

  const costoPorPorcion = costoTotalReceta / porcionesNum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorStr("")

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("No authenticated user")

      const recipePayload = {
        nombre,
        categoria,
        peso_bruto: pesoBrutoNum,
        peso_final: pesoFinalNum,
        factor_rendimiento: isNaN(rendimiento) ? 1.0 : parseFloat(rendimiento.toFixed(4)),
        porciones: porcionesNum,
        usuario_creador: userData.user.id
      }

      let recipeId = initialData?.id

      if (recipeId) {
        // Mode: Edit
        const { error: updateError } = await supabase
          .from('recetas')
          .update(recipePayload)
          .eq('id', recipeId)

        if (updateError) throw updateError

        // Delete previous ingredients
        const { error: deleteError } = await supabase
          .from('receta_ingredientes')
          .delete()
          .eq('receta_id', recipeId)
        
        if (deleteError) throw deleteError
      } else {
        // Mode: Create
        const { data: recetaData, error: recetaError } = await supabase
          .from('recetas')
          .insert(recipePayload)
          .select('id')
          .single()

        if (recetaError) throw recetaError
        recipeId = recetaData.id
      }

      // 2. Insert mapped ingredients
      const mapped = ingredientesSeleccionados
        .filter(item => item.id && item.peso && parseFloat(item.peso) > 0)
        .map((item, index) => ({
          receta_id: recipeId,
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
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
            <div className="flex items-center gap-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="flex-1">Ingrediente</div>
              <div className="w-32">Peso (g / ud)</div>
              <div className="w-24 text-right">Costo</div>
              <div className="w-10"></div>
            </div>
            {ingredientesSeleccionados.map((item, index) => {
              const costoFila = calculateIngredientCost(item.id, item.peso)
              return (
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
                      <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                        {ingredientesLista.find(i => i.id === item.id)?.unidad_medida_costo === 'unidad' ? 'ud' : 'g'}
                      </span>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-medium text-green-600">
                    ${costoFila.toLocaleString('es-CL')}
                  </div>
                  <button type="button" onClick={() => removeIngredient(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary Footer bar pinned or at bottom */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 rounded-xl border bg-green-50/50 p-6 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Costo Total Receta</p>
            <p className="text-3xl font-black text-green-700">${costoTotalReceta.toLocaleString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Costo por Porción</p>
            <p className="text-xl font-bold text-green-700">${costoPorPorcion.toLocaleString('es-CL')}</p>
          </div>
        </div>

        <div className="flex items-center justify-end px-4">
          <button
            disabled={loading}
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 py-2 shadow-lg"
          >
            {loading ? 'Guardando...' : <><Save className="mr-3 h-5 w-5" /> Guardar Receta y Valorización</>}
          </button>
        </div>
      </div>

    </form>
  )
}
