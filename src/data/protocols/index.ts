import { Protocol } from '@/types/protocol'
import { aave } from './aave'

export const protocols: Protocol[] = [
  aave,
  // Aquí se agregarán más protocolos en el futuro
  // uniswap, compound, etc.
]

export function getProtocolById(id: string): Protocol | undefined {
  return protocols.find(p => p.id === id)
}

export function getProtocolsByCategory(category: Protocol['category']): Protocol[] {
  return protocols.filter(p => p.category === category)
}
