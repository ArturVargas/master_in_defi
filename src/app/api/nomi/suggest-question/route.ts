/**
 * POST /api/nomi/suggest-question
 * Genera una pregunta sugerida por Nomi Echo para un protocolo.
 * Body: { protocolId: string, topic?: string }
 * Flujo: context-upload (docs del protocolo) → agent/question → devuelve pregunta y temas sugeridos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProtocolById } from '@/lib/db/protocols'
import { getNomiEchoClient } from '@/lib/nomi'
import {
  NomiEchoConfigError,
  NomiEchoResponseError,
  NomiEchoTimeoutError,
} from '@/lib/nomi/errors'
function buildDocsFromProtocol(protocol: {
  name: string
  title: string | null
  description: string | null
  docs: string | null
}): string {
  const fullDocs = (protocol.docs || '').trim()
  if (fullDocs) return fullDocs
  const title = protocol.title || protocol.name
  const desc = (protocol.description || '').trim()
  if (!desc) return title
  return `${title}\n\n${desc}`
}

function mapNomiErrorToResponse(error: unknown): NextResponse {
  if (error instanceof NomiEchoConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 })
  }
  if (error instanceof NomiEchoTimeoutError) {
    return NextResponse.json({ error: error.message }, { status: 504 })
  }
  if (error instanceof NomiEchoResponseError) {
    const status =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 502
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status }
    )
  }
  console.error('[nomi suggest-question]', error)
  return NextResponse.json(
    {
      error:
        error instanceof Error ? error.message : 'Error al generar sugerencia',
    },
    { status: 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolId, topic } = body as { protocolId?: string; topic?: string }

    if (!protocolId || typeof protocolId !== 'string' || !protocolId.trim()) {
      return NextResponse.json(
        { error: 'protocolId es obligatorio' },
        { status: 400 }
      )
    }

    const protocol = await getProtocolById(protocolId.trim())
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocolo no encontrado' },
        { status: 404 }
      )
    }

    const docs = buildDocsFromProtocol(protocol)
    if (!docs.trim()) {
      return NextResponse.json(
        {
          error:
            'El protocolo no tiene documentación. Añade "Documentación completa" en Admin > Protocolos.',
        },
        { status: 400 }
      )
    }

    const client = getNomiEchoClient()

    const contextResult = await client.contextUpload({
      text: docs,
      maxWords: 400,
    })
    const contextId = contextResult?.contextId
    if (!contextId) {
      return NextResponse.json(
        { error: 'No se pudo crear el contexto para el protocolo' },
        { status: 502 }
      )
    }

    const questionResult = await client.agentQuestion({
      contextId,
      ...(topic && typeof topic === 'string' && topic.trim() && { topic: topic.trim() }),
    })

    return NextResponse.json({
      data: {
        question: questionResult.question,
        suggestedTopics: questionResult.suggestedTopics ?? [],
      },
    })
  } catch (error) {
    return mapNomiErrorToResponse(error)
  }
}
