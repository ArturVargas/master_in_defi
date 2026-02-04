/**
 * POST /api/nomi/agent/question
 * Genera una pregunta y su audio (base64) a partir del contextId en Nomi Echo.
 * Body: { contextId: string, sessionId?: string, topic?: string }
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
  console.error('[nomi agent/question]', error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Error al generar la pregunta' },
    { status: 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contextId, sessionId, topic } = body as {
      contextId?: string
      sessionId?: string
      topic?: string
    }

    if (!contextId || typeof contextId !== 'string' || !contextId.trim()) {
      return NextResponse.json(
        { error: 'contextId es obligatorio' },
        { status: 400 }
      )
    }

    const client = getNomiEchoClient()
    const result = await client.agentQuestion({
      contextId: contextId.trim(),
      ...(sessionId && typeof sessionId === 'string' && { sessionId: sessionId.trim() }),
      ...(topic && typeof topic === 'string' && { topic: topic.trim() }),
    })

    return NextResponse.json({
      question: result.question,
      questionAudio: result.questionAudio,
      language: result.language,
      suggestedTopics: result.suggestedTopics,
      interactionId: result.interactionId,
      sessionId: result.sessionId,
    })
  } catch (error) {
    return mapNomiErrorToResponse(error)
  }
}
