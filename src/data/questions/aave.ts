import { Question } from '@/types/quiz'

export const aaveQuestions: Question[] = [
  {
    id: 'a1',
    text: 'What is the primary characteristic of an Aave Flash Loan?',
    category: 'lending',
    difficulty: 'medium',
    protocol: 'aave',
    answers: [
      {
        id: 'a1-0',
        text: 'It must be repaid within 24 hours',
        isCorrect: false,
        explanation: 'Flash Loans must be repaid within the same transaction, not 24 hours.'
      },
      {
        id: 'a1-1',
        text: 'It requires 200% collateral',
        isCorrect: false,
        explanation: 'Flash Loans do not require any collateral - that\'s their key feature.'
      },
      {
        id: 'a1-2',
        text: 'It must be borrowed and repaid within the same blockchain transaction',
        isCorrect: true,
        explanation: 'Correct! Flash Loans must be borrowed and repaid within a single blockchain transaction. If the funds aren\'t returned, the entire transaction fails, ensuring protocol safety.'
      },
      {
        id: 'a1-3',
        text: 'It is only available to institutional investors',
        isCorrect: false,
        explanation: 'Flash Loans are available to anyone, not just institutional investors.'
      }
    ],
    explanation: 'Flash Loans are a signature feature of Aave that allows borrowing without collateral, as long as the loan is repaid within the same transaction.'
  },
  {
    id: 'a2',
    text: 'What is \'E-Mode\' in Aave V3?',
    category: 'lending',
    difficulty: 'medium',
    protocol: 'aave',
    answers: [
      {
        id: 'a2-0',
        text: 'Emergency Mode for protocol pauses',
        isCorrect: false,
        explanation: 'E-Mode is not for emergency pauses.'
      },
      {
        id: 'a2-1',
        text: 'Efficiency Mode for high LTV between correlated assets',
        isCorrect: true,
        explanation: 'Correct! Efficiency Mode (E-Mode) allows borrowers to maximize borrowing power when collateral and borrowed assets are price-correlated (e.g., stablecoins or LSTs like stETH/ETH).'
      },
      {
        id: 'a2-2',
        text: 'Easy Mode for new users',
        isCorrect: false,
        explanation: 'E-Mode is not a simplified mode for new users.'
      },
      {
        id: 'a2-3',
        text: 'Ethereum-only Mode',
        isCorrect: false,
        explanation: 'E-Mode is available on multiple chains, not just Ethereum.'
      }
    ],
    explanation: 'E-Mode in Aave V3 allows for higher LTV ratios when using correlated assets as collateral, maximizing capital efficiency.'
  },
  {
    id: 'a3',
    text: 'Which token is the native decentralized stablecoin of the Aave ecosystem?',
    category: 'lending',
    difficulty: 'easy',
    protocol: 'aave',
    answers: [
      {
        id: 'a3-0',
        text: 'USDT',
        isCorrect: false,
        explanation: 'USDT is a centralized stablecoin, not native to Aave.'
      },
      {
        id: 'a3-1',
        text: 'DAI',
        isCorrect: false,
        explanation: 'DAI is MakerDAO\'s stablecoin, not Aave\'s native stablecoin.'
      },
      {
        id: 'a3-2',
        text: 'GHO',
        isCorrect: true,
        explanation: 'Correct! GHO is Aave\'s native decentralized, over-collateralized stablecoin. It is minted by users against their collateral, and all interest payments go to the Aave DAO treasury.'
      },
      {
        id: 'a3-3',
        text: 'PYUSD',
        isCorrect: false,
        explanation: 'PYUSD is PayPal\'s stablecoin, not Aave\'s.'
      }
    ],
    explanation: 'GHO is Aave\'s native stablecoin, governed by the community and minted against collateral in the Aave protocol.'
  },
  {
    id: 'a4',
    text: 'What are \'aTokens\'?',
    category: 'lending',
    difficulty: 'easy',
    protocol: 'aave',
    answers: [
      {
        id: 'a4-0',
        text: 'Governance tokens used for voting only',
        isCorrect: false,
        explanation: 'aTokens are not governance tokens - AAVE is the governance token.'
      },
      {
        id: 'a4-1',
        text: 'Interest-bearing tokens that increase in value/amount as interest accrues',
        isCorrect: true,
        explanation: 'Correct! aTokens (like aUSDC, aETH) represent deposits in Aave and automatically accrue interest. Their value increases over time as interest is earned.'
      },
      {
        id: 'a4-2',
        text: 'Voucher tokens for Aave merchandise',
        isCorrect: false,
        explanation: 'aTokens are not vouchers - they represent actual deposits with accrued interest.'
      },
      {
        id: 'a4-3',
        text: 'Tokens used to pay gas fees on Aave',
        isCorrect: false,
        explanation: 'aTokens are not used for gas fees - they represent deposits.'
      }
    ],
    explanation: 'aTokens are ERC-20 tokens that represent deposits in Aave. They automatically accrue interest, increasing in value over time.'
  },
  {
    id: 'a5',
    text: 'What is the \'Safety Module\' in Aave used for?',
    category: 'lending',
    difficulty: 'medium',
    protocol: 'aave',
    answers: [
      {
        id: 'a5-0',
        text: 'Staking AAVE to act as a backstop in case of a shortfall event',
        isCorrect: true,
        explanation: 'Correct! The Safety Module is a transition fund where users stake AAVE tokens. In the event of a shortfall (bad debt), these tokens can be auctioned to cover the deficit, protecting depositors.'
      },
      {
        id: 'a5-1',
        text: 'Storing private keys for users',
        isCorrect: false,
        explanation: 'Aave is non-custodial - it does not store private keys.'
      },
      {
        id: 'a5-2',
        text: 'Automated trading',
        isCorrect: false,
        explanation: 'The Safety Module is not for automated trading.'
      },
      {
        id: 'a5-3',
        text: 'Protecting the UI from hackers',
        isCorrect: false,
        explanation: 'The Safety Module protects against protocol shortfalls, not UI security.'
      }
    ],
    explanation: 'The Safety Module is a key security component of Aave, providing a backstop fund to protect depositors in case of protocol shortfalls.'
  }
]
