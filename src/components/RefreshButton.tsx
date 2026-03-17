'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { forceRevalidate } from '@/app/actions'
import { useRouter } from 'next/navigation'

export function RefreshButton({ path }: { path: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setLoading(true)
    await forceRevalidate(path)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      title="Forzar actualización de datos"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    </button>
  )
}
