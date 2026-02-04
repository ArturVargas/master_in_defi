'use client'

/**
 * Context para Self Protocol
 * Gestiona el estado de verificación con Self Protocol (backend offchain mode)
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useConnections } from 'wagmi'
import { config } from '@/lib/config'
import { STORAGE_KEYS, QUIZ_CONFIG } from '@/lib/constants'
import { SelfVerificationData, SelfApp } from '@/types/self'

interface SelfContextType {
  isVerified: boolean
  verificationData: SelfVerificationData | null
  isLoading: boolean
  isVerifying: boolean
  error: string | null
  universalLink: string | null
  selfApp: SelfApp | null
  showWidget: boolean
  setShowWidget: (show: boolean) => void
  verify: (verificationId: string, method: 'backend' | 'contract', data?: Partial<SelfVerificationData>) => void
  clearVerification: () => void
  initiateSelfVerification: () => Promise<void>
  checkVerificationStatus: () => Promise<void>
}

const SelfContext = createContext<SelfContextType>({
  isVerified: false,
  verificationData: null,
  isLoading: false,
  isVerifying: false,
  error: null,
  universalLink: null,
  selfApp: null,
  showWidget: false,
  setShowWidget: () => {},
  verify: () => {},
  clearVerification: () => {},
  initiateSelfVerification: async () => {},
  checkVerificationStatus: async () => {},
})

export function SelfProvider({ children }: { children: ReactNode }) {
  const connections = useConnections()
  const activeConnection = connections[0]
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined

  const [verificationData, setVerificationData] = useState<SelfVerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [universalLink, setUniversalLink] = useState<string | null>(null)
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [showWidget, setShowWidget] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Load saved verification on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(STORAGE_KEYS.SELF_VERIFICATION)
    if (saved) {
      try {
        const data = JSON.parse(saved) as SelfVerificationData
        if (data.verified && data.timestamp) {
          const expirationTime = QUIZ_CONFIG.VERIFICATION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
          if (Date.now() - data.timestamp < expirationTime) {
            setVerificationData(data)
          } else {
            localStorage.removeItem(STORAGE_KEYS.SELF_VERIFICATION)
          }
        }
      } catch (err) {
        console.error('Error loading saved verification:', err)
        localStorage.removeItem(STORAGE_KEYS.SELF_VERIFICATION)
      }
    }
  }, [])

  // Initialize Self App when address changes
  useEffect(() => {
    if (!address) {
      setSelfApp(null)
      setUniversalLink(null)
      return
    }

    const initSelfApp = async () => {
      try {
        const { SelfAppBuilder, getUniversalLink } = await import('@selfxyz/qrcode')

        const endpoint = config.self.backendEndpoint || `${config.farcaster.siteUrl}/api/verify-self`

        console.log('[SelfContext] Initializing Self App:', {
          endpoint,
          endpointType: config.self.endpointType,
          scope: config.self.scope,
          userId: address,
        })

        const app = new SelfAppBuilder({
          version: 2,
          appName: config.self.appName,
          scope: config.self.scope,
          endpoint,
          deeplinkCallback: config.self.deeplinkCallback,
          logoBase64: config.self.logoUrl,
          userId: address,
          endpointType: config.self.endpointType,
          userIdType: 'hex',
          disclosures: {
            minimumAge: 18,
            excludedCountries: [],
            ofac: false,
            date_of_birth: true,
            name: false,
            nationality: false,
          }
        }).build()

        setSelfApp(app as SelfApp)
        setUniversalLink(getUniversalLink(app))
      } catch (err) {
        console.error('Error initializing Self App:', err)
        setError('Error inicializando Self Protocol')
      }
    }

    initSelfApp()
  }, [address])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const verify = useCallback((verificationId: string, method: 'backend' | 'contract', data?: Partial<SelfVerificationData>) => {
    const verification: SelfVerificationData = {
      verified: true,
      verificationId,
      timestamp: Date.now(),
      method,
      ...data,
    }

    setVerificationData(verification)
    setError(null)
    setIsVerifying(false)

    localStorage.setItem(STORAGE_KEYS.SELF_VERIFICATION, JSON.stringify(verification))
  }, [])

  const clearVerification = useCallback(() => {
    setVerificationData(null)
    setError(null)
    setIsVerifying(false)
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    localStorage.removeItem(STORAGE_KEYS.SELF_VERIFICATION)
  }, [pollingInterval])

  // Poll /api/verify-self/check to detect verification completion
  const checkVerificationStatus = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch('/api/verify-self/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: address })
      })

      const data = await response.json()

      if (data.verified) {
        verify(`backend_${Date.now()}`, 'backend', {
          date_of_birth: data.date_of_birth,
          name: data.name,
          nationality: data.nationality,
        })

        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err)
    }
  }, [address, verify, pollingInterval])

  // Open Self app (deeplink or browser) and start polling
  const initiateSelfVerification = useCallback(async () => {
    if (!universalLink || !address) {
      setError('Self Protocol no inicializado')
      return
    }

    setIsVerifying(true)
    setError(null)

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }

    try {
      // Try Farcaster SDK first
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        const isInMiniAppResult = await sdk.isInMiniApp()

        if (isInMiniAppResult) {
          await sdk.actions.openUrl(universalLink)
          console.log('[SelfContext] Opened Self app via Farcaster SDK')
        } else {
          window.open(universalLink, '_blank')
          console.log('[SelfContext] Opened Self app in browser')
        }
      } catch {
        window.open(universalLink, '_blank')
        console.log('[SelfContext] Opened Self app in browser (fallback)')
      }

      // Start polling for verification result
      let pollAttempts = 0
      const maxPollAttempts = 60 // 5 minutes (60 * 5s)

      const interval = setInterval(async () => {
        pollAttempts++

        if (pollAttempts > maxPollAttempts) {
          clearInterval(interval)
          setPollingInterval(null)
          setIsVerifying(false)
          setError('Timeout: La verificación está tomando más tiempo del esperado')
          console.log('[SelfContext] Polling timeout after', pollAttempts, 'attempts')
          return
        }

        await checkVerificationStatus()
      }, 5000)

      setPollingInterval(interval)

    } catch (err) {
      console.error('Error opening Self app:', err)
      setError('Error al abrir Self Protocol')
      setIsVerifying(false)
    }
  }, [universalLink, address, checkVerificationStatus, pollingInterval])

  return (
    <SelfContext.Provider
      value={{
        isVerified: verificationData?.verified || false,
        verificationData,
        isLoading,
        isVerifying,
        error,
        universalLink,
        selfApp,
        showWidget,
        setShowWidget,
        verify,
        clearVerification,
        initiateSelfVerification,
        checkVerificationStatus,
      }}
    >
      {children}
    </SelfContext.Provider>
  )
}

export function useSelf() {
  const context = useContext(SelfContext)
  if (!context) {
    throw new Error('useSelf must be used within SelfProvider')
  }
  return context
}
