import { NextRequest, NextResponse } from 'next/server'
import { updateAnswer, deleteAnswer } from '@/lib/db/questions'

/**
 * PUT /api/answers/[id]
 * Update an answer (admin only)
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
      isCorrect: body.isCorrect,
      orderIndex: body.orderIndex,
    }

    const answer = await updateAnswer(id, updates)

    return NextResponse.json({
      success: true,
      answer,
      message: 'Answer updated successfully',
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error updating answer ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/answers/[id]
 * Delete an answer permanently (admin only)
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

    await deleteAnswer(id)

    return NextResponse.json({
      success: true,
      message: 'Answer deleted successfully',
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error deleting answer ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
