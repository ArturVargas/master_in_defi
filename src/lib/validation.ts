/**
 * Validación de datos para API routes y formularios
 * Validaciones simples sin dependencias externas
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Valida que un objeto tenga las propiedades requeridas
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = []

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Campo requerido: ${field}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Valida formato de dirección Ethereum
 */
export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Valida formato de firma Ethereum
 */
export function validateEthereumSignature(signature: string): boolean {
  return /^0x[a-fA-F0-9]{130}$/.test(signature)
}

/**
 * Valida que un número esté en un rango
 */
export function validateRange(
  value: number,
  min: number,
  max: number
): ValidationResult {
  if (value < min || value > max) {
    return {
      valid: false,
      errors: [`El valor debe estar entre ${min} y ${max}`],
    }
  }

  return { valid: true, errors: [] }
}

/**
 * Valida estructura de respuestas del quiz
 */
export function validateQuizAnswers(
  answers: unknown
): ValidationResult {
  if (!answers || typeof answers !== 'object') {
    return {
      valid: false,
      errors: ['Las respuestas deben ser un objeto'],
    }
  }

  const answersObj = answers as Record<string, unknown>

  // Validar que todas las respuestas sean strings (o convertibles a string)
  for (const [questionId, answerId] of Object.entries(answersObj)) {
    const q = questionId != null ? String(questionId) : ''
    const a = answerId != null ? String(answerId) : ''
    if (q === '' || a === '') {
      return {
        valid: false,
        errors: ['Las respuestas deben ser strings válidos'],
      }
    }
  }

  return { valid: true, errors: [] }
}

/**
 * Valida timestamps
 */
export function validateTimestamps(
  startTime: unknown,
  endTime: unknown
): ValidationResult {
  const errors: string[] = []

  if (typeof startTime !== 'number' || startTime <= 0) {
    errors.push('startTime debe ser un número positivo')
  }

  if (typeof endTime !== 'number' || endTime <= 0) {
    errors.push('endTime debe ser un número positivo')
  }

  // Solo comparar si ambos son números válidos
  if (
    errors.length === 0 &&
    typeof startTime === 'number' &&
    typeof endTime === 'number' &&
    startTime > endTime
  ) {
    errors.push('startTime debe ser menor que endTime')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
