'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { MacintoshProtocolCard } from '@/components/3D_components'
import { Spinner } from '@/components/ui/Spinner'

interface ProtocolFromApi {
  id: string
  name: string
  title: string | null
  description: string | null
  questionCount: number
  status?: string
  [key: string]: unknown
}

export default function Home() {
  const [protocols, setProtocols] = useState<ProtocolFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProtocols = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/protocols')
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error ?? 'Error al cargar protocolos')
      }
      const payload = json.data
      if (payload && Array.isArray(payload.protocols)) {
        setProtocols(payload.protocols)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProtocols()
  }, [fetchProtocols])

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <Badge className="rounded-full bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-400 border-blue-800/50">
              DEFI INTELLIGENCE HUB
            </Badge>
          </div>
          <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
            DeFi Mastery
          </h1>
        </div>

        {/* Content: loading, error or protocol cards */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <Spinner size="lg" className="text-blue-400" />
            <p className="text-sm text-zinc-400">Cargando protocolos...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              onClick={fetchProtocols}
              className="mt-4 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-12">
            {protocols.length === 0 ? (
              <p className="py-12 text-center text-zinc-400">No hay protocolos publicados.</p>
            ) : (
              protocols.map((protocol) => (
                <MacintoshProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  questionCount={protocol.questionCount}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
