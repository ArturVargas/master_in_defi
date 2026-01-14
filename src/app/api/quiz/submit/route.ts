import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByProtocol } from '@/data/questions'
import { getProtocolById } from '@/data/protocols'
import { setQuizToken } from '@/lib/quiz-tokens'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolId, answers, startTime, endTime } = body

    if (!protocolId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Validar que el protocolo existe
    const protocol = getProtocolById(protocolId)
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      )
    }

    // Obtener preguntas del servidor (con respuestas correctas)
    const questions = getQuestionsByProtocol(protocolId)
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found' },
        { status: 404 }
      )
    }

    // Validar que se respondieron todas las preguntas
    if (Object.keys(answers).length !== questions.length) {
      return NextResponse.json(
        { error: 'Not all questions were answered' },
        { status: 400 }
      )
    }

    // Calcular score en el servidor
    let correctAnswers = 0
    const questionResults: Array<{ questionId: string; isCorrect: boolean }> = []

    questions.forEach((question) => {
      const userAnswerId = answers[question.id]
      if (!userAnswerId) {
        questionResults.push({ questionId: question.id, isCorrect: false })
        return
      }

      const userAnswer = question.answers.find(a => a.id === userAnswerId)
      const isCorrect = userAnswer?.isCorrect ?? false

      if (isCorrect) {
        correctAnswers++
      }

      questionResults.push({ questionId: question.id, isCorrect })
    })

    // Validar tiempo mínimo (opcional - prevenir respuestas demasiado rápidas)
    if (startTime && endTime) {
      const timeSpent = (endTime - startTime) / 1000 // segundos
      const minTime = questions.length * 5 // mínimo 5 segundos por pregunta
      
      if (timeSpent < minTime) {
        return NextResponse.json(
          { error: 'Quiz completed too quickly. Please try again.' },
          { status: 400 }
        )
      }
    }

    // Generar token temporal (expira en 10 minutos)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutos

    setQuizToken(token, {
      score: correctAnswers,
      total: questions.length,
      protocolId,
      expiresAt
    })

    // Retornar token y score (sin palabra secreta aún)
    return NextResponse.json({
      token,
      score: correctAnswers,
      total: questions.length,
      passed: correctAnswers >= 3,
      expiresAt
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
