import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'

export default function LoginPage() {
  const login = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirect('/login?message=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border shadow-sm flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <ChefHat className="h-10 w-10 text-primary mb-2" />
          <h1 className="text-2xl font-bold tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">Accede a tu cuenta de NUTRI-ETIQUETA</p>
        </div>

        <form className="w-full space-y-4" action={login}>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="admin@ejemplo.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
