import { NextRequest, NextResponse } from 'next/server'
import { getAllProtocols, getAllProtocolsAdmin, createProtocol } from '@/lib/db/protocols'
import { getQuestionsByProtocol } from '@/lib/db/questions'

/**
 * GET /api/protocols
 * Get all protocols (admin gets all including drafts, public gets only public).
 * Each protocol includes questionCount for the home page.
 */
export async function GET(request: NextRequest) {
  try {
    // Check if admin secret is provided
    const adminSecret = request.headers.get('x-admin-secret')
    const isAdmin = adminSecret === process.env.ADMIN_SECRET

    // Admin gets all protocols including drafts, public gets only public ones
    const protocols = isAdmin ? await getAllProtocolsAdmin() : await getAllProtocols()

    const protocolsWithCount = await Promise.all(
      protocols.map(async (p) => ({
        ...p,
        questionCount: (await getQuestionsByProtocol(p.id)).length,
      }))
    )

    return NextResponse.json({
      success: true,
      data: {
        protocols: protocolsWithCount,
        count: protocolsWithCount.length,
      },
    })
  } catch (error) {
    console.error('Error fetching protocols:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch protocols',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/protocols
 * Create a new protocol (admin only)
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
      id,
      name,
      title,
      description,
      docs,
      logoUrl,
      category,
      difficulty,
      secretWord,
      status = 'public',
      active = true,
      orderIndex = 0,
    } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'name'],
        },
        { status: 400 }
      )
    }

    // Create protocol
    const protocol = await createProtocol({
      id: id.toLowerCase(),
      name,
      title: title || null,
      description: description || null,
      docs: docs ?? null,
      logoUrl: logoUrl || null,
      category: category || null,
      difficulty: difficulty || null,
      secretWord: secretWord || null,
      status: status as 'public' | 'draft',
      active,
      orderIndex,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          protocol,
          message: `Protocol "${name}" created successfully`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating protocol:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
