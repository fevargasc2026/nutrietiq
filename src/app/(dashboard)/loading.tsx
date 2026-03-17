import { ChefHat } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <ChefHat className="h-16 w-16 text-primary animate-bounce" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Iniciando NUTRIETIQ</h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            Preparando tu panel de control...
          </p>
        </div>
      </div>
    </div>
  )
}
