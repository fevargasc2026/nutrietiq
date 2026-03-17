'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, CheckCircle2 } from 'lucide-react';
import { registerUser } from './actions';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await registerUser(formData);
    
    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      setSuccess(result.nombre || 'Usuario');
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 font-sans">
        <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-lg flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">¡Registro Exitoso!</h1>
          <p className="text-muted-foreground mb-8">
            Usuario: <span className="font-semibold text-foreground">{success}</span>, creado en forma correcta.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-sm"
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 font-sans">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <ChefHat className="h-10 w-10 text-primary mb-2" />
          <h1 className="text-xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Registra tu empresa en NUTRIETIQ</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm w-full border border-destructive/20">
            {error}
          </div>
        )}

        <form className="w-full space-y-4" action={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="empresa">Empresa</label>
            <input
              id="empresa"
              name="empresa"
              type="text"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2 shadow-sm"
          >
            {isPending ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
