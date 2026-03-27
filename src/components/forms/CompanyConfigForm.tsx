'use client'

import { useState } from 'react'
import { Save, Building2, CreditCard, MapPin, FileCheck, Calendar, Settings } from 'lucide-react'
import { updateEmpresaConfig } from '@/app/actions/configuracion'

interface CompanyConfigFormProps {
  initialData: {
    empresa: string
    rut: string
    direccion: string
    resolucion: string
    fecha_res: string
    buffer_pct: number
    markup_factor: number
    costo_transporte: number
    userRole: string
  } | null
}

export function CompanyConfigForm({ initialData }: CompanyConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isSuperUsuario = initialData?.userRole === 'SuperUsuario'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateEmpresaConfig(formData)
      setSuccess(true)
    } catch (err) {
      const error = err as Error;
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!initialData) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No se encontró información de la empresa.</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
          Configuración actualizada con éxito.
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Parámetros de la Empresa
          </h3>
          <p className="text-sm text-muted-foreground">
            {isSuperUsuario 
              ? 'Actualiza los datos legales de la empresa que aparecerán en las etiquetas.' 
              : 'Información legal de la empresa (Solo lectura).'}
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Empresa (Nombre Fantasía o Razón Social)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  name="empresa"
                  required 
                  defaultValue={initialData.empresa}
                  disabled={!isSuperUsuario}
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                  placeholder="Ej. Mi Empresa Ltda." 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                RUT
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  name="rut"
                  required 
                  defaultValue={initialData.rut}
                  disabled={!isSuperUsuario}
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                  placeholder="Ej. 76.123.456-7" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              Dirección
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input 
                name="direccion"
                required 
                defaultValue={initialData.direccion}
                disabled={!isSuperUsuario}
                type="text" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                placeholder="Ej. Av. Principal 123, Ciudad" 
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Número de Resolución
              </label>
              <div className="relative">
                <FileCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  name="resolucion"
                  required 
                  defaultValue={initialData.resolucion}
                  disabled={!isSuperUsuario}
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                  placeholder="Ej. Res. 1234/2023" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Fecha de Resolución
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  name="fecha_res"
                  required 
                  defaultValue={initialData.fecha_res}
                  disabled={!isSuperUsuario}
                  type="date" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN: PREFERENCIAS DEL SISTEMA --- */}
        <div className="p-6 bg-muted/30 border-t">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            Preferencias del Sistema
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Buffer % (Costo Indirecto / Ajuste)
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full" title="Aplica a nuevas recetas al momento de editarlas o crearlas">?</span>
              </label>
              <div className="flex items-center gap-2">
                <input 
                  name="buffer_pct"
                  type="number" 
                  step="0.5" 
                  min="0"
                  required
                  defaultValue={initialData.buffer_pct}
                  disabled={!isSuperUsuario}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                />
                <span className="text-sm font-bold text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Factor Mark-up Global
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full" title="Aplica a nuevas recetas al momento de editarlas o crearlas">?</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">x</span>
                <input 
                  name="markup_factor"
                  type="number" 
                  step="0.1" 
                  min="1"
                  required
                  defaultValue={initialData.markup_factor}
                  disabled={!isSuperUsuario}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                Costo Transporte Fijo
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded-full" title="Costo fijo por despacho/transporte aplicado al final de la valorización">?</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">$</span>
                <input 
                  name="costo_transporte"
                  type="number" 
                  step="1" 
                  min="0"
                  required
                  defaultValue={initialData.costo_transporte || 0}
                  disabled={!isSuperUsuario}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-75 disabled:bg-muted" 
                  placeholder="Ej. 5000"
                />
              </div>
            </div>
          </div>
        </div>

        {isSuperUsuario && (
          <div className="px-6 py-4 bg-muted/30 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!isSuperUsuario && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
          <FileCheck className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-bold uppercase mb-1">Nota de Privilegios</p>
            <p>Solo el <strong>SuperUsuario</strong> tiene permisos para modificar estos parámetros. Si necesitas realizar cambios, contacta al administrador del sistema.</p>
          </div>
        </div>
      )}
    </form>
  )
}
