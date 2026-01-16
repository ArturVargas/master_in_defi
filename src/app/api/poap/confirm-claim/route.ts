import { NextRequest, NextResponse } from 'next/server'
import { markCodeAsClaimed } from '@/lib/db/poap-codes'
import { neon } from '@neondatabase/serverless'
import { config } from '@/lib/config'

const sqlClient = neon(config.database.url)

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

    // Obtener el código
    const codes = await sqlClient`
      SELECT id FROM poap_codes
      WHERE qr_hash = ${claimCode}
      LIMIT 1
    `

    if (codes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Claim code not found' },
        { status: 404 }
      )
    }

    const codeId = codes[0].id

    // Marcar como reclamado con timestamp actualizado
    await markCodeAsClaimed(codeId, walletAddress || 'unknown', undefined, undefined)

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
