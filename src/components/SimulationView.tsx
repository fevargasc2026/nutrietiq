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
  companyData?: { empresa: string, rut: string, direccion: string, resolucion: string, fecha_res: string } | null
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
      margin: 0,
      filename: `Etiquetas_${recetaNombre.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4, useCORS: true },
      jsPDF: { unit: 'mm', format: [99, 78], orientation: 'landscape' }
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
          
          <div id="etiqueta-print-area" className="flex gap-[3mm] bg-white p-0">
             <NutritionalLabel 
               recetaNombre={recetaNombre}
               data={data}
               porciones={porciones}
               porcionGramos={porcionGramos}
               alergenos={alergenos}
               companyData={companyData}
             />
             <NutritionalLabel 
               recetaNombre={recetaNombre}
               data={data}
               porciones={porciones}
               porcionGramos={porcionGramos}
               alergenos={alergenos}
               companyData={companyData}
             />
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800 w-full max-w-md">
             <p className="font-bold mb-1">Configuración de Impresión</p>
             <ul className="list-disc pl-4 space-y-1">
               <li>Formato: 2 etiquetas de 48x78mm.</li>
               <li>Espacio entre etiquetas: 3mm.</li>
               <li>Ancho total ajustable: 99mm.</li>
               <li>Exportación PDF: Formato exacto 99x78mm (sin márgenes).</li>
             </ul>
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

function NutritionalLabel({ 
  recetaNombre, 
  data, 
  porciones, 
  porcionGramos, 
  alergenos, 
  companyData 
}: { 
  recetaNombre: string, 
  data: Calculo, 
  porciones: number, 
  porcionGramos: string, 
  alergenos: string[], 
  companyData: any 
}) {
  const prodDate = new Date().toLocaleDateString('es-CL')
  const expDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')

  return (
    <div className="w-[48mm] min-h-[78mm] max-h-[78mm] bg-white text-black p-1.5 border-2 border-black font-sans flex flex-col overflow-hidden shrink-0">
       <div className="text-center mb-1 pb-1 border-b border-black">
         <p className="text-[10pt] font-black uppercase leading-[1.1]">{recetaNombre}</p>
       </div>
       
       <div className="border-b-[3px] border-black pb-0.5 mb-1 text-center">
         <h2 className="text-[10pt] font-black uppercase tracking-tighter leading-none mb-0.5">Información Nutricional</h2>
         <div className="text-[7.5px] font-bold flex justify-center gap-2">
            <span>Fecha producción: {prodDate}</span>
            <span>CONSUMIR HASTA: {expDate}</span>
         </div>
       </div>

       <div className="flex justify-between text-[8px] font-bold mb-1 px-0.5">
         <span>Porciones por envase: {porciones}</span>
         <span>Porción: 1 {porcionGramos}g</span>
       </div>

       <table className="w-full text-[9px] font-bold border-collapse">
         <thead className="border-y-[3px] border-black">
           <tr>
             <th className="py-0.5 text-left pl-0.5"></th>
             <th className="py-0.5 text-right w-[14mm]">100g</th>
             <th className="py-0.5 text-right pr-0.5 w-[14mm]">1 Porc.</th>
           </tr>
         </thead>
         <tbody className="[&>tr]:border-b [&>tr]:border-black">
           <tr>
             <td className="py-0.5 pl-0.5">Energía (kcal)</td>
             <td className="py-0.5 text-right">{data.energia_100g}</td>
             <td className="py-0.5 text-right pr-0.5">{data.energia_porcion}</td>
           </tr>
           <tr>
             <td className="py-0.5 pl-0.5">Proteínas (g)</td>
             <td className="py-0.5 text-right">{data.proteina_100g}</td>
             <td className="py-0.5 text-right pr-0.5">{data.proteina_porcion}</td>
           </tr>
           <tr>
             <td className="py-0.5 pl-0.5">Grasas Totales (g)</td>
             <td className="py-0.5 text-right">{data.grasa_total_100g}</td>
             <td className="py-0.5 text-right pr-0.5">{data.grasa_porcion}</td>
           </tr>
           <tr>
             <td className="py-0.5 pl-0.5">H. de Carbono (g)</td>
             <td className="py-0.5 text-right">{data.carbohidratos_100g}</td>
             <td className="py-0.5 text-right pr-0.5">{data.carbohidratos_porcion}</td>
           </tr>
           <tr>
             <td className="py-0.5 pl-4 text-[7.5px]">Azúcares Tot. (g)</td>
             <td className="py-0.5 text-right text-[7.5px]">{data.azucares_100g}</td>
             <td className="py-0.5 text-right text-[7.5px] pr-0.5">{data.azucares_porcion}</td>
           </tr>
           <tr>
             <td className="py-0.5 pl-0.5">Sodio (mg)</td>
             <td className="py-0.5 text-right">{data.sodio_100g}</td>
             <td className="py-0.5 text-right pr-0.5">{data.sodio_porcion}</td>
           </tr>
         </tbody>
       </table>

       <div className="mt-1 text-[7.5px] font-black uppercase leading-tight border-b border-black pb-1 mb-1 px-0.5">
         {alergenos.length > 0 ? (
           <span>CONTIENE: {alergenos.join(', ')}.</span>
         ) : (
           <span>NO CONTIENE ALÉRGENOS.</span>
         )}
       </div>

       {companyData ? (
         <div className="text-[7px] leading-[1.0] flex flex-col gap-0.5 px-0.5 font-bold">
           <div className="flex justify-between flex-wrap items-end">
             <span className="font-black uppercase text-[7.5px]">{companyData.empresa || 'Empresa No Configurada'}</span>
             {companyData.rut && <span>RUT: {companyData.rut}</span>}
           </div>
           {companyData.direccion && (
             <div className="mt-0.5 border-t border-black/5 pt-0.5">
               <p>{companyData.direccion}</p>
               {companyData.resolucion && (
                 <p>Res. Sanitaria N° {companyData.resolucion} 
                   {companyData.fecha_res ? ` de fecha ${new Date(companyData.fecha_res + 'T12:00:00').toLocaleDateString('es-CL')}` : ''}
                 </p>
               )}
             </div>
           )}
         </div>
       ) : (
         <div className="text-[7px] text-red-600 font-bold mt-1 border-t border-black pt-1 text-center">
            Empresa No Configurada
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
