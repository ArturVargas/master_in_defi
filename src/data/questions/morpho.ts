import { Question } from '@/types/quiz'

export const morphoQuestions: Question[] = [
  {
    id: 'm1',
    text: 'What is the core architectural innovation of Morpho Blue?',
    category: 'lending',
    difficulty: 'medium',
    protocol: 'morpho',
    answers: [
      {
        id: 'm1-0',
        text: 'A monolithic pool for all assets',
        isCorrect: false,
        explanation: 'Morpho Blue uses isolated markets, not a monolithic pool.'
      },
      {
        id: 'm1-1',
        text: 'A trustless, immutable, and permissionless lending primitive',
        isCorrect: true,
        explanation: 'Correct! Morpho Blue is a highly efficient and trustless lending primitive that allows for isolated markets, unlike traditional protocols with shared risk pools.'
      },
      {
        id: 'm1-2',
        text: 'A centralized risk management engine',
        isCorrect: false,
        explanation: 'Morpho Blue is decentralized and doesn\'t have built-in risk management at the protocol level.'
      },
      {
        id: 'm1-3',
        text: 'A cross-chain bridge for NFTs',
        isCorrect: false,
        explanation: 'Morpho Blue is a lending protocol, not a bridge.'
      }
    ],
    explanation: 'Morpho Blue is a base-layer lending primitive that enables isolated markets, each defined by loan asset, collateral asset, Oracle, and LLTV ratio.'
  },
  {
    id: 'm2',
    text: 'How does Morpho Optimizer improve rates for users?',
    category: 'lending',
    difficulty: 'easy',
    protocol: 'morpho',
    answers: [
      {
        id: 'm2-0',
        text: 'By charging higher fees to lenders',
        isCorrect: false,
        explanation: 'Morpho actually reduces fees by bypassing pool spreads.'
      },
      {
        id: 'm2-1',
        text: 'By matching lenders and borrowers peer-to-peer on top of underlying pools',
        isCorrect: true,
        explanation: 'Correct! Morpho matches lenders and borrowers peer-to-peer (P2P) whenever possible, allowing both parties to enjoy better P2P rates that bypass the spread kept by liquidity pools.'
      },
      {
        id: 'm2-2',
        text: 'By minting synthetic assets',
        isCorrect: false,
        explanation: 'Morpho doesn\'t mint synthetic assets - it matches real lenders and borrowers.'
      },
      {
        id: 'm2-3',
        text: 'By liquidating undercollateralized positions faster',
        isCorrect: false,
        explanation: 'While Morpho has liquidation mechanisms, the rate improvement comes from P2P matching, not faster liquidations.'
      }
    ],
    explanation: 'Morpho Optimizer improves rates by matching lenders and borrowers peer-to-peer, bypassing the spread that traditional pools charge.'
  },
  {
    id: 'm3',
    text: 'In the context of MetaMorpho, what is a \'Curator\'?',
    category: 'lending',
    difficulty: 'hard',
    protocol: 'morpho',
    answers: [
      {
        id: 'm3-0',
        text: 'An entity that designs the UI',
        isCorrect: false,
        explanation: 'Curators manage vault allocations and risk, not UI design.'
      },
      {
        id: 'm3-1',
        text: 'An automated bot that trades on DEXs',
        isCorrect: false,
        explanation: 'Curators are risk experts, not trading bots.'
      },
      {
        id: 'm3-2',
        text: 'A risk expert that manages vault allocations and risk parameters',
        isCorrect: true,
        explanation: 'Correct! Curators are risk experts who manage MetaMorpho vaults, deciding which markets to allocate capital to and setting specific risk parameters for their users.'
      },
      {
        id: 'm3-3',
        text: 'A user who only provides liquidity',
        isCorrect: false,
        explanation: 'Curators do more than provide liquidity - they manage risk and allocations.'
      }
    ],
    explanation: 'Curators are risk experts who manage MetaMorpho vaults, providing the risk management layer that Morpho Blue lacks at the protocol level.'
  },
  {
    id: 'm4',
    text: 'Which of these is NOT a parameter of a Morpho Blue market?',
    category: 'lending',
    difficulty: 'easy',
    protocol: 'morpho',
    answers: [
      {
        id: 'm4-0',
        text: 'Loan Asset',
        isCorrect: false,
        explanation: 'Loan Asset is a required parameter of a Morpho Blue market.'
      },
      {
        id: 'm4-1',
        text: 'Collateral Asset',
        isCorrect: false,
        explanation: 'Collateral Asset is a required parameter of a Morpho Blue market.'
      },
      {
        id: 'm4-2',
        text: 'LLTV (Liquidation Loan-to-Value)',
        isCorrect: false,
        explanation: 'LLTV is a required parameter of a Morpho Blue market.'
      },
      {
        id: 'm4-3',
        text: 'User\'s Credit Score',
        isCorrect: true,
        explanation: 'Correct! Morpho Blue markets are defined by loan asset, collateral asset, Oracle, and LLTV. Credit scores are not part of the market parameters - the protocol is trustless and permissionless.'
      }
    ],
    explanation: 'Morpho Blue markets are defined by loan asset, collateral asset, Oracle, and LLTV ratio. Credit scores are not used, as the protocol is over-collateralized and trustless.'
  },
  {
    id: 'm5',
    text: 'What does \'LLTV\' stand for in Morpho Blue?',
    category: 'lending',
    difficulty: 'medium',
    protocol: 'morpho',
    answers: [
      {
        id: 'm5-0',
        text: 'Long Live Total Value',
        isCorrect: false,
        explanation: 'LLTV is not an acronym for "Long Live Total Value".'
      },
      {
        id: 'm5-1',
        text: 'Liquidation Loan-To-Value',
        isCorrect: true,
        explanation: 'Correct! LLTV (Liquidation Loan-to-Value) is the maximum ratio of debt to collateral allowed before liquidation is triggered. It ensures the system remains over-collateralized.'
      },
      {
        id: 'm5-2',
        text: 'Layered Lending Total Volume',
        isCorrect: false,
        explanation: 'LLTV is not about volume, it\'s about the liquidation threshold.'
      },
      {
        id: 'm5-3',
        text: 'Leveraged Loan Trading Velocity',
        isCorrect: false,
        explanation: 'LLTV is not about trading velocity.'
      }
    ],
    explanation: 'LLTV (Liquidation Loan-to-Value) is the maximum debt-to-collateral ratio before liquidation can occur, ensuring protocol solvency.'
  }
]
