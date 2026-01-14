import { Question } from '@/types/quiz'
import { aaveQuestions } from './aave'

export const questions: Question[] = [
  ...aaveQuestions,
  // Aquí se agregarán más preguntas de otros protocolos
]

export function getQuestionsByProtocol(protocol: string): Question[] {
  return questions.filter(q => q.protocol === protocol)
}

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter(q => q.category === category)
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  return questions.filter(q => q.difficulty === difficulty)
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id)
}

export function getRandomQuestions(count: number): Question[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
