import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByProtocol } from '@/data/questions'

/**
 * API Route para obtener feedback después de responder
 * Solo devuelve si la respuesta es correcta y la explicación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolId, questionId, answerId } = body

    if (!protocolId || !questionId || !answerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Obtener preguntas
    const questions = getQuestionsByProtocol(protocolId)
    const question = questions.find(q => q.id === questionId)

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Encontrar respuesta
    const answer = question.answers.find(a => a.id === answerId)
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // Encontrar respuesta correcta
    const correctAnswer = question.answers.find(a => a.isCorrect)

    // Retornar feedback
    return NextResponse.json({
      isCorrect: answer.isCorrect,
      explanation: answer.explanation,
      correctAnswer: correctAnswer ? {
        id: correctAnswer.id,
        text: correctAnswer.text
      } : null,
      questionExplanation: question.explanation
    })
  } catch (error) {
    console.error('Error getting feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
