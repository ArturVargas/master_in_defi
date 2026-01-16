import { Protocol } from '@/types/protocol'

export const morpho: Protocol = {
  id: 'morpho',
  name: 'Morpho',
  title: 'Morpho Protocol',
  description: 'Master the efficiency of peer-to-peer matching and the trustless nature of Morpho Blue.',
  briefing: [
    'Morpho is a decentralized lending protocol that improves the efficiency of existing lending pools like Aave and Compound. It works by matching lenders and borrowers peer-to-peer (P2P) whenever possible. This matching allows both parties to enjoy \'P2P rates,\' which are better than the standard pool rates, as they bypass the spread kept by the liquidity pool.',
    'The latest iteration, Morpho Blue, is a highly efficient and trustless lending primitive. Unlike traditional protocols that use a single monolithic pool with shared risk, Morpho Blue allows for the creation of isolated markets. Each market is defined by a loan asset, a collateral asset, an Oracle, and an LLTV (Liquidation Loan-to-Value) ratio.',
    'Because Morpho Blue is a base-layer primitive, it doesn\'t have built-in risk management at the protocol level. Instead, it relies on MetaMorpho, a layer of lending vaults that sit on top of Morpho Blue. Curators manage these vaults, deciding which markets to allocate capital to and setting specific risk parameters for their users.',
    'Liquidation in Morpho is purely functional. If a borrower\'s position exceeds the LLTV, any user can liquidate the position to maintain protocol solvency. The LLTV is the maximum ratio of debt to collateral allowed before liquidation is triggered, ensuring the system remains over-collateralized at all times.'
  ],
  category: 'lending',
  website: 'https://morpho.org',
  chains: ['ethereum', 'optimism', 'arbitrum', 'base'],
  tvl: 2000000000, // $2B (ejemplo)
  apy: 4.2, // 4.2% APY promedio (ejemplo)
  features: [
    'Peer-to-peer matching (P2P)',
    'Morpho Blue - lending primitive',
    'Isolated markets',
    'MetaMorpho vaults',
    'Curator-managed risk',
    'Efficient liquidity utilization',
    'Lower spreads than traditional pools'
  ],
  risks: [
    'Riesgo de liquidación si LLTV se excede',
    'Riesgo de smart contract',
    'Riesgo de mercado aislado',
    'Dependencia de oráculos'
  ],
  secretWord: 'EFFICIENT_LIQUIDITY_88',
  poapEventId: 0, // Configurar en .env como POAP_EVENT_ID_MORPHO
  status: 'public' // 'public' | 'draft'
}
