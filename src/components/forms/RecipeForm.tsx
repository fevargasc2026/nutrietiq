"use client"

import { useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { forceRevalidate } from '@/app/actions'

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
  const [costoIndirectoPct, setCostoIndirectoPct] = useState(initialData?.costo_indirecto_pct?.toString() || "5")
  const [markupFactor, setMarkupFactor] = useState(initialData?.markup_factor?.toString() || "3.0")
  
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

  const indPct = parseFloat(costoIndirectoPct) || 0
  const factor = parseFloat(markupFactor) || 1
  
  const costoIndirecto = (costoTotalReceta * indPct) / 100
  const costoTotalReal = costoTotalReceta + costoIndirecto
  const precioSugerido = costoTotalReal * factor
  const margenContribucion = precioSugerido - costoTotalReceta

  const costoPorPorcion = costoTotalReceta / porcionesNum
  const precioPorPorcion = precioSugerido / porcionesNum

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
        costo_indirecto_pct: parseFloat(costoIndirectoPct) || 0,
        markup_factor: parseFloat(markupFactor) || 1,
        usuario_creador: userData.user.id
      }

      console.log("Saving recipe with payload:", recipePayload)

      let recipeId = initialData?.id

      if (recipeId) {
        // Mode: Edit
        const { error: updateError } = await supabase
          .from('recetas')
          .update(recipePayload)
          .eq('id', recipeId)

        if (updateError) {
          console.error("Update error:", updateError)
          throw updateError
        }

        // Delete previous ingredients
        const { error: deleteError } = await supabase
          .from('receta_ingredientes')
          .delete()
          .eq('receta_id', recipeId)
        
        if (deleteError) {
          console.error("Delete ingredients error:", deleteError)
          throw deleteError
        }
      } else {
        // Mode: Create
        const { data: recetaData, error: recetaError } = await supabase
          .from('recetas')
          .insert(recipePayload)
          .select('id')
          .single()

        if (recetaError) {
          console.error("Insert recipe error:", recetaError)
          throw recetaError
        }
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
        if (mapError) {
          console.error("Insert ingredients error:", mapError)
          throw mapError
        }
      }

      console.log("Recipe saved successfully. Revalidating and redirecting...")
      
      // Force revalidation on the server
      await forceRevalidate('/recetas')
      
      // Small delay to ensure DB propagation in some cases, though usually not needed
      router.push('/recetas')
      router.refresh()
    } catch (err: any) {
      console.error("Critical error in handleSubmit:", err)
      setErrorStr(err.message || 'Ocurrió un error al guardar la receta. Verifica que la base de datos esté actualizada.')
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
            <select 
              required
              value={categoria} 
              onChange={e => setCategoria(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="" disabled>Seleccione una categoría...</option>
              <option value="Acompañamientos / Guarniciones">Acompañamientos / Guarniciones</option>
              <option value="Aves">Aves</option>
              <option value="Bebidas y Jugos">Bebidas y Jugos</option>
              <option value="Carnes Rojas">Carnes Rojas</option>
              <option value="Ensaladas">Ensaladas</option>
              <option value="Entradas">Entradas</option>
              <option value="Entradas y Picoteos">Entradas y Picoteos</option>
              <option value="Legumbres y Guisos">Legumbres y Guisos</option>
              <option value="Menu Especial">Menu Especial</option>
              <option value="Menu Tematico">Menu Tematico</option>
              <option value="Panadería">Panadería</option>
              <option value="Pastas y Arroces">Pastas y Arroces</option>
              <option value="Pastelería y Repostería">Pastelería y Repostería</option>
              <option value="Pescados y Mariscos">Pescados y Mariscos</option>
              <option value="Plato de Fondo">Plato de Fondo</option>
              <option value="Plato de Menú">Plato de Menú</option>
              <option value="Platos Preparados">Platos Preparados</option>
              <option value="Postres">Postres</option>
              <option value="Salsas y Aderezos">Salsas y Aderezos</option>
              <option value="Sopas y Cremas">Sopas y Cremas</option>
              <option value="Vegetariano / Vegano">Vegetariano / Vegano</option>
            </select>
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

        {/* Professional Cost Factors */}
        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-dashed">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-1">
                % Costo Indirecto (Oculto)
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full" title="Condimentos, aceite de latas, merma técnica">?</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.5" 
                min="0"
                value={costoIndirectoPct} 
                onChange={e => setCostoIndirectoPct(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
              />
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between">
              <label className="text-sm font-medium flex items-center gap-1">
                Factor Mark-up
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full" title="Multiplicador para cubrir labor, gastos fijos y utilidad">?</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">x</span>
              <input 
                type="number" 
                step="0.1" 
                min="1"
                value={markupFactor} 
                onChange={e => setMarkupFactor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Yield Test Warning */}
        {rendimiento < 0.8 && pesoBrutoNum > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-amber-800 text-xs">
            <div className="p-1 bg-amber-200 rounded-full">!</div>
            <p>
              <strong>Alerta de Rendimiento:</strong> Esta receta tiene una merma del {((1 - rendimiento) * 100).toFixed(0)}%. 
              El costo real por porción es mayor al estimado teóricamente.
            </p>
          </div>
        )}
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
      <div className="flex flex-col gap-4">
        {/* Professional Valuation Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-background p-4 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Costo Receta</p>
            <p className="text-xl font-black text-foreground">${costoTotalReceta.toLocaleString('es-CL')}</p>
          </div>
          <div className="rounded-xl border bg-background p-4 shadow-sm border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Costo Real (+{costoIndirectoPct}%)</p>
            <p className="text-xl font-black text-foreground">${Math.round(costoTotalReal).toLocaleString('es-CL')}</p>
          </div>
          <div className="rounded-xl border bg-background p-4 shadow-sm border-l-4 border-l-green-600">
            <p className="text-[10px] font-bold text-green-700 uppercase">Precio Sugerido</p>
            <p className="text-xl font-black text-green-700">${Math.round(precioSugerido).toLocaleString('es-CL')}</p>
          </div>
          <div className="rounded-xl border bg-background p-4 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Margen Contrib.</p>
            <p className="text-xl font-black text-emerald-600">${Math.round(margenContribucion).toLocaleString('es-CL')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 rounded-xl border bg-green-50/50 p-6 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Precio Sugerido Venta</p>
              <p className="text-3xl font-black text-green-700">${Math.round(precioSugerido).toLocaleString('es-CL')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">P.V.P x Porción</p>
              <p className="text-xl font-bold text-foreground">${Math.round(precioPorPorcion).toLocaleString('es-CL')}</p>
            </div>
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
