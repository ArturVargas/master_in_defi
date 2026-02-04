import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByProtocol } from '@/lib/db/questions'
import { getProtocolById } from '@/lib/db/protocols'

/**
 * API Route para obtener preguntas SIN respuestas correctas
 * Esto previene web scraping de las respuestas
 * ACTUALIZADO: Ahora usa base de datos en lugar de archivos hardcodeados
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const protocolId = searchParams.get('protocolId')

    if (!protocolId) {
      return NextResponse.json(
        { error: 'protocolId required' },
        { status: 400 }
      )
    }

    // Validar que el protocolo existe (ahora desde BD)
    const protocol = await getProtocolById(protocolId)
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      )
    }

    // Obtener preguntas (ahora desde BD, solo activas)
    const questions = await getQuestionsByProtocol(protocolId, false)

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found' },
        { status: 404 }
      )
    }

    // Retornar preguntas SIN información de respuestas correctas
    const safeQuestions = questions.map((question) => ({
      id: question.id,
      text: question.text,
      // Respuestas SIN isCorrect ni explanation
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text
        // NO incluir isCorrect ni explanation
      }))
    }))

    return NextResponse.json({
      data: {
        protocol: {
          id: protocol.id,
          name: protocol.name,
          title: protocol.title
        },
        questions: safeQuestions,
        total: safeQuestions.length
      }
    })
  } catch (error) {
    console.error('Error getting questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
