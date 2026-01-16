/**
 * Tipos relacionados con protocolos DeFi
 */

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  chain: string
  logoUrl?: string
}

export interface Protocol {
  id: string
  name: string
  title?: string // Alias para name (compatibilidad con JSON)
  description: string
  briefing: string[] // Array de párrafos educativos sobre el protocolo
  category: 'lending' | 'dex' | 'yield' | 'derivatives' | 'insurance' | 'other'
  website: string
  logoUrl?: string
  chains: string[] // Cadenas donde está disponible
  tokens?: Token[]
  tvl?: number // Total Value Locked
  apy?: number // Annual Percentage Yield
  features: string[]
  risks?: string[]
  secretWord?: string // Palabra secreta del protocolo (para gamificación)
  poapEventId?: number // ID del evento POAP para este protocolo
  status?: 'public' | 'draft' // Estado del protocolo (por defecto 'public')
}

export interface ProtocolStats {
  protocolId: string
  totalUsers: number
  totalVolume: number
  averageApy: number
  lastUpdated: number
}
