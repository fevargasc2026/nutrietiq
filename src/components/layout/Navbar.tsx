import { UserCircle } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Panel de Control</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Administrador</span>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <UserCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
