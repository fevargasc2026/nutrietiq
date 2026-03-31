"use client"

import { useState } from 'react'
import { Calculator, Download, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import html2pdf from 'html2pdf.js'

type Calculo = {
  energia_100g: number;
  proteina_100g: number;
  grasa_total_100g: number;
  carbohidratos_100g: number;
  azucares_100g: number;
  sodio_100g: number;
  energia_porcion: number;
  proteina_porcion: number;
  grasa_porcion: number;
  carbohidratos_porcion: number;
  azucares_porcion: number;
  sodio_porcion: number;
  sello_calorias: boolean;
  sello_sodio: boolean;
  sello_azucar: boolean;
  sello_grasa: boolean;
}

export function SimulationView({ 
  recetaId, 
  recetaNombre, 
  porciones, 
  pesoFinal,
  costoIndirectoPct = 5,
  markupFactor = 3.0,
  costoTransporte = 0,
  ingredientesCosteo = [],
  companyData = null
}: { 
  recetaId: string, 
  recetaNombre: string, 
  porciones: number, 
  pesoFinal: number,
  costoIndirectoPct?: number,
  markupFactor?: number,
  costoTransporte?: number,
  ingredientesCosteo?: { nombre: string, peso: number, costo_unitario: number, unidad: string }[],
  companyData?: { empresa: string, rut: string, direccion: string, resolucion: string, resolucion_sanitaria: string, fecha_res: string } | null
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Calculo | null>(null)
  const [alergenos, setAlergenos] = useState<string[]>([])
  const [errorStr, setErrorStr] = useState("")
  const supabase = createClient()

  const handleSimulate = async () => {
    setLoading(true)
    setErrorStr("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("No session found")

      // Call Local API instead of Edge Function
      const res = await fetch('/api/calculate-nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receta_id: recetaId })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error occurred')

      setData(json.data)
      setAlergenos(json.alergenos || [])
    } catch (err: any) {
      setErrorStr(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    const element = document.getElementById('etiqueta-print-area')
    if (!element) return
    const opt = {
      margin: 10,
      filename: `Reporte_Nutrietiq_${recetaNombre.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().from(element).set(opt).save()
  }

  const porcionGramos = (pesoFinal / porciones).toFixed(0)

  // Cost calculation
  const costoTotal = ingredientesCosteo.reduce((acc, ing) => {
    if (ing.unidad === 'kg' || ing.unidad === 'litro') {
      return acc + (ing.peso * ing.costo_unitario) / 1000
    }
    return acc + (ing.peso * ing.costo_unitario)
  }, 0)

  const costoIndirecto = (costoTotal * costoIndirectoPct) / 100
  const costoConBuffer = costoTotal + costoIndirecto
  const precioSugeridoConMarkup = costoConBuffer * markupFactor
  const precioTotalFinal = precioSugeridoConMarkup + costoTransporte
  
  const costoTotalFinal = precioTotalFinal
  const margenContribucion = costoTotalFinal - costoTotal
  
  const costoPorPorcion = costoTotal / porciones
  const precioPorPorcion = costoTotalFinal / porciones

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Simulation Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <Calculator className="h-12 w-12 text-primary opacity-80" />
          <div>
            <h3 className="text-lg font-medium tracking-tight">Calculadora</h3>
            <p className="text-sm text-muted-foreground mt-1">Calcula los aportes y genera la etiqueta en base a la Ley de Etiquetado.</p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {loading ? 'Calculando...' : 'Generar Etiqueta'}
          </button>
          {errorStr && <p className="text-sm text-red-600 font-medium">{errorStr}</p>}
        </div>

        {/* Professional Cost Summary Card */}
        <div className="rounded-xl border bg-green-50 border-green-100 p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-green-900 border-b border-green-200 pb-2">Gestión de Food Cost</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-green-700 uppercase">1. Costo Materias Primas:</span>
              <span className="text-lg font-black text-green-800">${Math.round(costoTotal).toLocaleString('es-CL')}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-green-600 italic">
              <span>2. (+ {costoIndirectoPct}%) Buffer:</span>
              <span>$ {Math.round(costoIndirecto).toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-green-600 italic">
              <span>3. (x {markupFactor}) Mark-Up:</span>
              <span>$ {Math.round(precioSugeridoConMarkup).toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-green-600 italic">
              <span>4. (+) Transporte:</span>
              <span>$ {Math.round(costoTransporte).toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between items-center border-t border-green-200 mt-2 pt-2">
              <span className="text-xs font-bold text-green-800 uppercase">COSTO TOTAL FINAL (3 + 4):</span>
              <span className="text-xl font-black text-green-900">$ {Math.round(precioTotalFinal).toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {data && (
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-medium tracking-tight border-b pb-2">Acciones</h3>
            <button 
              onClick={handleExportPDF}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <Download className="mr-2 h-4 w-4" /> Exportar Reporte PDF
            </button>
          </div>
        )}
      </div>

      {/* Render Area */}
      {data ? (
        <div className="lg:col-span-2 rounded-xl border bg-card p-8 shadow-sm flex flex-col items-center">
          
          <div id="etiqueta-print-area" className="w-full max-w-[450px] bg-white text-black p-6 border-2 border-black font-sans">
            
            <div className="text-center mb-4 border-b-2 border-black pb-2">
              <h1 className="text-xl font-black uppercase">Reporte Técnico Nutrietiq</h1>
              <p className="text-sm font-bold uppercase">{recetaNombre}</p>
            </div>

            {/* Sellos de Advertencia */}
            <div className="flex justify-center flex-wrap gap-2 mb-6">
              {data.sello_calorias && <SelloWarning label="CALORÍAS" />}
              {data.sello_azucar && <SelloWarning label="AZÚCARES" />}
              {data.sello_grasa && <SelloWarning label="GRASAS SATURADAS" />}
              {data.sello_sodio && <SelloWarning label="SODIO" />}
            </div>

            <div className="border-b-4 border-black pb-1 mb-2">
              <h2 className="text-2xl font-black uppercase text-center tracking-tighter">Información Nutricional</h2>
            </div>
            
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Porciones por envase:</span>
              <span>{porciones}</span>
            </div>
            <div className="flex justify-between text-sm font-medium mb-3">
              <span>Porción:</span>
              <span>1 {porcionGramos}g</span>
            </div>

            <table className="w-full text-sm font-medium border-collapse">
              <thead className="border-y-4 border-black">
                <tr>
                  <th className="py-1 text-left"></th>
                  <th className="py-1 text-right">100g</th>
                  <th className="py-1 text-right">1 Porción</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-black">
                <tr>
                  <td className="py-1">Energía (kcal)</td>
                  <td className="py-1 text-right">{data.energia_100g}</td>
                  <td className="py-1 text-right">{data.energia_porcion}</td>
                </tr>
                <tr>
                  <td className="py-1">Proteínas (g)</td>
                  <td className="py-1 text-right">{data.proteina_100g}</td>
                  <td className="py-1 text-right">{data.proteina_porcion}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Grasas Totales (g)</td>
                  <td className="py-1 text-right font-bold">{data.grasa_total_100g}</td>
                  <td className="py-1 text-right font-bold">{data.grasa_porcion}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">Hidratos de Carbono disp. (g)</td>
                  <td className="py-1 text-right font-bold">{data.carbohidratos_100g}</td>
                  <td className="py-1 text-right font-bold">{data.carbohidratos_porcion}</td>
                </tr>
                <tr>
                  <td className="py-1 pl-4 text-xs">Azúcares Totales (g)</td>
                  <td className="py-1 text-right text-xs">{data.azucares_100g}</td>
                  <td className="py-1 text-right text-xs">{data.azucares_porcion}</td>
                </tr>
                <tr>
                  <td className="py-1">Sodio (mg)</td>
                  <td className="py-1 text-right">{data.sodio_100g}</td>
                  <td className="py-1 text-right">{data.sodio_porcion}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-xs font-bold uppercase leading-tight border-b-2 border-black pb-4 mb-4">
              {alergenos.length > 0 ? (
                <span>CONTIENE: {alergenos.join(', ')}.</span>
              ) : (
                <span>NO CONTIENE ALÉRGENOS DECLARADOS.</span>
              )}
            </div>

            {/* Company Info on Label */}
            {companyData && companyData.empresa !== 'Sin Empresa' && (
              <div className="text-[10px] leading-tight space-y-0.5 border-t border-black pt-2 mb-4">
                <p className="font-black uppercase">{companyData.empresa}</p>
                <p>RUT: {companyData.rut}</p>
                <p>{companyData.direccion}</p>
                {companyData.resolucion_sanitaria && <p>{companyData.resolucion_sanitaria}</p>}
                <p>{companyData.resolucion} de fecha {new Date(companyData.fecha_res).toLocaleDateString('es-CL')}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-dotted border-black text-center text-[8px] font-bold opacity-50 italic">
              Reporte generado por NUTRIETIQ - Sistema de Gestión Alimentaria
            </div>

          </div>
        </div>
      ) : (
        <div className="lg:col-span-2 rounded-xl border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mb-4 opacity-50" />
          <p>No se ha generado la etiqueta.</p>
          <p className="text-sm">Ejecuta el cálculo para visualizar los resultados aquí.</p>
        </div>
      )}
    </div>
  )
}

function SelloWarning({ label }: { label: string }) {
  return (
    <div className="bg-black text-white p-2 border-2 border-white outline outline-2 outline-black flex flex-col items-center justify-center w-24 h-24 text-center font-black leading-tight uppercase relative">
      <div className="text-[10px] w-full text-center mb-1">ALTO EN</div>
      <div className="text-sm font-black w-full text-center flex-1 flex items-center justify-center">{label}</div>
      <div className="text-[8px] w-full text-center mt-1">Ministerio de Salud</div>
    </div>
  )
}
