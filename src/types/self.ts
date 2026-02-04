/**
 * Tipos para Self Protocol
 */

// Re-export SelfApp from the SDK for type compatibility
export type { SelfApp } from '@selfxyz/qrcode'

export interface SelfVerificationData {
  verified: boolean
  verificationId?: string
  timestamp?: number
  method?: 'backend' | 'contract'
  date_of_birth?: string
  name?: string
  nationality?: string
  txHash?: string
}
