'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question, QuizState } from '@/types/quiz'

interface UseQuizOptions {
  questions: Question[]
  timePerQuestion?: number // segundos
}

export function useQuiz({ questions, timePerQuestion = 25 }: UseQuizOptions) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    startTime: null,
    endTime: null,
    isCompleted: false
  })

  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)
  const [cheatingDetected, setCheatingDetected] = useState(false)
  const [quizStatus, setQuizStatus] = useState<'idle' | 'in-progress' | 'completed' | 'locked'>('idle')

  const currentQuestion = questions[quizState.currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = ((quizState.currentQuestionIndex + 1) / totalQuestions) * 100

  // Cronómetro
  useEffect(() => {
    if (isAnswerLocked || !currentQuestion || quizStatus !== 'in-progress') return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Tiempo agotado - bloquear respuesta automáticamente
          const currentAnswerId = selectedAnswerId || ''
          setIsAnswerLocked(true)
          if (currentAnswerId && currentQuestion) {
            setQuizState((prevState) => ({
              ...prevState,
              answers: {
                ...prevState.answers,
                [currentQuestion.id]: currentAnswerId
              }
            }))
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnswerLocked, currentQuestion, selectedAnswerId, quizStatus])

  // Iniciar tiempo cuando cambia la pregunta
  useEffect(() => {
    if (currentQuestion && !isAnswerLocked && quizStatus === 'in-progress') {
      setTimeRemaining(timePerQuestion)
      setQuestionStartTime(Date.now())
      setSelectedAnswerId(null)
      setIsAnswerLocked(false)
    }
  }, [currentQuestion?.id, timePerQuestion, isAnswerLocked, quizStatus])

  const lockAnswer = useCallback((answerId: string) => {
    if (isAnswerLocked || !currentQuestion) return

    setIsAnswerLocked(true)
    setSelectedAnswerId(answerId)

    // Guardar respuesta
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0
    
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerId
      }
    }))
  }, [isAnswerLocked, currentQuestion, questionStartTime])

  const selectAnswer = useCallback((answerId: string) => {
    if (isAnswerLocked) return
    setSelectedAnswerId(answerId)
  }, [isAnswerLocked])

  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < totalQuestions - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
      setIsAnswerLocked(false)
      setSelectedAnswerId(null)
      setTimeRemaining(timePerQuestion)
    } else {
      // Quiz completado
      setQuizState((prev) => ({
        ...prev,
        isCompleted: true,
        endTime: Date.now()
      }))
    }
  }, [quizState.currentQuestionIndex, totalQuestions, timePerQuestion])

  const startQuiz = useCallback(() => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      endTime: null,
      isCompleted: false
    })
    setTimeRemaining(timePerQuestion)
    setQuestionStartTime(Date.now())
    setQuizStatus('in-progress')
    setCheatingDetected(false)
  }, [timePerQuestion])

  // Anti-cheat: Detectar cambio de tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizStatus === 'in-progress') {
        setCheatingDetected(true)
        setQuizStatus('locked')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [quizStatus])

  const getSelectedAnswer = () => {
    if (!selectedAnswerId || !currentQuestion) return null
    return currentQuestion.answers.find(a => a.id === selectedAnswerId)
  }

  const getCorrectAnswer = () => {
    if (!currentQuestion) return null
    return currentQuestion.answers.find(a => a.isCorrect)
  }

  return {
    currentQuestion,
    quizState,
    timeRemaining,
    selectedAnswerId,
    isAnswerLocked,
    progress,
    totalQuestions,
    currentQuestionNumber: quizState.currentQuestionIndex + 1,
    cheatingDetected,
    quizStatus,
    selectAnswer,
    lockAnswer,
    nextQuestion,
    startQuiz,
    getSelectedAnswer,
    getCorrectAnswer
  }
}
