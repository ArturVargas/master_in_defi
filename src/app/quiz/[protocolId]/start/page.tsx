'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getProtocolById } from '@/data/protocols'
import { SafeQuestion, AnswerFeedback } from '@/types/quiz'
import { useQuiz } from '@/hooks/useQuiz'
import { QUIZ_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { useVerification } from '@/contexts/VerificationContext'

export default function QuizStartPage() {
  const params = useParams()
  const router = useRouter()
  const protocolId = params.protocolId as string
  const protocol = getProtocolById(protocolId)
  const [questions, setQuestions] = useState<SafeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answerFeedback, setAnswerFeedback] = useState<Record<string, AnswerFeedback>>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const { error: apiError, handleError, clearError } = useErrorHandler()
  const { verificationMethod } = useVerification()

  const {
    currentQuestion,
    quizState,
    timeRemaining,
    selectedAnswerId,
    isAnswerLocked,
    progress,
    totalQuestions,
    currentQuestionNumber,
    cheatingDetected,
    quizStatus,
    selectAnswer,
    lockAnswer,
    nextQuestion,
    startQuiz
  } = useQuiz({ questions, timePerQuestion: QUIZ_CONFIG.TIME_PER_QUESTION })

  // Cargar preguntas desde API (sin respuestas correctas)
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch(`/api/quiz/questions?protocolId=${protocolId}`)
        if (!response.ok) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
        }
        const data = await response.json()
        setQuestions(data.questions)
        setLoading(false)
        clearError()
      } catch (error) {
        console.error('Error loading questions:', error)
        handleError(error)
        setLoading(false)
      }
    }

    if (protocolId) {
      loadQuestions()
    }
  }, [protocolId, handleError, clearError])

  // Iniciar quiz cuando se cargan las preguntas (solo una vez)
  useEffect(() => {
    if (questions.length > 0 && !quizStarted && quizStatus === 'idle') {
      startQuiz()
      setQuizStarted(true)
    }
  }, [questions.length, quizStarted, quizStatus, startQuiz])

  if (!protocol) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Protocol not found</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading quiz...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No questions available</h1>
          <button
            onClick={() => router.push(`/quiz/${protocolId}`)}
            className="text-blue-400 hover:text-blue-300"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  // Mostrar Integrity Warning si se detecta cheating
  if (cheatingDetected) {
    return (
      <div className="min-h-screen bg-black p-8 font-sans">
        <main className="mx-auto max-w-4xl">
          {/* Header */}
          <h1 className="mb-8 text-center text-5xl font-bold text-zinc-300 md:text-6xl">
            Verified Assessment
          </h1>

          {/* Integrity Warning Card */}
          <div className="relative mx-auto max-w-2xl rounded-xl bg-gradient-to-b from-red-900/40 to-red-950/60 p-8 shadow-2xl border border-red-800/50">
            <h2 className="mb-4 text-2xl font-bold text-red-400">
              Integrity Warning
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-white">
              External environment detected. Assessment locked to prevent unauthorized assistance.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/')}
                className="rounded-lg bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-8 py-3 font-semibold text-white transition-all shadow-lg shadow-red-500/30"
              >
                Back to Hub
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  const feedback = answerFeedback[currentQuestion.id]
  const isCorrect = feedback?.isCorrect ?? false
  const answerLetters = ['A', 'B', 'C', 'D']
  
  // Obtener feedback cuando se bloquea la respuesta
  const handleLockAnswer = async (answerId: string) => {
    if (!currentQuestion || isAnswerLocked) return
    
    lockAnswer(answerId)
    
    // Obtener feedback del servidor
    try {
      const response = await fetch('/api/quiz/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId,
          questionId: currentQuestion.id,
          answerId
        })
      })
      
      if (response.ok) {
        const feedbackData = await response.json()
        setAnswerFeedback(prev => ({
          ...prev,
          [currentQuestion.id]: feedbackData
        }))
      }
      } catch (error) {
        console.error('Error getting feedback:', error)
        handleError(error)
      }
  }

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <main className="mx-auto max-w-4xl">
        {/* Header */}
        <h1 className="mb-8 text-center text-5xl font-bold text-zinc-300 md:text-6xl">
          Verified Assessment
        </h1>

        {/* Quiz Card */}
        <div className="relative rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-8 shadow-2xl">
          {/* Quiz Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium uppercase tracking-wide text-blue-400">
                {protocol.title || protocol.name.toUpperCase()} PROTOCOL
              </span>
              <span className="text-lg font-semibold text-white">
                QUESTION {currentQuestionNumber} OF {totalQuestions}
              </span>
            </div>
            
            {/* Timer */}
            <div className="rounded-lg bg-zinc-800 px-4 py-2">
              <span className="text-lg font-bold text-white">
                {timeRemaining}s
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Error Alert */}
          {apiError && (
            <div className="mb-6">
              <ErrorAlert message={apiError} onDismiss={clearError} />
            </div>
          )}

          {/* Question */}
          <h2 className="mb-8 text-2xl font-bold leading-relaxed text-white md:text-3xl">
            {currentQuestion.text}
          </h2>

          {/* Answers */}
          <div className="mb-8 space-y-3">
            {currentQuestion.answers.map((answer, index) => {
              const letter = answerLetters[index]
              const isSelected = selectedAnswerId === answer.id
              const showFeedback = isAnswerLocked && feedback
              const isCorrectAnswer = feedback?.correctAnswer?.id === answer.id

              // Determinar estilo según estado
              let answerStyle = 'bg-zinc-800 border-zinc-700 text-white'
              let letterStyle = 'bg-zinc-700 text-zinc-300'
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  // Respuesta correcta - verde
                  answerStyle = 'bg-green-600/20 border-green-500 text-white'
                  letterStyle = 'bg-green-500 text-white'
                } else if (isSelected && !isCorrectAnswer) {
                  // Respuesta incorrecta seleccionada - rojo
                  answerStyle = 'bg-red-600/20 border-red-500 text-white'
                  letterStyle = 'bg-blue-500 text-white' // El círculo del usuario es azul
                } else {
                  // Respuestas no seleccionadas - gris deshabilitado
                  answerStyle = 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500'
                  letterStyle = 'bg-zinc-700/50 text-zinc-500'
                }
              } else if (isSelected) {
                // Respuesta seleccionada pero no bloqueada - azul
                answerStyle = 'bg-blue-600/20 border-blue-500 text-white'
                letterStyle = 'bg-blue-500 text-white'
              }

              return (
                <button
                  key={answer.id}
                  onClick={() => {
                    if (!isAnswerLocked) {
                      selectAnswer(answer.id)
                    }
                  }}
                  disabled={isAnswerLocked}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    isAnswerLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-800/50'
                  } ${answerStyle}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Letter Circle/Square */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${letterStyle}`}
                    >
                      {letter}
                    </div>
                    
                    {/* Answer Text */}
                    <span className="flex-1 text-base font-medium">
                      {answer.text}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            {!isAnswerLocked ? (
              <button
                onClick={() => {
                  if (selectedAnswerId) {
                    handleLockAnswer(selectedAnswerId)
                  }
                }}
                disabled={!selectedAnswerId}
                className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                  selectedAnswerId
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Lock Answer
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (currentQuestionNumber < totalQuestions) {
                    nextQuestion()
                  } else {
                    // Enviar respuestas al servidor y obtener token
                    try {
                      const finalAnswers = {
                        ...quizState.answers,
                        [currentQuestion.id]: selectedAnswerId
                      }
                      
                      const response = await fetch('/api/quiz/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          protocolId,
                          answers: finalAnswers,
                          startTime: quizState.startTime,
                          endTime: Date.now(),
                          verificationMethod: verificationMethod || null
                        })
                      })
                      
                      if (response.ok) {
                        const data = await response.json()
                        // Redirigir a resultados con token
                        router.push(`/quiz/${protocolId}/results?token=${data.token}`)
                      } else {
                        handleError(new Error(ERROR_MESSAGES.NETWORK_ERROR))
                      }
                    } catch (error) {
                      console.error('Error submitting quiz:', error)
                      handleError(error)
                    }
                  }
                }}
                className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-6 py-3 font-semibold text-white transition-all"
              >
                {currentQuestionNumber < totalQuestions ? 'Next Question' : 'View Results'}
              </button>
            )}
          </div>

          {/* Feedback (si está bloqueado) */}
          {isAnswerLocked && feedback && (
            <div className="mt-6 rounded-lg border p-4">
              {isCorrect ? (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-green-500">✓</div>
                  <div>
                    <p className="font-semibold text-green-400">Correct!</p>
                    {feedback.explanation && (
                      <p className="mt-1 text-sm text-zinc-300">{feedback.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">✗</div>
                  <div>
                    <p className="font-semibold text-red-400">Incorrect</p>
                    {feedback.explanation && (
                      <p className="mt-1 text-sm text-zinc-300">{feedback.explanation}</p>
                    )}
                    {feedback.correctAnswer && (
                      <p className="mt-2 text-sm text-green-400">
                        Correct answer: {feedback.correctAnswer.text}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
