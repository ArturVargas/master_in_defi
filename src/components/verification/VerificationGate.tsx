'use client'

/**
 * Gate de verificación con tabs para Self Protocol y Wallet Signature
 * Basado en ConnectHub pero adaptado para nuestro caso
 */

import { ReactNode } from 'react'
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
  const { isVerified, verificationMethod, isLoading } = useVerification()

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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Verificación Requerida
          </h1>
          <p className="text-zinc-400">
            Verifica tu identidad para acceder al quiz DeFi
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="self" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="self">Self Protocol</TabsTrigger>
              {allowWalletSignature && (
                <TabsTrigger value="wallet">Wallet Signature</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="self" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Verificación Completa con Self Protocol
                  </h3>
                  <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                    <li>✅ Verificación de identidad completa</li>
                    <li>✅ Acceso a leaderboards verificados</li>
                    <li>✅ Certificados y badges</li>
                    <li>✅ Prevención de bots y sybil attacks</li>
                  </ul>
                </div>
                <SelfWidget />
              </div>
            </TabsContent>

            {allowWalletSignature && (
              <TabsContent value="wallet" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Verificación Básica con Wallet
                    </h3>
                    <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                      <li>✅ Rápido y fácil</li>
                      <li>✅ No requiere app adicional</li>
                      <li>⚠️ Verificación básica (propiedad de wallet)</li>
                      <li>⚠️ Sin certificados/badges premium</li>
                    </ul>
                  </div>
                  <WalletSignatureButton />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>

        {verificationMethod && (
          <div className="mt-4 text-center text-sm text-zinc-400">
            Verificado con: {verificationMethod === 'self' ? 'Self Protocol' : 'Wallet Signature'}
          </div>
        )}
      </div>
    </div>
  )
}

// No memoizar para permitir re-render cuando el contexto cambia
export const VerificationGate = VerificationGateComponent
