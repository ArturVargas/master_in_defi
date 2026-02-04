/**
 * POST /api/nomi/voice/synthesize
 * Genera audio (MP3) del texto vía Nomi Echo. Devuelve el buffer de audio.
 * Body: { text: string, language?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNomiEchoClient } from '@/lib/nomi'
import {
  NomiEchoConfigError,
  NomiEchoResponseError,
  NomiEchoTimeoutError,
} from '@/lib/nomi/errors'

const DEFAULT_LANGUAGE = 'es-MX'

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
  console.error('[nomi voice/synthesize]', error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Error al sintetizar voz' },
    { status: 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language } = body as { text?: string; language?: string }

    if (text == null || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'text es obligatorio y no puede estar vacío' },
        { status: 400 }
      )
    }

    const client = getNomiEchoClient()
    const buffer = await client.voiceSynthesize(
      text.trim(),
      typeof language === 'string' && language ? language : DEFAULT_LANGUAGE
    )

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    return mapNomiErrorToResponse(error)
  }
}
