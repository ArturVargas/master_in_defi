import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

/**
 * Database functions for protocols management
 */

export interface Protocol {
  id: string
  name: string
  title: string | null
  description: string | null
  logoUrl: string | null
  category: string | null
  difficulty: string | null
  secretWord: string | null
  status: 'public' | 'draft'
  active: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all active protocols ordered by order_index
 */
export async function getAllProtocols(): Promise<Protocol[]> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        title,
        description,
        logo_url as "logoUrl",
        category,
        difficulty,
        secret_word as "secretWord",
        COALESCE(status, 'public') as status,
        active,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM protocols
      WHERE active = true AND COALESCE(status, 'public') = 'public'
      ORDER BY order_index ASC, name ASC
    `
    return result as Protocol[]
  } catch (error) {
    console.error('Error fetching protocols:', error)
    throw new Error('Failed to fetch protocols')
  }
}

/**
 * Get all protocols including inactive ones (for admin panel)
 */
export async function getAllProtocolsAdmin(): Promise<Protocol[]> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        title,
        description,
        logo_url as "logoUrl",
        category,
        difficulty,
        secret_word as "secretWord",
        COALESCE(status, 'public') as status,
        active,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM protocols
      ORDER BY order_index ASC, name ASC
    `
    return result as Protocol[]
  } catch (error) {
    console.error('Error fetching all protocols:', error)
    throw new Error('Failed to fetch all protocols')
  }
}

/**
 * Get a single protocol by ID
 */
export async function getProtocolById(id: string): Promise<Protocol | null> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        title,
        description,
        logo_url as "logoUrl",
        category,
        difficulty,
        secret_word as "secretWord",
        COALESCE(status, 'public') as status,
        active,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM protocols
      WHERE id = ${id}
      LIMIT 1
    `
    return result.length > 0 ? (result[0] as Protocol) : null
  } catch (error) {
    console.error(`Error fetching protocol ${id}:`, error)
    throw new Error(`Failed to fetch protocol ${id}`)
  }
}

/**
 * Create a new protocol
 */
export async function createProtocol(
  protocol: Omit<Protocol, 'createdAt' | 'updatedAt'>
): Promise<Protocol> {
  try {
    const result = await sql`
      INSERT INTO protocols (
        id, name, title, description, logo_url, category,
        difficulty, secret_word, status, active, order_index
      ) VALUES (
        ${protocol.id},
        ${protocol.name},
        ${protocol.title || null},
        ${protocol.description || null},
        ${protocol.logoUrl || null},
        ${protocol.category || null},
        ${protocol.difficulty || null},
        ${protocol.secretWord || null},
        ${protocol.status || 'public'},
        ${protocol.active},
        ${protocol.orderIndex}
      )
      RETURNING
        id,
        name,
        title,
        description,
        logo_url as "logoUrl",
        category,
        difficulty,
        secret_word as "secretWord",
        status,
        active,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    return result[0] as Protocol
  } catch (error) {
    console.error('Error creating protocol:', error)
    throw new Error('Failed to create protocol')
  }
}

/**
 * Update an existing protocol
 */
export async function updateProtocol(
  id: string,
  updates: Partial<Omit<Protocol, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Protocol> {
  try {
    const result = await sql`
      UPDATE protocols
      SET
        name = COALESCE(${updates.name || null}, name),
        title = COALESCE(${updates.title || null}, title),
        description = COALESCE(${updates.description || null}, description),
        logo_url = COALESCE(${updates.logoUrl || null}, logo_url),
        category = COALESCE(${updates.category || null}, category),
        difficulty = COALESCE(${updates.difficulty || null}, difficulty),
        secret_word = COALESCE(${updates.secretWord || null}, secret_word),
        status = COALESCE(${updates.status || null}, status),
        active = COALESCE(${updates.active !== undefined ? updates.active : null}, active),
        order_index = COALESCE(${updates.orderIndex !== undefined ? updates.orderIndex : null}, order_index),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id,
        name,
        title,
        description,
        logo_url as "logoUrl",
        category,
        difficulty,
        secret_word as "secretWord",
        status,
        active,
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    if (result.length === 0) {
      throw new Error(`Protocol with id ${id} not found`)
    }

    return result[0] as Protocol
  } catch (error) {
    console.error(`Error updating protocol ${id}:`, error)
    throw new Error(`Failed to update protocol ${id}`)
  }
}

/**
 * Delete a protocol (soft delete by setting active = false)
 */
export async function deleteProtocol(id: string): Promise<void> {
  try {
    await sql`
      UPDATE protocols
      SET active = false, updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error(`Error deleting protocol ${id}:`, error)
    throw new Error(`Failed to delete protocol ${id}`)
  }
}

/**
 * Hard delete a protocol (permanently removes from database)
 * USE WITH CAUTION - This will CASCADE delete all associated questions and answers
 */
export async function hardDeleteProtocol(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM protocols
      WHERE id = ${id}
    `
  } catch (error) {
    console.error(`Error hard deleting protocol ${id}:`, error)
    throw new Error(`Failed to hard delete protocol ${id}`)
  }
}
