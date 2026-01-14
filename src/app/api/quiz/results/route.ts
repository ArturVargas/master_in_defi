import { NextRequest, NextResponse } from 'next/server'
import { getProtocolById } from '@/data/protocols'
import { getQuizToken, deleteQuizToken } from '@/lib/quiz-tokens'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      )
    }

    // Validar token (incluye verificación de expiración)
    const tokenData = getQuizToken(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
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
    return NextResponse.json({
      score: tokenData.score,
      total: tokenData.total,
      passed: tokenData.score >= 3,
      secretWord: tokenData.score >= 3 ? protocol.secretWord : null,
      protocolName: protocol.title || protocol.name
    })
  } catch (error) {
    console.error('Error getting results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
