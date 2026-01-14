import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByProtocol } from '@/data/questions'
import { getProtocolById } from '@/data/protocols'
import { setQuizToken } from '@/lib/quiz-tokens'
import { QUIZ_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { validateRequired, validateQuizAnswers, validateTimestamps } from '@/lib/validation'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolId, answers, startTime, endTime, verificationMethod } = body

    // Validar campos requeridos
    const requiredValidation = validateRequired(body, ['protocolId', 'answers'])
    if (!requiredValidation.valid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST, details: requiredValidation.errors },
        { status: 400 }
      )
    }

    // Validar estructura de respuestas
    const answersValidation = validateQuizAnswers(answers)
    if (!answersValidation.valid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST, details: answersValidation.errors },
        { status: 400 }
      )
    }

    // Validar timestamps si están presentes
    if (startTime !== undefined || endTime !== undefined) {
      const timestampsValidation = validateTimestamps(startTime, endTime)
      if (!timestampsValidation.valid) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.INVALID_REQUEST, details: timestampsValidation.errors },
          { status: 400 }
        )
      }
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
        { error: ERROR_MESSAGES.NOT_ALL_QUESTIONS_ANSWERED },
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
      const minTime = questions.length * QUIZ_CONFIG.MIN_TIME_PER_QUESTION
      
      if (timeSpent < minTime) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.QUIZ_TOO_FAST },
          { status: 400 }
        )
      }
    }

    // Generar token temporal (expira según configuración)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + QUIZ_CONFIG.TOKEN_EXPIRATION_MINUTES * 60 * 1000

    setQuizToken(token, {
      score: correctAnswers,
      total: questions.length,
      protocolId,
      expiresAt,
      verificationMethod: verificationMethod || null
    })

    // Retornar token y score (sin palabra secreta aún)
    return NextResponse.json({
      token,
      score: correctAnswers,
      total: questions.length,
      passed: correctAnswers >= QUIZ_CONFIG.MIN_SCORE_TO_PASS,
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
