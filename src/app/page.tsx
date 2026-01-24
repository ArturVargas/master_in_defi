'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { MacintoshProtocolCard } from '@/components/3D_components'
import type { Protocol } from '@/types/protocol'

export default function Home() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProtocols() {
      try {
        const response = await fetch('/api/protocols')
        const data = await response.json()

        if (response.ok) {
          // Filter only public protocols
          const publicProtocols = data.protocols.filter((p: Protocol) => p.status === 'public')
          setProtocols(publicProtocols)
        } else {
          console.error('Error fetching protocols:', data.error)
        }
      } catch (error) {
        console.error('Error fetching protocols:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProtocols()
  }, [])

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center justify-center">
            <Badge className="rounded-full bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-400 border-blue-800/50">
              DEFI INTELLIGENCE HUB
            </Badge>
          </div>

          {/* Title with gradient */}
          <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
            DeFi Mastery
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center text-zinc-400 py-12">
            Cargando protocolos...
          </div>
        )}

        {/* Macintosh 3D en columna vertical - uno por protocolo */}
        {!loading && (
          <div className="flex flex-col gap-12">
            {protocols.map((protocol) => (
              <MacintoshProtocolCard
                key={protocol.id}
                protocol={protocol}
                questionCount={0}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && protocols.length === 0 && (
          <div className="text-center text-zinc-400 py-12">
            No hay protocolos públicos disponibles
          </div>
        )}
      </main>
    </div>
  )
}
