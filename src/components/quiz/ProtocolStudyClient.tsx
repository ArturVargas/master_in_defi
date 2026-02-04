'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { VerificationGate } from '@/components/verification/VerificationGate'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import type { Protocol } from '@/lib/db/protocols'

interface ProtocolStudyClientProps {
  protocol: Protocol
}

type BriefState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; brief: string }
  | { status: 'error'; message: string }

export function ProtocolStudyClient({ protocol }: ProtocolStudyClientProps) {
  const router = useRouter()
  const [briefState, setBriefState] = useState<BriefState>({ status: 'idle' })

  const fetchBrief = useCallback(async () => {
    setBriefState({ status: 'loading' })
    try {
      const response = await fetch('/api/nomi/context-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol.id,
          maxWords: 400, // Quiz: brief
        }),
      })
      const json = await response.json()

      if (!response.ok) {
        const message = typeof json?.error === 'string' ? json.error : 'No se pudo cargar el brief.'
        setBriefState({ status: 'error', message })
        return
      }

      const data = json.data
      if (data?.brief && typeof data.brief === 'string') {
        setBriefState({ status: 'success', brief: data.brief })
      } else {
        setBriefState({ status: 'error', message: 'Respuesta inválida del servidor.' })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión. Revisa tu internet e intenta de nuevo.'
      setBriefState({ status: 'error', message })
    }
  }, [protocol.id])

  useEffect(() => {
    fetchBrief()
  }, [fetchBrief])

  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [audioError, setAudioError] = useState<string | null>(null)

  const playBriefAudio = useCallback(async () => {
    const brief = briefState.status === 'success' ? briefState.brief : null
    if (!brief?.trim()) return
    setAudioState('loading')
    setAudioError(null)
    try {
      const response = await fetch('/api/nomi/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: brief.trim(), language: 'es-MX' }),
      })
      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(typeof json?.error === 'string' ? json.error : 'No se pudo generar el audio.')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setAudioState('idle')
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        setAudioState('error')
        setAudioError('Error al reproducir el audio.')
      }
      await audio.play()
      setAudioState('playing')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar el audio.'
      setAudioError(message)
      setAudioState('error')
    }
  }, [briefState])

  const isLoading = briefState.status === 'loading' || briefState.status === 'idle'
  const showError = briefState.status === 'error'
  const showBrief = briefState.status === 'success' && briefState.brief
  const fallbackDescription = protocol.description?.trim()
  const canPlayAudio = showBrief && !isLoading
  const audioLoading = audioState === 'loading'
  const audioPlaying = audioState === 'playing'

  return (
    <VerificationGate requireVerification={true}>
      <div className="min-h-screen bg-black p-8 font-sans">
        <main className="mx-auto max-w-4xl">
          {/* Header */}
          <h1 className="mb-8 text-center text-6xl font-bold text-zinc-500/50 md:text-7xl">
            Protocol Study
          </h1>

          {/* Protocol Documentation Card */}
          <div className="relative rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-8 shadow-2xl">
            {/* Card Header */}
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-white">
                {protocol.title || protocol.name} Docs
              </h2>
              <button
                onClick={() => router.push('/')}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                ABORT
              </button>
            </div>

            {/* Briefing Content - Scrollable */}
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Spinner size="lg" className="text-blue-400" />
                  <p className="text-sm text-zinc-400">Generando brief con IA...</p>
                </div>
              )}

              {showError && (
                <div className="space-y-4">
                  <ErrorAlert
                    message={briefState.message}
                    onDismiss={() => setBriefState({ status: 'idle' })}
                  />
                  <button
                    onClick={fetchBrief}
                    className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    Reintentar
                  </button>
                  {fallbackDescription && (
                    <div className="relative pl-6 pt-4 border-t border-zinc-700/50">
                      <div className="absolute left-0 top-4 h-[calc(100%-1rem)] w-0.5 bg-zinc-700/50" />
                      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Descripción del protocolo (fallback)</p>
                      <p className="text-base italic leading-relaxed text-white/80">
                        {fallbackDescription}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {showBrief && !showError && (
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-zinc-700/50" />
                  <p className="text-base italic leading-relaxed text-white/90 whitespace-pre-wrap">
                    {briefState.brief}
                  </p>
                </div>
              )}

              {!isLoading && !showError && !showBrief && !fallbackDescription && (
                <p className="text-zinc-400">No hay briefing disponible para este protocolo.</p>
              )}

              {!isLoading && !showError && !showBrief && fallbackDescription && (
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-zinc-700/50" />
                  <p className="text-base italic leading-relaxed text-white/90">
                    {fallbackDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Audio error (si falló sintetizar o reproducir) */}
            {audioError && (
              <p className="mt-4 text-sm text-amber-400">{audioError}</p>
            )}

            {/* Bottom Section */}
            <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-zinc-700/50 pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  MICROPHONE ACTIVE
                </span>
                <span className="text-sm text-zinc-500">
                  Say &apos;Start Quiz&apos; to begin
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={playBriefAudio}
                  disabled={!canPlayAudio || audioLoading}
                  className="rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-colors flex items-center gap-2"
                  aria-label="Escuchar brief en audio"
                >
                  {audioLoading ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      Generando audio...
                    </>
                  ) : audioPlaying ? (
                    <>🔊 Reproduciendo...</>
                  ) : (
                    <>▶ Escuchar brief</>
                  )}
                </button>
                <button
                  onClick={() => router.push(`/quiz/${protocol.id}/start`)}
                  className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'MANUAL START'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </VerificationGate>
  )
}
