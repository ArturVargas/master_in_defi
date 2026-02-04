'use client'

/**
 * Componente que combina el modelo 3D del Macintosh con los datos de un protocolo
 * Renderiza un Macintosh con información del protocolo
 */

import { useRouter } from 'next/navigation'
import { MacintoshScene } from './MacintoshScene'

/** Compatible con Protocol (estático) y con protocolos de la API (BD) */
interface ProtocolForCard {
  id: string
  name: string
  title?: string | null
  description?: string | null
}

interface MacintoshProtocolCardProps {
  /** Protocolo a mostrar */
  protocol: ProtocolForCard
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
  const router = useRouter()

  const handleStartQuiz = () => {
    router.push(`/quiz/${protocol.id}`)
  }

  return (
    <div
      className={`group relative rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden backdrop-blur-sm ${className}`}
    >
      {/* Contenedor del modelo 3D */}
      <div className="h-[500px] w-full overflow-hidden bg-black/30">
        <MacintoshScene
          showDetails={true}
          enableControls={true}
          className="w-full h-full"
          protocolName={protocol.title || protocol.name}
        />
      </div>

      {/* Divider sutil */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      {/* Información del protocolo integrada */}
      <div className="px-6 py-5 space-y-2">
        <p className="text-sm text-zinc-400 line-clamp-2">
          {protocol.description ?? ''}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {questionCount} {questionCount === 1 ? 'QUESTION' : 'QUESTIONS'}
          </span>
          <button
            onClick={handleStartQuiz}
            className="text-xs font-medium text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:text-[#00ffaa] hover:drop-shadow-[0_0_12px_rgba(0,255,170,0.8)] transition-all duration-200 cursor-pointer"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  )
}
