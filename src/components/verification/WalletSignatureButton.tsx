'use client'

/**
 * Componente para verificación mediante firma de wallet
 * Basado en ConnectHub pero adaptado para nuestro caso
 */

import { memo, useCallback } from 'react'
import { useConnections, useConnect, useConnectors, useSignMessage, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '@/lib/constants'

interface WalletSignatureButtonProps {
  onVerified?: (address: string, signature: string) => void
  message?: string
}

function WalletSignatureButtonComponent({
  onVerified,
  message = 'Verifico que soy el propietario de esta wallet para acceder al quiz Master en DeFi'
}: WalletSignatureButtonProps) {
  const connections = useConnections()
  // En Wagmi v3, useConnections retorna conexiones activas
  const activeConnection = connections[0] // Primera conexión activa
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined
  const isConnected = connections.length > 0 && !!address

  const connect = useConnect()
  const connectors = useConnectors()
  const disconnect = useDisconnect()

  // Debug logging
  console.log('WalletSignatureButton render:', {
    connections: connections.length,
    isConnected,
    address,
    availableConnectors: connectors.map(c => ({ id: c.id, name: c.name })),
    connectPending: connect.isPending
  })
  const signMessage = useSignMessage({
    mutation: {
      onSuccess: async (signature: `0x${string}`) => {
        if (address) {
          try {
            // Verificar firma en backend
            const response = await fetch('/api/verify-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address, signature, message })
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.verified) {
                // Guardar en localStorage
                localStorage.setItem(STORAGE_KEYS.WALLET_VERIFIED(address), 'true')
                localStorage.setItem(STORAGE_KEYS.WALLET_SIGNATURE(address), signature)
                
                // Notificar al contexto
                window.dispatchEvent(new CustomEvent('wallet-verified', {
                  detail: { address, signature }
                }))
                
                onVerified?.(address, signature)
              }
            }
          } catch (err) {
            console.error('Error verifying signature:', err)
          }
        }
      }
    }
  })

  const handleConnect = useCallback(() => {
    // Prioridad de connectors:
    // 1. Injected (MetaMask, Coinbase Wallet, etc.) - para uso normal
    // 2. WalletConnect - para wallets móviles
    // 3. Farcaster - solo en Farcaster Mini Apps

    const injectedConnector = connectors.find(c => c.id === 'injected')
    const walletConnectConnector = connectors.find(c => c.id === 'walletConnect')
    const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp' || c.id === 'farcaster')

    // Usar injected primero (MetaMask, etc.)
    const connector = injectedConnector || walletConnectConnector || farcasterConnector || connectors[0]

    if (connector) {
      console.log('Connecting with connector:', connector.id, connector.name)
      connect.mutate({ connector })
    } else {
      console.error('No connector available, connectors:', connectors)
    }
  }, [connectors, connect])

  const handleSign = useCallback(() => {
    if (address) {
      signMessage.mutate({ message })
    }
  }, [address, signMessage, message])

  const handleDisconnect = useCallback(() => {
    console.log('Disconnecting wallet...')
    if (address) {
      localStorage.removeItem(STORAGE_KEYS.WALLET_VERIFIED(address))
      localStorage.removeItem(STORAGE_KEYS.WALLET_SIGNATURE(address))
    }
    disconnect.disconnect()
  }, [disconnect, address])

  if (signMessage.isSuccess && address) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-green-500 text-xl">✓</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Wallet verificada</p>
            <p className="text-xs text-zinc-400 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            className="text-xs"
          >
            Desconectar
          </Button>
        </div>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <Button
          onClick={handleConnect}
          disabled={connect.isPending}
          className="w-full bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/30 hover:drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] transition-all duration-200 font-mono"
        >
          {connect.isPending ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Conectando...
            </>
          ) : (
            'Conectar Wallet'
          )}
        </Button>
        <p className="text-xs text-zinc-400 text-center">
          Conecta tu wallet para verificar tu identidad
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
        <p className="text-xs text-zinc-400 mb-2">Wallet conectada:</p>
        <p className="text-sm font-mono text-white">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      
      <Button
        onClick={handleSign}
        disabled={signMessage.isPending}
        className="w-full bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] hover:bg-[#00ff88]/30 hover:drop-shadow-[0_0_12px_rgba(0,255,136,0.8)] transition-all duration-200 font-mono"
      >
        {signMessage.isPending ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Firmando...
          </>
        ) : (
          'Firmar Mensaje para Verificar'
        )}
      </Button>

      {signMessage.isError && (
        <p className="text-xs text-red-400 text-center">
          Error: {signMessage.error?.message || 'Error al firmar mensaje'}
        </p>
      )}

      <p className="text-xs text-zinc-400 text-center">
        Al firmar, confirmas que eres el propietario de esta wallet
      </p>
    </div>
  )
}

// Memoizar componente para evitar re-renders innecesarios
export const WalletSignatureButton = memo(WalletSignatureButtonComponent)
