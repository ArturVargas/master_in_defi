import { NextRequest, NextResponse } from 'next/server'
import {
  getProtocolById,
  updateProtocol,
  deleteProtocol,
  hardDeleteProtocol,
} from '@/lib/db/protocols'

/**
 * GET /api/protocols/[id]
 * Get a single protocol by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const protocol = await getProtocolById(id)

    if (!protocol) {
      return NextResponse.json(
        {
          success: false,
          error: `Protocol "${id}" not found`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      protocol,
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error fetching protocol ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/protocols/[id]
 * Update a protocol (admin only)
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
      name: body.name,
      title: body.title,
      description: body.description,
      logoUrl: body.logoUrl,
      category: body.category,
      difficulty: body.difficulty,
      secretWord: body.secretWord,
      status: body.status,
      active: body.active,
      orderIndex: body.orderIndex,
    }

    const protocol = await updateProtocol(id, updates)

    return NextResponse.json({
      success: true,
      protocol,
      message: `Protocol "${id}" updated successfully`,
    })
  } catch (error) {
    const { id } = await params
    console.error(`Error updating protocol ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/protocols/[id]
 * Delete a protocol (admin only)
 * Query param ?hard=true for hard delete (permanent)
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
      await hardDeleteProtocol(id)
      return NextResponse.json({
        success: true,
        message: `Protocol "${id}" permanently deleted`,
      })
    } else {
      await deleteProtocol(id)
      return NextResponse.json({
        success: true,
        message: `Protocol "${id}" deactivated`,
      })
    }
  } catch (error) {
    const { id } = await params
    console.error(`Error deleting protocol ${id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
