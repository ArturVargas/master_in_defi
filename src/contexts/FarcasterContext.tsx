'use client'

/**
 * Context para Farcaster Mini App
 * Basado en ConnectHub
 * Proporciona acceso a datos del usuario de Farcaster
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePlatformDetection } from '@/hooks/usePlatformDetection'

interface FarcasterUser {
  fid: number | null
  username: string | null
  displayName: string | null
  pfpUrl: string | null
}

interface FarcasterContextType {
  user: FarcasterUser | null
  isConnected: boolean
  isLoading: boolean
  error: Error | null
}

const FarcasterContext = createContext<FarcasterContextType>({
  user: null,
  isConnected: false,
  isLoading: true,
  error: null,
})

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const { isFarcaster } = usePlatformDetection()
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadFarcasterUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!isFarcaster) {
          // No está en Farcaster, no hay usuario
          setUser(null)
          setIsLoading(false)
          return
        }

        // Intentar obtener datos del usuario desde Farcaster SDK
        // Usar @farcaster/miniapp-sdk (versión actual)
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          
          // CRÍTICO: Llamar ready() para ocultar el splash screen
          // Esto debe llamarse cuando la app esté lista para mostrar contenido
          await sdk.actions.ready()
          
          const context = await sdk.context
          
          if (context?.user) {
            setUser({
              fid: context.user.fid || null,
              username: context.user.username || null,
              displayName: context.user.displayName || null,
              pfpUrl: context.user.pfpUrl || null,
            })
          } else {
            setUser(null)
          }
        } catch (sdkError) {
          // SDK no disponible o no está en contexto de Farcaster
          console.warn('Farcaster SDK no disponible:', sdkError)
          setUser(null)
        }
      } catch (err) {
        console.error('Error cargando usuario de Farcaster:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadFarcasterUser()
  }, [isFarcaster])

  return (
    <FarcasterContext.Provider
      value={{
        user,
        isConnected: !!user,
        isLoading,
        error,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  )
}

export function useFarcaster() {
  const context = useContext(FarcasterContext)
  if (!context) {
    throw new Error('useFarcaster must be used within FarcasterProvider')
  }
  return context
}
