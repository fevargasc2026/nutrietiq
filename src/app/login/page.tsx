import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string; type?: string }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams.message
  const type = searchParams.type || 'error'

  const login = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
      }

      revalidatePath('/', 'layout')
      redirect('/')
    } catch (e: any) {
      if (e.message === 'NEXT_REDIRECT') throw e;
      redirect(`/login?message=${encodeURIComponent(e.message || 'Error inesperado')}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm flex flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <ChefHat className="h-12 w-12 text-primary mb-3" />
          <h1 className="text-3xl font-bold tracking-tight">NUTRIETIQ</h1>
          <p className="text-sm text-muted-foreground mt-2">Inicia sesión para gestionar tu información nutricional</p>
          
          {message && (
            <div className={`mt-6 p-4 rounded-lg border text-sm w-full ${
              type === 'success' 
                ? 'bg-green-50 border-green-100 text-green-800' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              {message}
            </div>
          )}
        </div>

        <form className="w-full space-y-5 text-left" action={login}>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="correo@ejemplo.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <SubmitButton
            loadingText="Iniciando sesión..."
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2 mt-4 shadow-sm"
          >
            Ingresar
          </SubmitButton>
        </form>

        <div className="mt-8 text-center text-sm border-t pt-6 w-full">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Link href="/register" className="font-bold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted-foreground/60 font-medium">
        Desarrollado por FVC-2026
      </p>
    </div>
  )
}
