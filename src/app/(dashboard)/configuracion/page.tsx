import { Settings } from 'lucide-react'
import { getEmpresaConfig } from '@/app/actions/configuracion'
import { CompanyConfigForm } from '@/components/forms/CompanyConfigForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const companyData = await getEmpresaConfig()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra los parámetros de la empresa y preferencias del sistema.</p>
      </div>

      <div className="grid gap-6">
        <CompanyConfigForm initialData={companyData} />
      </div>
    </div>
  )
}
