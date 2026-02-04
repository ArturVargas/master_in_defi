'use client'

/**
 * Badge que muestra la wallet conectada (truncada) y la foto de perfil de Farcaster.
 * Formato: 0x1234....5678 [avatar circular]
 */

import { useVerification } from '@/contexts/VerificationContext'
import { useFarcaster } from '@/contexts/FarcasterContext'
import { cn } from '@/utils/cn'

function truncateAddress(address: string): string {
  if (!address || address.length < 12) return address
  return `${address.slice(0, 6)}....${address.slice(-4)}`
}

export interface ConnectedWalletBadgeProps {
  className?: string
}

export function ConnectedWalletBadge({ className }: ConnectedWalletBadgeProps) {
  const { walletAddress } = useVerification()
  const { user } = useFarcaster()

  if (!walletAddress) return null

  const truncated = truncateAddress(walletAddress)
  const displayName = user?.displayName || user?.username || null
  const pfpUrl = user?.pfpUrl || null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/80 px-3 py-1.5 text-sm',
        className
      )}
      title={displayName ? `${walletAddress} · ${displayName}` : walletAddress}
    >
      <span className="font-mono text-zinc-300">{truncated}</span>
      <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-full border border-zinc-600 bg-zinc-700">
        {pfpUrl ? (
          <img
            src={pfpUrl}
            alt={displayName || 'Avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400"
            aria-hidden
          >
            {displayName?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </span>
    </div>
  )
}
