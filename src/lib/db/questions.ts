import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

/**
 * Database functions for questions and answers management
 */

export interface Answer {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  protocolId: string
  text: string
  explanation: string | null
  orderIndex: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  answers?: Answer[]
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[]
}

/**
 * Get all questions across all protocols with their answers
 */
export async function getAllQuestions(includeInactive = false): Promise<QuestionWithAnswers[]> {
  try {
    const activeFilter = includeInactive ? sql`` : sql`WHERE q.active = true`

    const result = await sql`
      SELECT
        q.id,
        q.protocol_id as "protocolId",
        q.text,
        q.explanation,
        q.order_index as "orderIndex",
        q.active,
        q.created_at as "createdAt",
        q.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'questionId', a.question_id,
              'text', a.text,
              'isCorrect', a.is_correct,
              'orderIndex', a.order_index,
              'createdAt', a.created_at,
              'updatedAt', a.updated_at
            )
            ORDER BY a.order_index ASC
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) as answers
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      ${activeFilter}
      GROUP BY q.id, q.protocol_id, q.text, q.explanation, q.order_index, q.active, q.created_at, q.updated_at
      ORDER BY q.protocol_id ASC, q.order_index ASC
    `

    return result as QuestionWithAnswers[]
  } catch (error) {
    console.error('Error fetching all questions:', error)
    throw new Error('Failed to fetch all questions')
  }
}

/**
 * Get all questions for a protocol with their answers
 */
export async function getQuestionsByProtocol(
  protocolId: string,
  includeInactive = false
): Promise<QuestionWithAnswers[]> {
  try {
    const activeFilter = includeInactive ? sql`` : sql`AND q.active = true`

    const result = await sql`
      SELECT
        q.id,
        q.protocol_id as "protocolId",
        q.text,
        q.explanation,
        q.order_index as "orderIndex",
        q.active,
        q.created_at as "createdAt",
        q.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'questionId', a.question_id,
              'text', a.text,
              'isCorrect', a.is_correct,
              'orderIndex', a.order_index,
              'createdAt', a.created_at,
              'updatedAt', a.updated_at
            )
            ORDER BY a.order_index ASC
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) as answers
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.protocol_id = ${protocolId} ${activeFilter}
      GROUP BY q.id, q.protocol_id, q.text, q.explanation, q.order_index, q.active, q.created_at, q.updated_at
      ORDER BY q.order_index ASC
    `

    return result as QuestionWithAnswers[]
  } catch (error) {
    console.error(`Error fetching questions for protocol ${protocolId}:`, error)
    throw new Error(`Failed to fetch questions for protocol ${protocolId}`)
  }
}

/**
 * Get a single question by ID with answers
 */
export async function getQuestionById(id: string): Promise<QuestionWithAnswers | null> {
  try {
    const result = await sql`
      SELECT
        q.id,
        q.protocol_id as "protocolId",
        q.text,
        q.explanation,
        q.order_index as "orderIndex",
        q.active,
        q.created_at as "createdAt",
        q.updated_at as "updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'questionId', a.question_id,
              'text', a.text,
              'isCorrect', a.is_correct,
              'orderIndex', a.order_index,
              'createdAt', a.created_at,
              'updatedAt', a.updated_at
            )
            ORDER BY a.order_index ASC
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) as answers
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.id = ${id}
      GROUP BY q.id
      LIMIT 1
    `

    return result.length > 0 ? (result[0] as QuestionWithAnswers) : null
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error)
    throw new Error(`Failed to fetch question ${id}`)
  }
}

/**
 * Create a new question with answers
 */
export async function createQuestion(
  question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>,
  answers: Array<Omit<Answer, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>>
): Promise<QuestionWithAnswers> {
  try {
    // Insert question
    const questionResult = await sql`
      INSERT INTO questions (
        protocol_id, text, explanation, order_index, active
      ) VALUES (
        ${question.protocolId},
        ${question.text},
        ${question.explanation || null},
        ${question.orderIndex},
        ${question.active}
      )
      RETURNING
        id,
        protocol_id as "protocolId",
        text,
        explanation,
        order_index as "orderIndex",
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    const createdQuestion = questionResult[0] as Question

    // Insert answers
    if (answers.length > 0) {
      const createdAnswers: Answer[] = []

      for (const answer of answers) {
        const answersResult = await sql`
          INSERT INTO answers (question_id, text, is_correct, order_index)
          VALUES (
            ${createdQuestion.id},
            ${answer.text},
            ${answer.isCorrect},
            ${answer.orderIndex}
          )
          RETURNING
            id,
            question_id as "questionId",
            text,
            is_correct as "isCorrect",
            order_index as "orderIndex",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `
        createdAnswers.push(answersResult[0] as Answer)
      }

      return {
        ...createdQuestion,
        answers: createdAnswers,
      }
    }

    return {
      ...createdQuestion,
      answers: [],
    }
  } catch (error) {
    console.error('Error creating question:', error)
    throw new Error('Failed to create question')
  }
}

/**
 * Update a question (text, explanation, order_index, active)
 */
export async function updateQuestion(
  id: string,
  updates: Partial<Omit<Question, 'id' | 'protocolId' | 'createdAt' | 'updatedAt'>>
): Promise<Question> {
  try {
    const result = await sql`
      UPDATE questions
      SET
        text = COALESCE(${updates.text || null}, text),
        explanation = COALESCE(${updates.explanation || null}, explanation),
        order_index = COALESCE(${updates.orderIndex !== undefined ? updates.orderIndex : null}, order_index),
        active = COALESCE(${updates.active !== undefined ? updates.active : null}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id,
        protocol_id as "protocolId",
        text,
        explanation,
        order_index as "orderIndex",
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    if (result.length === 0) {
      throw new Error(`Question with id ${id} not found`)
    }

    return result[0] as Question
  } catch (error) {
    console.error(`Error updating question ${id}:`, error)
    throw new Error(`Failed to update question ${id}`)
  }
}

/**
 * Delete a question (soft delete by setting active = false)
 */
export async function deleteQuestion(id: string): Promise<void> {
  try {
    await sql`
      UPDATE questions
      SET active = false, updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error)
    throw new Error(`Failed to delete question ${id}`)
  }
}

/**
 * Hard delete a question (permanently removes from database)
 * This will CASCADE delete all associated answers
 */
export async function hardDeleteQuestion(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM questions
      WHERE id = ${id}
    `
  } catch (error) {
    console.error(`Error hard deleting question ${id}:`, error)
    throw new Error(`Failed to hard delete question ${id}`)
  }
}

/**
 * Create a single answer for a question
 */
export async function createAnswer(
  answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Answer> {
  try {
    const result = await sql`
      INSERT INTO answers (question_id, text, is_correct, order_index)
      VALUES (
        ${answer.questionId},
        ${answer.text},
        ${answer.isCorrect},
        ${answer.orderIndex}
      )
      RETURNING
        id,
        question_id as "questionId",
        text,
        is_correct as "isCorrect",
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    return result[0] as Answer
  } catch (error) {
    console.error('Error creating answer:', error)
    throw new Error('Failed to create answer')
  }
}

/**
 * Update an answer
 */
export async function updateAnswer(
  id: string,
  updates: Partial<Omit<Answer, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>>
): Promise<Answer> {
  try {
    const result = await sql`
      UPDATE answers
      SET
        text = COALESCE(${updates.text || null}, text),
        is_correct = COALESCE(${updates.isCorrect !== undefined ? updates.isCorrect : null}, is_correct),
        order_index = COALESCE(${updates.orderIndex !== undefined ? updates.orderIndex : null}, order_index),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id,
        question_id as "questionId",
        text,
        is_correct as "isCorrect",
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    if (result.length === 0) {
      throw new Error(`Answer with id ${id} not found`)
    }

    return result[0] as Answer
  } catch (error) {
    console.error(`Error updating answer ${id}:`, error)
    throw new Error(`Failed to update answer ${id}`)
  }
}

/**
 * Delete an answer (hard delete - answers don't have soft delete)
 */
export async function deleteAnswer(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM answers
      WHERE id = ${id}
    `
  } catch (error) {
    console.error(`Error deleting answer ${id}:`, error)
    throw new Error(`Failed to delete answer ${id}`)
  }
}

/**
 * Get answers for a specific question
 */
export async function getAnswersByQuestion(questionId: string): Promise<Answer[]> {
  try {
    const result = await sql`
      SELECT
        id,
        question_id as "questionId",
        text,
        is_correct as "isCorrect",
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM answers
      WHERE question_id = ${questionId}
      ORDER BY order_index ASC
    `

    return result as Answer[]
  } catch (error) {
    console.error(`Error fetching answers for question ${questionId}:`, error)
    throw new Error(`Failed to fetch answers for question ${questionId}`)
  }
}
