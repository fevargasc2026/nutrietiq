import { createClient } from '@/utils/supabase/server';
import { Users, FileText, Beaker, Calculator } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Fetch real counts
  const [
    { count: recetasCount },
    { count: ingredientesCount },
    { count: usuariosCount },
    { count: calculosCount }
  ] = await Promise.all([
    supabase.from('recetas').select('*', { count: 'exact', head: true }),
    supabase.from('ingredientes').select('*', { count: 'exact', head: true }),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('calculos_nutricionales').select('*', { count: 'exact', head: true }),
  ]);

  // Fetch recent activity (last 5 calculations)
  const { data: recentActivity } = await supabase
    .from('calculos_nutricionales')
    .select(`
      id,
      fecha_calculo,
      recetas (
        nombre
      )
    `)
    .order('fecha_calculo', { ascending: false })
    .limit(5);

  const stats = [
    { name: "Recetas Creadas", value: (recetasCount || 0).toString(), icon: FileText, change: "En el sistema" },
    { name: "Ingredientes Base", value: (ingredientesCount || 0).toString(), icon: Beaker, change: "Disponibles" },
    { name: "Cálculos Nutricionales", value: (calculosCount || 0).toString(), icon: Calculator, change: "Simulaciones" },
    { name: "Usuarios Activos", value: (usuariosCount || 0).toString(), icon: Users, change: "En la plataforma" },
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
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4 flex flex-col p-6">
          <div className="mb-4">
            <h3 className="font-semibold leading-none tracking-tight">Actividad Reciente</h3>
            <p className="text-sm text-muted-foreground mt-2">Cálculos nutricionales realizados últimamente.</p>
          </div>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calculator className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cálculo: {activity.recetas?.nombre || 'Receta desconocida'}</p>
                        <p className="text-xs text-muted-foreground">Generado exitosamente</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {new Date(activity.fecha_calculo).toLocaleDateString('es-CL')}
                      <br />
                      {new Date(activity.fecha_calculo).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg">
                No hay actividad reciente.
              </div>
            )}
            {recentActivity && recentActivity.length > 0 && (
              <Link href="/recetas" className="text-sm text-primary hover:underline font-medium block text-center pt-2">
                Ver todas las recetas
              </Link>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3 flex flex-col p-6">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Accesos Rápidos</h3>
            <p className="text-sm text-muted-foreground mt-2">Acciones comunes del sistema.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link 
              href="/recetas/nueva"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
            >
              Crear Nueva Receta
            </Link>
            <Link 
              href="/ingredientes/nuevo"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
            >
              Añadir Ingrediente
            </Link>
            <Link 
              href="/recetas"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
            >
              Simular Etiqueta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
