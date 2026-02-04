/**
 * Errores del cliente Nomi Echo
 * Gestiona timeouts, respuestas no OK y errores de red
 */

export class NomiEchoError extends Error {
  readonly statusCode?: number
  readonly code: string
  readonly details?: unknown

  constructor(
    message: string,
    options?: {
      statusCode?: number
      code?: string
      details?: unknown
    }
  ) {
    super(message)
    this.name = 'NomiEchoError'
    this.statusCode = options?.statusCode
    this.code = options?.code ?? 'NOMI_ECHO_ERROR'
    this.details = options?.details
    Object.setPrototypeOf(this, NomiEchoError.prototype)
  }
}

/** Error por timeout en la petición */
export class NomiEchoTimeoutError extends NomiEchoError {
  constructor(message = 'La petición a Nomi Echo ha superado el tiempo máximo de espera.') {
    super(message, { code: 'NOMI_ECHO_TIMEOUT' })
    this.name = 'NomiEchoTimeoutError'
    Object.setPrototypeOf(this, NomiEchoTimeoutError.prototype)
  }
}

/** Error por respuesta HTTP no OK (4xx, 5xx) */
export class NomiEchoResponseError extends NomiEchoError {
  constructor(
    message: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message, {
      statusCode,
      code: 'NOMI_ECHO_RESPONSE_ERROR',
      details,
    })
    this.name = 'NomiEchoResponseError'
    Object.setPrototypeOf(this, NomiEchoResponseError.prototype)
  }
}

/** Error de configuración (URL no definida, etc.) */
export class NomiEchoConfigError extends NomiEchoError {
  constructor(message: string) {
    super(message, { code: 'NOMI_ECHO_CONFIG_ERROR' })
    this.name = 'NomiEchoConfigError'
    Object.setPrototypeOf(this, NomiEchoConfigError.prototype)
  }
}
