import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'

import { headers } from 'next/headers'

export default function RegisterPage() {
  const register = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nombre = formData.get('nombre') as string
    const empresa = formData.get('empresa') as string
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || headersList.get('referer') || ''
    const url = new URL(origin)
    const baseUrl = `${url.protocol}//${url.host}`

    // SignUp User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          empresa,
        },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (authError || !authData.user) {
      redirect(`/register?message=${encodeURIComponent(authError?.message || 'Could not complete registration')}`)
    }

    // Manual insert removed: Handled by database trigger public.handle_new_user()

    revalidatePath('/', 'layout')
    redirect('/')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <ChefHat className="h-10 w-10 text-primary mb-2" />
          <h1 className="text-xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Registra tu empresa en NUTRI-ETIQUETA</p>
        </div>

        <form className="w-full space-y-4" action={register}>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="empresa">Empresa</label>
            <input
              id="empresa"
              name="empresa"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2"
          >
            Registrarse
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
  )
}
