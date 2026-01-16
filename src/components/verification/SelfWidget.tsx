'use client'

/**
 * Widget de Self Protocol para verificación de identidad
 * Basado en ConnectHub: https://github.com/ArturVargas/ConnectHub
 */

import { useState, useCallback, useMemo, memo } from 'react'
import { useSelf } from '@/contexts/SelfContext'
import { useFarcaster } from '@/contexts/FarcasterContext'
import { useConnections, useConnect, useConnectors } from 'wagmi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { config } from '@/lib/config'
import { SelfApp, SelfVerificationData } from '@/types/self'

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

  // Callback cuando la verificación es exitosa
  const handleVerificationSuccess = () => {
    checkVerificationStatus()
  }

  const [linkCopied, setLinkCopied] = useState(false)
  const [userToggledQR, setUserToggledQR] = useState<boolean | null>(null)
  
  // Auto-mostrar QR cuando hay wallet conectada y selfApp disponible
  // Si el usuario no ha toggled manualmente, mostrar automáticamente cuando hay selfApp
  const showQR = userToggledQR !== null 
    ? userToggledQR 
    : (showQRCode || (isConnected && !!selfApp && !!universalLink))

  // Handler para conectar wallet desde Self Protocol
  const handleConnectWallet = useCallback(() => {
    // En Farcaster Mini Apps, priorizar el connector de Farcaster
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.id === 'farcasterFrame')
    const connector = farcasterConnector || connectors[0]
    if (connector) {
      connect.mutate({ connector })
    }
  }, [connectors, connect])

  // En Farcaster Mini Apps, permitir mostrar el widget incluso sin wallet conectada
  // El usuario puede conectar su wallet después para iniciar la verificación

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

      {/* Simplificado: Solo método que funciona (Backend API) */}
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
  onVerificationSuccess: (data?: SelfVerificationData) => void
  onConnectWallet: () => void
  isAuthenticated: boolean
}) {
  // Auto-mostrar QR cuando hay wallet conectada y selfApp disponible
  // Si showQR es false pero hay selfApp, mostrar automáticamente
  // Memoizar para evitar re-renders innecesarios
  const shouldShowQR = useMemo(() => {
    return showQR || (isConnected && !!selfApp && !!universalLink)
  }, [showQR, isConnected, selfApp, universalLink])
  
  // Memoizar callbacks para evitar que SelfQRcodeWrapper se remonte
  const handleQRSuccess = useCallback(() => {
    console.log('QR verification successful')
    onVerificationSuccess()
  }, [onVerificationSuccess])
  
  const handleQRError = useCallback((err: unknown) => {
    console.error('QR verification error:', err)
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
      {shouldShowQR && selfApp && SelfQRcodeWrapper && (
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

      {/* Advertencia de gas fees - Solo mostrar si hay wallet, selfApp, y no se está mostrando QR */}
      {isConnected && selfApp && !shouldShowQR && !isVerifying && (
        <div className="p-3 bg-amber-900/20 border border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">
                Gas Fees Requeridos
              </p>
              <p className="text-xs text-amber-400/80 mt-1">
                Necesitas tokens CELO en tu wallet para pagar gas fees. Costo estimado: ~0.01 CELO
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción cuando hay wallet y selfApp */}
      {isConnected && selfApp && !isVerifying && (
        <div className="space-y-2">
          {/* Botón para abrir Self App o iniciar verificación */}
          <Button
            onClick={onVerify}
            disabled={isVerifying || !universalLink}
            className="w-full bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/30 hover:drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] transition-all duration-200 font-mono"
          >
            {isVerifying ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Esperando verificación...
              </>
            ) : (
              <>
                <span className="mr-2">🛡️</span>
                {isAuthenticated ? 'Abrir Self App' : 'Iniciar Verificación con Self'}
              </>
            )}
          </Button>

          {/* Botones de QR y copiar */}
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

// Contenido para verificación por contrato
function ContractVerificationContent({
  isVerified,
  verificationData,
  isVerifying,
  error,
  universalLink,
  linkCopied,
  selfApp,
  showQR,
  onVerify,
  onCopy,
  onClear,
  onToggleQR,
  onVerificationSuccess,
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
  onVerify: () => void
  onCopy: () => void
  onClear: () => void
  onToggleQR: () => void
  onVerificationSuccess: (data?: SelfVerificationData) => void
  isAuthenticated: boolean
}) {
  const connections = useConnections()
  const activeConnection = connections[0]
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined
  const isConnected = connections.length > 0 && !!address
  
  const connect = useConnect()
  const connectors = useConnectors()
  
  const handleConnectWallet = useCallback(() => {
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.id === 'farcasterFrame')
    const connector = farcasterConnector || connectors[0]
    if (connector) {
      connect.mutate({ connector })
    }
  }, [connectors, connect])

  const contractAddress = config.self.contractAddress
  const contractChain = config.self.endpointType

  if (!contractAddress) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-yellow-800 bg-yellow-900/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-yellow-300">
            <span>📄</span>
            Contrato No Desplegado
          </h4>
          <p className="text-sm text-zinc-400 mb-3">
            Despliega el contrato de verificación para habilitar verificación on-chain.
          </p>
          <div className="space-y-2 text-xs">
            <p className="font-mono bg-zinc-900 p-2 rounded border text-zinc-300">
              cd Contract && ./script/deploy-verification.sh
            </p>
            <p className="text-zinc-400">
              Luego agrega la dirección del contrato a <code className="bg-zinc-900 px-1 rounded">.env</code>:
            </p>
            <p className="font-mono bg-zinc-900 p-2 rounded border text-zinc-300">
              NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS=0x...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Por ahora, mostrar el mismo contenido que backend
  // La implementación completa de contract verification requiere polling de eventos blockchain
  // que se puede agregar después
  return (
    <div className="space-y-4">
      <div className="p-4 border border-blue-500/50 bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-300">
          <span>⛓️</span>
          Verificación On-Chain
        </h4>
        <p className="text-sm text-zinc-400">
          Verificación almacenada en blockchain {contractChain === 'celo' ? 'Celo' : 'Base'} para acceso descentralizado.
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
        onVerify={onVerify}
        onCopy={onCopy}
        onClear={onClear}
        onToggleQR={onToggleQR}
        onVerificationSuccess={onVerificationSuccess}
        onConnectWallet={handleConnectWallet}
        isAuthenticated={isAuthenticated}
      />

      <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800">
        <p><strong>Contrato:</strong></p>
        <p className="font-mono bg-zinc-900 p-2 rounded border break-all text-zinc-300">
          {contractAddress}
        </p>
        <p><strong>Red:</strong> {contractChain === 'celo' ? 'Celo Mainnet' : contractChain}</p>
      </div>
    </div>
  )
}

// Componente memoizado para el QR Code para evitar re-montajes innecesarios
const QRCodeDisplay = memo(({
  selfApp,
  onSuccess,
  onError
}: {
  selfApp: SelfApp
  onSuccess: () => void
  onError: (err: unknown) => void
}) => {
  if (!SelfQRcodeWrapper) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-zinc-400">Cargando QR code...</p>
        </div>
        <p className="text-xs text-zinc-400 text-center">
          Escanea con la app Self Protocol
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="bg-white p-4 rounded-lg border">
        {SelfQRcodeWrapper && (
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </div>
      <p className="text-xs text-zinc-400 text-center">
        Escanea con la app Self Protocol
      </p>
    </div>
  )
})

QRCodeDisplay.displayName = 'QRCodeDisplay'

// Importar SelfQRcodeWrapper dinámicamente
// Tipo del componente de QR code de Self Protocol
type SelfQRcodeWrapperType = React.ComponentType<{
  selfApp: SelfApp
  onSuccess: () => void
  onError: (err: unknown) => void
}>

let SelfQRcodeWrapper: SelfQRcodeWrapperType | null = null

if (typeof window !== 'undefined') {
  import('@selfxyz/qrcode').then((module) => {
    SelfQRcodeWrapper = module.SelfQRcodeWrapper as SelfQRcodeWrapperType
  }).catch(() => {
    console.warn('@selfxyz/qrcode no disponible')
  })
}
