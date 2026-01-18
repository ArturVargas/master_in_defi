import { NextRequest, NextResponse } from 'next/server'
import {
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  hardDeleteQuestion,
} from '@/lib/db/questions'

/**
 * GET /api/questions/[id]
 * Get a single question by ID with answers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const question = await getQuestionById(id)

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: `Question "${id}" not found`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      question,
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error fetching question ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/questions/[id]
 * Update a question (admin only)
 * Note: To update answers, use the /api/answers endpoints
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin authentication
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates = {
      text: body.text,
      explanation: body.explanation,
      orderIndex: body.orderIndex,
      active: body.active,
    }

    const question = await updateQuestion(id, updates)

    return NextResponse.json({
      success: true,
      question,
      message: `Question updated successfully`,
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error updating question ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/questions/[id]
 * Delete a question (admin only)
 * Query param ?hard=true for hard delete (permanent, also deletes answers)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin authentication
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    if (hardDelete) {
      await hardDeleteQuestion(id)
      return NextResponse.json({
        success: true,
        message: `Question permanently deleted`,
      })
    } else {
      await deleteQuestion(id)
      return NextResponse.json({
        success: true,
        message: `Question deactivated`,
      })
    }
  } catch (error) {
    const { id } = await params
    console.error(`Error deleting question ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
