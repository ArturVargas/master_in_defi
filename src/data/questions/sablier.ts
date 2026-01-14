import { Question } from '@/types/quiz'

export const sablierQuestions: Question[] = [
  {
    id: 's1',
    text: 'How does Sablier distribute tokens over time?',
    category: 'other',
    difficulty: 'easy',
    protocol: 'sablier',
    answers: [
      {
        id: 's1-0',
        text: 'In lump sums every month',
        isCorrect: false,
        explanation: 'Sablier streams tokens continuously, not in monthly lump sums.'
      },
      {
        id: 's1-1',
        text: 'Continuously, second-by-second',
        isCorrect: true,
        explanation: 'Correct! Sablier enables continuous streaming of tokens second-by-second, allowing users to be paid in real-time rather than waiting for periodic payouts.'
      },
      {
        id: 's1-2',
        text: 'Only when the sender triggers a release',
        isCorrect: false,
        explanation: 'Sablier streams automatically - the sender doesn\'t need to trigger each release.'
      },
      {
        id: 's1-3',
        text: 'Based on the recipient\'s performance',
        isCorrect: false,
        explanation: 'Sablier streams are time-based, not performance-based.'
      }
    ],
    explanation: 'Sablier distributes tokens continuously, second-by-second, making it ideal for payroll, vesting, and subscriptions where real-time payments are beneficial.'
  },
  {
    id: 's2',
    text: 'In Sablier V2, what technology is used to represent a stream?',
    category: 'other',
    difficulty: 'medium',
    protocol: 'sablier',
    answers: [
      {
        id: 's2-0',
        text: 'An ERC-20 token',
        isCorrect: false,
        explanation: 'Streams are represented as NFTs, not ERC-20 tokens.'
      },
      {
        id: 's2-1',
        text: 'An ERC-721 NFT',
        isCorrect: true,
        explanation: 'Correct! In Sablier V2, every stream is represented as an ERC-721 NFT, making the right to receive the stream transferable and tradeable on secondary markets like OpenSea.'
      },
      {
        id: 's2-2',
        text: 'A Merkle Tree',
        isCorrect: false,
        explanation: 'Sablier uses NFTs, not Merkle Trees, to represent streams.'
      },
      {
        id: 's2-3',
        text: 'A central database',
        isCorrect: false,
        explanation: 'Sablier is decentralized and uses blockchain technology (NFTs), not a central database.'
      }
    ],
    explanation: 'Sablier V2 represents streams as ERC-721 NFTs, making them transferable and allowing recipients to sell their future earnings on NFT marketplaces.'
  },
  {
    id: 's3',
    text: 'What happens when a sender \'cancels\' a cancelable stream?',
    category: 'other',
    difficulty: 'medium',
    protocol: 'sablier',
    answers: [
      {
        id: 's3-0',
        text: 'All tokens are burned',
        isCorrect: false,
        explanation: 'Tokens are not burned when a stream is cancelled.'
      },
      {
        id: 's3-1',
        text: 'Remaining unstreamed tokens are returned to the sender',
        isCorrect: true,
        explanation: 'Correct! When a cancelable stream is cancelled, the recipient keeps any tokens that have already been streamed (accrued), and the remaining unstreamed tokens are returned to the sender.'
      },
      {
        id: 's3-2',
        text: 'All tokens are sent to the recipient immediately',
        isCorrect: false,
        explanation: 'Only accrued tokens stay with the recipient - unstreamed tokens go back to the sender.'
      },
      {
        id: 's3-3',
        text: 'The stream is paused but tokens stay in the contract',
        isCorrect: false,
        explanation: 'When cancelled, the stream ends and tokens are distributed, not paused.'
      }
    ],
    explanation: 'When a cancelable stream is cancelled, accrued tokens remain with the recipient, and unstreamed tokens are returned to the sender.'
  },
  {
    id: 's4',
    text: 'What is a \'Linear Stream\' in Sablier?',
    category: 'other',
    difficulty: 'easy',
    protocol: 'sablier',
    answers: [
      {
        id: 's4-0',
        text: 'A stream that releases tokens based on a curve',
        isCorrect: false,
        explanation: 'Linear streams have a constant rate, not a curve.'
      },
      {
        id: 's4-1',
        text: 'A stream that releases tokens at a constant rate over time',
        isCorrect: true,
        explanation: 'Correct! A linear stream releases tokens at a constant rate over the duration of the stream. This is the simplest and most common type of stream.'
      },
      {
        id: 's4-2',
        text: 'A stream with a random release schedule',
        isCorrect: false,
        explanation: 'Linear streams have a predictable, constant rate, not random.'
      },
      {
        id: 's4-3',
        text: 'A stream that never ends',
        isCorrect: false,
        explanation: 'Linear streams have a defined duration, they don\'t run indefinitely.'
      }
    ],
    explanation: 'Linear streams release tokens at a constant rate, making them ideal for simple payroll or vesting schedules.'
  },
  {
    id: 's5',
    text: 'Which of these can be a \'Recipient\' of a Sablier stream?',
    category: 'other',
    difficulty: 'easy',
    protocol: 'sablier',
    answers: [
      {
        id: 's5-0',
        text: 'Only a hardware wallet',
        isCorrect: false,
        explanation: 'Any valid Ethereum address can be a recipient, not just hardware wallets.'
      },
      {
        id: 's5-1',
        text: 'Any valid Ethereum address or smart contract',
        isCorrect: true,
        explanation: 'Correct! Sablier is permissionless - any valid Ethereum address (EOA or smart contract) can be a recipient of a stream. This includes wallets, multisigs, DAOs, and other contracts.'
      },
      {
        id: 's5-2',
        text: 'Only addresses that have passed KYC',
        isCorrect: false,
        explanation: 'Sablier is permissionless and doesn\'t require KYC.'
      },
      {
        id: 's5-3',
        text: 'Only multisig wallets',
        isCorrect: false,
        explanation: 'Any address can receive streams, not just multisigs.'
      }
    ],
    explanation: 'Sablier is permissionless - any valid Ethereum address (wallet or smart contract) can receive streams, making it flexible for various use cases.'
  }
]
