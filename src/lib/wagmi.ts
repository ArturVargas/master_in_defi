/**
 * Configuración de Wagmi para conexión de wallets
 * Basado en ConnectHub
 */

import { createConfig, http } from 'wagmi'
import { mainnet, celo, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { config } from './config'

export const wagmiConfig = createConfig({
  chains: [mainnet, celo, base],
  connectors: [
    injected(),
    ...(config.wallet.projectId ? [walletConnect({ projectId: config.wallet.projectId })] : [])
  ],
  transports: {
    [mainnet.id]: http(),
    [celo.id]: http(config.self.celoRpcUrl),
    [base.id]: http(),
  },
})
