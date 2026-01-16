import { Protocol } from '@/types/protocol'

export const sablier: Protocol = {
  id: 'sablier',
  name: 'Sablier',
  title: 'Sablier',
  description: 'Understand continuous streaming of tokens and real-time payroll mechanics.',
  briefing: [
    'Sablier is a protocol for real-time finance. It enables the continuous streaming of tokens from a sender to a recipient. Instead of monthly or bi-weekly payouts, Sablier allows users to be paid second-by-second, which is particularly useful for payroll, vesting, and subscriptions.',
    'In Sablier V2, every stream is represented as an ERC-721 NFT. This means the right to receive the stream is transferable. If a recipient wants to sell their future stream of tokens, they can list the NFT on a secondary market like OpenSea, effectively liquidating their future earnings.',
    'There are different types of streams in Sablier. Linear streams release tokens at a constant rate over the duration of the stream. Non-linear streams can use exponential curves or custom cliff-based distributions to better match complex vesting schedules or tokenomics.',
    'The protocol is non-custodial. When a stream is created, the tokens are locked in the Sablier smart contract. The recipient can withdraw their \'accrued\' tokens at any time without needing permission from the sender, provided the stream hasn\'t been cancelled (if cancelable).',
    'Sablier helps eliminate \'trust issues\' in payments. Once a stream is funded and started, the recipient knows the funds are locked and being released. It\'s a key tool for DAOs to manage contributor rewards and for startups to handle employee token vesting automatically.'
  ],
  category: 'other',
  website: 'https://sablier.com',
  chains: ['ethereum', 'optimism', 'arbitrum', 'base', 'polygon'],
  tvl: 500000000, // $500M (ejemplo)
  apy: 0, // No APY (no es un protocolo de yield)
  features: [
    'Streaming de tokens en tiempo real',
    'Streams como NFTs (ERC-721)',
    'Streams lineales y no lineales',
    'Non-custodial',
    'Transferible (vender streams)',
    'Ideal para payroll y vesting',
    'Segundo a segundo'
  ],
  risks: [
    'Riesgo de smart contract',
    'Riesgo de cancelación (si es cancelable)',
    'Dependencia de la blockchain'
  ],
  secretWord: 'FLOW_STATE_SABLIER',
  poapEventId: 0, // Configurar en .env como POAP_EVENT_ID_SABLIER
  status: 'draft' // 'public' | 'draft' - Ejemplo de protocolo en borrador
}
