"use client"

import { Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteIngredientButton({ id, ingredientName }: { id: string, ingredientName: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el ingrediente "${ingredientName}"? 
ADVERTENCIA: Si este ingrediente es parte de recetas existentes, su eliminación puede afectar o romper los datos de dichas recetas. 

Solo un SuperUsuario posee los privilegios para realizar esta acción crítica.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('ingredientes')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      alert(`Error al eliminar: ${error.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Eliminar ingrediente (Acción crítica)"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
