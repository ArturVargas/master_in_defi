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

  // Efecto 1: Llamar ready() para ocultar el splash.
  // En mobile el SDK puede inyectarse más tarde en el WebView, así que intentamos
  // varias veces (inmediato + delays) para que funcione también en Warpcast móvil.
  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '')

    const callReady = async () => {
      if (cancelled) return
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        if (!cancelled) await sdk.actions.ready()
      } catch {
        // SDK no disponible aún o no estamos en Farcaster
      }
    }

    callReady()
    if (isMobile) {
      const t1 = window.setTimeout(callReady, 400)
      const t2 = window.setTimeout(callReady, 1200)
      const t3 = window.setTimeout(callReady, 2500)
      return () => {
        cancelled = true
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadFarcasterUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!isFarcaster) {
          setUser(null)
          setIsLoading(false)
          return
        }

        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
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
