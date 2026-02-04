/**
 * POST /api/nomi/agent/analyze-response
 * Envía el audio de la respuesta del usuario a Nomi Echo y devuelve análisis y score.
 * Multipart: audio (archivo), contextId, sessionId?, originalQuestion, originalQuestionId?
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNomiEchoClient } from '@/lib/nomi'
import {
  NomiEchoConfigError,
  NomiEchoResponseError,
  NomiEchoTimeoutError,
} from '@/lib/nomi/errors'

function mapNomiErrorToResponse(error: unknown): NextResponse {
  if (error instanceof NomiEchoConfigError) {
    return NextResponse.json(
      { error: error.message },
      { status: 503 }
    )
  }
  if (error instanceof NomiEchoTimeoutError) {
    return NextResponse.json(
      { error: error.message },
      { status: 504 }
    )
  }
  if (error instanceof NomiEchoResponseError) {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 502
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status }
    )
  }
  console.error('[nomi agent/analyze-response]', error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Error al analizar la respuesta' },
    { status: 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio')
    const contextId = formData.get('contextId')
    const sessionId = formData.get('sessionId')
    const originalQuestion = formData.get('originalQuestion')
    const originalQuestionId = formData.get('originalQuestionId')

    if (!audio || !(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json(
        { error: 'audio es obligatorio y debe ser un archivo no vacío' },
        { status: 400 }
      )
    }

    if (!contextId || typeof contextId !== 'string' || !contextId.trim()) {
      return NextResponse.json(
        { error: 'contextId es obligatorio' },
        { status: 400 }
      )
    }

    if (!originalQuestion || typeof originalQuestion !== 'string' || !originalQuestion.trim()) {
      return NextResponse.json(
        { error: 'originalQuestion es obligatorio' },
        { status: 400 }
      )
    }

    const client = getNomiEchoClient()
    const result = await client.agentAnalyzeResponse({
      audio,
      contextId: String(contextId).trim(),
      ...(sessionId && typeof sessionId === 'string' && sessionId.trim() && {
        sessionId: String(sessionId).trim(),
      }),
      originalQuestion: String(originalQuestion).trim(),
      ...(originalQuestionId && typeof originalQuestionId === 'string' && originalQuestionId.trim() && {
        originalQuestionId: String(originalQuestionId).trim(),
      }),
    })

    return NextResponse.json({
      analysis: result.analysis,
      feedback: result.feedback,
      suggestions: result.suggestions,
      correctAnswer: result.correctAnswer,
    })
  } catch (error) {
    return mapNomiErrorToResponse(error)
  }
}
