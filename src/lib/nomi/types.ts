/**
 * Tipos para la API Nomi Echo
 * @see docs/MASTER_DEFI_CLASE_VIRTUAL_SPEC.md
 */

/** Respuesta de POST /api/context/upload */
export interface ContextUploadResponse {
  contextId: string
  localId?: string
  brief: string
  language: string
  wordCount?: number
  createdAt?: string
}

/** Body de POST /api/context/upload */
export interface ContextUploadBody {
  text: string
  maxWords?: number // 100–1000; quiz 400, Clase virtual: 650
  ttl?: number
}

/** Body de POST /api/voice/synthesize */
export interface VoiceSynthesizeBody {
  text: string
  language?: string // ej. "es-MX"
}

/** Respuesta de POST /api/agent/question */
export interface AgentQuestionResponse {
  question: string
  questionAudio?: string // base64 MP3
  language: string
  suggestedTopics?: string[]
  interactionId?: string
  sessionId?: string
}

/** Body de POST /api/agent/question */
export interface AgentQuestionBody {
  contextId: string
  sessionId?: string
  topic?: string
}

/** Análisis de una respuesta (parte de analyze-response) */
export interface ResponseAnalysis {
  completeness?: number
  accuracy?: number
  relevance?: number
  score: number // 0.0–1.0
}

/** Respuesta de POST /api/agent/analyze-response */
export interface AnalyzeResponseResult {
  analysis: ResponseAnalysis
  feedback?: string
  suggestions?: string[]
  correctAnswer?: string
}

/** Campos multipart para analyze-response */
export interface AnalyzeResponseFormData {
  audio: Blob | File
  contextId: string
  sessionId?: string
  originalQuestion: string
  originalQuestionId?: string
}
