'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SafeQuestion, QuizState } from '@/types/quiz'

interface UseQuizOptions {
  questions: SafeQuestion[] // Preguntas sin respuestas correctas
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
  const currentQuestionId = currentQuestion?.id

  // Iniciar tiempo cuando cambia la pregunta (solo cuando cambia el índice)
  // Usar useRef para rastrear el último índice y evitar loops
  const prevQuestionIndexRef = useRef<number | null>(null)
  
  useEffect(() => {
    if (questions.length === 0 || quizStatus !== 'in-progress') return
    if (quizState.currentQuestionIndex >= questions.length) return
    
    // Solo resetear si realmente cambió el índice de la pregunta
    const currentIndex = quizState.currentQuestionIndex
    if (prevQuestionIndexRef.current !== currentIndex) {
      prevQuestionIndexRef.current = currentIndex
      
      // Resetear estado para nueva pregunta
      setTimeRemaining(timePerQuestion)
      setQuestionStartTime(Date.now())
      setSelectedAnswerId(null)
      setIsAnswerLocked(false)
    }
  }, [quizState.currentQuestionIndex, quizStatus, timePerQuestion, questions.length])

  // Cronómetro
  useEffect(() => {
    if (isAnswerLocked || !currentQuestionId || quizStatus !== 'in-progress') return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Tiempo agotado - bloquear respuesta automáticamente
          setIsAnswerLocked(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnswerLocked, currentQuestionId, quizStatus])

  // Cronómetro - manejar tiempo agotado y guardar respuesta
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswerLocked && currentQuestionId && quizStatus === 'in-progress') {
      // Tiempo agotado - guardar respuesta si hay una seleccionada
      const currentAnswerId = selectedAnswerId
      if (currentAnswerId) {
        setQuizState((prevState) => ({
          ...prevState,
          answers: {
            ...prevState.answers,
            [currentQuestionId]: currentAnswerId
          }
        }))
      }
    }
  }, [timeRemaining, isAnswerLocked, currentQuestionId, selectedAnswerId, quizStatus])

  const lockAnswer = useCallback((answerId: string) => {
    if (isAnswerLocked || !currentQuestionId) return

    setIsAnswerLocked(true)
    setSelectedAnswerId(answerId)
    
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestionId]: answerId
      }
    }))
  }, [isAnswerLocked, currentQuestionId])

  const selectAnswer = useCallback((answerId: string) => {
    if (isAnswerLocked) return
    setSelectedAnswerId(answerId)
  }, [isAnswerLocked])

  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < totalQuestions - 1) {
      // Resetear estado antes de avanzar
      setIsAnswerLocked(false)
      setSelectedAnswerId(null)
      setTimeRemaining(timePerQuestion)
      
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
    } else {
      // Quiz completado - guardar en localStorage
      const finalState = {
        ...quizState,
        isCompleted: true,
        endTime: Date.now()
      }
      setQuizState(finalState)
      
      // Guardar respuestas en localStorage para la página de resultados
      localStorage.setItem(`quiz_answers_${questions[0]?.protocol}`, JSON.stringify(finalState.answers))
      localStorage.setItem(`quiz_startTime_${questions[0]?.protocol}`, String(finalState.startTime))
      localStorage.setItem(`quiz_endTime_${questions[0]?.protocol}`, String(Date.now()))
    }
  }, [quizState, totalQuestions, timePerQuestion, questions])

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

  // Nota: getSelectedAnswer y getCorrectAnswer ya no son necesarios
  // porque las respuestas correctas vienen del servidor via feedback

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
    startQuiz
  }
}
