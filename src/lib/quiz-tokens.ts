/**
 * Almacenamiento temporal de tokens de quiz
 * En producción, usar Redis o base de datos
 */

interface QuizTokenData {
  score: number
  total: number
  protocolId: string
  expiresAt: number
}

const quizTokens = new Map<string, QuizTokenData>()

// Limpiar tokens expirados cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of quizTokens.entries()) {
    if (data.expiresAt < now) {
      quizTokens.delete(token)
    }
  }
}, 5 * 60 * 1000)

export function setQuizToken(token: string, data: QuizTokenData) {
  quizTokens.set(token, data)
}

export function getQuizToken(token: string): QuizTokenData | undefined {
  const data = quizTokens.get(token)
  
  // Verificar expiración
  if (data && data.expiresAt < Date.now()) {
    quizTokens.delete(token)
    return undefined
  }
  
  return data
}

export function deleteQuizToken(token: string) {
  quizTokens.delete(token)
}
