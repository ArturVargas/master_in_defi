'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SafeQuestion, QuizState } from '@/types/quiz'
import { QUIZ_CONFIG, STORAGE_KEYS } from '@/lib/constants'

interface UseQuizOptions {
  questions: SafeQuestion[] // Preguntas sin respuestas correctas
  timePerQuestion?: number // segundos
}

export function useQuiz({ questions, timePerQuestion = QUIZ_CONFIG.TIME_PER_QUESTION }: UseQuizOptions) {
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
  // Si no había selección al terminar el tiempo, no añadimos la pregunta a answers:
  // el servidor interpreta "pregunta ausente en el payload" como respuesta incorrecta.
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswerLocked && currentQuestionId && quizStatus === 'in-progress') {
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
      // Si currentAnswerId es null: no guardamos nada; en submit esa pregunta no va en el payload
      // y el servidor la marca como incorrecta.
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
      const protocolId = questions[0]?.protocol
      if (protocolId) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_ANSWERS(protocolId), JSON.stringify(finalState.answers))
        localStorage.setItem(STORAGE_KEYS.QUIZ_START_TIME(protocolId), String(finalState.startTime))
        localStorage.setItem(STORAGE_KEYS.QUIZ_END_TIME(protocolId), String(Date.now()))
      }
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
