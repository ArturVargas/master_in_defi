'use client'

/**
 * Gate de verificación con tabs para Self Protocol y Wallet Signature
 * Basado en ConnectHub pero adaptado para nuestro caso
 */

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVerification } from '@/contexts/VerificationContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { SelfWidget } from './SelfWidget'
import { WalletSignatureButton } from './WalletSignatureButton'
import { Card } from '@/components/ui/Card'

interface VerificationGateProps {
  children: ReactNode
  requireVerification?: boolean
  allowWalletSignature?: boolean
}

function VerificationGateComponent({ 
  children, 
  requireVerification = true,
  allowWalletSignature = true 
}: VerificationGateProps) {
  const router = useRouter()
  const { isVerified, verificationMethod, isLoading } = useVerification()
  
  // Animación typewriter para el título
  const titleText = '> VERIFICACIÓN REQUERIDA'
  const [displayedTitle, setDisplayedTitle] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setDisplayedTitle('')
    let currentIndex = 0
    const typingSpeed = 80 // ms por letra

    const typingInterval = setInterval(() => {
      if (currentIndex < titleText.length) {
        setDisplayedTitle(titleText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, typingSpeed)

    return () => clearInterval(typingInterval)
  }, [])

  // Cursor parpadeante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  // Cuando se verifica, el componente se re-renderiza automáticamente
  // y muestra el contenido (children) gracias a la condición if (!requireVerification || isVerified)
  // El contexto se actualiza cuando se dispara el evento 'wallet-verified' desde WalletSignatureButton

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando verificación...</div>
      </div>
    )
  }

  // Si está verificado, mostrar el contenido inmediatamente
  if (!requireVerification || isVerified) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-2xl">
        {/* Botón para regresar al home */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 font-mono text-base text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:text-[#00ffaa] hover:drop-shadow-[0_0_12px_rgba(0,255,170,0.8)] transition-all duration-200"
          >
            <span className="text-xl">←</span>
            <span>Atrás</span>
          </button>
        </div>

        {/* Header con estilo terminal verde */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 font-mono text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]">
            {displayedTitle}
            {showCursor && displayedTitle.length < titleText.length && (
              <span className="inline-block w-3 h-8 bg-[#00ff88] ml-1 animate-pulse" />
            )}
          </h1>
          <p className="text-zinc-400">
            Verifica tu identidad para acceder al quiz DeFi
          </p>
        </div>

        {/* Card con estilo Macintosh */}
        <Card className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
          <Tabs defaultValue="self" className="w-full">
            {/* Tabs con estilo retro */}
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1">
              <TabsTrigger 
                value="self"
                className="font-mono text-zinc-400 hover:text-zinc-300 data-[state=active]:text-[#00ff88] data-[state=active]:drop-shadow-[0_0_6px_rgba(0,255,136,0.5)] data-[state=active]:bg-zinc-900/50 data-[state=active]:border-b-2 data-[state=active]:border-[#00ff88] transition-all"
              >
                Self Protocol
              </TabsTrigger>
              {allowWalletSignature && (
                <TabsTrigger 
                  value="wallet"
                  className="font-mono text-zinc-400 hover:text-zinc-300 data-[state=active]:text-[#00ff88] data-[state=active]:drop-shadow-[0_0_6px_rgba(0,255,136,0.5)] data-[state=active]:bg-zinc-900/50 data-[state=active]:border-b-2 data-[state=active]:border-[#00ff88] transition-all"
                >
                  Wallet Signature
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="self" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.4)] font-mono">
                    Verificación Completa con Self Protocol
                  </h3>
                  <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                      Verificación de identidad completa
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                      Acceso a leaderboards verificados
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                      Certificados y badges
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                      Prevención de bots y sybil attacks
                    </li>
                  </ul>
                </div>
                <SelfWidget />
              </div>
            </TabsContent>

            {allowWalletSignature && (
              <TabsContent value="wallet" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.4)] font-mono">
                      Verificación Básica con Wallet
                    </h3>
                    <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                        Rápido y fácil
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">✓</span>
                        No requiere app adicional
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">⚠</span>
                        Verificación básica (propiedad de wallet)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">⚠</span>
                        Sin certificados/badges premium
                      </li>
                    </ul>
                  </div>
                  <WalletSignatureButton />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>

        {verificationMethod && (
          <div className="mt-4 text-center text-sm font-mono text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]">
            &gt; Verificado con: {verificationMethod === 'self' ? 'Self Protocol' : 'Wallet Signature'}
          </div>
        )}
      </div>
    </div>
  )
}

// No memoizar para permitir re-render cuando el contexto cambia
export const VerificationGate = VerificationGateComponent
