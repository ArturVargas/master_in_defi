/**
 * Constantes de la aplicación
 * Centraliza todos los valores mágicos para fácil mantenimiento
 */

export const QUIZ_CONFIG = {
  TIME_PER_QUESTION: 25, // segundos
  MIN_SCORE_TO_PASS: 3,
  TOKEN_EXPIRATION_MINUTES: 10,
  VERIFICATION_EXPIRATION_DAYS: 30,
  MIN_TIME_PER_QUESTION: 5, // segundos mínimos por pregunta (anti-cheat)
} as const

export const STORAGE_KEYS = {
  QUIZ_ANSWERS: (protocolId: string) => `quiz_answers_${protocolId}`,
  QUIZ_START_TIME: (protocolId: string) => `quiz_startTime_${protocolId}`,
  QUIZ_END_TIME: (protocolId: string) => `quiz_endTime_${protocolId}`,
  SELF_VERIFICATION: 'self_verification',
  WALLET_VERIFIED: (address: string) => `wallet_verified_${address}`,
  WALLET_SIGNATURE: (address: string) => `wallet_signature_${address}`,
} as const

export const ERROR_MESSAGES = {
  QUIZ_NOT_FOUND: 'No se encontró el quiz solicitado',
  INVALID_TOKEN: 'El enlace de resultados ha expirado. Por favor, completa el quiz nuevamente.',
  VERIFICATION_FAILED: 'La verificación falló. Por favor, intenta nuevamente.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  INVALID_REQUEST: 'Solicitud inválida. Por favor, verifica los datos enviados.',
  QUIZ_TOO_FAST: 'El quiz se completó demasiado rápido. Por favor, intenta nuevamente.',
  NOT_ALL_QUESTIONS_ANSWERED: 'Debes responder todas las preguntas para completar el quiz.',
} as const

export const SUCCESS_MESSAGES = {
  VERIFICATION_SUCCESS: 'Verificación completada exitosamente',
  QUIZ_COMPLETED: 'Quiz completado. Revisa tus resultados.',
  WALLET_VERIFIED: 'Wallet verificada exitosamente',
} as const
