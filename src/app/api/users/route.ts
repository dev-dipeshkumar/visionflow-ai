import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Simple auth check - requires x-user-id header
function validateAuth(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id')
  return userId
}

// GET /api/users — List all users (admin only, requires auth)
export async function GET(request: NextRequest) {
  try {
    const userId = validateAuth(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the requesting user exists and is admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    })

    if (!requestingUser || !requestingUser.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive user' },
        { status: 401 }
      )
    }

    if (requestingUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isTester = searchParams.get('isTester')
    const role = searchParams.get('role')
    const tenantId = searchParams.get('tenantId')

    const where: Record<string, unknown> = {}

    if (isTester !== null) {
      where.isTester = isTester === 'true'
    }
    if (role) {
      where.role = role
    }
    if (tenantId) {
      where.tenantId = tenantId
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isTester: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        // Never expose passwordHash
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ users, total: users.length })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
