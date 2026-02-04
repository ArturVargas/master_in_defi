'use client'

/**
 * Widget de Self Protocol para verificación de identidad
 */

import { useState, useCallback, useMemo, memo } from 'react'
import { useSelf } from '@/contexts/SelfContext'
import { useFarcaster } from '@/contexts/FarcasterContext'
import { useConnections, useConnect, useConnectors } from 'wagmi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { SelfVerificationData } from '@/types/self'
import type { SelfApp } from '@/types/self'
import { SelfQRcodeWrapper } from '@selfxyz/qrcode'

interface SelfWidgetProps {
  variant?: 'card' | 'inline'
  showQRCode?: boolean
  className?: string
}

export function SelfWidget({
  variant = 'card',
  showQRCode = false,
  className
}: SelfWidgetProps) {
  const connections = useConnections()
  const activeConnection = connections[0]
  const isConnected = connections.length > 0 && !!activeConnection?.accounts?.[0]

  const connect = useConnect()
  const connectors = useConnectors()

  const { isConnected: isAuthenticated } = useFarcaster()
  const {
    isVerified,
    verificationData,
    isVerifying,
    error,
    universalLink,
    selfApp,
    initiateSelfVerification,
    clearVerification,
    checkVerificationStatus
  } = useSelf()

  // Callback cuando la verificación es exitosa (QR onSuccess)
  const handleVerificationSuccess = useCallback(() => {
    checkVerificationStatus()
  }, [checkVerificationStatus])

  const [linkCopied, setLinkCopied] = useState(false)
  const [userToggledQR, setUserToggledQR] = useState<boolean | null>(null)

  const showQR = userToggledQR !== null
    ? userToggledQR
    : (showQRCode || (isConnected && !!selfApp && !!universalLink))

  const handleConnectWallet = useCallback(() => {
    // Same priority as WalletSignatureButton:
    // 1. Injected (MetaMask, etc.) - works in regular browsers
    // 2. WalletConnect - mobile wallets
    // 3. Farcaster - only works inside Farcaster Mini Apps
    const injectedConnector = connectors.find(c => c.id === 'injected')
    const walletConnectConnector = connectors.find(c => c.id === 'walletConnect')
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.id === 'farcasterFrame')
    const connector = injectedConnector || walletConnectConnector || farcasterConnector || connectors[0]
    if (connector) {
      console.log('[SelfWidget] Connecting with connector:', connector.id, connector.name)
      connect.mutate({ connector })
    } else {
      console.error('[SelfWidget] No connector available')
    }
  }, [connectors, connect])

  const copyToClipboard = () => {
    if (!universalLink) return

    navigator.clipboard.writeText(universalLink)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
      })
  }

  // Variante inline
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {isVerified ? (
          <>
            <span className="text-green-500 text-xl">✓</span>
            <span className="text-sm font-medium text-white">Verificado</span>
            {verificationData?.date_of_birth && (
              <span className="text-xs text-zinc-400">
                DOB: {verificationData.date_of_birth}
              </span>
            )}
          </>
        ) : (
          <Button
            onClick={initiateSelfVerification}
            disabled={isVerifying || !universalLink}
            size="sm"
            variant="outline"
          >
            {isVerifying ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Verificando...
              </>
            ) : (
              'Verificar con Self'
            )}
          </Button>
        )}
      </div>
    )
  }

  // Variante card (default)
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          Self Protocol Verification
        </h3>
        <p className="text-sm text-zinc-400">
          Verifica tu identidad usando Self Protocol. Escanea el QR code con la app Self Protocol en tu móvil.
        </p>
      </div>

      <WidgetContent
        isVerified={isVerified}
        verificationData={verificationData}
        isVerifying={isVerifying}
        error={error}
        universalLink={universalLink}
        linkCopied={linkCopied}
        selfApp={selfApp}
        showQR={showQR}
        isConnected={isConnected}
        isConnecting={connect.isPending}
        onVerify={initiateSelfVerification}
        onCopy={copyToClipboard}
        onClear={clearVerification}
        onToggleQR={() => setUserToggledQR(userToggledQR === null ? !showQR : !userToggledQR)}
        onVerificationSuccess={handleVerificationSuccess}
        onConnectWallet={handleConnectWallet}
        isAuthenticated={isAuthenticated}
      />
    </Card>
  )
}

// Contenido compartido del widget
function WidgetContent({
  isVerified,
  verificationData,
  isVerifying,
  error,
  universalLink,
  linkCopied,
  selfApp,
  showQR,
  isConnected,
  isConnecting,
  onVerify,
  onCopy,
  onClear,
  onToggleQR,
  onVerificationSuccess,
  onConnectWallet,
  isAuthenticated
}: {
  isVerified: boolean
  verificationData: SelfVerificationData | null
  isVerifying: boolean
  error: string | null
  universalLink: string | null
  linkCopied: boolean
  selfApp: SelfApp | null
  showQR: boolean
  isConnected: boolean
  isConnecting: boolean
  onVerify: () => void
  onCopy: () => void
  onClear: () => void
  onToggleQR: () => void
  onVerificationSuccess: () => void
  onConnectWallet: () => void
  isAuthenticated: boolean
}) {
  const shouldShowQR = useMemo(() => {
    return showQR || (isConnected && !!selfApp && !!universalLink)
  }, [showQR, isConnected, selfApp, universalLink])

  const handleQRSuccess = useCallback(() => {
    console.log('[SelfWidget] QR verification successful')
    onVerificationSuccess()
  }, [onVerificationSuccess])

  const handleQRError = useCallback((err: unknown) => {
    console.error('[SelfWidget] QR verification error:', err)
  }, [])

  if (isVerified && verificationData) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-500">
          <span className="text-2xl">✓</span>
          <span className="font-medium text-white">¡Verificación Completa!</span>
        </div>

        <div className="space-y-2 text-sm">
          {verificationData.date_of_birth && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Fecha de Nacimiento:</span>
              <span className="font-medium text-white">{verificationData.date_of_birth}</span>
            </div>
          )}
          {verificationData.name && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Nombre:</span>
              <span className="font-medium text-white">{verificationData.name}</span>
            </div>
          )}
          {verificationData.nationality && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Nacionalidad:</span>
              <span className="font-medium text-white">{verificationData.nationality}</span>
            </div>
          )}
        </div>

        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Limpiar Verificación
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {isVerifying && (
        <div className="p-4 border border-blue-500/50 bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Spinner size="sm" className="flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-sm text-white">Procesando verificación...</h3>
              <p className="text-xs text-zinc-400">
                Tu prueba de identidad está siendo verificada. Esto puede tomar hasta 5 minutos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {shouldShowQR && selfApp && (
        <QRCodeDisplay
          selfApp={selfApp}
          onSuccess={handleQRSuccess}
          onError={handleQRError}
        />
      )}

      {/* Mensaje y botón si no hay wallet conectada */}
      {!isConnected && (
        <div className="space-y-3">
          <div className="p-4 border border-blue-500/50 bg-blue-900/20 rounded-lg">
            <p className="text-sm text-zinc-300 mb-2">
              Para verificar con Self Protocol, primero necesitas conectar tu wallet de Farcaster.
            </p>
            <p className="text-xs text-zinc-400">
              Conecta tu wallet para generar el QR code y comenzar la verificación.
            </p>
          </div>
          <Button
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="w-full bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/30 hover:drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] transition-all duration-200 font-mono"
          >
            {isConnecting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Conectando...
              </>
            ) : (
              <>
                <span className="mr-2">🔗</span>
                Conectar Wallet
              </>
            )}
          </Button>
        </div>
      )}

      {/* Estado de inicialización cuando hay wallet pero no hay selfApp aún */}
      {isConnected && !selfApp && !isVerifying && (
        <div className="space-y-3">
          <div className="p-4 border border-blue-500/50 bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Spinner size="sm" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  Inicializando Self Protocol...
                </p>
                <p className="text-xs text-zinc-400">
                  Generando QR code para verificación. Esto tomará unos segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción cuando hay wallet y selfApp */}
      {isConnected && selfApp && !isVerifying && (
        <div className="space-y-2">
          {/* Botón deeplink para abrir Self App (mobile/Farcaster) */}
          <Button
            onClick={onVerify}
            disabled={isVerifying || !universalLink}
            className="w-full bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/30 hover:drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] transition-all duration-200 font-mono"
          >
            <span className="mr-2">🛡️</span>
            Iniciar Verificación con Self
          </Button>

          {/* Toggle QR y copiar link */}
          {universalLink && (
            <>
              <Button
                onClick={onToggleQR}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {shouldShowQR ? 'Ocultar QR' : 'Mostrar QR Code'}
              </Button>
              <Button
                onClick={onCopy}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-zinc-400 hover:text-zinc-300"
              >
                {linkCopied ? '✓ Link copiado' : '📋 Copiar link (para otro dispositivo)'}
              </Button>
            </>
          )}
        </div>
      )}

      {isVerifying && (
        <p className="text-xs text-zinc-400 text-center">
          Completa la verificación en la app Self. Esto puede tomar hasta 5 minutos.
        </p>
      )}
    </div>
  )
}

// Memoized QR Code component to prevent unnecessary re-mounts
const QRCodeDisplay = memo(({
  selfApp,
  onSuccess,
  onError
}: {
  selfApp: SelfApp
  onSuccess: () => void
  onError: (err: unknown) => void
}) => {
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="bg-white p-4 rounded-lg border">
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
      <p className="text-xs text-zinc-400 text-center">
        Escanea con la app Self Protocol
      </p>
    </div>
  )
})

QRCodeDisplay.displayName = 'QRCodeDisplay'
