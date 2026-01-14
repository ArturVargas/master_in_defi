import { Badge } from '@/components/ui/Badge'
import { protocols } from '@/data/protocols'
import { questions } from '@/data/questions'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-7xl">
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

        {/* Protocol Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => {
            const protocolQuestions = questions.filter(q => q.protocol === protocol.id)
            const questionCount = protocolQuestions.length
            
            return (
              <Link
                key={protocol.id}
                href={`/quiz/${protocol.id}`}
                className="group relative flex flex-col rounded-xl bg-zinc-900 p-6 transition-all hover:bg-zinc-800/50 hover:border-2 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border-2 border-transparent cursor-pointer"
              >
                {/* Protocol Title */}
                <h2 className="mb-3 text-2xl font-bold text-white">
                  {protocol.title || protocol.name}
                </h2>
                
                {/* Description */}
                <p className="mb-6 flex-1 text-sm leading-relaxed text-white/80">
                  {protocol.description}
                </p>
                
                {/* Bottom Section */}
                <div className="mt-auto flex items-end justify-between">
                  {/* Question Count */}
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {questionCount} {questionCount === 1 ? 'QUESTION' : 'QUESTIONS'}
                  </span>
                  
                  {/* Action Button */}
                  <div
                    className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                  >
                    Start Quiz
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
