'use client'

import { Badge } from '@/components/ui/Badge'
import { protocols } from '@/data/protocols'
import { questions } from '@/data/questions'
import { MacintoshProtocolCard } from '@/components/3D_components'

export default function Home() {

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center justify-center">
            <Badge className="rounded-full bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-400 border-blue-800/50">
              DEFI INTELLIGENCE HUB
            </Badge>
          </div>

          {/* Title with gradient */}
          <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
            DeFi Mastery
          </h1>
        </div>

        {/* Macintosh 3D en columna vertical - uno por protocolo */}
        <div className="flex flex-col gap-12">
          {protocols
            .filter((protocol) => protocol.status !== 'draft')
            .map((protocol) => {
              const protocolQuestions = questions.filter(q => q.protocol === protocol.id)
              const questionCount = protocolQuestions.length

              return (
                <MacintoshProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  questionCount={questionCount}
                />
              )
            })}
        </div>
      </main>
    </div>
  )
}
