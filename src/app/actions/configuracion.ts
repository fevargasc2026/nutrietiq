'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEmpresaConfig() {
  const supabase = await createClient()
  
  // 1. Get current user's company
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('usuarios')
    .select('empresa, rol')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // 2. Fetch company data
  const { data: empresa, error } = await supabase
    .from('empresa')
    .select('*')
    .eq('empresa', profile.empresa)
    .single()

  if (error) {
    console.error('Error fetching empresa:', error)
    return null
  }

  return {
    ...empresa,
    userRole: profile.rol
  }
}

export async function updateEmpresaConfig(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Check auth and role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol, empresa')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'SuperUsuario') {
    throw new Error('No tienes permisos para modificar la configuración de la empresa')
  }

  // 2. Extract data
  const empresaNombre = formData.get('empresa') as string
  const rut = formData.get('rut') as string
  const direccion = formData.get('direccion') as string
  const resolucion = formData.get('resolucion') as string
  const fechaRes = formData.get('fecha_res') as string

  // 3. Update (Note: we use the profile.empresa to identify the row to update)
  // If the company name itself changes, we rely on ON UPDATE CASCADE in the FK
  const { error } = await supabase
    .from('empresa')
    .update({
      empresa: empresaNombre,
      rut,
      direccion,
      resolucion,
      fecha_res: fechaRes,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('empresa', profile.empresa)

  if (error) {
    console.error('Error updating empresa:', error)
    throw new Error('Error al actualizar los datos de la empresa')
  }

  revalidatePath('/configuracion')
}
