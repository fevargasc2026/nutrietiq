import { Settings } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra las preferencias de tu cuenta y del sistema.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Preferencias del Sistema</h2>
              <p className="text-sm text-muted-foreground">Módulo en desarrollo. Próximamente podrás configurar sellos ALTO EN y unidades de medida.</p>
            </div>
          </div>
          
          <div className="p-8 border-2 border-dashed rounded-lg text-center">
            <p className="text-muted-foreground italic">
              Las configuraciones actuales están predefinidas según la normativa vigente en Chile (Reglamento Sanitario de los Alimentos).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
