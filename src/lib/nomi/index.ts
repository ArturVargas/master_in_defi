/**
 * Módulo Nomi Echo – cliente REST (solo servidor)
 * Uso: getNomiEchoClient() y luego contextUpload, voiceSynthesize, agentQuestion, agentAnalyzeResponse
 */

export { NomiEchoClient, getNomiEchoClient } from './client'
export { nomiEchoConfig } from './config'
export {
  NomiEchoError,
  NomiEchoTimeoutError,
  NomiEchoResponseError,
  NomiEchoConfigError,
} from './errors'
export type {
  ContextUploadBody,
  ContextUploadResponse,
  VoiceSynthesizeBody,
  AgentQuestionBody,
  AgentQuestionResponse,
  AnalyzeResponseFormData,
  AnalyzeResponseResult,
  ResponseAnalysis,
} from './types'
