/**
 * Tipos relacionados con el sistema de quiz DeFi
 */

export interface Answer {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface Question {
  id: string
  text: string
  answers: Answer[]
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  protocol?: string // Protocolo DeFi relacionado (Aave, Uniswap, etc.)
  explanation?: string // Explicación general de la pregunta
}

export interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, string> // questionId -> answerId
  startTime: number | null
  endTime: number | null
  isCompleted: boolean
}

export interface QuizResult {
  userId: string
  userName: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number // en segundos
  isVerified: boolean
  verificationMethod: 'self' | 'wallet' | null
  verificationId?: string // ID de verificación Self
  walletAddress?: string // Dirección de wallet (si método wallet)
  signature?: string // Firma de wallet (si método wallet)
  timestamp: number
  answers: Array<{
    questionId: string
    answerId: string
    isCorrect: boolean
    timeSpent: number
  }>
}

export interface QuizProgress {
  current: number
  total: number
  percentage: number
}
