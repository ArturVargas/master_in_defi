import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    global.verificationCache = global.verificationCache || new Map()

    const normalizedUserId = userId.toLowerCase()
    const verification = global.verificationCache.get(normalizedUserId)

    if (verification) {
      const oneHourAgo = Date.now() - 3600000

      // Clean up expired entries
      if (verification.timestamp < oneHourAgo) {
        global.verificationCache.delete(normalizedUserId)
        return NextResponse.json({ verified: false })
      }

      return NextResponse.json({
        verified: verification.verified,
        date_of_birth: verification.date_of_birth,
        name: verification.name,
        nationality: verification.nationality
      })
    }

    return NextResponse.json({ verified: false })

  } catch (error) {
    console.error('[verify-self/check] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
