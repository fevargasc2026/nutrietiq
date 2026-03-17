import { UserCircle } from 'lucide-react';

interface NavbarProps {
  userRole?: string;
  userName?: string;
}

export function Navbar({ userRole, userName }: NavbarProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Panel de Control</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2 text-right">
          <span className="text-sm font-semibold text-foreground leading-tight">
            {userName || 'Usuario'}
          </span>
          <span className="text-xs font-medium text-muted-foreground leading-tight">
            {userRole || 'Operador'}
          </span>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <UserCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
