import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, DefaultConfigStore, AllIds } from '@selfxyz/core'

// Declare global type for verification cache
declare global {
  // eslint-disable-next-line no-var
  var verificationCache: Map<string, {
    verified: boolean
    date_of_birth?: string
    name?: string
    nationality?: string
    timestamp: number
  }> | undefined
}

// Initialize the Self Backend Verifier
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || 'defi-quiz-app',
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`,
  process.env.NEXT_PUBLIC_SELF_USE_MOCK === 'true',
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false
  }),
  'hex'
)

export async function POST(request: NextRequest) {
  console.log('[verify-self] POST endpoint hit')

  try {
    const body = await request.json()
    const { attestationId, proof, publicSignals, userContextData } = body

    console.log('[verify-self] Request received:', {
      attestationId,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals,
      userContextData
    })

    // Verify the attestation
    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    )

    console.log('[verify-self] Verification result:', {
      isValid: result.isValidDetails.isValid,
      isMinimumAgeValid: result.isValidDetails.isMinimumAgeValid,
      hasDiscloseOutput: !!result.discloseOutput
    })

    const { isValid, isMinimumAgeValid } = result.isValidDetails

    if (!isValid || !isMinimumAgeValid) {
      return NextResponse.json({
        status: 'error',
        result: false,
        reason: 'Verification failed - User does not meet requirements'
      }, { status: 200 })
    }

    // Extract date of birth (YYMMDD -> YYYY-MM-DD)
    const dateOfBirthRaw = result.discloseOutput?.dateOfBirth
    let dateOfBirth: string | undefined
    if (dateOfBirthRaw && dateOfBirthRaw.length === 6) {
      const yy = dateOfBirthRaw.substring(0, 2)
      const mm = dateOfBirthRaw.substring(2, 4)
      const dd = dateOfBirthRaw.substring(4, 6)
      const yyyy = parseInt(yy) >= 50 ? `19${yy}` : `20${yy}`
      dateOfBirth = `${yyyy}-${mm}-${dd}`
    }

    // Extract wallet address from userContextData
    let walletAddress: string | null = null
    try {
      const hexData = userContextData.slice(64)
      const addressHex = '0x' + hexData.slice(24, 64)
      walletAddress = addressHex.toLowerCase()
      console.log('[verify-self] Extracted wallet:', walletAddress)
    } catch (err) {
      console.error('[verify-self] Failed to extract wallet:', err)
    }

    // Store in global cache for polling
    if (walletAddress) {
      global.verificationCache = global.verificationCache || new Map()
      global.verificationCache.set(walletAddress, {
        verified: true,
        date_of_birth: dateOfBirth || '',
        name: result.discloseOutput?.name || '',
        nationality: result.discloseOutput?.nationality || '',
        timestamp: Date.now()
      })
      console.log('[verify-self] Stored verification for:', walletAddress)
    }

    return NextResponse.json({
      status: 'success',
      result: true,
      data: {
        date_of_birth: dateOfBirth,
        name: result.discloseOutput?.name || '',
        nationality: result.discloseOutput?.nationality || ''
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[verify-self] Error:', error)
    return NextResponse.json({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Self Protocol verification endpoint is active',
    scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'defi-quiz-app'
  })
}
