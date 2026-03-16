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

export function SimulationView({ recetaId, recetaNombre, porciones, pesoFinal }: { recetaId: string, recetaNombre: string, porciones: number, pesoFinal: number }) {
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

      // Call Edge Function
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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
      filename: `Etiqueta_${recetaNombre.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().from(element).set(opt).save()
  }

  const porcionGramos = (pesoFinal / porciones).toFixed(0)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Simulation Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <Calculator className="h-12 w-12 text-primary opacity-80" />
          <div>
            <h3 className="text-lg font-medium tracking-tight">Ejecutar Simulación</h3>
            <p className="text-sm text-muted-foreground mt-1">Calcula los aportes y genera la etiqueta en base a la Ley de Etiquetado.</p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {loading ? 'Calculando...' : 'Simular Etiqueta'}
          </button>
          {errorStr && <p className="text-sm text-red-600 font-medium">{errorStr}</p>}
        </div>

        {data && (
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-medium tracking-tight border-b pb-2">Acciones</h3>
            <button 
              onClick={handleExportPDF}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <Download className="mr-2 h-4 w-4" /> Exportar a PDF
            </button>
          </div>
        )}
      </div>

      {/* Render Area */}
      {data ? (
        <div className="lg:col-span-2 rounded-xl border bg-card p-8 shadow-sm flex justify-center">
          
          <div id="etiqueta-print-area" className="w-full max-w-[400px] bg-white text-black p-4 border-2 border-black font-sans">
            
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
                  <td className="py-1 pl-4 text-xs">Aportada por: G. Saturada (g)</td>
                  <td className="py-1 text-right text-xs">{data.sello_grasa ? data.sello_grasa : 0 /* The formula doesn't store sat fat directly in calculation payload yet, placeholder */}</td>
                  <td className="py-1 text-right text-xs">-</td>
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

            <div className="mt-4 text-xs font-bold uppercase leading-tight">
              {alergenos.length > 0 ? (
                <span>CONTIENE: {alergenos.join(', ')}.</span>
              ) : (
                <span>NO CONTIENE ALÉRGENOS DECLARADOS.</span>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="lg:col-span-2 rounded-xl border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mb-4 opacity-50" />
          <p>No se ha generado la etiqueta.</p>
          <p className="text-sm">Ejecuta la simulación para visualizar los resultados aquí.</p>
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
