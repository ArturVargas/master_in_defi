/**
 * Configuración centralizada de la aplicación
 * Lee todas las variables de entorno en un solo lugar
 */

export const config = {
  self: {
    scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'defi-quiz-app',
    appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'DeFi Learning Quiz',
    backendEndpoint: process.env.NEXT_PUBLIC_SELF_BACKEND_ENDPOINT,
    contractAddress: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS,
    endpointType: (process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE || 'celo') as 'celo' | 'base' | 'staging_celo' | 'staging_base',
    celoRpcUrl: process.env.NEXT_PUBLIC_CELO_MAINNET_RPC || 'https://forno.celo.org',
    logoUrl: process.env.NEXT_PUBLIC_SELF_LOGO_URL || '',
    deeplinkCallback: typeof window !== 'undefined' ? window.location.href : '',
  },
  farcaster: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'DeFi Learning Quiz',
    appImageUrl: process.env.NEXT_PUBLIC_APP_IMAGE_URL || '',
    appSplashUrl: process.env.NEXT_PUBLIC_APP_SPLASH_URL || '',
    appSplashBgColor: process.env.NEXT_PUBLIC_APP_SPLASH_BG_COLOR || '#000000',
  },
  wallet: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  },
  quiz: {
    // Valores por defecto, pueden ser sobrescritos por constantes
    timePerQuestion: 25,
    minScoreToPass: 3,
  },
} as const
