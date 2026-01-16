import { Protocol } from '@/types/protocol'

export const aave: Protocol = {
  id: 'aave',
  name: 'Aave',
  title: 'AAVE Protocol',
  description: 'Explore the liquidity market titan, from Flash Loans to V3 Efficiency Mode.',
  briefing: [
    'Aave is one of the largest decentralized non-custodial liquidity markets. Users can participate as suppliers or borrowers. Suppliers provide liquidity to the market to earn a passive income, while borrowers are able to borrow in an over-collateralized (perpetual) or under-collateralized (one-block) fashion via Flash Loans.',
    'Aave V3 introduced Efficiency Mode (E-Mode), which allows borrowers to maximize their borrowing power when collateral and borrowed assets are price-correlated (e.g., stablecoins or LSTs like stETH/ETH). In E-Mode, the LTV can be significantly higher than in the standard market.',
    'The protocol is governed by AAVE token holders through the Aave DAO. A key component of its security is the Safety Module, a transition fund where users stake AAVE tokens. In the event of a shortfall (bad debt), these tokens can be auctioned to cover the deficit, protecting the depositors.',
    'GHO is Aave\'s native decentralized, over-collateralized stablecoin. It is minted by users against their collateral in the Aave protocol. Unlike centralized stablecoins, GHO is governed by the community, and all interest payments go directly to the Aave DAO treasury.',
    'Flash Loans are a signature feature of Aave. They allow users to borrow any amount of assets without collateral, provided that the liquidity is returned to the protocol within one single block transaction. If the funds aren\'t returned, the transaction fails, ensuring the protocol\'s safety.'
  ],
  category: 'lending',
  website: 'https://aave.com',
  chains: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'avalanche'],
  tvl: 15000000000, // $15B (ejemplo)
  apy: 3.5, // 3.5% APY promedio (ejemplo)
  features: [
    'Préstamos y préstamos descentralizados',
    'Tokens aTokens (intereses acumulados)',
    'Liquidación automática',
    'Múltiples cadenas',
    'Staking de AAVE',
    'Flash Loans',
    'Efficiency Mode (E-Mode)',
    'GHO stablecoin'
  ],
  risks: [
    'Riesgo de liquidación si el valor de la garantía cae',
    'Riesgo de smart contract',
    'Riesgo de volatilidad de criptomonedas'
  ],
  secretWord: 'GHO_GHOST_VAULT',
  poapEventId: 0, // Configurar en .env como POAP_EVENT_ID_AAVE
  status: 'public' // 'public' | 'draft' - por defecto es 'public'
}
