import { NextRequest, NextResponse } from 'next/server'
import { createQuestion, getAllQuestions } from '@/lib/db/questions'

/**
 * GET /api/questions
 * Get all questions with answers
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const questions = await getAllQuestions(includeInactive)

    return NextResponse.json({
      success: true,
      data: {
        questions,
        count: questions.length,
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questions
 * Create a new question with answers (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      protocolId,
      text,
      explanation,
      orderIndex = 0,
      active = true,
      answers = [],
    } = body

    // Validate required fields
    if (!protocolId || !text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['protocolId', 'text'],
        },
        { status: 400 }
      )
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one answer is required',
        },
        { status: 400 }
      )
    }

    // Validate that at least one answer is correct
    const hasCorrectAnswer = answers.some((a: any) => a.isCorrect === true)
    if (!hasCorrectAnswer) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one answer must be marked as correct',
        },
        { status: 400 }
      )
    }

    // Create question with answers
    const question = await createQuestion(
      {
        protocolId: protocolId.toLowerCase(),
        text,
        explanation: explanation || null,
        orderIndex,
        active,
      },
      answers
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          question,
          message: 'Question created successfully',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
