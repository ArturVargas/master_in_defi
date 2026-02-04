/**
 * POST /api/nomi/context-upload
 * Sube docs del protocolo (desde BD) a Nomi Echo y devuelve contextId y brief.
 * Body: { protocolId: string, maxWords?: number } — Quiz: 400 por defecto; Clase virtual: 650
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProtocolById } from '@/lib/db/protocols'
import { getNomiEchoClient } from '@/lib/nomi'
import {
  NomiEchoConfigError,
  NomiEchoResponseError,
  NomiEchoTimeoutError,
} from '@/lib/nomi/errors'

/**
 * Construye el texto "docs" para Nomi Echo.
 * Prioridad: docs (documentación completa) si existe y no está vacío; sino description + título.
 */
function buildDocsFromProtocol(protocol: {
  name: string
  title: string | null
  description: string | null
  docs: string | null
}): string {
  const fullDocs = (protocol.docs || '').trim()
  if (fullDocs) {
    return fullDocs
  }
  const title = protocol.title || protocol.name
  const desc = (protocol.description || '').trim()
  if (!desc) {
    return title
  }
  return `${title}\n\n${desc}`
}

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
  console.error('[nomi context-upload]', error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Error al conectar con Nomi Echo' },
    { status: 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocolId, maxWords } = body as { protocolId?: string; maxWords?: number }

    if (!protocolId || typeof protocolId !== 'string') {
      return NextResponse.json(
        { error: 'protocolId es obligatorio' },
        { status: 400 }
      )
    }

    const protocol = await getProtocolById(protocolId)
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocolo no encontrado' },
        { status: 404 }
      )
    }

    const docs = buildDocsFromProtocol(protocol)
    if (!docs.trim()) {
      return NextResponse.json(
        { error: 'El protocolo no tiene documentación (docs) ni descripción en la base de datos. Añade "Documentación completa" en Admin > Protocolos.' },
        { status: 400 }
      )
    }

    const client = getNomiEchoClient()
    const result = await client.contextUpload({
      text: docs,
      maxWords: maxWords ?? 400,
    })

    return NextResponse.json({
      data: {
        contextId: result.contextId,
        brief: result.brief,
        language: result.language,
        ...(result.localId != null && { localId: result.localId }),
        ...(result.wordCount != null && { wordCount: result.wordCount }),
        ...(result.createdAt != null && { createdAt: result.createdAt }),
      },
    })
  } catch (error) {
    return mapNomiErrorToResponse(error)
  }
}
