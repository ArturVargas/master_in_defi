import { NextRequest, NextResponse } from 'next/server'
import { getProtocolById } from '@/data/protocols'
import { getQuizToken, deleteQuizToken } from '@/lib/quiz-tokens'
import { QUIZ_CONFIG, ERROR_MESSAGES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: 400 }
      )
    }

    // Validar token (incluye verificación de expiración)
    const tokenData = getQuizToken(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_TOKEN },
        { status: 401 }
      )
    }

    // Obtener protocolo
    const protocol = getProtocolById(tokenData.protocolId)
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      )
    }

    // Retornar resultados (incluyendo palabra secreta si pasó)
    const passed = tokenData.score >= QUIZ_CONFIG.MIN_SCORE_TO_PASS
    return NextResponse.json({
      score: tokenData.score,
      total: tokenData.total,
      passed,
      secretWord: passed ? protocol.secretWord : null,
      protocolName: protocol.title || protocol.name,
      verificationMethod: tokenData.verificationMethod || null
    })
  } catch (error) {
    console.error('Error getting results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
