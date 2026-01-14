'use client'

/**
 * Context unificado de verificación
 * Combina Self Protocol y Wallet Signature
 * Basado en ConnectHub pero adaptado para nuestro caso de uso
 */

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useSelf } from './SelfContext'
import { useConnections } from 'wagmi'
import { VerificationMethod } from '@/types/verification'
import { STORAGE_KEYS } from '@/lib/constants'

interface VerificationContextType {
  isVerified: boolean
  verificationMethod: VerificationMethod | null
  verificationId?: string
  walletAddress?: string
  isLoading: boolean
}

const VerificationContext = createContext<VerificationContextType>({
  isVerified: false,
  verificationMethod: null,
  isLoading: false,
})

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { isVerified: isSelfVerified, verificationData, isLoading: selfLoading } = useSelf()
  const connections = useConnections()
  // En Wagmi v2, useConnections retorna conexiones activas
  const activeConnection = connections[0] // Primera conexión activa
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined
  
  // Estado para wallet verification (solo en cliente)
  // Inicializar como false para SSR, se actualizará en el cliente
  const [walletVerified, setWalletVerified] = useState(false)

  // Función para verificar wallet verification desde localStorage
  const checkWalletVerification = useCallback(() => {
    if (typeof window !== 'undefined' && address) {
      try {
        const verified = localStorage.getItem(STORAGE_KEYS.WALLET_VERIFIED(address)) === 'true'
        setWalletVerified(verified)
      } catch {
        setWalletVerified(false)
      }
    } else {
      setWalletVerified(false)
    }
  }, [address])

  // Verificar si hay wallet signature guardada (solo en cliente)
  // Esto evita problemas de hidratación al no acceder a localStorage durante SSR
  useEffect(() => {
    checkWalletVerification()
  }, [checkWalletVerification])

  // Escuchar evento cuando se verifica wallet para actualizar inmediatamente
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleWalletVerified = () => {
      // Actualizar inmediatamente cuando se verifica
      checkWalletVerification()
    }

    window.addEventListener('wallet-verified', handleWalletVerified)
    
    return () => {
      window.removeEventListener('wallet-verified', handleWalletVerified)
    }
  }, [checkWalletVerification])

  const isVerified = isSelfVerified || walletVerified
  const verificationMethod: VerificationMethod | null = 
    isSelfVerified ? 'self' : 
    walletVerified ? 'wallet' : 
    null

  // isLoading solo depende de selfLoading, wallet verification se carga en el cliente
  const isLoading = selfLoading

  return (
    <VerificationContext.Provider
      value={{
        isVerified,
        verificationMethod,
        verificationId: verificationData?.verificationId,
        walletAddress: walletVerified ? address : undefined,
        isLoading,
      }}
    >
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider')
  }
  return context
}
