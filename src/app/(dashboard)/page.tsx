import { Users, FileText, Beaker, Calculator } from "lucide-react";

export default function Home() {
  const stats = [
    { name: "Recetas Creadas", value: "12", icon: FileText, change: "+2 este mes" },
    { name: "Ingredientes Base", value: "349", icon: Beaker, change: "Actualizados hoy" },
    { name: "Cálculos Nutricionales", value: "45", icon: Calculator, change: "+5 esta semana" },
    { name: "Usuarios Activos", value: "3", icon: Users, change: "En tu empresa" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de actividad y métricas clave del sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{stat.name}</h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4 flex flex-col justify-between p-6">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Actividad Reciente</h3>
            <p className="text-sm text-muted-foreground mt-2">Cálculos generados recientemente.</p>
          </div>
          <div className="mt-8 flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg">
            No hay actividad reciente.
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3 flex flex-col p-6">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Accesos Rápidos</h3>
            <p className="text-sm text-muted-foreground mt-2">Acciones comunes del sistema.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
              Crear Nueva Receta
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
              Añadir Ingrediente
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
              Simular Etiqueta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
