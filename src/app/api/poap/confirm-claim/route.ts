import { NextRequest, NextResponse } from 'next/server'
import { markCodeAsClaimed, getCodeByQrHash } from '@/lib/db/poap-codes'

/**
 * POST /api/poap/confirm-claim
 * Marca un código POAP como completamente reclamado cuando el usuario
 * visita POAP.xyz para mintear el NFT
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimCode, walletAddress } = body

    if (!claimCode) {
      return NextResponse.json(
        { success: false, message: 'Claim code is required' },
        { status: 400 }
      )
    }

    // Buscar el código en la base de datos usando la función exportada
    const code = await getCodeByQrHash(claimCode)

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Claim code not found' },
        { status: 404 }
      )
    }

    // Marcar como reclamado con timestamp actualizado
    await markCodeAsClaimed(code.id, walletAddress || 'unknown', undefined, undefined)

    console.log(`[POAP Confirm] ✅ Code ${claimCode} confirmed as claimed by ${walletAddress}`)

    return NextResponse.json({
      success: true,
      message: 'Claim confirmed successfully'
    })

  } catch (error) {
    console.error('Error confirming POAP claim:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
