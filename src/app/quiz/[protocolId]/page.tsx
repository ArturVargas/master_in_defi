'use client'

import { useParams, useRouter } from 'next/navigation'
import { getProtocolById } from '@/data/protocols'
import Link from 'next/link'
import { VerificationGate } from '@/components/verification/VerificationGate'

export default function ProtocolStudyPage() {
  const params = useParams()
  const router = useRouter()
  const protocolId = params.protocolId as string
  const protocol = getProtocolById(protocolId)

  if (!protocol) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Protocol not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <VerificationGate requireVerification={true}>
      <div className="min-h-screen bg-black p-8 font-sans">
        <main className="mx-auto max-w-4xl">
          {/* Header */}
          <h1 className="mb-8 text-center text-6xl font-bold text-zinc-500/50 md:text-7xl">
            Protocol Study
          </h1>

          {/* Protocol Documentation Card */}
          <div className="relative rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-8 shadow-2xl">
          {/* Card Header */}
          <div className="mb-6 flex items-start justify-between">
            <h2 className="text-2xl font-bold text-white">
              {protocol.title || protocol.name} Docs
            </h2>
            <button
              onClick={() => router.push('/')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              ABORT
            </button>
          </div>

          {/* Briefing Content - Scrollable */}
          <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-4">
            {protocol.briefing && protocol.briefing.length > 0 ? (
              protocol.briefing.map((paragraph, index) => (
                <div key={index} className="relative pl-6">
                  {/* Vertical line on the left */}
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-zinc-700/50" />
                  
                  {/* Paragraph text */}
                  <p className="text-base italic leading-relaxed text-white/90">
                    {paragraph}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">No briefing available for this protocol.</p>
            )}
          </div>

          {/* Bottom Section */}
          <div className="mt-8 flex items-end justify-between border-t border-zinc-700/50 pt-6">
            {/* Voice Command Prompt (Left) */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                MICROPHONE ACTIVE
              </span>
              <span className="text-sm text-zinc-500">
                Say &apos;Start Quiz&apos; to begin
              </span>
            </div>

            {/* Manual Start Button (Right) */}
            <button
              onClick={() => router.push(`/quiz/${protocolId}/start`)}
              className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              MANUAL START
            </button>
          </div>
        </div>
      </main>
    </div>
    </VerificationGate>
  )
}
