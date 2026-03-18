import Link from 'next/link';
import { ChefHat, LayoutDashboard, Utensils, Beaker, FileText, Settings, LogOut, Users } from 'lucide-react';
import { signOut } from '@/app/auth/actions';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ingredientes', href: '/ingredientes', icon: Beaker },
  { name: 'Recetas', href: '/recetas', icon: Utensils },
  { name: 'Simulador', href: '/simulador', icon: FileText },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['SuperUsuario'] },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside className="w-64 border-r bg-background flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight text-primary">
        <ChefHat className="mr-2 h-6 w-6" />
        NUTRIETIQ
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto px-3">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <form action={signOut}>
          <button 
            type="submit"
            className="flex w-full items-center px-4 py-3 text-sm font-bold rounded-xl text-primary bg-primary/5 border border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md group"
          >
            <LogOut className="mr-3 h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
