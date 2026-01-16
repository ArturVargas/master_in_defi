'use client'

/**
 * Componente que combina el modelo 3D del Macintosh con los datos de un protocolo
 * Renderiza un Macintosh con información del protocolo
 */

import { Protocol } from '@/types/protocol'
import { MacintoshScene } from './MacintoshScene'

interface MacintoshProtocolCardProps {
  /** Protocolo a mostrar */
  protocol: Protocol
  /** Número de preguntas del protocolo */
  questionCount: number
  /** Clase CSS adicional */
  className?: string
}

export function MacintoshProtocolCard({
  protocol,
  questionCount,
  className,
}: MacintoshProtocolCardProps) {
  return (
    <div
      className={`group relative ${className}`}
    >
      {/* Contenedor del modelo 3D */}
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-black">
        <MacintoshScene
          showDetails={true}
          enableControls={true}
          className="w-full h-full"
        />
      </div>

      {/* Información del protocolo (overlay o debajo del modelo) */}
      <div className="mt-4 space-y-2">
        <h3 className="text-xl font-bold text-white">
          {protocol.title || protocol.name}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2">
          {protocol.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {questionCount} {questionCount === 1 ? 'QUESTION' : 'QUESTIONS'}
          </span>
          <span className="text-xs font-medium text-blue-400">
            Start Quiz →
          </span>
        </div>
      </div>
    </div>
  )
}
