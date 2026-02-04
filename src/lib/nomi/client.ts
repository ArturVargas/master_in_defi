/**
 * Cliente REST para Nomi Echo
 * Solo uso server-side. Gestiona timeouts, errores y respuestas no OK.
 * @see docs/MASTER_DEFI_CLASE_VIRTUAL_SPEC.md
 */

import { nomiEchoConfig } from './config'
import {
  NomiEchoConfigError,
  NomiEchoError,
  NomiEchoResponseError,
  NomiEchoTimeoutError,
} from './errors'
import type {
  ContextUploadBody,
  ContextUploadResponse,
  VoiceSynthesizeBody,
  AgentQuestionBody,
  AgentQuestionResponse,
  AnalyzeResponseResult,
  AnalyzeResponseFormData,
} from './types'

const DEFAULT_LANGUAGE = 'es-MX'

/**
 * Crea un AbortSignal que cancela la petición tras timeoutMs
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const signal = controller.signal
  ;(signal as AbortSignal & { _clear?: () => void })._clear = () =>
    clearTimeout(timeoutId)
  return signal
}

/**
 * Parsea el cuerpo de error de una respuesta (JSON o texto)
 */
async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()
  if (contentType.includes('application/json') && text) {
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }
  return text || { status: response.status, statusText: response.statusText }
}

/**
 * Lanza NomiEchoResponseError con el cuerpo parseado
 */
async function throwForResponse(response: Response): Promise<never> {
  const details = await parseErrorBody(response)
  const message =
    typeof details === 'object' && details !== null && 'message' in details
      ? String((details as { message: unknown }).message)
      : typeof details === 'string'
        ? details
        : `Nomi Echo respondió con ${response.status} ${response.statusText}`
  throw new NomiEchoResponseError(message, response.status, details)
}

/**
 * Ejecuta fetch con timeout y lanza errores tipados en caso de fallo
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const { timeoutMs = nomiEchoConfig.timeoutMs, ...fetchOptions } = options
  const signal = createTimeoutSignal(timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal,
    })
    if (!response.ok) {
      await throwForResponse(response)
    }
    return response
  } catch (error) {
    if (error instanceof NomiEchoResponseError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NomiEchoTimeoutError()
    }
    throw new NomiEchoError(
      error instanceof Error ? error.message : 'Error de conexión con Nomi Echo',
      { code: 'NOMI_ECHO_NETWORK_ERROR', details: error }
    )
  }
}

/**
 * Cliente Nomi Echo (solo servidor)
 */
export class NomiEchoClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(options?: { baseUrl?: string; timeoutMs?: number }) {
    const url = options?.baseUrl ?? nomiEchoConfig.baseUrl
    if (!url) {
      throw new NomiEchoConfigError(
        'NOMI_ECHO_API_URL no está configurada en las variables de entorno'
      )
    }
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
    this.timeoutMs = options?.timeoutMs ?? nomiEchoConfig.timeoutMs
  }

  /**
   * POST /api/context/upload
   * Sube texto (docs del protocolo) y obtiene contextId y brief.
   * Quiz: maxWords 400 por defecto. Clase virtual: maxWords 650.
   */
  async contextUpload(
    body: ContextUploadBody
  ): Promise<ContextUploadResponse> {
    const url = `${this.baseUrl}/api/context/upload`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: body.text,
        maxWords: body.maxWords ?? 400,
        ...(body.ttl != null && { ttl: body.ttl }),
      }),
      timeoutMs: this.timeoutMs,
    })

    const raw = (await response.json()) as ContextUploadResponse | { success?: boolean; data?: ContextUploadResponse }
    const data: ContextUploadResponse =
      typeof raw === 'object' && raw !== null && 'data' in raw && raw.data && typeof raw.data === 'object' && 'contextId' in raw.data && 'brief' in raw.data
        ? (raw.data as ContextUploadResponse)
        : (raw as ContextUploadResponse)
    if (!data?.contextId || typeof data.brief !== 'string') {
      throw new NomiEchoResponseError(
        'Respuesta inválida de Nomi Echo (context/upload): faltan contextId o brief',
        response.status,
        raw
      )
    }
    return data
  }

  /**
   * POST /api/voice/synthesize
   * Genera audio (MP3) a partir del texto. Devuelve el buffer de audio.
   */
  async voiceSynthesize(
    text: string,
    language: string = DEFAULT_LANGUAGE
  ): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/api/voice/synthesize`
    const body: VoiceSynthesizeBody = { text, language }
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeoutMs: this.timeoutMs,
    })

    const buffer = await response.arrayBuffer()
    return buffer
  }

  /**
   * POST /api/agent/question
   * Genera una pregunta y su audio (base64) a partir del contexto.
   */
  async agentQuestion(
    params: AgentQuestionBody
  ): Promise<AgentQuestionResponse> {
    const url = `${this.baseUrl}/api/agent/question`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextId: params.contextId,
        ...(params.sessionId && { sessionId: params.sessionId }),
        ...(params.topic && { topic: params.topic }),
      }),
      timeoutMs: this.timeoutMs,
    })

    const data = (await response.json()) as AgentQuestionResponse
    if (!data.question) {
      throw new NomiEchoResponseError(
        'Respuesta inválida de Nomi Echo (agent/question): falta question',
        response.status,
        data
      )
    }
    return data
  }

  /**
   * POST /api/agent/analyze-response (multipart)
   * Envía el audio de la respuesta del usuario y recibe análisis y score.
   */
  async agentAnalyzeResponse(
    form: AnalyzeResponseFormData
  ): Promise<AnalyzeResponseResult> {
    const url = `${this.baseUrl}/api/agent/analyze-response`
    const formData = new FormData()
    formData.append('audio', form.audio)
    formData.append('contextId', form.contextId)
    if (form.sessionId) {
      formData.append('sessionId', form.sessionId)
    }
    formData.append('originalQuestion', form.originalQuestion)
    if (form.originalQuestionId) {
      formData.append('originalQuestionId', form.originalQuestionId)
    }

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type; fetch pone multipart boundary
      timeoutMs: this.timeoutMs,
    })

    const data = (await response.json()) as AnalyzeResponseResult
    if (
      !data.analysis ||
      typeof data.analysis !== 'object' ||
      typeof (data.analysis as { score?: unknown }).score !== 'number'
    ) {
      throw new NomiEchoResponseError(
        'Respuesta inválida de Nomi Echo (agent/analyze-response): falta analysis.score',
        response.status,
        data
      )
    }
    return data
  }
}

let defaultClient: NomiEchoClient | null = null

/**
 * Obtiene la instancia por defecto del cliente Nomi Echo (singleton)
 */
export function getNomiEchoClient(): NomiEchoClient {
  if (!defaultClient) {
    defaultClient = new NomiEchoClient()
  }
  return defaultClient
}
