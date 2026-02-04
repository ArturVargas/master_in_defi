'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { QUIZ_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { useVerification } from '@/contexts/VerificationContext'
import { POAPClaimButton } from '@/components/poap/POAPClaimButton'

interface QuizResults {
  score: number
  total: number
  passed: boolean
  secretWord: string | null
  protocolName: string
  verificationMethod?: 'self' | 'wallet' | null
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const protocolId = params.protocolId as string
  const token = searchParams.get('token')

  const [results, setResults] = useState<QuizResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Usar verificationMethod de los resultados si está disponible, sino del contexto
  const contextVerification = useVerification()

  useEffect(() => {
    const loadResults = async () => {
      // Validar que hay token
      if (!token) {
        setError('No token provided. Please complete the quiz first.')
        setLoading(false)
        return
      }

      try {
        // Obtener resultados del servidor (validación en servidor)
        const response = await fetch(`/api/quiz/results?token=${token}`)
        
        if (!response.ok) {
          if (response.status === 401) {
            setError(ERROR_MESSAGES.INVALID_TOKEN)
          } else {
            setError(ERROR_MESSAGES.NETWORK_ERROR)
          }
          setLoading(false)
          return
        }

        const json = await response.json()
        const data = json.data
        if (data) {
          setResults({
            score: data.score,
            total: data.total,
            passed: data.passed,
            secretWord: data.secretWord,
            protocolName: data.protocolName,
            verificationMethod: data.verificationMethod || null
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading results:', error)
        setError('Failed to load results')
        setLoading(false)
      }
    }

    loadResults()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Failed to load results'}</h1>
          <button
            onClick={() => router.push(`/quiz/${protocolId}/start`)}
            className="text-blue-400 hover:text-blue-300 mr-4"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Go back to home
          </button>
        </div>
      </div>
    )
  }

  const { score, total, passed, secretWord, protocolName, verificationMethod } = results
  const displayVerificationMethod = verificationMethod || contextVerification.verificationMethod
  const isVerified = contextVerification.isVerified || !!verificationMethod

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <Badge className="rounded-full bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-400 border-blue-800/50">
              DEFI INTELLIGENCE HUB
            </Badge>
            {isVerified && displayVerificationMethod && (
              <Badge className="rounded-full bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-400 border-green-800/50">
                ✓ {displayVerificationMethod === 'self' ? 'Self Protocol Verified' : 'Wallet Verified'}
              </Badge>
            )}
          </div>
          <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
            DeFi Mastery
          </h1>
        </div>

        {/* Results Card */}
        <div className="relative rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-8 shadow-2xl">
          {passed ? (
            // Success State - Passed
            <>
              <h2 className="mb-4 text-3xl font-bold text-white">
                Verification Success
              </h2>
              <p className="mb-6 text-lg text-zinc-300">
                Score achieved: <span className="font-bold text-green-400">{score}/{total}</span>
              </p>

              {/* Secret Word */}
              {secretWord && (
                <div className="mb-8 rounded-lg border border-blue-500/30 bg-blue-950/30 p-6">
                  <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-400">
                    ENCRYPTED SECRET WORD
                  </p>
                  <div className="rounded-lg bg-blue-900/40 p-4">
                    <p className="text-center text-2xl font-bold uppercase tracking-wider text-white">
                      {secretWord}
                    </p>
                  </div>
                </div>
              )}

              {/* POAP Claim Section */}
              <div className="mb-8">
                <POAPClaimButton
                  token={token || ''}
                  protocolId={protocolId}
                  walletAddress={contextVerification.walletAddress}
                  onSuccess={(claimUrl) => {
                    console.log('POAP claimed:', claimUrl)
                  }}
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-6 py-3 font-semibold text-white transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          ) : (
            // Failed State - Not Passed
            <>
              <h2 className="mb-4 text-3xl font-bold text-white">
                Certification Failed
              </h2>
              <p className="mb-8 text-lg text-zinc-300">
                Score achieved: <span className="font-bold text-red-400">{score}/{total}</span>
              </p>
              <p className="mb-8 text-zinc-400">
                Necesitas al menos {QUIZ_CONFIG.MIN_SCORE_TO_PASS} respuestas correctas para pasar. Obtuviste {score} de {total}.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => router.push(`/quiz/${protocolId}`)}
                  className="rounded-lg bg-white hover:bg-zinc-100 px-6 py-3 font-semibold text-black transition-all"
                >
                  Review Protocol Docs
                </button>
                <button
                  onClick={() => router.push(`/quiz/${protocolId}/start`)}
                  className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-6 py-3 font-semibold text-white transition-all"
                >
                  Retry Quiz
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
